package groupone.soundwaveproject.media.exception;

public class InvalidTrackAudioException extends MediaException {
    public InvalidTrackAudioException() {
        super("INVALID_TRACK_AUDIO", "Audio must be a valid MP3, WAV or FLAC file under 30MB.");
    }
}
