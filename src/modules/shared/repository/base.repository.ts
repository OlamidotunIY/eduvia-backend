abstract class BaseRepository<T, ID extends number> {
    public abstract findById(id: ID): Promise<T | null>;

    public abstract findAll(): Promise<T[]>;

    public abstract save(entity: T): Promise<void>;

    public abstract delete(id: ID): Promise<void>;
}

export { BaseRepository };