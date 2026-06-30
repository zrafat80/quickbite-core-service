export interface GeneratePresignedUploadUrlInput {
  key: string;
  contentType: string;
  expiresInSeconds: number;
}

export interface S3ObjectMetadata {
  contentType?: string;
  contentLength?: number;
  etag?: string;
}

export interface IS3Client {
  generatePresignedUploadUrl(
    input: GeneratePresignedUploadUrlInput,
  ): Promise<string>;
  getObjectMetadata(key: string): Promise<S3ObjectMetadata | null>;
}
