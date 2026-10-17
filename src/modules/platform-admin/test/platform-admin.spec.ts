import {
  PlatformAdmin,
  PlatformAdminId,
  PlatformAdminRole,
  BusinessRuleViolationError,
} from '../domain';

describe('PlatformAdmin Entity', () => {
  it('should create a PlatformAdmin with super admin role', () => {
    const admin = PlatformAdmin.create({
      userId: 'user-uuid-1',
      role: PlatformAdminRole.PlatformSuperAdmin,
    });

    expect(admin.id).toBeInstanceOf(PlatformAdminId);
    expect(admin.userId).toBe('user-uuid-1');
    expect(admin.role).toBe(PlatformAdminRole.PlatformSuperAdmin);
    expect(admin.isSuperAdmin()).toBe(true);
    expect(admin.isCurriculumEditor()).toBe(true);
    expect(admin.isSupport()).toBe(true);
  });

  it('should create a PlatformAdmin with curriculum editor role', () => {
    const admin = PlatformAdmin.create({
      userId: 'user-uuid-2',
      role: PlatformAdminRole.CurriculumEditor,
    });

    expect(admin.isSuperAdmin()).toBe(false);
    expect(admin.isCurriculumEditor()).toBe(true);
    expect(admin.isSupport()).toBe(false);
  });

  it('should create a PlatformAdmin with support role', () => {
    const admin = PlatformAdmin.create({
      userId: 'user-uuid-3',
      role: PlatformAdminRole.PlatformSupport,
    });

    expect(admin.isSuperAdmin()).toBe(false);
    expect(admin.isCurriculumEditor()).toBe(false);
    expect(admin.isSupport()).toBe(true);
  });

  it('should throw BusinessRuleViolationError when userId is missing', () => {
    expect(() =>
      PlatformAdmin.create({
        userId: '',
        role: PlatformAdminRole.PlatformSuperAdmin,
      }),
    ).toThrow(BusinessRuleViolationError);
  });

  it('should update admin role correctly', () => {
    const admin = PlatformAdmin.create({
      userId: 'user-uuid-4',
      role: PlatformAdminRole.PlatformSupport,
    });

    expect(admin.isSuperAdmin()).toBe(false);
    admin.updateRole(PlatformAdminRole.PlatformSuperAdmin);
    expect(admin.isSuperAdmin()).toBe(true);
  });

  it('should reconstitute a PlatformAdmin from persistent record', () => {
    const id = PlatformAdminId.create();
    const now = new Date();
    const admin = PlatformAdmin.reconstitute({
      id,
      userId: 'user-uuid-5',
      role: PlatformAdminRole.CurriculumEditor,
      createdAt: now,
      updatedAt: now,
    });

    expect(admin.id.equals(id)).toBe(true);
    expect(admin.userId).toBe('user-uuid-5');
    expect(admin.role).toBe(PlatformAdminRole.CurriculumEditor);
  });
});
