package groupone.soundwaveproject.authentication.service;

import lombok.RequiredArgsConstructor;
import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Public service cung cấp thông tin tài khoản người dùng cho các module khác trong hệ thống Modular Monolith.
 */
@Service
@RequiredArgsConstructor
public class UserAccountPublicService {
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final UserProfileRepository userProfileRepository;

    /**
     * Lấy ID người dùng từ email trong Security Context.
     */
    @Transactional(readOnly = true)
    public Long getUserIdByEmail(String email) {
        return findUserIdByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User was not found with email: " + email));
    }

    /**
     * Tìm ID người dùng theo email mà không phát sinh ngoại lệ khi tài khoản chưa tồn tại.
     */
    @Transactional(readOnly = true)
    public Optional<Long> findUserIdByEmail(String email) {
        Optional<Long> userId = userRepository.findByEmailIgnoreCase(email).map(User::getId);
        if (userId.isPresent()) return userId;
        return staffRepository.findByEmailIgnoreCase(email).map(Staff::getId);
    }

    /**
     * Lấy thông tin tóm tắt người dùng theo email.
     */
    @Transactional(readOnly = true)
    public UserProfileSummary getUserSummaryByEmail(String email) {
        return findUserSummaryByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User was not found with email: " + email));
    }

    /**
     * Tìm thông tin tóm tắt theo email mà không dùng exception để điều khiển luồng xử lý.
     */
    @Transactional(readOnly = true)
    public Optional<UserProfileSummary> findUserSummaryByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            return Optional.of(buildUserSummary(userOpt.get()));
        }
        return staffRepository.findByEmailIgnoreCase(email).map(this::buildStaffSummary);
    }

    /**
     * Lấy thông tin tóm tắt người dùng theo ID.
     */
    @Transactional(readOnly = true)
    public UserProfileSummary getUserSummaryById(Long userId) {
        return findUserSummaryById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User was not found with ID: " + userId));
    }

    /**
     * Tìm thông tin tóm tắt theo ID mà không dùng exception để điều khiển luồng xử lý.
     */
    @Transactional(readOnly = true)
    public Optional<UserProfileSummary> findUserSummaryById(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            return Optional.of(buildUserSummary(userOpt.get()));
        }
        return staffRepository.findById(userId).map(this::buildStaffSummary);
    }

    /**
     * Lấy danh sách tóm tắt thông tin người dùng theo tập hợp ID theo dạng batch để tránh N+1 query.
     */
    @Transactional(readOnly = true)
    public Map<Long, UserProfileSummary> getUserSummariesByIds(Collection<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<User> users = userRepository.findAllById(userIds);
        Map<Long, UserProfile> profileMap = userProfileRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserProfile::getUserId, p -> p, (a, b) -> a));

        Map<Long, UserProfileSummary> result = new HashMap<>();
        for (User user : users) {
            UserProfile profile = profileMap.get(user.getId());
            String displayName = profile != null ? profile.getDisplayName() : user.getEmail();
            String avatarUrl = profile != null ? profile.getAvatarUrl() : null;
            result.put(user.getId(), new UserProfileSummary(
                    user.getId(),
                    user.getEmail(),
                    displayName,
                    avatarUrl,
                    "LISTENER"
            ));
        }

        // Với các ID chưa tìm thấy trong users, tìm tiếp trong staffs
        List<Long> remainingIds = userIds.stream()
                .filter(id -> !result.containsKey(id))
                .toList();
        if (!remainingIds.isEmpty()) {
            List<Staff> staffs = staffRepository.findAllById(remainingIds);
            for (Staff staff : staffs) {
                result.put(staff.getId(), buildStaffSummary(staff));
            }
        }

        return result;
    }

    private UserProfileSummary buildUserSummary(User user) {
        Optional<UserProfile> profile = userProfileRepository.findByUserId(user.getId());
        String displayName = profile.map(UserProfile::getDisplayName).orElse(user.getEmail());
        String avatarUrl = profile.map(UserProfile::getAvatarUrl).orElse(null);
        return new UserProfileSummary(
                user.getId(),
                user.getEmail(),
                displayName,
                avatarUrl,
                "LISTENER"
        );
    }

    private UserProfileSummary buildStaffSummary(Staff staff) {
        return new UserProfileSummary(
                staff.getId(),
                staff.getEmail(),
                staff.getFullName(),
                staff.getAvatarUrl(),
                staff.getRole() != null ? staff.getRole().getCode() : "STAFF"
        );
    }
}
