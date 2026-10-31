package groupone.soundwaveproject.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatorSearchResultResponse {
    private Long userId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private long trackCount;
}

