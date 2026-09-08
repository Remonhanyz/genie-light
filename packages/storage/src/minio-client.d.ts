import { S3Client } from "@aws-sdk/client-s3";
export declare const s3Client: S3Client;
export declare const STORAGE_BUCKETS: {
    DATASHEETS: string;
    PRODUCTS: string;
    PROJECTS: string;
};
export declare function ensureBucketsExist(): Promise<void>;
export declare function uploadFile(folderOrBucket: string, key: string, body: Buffer | Uint8Array, contentType: string): Promise<string>;
export declare function getDownloadPresignedUrl(folderOrBucket: string, key: string, expiresIn?: number): Promise<string>;
export declare function deleteFile(folderOrBucket: string, key: string): Promise<import("@aws-sdk/client-s3").DeleteObjectCommandOutput>;
//# sourceMappingURL=minio-client.d.ts.map