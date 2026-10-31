package groupone.soundwaveproject.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedSearchResponse {
    private String query;
    private String type;
    private TopResultResponse topResult;
    private Page<TrackResponse> tracks;
    private Page<PublicAlbumResponse> albums;
    private Page<CreatorSearchResultResponse> creators;
    private Page<LyricSearchResultResponse> lyrics;
}

