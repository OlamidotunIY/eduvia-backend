import { BaseRepository } from '../../../shared/domain/repository/base.repository';
import { User } from '../entities/user.entities';
import { UserId } from '../value-objects/user-id.vo';

abstract class IUserRepository extends BaseRepository<User, UserId> {
  public abstract getUserByEmail(email: string): Promise<User | null>;

  public abstract updateUserEmail(
    userId: UserId | string,
    email: string,
  ): Promise<void>;

  public abstract markEmailVerified(userId: UserId | string): Promise<void>;
}

export { IUserRepository };
