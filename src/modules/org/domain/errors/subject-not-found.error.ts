import { NotFoundError } from "@modules/shared";

export class SubjectNotFound extends NotFoundError {
    constructor(details?: unknown) {
        super('Subject Not found', details);
        this.code = this.constructor.name;
    }
}
