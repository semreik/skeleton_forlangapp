import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils';
import 'react-native-get-random-values';

export function makeSalt(length = 16): Uint8Array {
  return randomBytes(length);
}

export async function deriveKey(password: string, salt: Uint8Array, iterations = 120_000, keyLen = 32) {
  const pwd = new TextEncoder().encode(password);
  return await pbkdf2Async(sha256, pwd, salt, { c: iterations, dkLen: keyLen });
}

export function toHex(u8: Uint8Array): string { return bytesToHex(u8); }
export function fromHex(hex: string): Uint8Array { return hexToBytes(hex); }


