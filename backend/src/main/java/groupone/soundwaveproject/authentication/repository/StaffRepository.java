package groupone.soundwaveproject.authentication.repository;

import groupone.soundwaveproject.authentication.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
