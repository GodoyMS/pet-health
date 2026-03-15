import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SpeciesService } from "./species.service";
import { SpeciesOrmEntity } from "../infrastructure/typeorm/species.orm-entity";

describe("SpeciesService", () => {
  let service: SpeciesService;
  let repo: jest.Mocked<Repository<SpeciesOrmEntity>>;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeciesService,
        {
          provide: getRepositoryToken(SpeciesOrmEntity),
          useValue: mockRepo
        }
      ]
    }).compile();

    service = module.get<SpeciesService>(SpeciesService);
    repo = module.get(getRepositoryToken(SpeciesOrmEntity));
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("returns species list ordered by name", async () => {
      const entities = [
        { id: "1", name: "Cat", imageUrl: null },
        { id: "2", name: "Dog", imageUrl: null }
      ] as SpeciesOrmEntity[];
      mockRepo.find.mockResolvedValue(entities);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({ order: { name: "ASC" } });
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: "1", name: "Cat", imageUrl: null });
    });
  });

  describe("findById", () => {
    it("returns species when found", async () => {
      const entity = {
        id: "1",
        name: "Dog",
        imageUrl: "https://example.com/dog.png"
      } as SpeciesOrmEntity;
      mockRepo.findOne.mockResolvedValue(entity);

      const result = await service.findById("1");

      expect(result).toMatchObject({
        id: "1",
        name: "Dog",
        imageUrl: "https://example.com/dog.png"
      });
    });

    it("throws NotFoundException when not found", async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findById("missing")).rejects.toThrow(NotFoundException);
      await expect(service.findById("missing")).rejects.toThrow("Species not found");
    });
  });
});
