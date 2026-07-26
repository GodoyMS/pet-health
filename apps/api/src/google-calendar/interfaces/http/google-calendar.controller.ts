import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UseGuards
} from "@nestjs/common";
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { IsArray, IsOptional, IsString, IsUUID } from "class-validator";
import { Response } from "express";

import { GoogleCalendarService } from "../../application/google-calendar.service";
import { AuthGuard } from "../../../auth/interfaces/http/auth.guard";
import { CurrentUser } from "../../../auth/interfaces/http/current-user.decorator";
import { User } from "../../../users/domain/user.entity";
import { configEnvs } from "../../../config/configEnvs";

class SyncOptionsDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  petIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  year?: number;
}

class SyncPetDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  year?: number;
}

@ApiTags("google-calendar")
@Controller("google-calendar")
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get("auth-url")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get Google Calendar OAuth authorization URL" })
  @ApiResponse({ status: 200, description: "Auth URL to redirect user to" })
  getAuthUrl(@CurrentUser() user: User) {
    const url = this.googleCalendarService.getAuthUrl(user.id);
    return { url };
  }

  @Get("callback")
  @ApiOperation({ summary: "Google Calendar OAuth callback — redirects to frontend" })
  async callback(
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response
  ) {
    if (!code || !state) {
      return res.redirect(`${configEnvs.WEB_ORIGIN}/dashboard/settings?calendar=error`);
    }
    try {
      await this.googleCalendarService.handleCallback(code, state);
      return res.redirect(`${configEnvs.WEB_ORIGIN}/dashboard/settings?calendar=connected`);
    } catch {
      return res.redirect(`${configEnvs.WEB_ORIGIN}/dashboard/settings?calendar=error`);
    }
  }

  @Get("status")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @ApiOperation({ summary: "Get Google Calendar connection and sync status" })
  async getStatus(@CurrentUser() user: User) {
    return this.googleCalendarService.getSyncStatus(user.id);
  }

  @Post("sync")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @HttpCode(200)
  @ApiOperation({ summary: "Sync preventive care events to Google Calendar" })
  @ApiBody({ type: SyncOptionsDto })
  @ApiResponse({ status: 200, description: "Sync result with created/skipped/failed counts" })
  async sync(@CurrentUser() user: User, @Body() body: SyncOptionsDto) {
    return this.googleCalendarService.syncEvents(user.id, {
      petIds: body.petIds,
      types: body.types,
      year: body.year
    });
  }

  @Post("sync/pet/:petId")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @HttpCode(200)
  @ApiOperation({ summary: "Sync preventive care events for a single pet" })
  @ApiBody({ type: SyncPetDto })
  async syncPet(
    @CurrentUser() user: User,
    @Param("petId") petId: string,
    @Body() body: SyncPetDto
  ) {
    return this.googleCalendarService.syncEventsForPet(user.id, petId, {
      types: body.types,
      year: body.year
    });
  }

  @Delete("disconnect")
  @UseGuards(AuthGuard)
  @ApiCookieAuth("auth_token")
  @HttpCode(200)
  @ApiOperation({ summary: "Disconnect Google Calendar and delete all synced events" })
  async disconnect(@CurrentUser() user: User) {
    await this.googleCalendarService.disconnect(user.id);
    return { success: true };
  }
}
