import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";

import { SpeciesService } from "../../application/species.service";
import { Species } from "../../domain/species.entity";

class BreedResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({
    nullable: true,
    description: "Typical lifespan in years (breed reference); null for generic/unknown"
  })
  expectedLifespanYears!: number | null;
}

class SpeciesResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ nullable: true })
  imageUrl!: string | null;
  @ApiProperty({ type: [BreedResponseDto], description: "Breeds for this species" })
  breeds!: BreedResponseDto[];
}

@ApiTags("species")
@Controller("species")
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  @ApiOperation({ summary: "List all species" })
  @ApiResponse({ status: 200, description: "List of species", type: [SpeciesResponseDto] })
  async list(): Promise<Species[]> {
    return this.speciesService.findAll();
  }

  @Get(":id/breeds")
  @ApiOperation({ summary: "List breeds for a species" })
  @ApiParam({ name: "id", description: "Species UUID" })
  @ApiResponse({ status: 200, description: "Breeds for this species", type: [BreedResponseDto] })
  @ApiResponse({ status: 404, description: "Species not found" })
  async listBreeds(@Param("id") id: string) {
    return this.speciesService.findBreedsBySpeciesId(id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a species by ID" })
  @ApiParam({ name: "id", description: "Species UUID" })
  @ApiResponse({ status: 200, description: "Species", type: SpeciesResponseDto })
  @ApiResponse({ status: 404, description: "Species not found" })
  async get(@Param("id") id: string): Promise<Species> {
    return this.speciesService.findById(id);
  }
}
