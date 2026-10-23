package groupone.soundwaveproject.media.exception;

public class CloudStorageUnavailableException extends MediaException {
    public CloudStorageUnavailableException() {
        super("CLOUD_STORAGE_UNAVAILABLE", "Failed to upload media to cloud storage. Please check your connection and retry.");
    }
}
