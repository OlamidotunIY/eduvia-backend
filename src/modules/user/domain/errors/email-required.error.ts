import { BadRequestError } from "../../../shared";

export class EmailRequired extends BadRequestError{
    constructor(details?: unknown){
        super('Invalid email', details);
        this.code = this.constructor.name;
    }
}
