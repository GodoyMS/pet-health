import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

import { AuthGuard } from "../../../auth/interfaces/http/auth.guard";
import {
  NEARBY_PLACE_TYPES,
  NearbyPlaceType,
  NearbyPlacesService
} from "../../application/nearby-places.service";

class NearbySearchQueryDto {
  @ApiProperty({ example: 28.6139, description: "User latitude" })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: 77.209, description: "User longitude" })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @ApiPropertyOptional({ minimum: 500, maximum: 50000, default: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(500)
  @Max(50000)
  radius?: number;

  @ApiPropertyOptional({
    enum: NEARBY_PLACE_TYPES,
    isArray: true,
    description: "Filter to these place types; omit for all"
  })
  @IsOptional()
  @Transform(({ value }) =>
    (Array.isArray(value) ? value : String(value).split(",")).filter(Boolean)
  )
  @IsIn(NEARBY_PLACE_TYPES, { each: true })
  types?: NearbyPlaceType[];
}

class ResolvePhotoQueryDto {
  @ApiProperty({ description: "Places photo resource name" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ minimum: 100, maximum: 1600, default: 640 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(1600)
  maxWidthPx?: number;
}

@ApiTags("nearby-places")
@Controller("nearby-places")
export class NearbyPlacesController {
  constructor(private readonly nearbyPlaces: NearbyPlacesService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Find nearby vets and pet stores around a location" })
  @ApiResponse({ status: 200, description: "Ranked list of nearby places" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 503, description: "Nearby search not configured/available" })
  async search(@Query() query: NearbySearchQueryDto) {
    const places = await this.nearbyPlaces.search({
      lat: query.lat,
      lng: query.lng,
      radius: query.radius,
      types: query.types
    });
    return { places };
  }

  @Get("photo")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Resolve a Places photo reference to an embeddable URL" })
  @ApiResponse({ status: 200, description: "Embeddable photo URL" })
  async photo(@Query() query: ResolvePhotoQueryDto) {
    const url = await this.nearbyPlaces.resolvePhoto(query.name, query.maxWidthPx);
    return { url };
  }
}
