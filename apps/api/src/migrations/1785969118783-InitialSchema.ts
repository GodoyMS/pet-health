import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785969118783 implements MigrationInterface {
    name = 'InitialSchema1785969118783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."preventive_care_rule_type_enum" AS ENUM('vaccination', 'deworming', 'checkup', 'parasite_control')`);
        await queryRunner.query(`CREATE TABLE "preventive_care_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200) NOT NULL, "type" "public"."preventive_care_rule_type_enum" NOT NULL, "applicableMinAgeDays" integer, "applicableMaxAgeDays" integer, "intervalDays" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "speciesId" uuid, "breedId" uuid NOT NULL, CONSTRAINT "PK_08f5cf5f38cf75d2c95ef075a0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "species" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying, "description" text, "imageUrl" character varying, "order" integer, CONSTRAINT "UQ_d9fa7a8427fc14d482fa0992f2b" UNIQUE ("slug"), CONSTRAINT "PK_ae6a87f2423ba6c25dc43c32770" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."lifestyle_rule_type_enum" AS ENUM('exercise', 'feeding_awareness', 'food_safety')`);
        await queryRunner.query(`CREATE TABLE "lifestyle_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200) NOT NULL, "description" text NOT NULL, "type" "public"."lifestyle_rule_type_enum" NOT NULL, "applicableMinAgeDays" integer, "applicableMaxAgeDays" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "speciesId" uuid, "breedId" uuid NOT NULL, CONSTRAINT "PK_ebc7af1f1ed63d3f2873a844637" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "breeds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "expectedLifespanYears" integer, "speciesId" uuid, CONSTRAINT "PK_e89f6e1fbb29d28623b4feb2b3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_84b09b1a3359ca02e9621bedf4" ON "breeds" ("speciesId", "name") `);
        await queryRunner.query(`CREATE TABLE "preventive_care_pet_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dueDate" date NOT NULL, "completedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "petId" uuid, "preventiveCareRuleId" uuid, CONSTRAINT "PK_29a62146486f636ab286d1edb5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a428b1ca7e29e08046838275e0" ON "preventive_care_pet_items" ("petId", "preventiveCareRuleId", "dueDate") `);
        await queryRunner.query(`CREATE TABLE "pet_ai_reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "awarenessScore" smallint NOT NULL, "headline" character varying(300) NOT NULL, "content" jsonb NOT NULL, "model" character varying, "generatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "petId" uuid, CONSTRAINT "PK_18706f6d5f4e7a7caa65a0d5ad9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5671403b552cb1b967a09b008a" ON "pet_ai_reports" ("petId", "generatedAt") `);
        await queryRunner.query(`CREATE TABLE "pets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "birthDate" date NOT NULL, "weightKg" double precision, "expectedLifeSpanYears" integer, "awarenessScore" smallint, "ownerId" uuid, "speciesId" uuid, "breedId" uuid, CONSTRAINT "PK_d01e9e7b4ada753c826720bee8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "passwordHash" character varying, "provider" character varying NOT NULL DEFAULT 'email', "googleId" character varying, "role" character varying NOT NULL DEFAULT 'user', "emailVerified" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auth_challenges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "purpose" character varying NOT NULL, "codeHash" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "consumedAt" TIMESTAMP WITH TIME ZONE, "lastSentAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6993bc9c45bbf5948e4118de560" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f5dafe0a52658cd661dab0c04f" ON "auth_challenges" ("email") `);
        await queryRunner.query(`CREATE TABLE "pet_health_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "logDate" date NOT NULL, "weightKg" double precision NOT NULL, "appetite" smallint NOT NULL, "energy" smallint NOT NULL, "mood" smallint NOT NULL, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "petId" uuid, CONSTRAINT "PK_2c17aae4133d2e6168457818c0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1a6d3b852c3f126f1568ea6aaa" ON "pet_health_logs" ("petId", "logDate") `);
        await queryRunner.query(`CREATE TABLE "google_calendar_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" text NOT NULL, "refreshToken" text, "tokenExpiry" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_e8ed920378cb92d89a7b5e89d6" UNIQUE ("userId"), CONSTRAINT "PK_8910df80a5554d849e07f5abe71" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "google_calendar_syncs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "petId" uuid NOT NULL, "googleEventId" text NOT NULL, "syncedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "preventiveCareItemId" uuid NOT NULL, CONSTRAINT "UQ_407df24c808f65fb1f8909c0eb9" UNIQUE ("userId", "preventiveCareItemId"), CONSTRAINT "PK_1f798e62927e7449e78602bb53d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actorUserId" uuid, "actorEmail" character varying NOT NULL, "action" character varying(100) NOT NULL, "targetType" character varying(50) NOT NULL, "targetId" character varying, "details" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_de7a8fc2fbb525484c71a86bb96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_51f63a5b02e9c59bf8641564c5" ON "admin_audit_logs" ("createdAt") `);
        await queryRunner.query(`CREATE TABLE "owner_locations" ("userId" uuid NOT NULL, "lat" double precision NOT NULL, "lng" double precision NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_259d0322655c29d2e95387720ad" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "pet_locations" ("petId" uuid NOT NULL, "lat" double precision NOT NULL, "lng" double precision NOT NULL, "source" character varying NOT NULL DEFAULT 'inherited', "isDiscoverable" boolean NOT NULL DEFAULT true, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_06bd95d6a03d4deaa3e8194da62" PRIMARY KEY ("petId"))`);
        await queryRunner.query(`CREATE INDEX "idx_pet_locations_lat_lng" ON "pet_locations" ("lat", "lng") `);
        await queryRunner.query(`CREATE TABLE "pet_friendships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requesterPetId" uuid NOT NULL, "addresseePetId" uuid NOT NULL, "pairKey" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "respondedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "uq_pet_friendships_pair" UNIQUE ("pairKey"), CONSTRAINT "PK_55f3a81bc7e52f66bd72441c0f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_pet_friendships_requester" ON "pet_friendships" ("requesterPetId", "status") `);
        await queryRunner.query(`CREATE INDEX "idx_pet_friendships_addressee" ON "pet_friendships" ("addresseePetId", "status") `);
        await queryRunner.query(`ALTER TABLE "preventive_care_rules" ADD CONSTRAINT "FK_4304840e15b9c1ca40e19ef545f" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "preventive_care_rules" ADD CONSTRAINT "FK_9946de8b16cebb2177abb09f988" FOREIGN KEY ("breedId") REFERENCES "breeds"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lifestyle_rules" ADD CONSTRAINT "FK_e52c13d7ddc38f342b9842531fa" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lifestyle_rules" ADD CONSTRAINT "FK_ca15ad5d02be16e6d13adf0fb23" FOREIGN KEY ("breedId") REFERENCES "breeds"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "breeds" ADD CONSTRAINT "FK_7f36b2bb995e45e8547e6b427cd" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "preventive_care_pet_items" ADD CONSTRAINT "FK_3ac24526eb00148e37fdc452e88" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "preventive_care_pet_items" ADD CONSTRAINT "FK_d8fa48bbbbbf58732de15406e56" FOREIGN KEY ("preventiveCareRuleId") REFERENCES "preventive_care_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_ai_reports" ADD CONSTRAINT "FK_4c74377fa673e61e7db0edc3a8c" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_275e1bb3fdeea68f8356d8e1ebb" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_4c1b843bcdb26e564381bfed82a" FOREIGN KEY ("speciesId") REFERENCES "species"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pets" ADD CONSTRAINT "FK_63efa9961a2be6b2e971367f0eb" FOREIGN KEY ("breedId") REFERENCES "breeds"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_health_logs" ADD CONSTRAINT "FK_a8c8ddfdacf611a87db3d3df132" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "google_calendar_tokens" ADD CONSTRAINT "FK_e8ed920378cb92d89a7b5e89d65" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "google_calendar_syncs" ADD CONSTRAINT "FK_52ccca9a3e197c797e5c7116482" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "google_calendar_syncs" ADD CONSTRAINT "FK_6f83213d27dca15f4f015deaed1" FOREIGN KEY ("preventiveCareItemId") REFERENCES "preventive_care_pet_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "owner_locations" ADD CONSTRAINT "FK_259d0322655c29d2e95387720ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_locations" ADD CONSTRAINT "FK_06bd95d6a03d4deaa3e8194da62" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_friendships" ADD CONSTRAINT "FK_6311af2ca91f8c985994cc931f0" FOREIGN KEY ("requesterPetId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pet_friendships" ADD CONSTRAINT "FK_9808bf940328747b7315b7b0ffc" FOREIGN KEY ("addresseePetId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pet_friendships" DROP CONSTRAINT "FK_9808bf940328747b7315b7b0ffc"`);
        await queryRunner.query(`ALTER TABLE "pet_friendships" DROP CONSTRAINT "FK_6311af2ca91f8c985994cc931f0"`);
        await queryRunner.query(`ALTER TABLE "pet_locations" DROP CONSTRAINT "FK_06bd95d6a03d4deaa3e8194da62"`);
        await queryRunner.query(`ALTER TABLE "owner_locations" DROP CONSTRAINT "FK_259d0322655c29d2e95387720ad"`);
        await queryRunner.query(`ALTER TABLE "google_calendar_syncs" DROP CONSTRAINT "FK_6f83213d27dca15f4f015deaed1"`);
        await queryRunner.query(`ALTER TABLE "google_calendar_syncs" DROP CONSTRAINT "FK_52ccca9a3e197c797e5c7116482"`);
        await queryRunner.query(`ALTER TABLE "google_calendar_tokens" DROP CONSTRAINT "FK_e8ed920378cb92d89a7b5e89d65"`);
        await queryRunner.query(`ALTER TABLE "pet_health_logs" DROP CONSTRAINT "FK_a8c8ddfdacf611a87db3d3df132"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_63efa9961a2be6b2e971367f0eb"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_4c1b843bcdb26e564381bfed82a"`);
        await queryRunner.query(`ALTER TABLE "pets" DROP CONSTRAINT "FK_275e1bb3fdeea68f8356d8e1ebb"`);
        await queryRunner.query(`ALTER TABLE "pet_ai_reports" DROP CONSTRAINT "FK_4c74377fa673e61e7db0edc3a8c"`);
        await queryRunner.query(`ALTER TABLE "preventive_care_pet_items" DROP CONSTRAINT "FK_d8fa48bbbbbf58732de15406e56"`);
        await queryRunner.query(`ALTER TABLE "preventive_care_pet_items" DROP CONSTRAINT "FK_3ac24526eb00148e37fdc452e88"`);
        await queryRunner.query(`ALTER TABLE "breeds" DROP CONSTRAINT "FK_7f36b2bb995e45e8547e6b427cd"`);
        await queryRunner.query(`ALTER TABLE "lifestyle_rules" DROP CONSTRAINT "FK_ca15ad5d02be16e6d13adf0fb23"`);
        await queryRunner.query(`ALTER TABLE "lifestyle_rules" DROP CONSTRAINT "FK_e52c13d7ddc38f342b9842531fa"`);
        await queryRunner.query(`ALTER TABLE "preventive_care_rules" DROP CONSTRAINT "FK_9946de8b16cebb2177abb09f988"`);
        await queryRunner.query(`ALTER TABLE "preventive_care_rules" DROP CONSTRAINT "FK_4304840e15b9c1ca40e19ef545f"`);
        await queryRunner.query(`DROP INDEX "public"."idx_pet_friendships_addressee"`);
        await queryRunner.query(`DROP INDEX "public"."idx_pet_friendships_requester"`);
        await queryRunner.query(`DROP TABLE "pet_friendships"`);
        await queryRunner.query(`DROP INDEX "public"."idx_pet_locations_lat_lng"`);
        await queryRunner.query(`DROP TABLE "pet_locations"`);
        await queryRunner.query(`DROP TABLE "owner_locations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_51f63a5b02e9c59bf8641564c5"`);
        await queryRunner.query(`DROP TABLE "admin_audit_logs"`);
        await queryRunner.query(`DROP TABLE "google_calendar_syncs"`);
        await queryRunner.query(`DROP TABLE "google_calendar_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a6d3b852c3f126f1568ea6aaa"`);
        await queryRunner.query(`DROP TABLE "pet_health_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f5dafe0a52658cd661dab0c04f"`);
        await queryRunner.query(`DROP TABLE "auth_challenges"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "pets"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5671403b552cb1b967a09b008a"`);
        await queryRunner.query(`DROP TABLE "pet_ai_reports"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a428b1ca7e29e08046838275e0"`);
        await queryRunner.query(`DROP TABLE "preventive_care_pet_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_84b09b1a3359ca02e9621bedf4"`);
        await queryRunner.query(`DROP TABLE "breeds"`);
        await queryRunner.query(`DROP TABLE "lifestyle_rules"`);
        await queryRunner.query(`DROP TYPE "public"."lifestyle_rule_type_enum"`);
        await queryRunner.query(`DROP TABLE "species"`);
        await queryRunner.query(`DROP TABLE "preventive_care_rules"`);
        await queryRunner.query(`DROP TYPE "public"."preventive_care_rule_type_enum"`);
    }

}
