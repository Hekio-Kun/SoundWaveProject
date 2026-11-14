# SoundWave Authentication Setup

The authentication module implements registration, six-digit email OTP verification, dual-portal login (`LISTENER` vs `STAFF`/`ADMIN`), JWT access tokens, rotating HttpOnly refresh cookies, logout, forgot password, OTP-based password reset, and self-service account unlock.

## Account Architecture (RDS Schema)

- **Listener / Creator Accounts**: Stored in `users` (`UserAccount`) with profile metadata in `user_profiles` (`UserProfile`). Public registration always creates a Listener account (`role = LISTENER` in JWT/AuthUserResponse).
- **Staff & Admin Accounts**: Stored in `staffs` (`Staff`) linked to `staff_roles` (`StaffRole` with codes `STAFF` and `ADMIN`). Staff and Admin accounts authenticate strictly through the Staff portal (`/staff/login` with `portal: "STAFF"`).
- **Security Tokens**: Stored as SHA-256 hashes in `email_verification_tokens`, `password_reset_tokens`, `refresh_tokens`, and `account_unlock_tokens`.

## Required Environment Variables

Configure these values in the IntelliJ Spring Boot Run Configuration or `.env`. Do not put real credentials in `application.properties` or commit them to Git.

```text
DB_URL=jdbc:postgresql://<host>/<database>?sslmode=require
DB_USERNAME=<postgres_user>
DB_PASSWORD=<postgres_password>
MAIL_USERNAME=<Gmail sender address>
MAIL_PASSWORD=<Gmail app password without spaces>
MAIL_FROM=<same Gmail sender address>
JWT_SECRET=<random secret with at least 32 characters>
ADMIN_AUTO_CREATE=true
ADMIN_EMAIL=admin@soundwave.com
ADMIN_PASSWORD=Admin@123456
ADMIN_USERNAME=admin
ADMIN_DISPLAY_NAME=System Administrator
```

The application automatically seeds staff roles (`STAFF`, `ADMIN`) in `staff_roles` and creates the default Admin account in `staffs` on startup if it does not already exist.

For local frontend development, the default allowed origins are `http://127.0.0.1:4174` and `http://localhost:4174`.

## Required Staff Role Data (PostgreSQL)

```sql
INSERT INTO staff_roles (code, name, description, created_at)
VALUES
    ('STAFF', 'Staff', 'Content moderation account', CURRENT_TIMESTAMP),
    ('ADMIN', 'Administrator', 'System administration account', CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;
```

## Authentication Endpoints

```text
POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/verification-otp
POST /api/v1/auth/login
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/unlock-request
POST /api/v1/auth/unlock-account
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

OTP, unlock token, and refresh token plaintext values are never stored in the database. Tests mock email delivery and do not require real Gmail credentials.
