import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";

const bucket = process.env.S3_BUCKET || "genie-light";
const rawEndpoint = process.env.S3_ENDPOINT;
const endpoint = rawEndpoint
	? rawEndpoint.replace(/\/+$/, "").replace(new RegExp(`\/${bucket}$`), "")
	: undefined;
const region = process.env.S3_REGION || "auto";
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const publicUrlBase = process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

const isS3Configured = Boolean(
	accessKeyId && secretAccessKey && accessKeyId !== "mock-key"
);

export const s3Client = isS3Configured
	? new S3Client({
			region,
			...(endpoint ? { endpoint } : {}),
			credentials: {
				accessKeyId: accessKeyId!,
				secretAccessKey: secretAccessKey!
			}
		})
	: null;

/**
 * Uploads a file buffer to S3 storage (or local uploads directory if S3 is not configured yet).
 * Ensures zero code migration when switching environment variables between S3 providers (R2 / AWS / MinIO).
 */
export async function uploadToStorage(
	buffer: Buffer,
	originalFilename: string,
	contentType: string
): Promise<string> {
	const ext = path.extname(originalFilename).toLowerCase() || ".jpg";
	const sanitizedBase = path
		.basename(originalFilename, ext)
		.replace(/[^a-zA-Z0-9]/g, "-")
		.toLowerCase();
	const uniqueKey = `products/${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${sanitizedBase}${ext}`;

	// Always save a local copy across cms and web public directories
	const localFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${sanitizedBase}${ext}`;
	const cwd = process.cwd();
	const possibleUploadDirs = [
		path.resolve(cwd, "public", "uploads", "products"),
		path.resolve(cwd, "..", "web", "public", "uploads", "products"),
		path.resolve(cwd, "apps", "cms", "public", "uploads", "products"),
		path.resolve(cwd, "apps", "web", "public", "uploads", "products"),
	];

	for (const dir of possibleUploadDirs) {
		try {
			await fs.mkdir(dir, {recursive: true});
			await fs.writeFile(path.join(dir, localFileName), buffer);
		} catch {
			// Suppress non-critical directory write failures
		}
	}

	if (s3Client) {
		try {
			const command = new PutObjectCommand({
				Bucket: bucket,
				Key: uniqueKey,
				Body: buffer,
				ContentType: contentType
			});

			await s3Client.send(command);
			console.log(
				`[Storage] Successfully uploaded object to S3/R2 cloud storage: ${uniqueKey}`
			);

			// If a public CDN / R2 dev domain is set (and not the private S3 API endpoint), use it.
			if (
				publicUrlBase &&
				!publicUrlBase.includes("cloudflarestorage.com")
			) {
				const cleanBase = publicUrlBase.endsWith("/")
					? publicUrlBase.slice(0, -1)
					: publicUrlBase;
				return `${cleanBase}/${uniqueKey}`;
			}
		} catch (s3Err) {
			console.warn(
				"[Storage] S3 upload failed or offline, using local disk storage fallback:",
				s3Err
			);
		}
	}

	return `/uploads/products/${localFileName}`;
}

/**
 * Deletes an object from R2 / S3 storage and local disk fallback.
 */
export async function deleteFromStorage(fileUrl: string): Promise<boolean> {
	if (!fileUrl) return false;

	let key = "";
	let filename = "";

	try {
		if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
			const parsedUrl = new URL(fileUrl);
			let pathname = parsedUrl.pathname.replace(/^\/+/, "");
			if (bucket && pathname.startsWith(`${bucket}/`)) {
				pathname = pathname.substring(bucket.length + 1);
			}
			key = pathname;
			filename = path.basename(pathname);
		} else {
			filename = path.basename(fileUrl);
			key = `products/${filename}`;
		}

		let deletedS3 = false;

		if (s3Client && key) {
			try {
				const command = new DeleteObjectCommand({
					Bucket: bucket,
					Key: key
				});
				await s3Client.send(command);
				console.log(
					`[Storage] Successfully deleted object from Cloudflare R2 / S3: ${key}`
				);
				deletedS3 = true;
			} catch (s3Err) {
				console.warn(
					`[Storage] Failed to delete object from S3/R2 (${key}):`,
					s3Err
				);
			}
		}

		if (filename) {
			const cwd = process.cwd();
			const candidatePaths = [
				path.resolve(cwd, "public", "uploads", "products", filename),
				path.resolve(cwd, "..", "web", "public", "uploads", "products", filename),
				path.resolve(cwd, "apps", "cms", "public", "uploads", "products", filename),
				path.resolve(cwd, "apps", "web", "public", "uploads", "products", filename),
			];

			for (const p of candidatePaths) {
				try {
					await fs.unlink(p);
					console.log(`[Storage] Successfully unlinked local file: ${p}`);
				} catch {
					// Ignore if local file doesn't exist
				}
			}
		}

		return deletedS3 || true;
	} catch (err) {
		console.error(`[Storage] Error during file deletion (${fileUrl}):`, err);
		return false;
	}
}
