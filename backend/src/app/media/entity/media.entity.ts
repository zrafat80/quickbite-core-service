import { MediaStatus, MediaType } from '../enums';

export class Media {
  id!: number;
  restaurantId!: number;
  uploadedBy!: number;
  mediaType!: MediaType;
  contentType!: string;
  status!: MediaStatus;
  path!: string;
  mediaUrl!: string;
  createdAt!: Date;
  completedAt!: Date | null;

  constructor(data: Partial<Media>) {
    Object.assign(this, data);
    this.status = data.status ?? MediaStatus.PENDING;
    this.createdAt = data.createdAt ?? new Date();
    this.completedAt = data.completedAt ?? null;
  }
}
