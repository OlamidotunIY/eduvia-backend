import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/shared';
import { CurriculumService } from '../services/curriculum.service';

@Controller('students')
@UseGuards(AuthGuard)
export class StudentCurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get(':studentId/curriculum')
  async getStudentCurriculum(
    @Param('studentId') _studentId: string,
    @Query('countryCode') countryCode: string,
  ) {
    return this.curriculumService.resolveStudentCurriculum(countryCode ?? 'GB');
  }
}
