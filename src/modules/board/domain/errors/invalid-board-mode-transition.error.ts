import { BusinessRuleViolationError } from '@modules/shared';

export class InvalidBoardModeTransitionError extends BusinessRuleViolationError {
  constructor(fromMode: string, toMode: string, reason?: string) {
    const msg = `Invalid board mode transition from '${fromMode}' to '${toMode}'${reason ? `: ${reason}` : '.'}`;
    super(msg, { fromMode, toMode, reason });
    this.code = this.constructor.name;
  }
}
