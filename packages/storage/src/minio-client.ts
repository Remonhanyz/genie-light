import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
const useSSL = process.env.MINIO_USE_SSL === "true";
const accessKeyId = process.env.MINIO_ROOT_USER || "genie_minio";
const secretAccessKey = process.env.MINIO_ROOT_PASSWORD || "genie_minio_password";

export const s3Client = new S3Client({
  endpoint: `${useSSL ? "https" : "http"}://${endpoint}:${port}`,
  region: "us-east-1",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Necessary for MinIO
});

export const STORAGE_BUCKETS = {
  DATASHEETS: process.env.MINIO_BUCKET_DATASHEETS || "genie-datasheets",
  PRODUCTS: process.env.MINIO_BUCKET_PRODUCTS || "genie-products",
  PROJECTS: process.env.MINIO_BUCKET_PROJECTS || "genie-projects",
};

export async function ensureBucketsExist() {
  for (const bucket of Object.values(STORAGE_BUCKETS)) {
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
        console.log(`🪣 Created bucket: ${bucket}`);
      } catch (err) {
        console.error(`Error ensuring bucket ${bucket}:`, err);
      }
    }
  }
}

export async function uploadFile(
  bucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL || `http://${endpoint}:${port}`}/${bucket}/${key}`;
}

export async function getDownloadPresignedUrl(bucket: string, key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(bucket: string, key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return s3Client.send(command);
}
