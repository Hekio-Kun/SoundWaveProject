package groupone.soundwaveproject.authentication.repository;

import groupone.soundwaveproject.authentication.entity.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId);
    boolean existsByUsername(String username);
    boolean existsByUsernameIgnoreCaseAndUserIdNot(String username, Long userId);

    @EntityGraph(attributePaths = {"user", "user.role"})
    Optional<UserProfile> findByUser_EmailIgnoreCase(String email);

    @Query(value = "SELECT p FROM UserProfile p JOIN p.user u " +
            "WHERE u.status = groupone.soundwaveproject.authentication.entity.UserStatus.ACTIVE " +
            "AND (LOWER(p.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(p.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(p.username) LIKE LOWER(CONCAT('%', :slugKeyword, '%')) " +
            "     OR REPLACE(LOWER(p.username), '-', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%')) " +
            "     OR REPLACE(LOWER(p.username), '_', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%')) " +
            "     OR LOWER(p.bio) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            countQuery = "SELECT count(p) FROM UserProfile p JOIN p.user u " +
            "WHERE u.status = groupone.soundwaveproject.authentication.entity.UserStatus.ACTIVE " +
            "AND (LOWER(p.displayName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(p.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(p.username) LIKE LOWER(CONCAT('%', :slugKeyword, '%')) " +
            "     OR REPLACE(LOWER(p.username), '-', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%')) " +
            "     OR REPLACE(LOWER(p.username), '_', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%')) " +
            "     OR LOWER(p.bio) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<UserProfile> searchActiveCreators(
            @Param("keyword") String keyword,
            @Param("unaccentedKeyword") String unaccentedKeyword,
            @Param("slugKeyword") String slugKeyword,
            Pageable pageable
    );
}
