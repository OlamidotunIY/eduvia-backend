import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrgReportItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  lessonId!: string;

  @ApiProperty()
  classroomId!: string;

  @ApiProperty()
  classroomName!: string;

  @ApiProperty()
  subjectId!: string;

  @ApiProperty()
  subjectName!: string;

  @ApiProperty()
  teacherId!: string;

  @ApiProperty()
  teacherName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  teacherAvatar!: string | null;

  @ApiProperty()
  studentId!: string;

  @ApiProperty()
  studentName!: string;

  @ApiProperty()
  studentEmail!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  studentAvatar!: string | null;

  @ApiProperty({
    enum: ['draft', 'ai_draft', 'teacher_reviewing', 'submitted', 'archived'],
  })
  status!: string;

  @ApiProperty({
    enum: ['attended', 'absent', 'late', 'no_show'],
  })
  attendanceStatus!: string;

  @ApiPropertyOptional({ type: Number, nullable: true })
  overallRating!: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  scorePercent!: number | null;

  @ApiProperty()
  parentCanView!: boolean;

  @ApiProperty()
  hasAiSummary!: boolean;

  @ApiProperty()
  isAiApproved!: boolean;

  @ApiProperty()
  commentsCount!: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  lessonScheduledAt!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  submittedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class OrgReportsFilterOptionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class OrgReportsMetaDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalDraft!: number;

  @ApiProperty()
  totalNeedsReview!: number;

  @ApiProperty()
  totalSubmitted!: number;

  @ApiProperty()
  totalMissingLessons!: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  averageRating!: number | null;

  @ApiProperty({ type: [OrgReportsFilterOptionDto] })
  classrooms!: OrgReportsFilterOptionDto[];

  @ApiProperty({ type: [OrgReportsFilterOptionDto] })
  subjects!: OrgReportsFilterOptionDto[];
}

export class OrgReportsResponseDto {
  @ApiProperty({ type: [OrgReportItemDto] })
  reports!: OrgReportItemDto[];

  @ApiProperty({ type: OrgReportsMetaDto })
  meta!: OrgReportsMetaDto;
}
