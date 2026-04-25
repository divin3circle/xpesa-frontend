import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12

function getKey() {
  const secret = process.env.LINK_ENCRYPTION_KEY ?? process.env.ENCRYPTION_KEY
  if (!secret) return null

  return crypto.createHash("sha256").update(secret).digest()
}

export function encrypt(value: string): string {
  const key = getKey()
  if (!key) return value

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".")
}

export function decrypt(value: string): string {
  const key = getKey()
  if (!key) return value

  const [ivPart, authTagPart, encryptedPart] = value.split(".")
  if (!ivPart || !authTagPart || !encryptedPart) return value

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivPart, "base64url")
    )
    decipher.setAuthTag(Buffer.from(authTagPart, "base64url"))

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, "base64url")),
      decipher.final(),
    ])

    return decrypted.toString("utf8")
  } catch {
    return value
  }
}
