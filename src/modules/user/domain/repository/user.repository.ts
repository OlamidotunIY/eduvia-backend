import { BaseRepository } from "../../../shared/repository/base.repository";
import { User } from "../entities/user.entities";


abstract class IUserRepository extends BaseRepository<User, number> {
    public abstract getUserByEmail(email: string): Promise<User | null>;

    public abstract updateUserEmail(
        userId: number,
        email: string
    ): Promise<void>;
}

export { IUserRepository };