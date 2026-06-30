export const MEDIA_ERRORS = {
  RESTAURANT_NOT_FOUND: 'Restaurant not found',
  NOT_FOUND: 'Media record not found',
  WRONG_RESTAURANT: 'Media does not belong to this restaurant',
  NOT_UPLOADER: 'Only the uploader can confirm this media',
  OBJECT_NOT_FOUND: 'The uploaded S3 object was not found',
  CONTENT_TYPE_MISMATCH:
    'Uploaded object content type does not match the request',
  EMPTY_OBJECT: 'Uploaded object is empty',
  NOT_CONFIRMED:
    'The media URL must reference completed media for this restaurant',
} as const;

export const ALLOWED_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const IMAGE_EXTENSION_BY_CONTENT_TYPE: Record<
  (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number],
  string
> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
