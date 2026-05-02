import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min
} from "class-validator";

import { PreventiveCareRuleType } from "../../domain/preventive-care-rule-type.enum";

export class UpdatePreventiveCareRuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @IsOptional()
  @IsEnum(PreventiveCareRuleType)
  type?: PreventiveCareRuleType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365_000)
  applicableMinAgeDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365_000)
  applicableMaxAgeDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365_000)
  intervalDays?: number | null;
}
