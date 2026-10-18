import { FirebaseStorageService } from '@modules/shared';
import { BoardStorageService } from '../infrastructure/services/board-storage.service';

describe('Firebase Storage & Board Upload Integration (Phase 3)', () => {
  let firebaseStorage: FirebaseStorageService;
  let boardStorage: BoardStorageService;

  beforeEach(() => {
    firebaseStorage = new FirebaseStorageService();
    boardStorage = new BoardStorageService(firebaseStorage);
  });

  describe('FirebaseStorageService', () => {
    it('generates a valid pre-signed upload URL and download URL', async () => {
      const result = await firebaseStorage.generateUploadUrl({
        folder: 'student-responses',
        orgId: 'org-test',
        userId: 'user-test',
        fileExtension: 'png',
        contentType: 'image/png',
        maxSizeBytes: 5 * 1024 * 1024,
        expiresInSeconds: 300,
      });

      expect(result.uploadUrl).toBeDefined();
      expect(result.uploadUrl).toContain('student-responses/org-test/user-test/');
      expect(result.fileKey).toContain('student-responses/org-test/user-test/');
      expect(result.fileKey.endsWith('.png')).toBe(true);
      expect(result.downloadUrl).toContain('firebasestorage.googleapis.com');
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('generates a download URL for a stored file key', async () => {
      const fileKey = 'avatars/user-123/profile.jpg';
      const downloadUrl = await firebaseStorage.generateDownloadUrl(fileKey);

      expect(downloadUrl).toContain('firebasestorage.googleapis.com');
      expect(downloadUrl).toContain(encodeURIComponent(fileKey));
    });

    it('handles deleteFile gracefully in fallback mode', async () => {
      await expect(firebaseStorage.deleteFile('student-responses/org-1/file-1.jpg')).resolves.toBeUndefined();
    });

    it('handles uploadBuffer gracefully in fallback mode', async () => {
      const buffer = Buffer.from('mock pdf report data');
      const url = await firebaseStorage.uploadBuffer({
        folder: 'board-images',
        orgId: 'org-1',
        fileName: 'report.pdf',
        buffer,
        contentType: 'application/pdf',
        makePublic: true,
      });

      expect(url).toContain('storage.googleapis.com');
      expect(url).toContain('board-images/org-1/report.pdf');
    });
  });

  describe('BoardStorageService', () => {
    it('generates upload URL for board responses delegating to FirebaseStorageService', async () => {
      const uploadResult = await boardStorage.getUploadUrl(
        'board-999',
        'homework-photo.jpeg',
        'image/jpeg',
      );

      expect(uploadResult.uploadUrl).toBeDefined();
      expect(uploadResult.uploadUrl).toContain('boards/board-999');
      expect(uploadResult.fileUrl).toContain('firebasestorage.googleapis.com');
      expect(uploadResult.expiresAt).toBeInstanceOf(Date);
    });
  });
});
