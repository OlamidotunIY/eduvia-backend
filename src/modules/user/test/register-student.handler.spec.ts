import { ConflictException } from '@nestjs/common';
import { RegisterStudentHandler } from '../application/commands/register-student/register-student.handler';
import { RegisterStudentCommand } from '../application/commands/register-student/register-student.command';
import {
  IParentProfileRepository,
  IStudentProfileRepository,
  IUserRepository,
  ParentProfile,
  ParentProfileId,
  UserId,
} from '../domain';
import { IPasswordHashPort, PrismaService } from '@modules/shared';

describe('RegisterStudentHandler', () => {
  let handler: RegisterStudentHandler;
  let parentProfileRepository: jest.Mocked<IParentProfileRepository>;
  let studentProfileRepository: jest.Mocked<IStudentProfileRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordHashPort: jest.Mocked<IPasswordHashPort>;
  let prisma: {
    account: { create: jest.Mock };
  };

  beforeEach(() => {
    parentProfileRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<IParentProfileRepository>;

    studentProfileRepository = {
      save: jest.fn(),
    } as unknown as jest.Mocked<IStudentProfileRepository>;

    userRepository = {
      getUserByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    passwordHashPort = {
      hash: jest.fn().mockResolvedValue('hashed_secret_password'),
      compare: jest.fn(),
    };

    prisma = {
      account: {
        create: jest.fn().mockResolvedValue({ id: 'acc-1' }),
      },
    };

    handler = new RegisterStudentHandler(
      parentProfileRepository,
      studentProfileRepository,
      userRepository,
      passwordHashPort,
      prisma as unknown as PrismaService,
    );
  });

  it('should successfully register a student with credentials and student profile', async () => {
    const parentUserId = UserId.create();
    const parentProfile = ParentProfile.create({
      id: ParentProfileId.create(),
      userId: parentUserId,
    });

    parentProfileRepository.findByUserId.mockResolvedValue(parentProfile);
    userRepository.getUserByEmail.mockResolvedValue(null);

    const command = new RegisterStudentCommand({
      parentUserId,
      firstName: 'Timi',
      lastName: 'Adebayo',
      email: 'timi@adebayo.family',
      username: 'timi.adebayo',
      passwordRaw: 'Secret123!',
      dateOfBirth: new Date('2013-04-18'),
      gradeLevel: 'Grade 6',
      countryCode: 'NG',
      timezone: 'Africa/Lagos',
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.email).toBe('timi@adebayo.family');
    expect(result.firstName).toBe('Timi');
    expect(result.lastName).toBe('Adebayo');
    expect(result.gradeLevel).toBe('Grade 6');

    // Verify user saved with active status
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0][0];
    expect(savedUser.email).toBe('timi@adebayo.family');
    expect(savedUser.emailVerified).toBe(true);

    // Verify student profile saved
    expect(studentProfileRepository.save).toHaveBeenCalledTimes(1);
    const savedProfile = studentProfileRepository.save.mock.calls[0][0];
    expect(savedProfile.parentId.value).toBe(parentProfile.id.value);

    // Verify password hashed and credentials account created
    expect(passwordHashPort.hash).toHaveBeenCalledWith('Secret123!');
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        accountId: 'timi@adebayo.family',
        providerId: 'credentials',
        userId: result.id,
        password: 'hashed_secret_password',
        scope: 'student',
      }),
    });
  });

  it('should throw ConflictException if email is already registered', async () => {
    const parentUserId = UserId.create();
    parentProfileRepository.findByUserId.mockResolvedValue(
      ParentProfile.create({
        id: ParentProfileId.create(),
        userId: parentUserId,
      }),
    );

    userRepository.getUserByEmail.mockResolvedValue({ id: 'existing-user' } as any);

    const command = new RegisterStudentCommand({
      parentUserId,
      firstName: 'Timi',
      lastName: 'Adebayo',
      email: 'existing@eduvia.app',
      passwordRaw: 'Secret123!',
      dateOfBirth: new Date('2013-04-18'),
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(prisma.account.create).not.toHaveBeenCalled();
  });

  it('should auto-create ParentProfile if parent profile does not exist yet', async () => {
    const parentUserId = UserId.create();
    parentProfileRepository.findByUserId.mockResolvedValue(null);
    userRepository.getUserByEmail.mockResolvedValue(null);

    const command = new RegisterStudentCommand({
      parentUserId,
      firstName: 'Fisayo',
      lastName: 'Adebayo',
      email: 'fisayo@adebayo.family',
      passwordRaw: 'Secret123!',
      dateOfBirth: new Date('2015-09-02'),
    });

    const result = await handler.execute(command);

    expect(parentProfileRepository.save).toHaveBeenCalledTimes(1);
    expect(result.email).toBe('fisayo@adebayo.family');
  });
});
