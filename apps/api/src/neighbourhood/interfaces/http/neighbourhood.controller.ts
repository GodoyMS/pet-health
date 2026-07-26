import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";

import { AuthGuard } from "../../../auth/interfaces/http/auth.guard";
import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User } from "../../../users/domain/user.entity";
import { NeighbourhoodService } from "../../application/neighbourhood.service";
import {
  NEARBY_RADIUS_DEFAULT,
  NEARBY_RADIUS_MAX,
  NEARBY_RADIUS_MIN,
  NearbyPetsService
} from "../../application/nearby-pets.service";
import { PetLocationService } from "../../application/pet-location.service";

class CoordinatesDto {
  @ApiProperty({ example: 28.6139, minimum: -90, maximum: 90 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: 77.209, minimum: -180, maximum: 180 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

class DiscoverabilityDto {
  @ApiProperty({ description: "False hides this pet from other owners' maps" })
  @IsBoolean()
  isDiscoverable!: boolean;
}

class NearbyQueryDto {
  @ApiPropertyOptional({
    minimum: NEARBY_RADIUS_MIN,
    maximum: NEARBY_RADIUS_MAX,
    default: NEARBY_RADIUS_DEFAULT
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(NEARBY_RADIUS_MIN)
  @Max(NEARBY_RADIUS_MAX)
  radius?: number;
}

@ApiTags("neighbourhood")
@Controller("neighbourhood")
@UseGuards(AuthGuard)
@ApiCookieAuth("auth_token")
export class NeighbourhoodController {
  constructor(
    private readonly neighbourhood: NeighbourhoodService,
    private readonly locations: PetLocationService,
    private readonly nearbyPets: NearbyPetsService
  ) {}

  @Get("pets")
  @ApiOperation({
    summary: "My pets with their map locations and friendship badge counts"
  })
  @ApiResponse({ status: 200, description: "Pets ready for the tab bar" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async myPets(@CurrentUser() user: User) {
    const pets = await this.neighbourhood.listMyPets(user.id);
    return { pets };
  }

  @Get("owner-location")
  @ApiOperation({ summary: "My own anchor location, if set" })
  async ownerLocation(@CurrentUser() user: User) {
    const location = await this.locations.getOwnerLocation(user.id);
    return {
      location: location
        ? {
            lat: location.lat,
            lng: location.lng,
            updatedAt: location.updatedAt.toISOString()
          }
        : null
    };
  }

  @Put("owner-location")
  @ApiOperation({
    summary: "Set my location; every pet still following me moves with it"
  })
  @ApiResponse({ status: 200, description: "Location saved and cascaded" })
  async setOwnerLocation(@CurrentUser() user: User, @Body() body: CoordinatesDto) {
    await this.locations.upsertOwnerLocation(user.id, {
      lat: body.lat,
      lng: body.lng
    });
    const pets = await this.neighbourhood.listMyPets(user.id);
    return { pets };
  }

  @Put("pets/:petId/location")
  @ApiParam({ name: "petId", format: "uuid" })
  @ApiOperation({ summary: "Pin one pet to an explicit spot (stops following me)" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async setPetLocation(
    @CurrentUser() user: User,
    @Param("petId", ParseUUIDPipe) petId: string,
    @Body() body: CoordinatesDto
  ) {
    const location = await this.locations.setPetLocation(user.id, petId, {
      lat: body.lat,
      lng: body.lng
    });
    return { location: toLocationView(location) };
  }

  @Post("pets/:petId/location/follow-owner")
  @ApiParam({ name: "petId", format: "uuid" })
  @ApiOperation({ summary: "Re-attach a pet to my live location" })
  async followOwner(
    @CurrentUser() user: User,
    @Param("petId", ParseUUIDPipe) petId: string
  ) {
    const location = await this.locations.followOwner(user.id, petId);
    return { location: toLocationView(location) };
  }

  @Patch("pets/:petId/discoverability")
  @ApiParam({ name: "petId", format: "uuid" })
  @ApiOperation({ summary: "Show or hide this pet on other owners' maps" })
  async setDiscoverability(
    @CurrentUser() user: User,
    @Param("petId", ParseUUIDPipe) petId: string,
    @Body() body: DiscoverabilityDto
  ) {
    const location = await this.locations.setDiscoverability(
      user.id,
      petId,
      body.isDiscoverable
    );
    return { location: toLocationView(location) };
  }

  @Get("pets/:petId/nearby")
  @ApiParam({ name: "petId", format: "uuid" })
  @ApiOperation({
    summary: "Discoverable pets of other owners around this pet"
  })
  @ApiResponse({ status: 200, description: "Nearby pets sorted by distance" })
  async nearby(
    @CurrentUser() user: User,
    @Param("petId", ParseUUIDPipe) petId: string,
    @Query() query: NearbyQueryDto
  ) {
    const pets = await this.nearbyPets.findNearby(user.id, petId, query.radius as number);
    return { pets };
  }
}

function toLocationView(location: {
  lat: number;
  lng: number;
  source: string;
  isDiscoverable: boolean;
  updatedAt: Date;
}) {
  return {
    lat: location.lat,
    lng: location.lng,
    source: location.source,
    isDiscoverable: location.isDiscoverable,
    updatedAt: location.updatedAt.toISOString()
  };
}
