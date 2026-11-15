package groupone.soundwaveproject.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.config.CloudinaryProperties;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.media.dto.response.DownloadedMediaResponse;
import groupone.soundwaveproject.media.dto.response.StoredAudioResponse;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.exception.CloudStorageUnavailableException;
import groupone.soundwaveproject.media.exception.InvalidAvatarFileException;
import groupone.soundwaveproject.media.exception.InvalidTrackAudioException;
import groupone.soundwaveproject.media.exception.InvalidTrackCoverException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudMediaService {
    private static final long MAX_AVATAR_SIZE = 5L * 1024 * 1024;
    private static final long MAX_TRACK_AUDIO_SIZE = 30L * 1024 * 1024;
    private static final long MAX_TRACK_COVER_SIZE = 5L * 1024 * 1024;
    private static final long MAX_EVIDENCE_DOCUMENT_SIZE = 15L * 1024 * 1024;
    private static final long MAX_EVIDENCE_DOWNLOAD_BYTES = 25L * 1024 * 1024;
    private static final int MAX_CLOUD_REDIRECTS = 3;
    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] OLE2_DOC_SIGNATURE = {(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1};

    private final Cloudinary cloudinary;
    private final CloudinaryProperties properties;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    /**
     * Kiểm tra và tải ảnh đại diện của người dùng lên Cloudinary.
     * Tự động căn chỉnh khuôn mặt (gravity: face), cắt vuông (fill) và thu về kích thước chuẩn 500x500.
     */
    public StoredMediaResponse uploadAvatar(MultipartFile file, Long userId) {
        byte[] content = readValidAvatar(file);
        Transformation<?> transformation = new Transformation<>()
                .width(500)
                .height(500)
                .crop("fill")
                .gravity("face");
        Map<?, ?> result = upload(content, "soundwave/avatars", "user-" + userId, "image", ObjectUtils.asMap(
                "transformation", transformation
        ));
        return toStoredMedia(result);
    }

    /**
     * Kiểm tra và tải file âm thanh của bài hát lên Cloudinary.
     */
    public StoredAudioResponse uploadTrackAudio(MultipartFile file, Long userId) {
        byte[] content = readValidTrackAudio(file);
        String detectedFormat = detectAudioFormat(content);
        Map<?, ?> result = upload(content, "soundwave/tracks/audio", "user-" + userId + "-track", "video");
        return new StoredAudioResponse(
                requiredResultValue(result, "public_id"),
                requiredResultValue(result, "secure_url"),
                optionalResultValue(result, "format", detectedFormat),
                readDurationMs(result)
        );
    }

    /**
     * Kiểm tra và tải ảnh bìa bài hát lên Cloudinary.
     */
    public StoredMediaResponse uploadTrackCover(MultipartFile file, Long userId) {
        byte[] content = readValidTrackCover(file);
        Map<?, ?> result = upload(content, "soundwave/tracks/covers", "user-" + userId + "-cover", "image");
        return toStoredMedia(result);
    }

    /**
     * Kiểm tra và tải ảnh bìa danh sách phát (Playlist Cover) lên Cloudinary.
     */
    public StoredMediaResponse uploadPlaylistCover(MultipartFile file, Long userId) {
        byte[] content = readValidTrackCover(file);
        Map<?, ?> result = upload(content, "soundwave/playlists/covers", "user-" + userId + "-playlist-cover", "image");
        return toStoredMedia(result);
    }

    /**
     * Kiểm tra và tải ảnh bìa album (Album Cover) lên Cloudinary.
     */
    public StoredMediaResponse uploadAlbumCover(MultipartFile file, Long userId) {
        byte[] content = readValidTrackCover(file);
        Map<?, ?> result = upload(content, "soundwave/albums/covers", "user-" + userId + "-album-cover", "image");
        return toStoredMedia(result);
    }

    /**
     * Tải tệp tài liệu / hình ảnh chứng minh sở hữu bản quyền bài hát lên Cloudinary (UC-22.1).
     * Hỗ trợ PDF, văn bản, hình ảnh pháp lý (dung lượng tối đa 15MB).
     */
    public StoredMediaResponse uploadReportEvidence(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestOperationException("EVIDENCE_EMPTY", "Evidence document cannot be empty.");
        }
        if (file.getSize() > MAX_EVIDENCE_DOCUMENT_SIZE) {
            throw new BadRequestOperationException("EVIDENCE_TOO_LARGE", "Evidence document must not exceed 15MB.");
        }
        try {
            byte[] content = file.getBytes();
            Map<?, ?> result = upload(content, "soundwave/reports/evidence", "user-" + userId + "-evidence", "auto");
            return toStoredMedia(result);
        } catch (IOException e) {
            log.error("Failed to read evidence document", e);
            throw new BadRequestOperationException("EVIDENCE_READ_ERROR", "Could not read uploaded evidence file.");
        }
    }

    /**
     * Tải xuống tệp tài liệu chứng minh bản quyền từ Cloudinary kèm metadata định dạng.
     */
    public DownloadedMediaResponse downloadReportEvidence(String evidenceUrl, String evidencePublicId) {
        if (evidenceUrl == null || evidenceUrl.isBlank()) {
            throw new BadRequestOperationException("EVIDENCE_NOT_FOUND", "No proof document is attached to this report.");
        }

        URI initialUri = validateCloudinaryDownloadUri(evidenceUrl);
        CloudHttpResponse response = fetchWithGuardedRedirects(initialUri);

        // Dự phòng URL ký privateDownload nếu Cloudinary CDN chặn truy cập trực tiếp tệp PDF/ZIP
        if ((response.statusCode() == 401 || response.statusCode() == 403)
                && evidencePublicId != null && !evidencePublicId.isBlank() && properties.isConfigured()) {
            String resourceType = resolveCloudinaryResourceType(evidenceUrl);
            String urlExtension = extractExtensionFromPath(initialUri.getPath());
            String signedUrl = buildSignedPrivateDownloadUrl(evidencePublicId, urlExtension, resourceType);
            if (signedUrl != null) {
                response = fetchWithGuardedRedirects(validateCloudinaryDownloadUri(signedUrl));
            }
        }

        if (response.statusCode() < 200 || response.statusCode() >= 300 || response.bytes().length == 0) {
            log.warn("Không thể tải tệp bằng chứng từ Cloudinary, status={}", response.statusCode());
            throw new CloudStorageUnavailableException(
                    "Failed to download proof document from cloud storage. Please try again.");
        }

        String extension = resolveEvidenceExtension(initialUri.getPath(), response.contentType(), response.bytes());
        String contentType = resolveEvidenceContentType(response.contentType(), extension);
        return new DownloadedMediaResponse(response.bytes(), contentType, extension);
    }

    /**
     * Xóa tệp bằng chứng bản quyền khỏi Cloudinary khi báo cáo bị rút hoặc thay đổi.
     */
    public void deleteReportEvidenceQuietly(String publicId) {
        deleteMediaQuietly(publicId, "raw");
        deleteMediaQuietly(publicId, "image");
    }

    /**
     * Xóa ảnh cũ khỏi Cloudinary sau khi hồ sơ đã dùng ảnh mới.
     */
    public void deleteImageQuietly(String publicId) {
        deleteMediaQuietly(publicId, "image");
    }

    /**
     * Tách public_id từ secure_url của Cloudinary (chỉ áp dụng cho ảnh thuộc folder của SoundWave).
     * Ví dụ: https://res.cloudinary.com/demo/image/upload/v1712/soundwave/playlists/covers/abc.jpg
     *   -> soundwave/playlists/covers/abc
     * Trả về null nếu URL không phải ảnh Cloudinary do hệ thống quản lý (ví dụ ảnh preset Unsplash).
     */
    public String extractPublicIdFromUrl(String url) {
        if (url == null || url.isBlank() || !url.contains("res.cloudinary.com")) return null;
        int uploadIndex = url.indexOf("/upload/");
        if (uploadIndex < 0) return null;
        String path = url.substring(uploadIndex + "/upload/".length());
        int queryIndex = path.indexOf('?');
        if (queryIndex >= 0) path = path.substring(0, queryIndex);
        int soundwaveIndex = path.indexOf("soundwave/");
        if (soundwaveIndex < 0) return null;
        path = path.substring(soundwaveIndex);
        int dotIndex = path.lastIndexOf('.');
        int slashIndex = path.lastIndexOf('/');
        if (dotIndex > slashIndex) path = path.substring(0, dotIndex);
        return path.isBlank() ? null : path;
    }

    /**
     * Xóa file âm thanh khỏi Cloudinary nhưng không làm hỏng transaction chính khi Cloudinary lỗi.
     */
    public void deleteTrackAudioQuietly(String publicId) {
        deleteMediaQuietly(publicId, "video");
    }

    private byte[] readValidAvatar(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_AVATAR_SIZE) {
            throw new InvalidAvatarFileException();
        }
        try {
            byte[] content = file.getBytes();
            if (!isJpeg(content) && !isPng(content)) throw new InvalidAvatarFileException();
            return content;
        } catch (IOException exception) {
            throw new InvalidAvatarFileException();
        }
    }

    private byte[] readValidTrackAudio(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_TRACK_AUDIO_SIZE) {
            throw new InvalidTrackAudioException();
        }
        byte[] content = readBytes(file, new InvalidTrackAudioException());
        if (!isMp3(content) && !isWav(content) && !isFlac(content)) {
            throw new InvalidTrackAudioException();
        }
        return content;
    }

    private byte[] readValidTrackCover(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_TRACK_COVER_SIZE) {
            throw new InvalidTrackCoverException();
        }
        byte[] content = readBytes(file, new InvalidTrackCoverException());
        if (!isJpeg(content) && !isPng(content) && !isWebp(content)) {
            throw new InvalidTrackCoverException();
        }
        return content;
    }

    private byte[] readBytes(MultipartFile file, RuntimeException invalidFileException) {
        try {
            return file.getBytes();
        } catch (IOException exception) {
            throw invalidFileException;
        }
    }

    private boolean isJpeg(byte[] content) {
        return content.length >= 3
                && content[0] == (byte) 0xFF
                && content[1] == (byte) 0xD8
                && content[2] == (byte) 0xFF;
    }

    private boolean isPng(byte[] content) {
        if (content.length < PNG_SIGNATURE.length) return false;
        for (int index = 0; index < PNG_SIGNATURE.length; index++) {
            if (content[index] != PNG_SIGNATURE[index]) return false;
        }
        return true;
    }

    private boolean isWebp(byte[] content) {
        return content.length >= 12
                && content[0] == 'R' && content[1] == 'I' && content[2] == 'F' && content[3] == 'F'
                && content[8] == 'W' && content[9] == 'E' && content[10] == 'B' && content[11] == 'P';
    }

    private boolean isMp3(byte[] content) {
        boolean hasId3Header = content.length >= 3
                && content[0] == 'I' && content[1] == 'D' && content[2] == '3';
        boolean hasFrameSync = content.length >= 2
                && content[0] == (byte) 0xFF && (content[1] & 0xE0) == 0xE0;
        return hasId3Header || hasFrameSync;
    }

    private boolean isWav(byte[] content) {
        return content.length >= 12
                && content[0] == 'R' && content[1] == 'I' && content[2] == 'F' && content[3] == 'F'
                && content[8] == 'W' && content[9] == 'A' && content[10] == 'V' && content[11] == 'E';
    }

    private boolean isFlac(byte[] content) {
        return content.length >= 4
                && content[0] == 'f' && content[1] == 'L' && content[2] == 'a' && content[3] == 'C';
    }

    private String detectAudioFormat(byte[] content) {
        if (isWav(content)) return "wav";
        if (isFlac(content)) return "flac";
        return "mp3";
    }

    private Map<?, ?> upload(byte[] content, String folder, String publicIdPrefix, String resourceType) {
        return upload(content, folder, publicIdPrefix, resourceType, Map.of());
    }

    private Map<?, ?> upload(byte[] content, String folder, String publicIdPrefix, String resourceType, Map<String, ?> extraOptions) {
        ensureConfigured();
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("folder", folder);
            params.put("public_id", publicIdPrefix + "-" + UUID.randomUUID());
            params.put("resource_type", resourceType);
            params.put("overwrite", false);
            if (extraOptions != null && !extraOptions.isEmpty()) {
                params.putAll(extraOptions);
            }
            return cloudinary.uploader().upload(content, params);
        } catch (IOException | RuntimeException exception) {
            log.warn("Không thể tải media lên Cloudinary, folder={}, cause={}: {}",
                    folder, exception.getClass().getSimpleName(), exception.getMessage());
            throw new CloudStorageUnavailableException();
        }
    }

    private StoredMediaResponse toStoredMedia(Map<?, ?> result) {
        return new StoredMediaResponse(
                requiredResultValue(result, "public_id"),
                requiredResultValue(result, "secure_url")
        );
    }

    private String requiredResultValue(Map<?, ?> result, String key) {
        Object value = result.get(key);
        if (value == null || value.toString().isBlank()) throw new CloudStorageUnavailableException();
        return value.toString();
    }

    private String optionalResultValue(Map<?, ?> result, String key, String fallback) {
        Object value = result.get(key);
        return value == null || value.toString().isBlank() ? fallback : value.toString();
    }

    private Integer readDurationMs(Map<?, ?> result) {
        Object duration = result.get("duration");
        if (!(duration instanceof Number number) || number.doubleValue() <= 0) return 0;
        return (int) Math.round(number.doubleValue() * 1000);
    }

    private void deleteMediaQuietly(String publicId, String resourceType) {
        if (publicId == null || publicId.isBlank() || !properties.isConfigured()) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                    "resource_type", resourceType,
                    "invalidate", true
            ));
        } catch (IOException | RuntimeException exception) {
            log.warn("Không thể xóa media Cloudinary cũ publicId={}", publicId);
        }
    }

    private void ensureConfigured() {
        if (!properties.isConfigured()) throw new CloudStorageUnavailableException();
    }

    protected record CloudHttpResponse(int statusCode, String contentType, byte[] bytes) {}

    protected CloudHttpResponse sendHttpGet(URI uri) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(uri)
                .GET()
                .timeout(Duration.ofSeconds(30))
                .build();
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        String contentType = response.headers().firstValue("Content-Type").orElse(null);
        try (InputStream body = response.body()) {
            if (response.statusCode() >= 300 && response.statusCode() < 400) {
                String location = response.headers().firstValue("Location").orElse(null);
                return new CloudHttpResponse(response.statusCode(), location, new byte[0]);
            }
            byte[] bytes = readBoundedBytes(body);
            return new CloudHttpResponse(response.statusCode(), contentType, bytes);
        }
    }

    protected String buildSignedPrivateDownloadUrl(String publicId, String format, String resourceType) {
        try {
            return cloudinary.privateDownload(
                    publicId,
                    format != null ? format : "",
                    ObjectUtils.asMap(
                            "resource_type", resourceType,
                            "type", "upload",
                            "attachment", true
                    )
            );
        } catch (Exception exception) {
            log.warn("Không thể tạo signed download URL cho Cloudinary publicId: {}", exception.getMessage());
            return null;
        }
    }

    // Chỉ theo dõi chuyển hướng nội bộ trên các host Cloudinary tin cậy để chống SSRF
    private CloudHttpResponse fetchWithGuardedRedirects(URI startUri) {
        URI currentUri = startUri;
        try {
            for (int hop = 0; hop <= MAX_CLOUD_REDIRECTS; hop++) {
                CloudHttpResponse response = sendHttpGet(currentUri);
                if (response.statusCode() >= 300 && response.statusCode() < 400) {
                    String redirectLocation = response.contentType();
                    if (redirectLocation == null || redirectLocation.isBlank() || hop == MAX_CLOUD_REDIRECTS) {
                        throw new CloudStorageUnavailableException(
                                "Failed to download proof document from cloud storage. Please try again.");
                    }
                    URI resolved = currentUri.resolve(redirectLocation);
                    currentUri = validateCloudinaryDownloadUri(resolved.toString());
                    continue;
                }
                return response;
            }
            throw new CloudStorageUnavailableException(
                    "Failed to download proof document from cloud storage. Please try again.");
        } catch (BadRequestOperationException | CloudStorageUnavailableException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new CloudStorageUnavailableException(
                    "Proof document download was interrupted. Please try again.");
        } catch (IOException | RuntimeException ex) {
            log.warn("Lỗi kết nối khi tải tệp bằng chứng từ Cloudinary: {}", ex.getMessage());
            throw new CloudStorageUnavailableException(
                    "Failed to download proof document from cloud storage. Please try again.");
        }
    }

    private URI validateCloudinaryDownloadUri(String rawUrl) {
        URI uri;
        try {
            uri = URI.create(rawUrl.trim());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestOperationException("INVALID_EVIDENCE_URL", "Evidence document URL is invalid.");
        }
        String scheme = uri.getScheme();
        String host = uri.getHost();
        if (!"https".equalsIgnoreCase(scheme) || host == null || !isTrustedCloudinaryHost(host)) {
            throw new BadRequestOperationException(
                    "INVALID_EVIDENCE_URL",
                    "Evidence document URL must point to a trusted cloud storage host.");
        }
        return uri;
    }

    private boolean isTrustedCloudinaryHost(String host) {
        String normalized = host.toLowerCase(Locale.ROOT);
        return normalized.equals("res.cloudinary.com")
                || normalized.equals("api.cloudinary.com")
                || normalized.endsWith(".cloudinary.com");
    }

    private byte[] readBoundedBytes(InputStream input) throws IOException {
        if (input == null) return new byte[0];
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        long total = 0;
        int read;
        while ((read = input.read(buffer)) != -1) {
            total += read;
            if (total > MAX_EVIDENCE_DOWNLOAD_BYTES) {
                throw new BadRequestOperationException(
                        "EVIDENCE_TOO_LARGE",
                        "Evidence document exceeds maximum supported download size.");
            }
            output.write(buffer, 0, read);
        }
        return output.toByteArray();
    }

    private String resolveCloudinaryResourceType(String evidenceUrl) {
        if (evidenceUrl.contains("/raw/upload/")) return "raw";
        if (evidenceUrl.contains("/video/upload/")) return "video";
        return "image";
    }

    private String extractExtensionFromPath(String path) {
        if (path == null || path.isBlank()) return "";
        int lastSlash = path.lastIndexOf('/');
        String fileSegment = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
        int dotIndex = fileSegment.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileSegment.length() - 1) return "";
        String candidate = fileSegment.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
        return candidate.matches("[a-z0-9]{1,10}") ? candidate : "";
    }

    // Suy luận phần mở rộng tệp chuẩn theo thứ tự: URL -> magic bytes (tệp raw không đuôi) -> Content-Type
    private String resolveEvidenceExtension(String path, String rawContentType, byte[] bytes) {
        String fromUrl = extractExtensionFromPath(path);
        if (!fromUrl.isEmpty()) return fromUrl;

        if (isPdf(bytes)) return "pdf";
        if (isPng(bytes)) return "png";
        if (isJpeg(bytes)) return "jpg";
        if (isWebp(bytes)) return "webp";
        if (isOle2Doc(bytes)) return "doc";
        if (isDocxZip(bytes)) return "docx";

        String normalizedType = stripContentTypeParams(rawContentType);
        return switch (normalizedType) {
            case "application/pdf" -> "pdf";
            case "image/png" -> "png";
            case "image/jpeg" -> "jpg";
            case "image/webp" -> "webp";
            case "application/msword" -> "doc";
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> "docx";
            default -> "";
        };
    }

    private String resolveEvidenceContentType(String rawContentType, String extension) {
        String normalized = stripContentTypeParams(rawContentType);
        if (!normalized.isEmpty() && !"application/octet-stream".equals(normalized)) {
            return normalized;
        }
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "webp" -> "image/webp";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default -> "application/octet-stream";
        };
    }

    private String stripContentTypeParams(String rawContentType) {
        if (rawContentType == null || rawContentType.isBlank()) return "";
        int semiIndex = rawContentType.indexOf(';');
        String base = semiIndex >= 0 ? rawContentType.substring(0, semiIndex) : rawContentType;
        return base.trim().toLowerCase(Locale.ROOT);
    }

    private boolean isPdf(byte[] content) {
        return content.length >= 5
                && content[0] == '%' && content[1] == 'P' && content[2] == 'D' && content[3] == 'F' && content[4] == '-';
    }

    private boolean isOle2Doc(byte[] content) {
        if (content.length < OLE2_DOC_SIGNATURE.length) return false;
        for (int index = 0; index < OLE2_DOC_SIGNATURE.length; index++) {
            if (content[index] != OLE2_DOC_SIGNATURE[index]) return false;
        }
        return true;
    }

    private boolean isDocxZip(byte[] content) {
        if (content.length < 4
                || content[0] != 'P' || content[1] != 'K' || content[2] != 0x03 || content[3] != 0x04) {
            return false;
        }
        String preview = new String(content, 0, Math.min(content.length, 4096), StandardCharsets.ISO_8859_1);
        return preview.contains("word/") || preview.contains("[Content_Types].xml");
    }
}
