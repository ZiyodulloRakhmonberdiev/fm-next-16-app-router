/**
 * Contabo bucket ga public read policy o'rnatadi (uploads/* uchun).
 * Ishga tushirish: node --env-file=.env.local scripts/contabo-set-public-policy.mjs
 * yoki: pnpm run contabo:public
 */
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { S3Client, PutBucketPolicyCommand } from "@aws-sdk/client-s3"

const envPath = join(process.cwd(), ".env.local")
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8")
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim()
  }
}

const endpoint = process.env.CONTABO_ENDPOINT
const bucket = process.env.CONTABO_BUCKET
const accessKey = process.env.CONTABO_ACCESS_KEY
const secretKey = process.env.CONTABO_SECRET_KEY

if (!endpoint || !bucket || !accessKey || !secretKey) {
  console.error("CONTABO_ENDPOINT, CONTABO_BUCKET, CONTABO_ACCESS_KEY, CONTABO_SECRET_KEY .env.local da bo'lishi kerak.")
  process.exit(1)
}

const policy = JSON.stringify({
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadUploads",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${bucket}/uploads/*`,
    },
  ],
})

const client = new S3Client({
  endpoint,
  region: process.env.CONTABO_REGION || "eu2",
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  forcePathStyle: true,
})

try {
  await client.send(new PutBucketPolicyCommand({ Bucket: bucket, Policy: policy }))
  console.log("Bucket policy o'rnatildi. uploads/* endi public.")
} catch (err) {
  console.error("Xato:", err.message)
  process.exit(1)
}
