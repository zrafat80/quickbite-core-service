import { MediaStatus, MediaType } from 'src/app/media/enums';
import { MediaRepository } from 'src/app/media/repository/media.repository';
import { createKnexMock } from '../helpers/test-doubles';

describe('MediaRepository', () => {
  const doubles = createKnexMock();
  const repository = new MediaRepository(doubles.knex as never);
  const row = {
    id: '10',
    restaurant_id: '5',
    uploaded_by: '7',
    media_type: MediaType.PRODUCT_IMAGE,
    content_type: 'image/jpeg',
    status: MediaStatus.PENDING,
    path: 'restaurant/5/product_image/file.jpg',
    media_url: 'https://cdn.test/file.jpg',
    created_at: new Date('2026-06-23T00:00:00.000Z'),
    completed_at: null,
  };

  it('creates and maps a media record', async () => {
    doubles.setResult([row]);

    await expect(
      repository.create({
        restaurantId: 5,
        uploadedBy: 7,
        mediaType: MediaType.PRODUCT_IMAGE,
        contentType: 'image/jpeg',
        path: row.path,
        mediaUrl: row.media_url,
      }),
    ).resolves.toMatchObject({
      id: 10,
      restaurantId: 5,
      uploadedBy: 7,
      mediaType: MediaType.PRODUCT_IMAGE,
    });
  });

  it('checks whether a restaurant exists', async () => {
    doubles.setResult({ id: 5 });
    await expect(repository.restaurantExists(5)).resolves.toBe(true);

    doubles.setResult(undefined);
    await expect(repository.restaurantExists(99)).resolves.toBe(false);
  });

  it('finds and completes media records', async () => {
    doubles.setResult(row);
    await expect(repository.findById(10)).resolves.toMatchObject({ id: 10 });

    doubles.setResult([{ ...row, status: MediaStatus.COMPLETED }]);
    await expect(repository.markCompleted(10)).resolves.toMatchObject({
      status: MediaStatus.COMPLETED,
    });
  });

  it('finds completed media by restaurant, URL, and type', async () => {
    doubles.setResult({ ...row, status: MediaStatus.COMPLETED });

    await expect(
      repository.findCompletedByUrl(5, row.media_url, MediaType.PRODUCT_IMAGE),
    ).resolves.toMatchObject({ id: 10 });
  });
});
