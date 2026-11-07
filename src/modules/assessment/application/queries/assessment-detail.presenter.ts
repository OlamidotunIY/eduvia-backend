import {
  IBoardQueryPort,
  IClassroomQueryPort,
  IUserQueryPort,
} from '@modules/shared';
import { Assessment, IQuestionRepository } from '../../domain';
import { AssessmentDetailDto } from './get-assessment-by-id/get-assessment-by-id.dto';

export class AssessmentDetailPresenter {
  constructor(
    private readonly questionRepository: IQuestionRepository,
    private readonly boardQueryPort: IBoardQueryPort,
    private readonly classroomQueryPort: IClassroomQueryPort,
    private readonly userQueryPort: IUserQueryPort,
  ) {}

  async present(assessment: Assessment): Promise<AssessmentDetailDto> {
    const [learner, lesson, boardQuestions] = await Promise.all([
      this.userQueryPort.getUserById(assessment.studentId),
      this.classroomQueryPort.getLessonById(assessment.lessonId),
      this.boardQueryPort.getBoardQuestions(assessment.boardId),
    ]);
    const classroom = lesson
      ? await this.classroomQueryPort.getClassroomById(lesson.classroomId)
      : null;
    const boardQuestionById = new Map(
      boardQuestions.map((question) => [question.id, question]),
    );

    return {
      id: assessment.id.unpack(),
      orgId: assessment.orgId,
      lessonId: assessment.lessonId,
      boardId: assessment.boardId,
      studentId: assessment.studentId,
      status: assessment.status,
      totalMaxMarks: assessment.totalMaxMarks,
      totalMarksAwarded: assessment.totalMarksAwarded,
      scorePercent: assessment.scorePercent,
      autoMarkedCount: assessment.autoMarkedCount,
      teacherMarkedCount: assessment.teacherMarkedCount,
      pendingMarkCount: assessment.pendingMarkCount,
      learner: learner
        ? {
            id: learner.id,
            fullName: `${learner.firstName} ${learner.lastName}`.trim(),
            email: learner.email,
            image: learner.image,
          }
        : null,
      lesson: lesson
        ? {
            id: lesson.id,
            scheduledAt: lesson.scheduledAt,
            status: lesson.status,
            classroomId: lesson.classroomId,
            classroomName: classroom?.name ?? null,
            subjectId: classroom?.subjectId ?? null,
          }
        : null,
      markingItems: await Promise.all(
        assessment.markingItems.map(async (item) => {
          const boardQuestion = boardQuestionById.get(item.boardQuestionId);
          const [question, response] = await Promise.all([
            boardQuestion
              ? this.questionRepository.findById(boardQuestion.questionId)
              : null,
            this.boardQueryPort.getStudentResponseById(item.studentResponseId),
          ]);

          return {
            id: item.id.unpack(),
            assessmentId: item.assessmentId,
            boardQuestionId: item.boardQuestionId,
            studentResponseId: item.studentResponseId,
            questionType: item.questionType,
            maxMarks: item.maxMarks,
            autoMarked: item.autoMarked,
            marksAwarded: item.marksAwarded,
            feedback: item.feedback,
            markedBy: item.markedBy,
            markedAt: item.markedAt,
            status: item.status,
            question: question
              ? {
                  id: question.id.unpack(),
                  stem: question.stem,
                  type: question.type,
                  options: question.options.map((option) => ({
                    key: option.key,
                    text: option.text,
                    imageUrl: option.imageUrl ?? null,
                  })),
                  markScheme: question.markScheme,
                }
              : null,
            response: response
              ? {
                  id: response.id,
                  responseType: response.responseType,
                  textContent: response.textContent,
                  imageUrl: response.imageUrl,
                  selectedOption: response.selectedOption,
                  submittedAt: response.submittedAt,
                }
              : null,
          };
        }),
      ),
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    };
  }
}
