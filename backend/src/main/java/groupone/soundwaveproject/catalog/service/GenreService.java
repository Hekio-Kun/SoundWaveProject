package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.request.CreateGenreRequest;
import groupone.soundwaveproject.catalog.dto.request.UpdateGenreRequest;
import groupone.soundwaveproject.catalog.dto.response.AdminGenrePageResponse;
import groupone.soundwaveproject.catalog.dto.response.AdminGenreResponse;
import groupone.soundwaveproject.catalog.dto.response.GenreResponse;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Service for handling business logic related to music genres (Genre).
 * Covers public catalog queries for listeners (UC-8) and administrator management (UC-26: Manage Genres).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;
    private final UserAccountPublicService userAccountPublicService;

    /**
     * Retrieves active genres (is_active = true) ordered alphabetically by name (UC-8 Phase 1).
     */
    @Transactional(readOnly = true)
    public List<GenreResponse> getActiveGenres() {
        log.info("Fetching active genres for public catalog filter.");
        return genreRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Looks up an active genre by its slug (UC-8 Phase 1).
     */
    @Transactional(readOnly = true)
    public Optional<Genre> findActiveGenreBySlug(String slug) {
        if (slug == null || slug.isBlank() || "all".equalsIgnoreCase(slug)) {
            return Optional.empty();
        }
        return genreRepository.findBySlug(slug)
                .filter(g -> Boolean.TRUE.equals(g.getIsActive()));
    }

    /**
     * Searches and filters genres for the administrator management dashboard (UC-26: Manage Genres).
     *
     * @param search   Search keyword by name or slug
     * @param active   Active status filter (null to retrieve all)
     * @param pageable Pagination and sorting configuration
     * @return Administrator genre page response DTO
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public AdminGenrePageResponse getGenres(String search, Boolean active, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        Page<AdminGenreResponse> genres = genreRepository.searchForAdmin(normalizedSearch, active, pageable)
                .map(this::toAdminGenreResponse);
        return AdminGenrePageResponse.from(genres);
    }

    /**
     * Retrieves detailed information of a genre by its ID for admins (UC-26 View Genre Detail).
     *
     * @param id ID of the genre to look up
     * @return Administrator genre response DTO
     * @throws ResourceNotFoundException if the genre is not found
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public AdminGenreResponse getGenre(Long id) {
        return toAdminGenreResponse(findGenre(id));
    }

    /**
     * Creates a new music genre and tracks the creator's admin ID (UC-26.1 Create Genre).
     * Validates name and slug uniqueness according to rule 26.0.E1.
     *
     * @param request          Genre creation data (name, slug, description)
     * @param currentUserEmail Email of the admin creating the genre
     * @return Created genre response DTO
     * @throws ConflictOperationException if name or slug already exists
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminGenreResponse createGenre(CreateGenreRequest request, String currentUserEmail) {
        // 1. Normalize name and auto-generate slug if absent
        String name = request.name().trim();
        String slug = resolveSlug(request.slug(), name);

        // 2. Validate uniqueness of name and slug (26.0.E1)
        validateUniqueValues(name, slug, null);

        // 3. Resolve admin creator ID from authenticated email
        Long creatorId = userAccountPublicService.getUserIdByEmail(currentUserEmail);

        // 4. Initialize and persist the new genre entity
        Genre genre = new Genre(name, slug, normalizeDescription(request.description()), creatorId);
        return toAdminGenreResponse(genreRepository.save(genre));
    }

    /**
     * Updates name, slug, and description of an existing genre (UC-26.3 Update Genre).
     *
     * @param id      ID of the genre to update
     * @param request New genre data
     * @return Updated genre response DTO
     * @throws ResourceNotFoundException  if genre is not found
     * @throws ConflictOperationException if name or slug conflicts with another genre
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminGenreResponse updateGenre(Long id, UpdateGenreRequest request) {
        // 1. Find genre by ID
        Genre genre = findGenre(id);

        // 2. Normalize updated data
        String name = request.name().trim();
        String slug = resolveSlug(request.slug(), name);

        // 3. Validate uniqueness against other genres
        validateUniqueValues(name, slug, id);

        // 4. Update and persist changes
        genre.update(name, slug, normalizeDescription(request.description()), LocalDateTime.now(ZoneOffset.UTC));
        return toAdminGenreResponse(genreRepository.save(genre));
    }

    /**
     * Activates or deactivates a music genre according to data integrity rules (UC-26.4 / BR-23 Update Genre Status).
     *
     * @param id     ID of the genre to toggle
     * @param active New active state (true: activate, false: deactivate)
     * @return Updated genre response DTO
     * @throws ResourceNotFoundException if genre is not found
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminGenreResponse updateActiveState(Long id, boolean active) {
        // 1. Find genre to update
        Genre genre = findGenre(id);

        // 2. Update status if changed
        if (genre.isActive() != active) {
            genre.changeActiveState(active, LocalDateTime.now(ZoneOffset.UTC));
            genreRepository.save(genre);
        }
        return toAdminGenreResponse(genre);
    }

    /**
     * Converts a Genre entity to AdminGenreResponse DTO.
     *
     * @param genre Genre entity
     * @return AdminGenreResponse DTO
     */
    public AdminGenreResponse toAdminGenreResponse(Genre genre) {
        if (genre == null) {
            return null;
        }
        return new AdminGenreResponse(
                genre.getId(),
                genre.getName(),
                genre.getSlug(),
                genre.getDescription(),
                genre.isActive(),
                genre.getCreatedByUserId(),
                genre.getCreatedAt(),
                genre.getUpdatedAt()
        );
    }

    private Genre findGenre(Long id) {
        return genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "GENRE_NOT_FOUND", "Genre was not found with ID: " + id));
    }

    private void validateUniqueValues(String name, String slug, Long excludedId) {
        boolean duplicateName = (excludedId == null)
                ? genreRepository.existsByNameIgnoreCase(name)
                : genreRepository.existsByNameIgnoreCaseAndIdNot(name, excludedId);
        if (duplicateName) {
            throw new ConflictOperationException("GENRE_NAME_EXISTS", "A genre with this name already exists.");
        }

        boolean duplicateSlug = (excludedId == null)
                ? genreRepository.existsBySlugIgnoreCase(slug)
                : genreRepository.existsBySlugIgnoreCaseAndIdNot(slug, excludedId);
        if (duplicateSlug) {
            throw new ConflictOperationException("GENRE_SLUG_EXISTS", "A genre with this slug already exists.");
        }
    }

    private String resolveSlug(String requestedSlug, String name) {
        String source = (requestedSlug == null || requestedSlug.isBlank()) ? name : requestedSlug;
        String slug = Normalizer.normalize(source.replace('đ', 'd').replace('Đ', 'D'), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (slug.isBlank()) {
            throw new BadRequestOperationException("INVALID_GENRE_SLUG", "Genre slug could not be generated from the provided value.");
        }
        if (slug.length() > 100) {
            throw new BadRequestOperationException("INVALID_GENRE_SLUG", "Genre slug must not exceed 100 characters.");
        }
        return slug;
    }

    private String normalizeDescription(String description) {
        return (description == null || description.isBlank()) ? null : description.trim();
    }

    private GenreResponse mapToResponse(Genre genre) {
        return new GenreResponse(
                genre.getId(),
                genre.getName(),
                genre.getSlug(),
                genre.getDescription()
        );
    }
}
