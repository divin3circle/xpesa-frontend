import { S3Client } from "@aws-sdk/client-s3"
import { envConfig } from "../utils"

export const r2 = new S3Client({
  region: "auto",
  endpoint: envConfig.R2_ENDPOINT,
  credentials: {
    accessKeyId: envConfig.R2_ACCESS_KEY_ID,
    secretAccessKey: envConfig.R2_SECRET_ACCESS_KEY,
  },
})

export const R2_BUCKET = envConfig.R2_BUCKET_NAME
