/**
 * Velmora Web Crypto PIN Security Module
 * Implements PBKDF2 (100,000 iterations, SHA-256) with a cryptographic random salt.
 * 
 * IMPORTANT TRANSPARENCY NOTICE:
 * This PIN security provides an application interface lock to prevent casual
 * shoulder-surfing or snooping on an unlocked browser tab. It DOES NOT encrypt
 * the local IndexedDB database files against someone with root or administrative
 * access to your device.
 */

// Convert ArrayBuffer to Hex string
function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Generate a random 16-byte salt as hex string
 */
export function generateRandomSalt(): string {
  const salt = new Uint8Array(16);
  window.crypto.getRandomValues(salt);
  return bufToHex(salt.buffer);
}

/**
 * Hash a 4 to 6-digit PIN using PBKDF2 with 100,000 iterations and SHA-256
 */
export async function hashPin(pin: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const pinBuffer = enc.encode(pin);
  const saltBuffer = hexToBuf(saltHex);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    pinBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    256 // 256 bits = 32 bytes
  );

  return bufToHex(derivedBits);
}

/**
 * Verify an input PIN against stored salt and PBKDF2 hash
 */
export async function verifyPin(inputPin: string, storedSalt: string, storedHash: string): Promise<boolean> {
  try {
    const computedHash = await hashPin(inputPin, storedSalt);
    // Constant-time comparison simulation
    let diff = 0;
    if (computedHash.length !== storedHash.length) return false;
    for (let i = 0; i < computedHash.length; i++) {
      diff |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return diff === 0;
  } catch (err) {
    console.error('Error during PIN verification:', err);
    return false;
  }
}
