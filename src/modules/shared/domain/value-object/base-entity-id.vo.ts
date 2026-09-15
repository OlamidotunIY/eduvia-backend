import { v7 as uuidv7, validate as validateUuid, version as uuidVersion } from 'uuid';
import { BadRequestError } from '../errors/bad-request.error';

abstract class BaseEntityId {
  protected constructor(private readonly rawValue: string) {
    if (!validateUuid(rawValue) || uuidVersion(rawValue) !== 7) {
      throw new BadRequestError('Entity id must be a UUIDv7 value', {
        id: rawValue,
      });
    }
  }

  protected static nextValue(): string {
    return uuidv7();
  }

  public get value(): string {
    return this.rawValue;
  }

  public equals(other: BaseEntityId | string): boolean {
    return this.rawValue === String(other);
  }

  public toString(): string {
    return this.rawValue;
  }

  public toJSON(): string {
    return this.rawValue;
  }
}

export { BaseEntityId };
