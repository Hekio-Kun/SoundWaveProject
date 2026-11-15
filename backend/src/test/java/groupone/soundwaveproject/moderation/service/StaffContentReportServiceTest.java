package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.media.dto.response.DownloadedMediaResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.moderation.dto.response.EvidenceDownloadResponse;
import groupone.soundwaveproject.moderation.entity.ContentReport;
import groupone.soundwaveproject.moderation.repository.ContentReportRepository;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.notification.service.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffContentReportServiceTest {

    @Mock private ContentReportRepository contentReportRepository;
    @Mock private TrackRepository trackRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private StaffRepository staffRepository;
    @Mock private TrackSubmissionRepository submissionRepository;
    @Mock private NotificationService notificationService;
    @Mock private OfficialLyricRepository officialLyricRepository;
    @Mock private AlbumRepository albumRepository;
    @Mock private CloudMediaService cloudMediaService;

    @InjectMocks
    private StaffContentReportService staffContentReportService;

    @Test
    @DisplayName("Tải xuống tài liệu chứng minh bản quyền từ Cloud với tên file và phần mở rộng hợp lệ")
    void downloadEvidence_success() {
        ContentReport report = ContentReport.builder()
                .id(42L)
                .evidenceUrl("https://res.cloudinary.com/demo/image/upload/v1/soundwave/reports/evidence/proof.pdf")
                .evidencePublicId("soundwave/reports/evidence/proof")
                .build();
        byte[] content = "%PDF-1.4 sample".getBytes(StandardCharsets.US_ASCII);

        when(contentReportRepository.findById(42L)).thenReturn(Optional.of(report));
        when(cloudMediaService.downloadReportEvidence(report.getEvidenceUrl(), report.getEvidencePublicId()))
                .thenReturn(new DownloadedMediaResponse(content, "application/pdf", "pdf"));

        EvidenceDownloadResponse result = staffContentReportService.downloadEvidence(42L);

        assertArrayEquals(content, result.bytes());
        assertEquals("application/pdf", result.contentType());
        assertEquals("copyright-proof-report-42.pdf", result.fileName());
        verify(cloudMediaService).downloadReportEvidence(report.getEvidenceUrl(), report.getEvidencePublicId());
    }

    @Test
    @DisplayName("Ném ResourceNotFoundException khi báo cáo không tồn tại")
    void downloadEvidence_reportNotFound() {
        when(contentReportRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> staffContentReportService.downloadEvidence(99L)
        );
        assertEquals("REPORT_NOT_FOUND", ex.getCode());
    }

    @Test
    @DisplayName("Ném ResourceNotFoundException khi báo cáo không đính kèm tài liệu chứng minh")
    void downloadEvidence_missingEvidenceUrl() {
        ContentReport report = ContentReport.builder()
                .id(15L)
                .evidenceUrl(null)
                .build();
        when(contentReportRepository.findById(15L)).thenReturn(Optional.of(report));

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> staffContentReportService.downloadEvidence(15L)
        );
        assertEquals("EVIDENCE_NOT_FOUND", ex.getCode());
        verifyNoInteractions(cloudMediaService);
    }
}
