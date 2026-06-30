import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { SystemRole } from '../user/enums';
import { CreateMediaUploadDTO } from './dto/create-media-upload.dto';
import { MediaStatus, MediaType } from './enums';
import {
  IMAGE_EXTENSION_BY_CONTENT_TYPE,
  MEDIA_ERRORS,
} from './media.constants';
import { MediaRepository } from './repository/media.repository';
import { S3_CLIENT } from '../../lib/s3/s3.constants';
import type { IS3Client } from '../../pkg/s3/s3.interface';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly configService: ConfigService,
    @Inject(S3_CLIENT) private readonly s3Client: IS3Client,
  ) {}

  async createUpload(
    restaurantId: number,
    uploadedBy: number,
    mediaType: MediaType,
    data: CreateMediaUploadDTO,
  ) {
    const restaurantExists =
      await this.mediaRepository.restaurantExists(restaurantId);
    if (!restaurantExists) {
      throw new NotFoundException(MEDIA_ERRORS.RESTAURANT_NOT_FOUND);
    }

    const extension = IMAGE_EXTENSION_BY_CONTENT_TYPE[data.contentType];
    const path = `restaurant/${restaurantId}/${mediaType}/${randomUUID()}.${extension}`;
    const mediaUrl = this.buildPublicUrl(path);
    const expiresInSeconds =
      this.configService.get<number>('s3.presignedUrlExpiresInSeconds') ?? 300;

    const uploadUrl = await this.s3Client.generatePresignedUploadUrl({
      key: path,
      contentType: data.contentType,
      expiresInSeconds,
    });
    const media = await this.mediaRepository.create({
      restaurantId,
      uploadedBy,
      mediaType,
      contentType: data.contentType,
      status: MediaStatus.PENDING,
      path,
      mediaUrl,
    });

    return {
      mediaId: media.id,
      uploadUrl,
      publicUrl: media.mediaUrl,
      path: media.path,
      uploadHeaders: {
        'Content-Type': data.contentType,
      },
      expiresInSeconds,
    };
  }

  async confirmUpload(
    restaurantId: number,
    mediaId: number,
    userId: number,
    userRole: SystemRole,
  ) {
    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new NotFoundException(MEDIA_ERRORS.NOT_FOUND);
    }
    if (media.restaurantId !== restaurantId) {
      throw new ForbiddenException(MEDIA_ERRORS.WRONG_RESTAURANT);
    }
    if (
      userRole !== SystemRole.SYSTEM_ADMIN &&
      media.uploadedBy !== Number(userId)
    ) {
      throw new ForbiddenException(MEDIA_ERRORS.NOT_UPLOADER);
    }
    if (media.status === MediaStatus.COMPLETED) {
      return media;
    }

    const object = await this.s3Client.getObjectMetadata(media.path);
    if (!object) {
      throw new BadRequestException(MEDIA_ERRORS.OBJECT_NOT_FOUND);
    }
    if (object.contentType?.toLowerCase() !== media.contentType.toLowerCase()) {
      throw new BadRequestException(MEDIA_ERRORS.CONTENT_TYPE_MISMATCH);
    }
    if (
      object.contentLength !== undefined &&
      object.contentLength !== null &&
      object.contentLength <= 0
    ) {
      throw new BadRequestException(MEDIA_ERRORS.EMPTY_OBJECT);
    }

    return this.mediaRepository.markCompleted(media.id);
  }

  async assertCompletedMediaUrl(
    restaurantId: number,
    mediaUrl: string,
    mediaType: MediaType,
  ): Promise<void> {
    const media = await this.mediaRepository.findCompletedByUrl(
      restaurantId,
      mediaUrl,
      mediaType,
    );
    if (!media) {
      throw new BadRequestException(MEDIA_ERRORS.NOT_CONFIRMED);
    }
  }

  private buildPublicUrl(path: string): string {
    const region = this.configService.get<string>('s3.region');
    const bucket = this.configService.get<string>('s3.bucket');
    const cdnDomain = this.configService.get<string>('s3.cdnDomain');
    if (!region || !bucket) {
      throw new Error('S3 is not configured. Set AWS_REGION and S3_BUCKET.');
    }

    const encodedPath = path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
      
    if (cdnDomain) {
      return `https://${cdnDomain}/${encodedPath}`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com/${encodedPath}`;
  }
}
