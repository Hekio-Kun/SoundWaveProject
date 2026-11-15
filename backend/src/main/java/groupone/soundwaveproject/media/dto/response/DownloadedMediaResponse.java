package groupone.soundwaveproject.media.dto.response;

public record DownloadedMediaResponse(byte[] bytes, String contentType, String extension) {}
