import type {
  GeneratePresignedUploadUrlInput,
  IS3Client,
  S3ObjectMetadata,
} from './s3.interface';

export interface AwsS3ClientConfig {
  region: string;
  bucket: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export class AwsS3Client implements IS3Client {
  private readonly client: any;
  private readonly HeadObjectCommand: any;
  private readonly PutObjectCommand: any;
  private readonly getSignedUrl: any;

  constructor(private readonly config: AwsS3ClientConfig) {
    // Loaded lazily so tests can replace the provider without initializing the
    // real AWS client.
    const {
      HeadObjectCommand,
      PutObjectCommand,
      S3Client,
    } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

    this.HeadObjectCommand = HeadObjectCommand;
    this.PutObjectCommand = PutObjectCommand;
    this.getSignedUrl = getSignedUrl;
    this.client = new S3Client({
      region: config.region,
      credentials: config.credentials,
    });
  }

  async generatePresignedUploadUrl(
    input: GeneratePresignedUploadUrlInput,
  ): Promise<string> {
    const command = new this.PutObjectCommand({
      Bucket: this.config.bucket,
      Key: input.key,
      ContentType: input.contentType,
    });

    return this.getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds,
    });
  }

  async getObjectMetadata(key: string): Promise<S3ObjectMetadata | null> {
    try {
      const result = await this.client.send(
        new this.HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
      );

      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        etag: result.ETag,
      };
    } catch (error) {
      const s3Error = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (
        s3Error.name === 'NotFound' ||
        s3Error.name === 'NoSuchKey' ||
        s3Error.$metadata?.httpStatusCode === 404
      ) {
        return null;
      }
      throw error;
    }
  }
}
