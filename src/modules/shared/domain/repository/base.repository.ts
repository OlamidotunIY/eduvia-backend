import { BaseEntityId } from '../value-object/base-entity-id.vo';

abstract class BaseRepository<T, ID extends BaseEntityId> {
  public abstract findById(id: ID | string): Promise<T | null>;

  public abstract findAll(): Promise<T[]>;

  public abstract save(entity: T): Promise<void>;

  public abstract delete(id: ID | string): Promise<void>;
}

export { BaseRepository };
