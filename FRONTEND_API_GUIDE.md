# Frontend API Guide

Documentation Status: Current  
API Version: `v1` (`/api/v1`)  
Last Verified Commit: Not available (Local Workspace)  
Runtime Target: REST over HTTPS | Server-Sent Events (SSE) | Session Cookie Auth  

> ## ⚠️ Baca ini dulu sebelum menulis DTO
>
> Semua bentuk response di §15 sudah **diverifikasi langsung terhadap struct DTO di
> `src/modules/*/dtos.rs`** (audit 2026-09-12). Bila ada perbedaan antara dokumen ini dan
> kode, **kode-nya yang benar** — DTO Rust adalah sumber kebenaran.
>
> Aturan yang paling sering bikin bug:
> 1. Field memakai **`snake_case` datar**, bukan `camelCase`.
> 2. **Tidak ada objek bersarang** pada endpoint normal — mis. post memakai `author_id`,
>    `author_username`, `author_display_name`, `author_avatar_media_id`; profil memakai `user_id`.
>    **Pengecualian**: hasil `/discovery/*` memakai objek `author` bersarang — lihat §15 Search & Discovery.
> 3. Hitungan like/komentar: `like_count` / `comment_count` (bukan `likes_count` / `comments_count`).
> 4. Koordinat: `lat` / `lng` (bukan `latitude` / `longitude`), kecuali di hasil pencarian.
> 5. **Post wajib punya caption, minimal 1 foto, dan lokasi GPS** — lihat "Create Post".
> 6. **Semua endpoint `DELETE` mengembalikan `200 OK` + `{"data":{"message":"..."}}`** — tidak ada `204 No Content`.
> 7. Endpoint ber-paginasi memakai envelope `{"data":[...], "pagination":{...}}`.
>
> Untuk klien ber-tipe ketat (Kotlin `@Serializable`, TypeScript), set juga
> `ignoreUnknownKeys = true` agar penambahan field baru di backend tidak mematahkan deserialisasi.

---

## 1. Overview

The **FishingBackend API** is a high-performance REST API designed to power modern client applications across Web (Vue, React, Svelte), Mobile (Flutter, React Native, iOS, Android), and third-party integrations.

### Core Backend Capabilities
- **Identity & Session Management**: Google OAuth 2.0 (state-based CSRF) + server-side session cookies (`fishing_session`), user profiles, account deletion, and blocking.
- **Social Graph & Feeds**: Micro-posts (with WebP images), 1-level nested comments, idempotent likes, user follows, `@username` mentions, and reverse-chronological feeds.
- **Fishing Logbook**: Fishing trips, multi-angler session logs, biological catch records (species, weight, length, tackle, notes), personal catch library, personal tackle/gear library, and fishing history statistics.
- **Location & Discovery**: Natural fishing spots with 3-tier privacy (`EXACT`, `APPROXIMATE`, `PRIVATE`), commercial pay-to-fish venue directory (hours, amenities, WhatsApp click-to-chat links), 1–5 star reviews, MapLibre bounding box queries, and multi-entity trigram full-text search.
- **Community & Events**: Interest groups with RBAC (`OWNER`, `ADMIN`, `MODERATOR`, `MEMBER`), event announcements with outbound registration links, and venue/gear promotion links.
- **Realtime Notifications**: Server-Sent Events (SSE) push stream for live in-app alerts.

---

## 2. Base URL

All business and data endpoints are mounted under the `/api/v1` prefix.

| Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Cloudflare Public Tunnel** | `https://api-fishing.janissaryid.com/api/v1` | Public HTTPS endpoint (Cloudflare Tunnel) |
| **Local Host** | `http://localhost:3067/api/v1` | Direct connection on host machine |
| **Android Emulator** | `http://10.0.2.2:3067/api/v1` | Special loopback alias for Android Studio emulator |
| **Android Device (LAN/Wi-Fi)**| `http://192.168.1.5:3067/api/v1` | Local Wi-Fi network address |

Operational Probes (unversioned):
- Process Liveness: `GET /health/live` (or `GET /health`)
- Service Readiness: `GET /health/ready`
- Prometheus Metrics: `GET /metrics` (or `GET /api/v1/metrics`)

---

## 3. Environments & Mobile (Android) Client Setup

> 📘 **Panduan setup per environment** (mobile native / web local / web production) ada di
> **[`CLIENT_SETUP.md`](./CLIENT_SETUP.md)** — lengkap dengan env var, checklist, dan troubleshooting.
> Bagian di bawah ini hanya ringkasan.

When configuring your HTTP client (Web, Android Kotlin/Retrofit, Flutter Dio, React Native):
1. **Base URL**: Use `https://api-fishing.janissaryid.com/api/v1` for remote testing or `http://10.0.2.2:3067/api/v1` for emulator.
2. **Transport otentikasi (pilih sesuai platform)**:
   - **Native mobile (Android/iOS)** → kirim `Authorization: Bearer <session_token>` di **setiap** request.
     `session_token` didapat dari `POST /api/v1/auth/google/verify` dan disimpan di `EncryptedSharedPreferences` (Android) / Keychain (iOS). **Tidak perlu `CookieJar`.**
   - **Web browser** → pakai cookie `fishing_session` (`HttpOnly; SameSite=Lax`) dengan `credentials: "include"` (fetch) / `withCredentials: true` (Axios).
3. **⚠️ Penting untuk Android**: jangan pakai browser redirect (`GET /api/v1/auth/google`) atau embedded WebView.
   - Google **memblokir** OAuth di embedded WebView.
   - Redirect browser **tidak membawa token** ke app, sehingga app tidak akan pernah mendapat session.
   - Gunakan flow native (bagian 5B) — itu sebabnya endpoint `/auth/google/verify` ada.

> Kedua transport didukung di **semua** endpoint, termasuk resolusi user opsional (flag `is_liked`, `is_following`, proyeksi privasi) dan `POST /auth/logout`.


---

## 4. API Versioning

- Versioning is embedded in the URL path: `/api/v1/...`.
- Non-breaking changes (adding optional fields to response objects) occur within `v1`.
- Breaking changes (removing fields, altering required query/body fields, modifying status code semantics) will be introduced under a new version path (`/api/v2`).

---

## 5. Authentication

Authentication supports both **Browser Google OAuth 2.0 (state-based CSRF)** for Web and **Native Google Sign-In (ID Token Verification)** for Android/iOS mobile apps, paired with **Server-Side PostgreSQL Sessions**.

### A. Web / Browser Authentication Flow (OAuth 2.0 + `state` CSRF Protection)

> **Catatan implementasi**: flow ini **tidak memakai PKCE** (tidak ada `code_challenge`/`code_verifier`). Proteksi CSRF memakai parameter `state` acak 32-byte yang divalidasi terhadap cookie `oauth_state` (`HttpOnly; SameSite=Lax; Max-Age=600`).

```text
1. User clicks "Login with Google" on Web
   ↓
2. Frontend directs browser to:
   GET /api/v1/auth/google?redirect_to=<url-frontend>
   (harus top-level navigation, bukan fetch/XHR)
   `redirect_to` wajib terdaftar di `ALLOWED_FRONTEND_REDIRECTS`
   ↓
3. Backend sets oauth_state + oauth_redirect cookie, responds 307 Temporary Redirect ke Google.
   `redirect_uri` ditentukan per-request dari header Host (lihat `OAUTH_CALLBACK_BASES`)
   ↓
4. User authenticates with Google
   ↓
5. Google redirects to GET /api/v1/auth/google/callback?code=...&state=...
   ↓
6a. SUKSES
    Backend verifies state, exchanges code, issues/finds User, creates hashed session in PostgreSQL
    Backend sets HTTP cookie: fishing_session=<token>; HttpOnly; SameSite=Lax; Secure; Path=/
    Backend responds 303 See Other -> Location: <redirect_to> (atau FRONTEND_REDIRECT_URL)
    ↓
    Frontend calls GET /api/v1/auth/session atau GET /api/v1/users/me untuk verifikasi session
   ↓
6b. GAGAL (state invalid, user menolak consent, code/state hilang, DB down, dll.)
    Backend TIDAK PERNAH membalas JSON error ke browser pada flow ini.
    Backend responds 303 See Other -> Location: <target>?auth_error=<code>
    ↓
    Frontend membaca query param `auth_error` dan menampilkan pesan yang sesuai
```

**Nilai `auth_error` yang mungkin:**

| `auth_error` | Arti | Saran aksi frontend |
| :--- | :--- | :--- |
| `access_denied` | User menutup consent screen / provider menolak | Tampilkan "Login dibatalkan" + tombol coba lagi |
| `missing_code` | Callback tidak membawa `code` | Mulai login ulang |
| `missing_state` | Callback tidak membawa `state` | Mulai login ulang |
| `unauthorized` | `state` tidak cocok (indikasi CSRF) atau code/token invalid/expired | Bersihkan state, mulai login baru |
| `forbidden` | Akun tidak aktif / suspended | Tampilkan pesan akun diblokir |
| `invalid_request` | Validasi request gagal | Tampilkan error umum |
| `server_error` | Database tidak tersedia / gangguan internal | Tampilkan "coba lagi nanti" + tombol retry |

> ⚠️ **Konfigurasi**: frontend sebaiknya selalu mengirim `redirect_to`, dan nilainya harus terdaftar di
> `ALLOWED_FRONTEND_REDIRECTS`. Bila `redirect_to` tidak dikirim, backend memakai `FRONTEND_REDIRECT_URL`
> sebagai fallback. Detail lengkap: [`CLIENT_SETUP.md`](./CLIENT_SETUP.md).

### B. Mobile Native Authentication Flow (Google Credential Manager) — **WAJIB untuk Android**

> Ini satu-satunya flow yang didukung untuk app native. Flow browser (5A) **tidak bisa** dipakai, karena redirect-nya tidak menyerahkan token apa pun ke app.

#### B.1 Prasyarat — Google Cloud Console

1. Buat **OAuth Client ID bertipe Android**:
   - *Package name*: package app kamu (mis. `com.janissary.fishing`)
   - *SHA-1 fingerprint*: ambil dengan `./gradlew signingReport` (daftarkan SHA-1 debug **dan** release/Play App Signing)
2. Buat **OAuth Client ID bertipe Web** dan pakai ID-nya sebagai `serverClientId` di Credential Manager.
3. Aktifkan Google Sign-In API pada project tersebut.

#### B.2 Alur

```text
1. App panggil Google Credential Manager / Google Sign-In SDK
   (bottom sheet native, TIDAK ada browser)
   ↓
2. User pilih akun Google
   ↓
3. App terima Google `idToken` (JWT) dari hasil sign-in
   ↓
4. App LANGSUNG kirim ke backend (jangan di-cache — umur token ±1 jam):
   POST /api/v1/auth/google/verify
   Content-Type: application/json
   { "id_token": "<google_id_token>" }
   ↓
5. Backend verifikasi token ke Google (tokeninfo), lalu:
   - cari AuthIdentity (provider = GOOGLE, provider_user_id = `sub`)
   - jika belum ada -> buat User + Profile default (username `angler_<random>`)
   - buat session server-side (hash SHA-256) di PostgreSQL
   ↓
6. Backend balas 200 OK (lihat B.3)
   ↓
7. App simpan `session_token` di EncryptedSharedPreferences / Keychain
   ↓
8. Semua request berikutnya kirim: Authorization: Bearer <session_token>
```

#### B.3 Response sukses `200 OK`

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

Header `Set-Cookie: fishing_session=...` juga dikirim, tapi **abaikan saja** untuk native.

#### B.4 Handling error

| HTTP | `error.code` | Penyebab | Aksi app |
| :--- | :--- | :--- | :--- |
| `422` | `VALIDATION_FAILED` | `id_token` kosong | Bug di app — pastikan field terisi |
| `401` | `UNAUTHENTICATED` | `Invalid or expired Google ID token` — Google membalas `400` | Ambil ulang `idToken` dari Google Sign-In dan kirim **langsung** |
| `401` | `UNAUTHENTICATED` | `Google email is not verified` | Tampilkan pesan akun tidak memenuhi syarat |
| `401` | `UNAUTHENTICATED` | `Google ID token missing subject claim` | Token tidak valid — ulangi sign-in |
| `409` | `RESOURCE_CONFLICT` | `OAuth identity already linked` (race) | Ulangi request sekali |
| `500` | `INTERNAL_SERVER_ERROR` | DB tidak tersedia / gangguan server | Cek `GET /health/ready`, tampilkan tombol retry |

**Penyebab paling umum `401`:**
- Yang dikirim `accessToken`, bukan `idToken`
- Yang dikirim authorization `code`, bukan JWT
- Token sudah kedaluwarsa sebelum sampai server
- Package name / SHA-1 belum terdaftar, sehingga Google menganggap token tidak valid

> **Catatan audience**: backend **tidak** menolak token hanya karena `aud` berbeda — mismatch `aud` cuma dicatat sebagai warning di log. Jadi kalau dapat `401`, tokennya memang ditolak Google, bukan masalah audience.

#### B.5 Endpoint pendukung native

| Endpoint | Fungsi | Auth |
| :--- | :--- | :--- |
| `GET /api/v1/auth/session` | Cek session saat app boot. `200` → masih login; `401` → paksa login ulang | Bearer |
| `POST /api/v1/auth/logout` | Cabut session di server | Bearer |

#### B.6 Masa berlaku & kedaluwarsa session

- `expires_at` = sekarang + `SESSION_TTL_SECS` (default **30 hari**).
- Simpan `expires_at`; kalau sudah lewat, jangan kirim token — langsung login ulang.
- Kalau endpoint mana pun membalas `401 UNAUTHENTICATED`, hapus token tersimpan dan tampilkan layar login.

---

## 6. Session, Cookies & Bearer Tokens

- **Supported Auth Headers / Transport (Dual Support)**:
  1. **HTTP Cookie**: `fishing_session=<token>` (`HttpOnly; SameSite=Lax; Secure; Path=/`)
  2. **HTTP Authorization Header**: `Authorization: Bearer <session_token>`
- **Cookie & Token Lifespan**: `2592000` seconds (30 days).
- **Client Configuration**:
  - **Web**: Use credentials mode (`credentials: "include"` in fetch, `withCredentials: true` in Axios).
  - **Android / Mobile**: Send `Authorization: Bearer <session_token>` via an OkHttp Interceptor. `CookieJar` **tidak diperlukan** — Bearer didukung di seluruh endpoint, termasuk yang memakai resolusi user opsional (flag `is_liked` / `is_following`, proyeksi privasi) dan `POST /auth/logout`.
- **Revoking a session**: `POST /api/v1/auth/logout` menghapus session di server. Untuk native, pastikan token dikirim di header `Authorization`, jika tidak maka session di server tidak akan tercabut.

---

## 7. Request Format

- **JSON Requests**:
  - Header: `Content-Type: application/json`
  - Header: `Accept: application/json`
- **Multipart Uploads** (Media):
  - Do **NOT** manually set `Content-Type` in browser JavaScript; let `FormData` set the boundary automatically.
- **Date/Time Strings**:
  - Format: ISO 8601 / RFC 3339 UTC strings (e.g. `2026-08-29T12:00:00Z`).
- **Identifiers**:
  - Format: Standard 36-character hyphenated UUID strings (e.g. `018d45f0-7b2a-7123-8abc-def012345678`).

---

## 8. Response Format

All responses strictly conform to standardized JSON envelope conventions:

### Single Resource Envelope
```json
{
  "data": {
    "id": "018d45f0-7b2a-7123-8abc-def012345678",
    "username": "angler_bob",
    "display_name": "Bob Fishing"
  }
}
```

### Paginated Collection Envelope
```json
{
  "data": [
    {
      "id": "018d45f0-...",
      "content": "Landed a monster bass today!"
    }
  ],
  "pagination": {
    "next_cursor": "eyJjcmVhdGVkX2F0IjoiMjAyNi0wOC0yOVQxMTo0ODo1MloiLCJpZCI6IjAxOGQ0NWYwLTdiMmEtNzEyMy04YWJjLWRlZjAxMjM0NTY3OCJ9",
    "has_more": true,
    "limit": 20
  }
}
```

---

## 9. Error Format

When an API request fails, the server responds with a uniform error payload:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid input parameters",
    "request_id": "018d45f0-7b2a-7123-8abc-def012345678",
    "details": [
      {
        "field": "weight_kg",
        "issue": "Weight must be greater than 0"
      }
    ]
  }
}
```

### Error Fields
- `code` (string): Machine-readable uppercase error string (e.g. `UNAUTHENTICATED`, `VALIDATION_FAILED`, `RESOURCE_NOT_FOUND`, `RESOURCE_CONFLICT`, `FORBIDDEN`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_SERVER_ERROR`).
- `message` (string): Human-readable descriptive message safe for logging or UI display.
- `details` (array of objects, optional): Field-specific validation issues containing `field` and `issue`.

> ⚠️ **`request_id` di dalam body saat ini SELALU kosong** (field-nya di-omit). Untuk korelasi
> log/tracing, baca header respons **`x-request-id`** — header itu selalu dikirim dan nilainya
> cocok dengan log server.

**Catatan status**: `400` dan `422` sama-sama memetakan ke `code: "VALIDATION_FAILED"`.
Jangan mengandalkan status code saja — baca `error.code`.

---

## 10. HTTP Status Codes

| Status Code | Code String | Meaning | Frontend Action |
| :--- | :--- | :--- | :--- |
| **`200 OK`** | — | Request succeeded; response contains `data` atau collection. **Termasuk semua operasi delete/unlike/unfollow** yang mengembalikan `{"data":{"message":...}}` atau objek status. | Process response data. |
| **`201 Created`** | — | Resource successfully created (post, catch, trip, gear, spot, place, review, community, join community, event, report). | Add created item to local state / navigate to resource. |
| **`400 Bad Request`** | `VALIDATION_FAILED` | Malformed JSON or syntax issue. | Check client request parameters. |
| **`401 Unauthorized`** | `UNAUTHENTICATED` | Missing, expired, or invalid session cookie / Bearer token. | Clear local auth state; redirect to login atau mulai Google OAuth. |
| **`403 Forbidden`** | `FORBIDDEN` | Valid session, but user lacks permission or account is suspended. | Display permission denied / access restricted error. |
| **`404 Not Found`** | `RESOURCE_NOT_FOUND` | Requested entity does not exist or was soft-deleted. | Show 404 screen or remove item from feed. |
| **`409 Conflict`** | `RESOURCE_CONFLICT` | Unique constraint violation (e.g. username taken, duplicate join, OAuth identity sudah ter-link). | Prompt user to choose a different value, atau ulangi request sekali. |
| **`422 Unprocessable Entity`** | `VALIDATION_FAILED` | Semantic validation failed on fields. | Display inline errors from `error.details`. |
| **`429 Too Many Requests`** | `RATE_LIMIT_EXCEEDED` | Request rate limit exceeded. | Display rate limit warning and throttle retries. |
| **`500 Internal Server Error`** | `INTERNAL_SERVER_ERROR` | Unexpected server-side fault. | Display generic friendly error message with retry option. |

---

## 11. Pagination

All lists and feed endpoints use **Keyset Cursor Pagination**.

### Query Parameters
- `limit` (optional integer): Number of records to return (Default: `20`, Min: `1`, Max: `50`).
- `cursor` (optional string): Opaque cursor string returned from the previous page's `pagination.next_cursor`.

### Rules for Frontend Developers
1. **Opaque Cursors**: The frontend must treat `cursor` as an opaque token. Never parse, edit, or manually construct cursor strings.
2. **End of List**: When `pagination.has_more` is `false` or `pagination.next_cursor` is `null`/missing, all records have been loaded.
3. **Initial Request**: Omit the `cursor` query parameter to fetch the first page.

---

## 12. Cursor Pagination Client Pattern

```javascript
async function fetchAllPages(endpointUrl) {
  let allItems = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const url = new URL(endpointUrl, window.location.origin);
    url.searchParams.set("limit", "20");
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const json = await res.json();
    allItems = allItems.concat(json.data);

    cursor = json.pagination?.next_cursor;
    hasMore = json.pagination?.has_more === true && Boolean(cursor);
  }

  return allItems;
}
```

---

## 13. Media Upload

Media files are uploaded via standard `multipart/form-data`.

### Upload Contract
- **Endpoint**: `POST /api/v1/media/upload`
- **Authentication**: Required (valid session cookie).
- **Form Field**: `file` (the binary file part).
- **Supported Formats**: JPEG (`.jpg`, `.jpeg`), PNG (`.png`), WebP (`.webp`). Verified via magic bytes on backend.
- **Maximum File Size**: `15 MB` (`15,728,640 bytes`).
- **Maximum Pixel Dimensions**: 8000x8000 pixels (max 40 Megapixels).

### Frontend Upload Snippet
```javascript
async function uploadMediaFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/v1/media/upload", {
    method: "POST",
    credentials: "include",
    body: formData // Let browser set boundary Content-Type
  });

  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(errorJson.error?.message || "Upload failed");
  }

  const { data } = await response.json();
  return data; // { id, display_url, thumbnail_url, width, height, ... }
}
```

---

## 14. Media URLs & Variants

The backend image pipeline automatically normalizes orientations, strips EXIF/GPS metadata, and creates two optimized WebP variants:

| Variant | Target Resolution | Quality | Serving Endpoint | Recommended Frontend Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Thumbnail** | Max 400x400 px | WebP Q75 | `GET /api/v1/media/{id}/thumbnail` | Feed cards, grid lists, profile avatars, catch thumbnails |
| **Display** | Max 1920x1080 px | WebP Q80 | `GET /api/v1/media/{id}/display` | Post detail view, full-screen lightbox / image viewer |

*Note: Originals are discarded after processing to protect user disk space and enforce privacy.*

---

## 15. API Endpoints

> **Konvensi field (WAJIB dibaca sebelum menulis DTO)**: semua field memakai **`snake_case` datar**
> dan **tidak ada objek bersarang**. Contoh: profil memakai `user_id` (bukan `id`), dan post memakai
> `author_id` / `author_username` / `author_display_name` / `author_avatar_media_id`
> (bukan `author: { id, username, ... }`). Hitungan like/komentar bernama `like_count` / `comment_count`
> (bukan `likes_count` / `comments_count`).
>
> Bentuk di bawah ini diambil langsung dari struct DTO di `src/modules/*/dtos.rs` — itulah sumber kebenaran.
> Untuk klien ber-tipe ketat (Kotlin `@Serializable`, TypeScript), gunakan **exact name matching**
> atau `@SerialName`, karena field yang tidak dikenal akan menggagalkan deserialisasi.

---

### Authentication

#### Start Google OAuth
- **`GET /api/v1/auth/google?redirect_to=<url-frontend>`**
- **Auth**: Public
- **Query params**:
  | Param | Wajib | Keterangan |
  | :--- | :--- | :--- |
  | `redirect_to` | Disarankan | URL frontend tujuan setelah login. Harus terdaftar di `ALLOWED_FRONTEND_REDIRECTS`. Bila kosong, dipakai `FRONTEND_REDIRECT_URL` |
- **Response**: `307 Temporary Redirect` ke Google (`Location`) + `Set-Cookie: oauth_state=...` dan (bila `redirect_to` dikirim) `Set-Cookie: oauth_redirect=...` (`HttpOnly; SameSite=Lax; Max-Age=600`)
- **Error**: `422 VALIDATION_FAILED` bila `redirect_to` tidak ada di allowlist
- **Action**: Navigate browser directly to this endpoint (top-level navigation, **bukan** fetch/XHR).
- **Catatan**: `redirect_uri` yang dikirim ke Google ditentukan per-request dari header `Host` +
  `x-forwarded-proto`, dicocokkan dengan `OAUTH_CALLBACK_BASES`. Ini memungkinkan web localhost dan web
  production memakai backend yang sama.

#### Google OAuth Callback
- **`GET /api/v1/auth/google/callback?code=...&state=...`**
- **Auth**: Public (called by Google redirect)
- **Response (sukses)**: `303 See Other` → `Location: <FRONTEND_REDIRECT_URL>` + `Set-Cookie: fishing_session=...` dan `Set-Cookie: oauth_state=; Max-Age=0`
- **Response (gagal)**: `303 See Other` → `Location: <FRONTEND_REDIRECT_URL>?auth_error=<code>`
- **Action**: Exchanges auth code, creates session cookie, lalu redirect ke frontend.
- **Catatan**: Error **tidak** dikembalikan sebagai JSON ke browser. Frontend harus membaca query param `auth_error` pada URL tujuan (lihat daftar kode di bagian 5A).

#### Verify Google ID Token (Native Android / Mobile)
- **`POST /api/v1/auth/google/verify`**
- **Auth**: Public
- **Description**: Verifies a Google ID Token obtained natively from Android Credential Manager / Google Sign-In SDK. Provisions the user on first login, creates a server-side session, and returns the `session_token`.
- **Request Body**:
```json
{
  "": "eyJhbGciOiJSUzI1NiIs..."
}
```
- **Response**: `200 OK`
```json
{
  "data": {
    "session_token": "a1b2c3d4e5f6...",
    "user_id": "018d45f0-7b2a-7123-8abc-def012345678",
    "email": "angler@gmail.com",
    "expires_at": "2026-10-05T08:00:00Z"
  }
}
```
- **Headers Returned** (opsional untuk native, aman diabaikan):
  `Set-Cookie: fishing_session=<session_token>; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax; Secure`
- **Error Responses**:
  - `422 VALIDATION_FAILED` — `id_token` kosong
  - `401 UNAUTHENTICATED` — `Invalid or expired Google ID token` (Google menolak token), `Google email is not verified`, atau `Google ID token missing subject claim`
  - `409 RESOURCE_CONFLICT` — `OAuth identity already linked`
  - `500 INTERNAL_SERVER_ERROR` — gangguan server / database tidak tersedia
- **Catatan**: ini **satu-satunya** cara login untuk app native. Lihat bagian 5B untuk alur lengkap, prasyarat Google Cloud Console, dan penanganan error.

#### Logout
- **`POST /api/v1/auth/logout`**
- **Auth**: Session token — kirim `Authorization: Bearer <session_token>` (native) **atau** cookie `fishing_session` (web)
- **Response**: `200 OK`
```json
{
  "data": {
    "message": "Successfully logged out"
  }
}
```
- **Perilaku**: session benar-benar dihapus di server (bukan hanya dihapus di sisi app). Response juga mengirim `Set-Cookie` untuk membersihkan cookie di browser.
- **⚠️ Catatan native**: jika token tidak dikirim di header `Authorization`, session di server **tidak** akan tercabut, sehingga token lama masih bisa dipakai. Selalu kirim Bearer saat logout.

---

### Session

#### Get Current Session
- **`GET /api/v1/auth/session`**
- **Auth**: Required — kirim cookie `fishing_session` (web) **atau** `Authorization: Bearer <session_token>` (native)
- **Response**: `200 OK`
```json
{
  "data": {
    "user_id": "018d45f0-7b2a-7123-8abc-def012345678",
    "email": "angler@example.com"
  }
}
```
- **Response `401 UNAUTHENTICATED`**: session tidak ada, kedaluwarsa, atau tidak valid.
- **Dipakai untuk**: boot check app native — panggil saat app dibuka. `200` → lanjut; `401` → hapus token lokal & tampilkan layar login.

---

### Profile

#### Check Username Availability
- **`GET /api/v1/users/check-username?username=striker_bob`**
- **Auth**: Public
- **Response**: `200 OK`
```json
{
  "data": {
    "username": "striker_bob",
    "available": true
  }
}
```

#### Get Current User Profile
- **`GET /api/v1/users/me`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": {
    "user_id": "018d45f0-7b2a-7123-8abc-def012345678",
    "username": "angler_a799e3649a7f",
    "display_name": "Bob Captain",
    "bio": null,
    "avatar_media_id": null,
    "followers_count": 0,
    "following_count": 0,
    "relationship": "SELF"
  }
}
```
- **Catatan**: field `relationship` bernilai `SELF` karena ini profil milik sendiri. Email **tidak**
  dikembalikan di sini — pakai `GET /api/v1/auth/session` bila butuh email.

#### Update Current User Profile
- **`PATCH /api/v1/users/me`**
- **Auth**: Required
- **Request Body**:
```json
{
  "display_name": "Captain Bob Strike",
  "bio": "Updated angler bio text.",
  "avatar_media_id": "018d45f0-7b2a-7123-8abc-def012345999"
}
```
- **Response**: `200 OK` (returns updated profile object)

#### Get Public Profile by Username
- **`GET /api/v1/users/{username}`**
- **Auth**: Optional (enriches follow/block state if authenticated)
- **Response**: `200 OK` — bentuk body **sama dengan `/users/me`**, tetapi `relationship` berisi
  `FOLLOWING` / `NOT_FOLLOWING` (atau `SELF` bila membuka profil sendiri):
```json
{
  "data": {
    "user_id": "018d45f0-7b2a-7123-8abc-def012345678",
    "username": "striker_bob",
    "display_name": "Bob Captain",
    "bio": "Passionate freshwater bass angler.",
    "avatar_media_id": "018d45f0-7b2a-7123-8abc-def012345999",
    "followers_count": 142,
    "following_count": 87,
    "relationship": "FOLLOWING"
  }
}
```

---

### Social Graph

#### Follow User
- **`POST /api/v1/users/{username}/follow`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": {
    "message": "Successfully followed striker_bob"
  }
}
```

#### Unfollow User
- **`DELETE /api/v1/users/{username}/follow`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": {
    "message": "Successfully unfollowed striker_bob"
  }
}
```
> Follow/unfollow bersifat idempotent dan hanya mengembalikan `message`.

#### Get Relationship Status
- **`GET /api/v1/users/{username}/relationship`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": {
    "target_username": "striker_bob",
    "relationship": "FOLLOWING"
  }
}
```
- `relationship` bernilai salah satu dari: `SELF`, `FOLLOWING`, `NOT_FOLLOWING`.

#### List User Followers
- **`GET /api/v1/users/{username}/followers?limit=20`**
- **Auth**: Optional
- **Query Params**: `limit` (default 20, maks 100). **Tidak ada cursor** — endpoint ini mengembalikan array biasa
- **Response**: `200 OK`
```json
{
  "data": [
    {
      "user_id": "018d45f0-...",
      "username": "striker_bob",
      "display_name": "Bob Captain",
      "avatar_media_id": null
    }
  ]
}
```

#### List User Following
- **`GET /api/v1/users/{username}/following?limit=20`**
- **Auth**: Optional
- **Query Params**: `limit` (default 20, maks 100). **Tidak ada cursor**
- **Response**: `200 OK` — bentuk sama dengan followers: array `user_id`, `username`, `display_name`, `avatar_media_id`

---

### Posts

#### Create Post
- **`POST /api/v1/posts`**
- **Auth**: Required
- **Aturan wajib** (model Threads: foto + caption + lokasi — **ketiganya wajib**):

  | Field | Wajib | Aturan |
  | :--- | :---: | :--- |
  | `content` | ✅ | Caption, **1–1000 karakter** (di-trim). Kosong / spasi saja ditolak |
  | `media_ids` | ✅ | **1–10 foto**, dan setiap media harus milik sendiri |
  | `latitude` + `longitude` | ✅ | Koordinat GPS bebas (WGS84). `lat` −90..90, `lng` −180..180 |
  | `location_name` | — | Label teks bebas, maks 255 char (mis. `"Muara Citarum"`) |
  | `location_privacy` | — | `EXACT` / `APPROXIMATE` (**default**) / `PRIVATE` — dipilih saat posting |
  | `privacy` | — | `PUBLIC` (default) / `FOLLOWERS_ONLY` / `PRIVATE` |

- **Request Body**:
```json
{
  "content": "Nila besar di muara pagi ini!",
  "media_ids": ["018d45f0-7b2a-7123-8abc-def012345999"],
  "latitude": -6.2088,
  "longitude": 106.8456,
  "location_name": "Muara Citarum",
  "location_privacy": "APPROXIMATE",
  "privacy": "PUBLIC",
  "trip_id": null,
  "catch_id": null,
  "spot_id": null,
  "gear_id": null,
  "community_id": null,
  "place_id": null,
  "event_id": null,
  "is_promotional": false,
  "external_link_url": null,
  "external_link_title": null
}
```
- **Response**: `201 Created` — `PostResponse` (sama dengan bentuk di "Get Post Detail")
- **Error `422 VALIDATION_FAILED`**:
  - `Caption is required for a post`
  - `At least one photo is required for a post`
  - `Location is required for a post`
  - `latitude and longitude must be provided together`
  - `Latitude must be a valid number between -90.0 and +90.0 degrees`
  - `Location name must not exceed 255 characters`
  - `A post cannot have more than 10 photos`
  - `location_privacy` dengan nilai tak dikenal juga ditolak `422` (pesan menyebutkan pilihan yang valid: `EXACT`, `APPROXIMATE`, `PRIVATE`)
- **Catatan**: `@username` di caption otomatis diparsing jadi mention. Postingan komunitas
  (`POST /api/v1/communities/{id_or_slug}/posts`) **tidak** mengikuti aturan ini — masih teks opsional,
tanpa lokasi wajib.

#### Blok `location` pada Post

Lokasi **ditentukan saat posting dan tidak bisa diedit** setelahnya (`PATCH /posts/{id}` hanya
mengubah caption & privacy). Setiap post mengembalikan objek `location`, atau `null` untuk post lama
yang dibuat sebelum fitur lokasi ada.

**`privacy` pada blok `location` = yang paling ketat** antara pilihan penulis (`location_privacy`)
dan privacy spot yang ditautkan. Jadi sebuah post **tidak bisa** melonggarkan privasi spot-nya.

| `location_privacy` pada request | Spot tertaut | Hasil `privacy` | `coordinates` | `name` |
| :--- | :--- | :--- | :--- | :--- |
| `EXACT` | — | `EXACT` | presisi | `location_name` |
| `APPROXIMATE` *(default)* | — | `APPROXIMATE` | di-jitter ke grid 2 km | `location_name` |
| `PRIVATE` | — | `PRIVATE` | `null` | *di-omit* |
| `EXACT` | spot `APPROXIMATE` | `APPROXIMATE` | di-jitter | nama spot |
| apa pun | spot `PRIVATE` | `PRIVATE` | `null` | *di-omit* |

> **Default `APPROXIMATE`**: spot mancing itu sensitif, jadi bila frontend tidak mengirim
> `location_privacy`, lokasi tidak akan disebar presisi. Kirim `EXACT` bila user memang mau presisi.
>
> **Frontend**: bila `privacy` = `PRIVATE`, tampilkan label "Lokasi privat" (tanpa nama & tanpa peta).
> Bila `location` = `null`, sembunyikan baris lokasi di kartu.
>
> **Community post** (`POST /communities/{id_or_slug}/posts`) bergaya grup Facebook: foto & lokasi
> **opsional** (boleh teks-saja). Kalau lokasi dikirim, aturan privasinya sama.
>
> **Place promotion** (`POST /locations/places/{id}/promotions`) tidak mengirim koordinat sendiri, jadi
> `location` bernilai `null` — frontend memakai `place_id` untuk menampilkan lokasi venue.

#### Get Post Detail
- **`GET /api/v1/posts/{id}`**
- **Auth**: Optional (bila terautentikasi, `is_liked` diisi sesuai viewer)
- **Response**: `200 OK`
```json
{
  "data": {
    "id": "018d45f0-7b2a-7123-8abc-def012345678",
    "author_id": "018d45f0-...",
    "author_username": "striker_bob",
    "author_display_name": "Bob Captain",
    "author_avatar_media_id": null,
    "content": "Caught a personal best Largemouth Bass!",
    "privacy": "PUBLIC",
    "location": {
      "name": "Eagle Rock Cove",
      "privacy": "APPROXIMATE",
      "coordinates": { "lat": -6.21, "lng": 106.85 }
    },
    "trip_id": null,
    "catch_id": null,
    "spot_id": null,
    "gear_id": null,
    "community_id": null,
    "place_id": null,
    "event_id": null,
    "is_promotional": false,
    "external_link_url": null,
    "external_link_title": null,
    "media": [
      {
        "id": "018d45f0-...",
        "display_url": "/api/v1/media/.../display",
        "thumbnail_url": "/api/v1/media/.../thumbnail",
        "width": 1920,
        "height": 1080
      }
    ],
    "like_count": 24,
    "comment_count": 5,
    "is_liked": true,
    "created_at": "2026-08-29T11:00:00Z",
    "updated_at": "2026-08-29T11:00:00Z"
  }
}
```
> Field penulis bersifat **datar** (`author_id`, `author_username`, `author_display_name`,
> `author_avatar_media_id`) — bukan objek `author` bersarang, dan tidak ada `avatar_url`.

#### Update Post
- **`PATCH /api/v1/posts/{id}`**
- **Auth**: Required (author only)
- **Request Body**:
```json
{
  "content": "Updated post caption text.",
  "privacy": "FOLLOWERS_ONLY"
}
```
- **Response**: `200 OK`
- **Catatan**: hanya `content` (caption) dan `privacy` yang bisa diubah. **Foto dan lokasi tidak bisa diedit**
  setelah post dibuat.

#### Delete Post
- **`DELETE /api/v1/posts/{id}`**
- **Auth**: Required (author or moderator)
- **Response**: `200 OK`
```json
{ "data": { "message": "Post successfully deleted" } }
```
> **Semua endpoint DELETE mengembalikan `200 OK` + `{"message": ...}` — bukan `204 No Content`.**

---

### Likes

#### Like a Post (Idempotent)
- **`POST /api/v1/posts/{post_id}/like`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": {
    "is_liked": true,
    "like_count": 25
  }
}
```

#### Unlike a Post
- **`DELETE /api/v1/posts/{post_id}/like`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": {
    "is_liked": false,
    "like_count": 24
  }
}
```

#### Get Like Status
- **`GET /api/v1/posts/{post_id}/like-status`**
- **Auth**: Required
- **Response**: `200 OK` — bentuk sama dengan like/unlike:
```json
{
  "data": {
    "is_liked": true,
    "like_count": 24
  }
}
```
> Ketiga endpoint like memakai field `is_liked` dan `like_count` — **bukan** `liked` / `likes_count`.

---

### Comments

#### Create Comment or Reply
- **`POST /api/v1/posts/{post_id}/comments`**
- **Auth**: Required
- **Request Body**:
```json
{
  "content": "What lure were you using?",
  "parent_comment_id": null
}
```
*Note: Set `parent_comment_id` to comment UUID for 1-level nested replies.*
- **Response**: `201 Created`

#### List Comments for a Post
- **`GET /api/v1/posts/{post_id}/comments?limit=20&cursor=...`**
- **Auth**: Optional
- **Response**: `200 OK` (Paginated list of comments with threaded replies)

#### Update Comment
- **`PATCH /api/v1/comments/{comment_id}`**
- **Auth**: Required (author only)
- **Request Body**: `{"content": "Updated comment text"}`
- **Response**: `200 OK`

#### Delete Comment
- **`DELETE /api/v1/comments/{comment_id}`**
- **Auth**: Required (author or moderator)
- **Response**: `200 OK`
```json
{ "data": { "message": "Comment successfully deleted" } }
```

---

### Feed

#### Get Chronological Social Feed
- **`GET /api/v1/feed`** (alias `GET /api/v1/posts/feed`)
- **Auth**: Required
- **Query Params**: `limit` (default 20, otomatis di-clamp ke rentang 1–50), `cursor`
- **Isi feed**: post milik sendiri (semua privacy) + post dari user yang **difollow** dengan privacy
  `PUBLIC` / `FOLLOWERS_ONLY`. Post `PRIVATE` milik orang lain **tidak** muncul.
- **Urutan**: `created_at DESC, id DESC` (reverse-chronological, tanpa ranking algoritmik)
- **Tidak tersedia**: timeline per-user (`GET /api/v1/users/{username}/posts` **belum ada** — untuk
  sementara pakai `/api/v1/discovery/posts?q=` atau minta backend menambahkannya); post komunitas
  hanya lewat `GET /api/v1/communities/{id_or_slug}/posts`.
- **Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "018d45f0-...",
      "author_id": "018d45f0-...",
      "author_username": "striker_bob",
      "author_display_name": "Bob Captain",
      "author_avatar_media_id": null,
      "content": "Caught a personal best Largemouth Bass!",
      "privacy": "PUBLIC",
      "location": {
        "name": "Eagle Rock Cove",
        "privacy": "EXACT",
        "coordinates": { "lat": -6.2088, "lng": 106.8456 }
      },
      "media": [],
      "like_count": 24,
      "comment_count": 5,
      "is_liked": false,
      "created_at": "2026-08-29T11:00:00Z",
      "updated_at": "2026-08-29T11:00:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "has_more": false,
    "limit": 20
  }
}
```
> **Penting**: feed memakai envelope paginasi standar (`data` + `pagination`), **bukan**
> `{"data": {"items": [...], "next_cursor": ...}}`. Ini berlaku untuk semua endpoint
> ber-paginasi (lihat §11).
> Item feed memakai field penulis datar yang sama dengan detail post, tetapi **tanpa**
> `trip_id`/`catch_id`/`spot_id`/`gear_id`/`community_id`/`place_id`/`event_id`,
> `is_promotional`, dan `external_link_*`.

---

### Fishing Trips

#### Create Fishing Trip
- **`POST /api/v1/fishing/trips`**
- **Auth**: Required
- **Request Body** (semua kecuali `title` & `started_at` opsional):
```json
{
  "title": "Weekend Delta Striped Bass Run",
  "started_at": "2026-08-29T06:00:00Z",
  "ended_at": "2026-08-29T14:00:00Z",
  "privacy": "PUBLIC",
  "spot_id": "018d45f0-7b2a-7123-8abc-def012345111",
  "weather_notes": "Clear skies, water temp 64F.",
  "water_temp_c": 17.8
}
```
> Field catatan cuaca bernama **`weather_notes`** (bukan `notes`); ada juga `water_temp_c` (opsional).
- **Response**: `201 Created` — `TripDetailResponse`

#### Get Trip Detail
- **`GET /api/v1/fishing/trips/{id}`**
- **Auth**: Optional (enforces trip privacy)
- **Response**: `200 OK`
```json
{
  "data": {
    "id": "018d45f0-...",
    "owner_id": "018d45f0-...",
    "owner_username": "striker_bob",
    "owner_display_name": "Bob Captain",
    "spot_id": null,
    "title": "Weekend Delta Striped Bass Run",
    "started_at": "2026-08-29T06:00:00Z",
    "ended_at": null,
    "privacy": "PUBLIC",
    "weather_notes": null,
    "water_temp_c": null,
    "created_at": "2026-08-29T06:05:00Z",
    "members": [],
    "catches": []
  }
}
```
> Tidak ada objek `spot` bersarang — hanya `spot_id`.

#### Update Trip
- **`PATCH /api/v1/fishing/trips/{id}`**
- **Auth**: Required (owner only)
- **Response**: `200 OK`

#### Delete Trip
- **`DELETE /api/v1/fishing/trips/{id}`**
- **Auth**: Required (owner only)
- **Response**: `200 OK`
```json
{ "data": { "message": "Fishing trip deleted successfully" } }
```

---

### Trip Members

#### Add Member to Trip
- **`POST /api/v1/fishing/trips/{id}/members`**
- **Auth**: Required (trip owner only)
- **Request Body**: `{"user_id": "018d45f0-7b2a-..."}`
- **Response**: `201 Created`

#### Remove Member from Trip
- **`DELETE /api/v1/fishing/trips/{trip_id}/members/{user_id}`**
- **Auth**: Required (trip owner or self)
- **Response**: `200 OK`
```json
{ "data": { "message": "Trip member removed successfully" } }
```

#### List Trip Members
- **`GET /api/v1/fishing/trips/{id}/members`**
- **Auth**: Optional
- **Response**: `200 OK`

---

### Catches

#### Record Catch
- **`POST /api/v1/fishing/catches`**
- **Auth**: Required
- **Request Body** (semua field opsional):
```json
{
  "trip_id": "018d45f0-...",
  "species_id": "018d45f0-...",
  "media_id": "018d45f0-...",
  "gear_id": "018d45f0-...",
  "weight_kg": 4.25,
  "length_cm": 62.0,
  "bait_or_lure": "Topwater frog",
  "caught_at": "2026-08-29T08:30:00Z",
  "notes": "Hit a topwater frog near the lily pads."
}
```
> Satu catch memakai **satu** `media_id` (bukan array `media_ids`), dan **tidak ada** field `quantity`.
- **Response**: `201 Created` — `CatchResponse`
```json
{
  "data": {
    "id": "018d45f0-...",
    "angler_id": "018d45f0-...",
    "angler_username": "striker_bob",
    "trip_id": null,
    "species_id": null,
    "species_common_name": null,
    "media_id": null,
    "gear_id": null,
    "gear_name": null,
    "weight_kg": 4.25,
    "length_cm": 62.0,
    "bait_or_lure": null,
    "caught_at": "2026-08-29T08:30:00Z",
    "notes": null
  }
}
```

#### Get Catch Detail
- **`GET /api/v1/fishing/catches/{id}`**
- **Auth**: Optional
- **Response**: `200 OK`

#### List My Catches (Catch Library)
- **`GET /api/v1/fishing/catches?limit=20&cursor=...&species_id=...`**
- **Auth**: Required
- **Response**: `200 OK` (Paginated list of catches)

#### Update Catch
- **`PATCH /api/v1/fishing/catches/{id}`**
- **Auth**: Required (owner only)
- **Response**: `200 OK`

#### Delete Catch
- **`DELETE /api/v1/fishing/catches/{id}`**
- **Auth**: Required (owner only)
- **Response**: `200 OK`
```json
{ "data": { "message": "Catch record deleted successfully" } }
```

---

### Gear (Tackle Library)

#### Add Gear Item
- **`POST /api/v1/fishing/gear`**
- **Auth**: Required
- **Request Body**:
```json
{
  "gear_type": "REEL",
  "brand": "Shimano",
  "model_name": "Curado DC 150HG",
  "specifications": { "gear_ratio": "7.4:1", "line": "braided 30lb" },
  "external_product_url": "https://fish.shimano.com/curado"
}
```
> Field model bernama **`model_name`** (bukan `name`/`model`). `specifications` berupa **objek JSON** (bukan string).
- **Response**: `201 Created` — `GearResponse`
```json
{
  "data": {
    "id": "018d45f0-...",
    "user_id": "018d45f0-...",
    "gear_type": "REEL",
    "brand": "Shimano",
    "model_name": "Curado DC 150HG",
    "specifications": {},
    "external_product_url": null,
    "created_at": "2026-08-29T09:00:00Z"
  }
}
```

#### List My Gear Library
- **`GET /api/v1/fishing/gear`**
- **Auth**: Required
- **Response**: `200 OK` (List of user's personal gear items)

#### Update Gear Item
- **`PATCH /api/v1/fishing/gear/{id}`**
- **Auth**: Required (owner only)
- **Response**: `200 OK`

#### Delete Gear Item
- **`DELETE /api/v1/fishing/gear/{id}`**
- **Auth**: Required (owner only)
- **Response**: `200 OK`
```json
{ "data": { "message": "Tackle gear deleted successfully" } }
```

---

### Fishing History & Taxonomy

#### Get Fishing History & Personal Statistics
- **`GET /api/v1/fishing/history`** (atau `GET /api/v1/fishing/stats`)
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": {
    "total_trips": 18,
    "total_catches": 54,
    "species_count": 8,
    "largest_catch_weight_kg": 9.40,
    "largest_catch_length_cm": 88.0
  }
}
```
> **Bukan** `unique_species_count`, **bukan** objek `biggest_catch`, dan **tidak ada**
> `species_distribution`. Jika butuh distribusi spesies, hitung di klien dari
> `GET /api/v1/fishing/catches` sambil menghitung per `species_common_name`.

#### List Fish Species Taxonomy Catalog
- **`GET /api/v1/fishing/species`**
- **Auth**: Public
- **Response**: `200 OK` (List of verified biological fish species with scientific names and water types)

---

### Fishing Spots (Natural Waters)

#### Create Fishing Spot
- **`POST /api/v1/locations/spots`**
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Eagle Rock Cove",
  "description": "Rocky point with deep drop-off.",
  "lat": 37.7749,
  "lng": -122.4194,
  "water_type": "FRESHWATER",
  "privacy": "APPROXIMATE"
}
```
> Koordinat memakai **`lat`** dan **`lng`** (bukan `latitude`/`longitude`).
> Privacy options: `EXACT`, `APPROXIMATE`, `PRIVATE`.
- **Response**: `201 Created` — `FishingSpotResponse`

#### Query Spots in Bounding Box (Map Viewport)
- **`GET /api/v1/locations/spots/bounds?bbox=min_lng,min_lat,max_lng,max_lat`**
- Contoh: `?bbox=-122.5,37.7,-122.3,37.9`
- **Auth**: Optional
- **Query Params** (pilih salah satu mode):
  | Param | Keterangan |
  | :--- | :--- |
  | `bbox` | `min_lng,min_lat,max_lng,max_lat` |
  | `lat` + `lng` + `radius` + `water_type` + `privacy` + `limit` | Mode radius, dipakai juga oleh `/spots` |

  ⚠️ **Tidak ada** `min_lat`/`min_lng`/`max_lat`/`max_lng` sebagai param terpisah — gunakan `bbox`.
- **Response**: `200 OK` — array `FishingSpotMapItem`:
```json
{
  "data": [
    {
      "id": "018d45f0-...",
      "name": "Eagle Rock Cove",
      "water_type": "FRESHWATER",
      "lat": 37.7749,
      "lng": -122.4194,
      "distance_meters": null,
      "average_rating": null,
      "privacy": "APPROXIMATE"
    }
  ]
}
```

#### Query Spots Nearby (Radius)
- **`GET /api/v1/locations/spots/nearby?lat=37.77&lng=-122.42&radius=5000&limit=20`**
- **Auth**: Optional
- **Query Params**: `lat`, `lng`, **`radius`** (meter — bukan `radius_meters`), `limit`
- **Response**: `200 OK` — array `FishingSpotMapItem` (bentuk sama dengan bounds)

---

### Fishing Places (Commercial Venues)

#### Create Fishing Place
- **`POST /api/v1/locations/places`**
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Sunrise Pay-to-Fish Trout Pond",
  "description": "Stocked rainbow trout ponds with equipment rental.",
  "lat": 37.8500,
  "lng": -122.3000,
  "address": "1200 Lakeview Rd, Cityville",
  "phone": "+15551234567",
  "website_url": "https://sunrisetrout.example.com",
  "whatsapp_url": "https://wa.me/15551234567",
  "facilities": ["PARKING", "RESTROOMS", "TACKLE_SHOP"],
  "opening_hours": { "mon_fri": "06:00-18:00", "sat_sun": "05:00-19:00" }
}
```
> Koordinat memakai **`lat`**/**`lng`**. Nomor WhatsApp memakai **`whatsapp_url`** (bukan
> `whatsapp_number`), fasilitas memakai **`facilities`** (bukan `amenities`), dan
> **`opening_hours` adalah objek JSON** (bukan string). Tidak ada field privacy — tempat
> komersial selalu `EXACT`.
- **Response**: `201 Created` — `FishingPlaceResponse`

#### Query Places in Bounding Box
- **`GET /api/v1/locations/places/bounds?bbox=min_lng,min_lat,max_lng,max_lat`**
- Contoh: `?bbox=-122.5,37.7,-122.3,37.9`
- **Auth**: Optional
- **Query Params**: `bbox` (prioritas) atau `lat`+`lng`+`radius`, plus `limit`.
  ⚠️ Tidak ada `min_lat`/`min_lng`/`max_lat`/`max_lng` sebagai param terpisah.
- **Response**: `200 OK` — array `FishingPlaceMapItem` (`id`, `name`, `address`, `lat`, `lng`, `distance_meters`, `average_rating`)

---

### Reviews

#### Submit Spot Review
- **`POST /api/v1/locations/spots/{id}/reviews`**
- **Auth**: Required
- **Request Body**:
```json
{
  "rating": 5,
  "content": "Great accessibility and high catch rate during morning hours."
}
```
- **Response**: `201 Created`

#### Submit Place Review
- **`POST /api/v1/locations/places/{id}/reviews`**
- **Auth**: Required
- **Request Body**: `{"rating": 4, "content": "Clean facilities and well-stocked ponds."}`
- **Response**: `201 Created`

---

### Communities

#### Create Community
- **`POST /api/v1/communities`**
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "Bay Area Kayak Anglers",
  "slug": "bay-area-kayak-anglers",
  "description": "Community for kayak and canoe fishing enthusiasts.",
  "visibility": "PUBLIC",
  "avatar_media_id": null
}
```
> Field-nya bernama **`visibility`** (bukan `privacy`).
- **Response**: `201 Created` — `CommunityDetailResponse`

#### Join Community
- **`POST /api/v1/communities/{id_or_slug}/join`**
- **Auth**: Required
- **Response**: `201 Created` (bukan 200)

#### Leave Community
- **`POST /api/v1/communities/{id_or_slug}/leave`**
- **Auth**: Required
- **Response**: `200 OK` — `{"data": null}`

#### List Community Members
- **`GET /api/v1/communities/{id_or_slug}/members?limit=20`**
- **Auth**: Optional
- **Query Params**: `limit` saja (default 20, maks 100) — **tidak ada `cursor`**
- **Response**: `200 OK` — array `community_id`, `user_id`, `username`, `display_name`, `avatar_media_id`, `role`, `joined_at`

#### Create Community Post
- **`POST /api/v1/communities/{id_or_slug}/posts`**
- **Auth**: Required (members only)
- **Request Body**: `{"content": "Anyone fishing the bay tomorrow morning?"}`
- **Response**: `201 Created`

---

### Events

#### Create Community Event
- **`POST /api/v1/communities/{id_or_slug}/events`**
- **Auth**: Required (community admins/moderators)
- **Request Body**:
```json
{
  "title": "Spring Bass Tournament 2026",
  "description": "Annual catch-and-release tournament.",
  "starts_at": "2026-09-15T07:00:00Z",
  "ends_at": "2026-09-15T16:00:00Z",
  "location_name": "Clear Lake South Ramp",
  "external_registration_url": "https://events.example.com/register/spring2026"
}
```
- **Response**: `201 Created`

#### List Community Events
- **`GET /api/v1/communities/{id_or_slug}/events?status=UPCOMING&limit=20`**
- **Auth**: Optional
- **Query Params**: `status` (opsional), `limit` (opsional) — ⚠️ **bukan** `upcoming=true`
- **Response**: `200 OK` — array `EventResponse` (`id`, `community_id`, `place_id`, `organizer_id`, `organizer_username`, `organizer_display_name`, `organizer_avatar_media_id`, `title`, `description`, `starts_at`, `ends_at`, `location_name`, `external_registration_url`, `status`, `created_at`)

---

### Notifications

#### List Notifications
- **`GET /api/v1/notifications?limit=20&cursor=...&unread_only=false`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "018d45f0-7b2a-7123-8abc-def012345001",
      "recipient_id": "018d45f0-...",
      "actor": {
        "id": "018d45f0-...",
        "username": "angler_jenny",
        "display_name": "Jenny Angler",
        "avatar_media_id": null
      },
      "event_type": "LIKE",
      "entity_type": "POST",
      "entity_id": "018d45f0-...",
      "is_read": false,
      "created_at": "2026-08-29T11:45:00Z"
    }
  ],
  "pagination": {
    "next_cursor": null,
    "has_more": false,
    "limit": 20
  }
}
```

#### Get Unread Notification Count
- **`GET /api/v1/notifications/unread-count`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{
  "data": {
    "unread_count": 3
  }
}
```

#### Mark Single Notification as Read
- **`PATCH /api/v1/notifications/{id}/read`**
- **Auth**: Required
- **Response**: `200 OK`

#### Mark All Notifications as Read
- **`POST /api/v1/notifications/read-all`**
- **Auth**: Required
- **Response**: `200 OK` (`{"data": {"marked_count": 3}}`)

---

### SSE (Realtime Notifications)

#### Stream Endpoint
- **`GET /api/v1/notifications/stream`**
- **Auth**: Required — cookie `fishing_session` (web, pakai `EventSource` dengan `withCredentials: true`)
  **atau** header `Authorization: Bearer <session_token>` (mobile native / OkHttp SSE, karena
  `EventSource` di browser tidak bisa mengirim header kustom)
- **Response**: `Content-Type: text/event-stream` dengan heartbeat `: heartbeat` setiap 15 detik

#### SSE Frontend Implementation
```javascript
const eventSource = new EventSource("/api/v1/notifications/stream", {
  withCredentials: true // Forward session cookie
});

eventSource.addEventListener("notification", (event) => {
  const payload = JSON.parse(event.data);
  console.log("New notification received:", payload);
  // Example payload: { id, event_type: "LIKE", actor: {...}, created_at }
  incrementUnreadBadge();
  prependNotificationToList(payload);
});

eventSource.onerror = (err) => {
  console.warn("SSE connection error or disconnect. Browser will automatically retry.", err);
};
```

---

### Search & Discovery

#### Unified Search
- **`GET /api/v1/discovery/search?q=bass&limit=10`** (alias `GET /api/v1/search`)
- **Auth**: Optional
- **Response**: `200 OK`
```json
{
  "data": {
    "users": [],
    "posts": [],
    "communities": [],
    "spots": [],
    "places": [],
    "species": [],
    "gear": [],
    "events": [],
    "hashtags": []
  }
}
```
> `UnifiedSearchResponse` punya **9** kategori: `users`, `posts`, `communities`, `spots`,
> `places`, `species`, `gear`, `events`, `hashtags`.
>
> ⚠️ **Perbedaan penting**: pada hasil pencarian, `posts` memakai objek **`author` bersarang**
> (bukan field `author_*` datar seperti di feed/detail post). Bentuk tiap kategori:
>
> | Kategori | Field item |
> | :--- | :--- |
> | `users` | `id`, `username`, `display_name`, `avatar_media_id`, `bio` |
> | `posts` | `id`, `author` (`{id, username, display_name, avatar_media_id, bio}`), `content_snippet`, `media_thumbnail_id`, `created_at` |
> | `communities` | `id`, `name`, `slug`, `description`, `avatar_media_id`, `member_count` |
> | `spots` | `id`, `name`, `water_type`, `location_privacy`, `coordinates` (`{latitude, longitude}`), `rating_average`, `review_count`, `distance_meters` |
> | `places` | `id`, `name`, `address`, `water_type`, `facilities`, `is_verified`, `rating_average`, `review_count`, `distance_meters` |
> | `species` | `id`, `slug`, `common_name`, `scientific_name`, `water_type`, `photo_url` |
> | `gear` | `gear_type`, `brand`, `model`, `specs` |
> | `events` | `id`, `title`, `description_snippet`, `starts_at`, `ends_at`, `status`, `location_name`, `external_registration_url`, `community_id`, `place_id` |
> | `hashtags` | `tag`, `post_count` |
>
> Endpoint `by-type` (`/discovery/users`, `/discovery/species`, dll.) mengembalikan `data`
> berisi array kategori tunggal dengan bentuk item yang sama.

#### Search by Type
- Users: `GET /api/v1/discovery/users?q=bob`
- Posts: `GET /api/v1/discovery/posts?q=trout`
- Spots: `GET /api/v1/discovery/spots?q=cove`
- Places: `GET /api/v1/discovery/places?q=lake`
- Species: `GET /api/v1/discovery/species?q=salmon`
- Hashtags: `GET /api/v1/discovery/hashtags/{tag}/posts`

---

### User Block

#### Block User
- **`POST /api/v1/users/{username}/block`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{ "data": { "message": "Successfully blocked user striker_bob" } }
```

#### Unblock User
- **`DELETE /api/v1/users/{username}/block`**
- **Auth**: Required
- **Response**: `200 OK`
```json
{ "data": { "message": "Successfully unblocked user striker_bob" } }
```
> **Bukan** `{"blocked": true/false}` — hanya `message`.

#### List Blocked Users
- **`GET /api/v1/users/blocks`**
- **Auth**: Required
- **Query Params**: `limit`
- **Response**: `200 OK` — daftar user yang diblokir

---

### Reports & Moderation

#### Submit Report
- **`POST /api/v1/reports`**
- **Auth**: Required
- **Request Body**:
```json
{
  "target_type": "POST",
  "target_id": "018d45f0-7b2a-...",
  "reason": "SPAM",
  "details": "User is posting commercial spam links repeatedly."
}
```
*Note: Target types: `POST`, `COMMENT`, `USER`, `SPOT`, `PLACE`, `COMMUNITY`.*
- **Response**: `201 Created`

---

### Account Deletion

#### Delete Account
- **`DELETE /api/v1/users/me`**
- **Auth**: Required
- **Warning**: Destructive and permanent action. Hard-deletes authentication and sessions; anonymizes profile.
- **Response**: `200 OK`
```json
{
  "data": {
    "message": "User account successfully deleted and anonymized"
  }
}
```
*Frontend Action: Clear local auth state, disconnect SSE, and redirect to public landing page.*

---

## 16. Location Privacy

The backend enforces location privacy server-side before serializing JSON:

| Privacy Tier | Server-Side Processing | Frontend Display Representation |
| :--- | :--- | :--- |
| **`EXACT`** | Mengembalikan koordinat presisi dalam `coordinates: { "lat": ..., "lng": ... }` | Pin langsung di map |
| **`APPROXIMATE`** | Koordinat di-jitter ke centroid grid 2km deterministik. Field `privacy` tetap `"APPROXIMATE"` | Tampilkan sebagai **lingkaran radius 2km**, jangan pin presisi |
| **`PRIVATE`** | Koordinat dinull-kan: `coordinates: null`. Field `privacy` = `"PRIVATE"` | Tampilkan badge "Private Location"; jangan render di map publik |

> **Nama field**: koordinat selalu `lat` / `lng` (objek `coordinates`), dan penanda privasi
> bernama **`privacy`** — bukan `latitude`/`longitude` dan bukan `location_visibility`.
> Pada hasil pencarian (`/discovery/spots`) penamaannya `location_privacy` dengan objek
> `coordinates: { "latitude": ..., "longitude": ... }`.

> ⚠️ **CRITICAL FRONTEND PRIVACY RULE**: The frontend must never attempt to calculate, interpolate, or reverse-engineer exact private fishing spots. The coordinates returned in the API payload are authoritative.

---

## 17. Authentication Failure Handling

When any request returns `401 Unauthorized`:
1. Check if the failed endpoint is an optional public view.
2. If the user was assumed to be logged in:
   - Clear client-side user state (Vue Pinia, Redux, Zustand store).
   - Disconnect active SSE `EventSource` streams.
   - Redirect to the login route or prompt with the Google Login modal.

---

## 18. Common Frontend Patterns

### Optimistic UI Updates
Optimistic updates are safe for the following idempotent operations:
- **Like / Unlike**: Toggle `is_liked` state and increment/decrement count immediately. Revert if request fails.
- **Follow / Unfollow**: Toggle follow button state immediately. Revert if request fails.
- **Mark Notification Read**: Set `is_read: true` and decrement unread counter immediately.

*Do NOT use optimistic UI for post creation, media uploads, or financial/external link mutations.*

---

## 19. Realtime Event Handling

- The SSE connection (`/api/v1/notifications/stream`) receives events with type `notification`.
- Notification event types:
  - `FOLLOW`: User followed you.
  - `LIKE`: User liked your post.
  - `COMMENT`: User commented on your post.
  - `REPLY`: User replied to your comment.
  - `MENTION`: User mentioned you (`@username`) in a post or comment.
  - `COMMUNITY_ACTIVITY`: New post in a joined community.
  - `EVENT_ACTIVITY`: Community event announcement.
- When an SSE event arrives:
  1. Increment the unread badge count in navigation.
  2. Prepend the notification object to the notifications drop-down list.
  3. Optionally display a temporary toast banner.

---

## 20. API Usage Examples

### Complete Axios Client Setup (Web / React Native)
```javascript
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api-fishing.janissaryid.com/api/v1",
  withCredentials: true, // Always forward session cookies
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

// Response interceptor for centralized 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);
```

### Complete Android (Kotlin + OkHttp + Retrofit) Setup

#### 1. SessionManager — simpan token secara aman

```kotlin
import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SessionManager(context: Context) {
    private val prefs = EncryptedSharedPreferences.create(
        context,
        "auth_prefs",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    var token: String?
        get() = prefs.getString("session_token", null)
        set(value) = prefs.edit().putString("session_token", value).apply()

    var expiresAt: String?
        get() = prefs.getString("expires_at", null)
        set(value) = prefs.edit().putString("expires_at", value).apply()

    fun clear() = prefs.edit().clear().apply()
}
```

#### 2. ApiClient — Bearer interceptor (tanpa `CookieJar`)
```kotlin
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val BASE_URL = "https://api-fishing.janissaryid.com/api/v1/"
    
    // Diinisialisasi di Application.onCreate(): ApiClient.sessionManager = SessionManager(this)
    lateinit var sessionManager: SessionManager

    // Bearer token otomatis dikirim ke SEMUA request
    private val authInterceptor = Interceptor { chain ->
        val builder = chain.request().newBuilder()
            .header("Accept", "application/json")
        sessionManager.token?.let { builder.header("Authorization", "Bearer $it") }
        chain.proceed(builder.build())
    }

    // Auto-logout saat server membalas 401 (session kedaluwarsa / dicabut)
    private val unauthorizedInterceptor = Interceptor { chain ->
        val response = chain.proceed(chain.request())
        if (response.code == 401) {
            sessionManager.clear()   // emit event ke UI -> arahkan ke LoginActivity
        }
        response
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(unauthorizedInterceptor)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}
```

#### 3. AuthService — login native, cek session, logout

```kotlin
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

data class VerifyGoogleTokenRequest(val id_token: String)

data class SessionData(
    val session_token: String,
    val user_id: String,
    val email: String,
    val expires_at: String
)
data class SessionResponse(val data: SessionData)

data class CurrentSession(val user_id: String, val email: String)
data class CurrentSessionResponse(val data: CurrentSession)

interface AuthService {
    @POST("auth/google/verify")
    suspend fun verifyGoogleToken(@Body req: VerifyGoogleTokenRequest): SessionResponse

    @GET("auth/session")
    suspend fun currentSession(): CurrentSessionResponse

    @POST("auth/logout")
    suspend fun logout()
}
```

#### 4. Login dengan Credential Manager (Google Sign-In)

```kotlin
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

suspend fun loginWithGoogle(context: Context, webClientId: String): SessionData {
    val credentialManager = CredentialManager.create(context)

    val googleIdOption = GetGoogleIdOption.Builder()
        .setServerClientId(webClientId)        // OAuth Client ID bertipe Web (BUKAN client Android)
        .setFilterByAuthorizedAccounts(false)
        .setAutoSelectEnabled(false)
        .build()

    val request = GetCredentialRequest.Builder()
        .addCredentialOption(googleIdOption)
        .build()

    val credential = credentialManager.getCredential(context, request).credential

    require(
        credential is CustomCredential &&
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
    ) { "Unexpected credential type" }

    // Ambil idToken (JWT) — BUKAN accessToken
    val idToken = GoogleIdTokenCredential.createFrom(credential.data).idToken

    // Kirim LANGSUNG ke backend, jangan disimpan / di-cache
    val session = ApiClient.retrofit.create(AuthService::class.java)
        .verifyGoogleToken(VerifyGoogleTokenRequest(idToken))
        .data

    ApiClient.sessionManager.token = session.session_token
    ApiClient.sessionManager.expiresAt = session.expires_at

    return session
}
```

#### 5. Boot check & logout

```kotlin
suspend fun restoreSession(): Boolean = try {
    ApiClient.retrofit.create(AuthService::class.java).currentSession()
    true
} catch (e: retrofit2.HttpException) {
    if (e.code() == 401) { ApiClient.sessionManager.clear(); false } else throw e
}

suspend fun logout() {
    try {
        // Interceptor sudah mengirim Bearer token, sehingga session tercabut di server
        ApiClient.retrofit.create(AuthService::class.java).logout()
    } finally {
        ApiClient.sessionManager.clear()
    }
}
```

> **Dependency Gradle**: `androidx.credentials:credentials`, `androidx.credentials:credentials-play-services-auth`,
> `com.google.android.libraries.identity.googleid:googleid`, `androidx.security:security-crypto`.

---

## 21. Frontend Integration Checklist

### Web
- [ ] `credentials: "include"` (fetch) / `withCredentials: true` (Axios) enabled.
- [ ] Login navigates the browser to `/api/v1/auth/google` (top-level navigation, **bukan** fetch/XHR).
- [ ] Halaman tujuan redirect membaca query param `?auth_error=` dan menampilkannya, lalu membersihkannya dari URL.
- [ ] Session check dijalankan saat app boot (`GET /api/v1/auth/session`).
- [ ] Realtime SSE stream (`/api/v1/notifications/stream`) diinisialisasi setelah login berhasil.
- [ ] SSE stream ditutup saat logout / hapus akun.

### Mobile Native (Android / iOS)
- [ ] **Tidak** memakai browser redirect atau embedded WebView untuk OAuth.
- [ ] `idToken` (bukan `accessToken`) dari Google Sign-In dikirim ke `POST /api/v1/auth/google/verify`.
- [ ] `session_token` disimpan aman (`EncryptedSharedPreferences` / Keychain), bukan di `SharedPreferences` biasa.
- [ ] Interceptor mengirim `Authorization: Bearer <session_token>` ke semua request.
- [ ] Boot check `GET /api/v1/auth/session`; `401` → hapus token lokal & tampilkan layar login.
- [ ] Interceptor `401` otomatis memicu logout lokal.
- [ ] `POST /api/v1/auth/logout` dipanggil **dengan Bearer token** agar session tercabut di server.
- [ ] Package name + SHA-1 (debug & release/Play App Signing) terdaftar di Google Cloud Console.

### Umum
- [ ] **Post**: kirim `content` + `media_ids` (1–10) + `latitude`/`longitude` sekaligus — ketiganya wajib.
- [ ] **Post**: render blok `location`; bila `privacy: "PRIVATE"` tampilkan label "Lokasi privat" (tanpa nama & peta); bila `location: null` (post lama) sembunyikan baris lokasi.
- [ ] Keyset cursor pagination loop benar menangani `pagination.next_cursor`.
- [ ] Multipart upload ke `/api/v1/media/upload` dengan field name `file`.
- [ ] Thumbnail variant (`/thumbnail`) untuk kartu list/feed; display variant (`/display`) untuk detail.
- [ ] `APPROXIMATE` location privacy spots dirender sebagai zona radius 2km.
- [ ] Field-level error dari `error.details` ditampilkan pada `422` / `400`.

---

## 22. Known API Limitations

1. **Server-Sent Events (SSE)** is unidirectional (server-to-client). Inbound mutations must use standard REST `POST`/`PATCH`/`DELETE` calls.
2. **Media Upload Limit**: Maximum file size is strictly 15 MB per upload.
3. **No In-App Direct Chat**: Use community posts or external WhatsApp click-to-chat links (`https://wa.me/...`) for direct communications.

---

## 23. API Compatibility Rules

- Field names in JSON bodies always use `snake_case`.
- Missing optional fields in response payloads are serialized as `null` or omitted when empty.
- Clients should ignore unrecognized fields in responses to ensure forwards-compatibility with future minor releases.
