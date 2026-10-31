package groupone.soundwaveproject.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopResultResponse {
    private String type; // "SONG", "ALBUM", "CREATOR"
    private TrackResponse track;
    private PublicAlbumResponse album;
    private CreatorSearchResultResponse creator;
}

