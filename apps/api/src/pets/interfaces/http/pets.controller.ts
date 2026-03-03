import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength
} from "class-validator";

import { PetsService } from "../../application/pets.service";
import { AuthGuard } from "../../../auth/interfaces/http/auth.guard";
import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User } from "../../../users/domain/user.entity";

class SpeciesSummaryDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ nullable: true })
  imageUrl!: string | null;
}

class PetWithSpeciesDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  ownerId!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ type: SpeciesSummaryDto })
  species!: SpeciesSummaryDto;
  @ApiProperty({ example: "2020-05-15" })
  birthDate!: string;
  @ApiProperty()
  breed!: string;
  @ApiProperty({ nullable: true })
  expectedLifeSpanYears!: number | null;
}

class CreatePetDto {
  @ApiProperty({ example: "Buddy" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", description: "UUID of the species" })
  @IsUUID("4")
  speciesId!: string;

  @ApiProperty({ example: "2020-05-15", description: "ISO 8601 date (YYYY-MM-DD)" })
  @IsISO8601({ strict: true }, { message: "birthDate must be a valid ISO 8601 date (YYYY-MM-DD)" })
  birthDate!: string;

  @ApiProperty({ example: "Golden Retriever" })
  @IsString()
  @MinLength(1)
  breed!: string;

  @ApiPropertyOptional({ example: 12, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedLifeSpanYears?: number | null;
}

@ApiTags("pets")
@Controller("pets")
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "List all pets for the current user" })
  @ApiResponse({ status: 200, description: "List of pets with species", type: [PetWithSpeciesDto] })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async list(@CurrentUser() user: User) {
    return this.petsService.listForUser(user.id);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get a pet by ID" })
  @ApiParam({ name: "id", description: "Pet UUID" })
  @ApiResponse({ status: 200, description: "Pet with species", type: PetWithSpeciesDto })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Pet not found" })
  async get(@CurrentUser() user: User, @Param("id") id: string) {
    return this.petsService.getForUser(user.id, id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Create a new pet" })
  @ApiBody({ type: CreatePetDto })
  @ApiResponse({ status: 201, description: "Pet created", type: PetWithSpeciesDto })
  @ApiResponse({ status: 400, description: "Validation error or species not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@CurrentUser() user: User, @Body() body: CreatePetDto) {
    return this.petsService.createForUser(user.id, {
      name: body.name,
      speciesId: body.speciesId,
      birthDate: body.birthDate,
      breed: body.breed,
      expectedLifeSpanYears: body.expectedLifeSpanYears ?? null
    });
  }
}
