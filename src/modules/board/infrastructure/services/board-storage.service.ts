import { Injectable } from '@nestjs/common';
import {
  FirebaseStorageService,
  UploadUrlResult as FirebaseUploadUrlResult,
} from '@modules/shared';

export interface UploadUrlResult {
  uploadUrl: string;
  fileUrl: string;
  expiresAt: Date;
}

@Injectable()
export class BoardStorageService {
  constructor(private readonly firebaseStorage: FirebaseStorageService) {}

  async getUploadUrl(
    boardId: string,
    filename: string,
    contentType: string,
  ): Promise<UploadUrlResult> {
    const ext = filename.split('.').pop() ?? 'jpg';
    const result: FirebaseUploadUrlResult =
      await this.firebaseStorage.generateUploadUrl({
        folder: 'student-responses',
        orgId: 'boards',
        userId: boardId,
        fileExtension: ext,
        contentType,
        maxSizeBytes: 5 * 1024 * 1024,
        expiresInSeconds: 900,
      });

    return {
      uploadUrl: result.uploadUrl,
      fileUrl: result.downloadUrl,
      expiresAt: result.expiresAt,
    };
  }
}
