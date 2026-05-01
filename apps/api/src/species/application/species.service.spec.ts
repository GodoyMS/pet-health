import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SpeciesService } from "./species.service";
import { BreedOrmEntity } from "../infrastructure/typeorm/breed.orm-entity";
import { SpeciesOrmEntity } from "../infrastructure/typeorm/species.orm-entity";

describe("SpeciesService", () => {
  let service: SpeciesService;
  let repo: jest.Mocked<Repository<SpeciesOrmEntity>>;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn()
  };

  const mockBreedRepo = {
    find: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeciesService,
        {
          provide: getRepositoryToken(SpeciesOrmEntity),
          useValue: mockRepo
        },
        {
          provide: getRepositoryToken(BreedOrmEntity),
          useValue: mockBreedRepo
        }
      ]
    }).compile();

    service = module.get<SpeciesService>(SpeciesService);
    repo = module.get(getRepositoryToken(SpeciesOrmEntity));
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns species list ordered by name with breeds", async () => {
      const entities = [
        {
          id: "1",
          name: "Cat",
          imageUrl: null,
          breeds: [{ id: "b1", name: "Siamese" }]
        },
        {
          id: "2",
          name: "Dog",
          imageUrl: null,
          breeds: [
            { id: "b3", name: "Poodle" },
            { id: "b2", name: "Labrador Retriever" }
          ]
        }
      ] as SpeciesOrmEntity[];
      mockRepo.find.mockResolvedValue(entities);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        order: { name: "ASC" },
        relations: ["breeds"]
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "1",
        name: "Cat",
        imageUrl: null,
        breeds: [{ id: "b1", name: "Siamese" }]
      });
      expect(result[1].breeds).toEqual([
        { id: "b2", name: "Labrador Retriever" },
        { id: "b3", name: "Poodle" }
      ]);
    });
  });

  describe("findById", () => {
    it("returns species when found", async () => {
      const entity = {
        id: "1",
        name: "Dog",
        imageUrl: "https://example.com/dog.png",
        breeds: [{ id: "b1", name: "Poodle" }]
      } as SpeciesOrmEntity;
      mockRepo.findOne.mockResolvedValue(entity);

      const result = await service.findById("1");

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["breeds"]
      });
      expect(result).toMatchObject({
        id: "1",
        name: "Dog",
        imageUrl: "https://example.com/dog.png",
        breeds: [{ id: "b1", name: "Poodle" }]
      });
    });

    it("throws NotFoundException when not found", async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findById("missing")).rejects.toThrow(NotFoundException);
      await expect(service.findById("missing")).rejects.toThrow("Species not found");
    });
  });

  describe("findBreedsBySpeciesId", () => {
    it("returns breeds ordered by name when species exists", async () => {
      mockRepo.findOne.mockResolvedValue({ id: "s1", name: "Dog" } as SpeciesOrmEntity);
      mockBreedRepo.find.mockResolvedValue([
        { id: "b2", name: "Poodle" },
        { id: "b1", name: "Labrador Retriever" }
      ] as BreedOrmEntity[]);

      const result = await service.findBreedsBySpeciesId("s1");

      expect(mockBreedRepo.find).toHaveBeenCalledWith({
        where: { species: { id: "s1" } },
        order: { name: "ASC" }
      });
      expect(result).toEqual([
        { id: "b2", name: "Poodle" },
        { id: "b1", name: "Labrador Retriever" }
      ]);
    });

    it("throws when species id is unknown", async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findBreedsBySpeciesId("missing")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
