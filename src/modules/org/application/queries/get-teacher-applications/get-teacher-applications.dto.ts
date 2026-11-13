import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationUserSummaryDTO {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  firstName!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  lastName!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  fullName!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  image!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  avatarUrl!: string | null;
}

export class ApplicationSubjectDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class TeacherApplicationDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orgId!: string;

  @ApiProperty()
  applicantUserId!: string;

  @ApiPropertyOptional({ type: () => ApplicationUserSummaryDTO, nullable: true })
  applicant!: ApplicationUserSummaryDTO | null;

  @ApiProperty({ type: [String] })
  appliedSubjects!: string[];

  @ApiProperty({ type: () => [ApplicationSubjectDTO] })
  appliedSubjectDetails!: ApplicationSubjectDTO[];

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  rejectionReason!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  reviewedBy!: string | null;

  @ApiPropertyOptional({ type: () => ApplicationUserSummaryDTO, nullable: true })
  reviewer!: ApplicationUserSummaryDTO | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  reviewedAt!: Date | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  coverLetter!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  qualifications!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  assignedRole!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  assignedRoleId!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  assignedRoleName!: string | null;

  @ApiPropertyOptional({ type: [String], nullable: true })
  approvedSubjects!: string[] | null;

  @ApiPropertyOptional({ type: () => [ApplicationSubjectDTO], nullable: true })
  approvedSubjectDetails!: ApplicationSubjectDTO[] | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
