package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.catalog.dto.AlbumSummaryResponse;
import groupone.soundwaveproject.catalog.dto.CreatorSummaryResponse;
import groupone.soundwaveproject.catalog.dto.PublicTrackResponse;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.PublicationStatus;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PublicCatalogService {

    private final TrackRepository trackRepository;
    private final GenreRepository genreRepository;
    private final AlbumRepository albumRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public PublicTrackResponse getTrackByIdOrSlug(String idOrSlug) {
        Track track = findTrackByIdOrSlug(idOrSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or unavailable."));

        return toPublicTrackResponse(track);
    }

    @Transactional(readOnly = true)
    public List<PublicTrackResponse> getRecommendations(String idOrSlug, int limit) {
        Optional<Track> currentTrackOpt = findTrackByIdOrSlug(idOrSlug);
        Long genreId = currentTrackOpt.map(Track::getGenreId).orElse(null);
        Long excludeId = currentTrackOpt.map(Track::getId).orElse(-1L);

        List<Track> allPublished = trackRepository.findAll().stream()
                .filter(t -> t.getPublicationStatus() == PublicationStatus.PUBLISHED)
                .filter(t -> !t.getId().equals(excludeId))
                .toList();

        List<Track> filtered = allPublished.stream()
                .filter(t -> genreId != null && genreId.equals(t.getGenreId()))
                .limit(limit)
                .toList();

        if (filtered.isEmpty()) {
            filtered = allPublished.stream().limit(limit).toList();
        }

        return filtered.stream().map(this::toPublicTrackResponse).toList();
    }

    private Optional<Track> findTrackByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) return Optional.empty();
        try {
            Long id = Long.parseLong(idOrSlug.trim());
            Optional<Track> byId = trackRepository.findById(id);
            if (byId.isPresent()) return byId;
        } catch (NumberFormatException ignored) {}

        return trackRepository.findBySlug(idOrSlug.trim());
    }

    public PublicTrackResponse toPublicTrackResponse(Track track) {
        Genre genre = track.getGenreId() != null ? genreRepository.findById(track.getGenreId()).orElse(null) : null;
        Album album = track.getAlbumId() != null ? albumRepository.findById(track.getAlbumId()).orElse(null) : null;
        UserProfile profile = userProfileRepository.findByUserId(track.getUploaderUserId()).orElse(null);

        String audioUrl = track.getAudioUrl();
        String coverUrl = track.getCoverUrl() != null ? track.getCoverUrl() : "/pics/album.png";

        CreatorSummaryResponse creator = new CreatorSummaryResponse(
                track.getUploaderUserId(),
                profile != null ? profile.getDisplayName() : "SoundWave Artist",
                profile != null ? profile.getAvatarUrl() : null
        );

        AlbumSummaryResponse albumSummary = album != null
                ? new AlbumSummaryResponse(album.getId(), album.getTitle())
                : null;

        return new PublicTrackResponse(
                track.getId(),
                track.getTitle(),
                track.getSlug(),
                track.getDescription(),
                coverUrl,
                audioUrl,
                track.getAudioFormat() != null ? track.getAudioFormat() : "audio/mpeg",
                track.getDurationMs() != null ? track.getDurationMs() : 0,
                track.getPlayCountCache() != null ? track.getPlayCountCache() : 0L,
                track.getPublicationStatus().name(),
                genre != null ? genre.getSlug() : "",
                genre != null ? genre.getName() : "Music",
                creator,
                albumSummary,
                track.getCreatedAt()
        );
    }
}
