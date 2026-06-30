import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Media } from '../entity/media.entity';
import { MediaStatus, MediaType } from '../enums';

const MEDIA_COLUMNS = [
  'id',
  'restaurant_id',
  'uploaded_by',
  'media_type',
  'content_type',
  'status',
  'path',
  'media_url',
  'created_at',
  'completed_at',
];

@Injectable()
export class MediaRepository {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  private toEntity(row: any): Media {
    return new Media({
      id: Number(row.id),
      restaurantId: Number(row.restaurant_id),
      uploadedBy: Number(row.uploaded_by),
      mediaType: row.media_type,
      contentType: row.content_type,
      status: row.status,
      path: row.path,
      mediaUrl: row.media_url,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    });
  }

  async restaurantExists(restaurantId: number): Promise<boolean> {
    const row = await this.knex('restaurants')
      .select('id')
      .where({ id: restaurantId })
      .first();
    return Boolean(row);
  }

  async create(data: Partial<Media>): Promise<Media> {
    const [row] = await this.knex('media')
      .insert({
        restaurant_id: data.restaurantId,
        uploaded_by: data.uploadedBy,
        media_type: data.mediaType,
        content_type: data.contentType,
        status: data.status ?? MediaStatus.PENDING,
        path: data.path,
        media_url: data.mediaUrl,
      })
      .returning(MEDIA_COLUMNS);

    return this.toEntity(row);
  }

  async findById(id: number): Promise<Media | null> {
    const row = await this.knex('media')
      .select(MEDIA_COLUMNS)
      .where({ id })
      .first();

    return row ? this.toEntity(row) : null;
  }

  async markCompleted(id: number): Promise<Media> {
    const [row] = await this.knex('media')
      .where({ id })
      .update({
        status: MediaStatus.COMPLETED,
        completed_at: this.knex.fn.now(),
      })
      .returning(MEDIA_COLUMNS);

    return this.toEntity(row);
  }

  async findCompletedByUrl(
    restaurantId: number,
    mediaUrl: string,
    mediaType: MediaType,
  ): Promise<Media | null> {
    const row = await this.knex('media')
      .select(MEDIA_COLUMNS)
      .where({
        restaurant_id: restaurantId,
        media_url: mediaUrl,
        media_type: mediaType,
        status: MediaStatus.COMPLETED,
      })
      .first();

    return row ? this.toEntity(row) : null;
  }
}
