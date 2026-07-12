import { PutObjectCommand } from "@aws-sdk/client-s3"
import { r2, R2_BUCKET } from "@/lib/r2"
import { envConfig } from "@/lib/env"

function publicUrlFor(key: string) {
  const baseUrl = envConfig.R2_PUBLIC_BASE_URL.replace(/\/$/, "")
  if (!baseUrl) throw new Error("R2 public base URL is not configured")
  return `${baseUrl}/${key}`
}

export async function uploadReceiptObject({
  key,
  body,
  contentType,
}: {
  key: string
  body: string
  contentType: string
}) {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  )

  return {
    key,
    uri: publicUrlFor(key),
  }
}
