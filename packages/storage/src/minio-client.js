"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORAGE_BUCKETS = exports.s3Client = void 0;
exports.ensureBucketsExist = ensureBucketsExist;
exports.uploadFile = uploadFile;
exports.getDownloadPresignedUrl = getDownloadPresignedUrl;
exports.deleteFile = deleteFile;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const endpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
const useSSL = process.env.MINIO_USE_SSL === "true";
const accessKeyId = process.env.MINIO_ROOT_USER || "genie_minio";
const secretAccessKey = process.env.MINIO_ROOT_PASSWORD || "genie_minio_password";
exports.s3Client = new client_s3_1.S3Client({
    endpoint: `${useSSL ? "https" : "http"}://${endpoint}:${port}`,
    region: "us-east-1",
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    forcePathStyle: true, // Necessary for MinIO
});
exports.STORAGE_BUCKETS = {
    DATASHEETS: process.env.MINIO_BUCKET_DATASHEETS || "genie-datasheets",
    PRODUCTS: process.env.MINIO_BUCKET_PRODUCTS || "genie-products",
    PROJECTS: process.env.MINIO_BUCKET_PROJECTS || "genie-projects",
};
async function ensureBucketsExist() {
    for (const bucket of Object.values(exports.STORAGE_BUCKETS)) {
        try {
            await exports.s3Client.send(new client_s3_1.HeadBucketCommand({ Bucket: bucket }));
        }
        catch {
            try {
                await exports.s3Client.send(new client_s3_1.CreateBucketCommand({ Bucket: bucket }));
                console.log(`🪣 Created bucket: ${bucket}`);
            }
            catch (err) {
                console.error(`Error ensuring bucket ${bucket}:`, err);
            }
        }
    }
}
async function uploadFile(bucket, key, body, contentType) {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    await exports.s3Client.send(command);
    return `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL || `http://${endpoint}:${port}`}/${bucket}/${key}`;
}
async function getDownloadPresignedUrl(bucket, key, expiresIn = 3600) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn });
}
async function deleteFile(bucket, key) {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    return exports.s3Client.send(command);
}
//# sourceMappingURL=minio-client.js.map