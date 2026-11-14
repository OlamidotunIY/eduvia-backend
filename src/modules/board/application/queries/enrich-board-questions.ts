import type { PrismaService } from '@modules/shared';
import type { BoardQuestion } from '../../domain';
import type { BoardQuestionDto } from './get-board-by-id/get-board-by-id.dto';

export async function enrichBoardQuestions(
  questions: BoardQuestion[],
  prisma?: PrismaService,
): Promise<BoardQuestionDto[]> {
  const base: BoardQuestionDto[] = questions.map((q) => ({
    id: q.id.unpack(),
    boardId: q.boardId,
    questionId: q.questionId,
    position: q.position,
    mode: q.mode,
    assignedAt: q.assignedAt,
    dueAt: q.dueAt ?? null,
    showOptions: q.showOptions,
    maxMarks: q.maxMarks,
  }));

  if (!prisma || base.length === 0) {
    return base;
  }

  const ids = [...new Set(base.map((q) => q.questionId))];
  const records = await prisma.question.findMany({
    where: { id: { in: ids } },
    include: { options: true },
  });

  const byId = new Map(records.map((r) => [r.id, r]));

  return base.map((item) => {
    const q = byId.get(item.questionId);
    if (!q) return item;
    return {
      ...item,
      question: {
        id: q.id,
        type: q.type,
        stem: q.stem,
        subject: q.subject,
        difficultyLevel: q.difficultyLevel,
        maxMarks: q.maxMarks,
        options: q.options.map((opt) => ({
          id: opt.id,
          key: opt.key,
          text: opt.text,
          imageUrl: opt.imageUrl ?? null,
        })),
      },
    };
  });
}
