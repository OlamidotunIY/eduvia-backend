import { Injectable } from '@nestjs/common';
import {
  IAssessmentQueryPort,
  SharedAssessmentDto,
  SharedMasteryDto,
  SharedQuestionDto,
} from '@modules/shared';
import {
  IAssessmentRepository,
  IMasteryRecordRepository,
  IQuestionRepository,
} from '../../domain';

@Injectable()
export class AssessmentQueryAdapter implements IAssessmentQueryPort {
  constructor(
    private readonly questionRepository: IQuestionRepository,
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly masteryRecordRepository: IMasteryRecordRepository,
  ) {}

  public async getQuestionById(id: string): Promise<SharedQuestionDto | null> {
    const question = await this.questionRepository.findById(id);
    if (!question) return null;
    return {
      id: question.id.unpack(),
      stem: question.stem,
      type: question.type,
      maxMarks: question.maxMarks,
      difficultyLevel: question.difficultyLevel,
      subject: question.subject,
      curriculumNodeId: question.curriculumNodeId,
      isPublished: question.isPublished,
    };
  }

  public async getAssessmentById(id: string): Promise<SharedAssessmentDto | null> {
    const assessment = await this.assessmentRepository.findById(id);
    if (!assessment) return null;
    return {
      id: assessment.id.unpack(),
      lessonId: assessment.lessonId,
      studentId: assessment.studentId,
      orgId: assessment.orgId,
      status: assessment.status,
      totalMaxMarks: assessment.totalMaxMarks,
      totalMarksAwarded: assessment.totalMarksAwarded,
      scorePercent: assessment.scorePercent,
    };
  }

  public async getAssessmentByLessonAndStudent(
    lessonId: string,
    studentId: string,
  ): Promise<SharedAssessmentDto | null> {
    const assessment = await this.assessmentRepository.findByLessonAndStudent(
      lessonId,
      studentId,
    );
    if (!assessment) return null;
    return {
      id: assessment.id.unpack(),
      lessonId: assessment.lessonId,
      studentId: assessment.studentId,
      orgId: assessment.orgId,
      status: assessment.status,
      totalMaxMarks: assessment.totalMaxMarks,
      totalMarksAwarded: assessment.totalMarksAwarded,
      scorePercent: assessment.scorePercent,
    };
  }

  public async getStudentMastery(
    studentId: string,
    curriculumNodeId: string,
    orgId: string,
  ): Promise<SharedMasteryDto | null> {
    const record = await this.masteryRecordRepository.findByStudentAndNode(
      studentId,
      curriculumNodeId,
      orgId,
    );
    if (!record) return null;
    return {
      id: record.id.unpack(),
      studentId: record.studentId,
      curriculumNodeId: record.curriculumNodeId,
      orgId: record.orgId,
      masteryLevel: record.masteryLevel,
      teacherAssessedScore: record.teacherAssessedScore,
      systemCalculatedScore: record.systemCalculatedScore,
      assessmentCount: record.assessmentCount,
      lastUpdatedAt: record.lastUpdatedAt,
    };
  }

  public async getStudentMasteryList(
    studentId: string,
    orgId?: string,
  ): Promise<SharedMasteryDto[]> {
    const records = await this.masteryRecordRepository.findByStudentId(
      studentId,
      orgId,
    );
    return records.map((record) => ({
      id: record.id.unpack(),
      studentId: record.studentId,
      curriculumNodeId: record.curriculumNodeId,
      orgId: record.orgId,
      masteryLevel: record.masteryLevel,
      teacherAssessedScore: record.teacherAssessedScore,
      systemCalculatedScore: record.systemCalculatedScore,
      assessmentCount: record.assessmentCount,
      lastUpdatedAt: record.lastUpdatedAt,
    }));
  }
}
