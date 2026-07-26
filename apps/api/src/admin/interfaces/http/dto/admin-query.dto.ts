import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min
} from "class-validator";

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class SearchPaginationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}

export class UsersListQueryDto extends SearchPaginationQueryDto {
  @IsOptional()
  @IsIn(["user", "admin"])
  role?: "user" | "admin";
}

export class PetsListQueryDto extends SearchPaginationQueryDto {
  @IsOptional()
  @IsUUID()
  speciesId?: string;
}

export class HealthLogsListQueryDto extends SearchPaginationQueryDto {
  @IsOptional()
  @IsUUID()
  petId?: string;
}

export class RulesListQueryDto extends SearchPaginationQueryDto {
  @IsOptional()
  @IsUUID()
  speciesId?: string;

  @IsOptional()
  @IsUUID()
  breedId?: string;
}

export function pageOf(query: PaginationQueryDto): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  return { page, limit, skip: (page - 1) * limit };
}
