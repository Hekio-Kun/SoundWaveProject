package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.response.PublicAlbumDetailsResponse;
import groupone.soundwaveproject.catalog.dto.response.PublicAlbumResponse;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlbumCatalogServiceTest {

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private UserAccountPublicService userAccountPublicService;

    @InjectMocks
    private AlbumCatalogService albumCatalogService;

    private Album album1;
    private Album album2;

    @BeforeEach
    void setUp() {
        album1 = Album.builder()
                .id(1L)
                .title("Ocean Waves")
                .slug("ocean-waves")
                .description("Calming ocean waves sounds")
                .status("PUBLISHED")
                .createdByUserId(10L)
                .releaseDate(LocalDate.of(2026, 1, 1))
                .publishedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        album2 = Album.builder()
                .id(2L)
                .title("Golden Sunset")
                .slug("golden-sunset")
                .description("Sunset acoustic melodies")
                .status("PUBLISHED")
                .createdByUserId(20L)
                .releaseDate(LocalDate.of(2026, 2, 1))
                .publishedAt(LocalDateTime.now().minusDays(5))
                .createdAt(LocalDateTime.now().minusDays(5))
                .build();
    }

    @Test
    @DisplayName("Should return published albums with pagination and creator summary")
    void testGetPublishedAlbums() {
        when(albumRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("PUBLISHED"))
                .thenReturn(List.of(album1, album2));
        when(trackRepository.countByAlbum_IdAndPublicationStatus(eq(1L), eq(TrackPublicationStatus.PUBLISHED)))
                .thenReturn(5L);
        when(trackRepository.countByAlbum_IdAndPublicationStatus(eq(2L), eq(TrackPublicationStatus.PUBLISHED)))
                .thenReturn(3L);
        when(userAccountPublicService.findUserSummaryById(10L))
                .thenReturn(Optional.of(new UserProfileSummary(10L, "artist1@soundwave.com", "Sea Artist", "https://avatar.url/1", "LISTENER")));
        when(userAccountPublicService.findUserSummaryById(20L))
                .thenReturn(Optional.of(new UserProfileSummary(20L, "artist2@soundwave.com", "Sand Artist", "https://avatar.url/2", "LISTENER")));

        Page<PublicAlbumResponse> result = albumCatalogService.getPublishedAlbums(null, "newest", PageRequest.of(0, 10));

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Ocean Waves");
        assertThat(result.getContent().get(0).getTrackCount()).isEqualTo(5);
        assertThat(result.getContent().get(0).getCreator().getDisplayName()).isEqualTo("Sea Artist");
    }

    @Test
    @DisplayName("Should filter published albums by search keyword")
    void testGetPublishedAlbumsWithSearch() {
        when(albumRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("PUBLISHED"))
                .thenReturn(List.of(album1, album2));
        when(trackRepository.countByAlbum_IdAndPublicationStatus(anyLong(), eq(TrackPublicationStatus.PUBLISHED)))
                .thenReturn(2L);
        when(userAccountPublicService.findUserSummaryById(anyLong()))
                .thenReturn(Optional.empty());

        Page<PublicAlbumResponse> result = albumCatalogService.getPublishedAlbums("Sunset", "title", PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Golden Sunset");
    }

    @Test
    @DisplayName("Should return published album details by ID with tracks")
    void testGetPublishedAlbumById() {
        when(albumRepository.findByIdAndStatusIgnoreCase(1L, "PUBLISHED"))
                .thenReturn(Optional.of(album1));

        Genre genre = Genre.builder().id(1L).name("Ambient").slug("ambient").build();
        Track track = Track.builder()
                .id(101L)
                .title("Gentle Tide")
                .slug("gentle-tide")
                .audioUrl("https://audio.url/track1.mp3")
                .durationMs(180000)
                .genre(genre)
                .album(album1)
                .uploaderUserId(10L)
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .createdAt(LocalDateTime.now())
                .build();

        when(trackRepository.findByAlbum_IdAndPublicationStatusOrderByTrackNumberAsc(1L, TrackPublicationStatus.PUBLISHED))
                .thenReturn(List.of(track));
        when(userAccountPublicService.findUserSummaryById(10L))
                .thenReturn(Optional.of(new UserProfileSummary(10L, "artist1@soundwave.com", "Sea Artist", "https://avatar.url/1", "LISTENER")));

        PublicAlbumDetailsResponse details = albumCatalogService.getPublishedAlbumByIdOrSlug("1");

        assertThat(details).isNotNull();
        assertThat(details.getTitle()).isEqualTo("Ocean Waves");
        assertThat(details.getTracks()).hasSize(1);
        assertThat(details.getTracks().get(0).title()).isEqualTo("Gentle Tide");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when album does not exist")
    void testGetPublishedAlbumNotFound() {
        when(albumRepository.findByIdAndStatusIgnoreCase(999L, "PUBLISHED"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> albumCatalogService.getPublishedAlbumByIdOrSlug("999"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Album not found or not published.");
    }
}
