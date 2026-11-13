import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class TeacherApplicationSettingsDTO {
  @ApiProperty()
  organizationId!: string;

  @ApiProperty()
  acceptingTeachers!: boolean;

  @ApiProperty()
  marketplaceListed!: boolean;
}

export class UpdateTeacherApplicationSettingsDTO {
  @ApiPropertyOptional({
    description: 'Whether the organization is currently accepting teacher applications.',
  })
  @IsOptional()
  @IsBoolean()
  acceptingTeachers?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the organization is listed on the public teacher marketplace.',
  })
  @IsOptional()
  @IsBoolean()
  marketplaceListed?: boolean;
}
