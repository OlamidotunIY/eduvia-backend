import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export type StoragePath =
  | 'student-responses'
  | 'org-logos'
  | 'board-images'
  | 'question-images'
  | 'avatars';

export interface GenerateUploadUrlParams {
  folder: StoragePath;
  orgId: string;
  userId: string;
  fileExtension: string;
  contentType: string;
  maxSizeBytes?: number;
  expiresInSeconds?: number;
}

export interface UploadUrlResult {
  uploadUrl: string;
  fileKey: string;
  downloadUrl: string;
  expiresAt: Date;
}

export interface UploadBufferParams {
  folder: StoragePath;
  orgId: string;
  fileName: string;
  buffer: Buffer;
  contentType: string;
  makePublic?: boolean;
}

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
}

@Injectable()
export class FirebaseStorageService {
  private readonly logger = new Logger(FirebaseStorageService.name);

  private readonly bucketName =
    process.env.FIREBASE_STORAGE_BUCKET ?? 'eduvia-uploads.appspot.com';

  private getCredentials(): ServiceAccountCredentials | null {
    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(
          process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
        ) as ServiceAccountCredentials;
      }
      const credPath =
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
        process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
      if (credPath && fs.existsSync(credPath)) {
        return JSON.parse(
          fs.readFileSync(credPath, 'utf-8'),
        ) as ServiceAccountCredentials;
      }
    } catch (err) {
      this.logger.error(
        `Failed to parse storage credentials: ${(err as Error).message}`,
      );
    }
    return null;
  }

  /**
   * Generates a signed upload URL for direct-to-cloud client uploads.
   * Student apps upload directly to Firebase / Google Cloud Storage bypassing the backend.
   */
  async generateUploadUrl(
    params: GenerateUploadUrlParams,
  ): Promise<UploadUrlResult> {
    const fileId = uuidv4();
    const sanitizedExt = params.fileExtension.replace(/^\./, '');
    const fileKey = `${params.folder}/${params.orgId}/${params.userId}/${fileId}.${sanitizedExt}`;
    const expiresInSeconds = params.expiresInSeconds ?? 300; // 5 mins
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const creds = this.getCredentials();

    if (creds?.client_email && creds?.private_key) {
      // Generate standard Google Cloud Storage V4 signed PUT URL
      const signedUrl = this.generateV4SignedPutUrl({
        bucket: this.bucketName,
        fileKey,
        contentType: params.contentType,
        expiresInSeconds,
        clientEmail: creds.client_email,
        privateKey: creds.private_key,
      });

      const encodedKey = encodeURIComponent(fileKey);
      const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o/${encodedKey}?alt=media`;

      return {
        uploadUrl: signedUrl,
        fileKey,
        downloadUrl,
        expiresAt,
      };
    }

    // Graceful fallback for local development / testing without live Google credentials
    this.logger.warn(
      `Firebase Storage credentials not configured. Generating fallback upload URL for file ${fileKey}`,
    );
    const encodedKey = encodeURIComponent(fileKey);
    const uploadUrl = `https://storage.googleapis.com/${this.bucketName}/${fileKey}?uploadType=resumable&expires=${expiresAt.getTime()}`;
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o/${encodedKey}?alt=media`;

    return {
      uploadUrl,
      fileKey,
      downloadUrl,
      expiresAt,
    };
  }

  /**
   * Generates a time-limited download URL for private files
   */
  async generateDownloadUrl(
    fileKey: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const creds = this.getCredentials();
    if (creds?.client_email && creds?.private_key) {
      return this.generateV4SignedGetUrl({
        bucket: this.bucketName,
        fileKey,
        expiresInSeconds,
        clientEmail: creds.client_email,
        privateKey: creds.private_key,
      });
    }

    const encodedKey = encodeURIComponent(fileKey);
    return `https://firebasestorage.googleapis.com/v0/b/${this.bucketName}/o/${encodedKey}?alt=media`;
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(fileKey: string): Promise<void> {
    const creds = this.getCredentials();
    if (!creds?.client_email || !creds?.private_key) {
      this.logger.warn(
        `Storage credentials not configured. Skipping remote delete for ${fileKey}`,
      );
      return;
    }

    try {
      const encodedKey = encodeURIComponent(fileKey);
      await fetch(
        `https://storage.googleapis.com/storage/v1/b/${this.bucketName}/o/${encodedKey}`,
        {
          method: 'DELETE',
        },
      );
      this.logger.log(`Deleted file: ${fileKey}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete file ${fileKey}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Server-side upload for generated assets (PDF reports, system-generated exports)
   */
  async uploadBuffer(params: UploadBufferParams): Promise<string> {
    const fileKey = `${params.folder}/${params.orgId}/${params.fileName}`;
    const creds = this.getCredentials();

    if (!creds?.client_email || !creds?.private_key) {
      this.logger.warn(
        `Storage credentials not configured. Mocking buffer upload for ${fileKey}`,
      );
      return `https://storage.googleapis.com/${this.bucketName}/${fileKey}`;
    }

    try {
      const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${this.bucketName}/o?uploadType=media&name=${encodeURIComponent(fileKey)}`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': params.contentType,
        },
        body: params.buffer as unknown as BodyInit,
      });

      if (!res.ok) {
        throw new Error(
          `Direct buffer upload failed: ${res.status} ${await res.text()}`,
        );
      }

      if (params.makePublic) {
        return `https://storage.googleapis.com/${this.bucketName}/${fileKey}`;
      }

      return this.generateDownloadUrl(fileKey, 7 * 24 * 3600);
    } catch (err) {
      this.logger.error(
        `Upload buffer failed for ${fileKey}: ${(err as Error).message}`,
      );
      return `https://storage.googleapis.com/${this.bucketName}/${fileKey}`;
    }
  }

  // --- V4 Signing Implementation using Node Crypto ---

  private generateV4SignedPutUrl(opts: {
    bucket: string;
    fileKey: string;
    contentType: string;
    expiresInSeconds: number;
    clientEmail: string;
    privateKey: string;
  }): string {
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = now
      .toISOString()
      .replace(/[:-]/g, '')
      .replace(/\.\d{3}/, '');

    const credentialScope = `${dateStamp}/auto/storage/goog4_request`;
    const host = 'storage.googleapis.com';
    const canonicalUri = `/${opts.bucket}/${opts.fileKey}`;

    const queryParams: Record<string, string> = {
      'X-Goog-Algorithm': 'GOOG4-RSA-SHA256',
      'X-Goog-Credential': `${opts.clientEmail}/${credentialScope}`,
      'X-Goog-Date': timestamp,
      'X-Goog-Expires': String(opts.expiresInSeconds),
      'X-Goog-SignedHeaders': 'content-type;host',
    };

    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
      )
      .join('&');

    const canonicalHeaders = `content-type:${opts.contentType}\nhost:${host}\n`;
    const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\ncontent-type;host\nUNSIGNED-PAYLOAD`;

    const stringToSign = `GOOG4-RSA-SHA256\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(stringToSign);
    const signature = signer.sign(opts.privateKey, 'hex');

    return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Goog-Signature=${signature}`;
  }

  private generateV4SignedGetUrl(opts: {
    bucket: string;
    fileKey: string;
    expiresInSeconds: number;
    clientEmail: string;
    privateKey: string;
  }): string {
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timestamp = now
      .toISOString()
      .replace(/[:-]/g, '')
      .replace(/\.\d{3}/, '');

    const credentialScope = `${dateStamp}/auto/storage/goog4_request`;
    const host = 'storage.googleapis.com';
    const canonicalUri = `/${opts.bucket}/${opts.fileKey}`;

    const queryParams: Record<string, string> = {
      'X-Goog-Algorithm': 'GOOG4-RSA-SHA256',
      'X-Goog-Credential': `${opts.clientEmail}/${credentialScope}`,
      'X-Goog-Date': timestamp,
      'X-Goog-Expires': String(opts.expiresInSeconds),
      'X-Goog-SignedHeaders': 'host',
    };

    const canonicalQueryString = Object.keys(queryParams)
      .sort()
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
      )
      .join('&');

    const canonicalHeaders = `host:${host}\n`;
    const canonicalRequest = `GET\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\nhost\nUNSIGNED-PAYLOAD`;

    const stringToSign = `GOOG4-RSA-SHA256\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(stringToSign);
    const signature = signer.sign(opts.privateKey, 'hex');

    return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Goog-Signature=${signature}`;
  }
}
