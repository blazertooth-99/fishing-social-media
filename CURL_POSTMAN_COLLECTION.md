# FishingBackend - cURL & Postman / Insomnia Collection

Kumpulan perintah **cURL** siap pakai untuk di-import langsung ke **Postman** atau **Insomnia**.

> **Cara Import ke Postman / Insomnia**:
> 1. Salin perintah `curl ...` yang diinginkan di bawah.
> 2. Buka **Postman** atau **Insomnia**.
> 3. Klik tombol **Import** (atau tekan `Ctrl + O` / `Cmd + O`).
> 4. Tempelkan (*Paste*) perintah cURL tersebut -> Request akan otomatis terbuat lengkap dengan URL, Header, Cookie, dan Body JSON!

> 📘 **Setup per environment** (mobile native / web local / web production) ada di
> [`CLIENT_SETUP.md`](./CLIENT_SETUP.md). Dokumen ini fokus pada contoh `curl`-nya saja.

---

## Variabel Lingkungan
- **Base URL Publik (Cloudflare)**: `https://api-fishing.janissaryid.com`
- **Base URL Lokal**: `http://localhost:3067`
- **Session Cookie (web)**: `fishing_session=<TOKEN_SESSION_ANDA>`
- **Session Bearer (mobile native)**: `Authorization: Bearer <SESSION_TOKEN>` — didapat dari response `POST /api/v1/auth/google/verify`
- **Frontend Redirect**: `FRONTEND_REDIRECT_URL` (harus URL aplikasi web / deep link app, **bukan** domain API)

---

## 1. Health & Status Probes

### 1.1 Liveness Check
```bash
curl -X GET "https://api-fishing.janissaryid.com/health/live" \
  -H "Accept: application/json"
```

### 1.2 Readiness & Database Check
```bash
curl -X GET "https://api-fishing.janissaryid.com/health/ready" \
  -H "Accept: application/json"
```

### 1.3 Prometheus Metrics
```bash
curl -X GET "https://api-fishing.janissaryid.com/metrics"
```

---

## 2. Authentication & Session

### 2.1 Inisiasi Login Google OAuth (Web Browser Flow — HANYA untuk web)
*(Buka URL ini di browser atau kirim request untuk mendapatkan link redirect)*

**Web local (development)** — kembali ke dev server:
```bash
curl -i -X GET "http://localhost:3067/api/v1/auth/google?redirect_to=http://localhost:5173"
```

**Web production** — kembali ke web app domain:
```bash
curl -i -X GET "https://api-fishing.janissaryid.com/api/v1/auth/google?redirect_to=https://app-fishing.janissaryid.com"
```

> `redirect_to` harus terdaftar di `ALLOWED_FRONTEND_REDIRECTS`, kalau tidak akan dibalas
> `422 VALIDATION_FAILED`. Lihat [`CLIENT_SETUP.md`](./CLIENT_SETUP.md) untuk setup per environment.

**Response**: `307 Temporary Redirect` + header `Location` (ke Google) + `Set-Cookie: oauth_state=...` dan (bila `redirect_to` dikirim) `Set-Cookie: oauth_redirect=...` — keduanya `HttpOnly; SameSite=Lax; Max-Age=600`

`redirect_uri` yang dikirim ke Google ditentukan dari header `Host` request, dicocokkan dengan
`OAUTH_CALLBACK_BASES`. Jadi dari `localhost:3067` callback-nya `http://localhost:3067/...`,
dari domain publik callback-nya `https://api-fishing.janissaryid.com/...`.

**Callback** — dipanggil otomatis oleh Google, bukan oleh client:
`GET /api/v1/auth/google/callback?code=...&state=...`

| Hasil | Response |
| :--- | :--- |
| Sukses | `303 See Other` → `Location: <FRONTEND_REDIRECT_URL>` + `Set-Cookie: fishing_session=...` |
| Gagal | `303 See Other` → `Location: <FRONTEND_REDIRECT_URL>?auth_error=<code>` |

Nilai `auth_error` yang mungkin: `access_denied`, `missing_code`, `missing_state`, `unauthorized`, `forbidden`, `invalid_request`, `server_error`.

> **Catatan**: untuk flow browser, backend **tidak** mengembalikan JSON error. Frontend harus membaca query param `auth_error` pada URL tujuan redirect.
>
> ⚠️ Jika muncul error 500 dengan body `{"error":{"code":"INTERNAL_SERVER_ERROR"}}`, cek `GET /health/ready` — biasanya aplikasi sedang berjalan tanpa koneksi database.

### 2.2 Login Native Android / Mobile (Google Credential Manager) — **Rekomendasi untuk Mobile**

*(Kirim `idToken` (JWT) hasil Google Sign-In. **Jangan** pakai flow 2.1 untuk app native — Google memblokir OAuth di WebView dan redirect browser tidak membawa token ke app.)*

```bash
curl -i -X POST "https://api-fishing.janissaryid.com/api/v1/auth/google/verify" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "id_token": "YOUR_GOOGLE_ID_TOKEN_HERE"
  }'
```

**Response sukses `200 OK`**:
```json
{
  "data": {
    "session_token": "a1b2c3d4e5f6...",
    "user_id": "018d45f0-7b2a-7123-8abc-def012345678",
    "email": "angler@gmail.com",
    "expires_at": "2026-10-12T01:59:54.081349039Z"
  }
}
```

→ Simpan `session_token`, lalu kirim di header `Authorization: Bearer <session_token>` untuk semua request berikutnya (lihat 2.3 & 2.4).

**Error yang mungkin**:

| HTTP | `error.message` | Arti |
| :--- | :--- | :--- |
| `422` | `Validation failed: ...` | `id_token` kosong |
| `401` | `Invalid or expired Google ID token` | Google menolak token. Biasanya yang dikirim `accessToken` / authorization `code`, bukan `idToken`, atau token sudah kedaluwarsa |
| `401` | `Google email is not verified` | Email Google belum terverifikasi |
| `401` | `Google ID token missing subject claim` | Token tidak valid |
| `409` | `OAuth identity already linked` | Race condition — ulangi request sekali |
| `500` | `An internal server error occurred...` | Cek `GET /health/ready` |

> **Tips debug**: pada `401 Invalid or expired Google ID token`, log server menampilkan `status=400 Bad Request` dari Google — artinya Google menolak tokennya. Periksa apakah yang dikirim benar-benar field `idToken` (JWT, bukan `accessToken`), dan pastikan package name + SHA-1 (debug & release) sudah terdaftar di Google Cloud Console.

### 2.3 Cek Session User yang Sedang Login (Mendukung Cookie atau Bearer Token)
Menggunakan Cookie:
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/auth/session" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

Menggunakan Bearer Token (Rekomendasi Android):
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/auth/session" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN_HERE"
```

### 2.4 Logout
```bash
curl -i -X POST "https://api-fishing.janissaryid.com/api/v1/auth/logout" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN_HERE"
```
> **Penting (mobile native)**: sertakan header `Authorization: Bearer <token>` seperti di atas. Tanpa itu, session di server **tidak** akan tercabut. Response `200 OK` dengan body `{"data":{"message":"Successfully logged out"}}`.

---

## 3. Profiles & User Management

### 3.1 Cek Ketersediaan Username
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/users/check-username?username=janissary" \
  -H "Accept: application/json"
```

### 3.2 Dapatkan Profil Saya
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/users/me" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

### 3.3 Update Profil Saya
```bash
curl -X PATCH "https://api-fishing.janissaryid.com/api/v1/users/me" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "username": "angler_pro",
    "display_name": "Janissary Angler",
    "bio": "Saltwater and Freshwater Enthusiast 🎣",
    "home_region": "Jakarta, Indonesia"
  }'
```

### 3.4 Lihat Profil Publik User Lain
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/users/angler_pro" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

---

## 4. Social Graph (Follow & Block)

### 4.1 Follow User
```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/users/angler_pro/follow" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

### 4.2 Unfollow User
```bash
curl -X DELETE "https://api-fishing.janissaryid.com/api/v1/users/angler_pro/follow" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

### 4.3 Block User
```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/users/toxic_user/block" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

---

## 5. Social Posts, Comments & Likes

### 5.1 Dapatkan Home Feed
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/posts/feed?limit=20" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

### 5.2 Buat Postingan Baru
> **Wajib ketiganya**: `content` (caption), `media_ids` (1–10 foto), dan `latitude` + `longitude`.
> `media_ids` harus berasal dari `POST /api/v1/media/upload` milik akun yang sama.

```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/posts" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "content": "Hasil mancing strike Barramundi sore ini di Muara Baru! @angler_pro",
    "media_ids": ["01a093d2-2d57-7da2-aeee-aa7c1c54febd"],
    "latitude": -6.2088,
    "longitude": 106.8456,
    "location_name": "Muara Baru",
    "location_privacy": "APPROXIMATE",
    "privacy": "PUBLIC"
  }'
```

Response `201 Created` menyertakan blok lokasi:
```json
{
  "data": {
    "id": "01a093d2-...",
    "content": "Hasil mancing strike Barramundi sore ini di Muara Baru! @angler_pro",
    "privacy": "PUBLIC",
    "location": {
      "name": "Muara Baru",
      "privacy": "EXACT",
      "coordinates": { "lat": -6.2088, "lng": 106.8456 }
    },
    "media": [
      {
        "id": "01a093d2-...",
        "display_url": "/api/v1/media/01a093d2-.../display",
        "thumbnail_url": "/api/v1/media/01a093d2-.../thumbnail",
        "width": 1080,
        "height": 1080
      }
    ]
  }
}
```

**Error `422`** yang mungkin: `Caption is required for a post`, `At least one photo is required for a post`,
`Location is required for a post`, `Latitude must be a valid number between -90.0 and +90.0 degrees`,
`A post cannot have more than 10 photos`.

> Jika ditautkan ke **fishing spot** dengan privacy `PRIVATE`, blok `location` menjadi
> `{"privacy":"PRIVATE","coordinates":null}` — nama dan koordinat disembunyikan oleh backend.

### 5.3 Like Post
```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/posts/01a04cc5-55df-73e1-a9b0-18c9f2d9dd15/like" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

### 5.4 Tambah Komentar pada Post
```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/posts/01a04cc5-55df-73e1-a9b0-18c9f2d9dd15/comments" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "content": "Mantap tarikannya, pakai umpan apa mas?"
  }'
```

---

## 6. Media Upload

### 6.1 Upload Foto / Media (Multipart)
```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/media/upload" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE" \
  -F "file=@/path/to/foto_ikan.jpg"
```

---

## 7. Locations & Fishing Spots (Geospatial PostGIS)

### 7.1 Cari Spot Terdekat Berdasarkan Koordinat GPS
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/locations/spots?lat=-6.2088&lng=106.8456&radius_km=25" \
  -H "Accept: application/json"
```

### 7.2 Cari Spot Berdasarkan Bounding Box Peta
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/locations/spots?bbox=106.7,-6.3,106.9,-6.1" \
  -H "Accept: application/json"
```

### 7.3 Buat Spot Memancing Baru
```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/locations/spots" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "name": "Dermaga Muara Karang",
    "description": "Spot nyaman untuk mancing malam, target Kakap Putih & Sembilang",
    "water_type": "SALTWATER",
    "lat": -6.1152,
    "lng": 106.7891,
    "privacy": "EXACT"
  }'
```

### 7.4 Tulis Review Spot
```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/locations/spots/01a03cd9-0157-7193-9af7-672ef86878be/reviews" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "rating": 5,
    "content": "Tempat bersih, parkir aman, tarikan ikan rame pas air pasang."
  }'
```

---

## 8. Fishing Logbook & Catches

### 8.1 Daftar Master Spesies Ikan
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/fishing/species" \
  -H "Accept: application/json"
```

### 8.2 Catat Hasil Tangkapan Ikan (Log Catch)
```bash
curl -X POST "https://api-fishing.janissaryid.com/api/v1/fishing/catches" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE" \
  -d '{
    "trip_id": null,
    "species_id": "01a04cc5-55df-73e1-a9b0-18c9f2d9dd15",
    "media_id": "01a093d2-2d57-7da2-aeee-aa7c1c54febd",
    "gear_id": null,
    "weight_kg": 4.25,
    "length_cm": 68.0,
    "bait_or_lure": "Minnow lure 9cm warna silver",
    "caught_at": "2026-09-12T08:30:00Z",
    "notes": "Tertangkap sore hari"
  }'
```
> Catatan: satu catch memakai **satu** `media_id` (bukan array `media_ids`). Field `species_id`/`gear_id`
> memakai UUID — tidak ada `species_name`/`water_type`/`released`.

### 8.3 Statistik Memancing Saya
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/fishing/history/stats" \
  -H "Accept: application/json" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```

---

## 9. Discovery & Search

### 9.1 Pencarian Multi-Entity (Spot, User, Ikan)
```bash
curl -X GET "https://api-fishing.janissaryid.com/api/v1/discovery/search?q=barramundi&type=all&limit=10" \
  -H "Accept: application/json"
```

---

## 10. Realtime Notifications (SSE)

### 10.1 Stream Notifikasi Realtime (Server-Sent Events)
```bash
curl -N -X GET "https://api-fishing.janissaryid.com/api/v1/notifications/stream" \
  -H "Accept: text/event-stream" \
  -H "Cookie: fishing_session=YOUR_SESSION_TOKEN_HERE"
```
