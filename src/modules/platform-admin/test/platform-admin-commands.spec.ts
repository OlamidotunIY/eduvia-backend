import {
  CreatePlatformAdminHandler,
  CreatePlatformAdminCommand,
  ApproveOrgHandler,
  ApproveOrgCommand,
  RejectOrgHandler,
  RejectOrgCommand,
  SuspendOrgHandler,
  SuspendOrgCommand,
  PublishPlatformAnnouncementHandler,
  PublishPlatformAnnouncementCommand,
} from '../application/commands';
import {
  IPlatformAdminRepository,
  IOrgApprovalRecordRepository,
  IPlatformAnnouncementRepository,
  PlatformAdmin,
  PlatformAdminRole,
  PlatformAnnouncement,
  PlatformAnnouncementId,
  UnauthorizedPlatformActionError,
  PlatformAdminAlreadyExistsError,
  PlatformAnnouncementNotFoundError,
} from '../domain';

describe('Platform Admin Command Handlers', () => {
  let mockAdminRepo: jest.Mocked<IPlatformAdminRepository>;
  let mockApprovalRepo: jest.Mocked<IOrgApprovalRecordRepository>;
  let mockAnnouncementRepo: jest.Mocked<IPlatformAnnouncementRepository>;

  beforeEach(() => {
    mockAdminRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      findByRole: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockApprovalRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByOrgId: jest.fn(),
      findLatestByOrgId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockAnnouncementRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findDueScheduled: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;
  });

  describe('CreatePlatformAdminHandler', () => {
    it('should throw UnauthorizedPlatformActionError if caller is not super admin', async () => {
      const handler = new CreatePlatformAdminHandler(mockAdminRepo);
      mockAdminRepo.findByUserId.mockResolvedValueOnce(null);

      await expect(
        handler.execute(
          new CreatePlatformAdminCommand(
            'caller-1',
            'target-user-1',
            PlatformAdminRole.PlatformSupport,
          ),
        ),
      ).rejects.toThrow(UnauthorizedPlatformActionError);
    });

    it('should throw PlatformAdminAlreadyExistsError if target user is already an admin', async () => {
      const handler = new CreatePlatformAdminHandler(mockAdminRepo);
      const superAdmin = PlatformAdmin.create({
        userId: 'caller-1',
        role: PlatformAdminRole.PlatformSuperAdmin,
      });
      const existing = PlatformAdmin.create({
        userId: 'target-user-1',
        role: PlatformAdminRole.PlatformSupport,
      });

      mockAdminRepo.findByUserId
        .mockResolvedValueOnce(superAdmin)
        .mockResolvedValueOnce(existing);

      await expect(
        handler.execute(
          new CreatePlatformAdminCommand(
            'caller-1',
            'target-user-1',
            PlatformAdminRole.CurriculumEditor,
          ),
        ),
      ).rejects.toThrow(PlatformAdminAlreadyExistsError);
    });

    it('should successfully create and save a new platform admin', async () => {
      const handler = new CreatePlatformAdminHandler(mockAdminRepo);
      const superAdmin = PlatformAdmin.create({
        userId: 'caller-1',
        role: PlatformAdminRole.PlatformSuperAdmin,
      });

      mockAdminRepo.findByUserId
        .mockResolvedValueOnce(superAdmin)
        .mockResolvedValueOnce(null);

      const result = await handler.execute(
        new CreatePlatformAdminCommand(
          'caller-1',
          'new-admin-user',
          PlatformAdminRole.CurriculumEditor,
        ),
      );

      expect(result.userId).toBe('new-admin-user');
      expect(result.role).toBe(PlatformAdminRole.CurriculumEditor);
      expect(mockAdminRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('ApproveOrgHandler', () => {
    it('should approve organization when caller is super admin', async () => {
      const handler = new ApproveOrgHandler(mockAdminRepo, mockApprovalRepo);
      const superAdmin = PlatformAdmin.create({
        userId: 'super-admin-1',
        role: PlatformAdminRole.PlatformSuperAdmin,
      });
      mockAdminRepo.findByUserId.mockResolvedValueOnce(superAdmin);

      const result = await handler.execute(
        new ApproveOrgCommand('super-admin-1', 'org-123', 'Looks legitimate'),
      );

      expect(result.orgId).toBe('org-123');
      expect(result.decision).toBe('approved');
      expect(mockApprovalRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should reject non-super admin callers', async () => {
      const handler = new ApproveOrgHandler(mockAdminRepo, mockApprovalRepo);
      const supportAdmin = PlatformAdmin.create({
        userId: 'support-1',
        role: PlatformAdminRole.PlatformSupport,
      });
      mockAdminRepo.findByUserId.mockResolvedValueOnce(supportAdmin);

      await expect(
        handler.execute(new ApproveOrgCommand('support-1', 'org-123')),
      ).rejects.toThrow(UnauthorizedPlatformActionError);
    });
  });

  describe('RejectOrgHandler', () => {
    it('should reject organization with a valid reason', async () => {
      const handler = new RejectOrgHandler(mockAdminRepo, mockApprovalRepo);
      const superAdmin = PlatformAdmin.create({
        userId: 'super-admin-1',
        role: PlatformAdminRole.PlatformSuperAdmin,
      });
      mockAdminRepo.findByUserId.mockResolvedValueOnce(superAdmin);

      const result = await handler.execute(
        new RejectOrgCommand(
          'super-admin-1',
          'org-123',
          'Invalid school license number',
        ),
      );

      expect(result.orgId).toBe('org-123');
      expect(result.decision).toBe('rejected');
      expect(result.reason).toBe('Invalid school license number');
      expect(mockApprovalRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('SuspendOrgHandler', () => {
    it('should suspend organization with a reason', async () => {
      const handler = new SuspendOrgHandler(mockAdminRepo, mockApprovalRepo);
      const superAdmin = PlatformAdmin.create({
        userId: 'super-admin-1',
        role: PlatformAdminRole.PlatformSuperAdmin,
      });
      mockAdminRepo.findByUserId.mockResolvedValueOnce(superAdmin);

      const result = await handler.execute(
        new SuspendOrgCommand(
          'super-admin-1',
          'org-123',
          'Non-payment of platform invoice',
        ),
      );

      expect(result.orgId).toBe('org-123');
      expect(result.decision).toBe('suspended');
      expect(mockApprovalRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('PublishPlatformAnnouncementHandler', () => {
    it('should publish announcement and save', async () => {
      const handler = new PublishPlatformAnnouncementHandler(
        mockAdminRepo,
        mockAnnouncementRepo,
      );
      const superAdmin = PlatformAdmin.create({
        userId: 'super-admin-1',
        role: PlatformAdminRole.PlatformSuperAdmin,
      });
      mockAdminRepo.findByUserId.mockResolvedValueOnce(superAdmin);

      const announcement = PlatformAnnouncement.create({
        title: 'Release Notes',
        body: 'Version 2.0 is live!',
        createdBy: 'super-admin-1',
      });
      mockAnnouncementRepo.findById.mockResolvedValueOnce(announcement);

      const result = await handler.execute(
        new PublishPlatformAnnouncementCommand(
          'super-admin-1',
          announcement.id.toString(),
        ),
      );

      expect(result.status).toBe('published');
      expect(result.publishedAt).toBeInstanceOf(Date);
      expect(mockAnnouncementRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw if announcement not found', async () => {
      const handler = new PublishPlatformAnnouncementHandler(
        mockAdminRepo,
        mockAnnouncementRepo,
      );
      const superAdmin = PlatformAdmin.create({
        userId: 'super-admin-1',
        role: PlatformAdminRole.PlatformSuperAdmin,
      });
      mockAdminRepo.findByUserId.mockResolvedValueOnce(superAdmin);
      mockAnnouncementRepo.findById.mockResolvedValueOnce(null);

      const nonexistentId = PlatformAnnouncementId.create().toString();
      await expect(
        handler.execute(
          new PublishPlatformAnnouncementCommand('super-admin-1', nonexistentId),
        ),
      ).rejects.toThrow(PlatformAnnouncementNotFoundError);
    });
  });
});
