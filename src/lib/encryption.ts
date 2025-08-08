import CryptoJS from 'crypto-js';

const ENCRYPTION_SECRET = import.meta.env.ENCRYPTION_SECRET || 'default-dev-secret-change-in-production';

if (!import.meta.env.ENCRYPTION_SECRET && import.meta.env.PROD) {
  console.error('⚠️ ENCRYPTION_SECRET is not set in production environment!');
}

/**
 * Encrypts sensitive data like TOTP secrets
 */
export function encrypt(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_SECRET).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts sensitive data like TOTP secrets
 */
export function decrypt(encryptedText: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_SECRET);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return originalText;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generates a secure random encryption key
 */
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Hashes data for verification (one-way)
 */
export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString();
}

/**
 * Verifies if a hash matches the original text
 */
export function verifyHash(text: string, hashedText: string): boolean {
  const newHash = hash(text);
  return newHash === hashedText;
}
