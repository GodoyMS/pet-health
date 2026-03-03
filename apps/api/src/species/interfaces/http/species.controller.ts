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

class SpeciesResponseDto {
  @ApiProperty()
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ nullable: true })
  imageUrl!: string | null;
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

  @Get(":id")
  @ApiOperation({ summary: "Get a species by ID" })
  @ApiParam({ name: "id", description: "Species UUID" })
  @ApiResponse({ status: 200, description: "Species", type: SpeciesResponseDto })
  @ApiResponse({ status: 404, description: "Species not found" })
  async get(@Param("id") id: string): Promise<Species> {
    return this.speciesService.findById(id);
  }
}
