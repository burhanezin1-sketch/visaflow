import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LEN = 12
const TAG_LEN = 16
const PREFIX = 'enc:'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) throw new Error('ENCRYPTION_KEY must be 64-char hex')
  return Buffer.from(hex, 'hex')
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  const combined = Buffer.concat([iv, tag, ciphertext])
  return PREFIX + combined.toString('base64')
}

export function decrypt(value: string): string {
  if (!value || !value.startsWith(PREFIX)) return value
  try {
    const key = getKey()
    const combined = Buffer.from(value.slice(PREFIX.length), 'base64')
    const iv = combined.subarray(0, IV_LEN)
    const tag = combined.subarray(IV_LEN, IV_LEN + TAG_LEN)
    const ciphertext = combined.subarray(IV_LEN + TAG_LEN)
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(ciphertext) + decipher.final('utf8')
  } catch {
    return value
  }
}

export function isEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX)
}
