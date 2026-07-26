import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { google } from "googleapis";

import { configEnvs } from "../../config/configEnvs";
import { GoogleCalendarTokenOrmEntity } from "../infrastructure/typeorm/google-calendar-token.orm-entity";
import { GoogleCalendarSyncOrmEntity } from "../infrastructure/typeorm/google-calendar-sync.orm-entity";
import { PetOrmEntity } from "../../pets/infrastructure/typeorm/pet.orm-entity";
import { PreventiveCarePetItemOrmEntity } from "../../pets/infrastructure/typeorm/preventive-care-pet-item.orm-entity";
import { PreventiveCareRuleType } from "../../preventive-care-rules/domain/preventive-care-rule-type.enum";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

const TYPE_LABELS: Record<string, string> = {
  [PreventiveCareRuleType.Vaccination]:     "Vaccination",
  [PreventiveCareRuleType.Deworming]:       "Deworming",
  [PreventiveCareRuleType.Checkup]:         "Health Checkup",
  [PreventiveCareRuleType.ParasiteControl]: "Parasite Control"
};

const EVENT_COLOR_IDS: Record<string, string> = {
  [PreventiveCareRuleType.Vaccination]:     "10", // sage/green
  [PreventiveCareRuleType.Deworming]:       "6",  // tangerine
  [PreventiveCareRuleType.Checkup]:         "1",  // lavender
  [PreventiveCareRuleType.ParasiteControl]: "5"   // banana
};

export interface CalendarSyncStatusPet {
  id: string;
  name: string;
  synced: boolean;
  syncedCount: number;
  pendingCount: number;
}

export interface CalendarSyncStatus {
  connected: boolean;
  syncedPetIds: string[];
  pets: CalendarSyncStatusPet[];
}

export interface SyncOptions {
  petIds?: string[];
  types?: string[];
  year?: number;
}

export interface SyncResult {
  created: number;
  skipped: number;
  failed: number;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(
    @InjectRepository(GoogleCalendarTokenOrmEntity)
    private readonly tokenRepo: Repository<GoogleCalendarTokenOrmEntity>,
    @InjectRepository(GoogleCalendarSyncOrmEntity)
    private readonly syncRepo: Repository<GoogleCalendarSyncOrmEntity>,
    @InjectRepository(PetOrmEntity)
    private readonly petRepo: Repository<PetOrmEntity>,
    @InjectRepository(PreventiveCarePetItemOrmEntity)
    private readonly itemRepo: Repository<PreventiveCarePetItemOrmEntity>
  ) {}

  // ── OAuth ────────────────────────────────────────────────────────────────────

  private createOAuth2Client() {
    return new google.auth.OAuth2(
      configEnvs.GOOGLE_CLIENT_ID,
      configEnvs.GOOGLE_CLIENT_SECRET,
      configEnvs.GOOGLE_CALENDAR_CALLBACK_URL
    );
  }

  getAuthUrl(userId: string): string {
    const client = this.createOAuth2Client();
    return client.generateAuthUrl({
      access_type: "offline",
      scope: [CALENDAR_SCOPE],
      state: userId,
      prompt: "consent"
    });
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const client = this.createOAuth2Client();
    const { tokens } = await client.getToken(code);

    const existing = await this.tokenRepo.findOne({
      where: { user: { id: userId } } as any
    });

    if (existing) {
      existing.accessToken  = tokens.access_token!;
      if (tokens.refresh_token) existing.refreshToken = tokens.refresh_token;
      existing.tokenExpiry  = tokens.expiry_date ? new Date(tokens.expiry_date) : null;
      await this.tokenRepo.save(existing);
    } else {
      const row = this.tokenRepo.create({
        user:         { id: userId } as any,
        accessToken:  tokens.access_token!,
        refreshToken: tokens.refresh_token ?? null,
        tokenExpiry:  tokens.expiry_date ? new Date(tokens.expiry_date) : null
      });
      await this.tokenRepo.save(row);
    }
  }

  // ── Status ───────────────────────────────────────────────────────────────────

  async isConnected(userId: string): Promise<boolean> {
    const token = await this.tokenRepo.findOne({
      where: { user: { id: userId } } as any
    });
    return !!token?.accessToken;
  }

  async getSyncStatus(userId: string): Promise<CalendarSyncStatus> {
    const connected = await this.isConnected(userId);

    const pets = await this.petRepo.find({
      where: { owner: { id: userId } } as any
    });

    if (!connected) {
      return {
        connected: false,
        syncedPetIds: [],
        pets: pets.map((p) => ({
          id: p.id, name: p.name, synced: false, syncedCount: 0, pendingCount: 0
        }))
      };
    }

    const year      = new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    const yearEnd   = `${year}-12-31`;

    // All sync records for this user, with the related item loaded so we read the
    // FK via the entity relation (robust against raw-alias casing quirks).
    const syncRecords = await this.syncRepo.find({
      where: { user: { id: userId } } as any,
      relations: ["preventiveCareItem"]
    });
    const syncedItemIds = new Set(
      syncRecords.map((s) => s.preventiveCareItem?.id).filter(Boolean) as string[]
    );

    this.logger.log(
      `[getSyncStatus] user=${userId} syncRecords=${syncRecords.length} uniqueSyncedItems=${syncedItemIds.size}`
    );

    const petStatuses: CalendarSyncStatusPet[] = [];
    const syncedPetIds: string[] = [];

    for (const pet of pets) {
      const pendingItems = await this.itemRepo
        .createQueryBuilder("item")
        .where('item."petId" = :petId', { petId: pet.id })
        .andWhere("item.completedAt IS NULL")
        .andWhere("item.dueDate >= :start", { start: yearStart })
        .andWhere("item.dueDate <= :end",   { end: yearEnd })
        .getMany();

      const pendingCount = pendingItems.length;
      // Count how many *currently-pending* items actually have a sync record —
      // a direct intersection, so stale records for completed/out-of-window items
      // can never skew the result.
      const syncedCount = pendingItems.filter((i) => syncedItemIds.has(i.id)).length;
      // A pet is "synced" when nothing pending is left unsynced. A pet with no
      // pending items has nothing to sync, so it counts as synced too.
      const synced = pendingCount === 0 || syncedCount >= pendingCount;

      this.logger.log(
        `[getSyncStatus] pet=${pet.name} pending=${pendingCount} synced=${syncedCount} -> ${synced}`
      );

      petStatuses.push({ id: pet.id, name: pet.name, synced, syncedCount, pendingCount });
      if (synced) syncedPetIds.push(pet.id);
    }

    return { connected, syncedPetIds, pets: petStatuses };
  }

  // ── Sync ─────────────────────────────────────────────────────────────────────

  async syncEvents(userId: string, options: SyncOptions = {}): Promise<SyncResult> {
    const token = await this.tokenRepo.findOne({
      where: { user: { id: userId } } as any
    });
    if (!token) throw new UnauthorizedException("Google Calendar not connected");

    const client = this.createOAuth2Client();
    client.setCredentials({
      access_token:  token.accessToken,
      refresh_token: token.refreshToken ?? undefined,
      expiry_date:   token.tokenExpiry?.getTime()
    });

    // Persist refreshed tokens automatically
    client.on("tokens", async (refreshed) => {
      if (refreshed.access_token) {
        token.accessToken = refreshed.access_token;
        if (refreshed.refresh_token) token.refreshToken = refreshed.refresh_token;
        if (refreshed.expiry_date)   token.tokenExpiry  = new Date(refreshed.expiry_date);
        await this.tokenRepo.save(token);
      }
    });

    const calendar = google.calendar({ version: "v3", auth: client });

    const year      = options.year ?? new Date().getFullYear();
    const yearStart = `${year}-01-01`;
    const yearEnd   = `${year}-12-31`;

    // Fetch pets
    const petWhere: any = { owner: { id: userId } };
    if (options.petIds?.length) petWhere.id = In(options.petIds);
    const pets = await this.petRepo.find({ where: petWhere, relations: ["species", "breed"] });

    const petIds = pets.map((p) => p.id);
    if (petIds.length === 0) return { created: 0, skipped: 0, failed: 0 };

    // 1. Fetch all candidate (pending) items across the selected pets in one query,
    //    loading the pet + rule relations so we can read their ids via the entity.
    const itemsQb = this.itemRepo
      .createQueryBuilder("item")
      .leftJoinAndSelect("item.preventiveCareRule", "rule")
      .leftJoinAndSelect("item.pet", "pet")
      .where('item."petId" IN (:...petIds)', { petIds })
      .andWhere("item.completedAt IS NULL")
      .andWhere("item.dueDate >= :start", { start: yearStart })
      .andWhere("item.dueDate <= :end",   { end: yearEnd });

    if (options.types?.length) {
      itemsQb.andWhere("rule.type IN (:...types)", { types: options.types });
    }
    const items = await itemsQb.getMany();
    const petIdByItem = new Map(items.map((i) => [i.id, i.pet?.id]));
    const petById     = new Map(pets.map((p) => [p.id, p]));

    // 2. Fetch all already-synced records for this user, reading the related item id
    //    via the entity relation (robust against raw-alias casing quirks).
    const syncRecords = await this.syncRepo.find({
      where: { user: { id: userId } } as any,
      relations: ["preventiveCareItem"]
    });
    const syncedItemIds = new Set(
      syncRecords.map((s) => s.preventiveCareItem?.id).filter(Boolean) as string[]
    );

    const toCreate = items.filter((i) => !syncedItemIds.has(i.id));
    const skipped  = items.length - toCreate.length;

    // 3. Create Google events with bounded concurrency, then persist each record
    //    immediately so the DB never drifts from Google Calendar.
    let created = 0, failed = 0;

    const createOne = async (item: PreventiveCarePetItemOrmEntity) => {
      const petId = petIdByItem.get(item.id);
      const pet   = petId ? petById.get(petId) : undefined;
      if (!pet) { failed++; return; }

      const rule      = item.preventiveCareRule;
      const typeLabel = TYPE_LABELS[rule.type] ?? rule.type;
      const webUrl    = `${configEnvs.WEB_ORIGIN}/dashboard/pets/${pet.id}/preventive-care`;

      let googleEventId: string;
      try {
        const resp = await this.insertEventWithRetry(calendar, {
          summary: `🐾 ${pet.name}: ${typeLabel}`,
          description: [
            `Pet: ${pet.name}${pet.species ? ` (${pet.species.name}${pet.breed ? ` · ${pet.breed.name}` : ""})` : ""}`,
            `Care type: ${typeLabel}`,
            `Treatment: ${rule.title}`,
            "",
            "⚠️ Educational reminder only. Always consult your veterinarian before any treatment.",
            "",
            `📱 View in PetHealth: ${webUrl}`
          ].join("\n"),
          start:        { date: item.dueDate },
          end:          { date: item.dueDate },
          transparency: "transparent",
          status:       "tentative",
          colorId:      EVENT_COLOR_IDS[rule.type] ?? "7",
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 7 * 24 * 60 },
              { method: "email", minutes: 24 * 60 },
              { method: "popup", minutes: 0 }
            ]
          }
        });
        googleEventId = resp.data.id!;
      } catch (googleErr) {
        this.logger.error(`Google API error for item ${item.id}`, googleErr);
        failed++;
        return;
      }

      // Persist the sync record. We pre-filter against existing records above, so
      // a unique-constraint violation here only happens on a rare concurrent race
      // — treat that as already-synced rather than an error.
      try {
        const row = this.syncRepo.create({
          user:               { id: userId }  as any,
          preventiveCareItem: { id: item.id } as any,
          petId:              pet.id,
          googleEventId
        });
        await this.syncRepo.save(row);
        created++;
      } catch (dbErr: any) {
        if (dbErr?.code === "23505") {
          // Unique violation — another request already recorded this item.
          created++;
        } else {
          // The event exists in Google Calendar but we could NOT record it. This is
          // the real inconsistency to surface — count it as failed, not created, so
          // the response reflects what's actually persisted.
          this.logger.error(`DB save failed for item ${item.id} (event ${googleEventId})`, dbErr);
          failed++;
        }
      }
    };

    await this.runWithConcurrency(toCreate, 3, createOne);

    this.logger.log(
      `[syncEvents] user=${userId} candidates=${items.length} toCreate=${toCreate.length} ` +
      `created=${created} skipped=${skipped} failed=${failed}`
    );

    return { created, skipped, failed };
  }

  /**
   * Insert a Google Calendar event, retrying on transient/rate-limit errors with
   * exponential backoff + jitter. Google returns 403 (rateLimitExceeded /
   * userRateLimitExceeded), 429, and 5xx for these — all safe to retry since no
   * event is created when they fire.
   */
  private async insertEventWithRetry(
    calendar: ReturnType<typeof google.calendar>,
    requestBody: any,
    maxAttempts = 5
  ) {
    let attempt = 0;
    for (;;) {
      try {
        return await calendar.events.insert({ calendarId: "primary", requestBody });
      } catch (err: any) {
        attempt++;
        const status = err?.code ?? err?.response?.status;
        const retryable = status === 403 || status === 429 || (status >= 500 && status < 600);
        if (!retryable || attempt >= maxAttempts) throw err;

        const backoff = Math.min(2 ** attempt * 250, 8000) + Math.floor(Math.random() * 250);
        this.logger.warn(
          `Google rate/transient error (status=${status}), retry ${attempt}/${maxAttempts - 1} in ${backoff}ms`
        );
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  /** Run `worker` over `items` with at most `limit` promises in flight. */
  private async runWithConcurrency<T>(
    items: T[],
    limit: number,
    worker: (item: T) => Promise<void>
  ): Promise<void> {
    let index = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const current = items[index++];
        await worker(current);
      }
    });
    await Promise.all(runners);
  }

  async syncEventsForPet(
    userId: string,
    petId: string,
    options: Omit<SyncOptions, "petIds"> = {}
  ): Promise<SyncResult> {
    return this.syncEvents(userId, { ...options, petIds: [petId] });
  }

  // ── Disconnect ───────────────────────────────────────────────────────────────

  async disconnect(userId: string): Promise<void> {
    const token = await this.tokenRepo.findOne({
      where: { user: { id: userId } } as any
    });
    if (!token) return;

    const client = this.createOAuth2Client();
    client.setCredentials({
      access_token:  token.accessToken,
      refresh_token: token.refreshToken ?? undefined
    });
    const calendar = google.calendar({ version: "v3", auth: client });

    const syncs = await this.syncRepo
      .createQueryBuilder("s")
      .where('s."userId" = :userId', { userId })
      .getMany();

    // Delete the Google Calendar events FIRST (with retry on rate limits), so we
    // never orphan events by clearing local state before cleanup succeeds. Only the
    // sync records whose events were actually removed (or already gone) are deleted
    // from the DB; any that still fail are kept so a later disconnect can retry.
    let removed = 0, failed = 0;
    const removedIds: string[] = [];

    await this.runWithConcurrency(syncs, 3, async (sync) => {
      const ok = await this.deleteEventWithRetry(calendar, sync.googleEventId);
      if (ok) { removed++; removedIds.push(sync.id); }
      else    { failed++; }
    });

    if (removedIds.length > 0) {
      await this.syncRepo.delete(removedIds);
    }

    // Always drop the token so the account is disconnected from the app's side.
    await this.tokenRepo.delete(token.id);

    this.logger.log(
      `[disconnect] user=${userId} events=${syncs.length} removed=${removed} failed=${failed}`
    );
  }

  /**
   * Delete a Google Calendar event, retrying on transient/rate-limit errors.
   * Returns true if the event was deleted or was already gone (404/410), false if
   * it could not be removed after all attempts.
   */
  private async deleteEventWithRetry(
    calendar: ReturnType<typeof google.calendar>,
    eventId: string,
    maxAttempts = 5
  ): Promise<boolean> {
    let attempt = 0;
    for (;;) {
      try {
        await calendar.events.delete({ calendarId: "primary", eventId });
        return true;
      } catch (err: any) {
        const status = err?.code ?? err?.response?.status;
        // Already deleted / not found — treat as success.
        if (status === 404 || status === 410) return true;

        attempt++;
        const retryable = status === 403 || status === 429 || (status >= 500 && status < 600);
        if (!retryable || attempt >= maxAttempts) {
          this.logger.error(`Failed to delete Google event ${eventId} (status=${status})`);
          return false;
        }

        const backoff = Math.min(2 ** attempt * 250, 8000) + Math.floor(Math.random() * 250);
        this.logger.warn(
          `Google delete rate/transient error (status=${status}), retry ${attempt}/${maxAttempts - 1} in ${backoff}ms`
        );
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
}
