# Yayasan Rumsram - NGO Company Profile (Next.js + TS + MySQL CMS)

✅ Admin CMS (role-based: **admin/editor**)  
✅ Animasi halus (Framer Motion) + Floating blobs  
✅ Lazy loading images + Skeleton loading  
✅ Upload image: file / link

## Logo dari database
Sesuai request, logo disimpan di database:
- Saat upload logo (folder = `logo`), server mengembalikan **data URL (base64)**.
- Data URL tersebut disimpan di MySQL pada kolom `site_settings.logo_url`.
- Navbar & area publik membaca `logo_url` dari settings (kalau kosong akan fallback ke icon).

---

## 1) Setup Database (phpMyAdmin / MySQL)

1. Buat database baru (misalnya: `rumsram`).
2. Buka phpMyAdmin → pilih database → tab **Import**:
   - Import file `mysql/schema.sql`
3. Import lagi file `mysql/seed.sql`

### Default Admin (seed)
- Email: `admin@rumsram.local`
- Password: `admin123`

---

## 2) Konfigurasi Environment

Copy file `.env.example` menjadi `.env.local`, lalu isi:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD` (boleh kosong, tapi tetap harus ada: `MYSQL_PASSWORD=`)
- `MYSQL_DATABASE`
- `AUTH_SECRET` (random panjang)
- `AUTH_TTL` (opsional, default `7d`)

---

## 3) Run lokal

```bash
npm install
npm run dev
```

Admin:
- `http://localhost:3000/admin/`

---

## 4) Deploy (cPanel / hosting yang ada phpMyAdmin)

Jika hosting kamu mendukung **Node.js App**:

1. Upload project ini ke server.
2. Buat database di hosting + import `mysql/schema.sql` dan `mysql/seed.sql` via phpMyAdmin.
3. Setting environment variables di menu Node App (samakan dengan `.env.example`).
4. Jalankan:
   - Install: `npm install`
   - Build: `npm run build`
   - Start: `npm run start`

---

## Upload folder

- Upload image non-logo disimpan di: `public/uploads/<folder>/...`
- Logo (folder `logo`) disimpan sebagai base64 di database (bukan file fisik).
