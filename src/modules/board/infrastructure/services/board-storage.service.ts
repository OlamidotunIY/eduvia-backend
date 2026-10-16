import { Injectable } from '@nestjs/common';

export interface UploadUrlResult {
  uploadUrl: string;
  fileUrl: string;
  expiresAt: Date;
}

@Injectable()
export class BoardStorageService {
  async getUploadUrl(
    boardId: string,
    filename: string,
    contentType: string,
  ): Promise<UploadUrlResult> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `boards/${boardId}/responses/${Date.now()}_${sanitizedName}`;

    // Return signed upload URL structure for Firebase Storage
    return {
      uploadUrl: `https://storage.googleapis.com/eduvia-uploads/${storagePath}?uploadType=resumable&contentType=${encodeURIComponent(contentType)}`,
      fileUrl: `https://storage.googleapis.com/eduvia-uploads/${storagePath}`,
      expiresAt,
    };
  }
}
