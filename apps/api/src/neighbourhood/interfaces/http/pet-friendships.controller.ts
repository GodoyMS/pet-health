import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { IsIn, IsUUID } from "class-validator";

import { AuthGuard } from "../../../auth/interfaces/http/auth.guard";
import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User } from "../../../users/domain/user.entity";
import {
  FRIENDSHIP_ACTIONS,
  type FriendshipAction
} from "../../domain/friendship-policy";
import { PetFriendshipService } from "../../application/pet-friendship.service";

class CreateFriendshipDto {
  @ApiProperty({ format: "uuid", description: "One of my pets" })
  @IsUUID()
  requesterPetId!: string;

  @ApiProperty({ format: "uuid", description: "The pet being asked" })
  @IsUUID()
  addresseePetId!: string;
}

class FriendshipActionDto {
  @ApiProperty({ enum: FRIENDSHIP_ACTIONS })
  @IsIn(FRIENDSHIP_ACTIONS)
  action!: FriendshipAction;
}

@ApiTags("pet-friendships")
@Controller("pet-friendships")
@UseGuards(AuthGuard)
@ApiCookieAuth("auth_token")
export class PetFriendshipsController {
  constructor(private readonly friendships: PetFriendshipService) {}

  @Get("inbox")
  @ApiOperation({
    summary: "Pending requests across all my pets, split by direction"
  })
  @ApiResponse({ status: 200, description: "Incoming and outgoing requests" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async inbox(@CurrentUser() user: User) {
    return this.friendships.inbox(user.id);
  }

  @Get("friends")
  @ApiOperation({
    summary: "Accepted friendships across all my pets, each naming which pet"
  })
  @ApiResponse({ status: 200, description: "Friendships, newest first" })
  async friends(@CurrentUser() user: User) {
    const friends = await this.friendships.listFriendships(user.id);
    return { friends };
  }

  @Post()
  @ApiOperation({ summary: "Send a friend request between two pets" })
  @ApiResponse({ status: 201, description: "Request created" })
  @ApiResponse({ status: 400, description: "Invalid pair (self or same owner)" })
  @ApiResponse({ status: 409, description: "Already friends or already pending" })
  async request(@CurrentUser() user: User, @Body() body: CreateFriendshipDto) {
    const friendship = await this.friendships.request(
      user.id,
      body.requesterPetId,
      body.addresseePetId
    );
    return { friendship };
  }

  @Patch(":id")
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOperation({ summary: "Accept, reject, cancel, or end a friendship" })
  @ApiResponse({ status: 200, description: "New state of the friendship" })
  @ApiResponse({ status: 400, description: "Action not allowed from this state" })
  @ApiResponse({ status: 404, description: "Friend request not found" })
  async act(
    @CurrentUser() user: User,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: FriendshipActionDto
  ) {
    const friendship = await this.friendships.act(user.id, id, body.action);
    return { friendship };
  }
}
