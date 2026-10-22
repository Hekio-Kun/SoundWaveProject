package groupone.soundwaveproject.authentication.repository;

import groupone.soundwaveproject.authentication.entity.StaffRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaffRoleRepository extends JpaRepository<StaffRole, Short> {
    Optional<StaffRole> findByCode(String code);
}
