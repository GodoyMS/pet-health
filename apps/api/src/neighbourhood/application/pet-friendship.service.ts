import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";

import { PetOrmEntity } from "../../pets/infrastructure/typeorm/pet.orm-entity";
import {
  applyAction,
  canReRequest,
  friendshipPairKey,
  validateRequestPair,
  type FriendshipAction,
  type FriendshipActor
} from "../domain/friendship-policy";
import { PetFriendshipOrmEntity } from "../infrastructure/typeorm/pet-friendship.orm-entity";
import type {
  FriendshipRequestView,
  NearbyPet,
  PetSummaryView
} from "./neighbourhood.read-model";

/** Aggregate counts shown as badges on the pet tab bar. */
export interface PetFriendshipCounts {
  friendCount: number;
  incomingRequestCount: number;
}

@Injectable()
export class PetFriendshipService {
  constructor(
    @InjectRepository(PetFriendshipOrmEntity)
    private readonly friendships: Repository<PetFriendshipOrmEntity>,
    @InjectRepository(PetOrmEntity)
    private readonly pets: Repository<PetOrmEntity>
  ) {}

  /**
   * Send a friend request from one of the user's pets to someone else's.
   *
   * A previously rejected or cancelled pair reuses its existing row (the
   * unique `pairKey` guarantees there is at most one), which lets pets try
   * again later without accumulating dead history.
   */
  async request(
    userId: string,
    requesterPetId: string,
    addresseePetId: string
  ): Promise<FriendshipRequestView> {
    const requester = await this.pets.findOne({
      where: { id: requesterPetId, owner: { id: userId } },
      relations: ["owner", "species"]
    });
    if (!requester) throw new NotFoundException("Pet not found");

    const addressee = await this.pets.findOne({
      where: { id: addresseePetId },
      relations: ["owner", "species"]
    });
    if (!addressee) throw new NotFoundException("Pet not found");

    const validation = validateRequestPair({
      requesterPetId,
      addresseePetId,
      sameOwner: requester.owner.id === addressee.owner.id
    });
    if (!validation.ok) throw new BadRequestException(validation.reason);

    const pairKey = friendshipPairKey(requesterPetId, addresseePetId);
    const existing = await this.friendships.findOne({ where: { pairKey } });

    if (existing) {
      if (existing.status === "accepted") {
        throw new ConflictException("These pets are already friends");
      }
      if (existing.status === "pending") {
        throw new ConflictException("A request is already pending for these pets");
      }
      if (!canReRequest(existing.status)) {
        throw new ConflictException("These pets cannot be connected right now");
      }

      // Revive the row in the new direction.
      existing.requesterPetId = requesterPetId;
      existing.addresseePetId = addresseePetId;
      existing.status = "pending";
      existing.respondedAt = null;
      const revived = await this.friendships.save(existing);
      return this.toView(revived, requester, addressee, "outgoing");
    }

    try {
      const created = await this.friendships.save(
        this.friendships.create({
          requesterPetId,
          addresseePetId,
          pairKey,
          status: "pending",
          respondedAt: null
        })
      );
      return this.toView(created, requester, addressee, "outgoing");
    } catch (err) {
      // Unique violation: the other owner sent a request at the same moment.
      if ((err as { code?: string }).code === "23505") {
        throw new ConflictException("A request already exists for these pets");
      }
      throw err;
    }
  }

  /**
   * Accept, reject, cancel, or end a friendship. The user's relationship to
   * the row (requester vs addressee side) decides which actions are legal.
   */
  async act(
    userId: string,
    friendshipId: string,
    action: FriendshipAction
  ): Promise<FriendshipRequestView> {
    const friendship = await this.friendships.findOne({
      where: { id: friendshipId }
    });
    if (!friendship) throw new NotFoundException("Friend request not found");

    const [requesterPet, addresseePet] = await Promise.all([
      this.requirePet(friendship.requesterPetId),
      this.requirePet(friendship.addresseePetId)
    ]);

    const actor = this.resolveActor(userId, requesterPet, addresseePet);
    if (!actor) throw new NotFoundException("Friend request not found");

    const result = applyAction({
      current: friendship.status,
      action,
      actor
    });
    if (!result.ok) throw new BadRequestException(result.reason);

    friendship.status = result.next;
    friendship.respondedAt = new Date();
    const saved = await this.friendships.save(friendship);

    return this.toView(
      saved,
      requesterPet,
      addresseePet,
      actor === "requester" ? "outgoing" : "incoming"
    );
  }

  /**
   * Every request touching any of the user's pets — this is what the sidebar
   * inbox renders, so a user with several pets sees one unified list.
   */
  async inbox(userId: string): Promise<{
    incoming: FriendshipRequestView[];
    outgoing: FriendshipRequestView[];
  }> {
    const myPetIds = await this.ownedPetIds(userId);
    if (myPetIds.length === 0) return { incoming: [], outgoing: [] };

    const rows = await this.friendships.find({
      where: [
        { addresseePetId: In(myPetIds), status: "pending" },
        { requesterPetId: In(myPetIds), status: "pending" }
      ],
      order: { createdAt: "DESC" }
    });
    if (rows.length === 0) return { incoming: [], outgoing: [] };

    const pets = await this.petsByIds(
      rows.flatMap((r) => [r.requesterPetId, r.addresseePetId])
    );

    const mine = new Set(myPetIds);
    const incoming: FriendshipRequestView[] = [];
    const outgoing: FriendshipRequestView[] = [];

    for (const row of rows) {
      const requesterPet = pets.get(row.requesterPetId);
      const addresseePet = pets.get(row.addresseePetId);
      if (!requesterPet || !addresseePet) continue;

      const isIncoming = mine.has(row.addresseePetId);
      const view = this.toView(
        row,
        requesterPet,
        addresseePet,
        isIncoming ? "incoming" : "outgoing"
      );
      (isIncoming ? incoming : outgoing).push(view);
    }

    return { incoming, outgoing };
  }

  /** Accepted friends of one pet, as map-compatible summaries. */
  async friendsOf(
    userId: string,
    petId: string
  ): Promise<Pick<NearbyPet, "id" | "name" | "species" | "ownerName">[]> {
    const owned = await this.pets.exists({
      where: { id: petId, owner: { id: userId } }
    });
    if (!owned) throw new NotFoundException("Pet not found");

    const rows = await this.friendships.find({
      where: [
        { requesterPetId: petId, status: "accepted" },
        { addresseePetId: petId, status: "accepted" }
      ]
    });
    if (rows.length === 0) return [];

    const friendIds = rows.map((row) =>
      row.requesterPetId === petId ? row.addresseePetId : row.requesterPetId
    );
    const pets = await this.petsByIds(friendIds);

    return friendIds
      .map((id) => pets.get(id))
      .filter((pet): pet is PetOrmEntity => Boolean(pet))
      .map((pet) => ({
        id: pet.id,
        name: pet.name,
        species: {
          id: pet.species.id,
          name: pet.species.name,
          imageUrl: pet.species.imageUrl
        },
        ownerName: pet.owner.name
      }));
  }

  /**
   * Friend and pending-request counts for a set of pets, in two grouped
   * queries rather than one per pet.
   */
  async countsFor(petIds: string[]): Promise<Map<string, PetFriendshipCounts>> {
    const counts = new Map<string, PetFriendshipCounts>(
      petIds.map((id) => [id, { friendCount: 0, incomingRequestCount: 0 }])
    );
    if (petIds.length === 0) return counts;

    const accepted = await this.friendships.find({
      where: [
        { requesterPetId: In(petIds), status: "accepted" },
        { addresseePetId: In(petIds), status: "accepted" }
      ],
      select: ["requesterPetId", "addresseePetId"]
    });
    for (const row of accepted) {
      const forRequester = counts.get(row.requesterPetId);
      if (forRequester) forRequester.friendCount += 1;
      const forAddressee = counts.get(row.addresseePetId);
      if (forAddressee) forAddressee.friendCount += 1;
    }

    const pending = await this.friendships.find({
      where: { addresseePetId: In(petIds), status: "pending" },
      select: ["addresseePetId"]
    });
    for (const row of pending) {
      const entry = counts.get(row.addresseePetId);
      if (entry) entry.incomingRequestCount += 1;
    }

    return counts;
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private resolveActor(
    userId: string,
    requesterPet: PetOrmEntity,
    addresseePet: PetOrmEntity
  ): FriendshipActor | null {
    if (requesterPet.owner.id === userId) return "requester";
    if (addresseePet.owner.id === userId) return "addressee";
    return null;
  }

  private async ownedPetIds(userId: string): Promise<string[]> {
    const rows = await this.pets
      .createQueryBuilder("pet")
      .select("pet.id", "id")
      .where('pet."ownerId" = :userId', { userId })
      .getRawMany<{ id: string }>();
    return rows.map((row) => row.id);
  }

  private async petsByIds(ids: string[]): Promise<Map<string, PetOrmEntity>> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return new Map();
    const pets = await this.pets.find({
      where: { id: In(unique) },
      relations: ["owner", "species"]
    });
    return new Map(pets.map((pet) => [pet.id, pet]));
  }

  private async requirePet(id: string): Promise<PetOrmEntity> {
    const pet = await this.pets.findOne({
      where: { id },
      relations: ["owner", "species"]
    });
    if (!pet) throw new NotFoundException("Pet not found");
    return pet;
  }

  private toView(
    row: PetFriendshipOrmEntity,
    requesterPet: PetOrmEntity,
    addresseePet: PetOrmEntity,
    direction: "incoming" | "outgoing"
  ): FriendshipRequestView {
    return {
      id: row.id,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      respondedAt: row.respondedAt ? row.respondedAt.toISOString() : null,
      requesterPet: toPetSummary(requesterPet),
      addresseePet: toPetSummary(addresseePet),
      direction
    };
  }
}

function toPetSummary(pet: PetOrmEntity): PetSummaryView {
  return {
    id: pet.id,
    name: pet.name,
    species: {
      id: pet.species.id,
      name: pet.species.name,
      imageUrl: pet.species.imageUrl
    },
    ownerName: pet.owner.name
  };
}
