package groupone.soundwaveproject.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LyricSearchResultResponse {
    private Long officialLyricId;
    private TrackResponse track;
    private String lyricSnippet;
}

