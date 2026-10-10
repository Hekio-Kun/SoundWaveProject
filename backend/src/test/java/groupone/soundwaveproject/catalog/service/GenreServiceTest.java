package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.request.CreateGenreRequest;
import groupone.soundwaveproject.catalog.dto.request.UpdateGenreRequest;
import groupone.soundwaveproject.catalog.dto.response.AdminGenrePageResponse;
import groupone.soundwaveproject.catalog.dto.response.AdminGenreResponse;
import groupone.soundwaveproject.catalog.dto.response.GenreResponse;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GenreServiceTest {

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private UserAccountPublicService userAccountPublicService;

    private GenreService genreService;

    @BeforeEach
    void setUp() {
        genreService = new GenreService(genreRepository, trackRepository, userAccountPublicService);
    }

    @Test
    void getActiveGenres_ShouldReturnAllActive() {
        Genre genre = new Genre("Pop", "pop", "Catchy pop", 1L);
        ReflectionTestUtils.setField(genre, "id", 1L);

        when(genreRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(genre));

        List<GenreResponse> result = genreService.getActiveGenres();

        assertEquals(1, result.size());
        assertEquals("Pop", result.get(0).name());
        assertEquals("pop", result.get(0).slug());
    }

    @Test
    void getGenres_searchAndFilter_returnsAdminGenrePageResponse() {
        Genre genre = new Genre("Rock", "rock", "Rock music", 1L);
        ReflectionTestUtils.setField(genre, "id", 10L);

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(genreRepository.searchForAdmin("rock", true, pageRequest))
                .thenReturn(new PageImpl<>(List.of(genre), pageRequest, 1));

        AdminGenrePageResponse response = genreService.getGenres("rock", true, pageRequest);

        assertEquals(1, response.totalElements());
        assertEquals(1, response.content().size());
        assertEquals("Rock", response.content().get(0).name());
    }

    @Test
    void getGenre_existingId_returnsAdminGenreResponse() {
        Genre genre = new Genre("Jazz", "jazz", "Smooth jazz", 1L);
        ReflectionTestUtils.setField(genre, "id", 3L);
        when(genreRepository.findById(3L)).thenReturn(Optional.of(genre));

        AdminGenreResponse response = genreService.getGenre(3L);

        assertEquals("Jazz", response.name());
        assertEquals("jazz", response.slug());
    }

    @Test
    void getGenre_nonExistingId_throwsResourceNotFoundException() {
        when(genreRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> genreService.getGenre(999L));
    }

    @Test
    void createGenre_validRequest_createsActiveGenreWithNormalizedSlug() {
        when(userAccountPublicService.getUserIdByEmail("admin@soundwave.com")).thenReturn(7L);
        when(genreRepository.save(any(Genre.class))).thenAnswer(invocation -> {
            Genre genre = invocation.getArgument(0);
            ReflectionTestUtils.setField(genre, "id", 15L);
            return genre;
        });

        AdminGenreResponse response = genreService.createGenre(
                new CreateGenreRequest("Nhạc Trữ Tình", "", "Vietnamese sentimental music"),
                "admin@soundwave.com"
        );

        assertEquals("Nhạc Trữ Tình", response.name());
        assertEquals("nhac-tru-tinh", response.slug());
        assertTrue(response.active());
        assertEquals(7L, response.createdByUserId());
    }

    @Test
    void createGenre_duplicateName_throwsConflict() {
        when(genreRepository.existsByNameIgnoreCase("Pop")).thenReturn(true);

        ConflictOperationException exception = assertThrows(
                ConflictOperationException.class,
                () -> genreService.createGenre(
                        new CreateGenreRequest("Pop", "pop-v2", null),
                        "admin@soundwave.com"
                )
        );

        assertEquals("GENRE_NAME_EXISTS", exception.getCode());
        verify(genreRepository, never()).save(any());
    }

    @Test
    void updateGenre_existingGenre_updatesEditableFields() {
        Genre genre = new Genre("R&B", "rnb", "Old description", 1L);
        ReflectionTestUtils.setField(genre, "id", 4L);
        when(genreRepository.findById(4L)).thenReturn(Optional.of(genre));
        when(genreRepository.save(genre)).thenReturn(genre);

        AdminGenreResponse response = genreService.updateGenre(
                4L,
                new UpdateGenreRequest("R&B and Soul", "rnb-soul", "Updated description")
        );

        assertEquals("R&B and Soul", response.name());
        assertEquals("rnb-soul", response.slug());
        assertEquals("Updated description", response.description());
    }

    @Test
    void updateActiveState_existingGenre_deactivatesWithoutDeleting() {
        Genre genre = new Genre("Jazz", "jazz", null, 1L);
        ReflectionTestUtils.setField(genre, "id", 8L);
        when(genreRepository.findById(8L)).thenReturn(Optional.of(genre));
        when(genreRepository.save(genre)).thenReturn(genre);

        AdminGenreResponse response = genreService.updateActiveState(8L, false);

        assertFalse(response.active());
        verify(genreRepository).save(genre);
        verify(genreRepository, never()).delete(any());
    }

    @Test
    void deleteGenre_whenGenreInUseByTracks_throwsConflictOperationException() {
        Genre genre = new Genre("Metal", "metal", null, 1L);
        ReflectionTestUtils.setField(genre, "id", 5L);
        when(genreRepository.findById(5L)).thenReturn(Optional.of(genre));
        when(trackRepository.existsByGenre_Id(5L)).thenReturn(true);

        ConflictOperationException ex = assertThrows(
                ConflictOperationException.class,
                () -> genreService.deleteGenre(5L)
        );

        assertEquals("GENRE_IN_USE", ex.getCode());
        verify(genreRepository, never()).delete(any());
    }

    @Test
    void deleteGenre_whenGenreNotInUse_deletesSuccessfully() {
        Genre genre = new Genre("Electronic", "electronic", null, 1L);
        ReflectionTestUtils.setField(genre, "id", 6L);
        when(genreRepository.findById(6L)).thenReturn(Optional.of(genre));
        when(trackRepository.existsByGenre_Id(6L)).thenReturn(false);

        genreService.deleteGenre(6L);

        verify(genreRepository).delete(genre);
    }
}
