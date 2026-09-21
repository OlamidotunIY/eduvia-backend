import { BadRequestError } from "../../../shared";

export class NameRequiredError extends BadRequestError{
    constructor( details?: unknown){
        super('FirstName and LastName required', details);
        this.code = this.constructor.name;
    }
}
