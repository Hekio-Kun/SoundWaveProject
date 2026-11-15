package groupone.soundwaveproject.media.service;

import com.cloudinary.Cloudinary;
import groupone.soundwaveproject.config.CloudinaryProperties;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.media.dto.response.DownloadedMediaResponse;
import groupone.soundwaveproject.media.exception.CloudStorageUnavailableException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class CloudMediaServiceTest {

    private final Cloudinary cloudinary = mock(Cloudinary.class);
    private final CloudinaryProperties properties = new CloudinaryProperties("demo", "key", "secret");

    @Test
    @DisplayName("Tải xuống tài liệu PDF trực tiếp từ Cloudinary thành công")
    void downloadReportEvidence_directSuccess() {
        byte[] pdfBytes = "%PDF-1.4\n...".getBytes(StandardCharsets.US_ASCII);
        TestableCloudMediaService service = new TestableCloudMediaService(cloudinary, properties);
        service.registerResponse(
                "https://res.cloudinary.com/demo/image/upload/v1/soundwave/reports/evidence/proof.pdf",
                new CloudMediaService.CloudHttpResponse(200, "application/pdf", pdfBytes)
        );

        DownloadedMediaResponse result = service.downloadReportEvidence(
                "https://res.cloudinary.com/demo/image/upload/v1/soundwave/reports/evidence/proof.pdf",
                "soundwave/reports/evidence/proof"
        );

        assertArrayEquals(pdfBytes, result.bytes());
        assertEquals("application/pdf", result.contentType());
        assertEquals("pdf", result.extension());
    }

    @Test
    @DisplayName("Dự phòng signed privateDownload khi CDN Cloudinary trả về 401 cho file PDF")
    void downloadReportEvidence_fallbackPrivateDownloadOn401() {
        byte[] pdfBytes = "%PDF-1.7 signed".getBytes(StandardCharsets.US_ASCII);
        TestableCloudMediaService service = new TestableCloudMediaService(cloudinary, properties);
        String publicUrl = "https://res.cloudinary.com/demo/image/upload/v1/soundwave/reports/evidence/proof.pdf";
        String signedUrl = "https://api.cloudinary.com/v1_1/demo/image/download?public_id=proof&signature=abc";

        service.registerResponse(publicUrl, new CloudMediaService.CloudHttpResponse(401, "text/plain", new byte[0]));
        service.registerSignedUrl("soundwave/reports/evidence/proof|pdf|image", signedUrl);
        service.registerResponse(signedUrl, new CloudMediaService.CloudHttpResponse(200, "application/octet-stream", pdfBytes));

        DownloadedMediaResponse result = service.downloadReportEvidence(publicUrl, "soundwave/reports/evidence/proof");

        assertArrayEquals(pdfBytes, result.bytes());
        assertEquals("pdf", result.extension());
        assertEquals("application/pdf", result.contentType());
    }

    @Test
    @DisplayName("Suy luận đuôi .docx từ magic bytes khi Cloudinary raw URL không có phần mở rộng")
    void downloadReportEvidence_detectsDocxFromMagicBytes() {
        byte[] docxHeader = "PK\u0003\u0004...word/document.xml".getBytes(StandardCharsets.ISO_8859_1);
        TestableCloudMediaService service = new TestableCloudMediaService(cloudinary, properties);
        String rawUrl = "https://res.cloudinary.com/demo/raw/upload/v1/soundwave/reports/evidence/user-1-evidence-123";

        service.registerResponse(rawUrl, new CloudMediaService.CloudHttpResponse(200, "application/octet-stream", docxHeader));

        DownloadedMediaResponse result = service.downloadReportEvidence(rawUrl, "soundwave/reports/evidence/user-1-evidence-123");

        assertEquals("docx", result.extension());
        assertEquals("application/vnd.openxmlformats-officedocument.wordprocessingml.document", result.contentType());
    }

    @Test
    @DisplayName("Chặn URL không thuộc Cloudinary để tránh SSRF")
    void downloadReportEvidence_rejectsNonCloudinaryUrl() {
        TestableCloudMediaService service = new TestableCloudMediaService(cloudinary, properties);

        BadRequestOperationException ex = assertThrows(
                BadRequestOperationException.class,
                () -> service.downloadReportEvidence("https://example.com/secret.pdf", null)
        );
        assertEquals("INVALID_EVIDENCE_URL", ex.getCode());
    }

    @Test
    @DisplayName("Ném lỗi dịch vụ khi Cloud storage không trả về được dữ liệu")
    void downloadReportEvidence_throwsWhenCloudUnavailable() {
        TestableCloudMediaService service = new TestableCloudMediaService(cloudinary, properties);
        String url = "https://res.cloudinary.com/demo/image/upload/v1/soundwave/reports/evidence/missing.png";
        service.registerResponse(url, new CloudMediaService.CloudHttpResponse(500, "text/plain", new byte[0]));

        assertThrows(
                CloudStorageUnavailableException.class,
                () -> service.downloadReportEvidence(url, "soundwave/reports/evidence/missing")
        );
    }

    private static final class TestableCloudMediaService extends CloudMediaService {
        private final Map<String, CloudHttpResponse> stubResponses = new HashMap<>();
        private final Map<String, String> signedUrls = new HashMap<>();

        private TestableCloudMediaService(Cloudinary cloudinary, CloudinaryProperties properties) {
            super(cloudinary, properties);
        }

        private void registerResponse(String url, CloudHttpResponse response) {
            stubResponses.put(url, response);
        }

        private void registerSignedUrl(String key, String signedUrl) {
            signedUrls.put(key, signedUrl);
        }

        @Override
        protected CloudHttpResponse sendHttpGet(URI uri) {
            CloudHttpResponse response = stubResponses.get(uri.toString());
            if (response == null) {
                return new CloudHttpResponse(404, "text/plain", new byte[0]);
            }
            return response;
        }

        @Override
        protected String buildSignedPrivateDownloadUrl(String publicId, String format, String resourceType) {
            return signedUrls.get(publicId + "|" + format + "|" + resourceType);
        }
    }
}
