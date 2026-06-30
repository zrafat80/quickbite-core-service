import { IsIn, IsString } from 'class-validator';
import { ALLOWED_IMAGE_CONTENT_TYPES } from '../media.constants';

export class CreateMediaUploadDTO {
  @IsString()
  @IsIn(ALLOWED_IMAGE_CONTENT_TYPES)
  contentType!: (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];
}
