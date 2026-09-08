"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORAGE_BUCKETS = exports.s3Client = void 0;
exports.ensureBucketsExist = ensureBucketsExist;
exports.uploadFile = uploadFile;
exports.getDownloadPresignedUrl = getDownloadPresignedUrl;
exports.deleteFile = deleteFile;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
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
exports.s3Client = new client_s3_1.S3Client({
    region,
    ...(cleanEndpoint ? { endpoint: cleanEndpoint } : {}),
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    // If explicitly connecting to local MinIO host, enable forcePathStyle
    ...(cleanEndpoint && cleanEndpoint.includes("localhost") ? { forcePathStyle: true } : {}),
});
exports.STORAGE_BUCKETS = {
    DATASHEETS: process.env.S3_PREFIX_DATASHEETS || "datasheets",
    PRODUCTS: process.env.S3_PREFIX_PRODUCTS || "products",
    PROJECTS: process.env.S3_PREFIX_PROJECTS || "projects",
};
async function ensureBucketsExist() {
    try {
        await exports.s3Client.send(new client_s3_1.HeadBucketCommand({ Bucket: targetBucket }));
    }
    catch {
        try {
            await exports.s3Client.send(new client_s3_1.CreateBucketCommand({ Bucket: targetBucket }));
            console.log(`🪣 Created bucket: ${targetBucket}`);
        }
        catch (err) {
            console.warn(`Could not create bucket ${targetBucket} (may already exist or managed remotely):`, err);
        }
    }
}
function resolveObjectKey(folderOrBucket, key) {
    if (!folderOrBucket || folderOrBucket === targetBucket) {
        return key;
    }
    return key.startsWith(`${folderOrBucket}/`) ? key : `${folderOrBucket}/${key}`;
}
async function uploadFile(folderOrBucket, key, body, contentType) {
    const objectKey = resolveObjectKey(folderOrBucket, key);
    const command = new client_s3_1.PutObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
        Body: body,
        ContentType: contentType,
    });
    await exports.s3Client.send(command);
    const publicBase = process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
    if (publicBase) {
        const cleanBase = publicBase.replace(/\/+$/, "");
        return `${cleanBase}/${objectKey}`;
    }
    return `/${objectKey}`;
}
async function getDownloadPresignedUrl(folderOrBucket, key, expiresIn = 3600) {
    const objectKey = resolveObjectKey(folderOrBucket, key);
    const command = new client_s3_1.GetObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn });
}
async function deleteFile(folderOrBucket, key) {
    const objectKey = resolveObjectKey(folderOrBucket, key);
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: targetBucket,
        Key: objectKey,
    });
    return exports.s3Client.send(command);
}
//# sourceMappingURL=minio-client.js.map