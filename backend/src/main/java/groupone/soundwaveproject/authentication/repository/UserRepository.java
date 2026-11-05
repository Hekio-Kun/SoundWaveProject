package groupone.soundwaveproject.authentication.repository;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByEmailContainingIgnoreCase(String email);

    long countByDeletedAtIsNull();

    long countByStatusAndDeletedAtIsNull(UserStatus status);

    long countByCreatedAtAfterAndDeletedAtIsNull(LocalDateTime after);

    long countByCreatedAtBetweenAndDeletedAtIsNull(LocalDateTime start, LocalDateTime end);

    List<User> findTop5ByDeletedAtIsNullOrderByCreatedAtDesc();

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL AND u.createdAt >= :startDate ORDER BY u.createdAt ASC")
    List<User> findUsersCreatedSince(@Param("startDate") LocalDateTime startDate);
}
