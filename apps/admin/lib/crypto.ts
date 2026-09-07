import crypto from "crypto";

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
      if (error) reject(error);
      resolve(hash.toString("hex").normalize());
    });
  });
}

export async function comparePasswords(password: string, salt: string, hash: string): Promise<boolean> {
  try {
    const inputHash = await hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(inputHash, "hex"),
      Buffer.from(hash, "hex")
    );
  } catch (error) {
    return false;
  }
}
