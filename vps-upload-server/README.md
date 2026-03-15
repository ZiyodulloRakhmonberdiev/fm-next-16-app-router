# VPS upload server

Vercel’dagi loyiha media upload qilganda faylni shu serverga yuboradi. Server faylni VPS diskiga yozadi va `{ url: "/uploads/..." }` qaytaradi.

## Sozlash

1. VPS da papkaga o‘ting va dependency o‘rnating:
   ```bash
   cd vps-upload-server
   npm install
   ```

2. Serverni ishga tushiring (masalan, `pm2` yoki `systemd` bilan):
   ```bash
   PORT=4000 node server.js
   ```
   Yoki `npm start` (default port 4000).

3. Vercel (yoki loyiha) `.env` da:
   ```env
   NEXT_PUBLIC_API_URL=https://VPS_DOMAIN_OR_IP:4000
   UPLOAD_VPS_SECRET=your-random-secret
   ```
   VPS da esa `UPLOAD_SECRET=your-random-secret` (xuddi shu qiymat) qo‘ying — boshqalar upload qilolmasin.

4. **Muhim:** VPS da `public/uploads` doimiy diskda bo‘lsin (volume yoki doimiy papka). Nginx/Caddy orqali `/uploads` ni shu serverga proxy qilsangiz, media `https://media.example.com/uploads/...` orqali yuklanadi.

## API

- **POST /api/uploads**  
  - Body: `multipart/form-data`, `file` + `kind` (`image` | `video`)  
  - Javob: `{ "url": "/uploads/images/xxx.jpg" }` yoki `/uploads/videos/xxx.mp4`

- **GET /uploads/** — static fayllar (rasm/video).
