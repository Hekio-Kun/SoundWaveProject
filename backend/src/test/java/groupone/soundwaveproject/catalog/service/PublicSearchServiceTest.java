package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.catalog.dto.response.*;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublicSearchServiceTest {

    @Mock
    private TrackCatalogService trackCatalogService;

    @Mock
    private AlbumCatalogService albumCatalogService;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private OfficialLyricRepository officialLyricRepository;

    @InjectMocks
    private PublicSearchService publicSearchService;

    private Pageable defaultPageable;

    @BeforeEach
    void setUp() {
        defaultPageable = PageRequest.of(0, 10);
    }

    @Test
    @DisplayName("EX01: Should throw BadRequestOperationException when query is shorter than 2 characters")
    void search_throwsBadRequest_whenQueryTooShort() {
        assertThatThrownBy(() -> publicSearchService.search("a", "ALL", defaultPageable))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Search keyword must be at least 2 characters long");

        assertThatThrownBy(() -> publicSearchService.search("   ", "ALL", defaultPageable))
                .isInstanceOf(BadRequestOperationException.class);
    }

    @Test
    @DisplayName("NF01: Should return unified search response with tracks, albums, creators, and lyrics")
    void search_unifiedReturnsGroupedResults() {
        TrackResponse sampleTrack = new TrackResponse(
                1L, "Chìm Sâu", "chim-sau", "Song description", "https://audio.url",
                "https://cover.url", 180000, 1000L, "PUBLISHED", "rap", "Rap",
                null, null, null, null
        );

        when(trackCatalogService.getPublishedTracks(isNull(), eq("chìm"), eq("trending"), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleTrack)));
        when(albumCatalogService.getPublishedAlbums(eq("chìm"), eq("newest"), any(Pageable.class)))
                .thenReturn(Page.empty());
        when(userProfileRepository.searchActiveCreators(eq("chìm"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(Page.empty());
        when(officialLyricRepository.searchPublishedLyrics(eq("chìm"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(Page.empty());

        UnifiedSearchResponse response = publicSearchService.search("chìm", "ALL", defaultPageable);

        assertThat(response).isNotNull();
        assertThat(response.getQuery()).isEqualTo("chìm");
        assertThat(response.getTracks().getContent()).hasSize(1);
        assertThat(response.getTopResult()).isNotNull();
        assertThat(response.getTopResult().getType()).isEqualTo("SONG");
        assertThat(response.getTopResult().getTrack().title()).isEqualTo("Chìm Sâu");
    }

    @Test
    @DisplayName("AF02: Should extract clean snippet and return lyrics result")
    void searchLyrics_returnsSnippetAndTrack() {
        Track mockTrack = mock(Track.class);
        OfficialLyric lyric = OfficialLyric.builder()
                .id(10L)
                .track(mockTrack)
                .lyricContent("[00:15.30] Tôi đi tìm một giấc mơ\n[00:19.45] Giữa đại dương bao la\n[00:23.00] Tiếng sóng vỗ về")
                .status("PUBLISHED")
                .build();

        TrackResponse sampleTrack = new TrackResponse(
                1L, "Đại Dương", "dai-duong", "Desc", "https://audio.url",
                "https://cover.url", 180000, 500L, "PUBLISHED", "pop", "Pop",
                null, null, null, null
        );

        when(officialLyricRepository.searchPublishedLyrics(eq("đại dương"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(lyric)));
        when(trackCatalogService.mapToTrackResponse(mockTrack))
                .thenReturn(sampleTrack);

        Page<LyricSearchResultResponse> result = publicSearchService.searchLyrics("đại dương", defaultPageable);

        assertThat(result.getContent()).hasSize(1);
        LyricSearchResultResponse item = result.getContent().get(0);
        assertThat(item.getOfficialLyricId()).isEqualTo(10L);
        assertThat(item.getLyricSnippet()).isEqualTo("Giữa đại dương bao la");
        assertThat(item.getTrack().title()).isEqualTo("Đại Dương");
    }

    @Test
    @DisplayName("extractLyricSnippet should strip LRC timestamp tags correctly")
    void extractLyricSnippet_stripsTimestamp() {
        String lrc = "[01:23.45] Câu hát một\n[01:28.120] Câu hát có từ khóa tìm kiếm ở đây\n[01:32.00] Câu hát ba";
        String snippet = publicSearchService.extractLyricSnippet(lrc, "từ khóa");
        assertThat(snippet).isEqualTo("Câu hát có từ khóa tìm kiếm ở đây");
    }

    @Test
    @DisplayName("Should match unaccented search query 'tim em' with accented track 'Tìm Em' in title")
    void search_matchesUnaccentedKeywordWithAccentedTitle() {
        TrackResponse timEmTrack = new TrackResponse(
                5L, "Tìm Em", "tim-em-hngle-bao-anh", "Desc", "https://audio.url",
                "https://cover.url", 272170, 198400L, "PUBLISHED", "rnb", "R&B",
                null, null, null, null
        );

        when(trackCatalogService.getPublishedTracks(isNull(), eq("tim em"), eq("trending"), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(timEmTrack)));
        when(albumCatalogService.getPublishedAlbums(eq("tim em"), eq("newest"), any(Pageable.class)))
                .thenReturn(Page.empty());
        when(userProfileRepository.searchActiveCreators(eq("tim em"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(Page.empty());
        when(officialLyricRepository.searchPublishedLyrics(eq("tim em"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(Page.empty());

        UnifiedSearchResponse response = publicSearchService.search("tim em", "ALL", defaultPageable);

        assertThat(response).isNotNull();
        assertThat(response.getTracks().getContent()).hasSize(1);
        assertThat(response.getTopResult()).isNotNull();
        assertThat(response.getTopResult().getType()).isEqualTo("SONG");
        assertThat(response.getTopResult().getTrack().title()).isEqualTo("Tìm Em");
    }

    @Test
    @DisplayName("Searching author/artist should return Creator as TopResult and NOT leak into Songs or Albums")
    void search_artistKeywordDoesNotLeakIntoSongsOrAlbums_andTopResultIsCreator() {
        UserProfile mckProfile = mock(UserProfile.class);
        when(mckProfile.getUserId()).thenReturn(2L);
        when(mckProfile.getUsername()).thenReturn("mck99");
        when(mckProfile.getDisplayName()).thenReturn("MCK");

        when(trackCatalogService.getPublishedTracks(isNull(), eq("mck"), eq("trending"), isNull(), any(Pageable.class)))
                .thenReturn(Page.empty());
        when(albumCatalogService.getPublishedAlbums(eq("mck"), eq("newest"), any(Pageable.class)))
                .thenReturn(Page.empty());
        when(userProfileRepository.searchActiveCreators(eq("mck"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(mckProfile)));
        when(trackRepository.countByUploaderUserIdAndPublicationStatus(eq(2L), eq(TrackPublicationStatus.PUBLISHED)))
                .thenReturn(5L);
        when(officialLyricRepository.searchPublishedLyrics(eq("mck"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(Page.empty());

        UnifiedSearchResponse response = publicSearchService.search("mck", "ALL", defaultPageable);

        assertThat(response).isNotNull();
        assertThat(response.getTracks().getContent()).isEmpty();
        assertThat(response.getAlbums().getContent()).isEmpty();
        assertThat(response.getCreators().getContent()).hasSize(1);
        assertThat(response.getTopResult()).isNotNull();
        assertThat(response.getTopResult().getType()).isEqualTo("CREATOR");
        assertThat(response.getTopResult().getCreator().getDisplayName()).isEqualTo("MCK");
    }

    @Test
    @DisplayName("Searching unaccented artist query 'bao anh' should match accented creator 'Bảo Anh' via fallback")
    void search_unaccentedCreatorMatchesAccentedDisplayName() {
        when(userProfileRepository.searchActiveCreators(eq("bao anh"), anyString(), anyString(), any(Pageable.class)))
                .thenReturn(Page.empty());

        groupone.soundwaveproject.authentication.entity.User activeUser = mock(groupone.soundwaveproject.authentication.entity.User.class);
        when(activeUser.getStatus()).thenReturn(groupone.soundwaveproject.authentication.entity.UserStatus.ACTIVE);

        UserProfile baoAnhProfile = mock(UserProfile.class);
        when(baoAnhProfile.getUser()).thenReturn(activeUser);
        when(baoAnhProfile.getUserId()).thenReturn(5L);
        when(baoAnhProfile.getUsername()).thenReturn("hngle");
        when(baoAnhProfile.getDisplayName()).thenReturn("Hngle ft. Bảo Anh");

        when(userProfileRepository.findAll()).thenReturn(List.of(baoAnhProfile));
        when(trackRepository.countByUploaderUserIdAndPublicationStatus(eq(5L), eq(TrackPublicationStatus.PUBLISHED)))
                .thenReturn(1L);

        Page<CreatorSearchResultResponse> result = publicSearchService.searchCreators("bao anh", defaultPageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getDisplayName()).isEqualTo("Hngle ft. Bảo Anh");
    }
}

