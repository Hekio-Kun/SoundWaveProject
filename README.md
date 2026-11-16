# SoundWave

SoundWave is a full-stack music streaming, synced lyrics, creator publishing, and content moderation web platform built as a **Java 21 / Spring Boot** modular monolith and a **React / TypeScript / Vite** single-page application.

Designed around a light-first **Ocean Breeze & Warm Sand** aesthetic (`#0284C7` ocean blue & `#D4A373` / `#F6EFE3` warm sand), SoundWave supports four role workflows: **Guest**, **Listener / Creator**, **Staff**, and **Admin**.

---

## Table of Contents

- [Core Features by Role](#core-features-by-role)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment & Configuration](#environment--configuration)
- [Running Locally](#running-locally)
- [Database & Architecture Docs](#database--architecture-docs)
- [Development Guidelines](#development-guidelines)

---

## Core Features by Role

### Guest & Public Discovery
- Browse **Explore**, **Filtered Catalog**, **Ranking Board**, **Genres**, **Albums**, **Track Details**, and **Creator Profiles**
- Run **Public Search** across catalog content
- Stream published tracks and view synced lyrics

### Listener & Library
- Dual-portal account registration with **6-digit email OTP verification**, login, password reset, and account unlock flows
- Manage personal **Profile** (`ProfilePage`) and **Library** (**Favorites**, **Playlists**, and **Listening History**)
- Create, edit, and manage personal synced `.lrc` lyrics (`TrackLyricsEditorPage`, `PersonalLyricController`)
- Submit content/copyright **Reports** with optional proof documents and track report resolution history (`ReportTrackPage`, `ReportsHistoryPage`)
- Receive in-app notifications (`NotificationController`)

### Creator Studio
- Upload and manage tracks (`UploadTrackPage`, `StudioTrackDetailPage`, `StudioTrackController`)
- Create and manage albums (`CreateAlbumPage`, `StudioAlbumDetailPage`, `StudioAlbumController`)
- Submit tracks and one-time **Official Lyrics** proposals for staff review

### Staff Moderation
- Dedicated **Staff / Admin** portal (`StaffLoginPage`)
- Review pending track submissions (`StaffDashboardPage`, `ModerationController`)
- Adjudicate **Reported Tracks** and download reporter proof documents directly from cloud storage (`StaffContentReportsPage`, `StaffContentReportController`)
- Review and approve/reject **Official Lyrics** submissions with synchronized audio auditioning (`StaffLyricsManagementPage`, `StaffOfficialLyricController`)

### Admin Operations
- View platform **Operations & Statistics** (`OperationsDashboardPage`, `AdminStatisticsController`)
- Manage **Staff Accounts** (`AdminStaffManagementPage`, `AdminStaffController`)
- Manage music **Genres** (`AdminGenreManagementPage`, `AdminGenreController`)

---

## Tech Stack

### Backend (`backend/`)
- **Language & Runtime**: Java `21`
- **Framework**: Spring Boot `4.1.1` (`spring-boot-starter-parent`)
- **Modules**: Spring Web MVC, Spring Data JPA, Spring Security, Bean Validation, Spring Mail
- **Authentication**: JWT via `jjwt` `0.12.6` + rotating `HttpOnly` refresh token cookies
- **Database**: PostgreSQL (`org.postgresql:postgresql`)
- **Media Storage**: Cloudinary (`com.cloudinary:cloudinary-http5` `2.5.0`)
- **Utilities & Testing**: Lombok, Spring Boot Test starters (`webmvc`, `data-jpa`)

### Frontend (`frontend/`)
- **UI Library**: React `^19.2.6`, React DOM `^19.2.6`
- **Language**: TypeScript `~6.0.2`
- **Build Tool**: Vite `^8.0.12` (`@vitejs/plugin-react` `^6.0.1`)
- **Routing & Styling**: History API routing (`src/hooks/useRouter.ts`, `src/utils/navigation.ts`) + custom CSS tokens (`src/styles.css`, `src/dashboard.css`, `src/app-shell.css`, `src/lyrics-editor.css`, `src/redesign.css`)

---

## Repository Structure

```text
SoundWaveProject/
├── .env.example                            # Root environment variable template
├── AGENTS.md                               # AI workflow, coding standards, and Git safety rules
├── agent/                                  # Role-specific guides (AGENTS_BACKEND.md, AGENTS_FRONTEND.md, etc.)
├── diagram/                                # Draw.io sources and UML class / sequence diagrams
├── docs/
│   └── database/
│       └── soundwave_schema.dbml           # DBML database schema reference
├── backend/
│   ├── AUTHENTICATION_SETUP.md             # Dual-portal auth, OTP, JWT & CORS reference
│   ├── ENTITY_OWNERSHIP.md                 # 21-table module ownership specification
│   ├── pom.xml                             # Maven dependencies (Spring Boot 4.1.1, Java 21)
│   ├── mvnw / mvnw.cmd                     # Maven Wrapper scripts
│   ├── database/
│   │   ├── schema_soundwave.sql            # Core PostgreSQL schema
│   │   ├── migrations/                     # Incremental SQL migrations
│   │   └── seeds/                          # Local & dataset seed scripts
│   └── src/main/
│       ├── resources/
│       │   └── application.properties.example
│       └── java/groupone/soundwaveproject/
│           ├── admin/                      # Admin statistics & staff account management
│           ├── authentication/             # Auth, email OTP, password reset, profile
│           ├── catalog/                    # Public tracks, albums, genres, search
│           ├── config/                     # Security, CORS, data seeding configuration
│           ├── exception/                  # Global API exception handling
│           ├── library/                    # Favorites, playlists, listening history
│           ├── lyrics/                     # Official & personal synced lyrics
│           ├── media/                      # Cloudinary upload & download integration
│           ├── moderation/                 # Track moderation & report adjudication
│           ├── notification/               # Notification delivery & management
│           ├── security/                   # JWT & Spring Security filters
│           └── studio/                     # Creator track & album management
└── frontend/
    ├── AGENTS.md                           # Frontend conventions
    ├── package.json                        # React 19, TypeScript 6, Vite 8 scripts
    ├── vite.config.ts                      # Vite configuration
    └── src/
        ├── api/                            # HTTP client & API integration modules
        ├── components/                     # UI, layout, and player components
        ├── context/                        # React state providers
        ├── hooks/                          # Router & utility hooks
        ├── layouts/                        # MusicAppShell & DashboardLayout
        ├── pages/                          # Public, Library, Studio, Staff, and Admin views
        ├── routes/                         # Route declarations & access guards
        └── utils/                          # Date & navigation helpers
```

---

## Prerequisites

- **Java Development Kit (JDK) 21**
- **Node.js** & **npm**
- **PostgreSQL** (local instance or hosted PostgreSQL such as Neon)
- **SMTP Credentials** (e.g., a Gmail account with an App Password for OTP and password-reset emails)
- **Cloudinary Account** (for audio tracks, cover art, and content-report proof files)

---

## Environment & Configuration

> **Security Note:** Never commit `.env`, `application.properties`, or `application-local.properties` containing real database credentials, SMTP passwords, JWT secrets, or Cloudinary keys. Always configure from the provided `.example` templates.

1. **Create environment variables** from [`.env.example`](.env.example) (or [`backend/.env.example`](backend/.env.example)) and copy [`backend/src/main/resources/application.properties.example`](backend/src/main/resources/application.properties.example) to your local Spring properties file.

2. **Key environment variables / properties**:

| Category | Variables / Keys | Purpose |
| :--- | :--- | :--- |
| **Database** | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JPA_DDL_AUTO` | PostgreSQL JDBC URL, credentials, and Hibernate DDL mode |
| **Email / OTP** | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `OTP_EXPIRATION_MINUTES`, `OTP_RESEND_SECONDS` | Outbound SMTP settings and OTP expiration/cooldown |
| **JWT & Cookies** | `JWT_SECRET`, `ACCESS_TOKEN_MINUTES`, `REFRESH_TOKEN_DAYS`, `REMEMBER_REFRESH_TOKEN_DAYS`, `REFRESH_COOKIE_SECURE` | Signing secret (32+ random chars) and token lifetimes |
| **CORS** | `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins (defaults to `http://127.0.0.1:4174,http://localhost:4174`) |
| **Bootstrap Accounts** | `ADMIN_AUTO_CREATE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_DISPLAY_NAME`, `STAFF_AUTO_CREATE`, `STAFF_EMAIL`, `STAFF_PASSWORD`, `STAFF_USERNAME`, `STAFF_DISPLAY_NAME`, `DEMO_SEED_ENABLED` | Optional initial Admin/Staff bootstrap and demo seeding |
| **Cloudinary** | `app.cloudinary.*` (in `application.properties.example`) | Cloud name, API key, and API secret for media assets |
| **Frontend API URL** | `VITE_API_BASE_URL` (optional) | Overrides the default `http://<hostname>:8080/api/v1` API base URL |

3. **Initialize PostgreSQL**:
   - Create an empty PostgreSQL database matching `DB_URL`.
   - Apply `backend/database/schema_soundwave.sql` (and any needed scripts in `backend/database/migrations/` or `backend/database/seeds/`), or configure `JPA_DDL_AUTO` appropriately for local development.

---

## Running Locally

### 1. Start the Backend (`http://localhost:8080`)

On **Windows** (PowerShell / CMD):
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

On **macOS / Linux**:
```bash
cd backend
./mvnw spring-boot:run
```

Run backend tests:
```powershell
cd backend
.\mvnw.cmd test
```

### 2. Start the Frontend (`http://127.0.0.1:4174`)

```bash
cd frontend
npm install
npm run dev
```

Additional frontend scripts (from `frontend/package.json`):
- **Typecheck**: `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`)
- **Production build**: `npm run build` (`tsc -b && vite build`)
- **Preview build**: `npm run preview` (`vite preview --host 127.0.0.1 --port 4174`)

---

## Database & Architecture Docs

- **Authentication & Dual-Portal Setup**: [`backend/AUTHENTICATION_SETUP.md`](backend/AUTHENTICATION_SETUP.md)
- **Database Entity Ownership (21 Tables)**: [`backend/ENTITY_OWNERSHIP.md`](backend/ENTITY_OWNERSHIP.md)
- **DBML Schema**: [`docs/database/soundwave_schema.dbml`](docs/database/soundwave_schema.dbml)
- **Architecture & UML Diagrams**: [`diagram/`](diagram/)

---

## Development Guidelines

- **Monorepo Rules**: See [`AGENTS.md`](AGENTS.md)
- **Backend Conventions**: See [`agent/AGENTS_BACKEND.md`](agent/AGENTS_BACKEND.md) (`Controller -> Service -> Repository -> Database`, DTO boundaries, role authorization)
- **Frontend Conventions**: See [`agent/AGENTS_FRONTEND.md`](agent/AGENTS_FRONTEND.md) (Ocean Breeze & Warm Sand design tokens, History API navigation, shared `MusicAppShell` / `DashboardLayout` rules)
