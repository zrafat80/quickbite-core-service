import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsS3Client } from '../../pkg/s3/aws-s3.client';
import type { IS3Client } from '../../pkg/s3/s3.interface';
import { S3_CLIENT } from './s3.constants';

@Module({
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): IS3Client => {
        const region = configService.get<string>('s3.region');
        const bucket = configService.get<string>('s3.bucket');
        const accessKeyId = configService.get<string>('s3.accessKeyId');
        const secretAccessKey = configService.get<string>('s3.secretAccessKey');

        if (!region || !bucket) {
          throw new Error(
            'S3 is not configured. Set AWS_REGION and S3_BUCKET.',
          );
        }
        if (
          (accessKeyId && !secretAccessKey) ||
          (!accessKeyId && secretAccessKey)
        ) {
          throw new Error(
            'Set both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or neither when using an IAM role.',
          );
        }

        return new AwsS3Client({
          region,
          bucket,
          credentials:
            accessKeyId && secretAccessKey
              ? { accessKeyId, secretAccessKey }
              : undefined,
        });
      },
    },
  ],
  exports: [S3_CLIENT],
})
export class S3Module {}
