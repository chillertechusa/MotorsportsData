import { createHash, randomInt } from 'crypto'

/**
 * The single platform owner email that backup codes protect.
 * Kept here so the generate action and recovery endpoint stay in sync.
 */
export const OWNER_BACKUP_EMAIL = 'motorsportsdata@gmail.com'

/** How many codes are issued per batch. */
export const BACKUP_CODE_COUNT = 10

/**
 * Peppered SHA-256 hash of a raw backup code.
 * The pepper (BETTER_AUTH_SECRET) means a leaked database alone cannot be
 * brute-forced offline without also stealing the server secret.
 */
export function hashBackupCode(rawCode: string): string {
  const pepper = process.env.BETTER_AUTH_SECRET ?? 'md-owner-backup-pepper'
  return createHash('sha256').update(`${pepper}:${rawCode}`).digest('hex')
}

/** Normalizes user input (strip spaces/dashes) before hashing/comparison. */
export function normalizeBackupCode(input: string): string {
  return input.replace(/[^0-9]/g, '')
}

/** Generates a single cryptographically-random 8-digit code as a string. */
export function generateBackupCode(): string {
  // randomInt is uniform; pad to 8 digits (allows leading zeros)
  return randomInt(0, 100_000_000).toString().padStart(8, '0')
}

/** Generates a fresh batch of unique 8-digit codes. */
export function generateBackupCodeBatch(count = BACKUP_CODE_COUNT): string[] {
  const codes = new Set<string>()
  while (codes.size < count) {
    codes.add(generateBackupCode())
  }
  return Array.from(codes)
}
