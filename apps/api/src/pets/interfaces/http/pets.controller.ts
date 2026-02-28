import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
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

class CreatePetDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsUUID("4")
  speciesId!: string;

  @IsISO8601({ strict: true }, { message: "birthDate must be a valid ISO 8601 date (YYYY-MM-DD)" })
  birthDate!: string;

  @IsString()
  @MinLength(1)
  breed!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  expectedLifeSpanYears?: number | null;
}

@Controller("pets")
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async list(@CurrentUser() user: User) {
    return this.petsService.listForUser(user.id);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async get(@CurrentUser() user: User, @Param("id") id: string) {
    return this.petsService.getForUser(user.id, id);
  }

  @Post()
  @UseGuards(AuthGuard)
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
