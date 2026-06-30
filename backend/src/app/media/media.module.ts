import { Module } from '@nestjs/common';
import { S3Module } from '../../lib/s3/s3.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './repository/media.repository';

@Module({
  imports: [S3Module],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService],
})
export class MediaModule {}
