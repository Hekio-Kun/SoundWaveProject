package groupone.soundwaveproject.authentication.repository;

import groupone.soundwaveproject.authentication.entity.AccountUnlockToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountUnlockTokenRepository extends JpaRepository<AccountUnlockToken, Long> {
    Optional<AccountUnlockToken> findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(Long userId);
}
