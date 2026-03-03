import { Controller, Get, Param } from "@nestjs/common";

import { SpeciesService } from "../../application/species.service";
import { Species } from "../../domain/species.entity";

@Controller("species")
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  async list(): Promise<Species[]> {
    return this.speciesService.findAll();
  }

  @Get(":id")
  async get(@Param("id") id: string): Promise<Species> {
    return this.speciesService.findById(id);
  }
}
