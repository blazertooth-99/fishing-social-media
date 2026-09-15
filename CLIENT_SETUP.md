# Client Setup Guide — Mobile Native · Web Local · Web Production

Satu deployment backend ini melayani **tiga jenis klien sekaligus**. Dokumen ini dipisah per klien
supaya kamu bisa langsung membaca bagian yang relevan tanpa harus memahami semuanya.

> **Baca juga**: [`FRONTEND_API_GUIDE.md`](./FRONTEND_API_GUIDE.md) untuk kontrak endpoint lengkap,
> dan [`CURL_POSTMAN_COLLECTION.md`](./CURL_POSTMAN_COLLECTION.md) untuk contoh `curl` siap import.

> ## ⚠️ Sebelum menulis DTO di frontend
>
> Bentuk response di `FRONTEND_API_GUIDE.md` §15 sudah diverifikasi terhadap struct DTO di
> `src/modules/*/dtos.rs`. Aturan yang paling sering bikin bug deserialisasi:
>
> 1. Field = **`snake_case` datar** (bukan `camelCase`), mis. `user_id` — **bukan** `id`.
> 2. Post memakai `author_id` / `author_username` / `author_display_name` / `author_avatar_media_id`
>    (**bukan** objek `author` bersarang). Pengecualian: hasil `/discovery/*` memang bersarang.
> 3. `like_count` / `comment_count` — **bukan** `likes_count` / `comments_count`.
> 4. Koordinat: `lat` / `lng` — **bukan** `latitude` / `longitude`.
> 5. **Post wajib** punya `content` (caption 1–1000), `media_ids` (**1–10 foto**), dan
>    `latitude`/`longitude`. Lokasi & privasinya ditentukan **saat posting** dan **tidak bisa diedit**.
>    `location_privacy` default **`APPROXIMATE`** (koordinat di-jitter 2 km) — kirim `EXACT` bila user
>    memang mau presisi. Semua `DELETE` mengembalikan **`200 OK`**.
> 6. Render blok `location` pada kartu post; bila `privacy: "PRIVATE"` tampilkan "Lokasi privat"
>    tanpa nama & peta; bila `location: null` (post lama) sembunyikan baris lokasi.
> 7. Community post bergaya grup Facebook — foto & lokasi **opsional** (boleh teks-saja).
> 8. Aktifkan `ignoreUnknownKeys = true` (Ktor) / `extra="ignore"` (Pydantic) agar field baru
>    di backend tidak mematahkan parsing.

---

## 0. Ringkasan cepat

| | Mobile Native (Android/iOS) | Web Local (dev) | Web Production |
| :--- | :--- | :--- | :--- |
| **Otentikasi** | `Authorization: Bearer <token>` | Cookie `fishing_session` | Cookie `fishing_session` |
| **Endpoint login** | `POST /api/v1/auth/google/verify` | `GET /api/v1/auth/google?redirect_to=...` | `GET /api/v1/auth/google?redirect_to=...` |
| **Kirim `id_token` dari app?** | Ya (Google Credential Manager) | Tidak (redirect ke Google) | Tidak (redirect ke Google) |
| **Butuh CORS?** | Tidak | Ya | Ya |
| **Butuh `redirect_to`?** | Tidak | Ya | Ya |
| **Butuh `CookieJar`?** | Tidak | Ya (browser otomatis) | Ya (browser otomatis) |
| **Perlu daftar di Google Console?** | Ya (client ID Android + SHA-1) | Ya (callback localhost) | Ya (callback produksi) |

**Aturan penting**: jangan pernah memakai browser redirect atau embedded WebView untuk app native.
Google memblokir OAuth di WebView, dan redirect browser tidak membawa token ke app.

---

## 1. Environment variable yang relevan

| Variable | Fungsi | Contoh |
| :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Kredensial OAuth Google | `...apps.googleusercontent.com` |
| `GOOGLE_REDIRECT_URI` | Callback **default** (fallback) | `https://api.example.com/api/v1/auth/google/callback` |
| `OAUTH_CALLBACK_BASES` | Daftar base URL tempat API diakses. Callback ditentukan **per-request** | `http://localhost:3067,https://api.example.com` |
| `ALLOWED_FRONTEND_REDIRECTS` | URL frontend yang boleh dipakai sebagai `?redirect_to=` | `http://localhost:5173,https://app.example.com,myfishingapp://auth/callback` |
| `FRONTEND_REDIRECT_URL` | Target redirect default (selalu diizinkan) | `https://app.example.com` |
| `CORS_ALLOWED_ORIGINS` | Origin yang boleh mengirim credentialed request | `http://localhost:5173,https://app.example.com` |
| `COOKIE_SECURE` | Set flag `Secure` pada cookie | `true` (prod) / `false` (dev via IP) |
| `SESSION_TTL_SECS` | Umur session | `2592000` (30 hari) |

**Cara kerja `OAUTH_CALLBACK_BASES`**: saat klien memanggil `GET /api/v1/auth/google`, backend
membaca header `Host` + `x-forwarded-proto`, lalu mencari base yang cocok. Jadi
`http://localhost:3067` → callback `http://localhost:3067/api/v1/auth/google/callback`, sedangkan
`https://api.example.com` → callback `https://api.example.com/api/v1/auth/google/callback`.

**Setiap base WAJIB juga didaftarkan di Google Cloud Console** sebagai *Authorized redirect URI*.
Host yang tidak ada di daftar akan jatuh ke `GOOGLE_REDIRECT_URI` (perilaku default).

> Catatan: daftar diparsing dengan trim dan **trailing slash dibuang**. Jadi tulis
> `http://localhost:5173` (tanpa `/` di akhir) di env — dan kirim string yang persis sama di `redirect_to`.

---

## 2. 📱 MOBILE NATIVE (Android / iOS)

**Tidak butuh CORS, tidak butuh `redirect_to`, tidak butuh cookie.** Cukup Bearer token.

### 2.1 Prasyarat — Google Cloud Console

1. Buat **OAuth Client ID bertipe Android**:
   - *Package name*: mis. `com.janissary.fishing`
   - *SHA-1*: dari `./gradlew signingReport` (daftarkan SHA-1 **debug** dan **release / Play App Signing**)
2. Buat **OAuth Client ID bertipe Web**, dipakai sebagai `serverClientId` di Credential Manager.
3. Aktifkan Google Sign-In API.

### 2.2 Langkah integrasi

```text
1. Google Sign-In SDK / Credential Manager -> ambil `idToken` (JWT)
   ⚠️ field `idToken`, BUKAN `accessToken`. Kirim LANGSUNG (umur token ±1 jam)
        ↓
2. POST /api/v1/auth/google/verify
   { "id_token": "<google_id_token>" }
        ↓
3. Terima 200 OK:
   { "data": { "session_token": "...", "user_id": "...", "email": "...", "expires_at": "..." } }
        ↓
4. Simpan `session_token` di EncryptedSharedPreferences / Keychain
        ↓
5. Semua request berikutnya:
   Authorization: Bearer <session_token>
```

### 2.3 Endpoint yang dipakai

| Endpoint | Fungsi |
| :--- | :--- |
| `POST /api/v1/auth/google/verify` | Login (tukar `id_token` → `session_token`) |
| `GET /api/v1/auth/session` | Boot check (`200` = masih login, `401` = login ulang) |
| `POST /api/v1/auth/logout` | Logout — **wajib kirim header Bearer** agar session tercabut di server |

### 2.4 Checklist native

- [ ] Ambil `idToken` (bukan `accessToken`), kirim langsung ke `/auth/google/verify`
- [ ] Simpan `session_token` di penyimpanan terenkripsi (bukan `SharedPreferences` biasa)
- [ ] Interceptor OkHttp menambahkan `Authorization: Bearer <token>` ke **semua** request
- [ ] Interceptor `401` → hapus token lokal + arahkan ke layar login
- [ ] Boot check `GET /auth/session` saat app dibuka
- [ ] `POST /auth/logout` dikirim dengan header Bearer
- [ ] Package name + SHA-1 (debug & release) terdaftar di Google Console
- [ ] Tidak memakai WebView / browser redirect untuk OAuth

### 2.5 Troubleshooting native

| Gejala | Penyebab | Solusi |
| :--- | :--- | :--- |
| `401 Invalid or expired Google ID token` | Google menolak token (log server: `status=400`). Biasanya yang dikirim `accessToken`/`code` | Pastikan field `idToken` (JWT), kirim langsung tanpa cache |
| `401 Google email is not verified` | Email Google belum terverifikasi | Gunakan akun dengan email terverifikasi |
| `401 Google ID token missing subject claim` | Token tidak valid | Ulangi sign-in |
| `409 OAuth identity already linked` | Dua request login bersamaan | Ulangi request sekali |
| `500` + `An internal server error` | Cek `GET /health/ready` | Biasanya DB tidak terhubung |
| Logout sukses tapi token lama masih bisa dipakai | Header `Authorization` tidak dikirim saat logout | Kirim Bearer di `/auth/logout` |

---

## 3. 💻 WEB LOCAL (localhost / development)

Butuh **CORS** (browser mengirim cookie lintas port) dan **`redirect_to`** (agar kembali ke dev server,
bukan ke domain API).

### 3.1 Set `.env`

```env
# Cukup tambahkan/ubah ini. GOOGLE_REDIRECT_URI tidak perlu diubah —
# ia hanya fallback, dan request ke host publik tetap memakai callback produksi.
OAUTH_CALLBACK_BASES=http://localhost:3067,https://api-fishing.janissaryid.com
ALLOWED_FRONTEND_REDIRECTS=http://localhost:5173,http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
COOKIE_SECURE=true
```

Sesuaikan port dev server kamu (`5173` = Vite, `3000` = Next/CRA).
Jika kamu mengakses lewat **IP LAN** (misal untuk tes dari HP), set `COOKIE_SECURE=false` karena
cookie `Secure` tidak bisa di-set di `http://192.168.x.x`.

Setelah mengubah `.env`:
```bash
docker compose up -d app     # tanpa build, ini hanya env
```

### 3.2 Daftarkan callback di Google Cloud Console

Buka **Credentials → OAuth 2.0 Client ID (tipe Web)** milikmu, lalu:

| Kotak di Google Console | Isi | Catatan |
| :--- | :--- | :--- |
| **Authorized JavaScript origins** | *(tidak wajib)* | Hanya untuk Google JS SDK di browser (`gsi/client`). Flow kita redirect sisi server, jadi tidak dipakai |
| **Authorized redirect URIs** | `https://api-fishing.janissaryid.com/api/v1/auth/google/callback` | Produksi (sudah ada) |
| **Authorized redirect URIs** | `http://localhost:3067/api/v1/auth/google/callback` | Tambahkan untuk dev |

⚠️ Detail yang sering bikin gagal:

- Port-nya **`3067`** (port host), **bukan `3000`** (port di dalam container).
- Harus `http://`, **bukan** `https://` untuk localhost.
- Tanpa trailing slash, dan string-nya harus **persis** — Google mencocokkan karakter per karakter
  (`redirect_uri_mismatch` kalau beda satu huruf).

Verifikasi setelah disimpan:
```bash
curl -s -o /dev/null -D - "http://localhost:3067/api/v1/auth/google" | grep -io "redirect_uri=[^&]*"
# harus muncul: redirect_uri=http%3A%2F%2Flocalhost%3A3067%2Fapi%2Fv1%2Fauth%2Fgoogle%2Fcallback
```

Kenapa dua-duanya perlu: backend menentukan `redirect_uri` **per-request** dari header `Host`.
Dari `localhost:3067` ia memakai callback localhost; dari domain publik ia memakai callback produksi
(lihat `OAUTH_CALLBACK_BASES` di §1).

### 3.3 Pilih cara akses API dari dev server

| Cara | Perlu ubah backend? | Rekomendasi |
| :--- | :--- | :--- |
| **Proxy same-origin** (Vite/Next `/api` → `http://localhost:3067`) | Tidak | ✅ Paling bersih, tidak ada CORS sama sekali |
| **Call langsung** `http://localhost:3067` | Tidak (sudah dikonfigurasi) | Perlu `CORS_ALLOWED_ORIGINS` + `credentials: "include"` |

Contoh Vite (`vite.config.js`):
```js
server: {
  proxy: { '/api': { target: 'http://localhost:3067', changeOrigin: false } }
}
```

Jika memilih **call langsung**, pastikan HTTP client mengirim credentials:
```js
fetch('http://localhost:3067/api/v1/auth/session', { credentials: 'include' });
// Axios: withCredentials: true
```

### 3.4 Alur login web

```text
1. User klik "Login dengan Google"
        ↓
2. Browser diarahkan (top-level navigation) ke:
   http://localhost:3067/api/v1/auth/google?redirect_to=http://localhost:5173
        ↓
3. Backend set cookie oauth_state + oauth_redirect, lalu 307 redirect ke Google
   (redirect_uri otomatis = http://localhost:3067/api/v1/auth/google/callback)
        ↓
4. User pilih akun Google
        ↓
5. Google redirect ke callback backend
        ↓
6a. SUKSES -> 303 ke http://localhost:5173  (+ cookie fishing_session)
6b. GAGAL  -> 303 ke http://localhost:5173?auth_error=<kode>
```

Tampilkan pesan error di halaman tujuan, lalu bersihkan param-nya:

```js
// di root halaman / halaman callback
const params = new URLSearchParams(location.search);
const err = params.get('auth_error');
if (err) {
  const messages = {
    access_denied: 'Login dibatalkan',
    missing_code: 'Login gagal, coba lagi',
    missing_state: 'Login gagal, coba lagi',
    unauthorized: 'Sesi login tidak valid, coba lagi',
    forbidden: 'Akun tidak aktif',
    invalid_request: 'Permintaan tidak valid',
    server_error: 'Terjadi gangguan, coba lagi nanti',
  };
  showError(messages[err] ?? 'Login gagal');
  history.replaceState({}, '', location.pathname);
}

// verifikasi session setelah login
await fetch('http://localhost:3067/api/v1/auth/session', { credentials: 'include' });
```

### 3.5 Checklist web local

- [ ] `redirect_to` dikirim saat memulai login (persis sama dengan entry di `ALLOWED_FRONTEND_REDIRECTS`)
- [ ] Login memakai **top-level navigation** (bukan fetch/XHR)
- [ ] `CORS_ALLOWED_ORIGINS` memuat origin dev server
- [ ] `OAUTH_CALLBACK_BASES` memuat `http://localhost:3067`
- [ ] Callback `http://localhost:3067/...` terdaftar di Google Cloud Console
- [ ] `credentials: "include"` / `withCredentials: true`
- [ ] Halaman tujuan membaca `?auth_error=` lalu membersihkannya dari URL
- [ ] `POST /auth/logout` dipanggil untuk mengakhiri sesi

### 3.6 Troubleshooting web local

| Gejala | Penyebab | Solusi |
| :--- | :--- | :--- |
| `422 Validation failed: redirect_to is not an allowed frontend redirect` | `redirect_to` tidak ada di allowlist, atau beda trailing slash | Samakan persis dengan `ALLOWED_FRONTEND_REDIRECTS` |
| Redirect mendarat di `api-fishing.janissaryid.com` (404) | `redirect_to` tidak dikirim | Kirim `?redirect_to=http://localhost:5173` |
| `auth_error=unauthorized` saat callback | Cookie `oauth_state` tidak terkirim — biasanya Host callback ≠ Host saat mulai login | Pastikan mulai dan callback sama-sama `localhost:3067` |
| Browser blokir response: *"Access-Control-Allow-Origin must not be '*'"* | Origin dev tidak ada di `CORS_ALLOWED_ORIGINS` | Tambahkan, atau pakai proxy same-origin |
| Cookie tidak tersimpan | `COOKIE_SECURE=true` diakses lewat IP LAN | Set `COOKIE_SECURE=false` |
| `500` + `An internal server error` | Cek `GET /health/ready` | Biasanya DB tidak terhubung |

---

## 4. 🌐 WEB PRODUCTION

### 4.1 Set `.env`

```env
GOOGLE_REDIRECT_URI=https://api-fishing.janissaryid.com/api/v1/auth/google/callback
OAUTH_CALLBACK_BASES=https://api-fishing.janissaryid.com
ALLOWED_FRONTEND_REDIRECTS=https://app-fishing.janissaryid.com
FRONTEND_REDIRECT_URL=https://app-fishing.janissaryid.com
CORS_ALLOWED_ORIGINS=https://app-fishing.janissaryid.com
COOKIE_SECURE=true
```

Ganti `app-fishing.janissaryid.com` dengan domain web app kamu yang sebenarnya.

### 4.2 Google Cloud Console

Pastikan *Authorized redirect URIs* memuat:
```
https://api-fishing.janissaryid.com/api/v1/auth/google/callback
```

### 4.3 Checklist web production

- [ ] `COOKIE_SECURE=true` (API harus diakses via HTTPS)
- [ ] `CORS_ALLOWED_ORIGINS` berisi domain web app (bukan `*`)
- [ ] `ALLOWED_FRONTEND_REDIRECTS` berisi domain web app
- [ ] `redirect_to` dikirim saat memulai login
- [ ] Halaman tujuan membaca `?auth_error=`
- [ ] `x-forwarded-proto: https` diteruskan oleh reverse proxy / Cloudflare (dibutuhkan agar callback terdeteksi HTTPS)
- [ ] Logout memakai `POST /auth/logout`

### 4.4 Troubleshooting web production

| Gejala | Penyebab | Solusi |
| :--- | :--- | :--- |
| `redirect_uri_mismatch` dari Google | `x-forwarded-proto` / `Host` salah diteruskan proxy | Set `x-forwarded-proto: https` dan `Host` yang benar di proxy |
| Cookie tidak terkirim | Domain app dan API beda **registrable domain** (mis. `*.vercel.app`) | Tempatkan web app di subdomain yang sama, atau ubah cookie ke `SameSite=None; Secure` |
| CORS gagal | Origin tidak terdaftar | Tambahkan ke `CORS_ALLOWED_ORIGINS` (tanpa trailing slash) |

---

## 5. Tabel troubleshooting gabungan

| HTTP | `error.code` | Arti umum |
| :--- | :--- | :--- |
| `401` | `UNAUTHENTICATED` | Token/cookie tidak ada, kedaluwarsa, atau tidak valid |
| `403` | `FORBIDDEN` | Akun suspended / tidak punya hak |
| `409` | `RESOURCE_CONFLICT` | Identity Google sudah ter-link (race saat login ganda) |
| `422` | `VALIDATION_FAILED` | Payload/query tidak valid (mis. `redirect_to` tidak diizinkan) |
| `429` | `RATE_LIMIT_EXCEEDED` | Terlalu banyak request. Limit: auth 10/menit, upload 20/menit, search 60/menit, API umum 180/menit |
| `500` | `INTERNAL_SERVER_ERROR` | Gangguan server — **cek dulu `GET /health/ready`** |

> Pesan `500` selalu generik (`An internal server error occurred. Please try again later.`) demi
> keamanan. Detail sebenarnya hanya ada di log server: `docker logs fishing_app`.

---

## 6. Ringkasan limit rate

| Kategori path | Limit per menit |
| :--- | :--- |
| `/api/v1/auth/*` | 10 |
| `/api/v1/media/upload` | 20 |
| `/api/v1/reports` | 10 |
| `/api/v1/discovery/*`, `/api/v1/search/*` | 60 |
| `/api/v1/*` lainnya | 180 |

Rate limit dihitung per **session** (cookie atau Bearer) bila tersedia; jika tidak, per alamat IP.
Karena itu app native yang sudah login tidak akan saling memakan kuota meski berada di belakang NAT operator.
