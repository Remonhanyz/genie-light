import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const targetBucket = process.env.S3_BUCKET || "genie-light";
const rawEndpoint = process.env.S3_ENDPOINT;
const cleanEndpoint = rawEndpoint
  ? rawEndpoint.replace(/\/+$/, "").replace(new RegExp(`\/${targetBucket}$`), "")
  : process.env.MINIO_ENDPOINT
  ? `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT || 9000}`
  : undefined;

const region = process.env.S3_REGION || "auto";
const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.MINIO_ROOT_USER || "genie_minio";
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.MINIO_ROOT_PASSWORD || "genie_minio_password";

export const s3Client = new S3Client({
  region,
  ...(cleanEndpoint ? { endpoint: cleanEndpoint } : {}),
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  // If explicitly connecting to local MinIO host, enable forcePathStyle
  ...(cleanEndpoint && cleanEndpoint.includes("localhost") ? { forcePathStyle: true } : {}),
});

export const STORAGE_BUCKETS = {
  DATASHEETS: process.env.S3_PREFIX_DATASHEETS || "datasheets",
  PRODUCTS: process.env.S3_PREFIX_PRODUCTS || "products",
  PROJECTS: process.env.S3_PREFIX_PROJECTS || "projects",
};

export async function ensureBucketsExist() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: targetBucket }));
  } catch {
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: targetBucket }));
      console.log(`🪣 Created bucket: ${targetBucket}`);
    } catch (err) {
      console.warn(`Could not create bucket ${targetBucket} (may already exist or managed remotely):`, err);
    }
  }
}

function resolveObjectKey(folderOrBucket: string, key: string): string {
  if (!folderOrBucket || folderOrBucket === targetBucket) {
    return key;
  }
  return key.startsWith(`${folderOrBucket}/`) ? key : `${folderOrBucket}/${key}`;
}

export async function uploadFile(
  folderOrBucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const objectKey = resolveObjectKey(folderOrBucket, key);

  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const publicBase = process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
  if (publicBase) {
    const cleanBase = publicBase.replace(/\/+$/, "");
    return `${cleanBase}/${objectKey}`;
  }

  return `/${objectKey}`;
}

export async function getDownloadPresignedUrl(folderOrBucket: string, key: string, expiresIn = 3600) {
  const objectKey = resolveObjectKey(folderOrBucket, key);
  const command = new GetObjectCommand({
    Bucket: targetBucket,
    Key: objectKey,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(folderOrBucket: string, key: string) {
  const objectKey = resolveObjectKey(folderOrBucket, key);
  const command = new DeleteObjectCommand({
    Bucket: targetBucket,
    Key: objectKey,
  });
  return s3Client.send(command);
}
