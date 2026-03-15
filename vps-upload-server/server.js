/**
 * VPS upload server.
 * Vercel loyihasida NEXT_PUBLIC_API_URL shu server manziliga yo'naltiriladi.
 * POST /api/uploads — file + kind (image|video), fayl public/uploads ga yoziladi, { url: "/uploads/..." } qaytariladi.
 * GET /uploads/* — static fayllar.
 */
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
const VIDEO_EXT = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

function sanitize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "media";
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const kind = req.body?.kind === "video" ? "videos" : "images";
    const dir = path.join(UPLOAD_DIR, kind);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = sanitize(path.basename(file.originalname || "file", ext));
    cb(null, `${base}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const UPLOAD_SECRET = process.env.UPLOAD_SECRET;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/uploads", (req, res, next) => {
  if (UPLOAD_SECRET && req.get("X-Upload-Secret") !== UPLOAD_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}, upload.single("file"), (req, res) => {
  const kind = req.body?.kind;
  if (kind !== "image" && kind !== "video") {
    return res.status(400).json({ error: "Noto'g'ri media turi" });
  }
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "Fayl topilmadi" });
  }
  const ext = path.extname(file.originalname || "").toLowerCase();
  const allowed = kind === "image" ? IMAGE_EXT : VIDEO_EXT;
  if (!allowed.includes(ext)) {
    fs.unlink(file.path, () => {});
    return res.status(400).json({ error: "Fayl turi qo'llab-quvvatlanmaydi" });
  }
  const sub = kind === "image" ? "images" : "videos";
  const url = `/uploads/${sub}/${path.basename(file.filename)}`;
  res.json({ url });
});

app.use("/uploads", express.static(path.join(UPLOAD_DIR)));

app.listen(PORT, () => {
  console.log(`VPS upload server: http://0.0.0.0:${PORT}`);
});
