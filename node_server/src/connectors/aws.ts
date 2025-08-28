import { S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "../config";

const config = ConfigService.getInstance().s3;

export const s3Client = new S3Client({
  region: config.region,
  credentials:
    config.accessKeyId && config.secretAccessKey
      ? {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        }
      : undefined,
});
