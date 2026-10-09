package groupone.soundwaveproject.studio.mapper;

import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.studio.dto.response.StudioAlbumResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Mapper chuyển đổi Entity Album và danh sách bài hát sang StudioAlbumResponse.
 */
@Component
@RequiredArgsConstructor
public class StudioAlbumMapper {

    private final StudioTrackMapper studioTrackMapper;

    public StudioAlbumResponse toStudioAlbumResponse(Album album, int trackCount, List<Track> tracks) {
        List<StudioTrackResponse> trackResponses = tracks != null
                ? tracks.stream()
                    .map(t -> studioTrackMapper.toStudioTrackResponse(t, t.getGenre(), album, null))
                    .toList()
                : Collections.emptyList();

        return StudioAlbumResponse.builder()
                .id(album.getId())
                .title(album.getTitle())
                .slug(album.getSlug())
                .description(album.getDescription())
                .status(album.getStatus())
                .coverUrl(album.getCoverUrl())
                .releaseDate(album.getReleaseDate())
                .trackCount(trackCount)
                .publishedAt(album.getPublishedAt())
                .createdAt(album.getCreatedAt())
                .updatedAt(album.getUpdatedAt())
                .tracks(trackResponses)
                .build();
    }
}
