import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MissingReportLessonStudentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  image!: string | null;
}

export class MissingReportLessonItemDto {
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
  scheduledAt!: string;

  @ApiProperty()
  durationMins!: number;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [MissingReportLessonStudentDto] })
  students!: MissingReportLessonStudentDto[];
}
