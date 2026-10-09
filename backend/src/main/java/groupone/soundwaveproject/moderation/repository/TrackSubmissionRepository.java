package groupone.soundwaveproject.moderation.repository;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrackSubmissionRepository extends JpaRepository<TrackSubmission, Long> {
    Optional<TrackSubmission> findFirstByTrackIdOrderBySubmittedAtDesc(Long trackId);
    void deleteByTrackId(Long trackId);
    long countByStatus(SubmissionStatus status);
}
