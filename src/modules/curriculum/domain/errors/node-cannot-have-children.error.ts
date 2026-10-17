import { BusinessRuleViolationError } from '@modules/shared';

export class NodeCannotHaveChildrenError extends BusinessRuleViolationError {
  constructor(nodeId: string) {
    super(`Curriculum node "${nodeId}" is a leaf (learning objective) and cannot have child nodes.`);
    this.code = this.constructor.name;
  }
}
