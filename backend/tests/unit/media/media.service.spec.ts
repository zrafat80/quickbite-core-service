import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaStatus, MediaType } from 'src/app/media/enums';
import { MediaRepository } from 'src/app/media/repository/media.repository';
import { MediaService } from 'src/app/media/media.service';
import { SystemRole } from 'src/app/user/enums';
import type { IS3Client } from 'src/pkg/s3/s3.interface';

describe('MediaService', () => {
  const repository = {
    restaurantExists: jest.fn().mockResolvedValue(true),
    create: jest.fn(),
    findById: jest.fn(),
    markCompleted: jest.fn(),
    findCompletedByUrl: jest.fn(),
  };
  const s3 = {
    generatePresignedUploadUrl: jest.fn(),
    getObjectMetadata: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string) => {
      const values: Record<string, unknown> = {
        's3.region': 'us-east-1',
        's3.bucket': 'quickbite-test-media',
        's3.presignedUrlExpiresInSeconds': 300,
      };
      return values[key];
    }),
  };
  const service = new MediaService(
    repository as unknown as MediaRepository,
    config as unknown as ConfigService,
    s3 as unknown as IS3Client,
  );

  const pendingMedia = {
    id: 10,
    restaurantId: 5,
    uploadedBy: 7,
    mediaType: MediaType.PRODUCT_IMAGE,
    contentType: 'image/jpeg',
    status: MediaStatus.PENDING,
    path: 'restaurant/5/product_image/file.jpg',
    mediaUrl:
      'https://quickbite-test-media.s3.us-east-1.amazonaws.com/restaurant/5/product_image/file.jpg',
  };

  it('creates a pending media record and returns a presigned upload contract', async () => {
    repository.create.mockImplementation(async (data) => ({
      ...pendingMedia,
      ...data,
    }));
    s3.generatePresignedUploadUrl.mockResolvedValue('https://upload.test/url');

    await expect(
      service.createUpload(5, 7, MediaType.PRODUCT_IMAGE, {
        contentType: 'image/jpeg',
      }),
    ).resolves.toMatchObject({
      mediaId: 10,
      uploadUrl: 'https://upload.test/url',
      publicUrl: expect.stringContaining('/restaurant/5/product_image/'),
      uploadHeaders: { 'Content-Type': 'image/jpeg' },
      expiresInSeconds: 300,
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        restaurantId: 5,
        uploadedBy: 7,
        mediaType: MediaType.PRODUCT_IMAGE,
        path: expect.stringMatching(/^restaurant\/5\/product_image\/.+\.jpg$/),
      }),
    );
  });

  it('verifies S3 metadata and completes an upload', async () => {
    repository.findById.mockResolvedValue(pendingMedia);
    s3.getObjectMetadata.mockResolvedValue({
      contentType: 'image/jpeg',
      contentLength: 100,
    });
    repository.markCompleted.mockResolvedValue({
      ...pendingMedia,
      status: MediaStatus.COMPLETED,
    });

    await expect(
      service.confirmUpload(5, 10, 7, SystemRole.RESTAURANT_USER),
    ).resolves.toMatchObject({ status: MediaStatus.COMPLETED });
    expect(repository.markCompleted).toHaveBeenCalledWith(10);
  });

  it('rejects confirmation by another restaurant user', async () => {
    repository.findById.mockResolvedValue(pendingMedia);

    await expect(
      service.confirmUpload(5, 10, 8, SystemRole.RESTAURANT_USER),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects missing or mismatched S3 objects', async () => {
    repository.findById.mockResolvedValue(pendingMedia);
    s3.getObjectMetadata.mockResolvedValueOnce(null);
    await expect(
      service.confirmUpload(5, 10, 7, SystemRole.RESTAURANT_USER),
    ).rejects.toBeInstanceOf(BadRequestException);

    s3.getObjectMetadata.mockResolvedValueOnce({
      contentType: 'image/png',
      contentLength: 100,
    });
    await expect(
      service.confirmUpload(5, 10, 7, SystemRole.RESTAURANT_USER),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts only completed media URLs of the requested type', async () => {
    repository.findCompletedByUrl.mockResolvedValueOnce(pendingMedia);
    await expect(
      service.assertCompletedMediaUrl(
        5,
        pendingMedia.mediaUrl,
        MediaType.PRODUCT_IMAGE,
      ),
    ).resolves.toBeUndefined();

    repository.findCompletedByUrl.mockResolvedValueOnce(null);
    await expect(
      service.assertCompletedMediaUrl(
        5,
        pendingMedia.mediaUrl,
        MediaType.RESTAURANT_LOGO,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
