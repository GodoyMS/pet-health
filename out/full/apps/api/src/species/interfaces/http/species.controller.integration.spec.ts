import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { SpeciesController } from "./species.controller";
import { SpeciesService } from "../../application/species.service";
import { Species } from "../../domain/species.entity";

describe("SpeciesController (integration)", () => {
  let app: INestApplication;
  let speciesService: jest.Mocked<SpeciesService>;

  beforeAll(async () => {
    const mockSpeciesService = {
      findAll: jest.fn(),
      findById: jest.fn()
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SpeciesController],
      providers: [
        {
          provide: SpeciesService,
          useValue: mockSpeciesService
        }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    speciesService = moduleFixture.get(SpeciesService) as jest.Mocked<SpeciesService>;
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe("GET /species", () => {
    it("returns 200 and list from service", async () => {
      const list = [
        new Species("id-1", "Dog", null),
        new Species("id-2", "Cat", null)
      ];
      speciesService.findAll.mockResolvedValue(list);

      const res = await request(app.getHttpServer()).get("/species").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ id: "id-1", name: "Dog", imageUrl: null });
    });
  });

  describe("GET /species/:id", () => {
    it("returns 200 and species when found", async () => {
      const species = new Species("id-1", "Dog", "https://example.com/dog.png");
      speciesService.findById.mockResolvedValue(species);

      const res = await request(app.getHttpServer()).get("/species/id-1").expect(200);

      expect(res.body).toMatchObject({
        id: "id-1",
        name: "Dog",
        imageUrl: "https://example.com/dog.png"
      });
    });

    it("returns 404 when service throws NotFoundException", async () => {
      const { NotFoundException } = await import("@nestjs/common");
      speciesService.findById.mockRejectedValue(new NotFoundException("Species not found"));

      await request(app.getHttpServer()).get("/species/missing").expect(404);
    });
  });
});
