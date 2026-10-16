import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { QuestionOptionEntity, QuestionOptionId } from '../../../domain';
import { QuestionOption as PrismaQuestionOption } from '@generated/prisma/client';

@Injectable()
export class QuestionOptionMapper
  implements IMapper<QuestionOptionEntity, PrismaQuestionOption>
{
  toDomain(record: PrismaQuestionOption): QuestionOptionEntity {
    return QuestionOptionEntity.reconstitute({
      id: QuestionOptionId.from(record.id),
      questionId: record.questionId,
      key: record.key,
      text: record.text,
      imageUrl: record.imageUrl,
    });
  }

  toPersistence(entity: QuestionOptionEntity): Omit<PrismaQuestionOption, 'id'> {
    return {
      questionId: entity.questionId,
      key: entity.key,
      text: entity.text,
      imageUrl: entity.imageUrl,
    };
  }
}
