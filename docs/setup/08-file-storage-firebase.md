# Setup Guide — File Storage (Firebase Storage)

> Full setup for student image uploads (handwritten work photos) and org asset uploads using Firebase Storage via the Firebase Admin SDK.

---

## Architecture Decision

You chose **Firebase Storage** for file storage. Firebase Storage:
- Shares the same Firebase project and Admin SDK already set up for FCM
- Generates pre-signed download URLs with expiry
- Has built-in access rules (controlled via Firebase Security Rules)
- Works natively with React Native via `@react-native-firebase/storage`

**Upload flow (for student image responses):**
1. Student requests a pre-signed upload URL from the backend (`POST /boards/:boardId/upload-url`)
2. Backend generates a signed upload URL and returns it to the client
3. Client uploads the file DIRECTLY to Firebase Storage (bypasses backend — no bandwidth cost)
4. Client sends the resulting download URL to the backend as part of their response submission
5. Backend stores the URL in `StudentResponse.imageUrl`

---

## 1. Install Dependencies

```bash
# Backend: uses firebase-admin (already installed for FCM)
# No additional backend packages needed

# Mobile:
# pnpm add @react-native-firebase/storage  (in the React Native project)
```

---

## 2. Firebase Storage Service

```typescript
// src/modules/shared/infrastructure/firebase/firebase-storage.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import * as admin from 'firebase-admin';
import { v4 as uuid } from 'uuid';

export type StoragePath =
  | 'student-responses'    // student handwritten image uploads
  | 'org-logos'            // org profile logos
  | 'board-images'         // images pasted into board sections
  | 'question-images'      // images attached to MCQ options
  | 'avatars';             // user profile pictures

@Injectable()
export class FirebaseStorageService {
  private readonly logger = new Logger(FirebaseStorageService.name);
  private readonly bucket: admin.storage.Storage['bucket'] extends (...args: infer _) => infer R ? R : never;

  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  private getBucket() {
    return admin.storage(this.firebaseAdmin.getApp()).bucket();
  }

  // Generate a signed upload URL (PUT method) for client-side direct upload
  async generateUploadUrl(params: {
    folder: StoragePath;
    orgId: string;
    userId: string;
    fileExtension: string;    // e.g. 'jpg', 'png', 'pdf'
    contentType: string;      // e.g. 'image/jpeg', 'application/pdf'
    maxSizeBytes?: number;
    expiresInSeconds?: number;
  }): Promise<{ uploadUrl: string; fileKey: string; downloadUrl: string }> {
    const fileId = uuid();
    const fileKey = `${params.folder}/${params.orgId}/${params.userId}/${fileId}.${params.fileExtension}`;

    const file = this.getBucket().file(fileKey);

    const [uploadUrl] = await file.generateSignedPostPolicyV4({
      expires: Date.now() + (params.expiresInSeconds ?? 300) * 1000, // 5 minutes default
      conditions: [
        ['content-length-range', 0, params.maxSizeBytes ?? 10 * 1024 * 1024], // 10MB default
        ['eq', '$Content-Type', params.contentType],
      ],
      fields: {
        'Content-Type': params.contentType,
      },
    });

    // Generate the public download URL (will be accessible after upload)
    // Firebase Storage URLs follow this pattern:
    const encodedKey = encodeURIComponent(fileKey);
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.getBucket().name}/o/${encodedKey}?alt=media`;

    return {
      uploadUrl: uploadUrl.url,  // POST URL for upload
      fileKey,                   // stored in DB
      downloadUrl,               // returned to client after upload completes
    };
  }

  // Generate a time-limited download URL (for private files)
  async generateDownloadUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
    const file = this.getBucket().file(fileKey);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInSeconds * 1000,
    });
    return url;
  }

  // Delete a file (e.g., when org deactivates or student removes response)
  async deleteFile(fileKey: string): Promise<void> {
    try {
      await this.getBucket().file(fileKey).delete();
      this.logger.log(`Deleted file: ${fileKey}`);
    } catch (error) {
      this.logger.warn(`Failed to delete file ${fileKey}: ${(error as Error).message}`);
    }
  }

  // Upload from server (for generated content, e.g., PDF reports)
  async uploadBuffer(params: {
    folder: StoragePath;
    orgId: string;
    fileName: string;
    buffer: Buffer;
    contentType: string;
    makePublic?: boolean;
  }): Promise<string> {
    const fileKey = `${params.folder}/${params.orgId}/${params.fileName}`;
    const file = this.getBucket().file(fileKey);

    await file.save(params.buffer, {
      metadata: { contentType: params.contentType },
      public: params.makePublic ?? false,
    });

    if (params.makePublic) {
      return `https://storage.googleapis.com/${this.getBucket().name}/${fileKey}`;
    }

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return url;
  }
}
```

---

## 3. Upload URL Endpoint

```typescript
// src/modules/board/presentation/controllers/board-upload.controller.ts

import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth';
import { CurrentUser } from '@modules/auth';
import { FirebaseStorageService } from '@modules/shared';

class RequestUploadUrlDto {
  fileExtension: string;   // 'jpg', 'png'
  contentType: string;     // 'image/jpeg', 'image/png'
}

@Controller('boards/:boardId/upload-url')
@UseGuards(JwtAuthGuard)
export class BoardUploadController {
  constructor(private readonly storage: FirebaseStorageService) {}

  @Post()
  async getUploadUrl(
    @Param('boardId') boardId: string,
    @CurrentUser() user: { userId: string; orgId: string },
    @Body() dto: RequestUploadUrlDto,
  ): Promise<{ uploadUrl: string; fileKey: string; downloadUrl: string }> {
    // Validate allowed content types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(dto.contentType)) {
      throw new Error('Invalid content type');
    }

    return this.storage.generateUploadUrl({
      folder: 'student-responses',
      orgId: user.orgId,
      userId: user.userId,
      fileExtension: dto.fileExtension,
      contentType: dto.contentType,
      maxSizeBytes: 5 * 1024 * 1024,  // 5MB limit for student images
      expiresInSeconds: 300,           // 5 minutes to complete upload
    });
  }
}
```

---

## 4. Firebase Storage Security Rules

```javascript
// Firebase Console -> Storage -> Rules
// Apply these rules to control access

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Student response images — only accessible by the student's org members
    match /student-responses/{orgId}/{userId}/{fileId} {
      allow read: if request.auth != null &&
                     request.auth.token.orgId == orgId;
      // Uploads go through signed URLs — no direct client write needed
      allow write: if false;
    }

    // Org logos — publicly readable
    match /org-logos/{orgId}/{fileName} {
      allow read: if true;
      allow write: if false;
    }

    // Board images — accessible to org members
    match /board-images/{orgId}/{rest=**} {
      allow read: if request.auth != null &&
                     request.auth.token.orgId == orgId;
      allow write: if false;
    }

    // Avatars — publicly readable
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if false;
    }

    // Deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

> **Note:** Because all uploads go via **signed POST URLs** generated server-side, the Firebase Security Rules say `allow write: false`. The signed URL bypasses the rules — only your backend can create upload URLs.

---

## 5. React Native Client Upload Flow

```typescript
// mobile/src/services/file-upload.service.ts

import { Platform } from 'react-native';
import { apiClient } from './api-client';

export interface UploadResult {
  downloadUrl: string;
  fileKey: string;
}

export async function uploadStudentResponseImage(
  boardId: string,
  localFilePath: string,   // e.g. from ImagePicker result
  mimeType: string,        // e.g. 'image/jpeg'
): Promise<UploadResult> {
  const extension = mimeType.split('/')[1];

  // Step 1: Get signed upload URL from backend
  const { uploadUrl, fileKey, downloadUrl } = await apiClient.post<{
    uploadUrl: string;
    fileKey: string;
    downloadUrl: string;
  }>(`/boards/${boardId}/upload-url`, {
    fileExtension: extension,
    contentType: mimeType,
  });

  // Step 2: Read the file as blob
  const fileBlob = await (await fetch(
    Platform.OS === 'ios' ? localFilePath : `file://${localFilePath}`,
  )).blob();

  // Step 3: Upload directly to Firebase Storage (NOT via backend)
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': mimeType },
    body: fileBlob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status} ${await uploadResponse.text()}`);
  }

  // Step 4: Return the download URL to include in the response submission
  return { downloadUrl, fileKey };
}

// Usage in board response submission:
async function submitImageResponse(boardId: string, questionId: string, imagePath: string) {
  const { downloadUrl } = await uploadStudentResponseImage(boardId, imagePath, 'image/jpeg');

  await apiClient.post(`/boards/${boardId}/questions/${questionId}/responses`, {
    responseType: 'image_upload',
    imageUrl: downloadUrl,
  });
}
```

---

## 6. Org Logo Upload

```typescript
// src/modules/org/presentation/controllers/org-upload.controller.ts

@Post(':orgId/logo')
@UseGuards(JwtAuthGuard, OrgAdminGuard)
async uploadLogo(
  @Param('orgId') orgId: string,
  @UploadedFile() file: Express.Multer.File,
): Promise<{ logoUrl: string }> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) throw new BadRequestException('Invalid image type');
  if (file.size > 2 * 1024 * 1024) throw new BadRequestException('Image must be < 2MB');

  const logoUrl = await this.storage.uploadBuffer({
    folder: 'org-logos',
    orgId,
    fileName: `logo.${file.mimetype.split('/')[1]}`,
    buffer: file.buffer,
    contentType: file.mimetype,
    makePublic: true,  // org logos are publicly readable
  });

  await this.commandBus.execute(
    new UpdateOrgLogoCommand({ orgId, logoUrl }),
  );

  return { logoUrl };
}
```

---

## 7. Environment Variables

```env
# Shared with FCM (same Firebase project)
FIREBASE_SERVICE_ACCOUNT_PATH=/run/secrets/firebase-service-account.json
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Upload limits
MAX_STUDENT_IMAGE_SIZE_MB=5
MAX_ORG_LOGO_SIZE_MB=2
```
