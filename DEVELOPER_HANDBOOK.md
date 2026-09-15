# Developer Handbook

Documentation Status: Current  
Workspace: FishingBackend Monolith  
Runtime: Rust 1.89+ (2021 Edition) | Axum 0.8 | PostgreSQL 16 + PostGIS 3.4  

---

## 1. Project Overview

The **FishingBackend** is a high-performance, memory-safe, asynchronous Rust backend platform powering three interconnected pillars:
1. **Fishing-Focused Social Network**: Media-rich micro-posts, 1-level threaded comments, idempotent likes, social follows, `@username` mentions, and reverse-chronological feeds.
2. **Personal Fishing Logbook**: Structured fishing sessions (trips), multi-member trip logs, catch records with biological metrics, catch library, personal tackle/gear library, and derived fishing history stats.
3. **Fishing Community & Discovery Hub**: PostGIS-powered spot discovery with multi-tier location privacy (`EXACT`, `APPROXIMATE`, `PRIVATE`), commercial pay-to-fish venue directory with external WhatsApp click-to-chat links, 1–5 star reviews, community groups with RBAC, event management with external registration links, and Server-Sent Events (SSE) realtime notifications.

### Architecture & Non-Goals
- **Modular Monolith**: Clean Architecture (Interfaces $\rightarrow$ Application $\rightarrow$ Domain $\rightarrow$ Infrastructure) across 8 domain modules (`identity`, `profile`, `social`, `fishing`, `location`, `community`, `notification`, `discovery`, plus `moderation`).
- **Explicit Non-Goals**: No in-app chat, no video transcoding, no payment/cart/checkout, no GPS breadcrumb tracking, no AI fish recognition.
- **Initial Deployment**: Self-hosted Linux home server containerized via Docker Compose, protected by Cloudflare Tunnel (zero open ingress ports), ready for VPS migration.

---

## 2. Repository Structure

```text
/home/janissary/FishingBackend/
├── Cargo.toml                  # Workspace dependencies, compiler flags, and features
├── Cargo.lock                  # Deterministic dependency lockfile
├── Dockerfile                  # Multi-stage container build (rust:1.89 builder -> debian:bookworm runtime)
├── docker-compose.yml          # Local container stack: postgis/postgis:16-3.4-alpine & app service
├── .env.example                # Canonical environment variable configuration template
├── .gitignore                  # Git exclusions (target/, .env, storage/, etc.)
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI workflow (fmt, check, clippy, test against PostGIS)
├── migrations/                 # Sequential SQLx database schema migrations (000001 to 000013)
│   ├── 20260826000001_init_foundation.sql
│   ├── 20260826000002_create_identity_and_profiles.sql
│   ├── 20260826000003_create_media_and_social.sql
│   ├── 20260826000004_create_fishing_logbook.sql
│   ├── 20260826000005_create_location_and_places.sql
│   ├── 20260826000006_create_communities_and_events.sql
│   ├── 20260826000007_create_notifications_and_safety.sql
│   ├── 20260826000008_add_mentions_unique_index.sql
│   ├── 20260826000009_add_community_and_event_to_posts.sql
│   ├── 20260826000010_add_notifications_composite_index.sql
│   ├── 20260826000011_create_discovery_search_indexes.sql
│   ├── 20260826000012_add_user_roles_and_moderation.sql
│   └── 20260826000013_m13_performance_indexes.sql
├── scripts/                    # Verified operational scripts
│   ├── backup.sh               # pg_dump + media archive + SHA256 manifest generator
│   ├── restore.sh              # Disaster recovery restore verification script
│   ├── verify_backup.sh        # Backup integrity and SHA256 validation script
│   ├── maintenance.sh          # Periodic VACUUM ANALYZE, token/SSE cleanup, and log pruning
│   └── disk_check.sh           # Storage threshold monitoring alert script
├── src/                        # Rust application source code (< 500 LOC per file)
│   ├── main.rs                 # Process entry point, tracing init, TCP bind, graceful shutdown
│   ├── lib.rs                  # Library crate root exposing app, config, modules, shared
│   ├── app/                    # HTTP router, state, route definitions, signal handling
│   │   ├── mod.rs
│   │   ├── router.rs           # Base router, health probes, Prometheus exporter, middleware layers
│   │   ├── routes/             # Modular route registration sub-routers
│   │   ├── shutdown.rs         # POSIX signal handler (SIGINT / SIGTERM)
│   │   └── state.rs            # Centralized AppState (Arc<AppConfig>, PgPool, Storage, Hub)
│   ├── config/                 # Typed environment settings and parsing
│   │   ├── mod.rs
│   │   └── settings.rs         # AppConfig, ServerConfig, DatabaseConfig, OAuthConfig, MediaConfig
│   ├── shared/                 # Cross-cutting foundational infrastructure
│   │   ├── database/           # PostgreSQL repository implementations and connection pool
│   │   ├── error/              # Multi-tier AppError hierarchy and HTTP JSON error responses
│   │   ├── http/               # Request ID, rate limiting, pagination, security headers
│   │   ├── observability/      # Tracing initialization and Prometheus metrics registry
│   │   ├── authorization/      # Domain authorization policies and guards
│   │   └── storage/            # LocalFilesystemStorage and ImageStorage port trait
│   └── modules/                # 8 Isolated domain modules (< 500 LOC per file)
│       ├── identity/           # User, OAuth, Session domain, handlers, repositories, use cases
│       ├── profile/            # Profile, Username, Bio domain, handlers, repositories, use cases
│       ├── social/             # Post, Comment, Like, Follow, Mention, ImageProcessor, feeds
│       ├── fishing/            # FishingTrip, CatchRecord, Gear, Species, Logbook, stats
│       ├── location/           # FishingSpot, FishingPlace, SpotReview, PostGIS queries, privacy
│       ├── community/          # Community, Event, Memberships, Promotions, RBAC
│       ├── notification/       # Notification, NotificationHub, SSE realtime stream, events
│       ├── discovery/          # Full-text search (Trigram/GIN), bbox map queries
│       └── moderation/         # User suspension, content removal, audit reporting
├── storage/                    # Local runtime storage (git-ignored)
│   ├── media/                  # Sharded WebP image storage (media/display/, media/thumbnails/)
│   ├── temp_uploads/           # Bounded stream upload buffer
│   └── backups/                # Automated backup archives
├── tests/                      # Automated integration, performance, and unit test suites
└── docs/                       # Project architecture, design, and roadmap specifications
```

---

## 3. Prerequisites

Ensure the following tools are installed on your development workstation:

| Tool | Target Version | Verification Command | Purpose |
| :--- | :--- | :--- | :--- |
| **Rust / Cargo** | 1.84+ (Stable) | `rustc --version && cargo --version` | Compiler and package manager |
| **Docker Engine** | 24.0+ | `docker --version` | Container virtualization |
| **Docker Compose** | 2.20+ (Compose V2) | `docker compose version` | Multi-container local orchestration |
| **Git** | 2.30+ | `git --version` | Version control |
| **curl** | 7.68+ | `curl --version` | CLI HTTP test client |
| **PostgreSQL Client (Optional)** | 16+ | `psql --version` | Direct database inspection |

---

## 4. Technology Stack

| Layer / Component | Technology | Version | Purpose in Project |
| :--- | :--- | :--- | :--- |
| **Language** | Rust | 2021 Edition (1.84+) | Core systems language, memory safety, zero-cost abstractions |
| **HTTP Framework** | Axum | 0.8 | Fast, modular HTTP web routing, extractors, SSE streams |
| **Async Runtime** | Tokio | 1.43 (`full`) | Multi-threaded asynchronous execution, channels, timers |
| **Database Engine** | PostgreSQL | 16 | ACID relational persistence, GIN trigram indexes |
| **Spatial Engine** | PostGIS | 3.4 (`SRID 4326`) | Geospatial coordinates, GIST indexes, radius/bbox searches |
| **Database Client** | SQLx | 0.8 (`runtime-tokio`, `postgres`) | Async, compile-time checked SQL queries & migrations |
| **Serialization** | Serde / Serde JSON | 1.0 | JSON request/response envelope serialization |
| **Primary Keys** | UUIDv7 (`uuid` crate) | 1.12 (`v7`, `serde`) | Time-ordered 128-bit IDs, eliminates B-tree index fragmentation |
| **Image Processing** | `image` crate | 0.25 (WebP, JPEG, PNG) | EXIF GPS stripping, bounded-worker resizing (WebP Q80/Q75) |
| **Observability** | `tracing` & `tracing-subscriber` | 0.1 / 0.3 | Structured request tracing, JSON production logging |
| **Security & Auth** | Google OAuth 2.0 / SHA-256 | `sha2`, `hex`, `reqwest` | PKCE OAuth, hashed session cookies (`SHA-256(raw_token)`) |

---

## 5. Local Environment

There are two primary modes to develop and test the backend:

### Mode 1: Native Rust + Docker PostgreSQL (Recommended for Fast Iteration)
- Run PostgreSQL 16 + PostGIS inside Docker on port `5434`.
- Run the Rust application natively on your host machine using `cargo run`.
- **Benefits**: Instant compilation, incremental builds, fast unit/integration testing, direct debugger attachment.

### Mode 2: Full Docker Compose (Recommended for Container Parity)
- Run both `postgres` and `app` containers via `docker-compose.yml`.
- **Benefits**: 100% reproduction of the production container environment and health checks.

---

## 6. Environment Variables

All settings are configured via environment variables. The application loads `.env` on startup via `dotenvy`.

| Variable | Required? | Default in Development | Purpose | Example |
| :--- | :---: | :--- | :--- | :--- |
| `APP_ENV` | No | `development` | Environment mode (`development`, `test`, `production`) | `APP_ENV=development` |
| `APP_HOST` | No | `0.0.0.0` | IP interface address for HTTP listener | `APP_HOST=0.0.0.0` |
| `APP_PORT` | No | `3067` | Port for Axum HTTP server | `APP_PORT=3067` |
| `DATABASE_URL` | **Yes** | `postgres://fishing:fishing_secret@localhost:5434/fishing_db` | PostgreSQL connection string with credentials | `postgres://fishing:***@localhost:5434/fishing_db` |
| `DATABASE_MIN_CONNECTIONS` | No | `5` | Minimum idle connections in SQLx pool | `DATABASE_MIN_CONNECTIONS=5` |
| `DATABASE_MAX_CONNECTIONS` | No | `25` | Maximum active connections in SQLx pool | `DATABASE_MAX_CONNECTIONS=25` |
| `DATABASE_ACQUIRE_TIMEOUT_SECS` | No | `5` | Pool connection acquisition timeout in seconds | `DATABASE_ACQUIRE_TIMEOUT_SECS=5` |
| `DATABASE_AUTO_MIGRATE` | No | `true` | Automatically run pending SQLx migrations on startup | `DATABASE_AUTO_MIGRATE=true` |
| `GOOGLE_CLIENT_ID` | No | `mock_google_client_id` | Google OAuth 2.0 Client ID | `GOOGLE_CLIENT_ID=mock_id` |
| `GOOGLE_CLIENT_SECRET` | No | `mock_google_client_secret` | Google OAuth 2.0 Client Secret (Never commit!) | `GOOGLE_CLIENT_SECRET=mock_secret` |
| `GOOGLE_REDIRECT_URI` | No | `https://api-fishing.janissaryid.com/api/v1/auth/google/callback` | OAuth callback **default** (fallback bila Host tidak cocok dengan `OAUTH_CALLBACK_BASES`) | `GOOGLE_REDIRECT_URI=https://api-fishing.janissaryid.com/...` |
| `OAUTH_CALLBACK_BASES` | No | *(kosong → pakai origin dari `GOOGLE_REDIRECT_URI`)* | Daftar base URL tempat API diakses (comma-separated). Callback OAuth ditentukan per-request dari header `Host` + `x-forwarded-proto`. **Setiap entry wajib didaftarkan di Google Cloud Console** | `OAUTH_CALLBACK_BASES=http://localhost:3067,https://api-fishing.janissaryid.com` |
| `ALLOWED_FRONTEND_REDIRECTS` | No | *(kosong → hanya `FRONTEND_REDIRECT_URL`)* | URL frontend yang boleh dipakai sebagai `?redirect_to=` (web dev, web prod, deep link mobile) | `ALLOWED_FRONTEND_REDIRECTS=http://localhost:5173,https://app.example.com` |
| `CORS_ALLOWED_ORIGINS` | No | *(kosong → mode permisif tanpa credentials)* | Origin yang boleh mengirim **credentialed** request (comma-separated, tanpa trailing slash). Wajib diisi agar browser lintas-origin bisa mengirim cookie | `CORS_ALLOWED_ORIGINS=http://localhost:5173,https://app.example.com` |
| `FRONTEND_REDIRECT_URL` | No | `/` | Target redirect default (selalu diizinkan, dipakai bila `redirect_to` tidak dikirim) | `FRONTEND_REDIRECT_URL=https://app.example.com` |
| `SESSION_TTL_SECS` | No | `2592000` (30 days) | Session expiration time in seconds | `SESSION_TTL_SECS=2592000` |
| `MEDIA_STORAGE_DIR` | No | `./storage/media` | Target filesystem directory for WebP variants | `MEDIA_STORAGE_DIR=./storage/media` |
| `MEDIA_UPLOAD_TEMP_DIR` | No | `./storage/temp_uploads` | Temporary upload streaming buffer directory | `MEDIA_UPLOAD_TEMP_DIR=./storage/temp_uploads` |
| `MEDIA_MAX_UPLOAD_SIZE_BYTES` | No | `15728640` (15 MB) | Maximum upload payload size limit in bytes | `MEDIA_MAX_UPLOAD_SIZE_BYTES=15728640` |
| `MEDIA_MAX_CONCURRENT_WORKERS` | No | `4` | Tokio semaphore worker limit for image resizing | `MEDIA_MAX_CONCURRENT_WORKERS=4` |
| `RUST_LOG` | No | `info,fishing_backend=debug,tower_http=info` | Tracing log filter directive | `RUST_LOG=debug` |
| `LOG_FORMAT_JSON` | No | `false` | Enable structured JSON logging format (true in prod) | `LOG_FORMAT_JSON=false` |

---

## 7. First-Time Setup

Run the following verified step-by-step sequence to get the environment ready:

```bash
# 1. Navigate to workspace
cd /home/janissary/FishingBackend

# 2. Copy the environment configuration template
cp .env.example .env

# 3. Start PostgreSQL with PostGIS in Docker (runs on host port 5434)
docker compose up -d postgres

# 4. Verify database container health (wait for status: healthy)
docker compose ps postgres

# 5. Verify compilation and build dependencies
cargo check --all-targets

# 6. Run automated test suite (executes migrations automatically)
cargo test --all-targets
```

---

## 8. Start the Project

### Recommended: Native Run (with Docker PostgreSQL)
Ensure PostgreSQL is running, then execute:
```bash
cargo run
```
*The server will initialize logging, run pending migrations automatically, and bind to `http://0.0.0.0:3000`.*

### Alternative: Full Container Stack
```bash
docker compose up -d --build
```
*Starts both `fishing_postgres` and `fishing_app` containers in the background.*

---

## 9. Stop the Project

### Stop Native Run
Press `Ctrl + C` in the terminal running `cargo run`. The server triggers graceful shutdown, finishes in-flight requests, releases database pools, and exits cleanly.

### Stop Docker Services
```bash
# Gracefully stop containers without removing networks or volumes (SAFE)
docker compose stop

# Stop and remove containers and network (SAFE - preserves data in pgdata volume)
docker compose down

# ⚠️ DESTRUCTIVE: Stop containers AND permanently erase all PostgreSQL data & volumes
docker compose down -v
```

---

## 10. Restart the Project

```bash
# Restart only the application container
docker compose restart app

# Full restart of the Docker environment
docker compose down && docker compose up -d
```

---

## 11. Docker Workflow

The `docker-compose.yml` file manages two core services:
- `postgres`: Image `postgis/postgis:16-3.4-alpine`, mapped to host port `5434:5432`.
- `app`: Built from `Dockerfile`, mapped to host port `3000:3000`.

### Essential Docker Commands
```bash
# Check service health and port mappings
docker compose ps

# View live application logs
docker compose logs -f app

# View live PostgreSQL logs
docker compose logs -f postgres

# Execute interactive psql inside PostgreSQL container
docker compose exec postgres psql -U fishing -d fishing_db

# Rebuild application container after code changes
docker compose build app && docker compose up -d app
```

---

## 12. Database Workflow

The database is PostgreSQL 16 with PostGIS 3.4 enabled.

### Connecting via psql
```bash
# Connect through Docker exec (no local psql required):
docker compose exec postgres psql -U fishing -d fishing_db

# Or connect directly if PostgreSQL client tools are installed locally:
PGPASSWORD=fishing_secret psql -h localhost -p 5434 -U fishing -d fishing_db
```

---

## 13. Database Migrations

Migrations live in `migrations/` as raw SQL files with timestamp prefixes (`YYYYMMDDHHMMSS_name.sql`).

### How Migrations Execute
1. **Automatic on Startup**: When `DATABASE_AUTO_MIGRATE=true`, the application executes `sqlx::migrate!("./migrations").run(&pool)` on boot.
2. **Deterministic Tracking**: SQLx records executed migrations in the `_sqlx_migrations` internal table.

### Creating a New Migration
1. Generate a new file in `migrations/` with a current UTC timestamp:
   ```bash
   # Example: migrations/20260829000014_add_custom_feature.sql
   touch migrations/$(date -u +"%Y%m%d%H%M%S")_add_custom_feature.sql
   ```
2. Write raw SQL DDL/DML statements.
3. Keep migrations idempotent using `IF NOT EXISTS` where appropriate.
4. Restart the application or run tests to apply.

---

## 14. Development Database Reset

If you need a completely clean database state during development:

> ⚠️ **DESTRUCTIVE**: Destroys all local development database state, tables, and rows. Never use in production.

```bash
# 1. Stop containers and purge the Docker named volume
docker compose down -v

# 2. Restart PostgreSQL with fresh storage
docker compose up -d postgres

# 3. Wait 3 seconds for healthcheck, then run migrations via cargo test
sleep 3
cargo test --test health_tests
```

---

## 15. Run the Application Without Docker

If you run PostgreSQL natively on Linux without Docker:
1. Ensure PostgreSQL 16 + PostGIS is running.
2. Create database `fishing_db` and user `fishing`:
   ```sql
   CREATE USER fishing WITH PASSWORD 'fishing_secret';
   CREATE DATABASE fishing_db OWNER fishing;
   \c fishing_db
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
3. Set `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL=postgres://fishing:fishing_secret@localhost:5432/fishing_db
   ```
4. Run `cargo run`.

---

## 16. Run Tests

The repository maintains unit, integration, and performance benchmarks under `tests/`.

```bash
# Run ALL tests across all targets
cargo test --all-targets

# Run tests in a specific test suite file
cargo test --test health_tests
cargo test --test database_tests
cargo test --test auth_integration_tests
cargo test --test post_api_tests
cargo test --test social_feed_api_tests
cargo test --test location_spot_api_tests

# Run a specific single test with terminal output displayed
cargo test test_health_live_endpoint -- --nocapture
```

---

## 17. Format and Lint

All code must pass strict formatting and Clippy linter checks with zero warnings.

```bash
# Check code formatting (CI verification)
cargo fmt --all -- --check

# Automatically format all Rust source files
cargo fmt --all

# Run Clippy linter with strict warning enforcement
cargo clippy --all-targets --all-features -- -D warnings

# Quick syntax and type compilation check
cargo check --all-targets
```

---

## 18. Integration Tests

Integration tests run against the live PostgreSQL + PostGIS database configured via `DATABASE_URL`.

- **Automatic Pool & Migration Setup**: Integration tests use helper functions in `tests/common/mod.rs` to initialize connections and execute migrations on demand.
- **Isolated User Fixtures**: Tests generate unique UUIDv7 identifiers and isolated test emails (`user_<uuid>@fishing.test`) to prevent cross-test interference.

---

## 19. End-to-End Tests

E2E user journey tests simulate realistic multi-persona workflows across HTTP using `tower::ServiceExt::oneshot`:
- User registration $\rightarrow$ Profile setup $\rightarrow$ Post creation $\rightarrow$ Media upload $\rightarrow$ Fishing Trip $\rightarrow$ Catch logging $\rightarrow$ Spot review $\rightarrow$ Notification dispatch $\rightarrow$ Account deletion.
- Execute via:
  ```bash
  cargo test --test m14_e2e_user_journey_tests
  cargo test --test m14_e2e_community_and_notifications_tests
  ```

---

## 20. Health Checks

The server exposes three health endpoints:

### 1. `GET /health/live` (or `GET /health`)
- **Purpose**: Kubernetes/Docker process liveness probe.
- **Dependency**: Process only. Zero database interaction. Always returns `200 OK`.
- **Curl Example**:
  ```bash
  curl -s http://localhost:3000/health/live
  ```
- **Response**:
  ```json
  {
    "status": "healthy",
    "service": "fishing_backend",
    "version": "0.1.0",
    "timestamp": "2026-08-29T11:29:31.754Z"
  }
  ```

### 2. `GET /health/ready`
- **Purpose**: Readiness probe. Validates PostgreSQL connectivity.
- **Response**:
  - `200 OK` (`"database": "connected"`) when DB is reachable.
  - `503 Service Unavailable` (`"database": "disconnected"`) when DB connection fails.
- **Curl Example**:
  ```bash
  curl -s http://localhost:3000/health/ready
  ```

### 3. `GET /metrics` (and `GET /api/v1/metrics`)
- **Purpose**: Prometheus exposition format for request counts, latencies, active DB connections, and SSE clients.
- **Curl Example**:
  ```bash
  curl -s http://localhost:3000/metrics
  ```

---

## 21. Logging and Troubleshooting

- Structured logging is powered by `tracing`.
- **Log Level**: Configure via `RUST_LOG` (e.g. `RUST_LOG=debug`, `RUST_LOG=info,fishing_backend=debug`).
- **Format**: Set `LOG_FORMAT_JSON=true` for machine-readable JSON logs in production, or `LOG_FORMAT_JSON=false` for colorized terminal output in development.
- **Request Correlation**: Every request is tagged with an `x-request-id` header (UUIDv7) that propagates through all log spans.

---

## 22. API Development

All REST API endpoints are versioned and mounted under `/api/v1/`.

### Modular Organization
- Route registration: `src/app/routes/<module>.rs`
- Axum request handlers: `src/modules/<module>/handlers.rs`
- Inbound/Outbound DTOs: `src/modules/<module>/dtos.rs`
- Pure domain models: `src/modules/<module>/domain.rs`
- Application use cases: `src/modules/<module>/use_cases/`
- SQLx repositories: `src/shared/database/postgres_<entity>_repository.rs`

---

## 23. Local API Usage

### Standard JSON Envelopes
- **Single Resource**: `{"data": { ... }}`
- **Paginated Collection**: `{"data": [ ... ], "pagination": {"next_cursor": "...", "has_more": true, "limit": 20}}`
- **Error Response**: `{"error": {"code": "VALIDATION_FAILED", "message": "...", "request_id": "...", "details": [...]}}`

### Example Endpoint Requests

#### 1. Check Username Availability
```bash
curl -s "http://localhost:3000/api/v1/profiles/check-username?username=striker_bob"
```

#### 2. Query Fishing Spots in Bounding Box
```bash
curl -s "http://localhost:3000/api/v1/locations/spots?min_lat=37.7&min_lng=-122.5&max_lat=37.9&max_lng=-122.3"
```

#### 3. Search Users, Spots, and Places
```bash
curl -s "http://localhost:3000/api/v1/discovery/search?q=bass&limit=10"
```

---

## 24. Authentication Development

Authentication uses Google OAuth 2.0 dengan **`state` CSRF** (bukan PKCE) dan server-side PostgreSQL sessions.

### Local Development Flow
1. **Initiate Login**: Arahkan browser (top-level navigation) ke `http://localhost:3067/api/v1/auth/google?redirect_to=http://localhost:5173`. Endpoint membuat cookie `oauth_state` (+ `oauth_redirect` bila `redirect_to` dikirim) lalu membalas `307 Temporary Redirect` ke Google.
2. **OAuth Callback**: Google redirects back to `http://localhost:3067/api/v1/auth/google/callback?code=...&state=...`.
   `redirect_uri` ditentukan per-request dari header `Host` (lihat `OAUTH_CALLBACK_BASES`).
3. **Session Cookie**: The backend creates or finds the `User`, hashes the raw session token via `SHA-256`, stores it in the `sessions` table, and sets cookie `fishing_session=<raw_token>; HttpOnly; SameSite=Lax; Path=/`.
4. **Current User Endpoint** (tidak ada `/auth/me` — pakai `/auth/session` atau `/users/me`):
   ```bash
   curl -s -b "fishing_session=<raw_session_token>" http://localhost:3067/api/v1/auth/session
   ```

> Setup per environment (mobile native / web local / web production): lihat [`CLIENT_SETUP.md`](./CLIENT_SETUP.md).

---

## 25. Session Development

- Raw session tokens are never stored in the database. PostgreSQL stores only `session_hash = SHA256(raw_token)`.
- Session expiration defaults to 30 days (`SESSION_TTL_SECS=2592000`).
- To inspect active sessions for a user during development:
  ```sql
  SELECT id, user_id, ip_address, created_at, expires_at FROM sessions ORDER BY created_at DESC LIMIT 5;
  ```

---

## 26. File and Image Storage

Media storage adheres to the `ImageStorage` port trait (`src/shared/storage/mod.rs`).

- **Local Storage Root**: `./storage/media` (configured via `MEDIA_STORAGE_DIR`).
- **Temporary Upload Buffer**: `./storage/temp_uploads` (configured via `MEDIA_UPLOAD_TEMP_DIR`).
- **Two-Level Prefix Sharding**: To prevent filesystem directory inode exhaustion, files are saved with two-level hex prefixes based on their UUIDv7 ID:
  - Display variant (max 1920x1080 WebP Q80): `./storage/media/display/01/8d/018d45f0-xxxx.webp`
  - Thumbnail variant (max 400x400 WebP Q75): `./storage/media/thumbnails/01/8d/018d45f0-xxxx.webp`

---

## 27. Media Development

### Uploading an Image via curl
```bash
curl -X POST \
  -b "fishing_session=<session_token>" \
  -F "file=@/path/to/test_image.jpg" \
  http://localhost:3000/api/v1/media/upload
```
*Response returns the generated `media_id`, display URL, and thumbnail URL.*

### Processing Pipeline
1. Direct streaming to temp disk (zero unbounded RAM buffering).
2. MIME verification via magic bytes (JPEG, PNG, WebP).
3. Tokio Semaphore limits concurrent resizing workers to 4 (`MEDIA_MAX_CONCURRENT_WORKERS`).
4. Automated EXIF / GPS metadata stripping.
5. Re-encoding to optimized WebP format.

---

## 28. Seed / Fixture Data

Integration tests automatically insert verified seed records (species dictionary, test spots, test communities).
- Standard fish species records are populated by default through migration `migrations/20260826000004_create_fishing_logbook.sql`.
- Query all available species:
  ```bash
  curl -s http://localhost:3000/api/v1/fishing/species
  ```

---

## 29. Background Tasks

Periodic maintenance and retention tasks are managed via scripts in `scripts/`:
- `scripts/maintenance.sh`: Purges expired sessions, soft-deleted records older than 90 days, and unreferenced temporary media files.
- Run manually:
  ```bash
  ./scripts/maintenance.sh
  ```

---

## 30. SSE Development

Realtime notifications use Server-Sent Events (SSE) mounted at `GET /api/v1/notifications/stream`.

### Connecting via curl
```bash
curl -N -H "Accept: text/event-stream" \
  -b "fishing_session=<session_token>" \
  http://localhost:3000/api/v1/notifications/stream
```
*Keeps the connection open and streams JSON events whenever a like, comment, follow, mention, or catch occurs.*

---

## 31. PostgreSQL Inspection

Practical development inspection queries:

```sql
-- Check table record counts
SELECT 'users' AS tbl, count(*) FROM users
UNION ALL SELECT 'posts', count(*) FROM posts
UNION ALL SELECT 'catches', count(*) FROM catch_records
UNION ALL SELECT 'spots', count(*) FROM fishing_spots;

-- Check migration history
SELECT version, description, installed_on, success FROM _sqlx_migrations ORDER BY version ASC;

-- Check PostGIS version and spatial extension status
SELECT PostGIS_Full_Version();

-- Inspect active database connections
SELECT pid, usename, client_addr, state, query FROM pg_stat_activity WHERE datname = 'fishing_db';
```

---

## 32. Common Troubleshooting

| Problem | Likely Cause | Verification | Solution |
| :--- | :--- | :--- | :--- |
| **Port 5434 in use** | Stale PostgreSQL container or local service | `lsof -i :5434` or `docker ps` | Stop conflicting container with `docker stop <name>` |
| **Database connection refused** | PostgreSQL container not started or unhealthy | `docker compose ps` | Run `docker compose up -d postgres` and wait 5s |
| **Migration conflict / failure** | Modified existing migration file | Check `_sqlx_migrations` table | Never edit past migrations. Create a new timestamped migration |
| **`health/ready` returns 503** | Application cannot ping DB pool | Check `DATABASE_URL` in `.env` | Ensure port is `5434` for Docker or `5432` for native DB |
| **Clippy fails in CI** | Unused variables or unhandled Result | `cargo clippy -- -D warnings` | Fix the specific warning; do not add global `#![allow(...)]` |
| **Permission denied on media storage** | Storage directories not writable | `ls -ld storage/` | Run `mkdir -p storage/{media,temp_uploads} && chmod -R 775 storage` |
| **Large file upload fails (413)** | Payload exceeds 15 MB limit | Check upload file size | Ensure uploaded image is $< 15\text{ MB}$ |

---

## 33. Development Workflow

Follow this systematic loop for every task:
1. **Read Documentation**: Check `docs/PROJECT_GUIDE.md` and the relevant domain documentation.
2. **Inspect Existing Code**: Search existing types and repository methods before creating new ones.
3. **Implement Cleanly**: Maintain Clean Architecture boundaries. Keep pure domain entities free from Axum/SQLx dependencies.
4. **Write Tests**: Add unit tests in `src/` and integration tests in `tests/`.
5. **Quality Gate Pass**:
   ```bash
   cargo fmt --all
   cargo clippy --all-targets --all-features -- -D warnings
   cargo test --all-targets
   ```
6. **Review Diff**: Ensure no files approach the 500 LOC limit and no debug code remains.

---

## 34. Code Quality Rules

- **Mandatory 500 LOC Hard Limit**: No source file may exceed 500 lines of code. Preferred $< 300\text{ LOC}$. Split modules, extract use cases, or separate repositories when approaching this threshold.
- **Zero Global Clippy Suppressions**: Never place `#![allow(...)]` at the crate level. Address the root cause.
- **Pure Domain Layer**: Domain entities must never import `axum`, `sqlx`, `tokio`, or filesystem crates.
- **Explicit Transactions**: Use atomic database transactions (`pool.begin()`) whenever mutating multiple tables.

---

## 35. Database Change Workflow

1. Document the required table or column addition.
2. Create a new sequential migration script in `migrations/YYYYMMDDHHMMSS_<description>.sql`.
3. Update pure domain structs in `src/modules/<module>/domain.rs`.
4. Update SQLx repository queries in `src/shared/database/postgres_<entity>_repository.rs`.
5. Add integration test assertions in `tests/` verifying schema persistence.
6. Run `cargo test` to execute and validate the migration.

---

## 36. API Change Workflow

1. Review proposed route against `docs/API_CONVENTIONS.md`.
2. Define DTO structs in `src/modules/<module>/dtos.rs` with Serde derives.
3. Implement handler function in `src/modules/<module>/handlers.rs`.
4. Register route in `src/app/routes/<module>.rs`.
5. Write HTTP integration test simulating requests via Axum router.

---

## 37. Security Checklist

Before committing any feature, verify:
- [ ] **Authentication**: Endpoint requires valid session cookie unless explicitly public.
- [ ] **Authorization / IDOR**: User can only modify/delete their own resources.
- [ ] **SQL Injection**: 100% of queries use parameterized `$1, $2` placeholders via SQLx. Zero raw string interpolation.
- [ ] **Privacy**: Location coordinates are masked according to `LocationPrivacy` tier before returning JSON.
- [ ] **Credentials**: Passwords, tokens, and OAuth secrets are masked in debug logs and error responses.
- [ ] **EXIF Stripping**: Uploaded images are re-encoded through the image pipeline with metadata removed.

---

## 38. Pre-Commit Checklist

```bash
# 1. Formatting
cargo fmt --all -- --check

# 2. Compilation
cargo check --all-targets

# 3. Strict Linter
cargo clippy --all-targets --all-features -- -D warnings

# 4. Test Suite
cargo test --all-targets

# 5. File Size Verification (Check if any file exceeds 500 lines)
find src tests -name "*.rs" -exec wc -l {} + | awk '$1 > 500 { print "EXCEEDS 500 LOC:", $2, "("$1" lines)" }'
```

---

## 39. Pre-Merge Checklist

- [ ] Milestone scope respected (no out-of-scope feature creep).
- [ ] All automated tests pass with 100% success rate.
- [ ] Zero compiler or Clippy warnings.
- [ ] No uncommitted `.env` or temporary files.
- [ ] Documentation updated to reflect any API or configuration modifications.

---

## 40. CI Expectations

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request:
1. **Static Quality Job**: `cargo fmt -- --check`, `cargo check`, `cargo clippy -- -D warnings`.
2. **Test Job**: Runs against a live `postgis/postgis:16-3.4-alpine` service container and executes `cargo test --all-targets`.

You can reproduce CI locally by running:
```bash
cargo fmt --all -- --check && \
cargo check --all-targets && \
cargo clippy --all-targets --all-features -- -D warnings && \
cargo test --all-targets
```

---

## 41. Release Preparation

1. Verify all migrations are tested and committed.
2. Build optimized release binary:
   ```bash
   cargo build --release
   ```
3. Execute backup script to ensure data safety:
   ```bash
   ./scripts/backup.sh
   ```
4. Verify release binary boots and passes health checks:
   ```bash
   ./target/release/fishing_backend
   ```

---

## 42. Backup / Restore for Development

The repository includes verified disaster recovery scripts under `scripts/`:

```bash
# Create full backup (DB dump + media archive + manifest in storage/backups/):
./scripts/backup.sh

# Verify integrity and SHA256 checksums of latest backup:
./scripts/verify_backup.sh

# Restore from a backup archive:
./scripts/restore.sh ./storage/backups/<TIMESTAMP>
```

---

## 43. Local Cleanup

```bash
# Clean Cargo target build artifacts
cargo clean

# Remove temporary upload buffers
rm -rf ./storage/temp_uploads/*

# Remove old development backup dumps
rm -rf ./storage/backups/*
```

---

## 44. Frequently Used Commands

```bash
# Development & Testing
cargo run                                                  # Start native dev server
cargo test --all-targets                                   # Run all tests
cargo fmt --all                                            # Format source code
cargo clippy --all-targets --all-features -- -D warnings   # Run strict linter

# Docker Operations
docker compose up -d postgres                              # Start PostGIS DB container
docker compose up -d --build                               # Rebuild and run entire stack
docker compose ps                                          # View container status
docker compose logs -f app                                 # View application logs
docker compose down                                        # Stop containers (preserves DB volume)
docker compose down -v                                     # ⚠️ Erase all containers & DB volume
```

---

## 45. Known Development Limitations

1. **Google OAuth**: Full real-world browser OAuth login requires valid Google Developer Console client credentials and matching redirect URIs. Mock OAuth fixtures are provided for automated testing.
2. **HTTPS & Cookies**: Browser cookie security flags (`Secure`) require HTTPS or `localhost` testing. Set `COOKIE_SECURE=false` during local HTTP development.
3. **Local Storage Path**: Media uploads require write permissions to the `./storage/` folder on your host machine.

---

## 46. Documentation Maintenance

Update this `DEVELOPER_HANDBOOK.md` whenever:
- Host ports or environment variables change in `.env.example` or `docker-compose.yml`.
- New operational scripts are added to `scripts/`.
- Major architectural dependencies or Rust toolchain requirements are upgraded.
- New test suites or quality check commands are introduced.

---

## 47. Command Matrix

| Task | Command | Environment | Destructive? |
| :--- | :--- | :--- | :---: |
| **Start Database** | `docker compose up -d postgres` | Development | No |
| **Start Application** | `cargo run` | Development | No |
| **Start Full Stack** | `docker compose up -d --build` | Development | No |
| **Stop Stack** | `docker compose down` | Development | No |
| **Reset Database** | `docker compose down -v` | Development Only | **YES** |
| **Run All Tests** | `cargo test --all-targets` | Development / CI | No |
| **Format Check** | `cargo fmt --all -- --check` | Development / CI | No |
| **Linter Check** | `cargo clippy --all-targets --all-features -- -D warnings` | Development / CI | No |
| **Create Backup** | `./scripts/backup.sh` | Dev / Staging / Prod | No |
| **Restore Backup** | `./scripts/restore.sh <dir>` | Dev / Staging / Prod | **YES** |
| **Run Maintenance** | `./scripts/maintenance.sh` | Dev / Staging / Prod | No |
