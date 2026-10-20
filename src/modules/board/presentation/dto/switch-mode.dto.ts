import { BoardMode } from '../../domain';

export class SwitchModeDto {
  mode: BoardMode;
  lessonStatus?: string;
}
