import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { NearbyPlacesService } from "./application/nearby-places.service";
import { NearbyPlacesController } from "./interfaces/http/nearby-places.controller";

@Module({
  imports: [AuthModule],
  controllers: [NearbyPlacesController],
  providers: [NearbyPlacesService]
})
export class NearbyPlacesModule {}
