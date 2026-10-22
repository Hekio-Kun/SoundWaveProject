package groupone.soundwaveproject.authentication.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Setter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserStatus status;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.status = UserStatus.PENDING;
    }

    public void verifyEmail(LocalDateTime verifiedAt) {
        this.emailVerifiedAt = verifiedAt;
        this.status = UserStatus.ACTIVE;
        this.updatedAt = verifiedAt;
    }

    public void recordLogin(LocalDateTime loggedInAt) {
        this.lastLoginAt = loggedInAt;
        this.updatedAt = loggedInAt;
    }

    public void changePassword(String encodedPassword, LocalDateTime changedAt) {
        this.passwordHash = encodedPassword;
        this.updatedAt = changedAt;
    }

    public void lockTemporarily(LocalDateTime until) {
        this.status = UserStatus.TEMPORARILY_LOCKED;
        this.lockedUntil = until;
        this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public void unlock() {
        if (this.status == UserStatus.TEMPORARILY_LOCKED) {
            this.status = UserStatus.ACTIVE;
        }
        this.lockedUntil = null;
        this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public boolean isTemporarilyLocked(LocalDateTime now) {
        if (this.status == UserStatus.TEMPORARILY_LOCKED) {
            return lockedUntil != null && lockedUntil.isAfter(now);
        }
        return false;
    }

    @PrePersist
    void initializeTimestamps() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (status == null) status = UserStatus.PENDING;
    }

    @PreUpdate
    void updateTimestamp() {
        this.updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }
}
