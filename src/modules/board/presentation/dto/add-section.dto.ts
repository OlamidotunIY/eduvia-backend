import { SectionType } from '../../domain';

export class AddSectionDto {
  type: SectionType;
  content: string;
  position?: number;
  isTeacherOnly?: boolean;
}
