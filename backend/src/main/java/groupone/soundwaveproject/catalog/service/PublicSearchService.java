package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.catalog.dto.response.*;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.catalog.util.SearchNormalizeUtil;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicSearchService {

    private final TrackCatalogService trackCatalogService;
    private final AlbumCatalogService albumCatalogService;
    private final TrackRepository trackRepository;
    private final UserProfileRepository userProfileRepository;
    private final OfficialLyricRepository officialLyricRepository;

    /**
     * Executes unified public catalog search across published songs, albums, active creators,
     * and officially approved lyrics.
     * Enforces BR-09 (public status only) and BR-10 (official lyrics published only).
     *
     * @param query Search keyword (must be >= 2 characters).
     * @param type Category type ('ALL', 'SONGS', 'ALBUMS', 'CREATORS', 'LYRICS').
     * @param pageable Pagination configuration.
     * @return {@link UnifiedSearchResponse} containing matching results and best top match.
     */
    @Transactional(readOnly = true)
    public UnifiedSearchResponse search(String query, String type, Pageable pageable) {
        if (query == null || query.trim().length() < 2) {
            throw new BadRequestOperationException("INVALID_KEYWORD_LENGTH", "Search keyword must be at least 2 characters long.");
        }

        String normalized = query.trim();
        String searchType = (type == null || type.isBlank()) ? "ALL" : type.trim().toUpperCase();

        Page<TrackResponse> tracks = Page.empty(pageable);
        Page<PublicAlbumResponse> albums = Page.empty(pageable);
        Page<CreatorSearchResultResponse> creators = Page.empty(pageable);
        Page<LyricSearchResultResponse> lyrics = Page.empty(pageable);
        TopResultResponse topResult = null;

        switch (searchType) {
            case "SONGS" -> {
                tracks = trackCatalogService.getPublishedTracks(null, normalized, "trending", null, pageable);
            }
            case "ALBUMS" -> {
                albums = albumCatalogService.getPublishedAlbums(normalized, "newest", pageable);
            }
            case "CREATORS" -> {
                creators = searchCreators(normalized, pageable);
            }
            case "LYRICS" -> {
                lyrics = searchLyrics(normalized, pageable);
            }
            case "ALL" -> {
                // Grouped preview with top items
                Pageable trackPreview = PageRequest.of(0, 5);
                Pageable albumPreview = PageRequest.of(0, 4);
                Pageable creatorPreview = PageRequest.of(0, 4);
                Pageable lyricPreview = PageRequest.of(0, 4);

                tracks = trackCatalogService.getPublishedTracks(null, normalized, "trending", null, trackPreview);
                albums = albumCatalogService.getPublishedAlbums(normalized, "newest", albumPreview);
                creators = searchCreators(normalized, creatorPreview);
                lyrics = searchLyrics(normalized, lyricPreview);

                topResult = determineTopResult(normalized, tracks.getContent(), albums.getContent(), creators.getContent());
            }
            default -> {
                throw new BadRequestOperationException("INVALID_SEARCH_TYPE", "Invalid search type: " + searchType);
            }
        }

        return UnifiedSearchResponse.builder()
                .query(normalized)
                .type(searchType)
                .topResult(topResult)
                .tracks(tracks)
                .albums(albums)
                .creators(creators)
                .lyrics(lyrics)
                .build();
    }

    /**
     * Searches active creator profiles matching the keyword with track counts.
     */
    @Transactional(readOnly = true)
    public Page<CreatorSearchResultResponse> searchCreators(String keyword, Pageable pageable) {
        String unaccented = SearchNormalizeUtil.toUnaccented(keyword);
        String slugKeyword = SearchNormalizeUtil.toSlug(keyword);
        Page<UserProfile> profilesPage = userProfileRepository.searchActiveCreators(keyword, unaccented, slugKeyword, pageable);
        List<UserProfile> profileList;
        if (profilesPage.isEmpty()) {
            String lower = keyword.toLowerCase();
            profileList = userProfileRepository.findAll().stream()
                    .filter(p -> p.getUser() != null && p.getUser().getStatus() == UserStatus.ACTIVE)
                    .filter(p -> (p.getDisplayName() != null && (p.getDisplayName().toLowerCase().contains(lower) || SearchNormalizeUtil.toUnaccented(p.getDisplayName()).contains(unaccented)))
                            || (p.getUsername() != null && (p.getUsername().toLowerCase().contains(lower) || SearchNormalizeUtil.toUnaccented(p.getUsername()).contains(unaccented))))
                    .toList();
        } else {
            profileList = profilesPage.getContent();
        }

        List<CreatorSearchResultResponse> responses = profileList.stream()
                .map(profile -> {
                    long trackCount = trackRepository.countByUploaderUserIdAndPublicationStatus(
                            profile.getUserId(), TrackPublicationStatus.PUBLISHED
                    );
                    return CreatorSearchResultResponse.builder()
                            .userId(profile.getUserId())
                            .username(profile.getUsername())
                            .displayName(profile.getDisplayName())
                            .avatarUrl(profile.getAvatarUrl())
                            .bio(profile.getBio())
                            .trackCount(trackCount)
                            .build();
                })
                .toList();

        long total = profilesPage.isEmpty() ? profileList.size() : profilesPage.getTotalElements();
        return new PageImpl<>(responses, pageable, total);
    }

    /**
     * Searches text within officially approved published lyrics (AF02 & BR-10).
     */
    @Transactional(readOnly = true)
    public Page<LyricSearchResultResponse> searchLyrics(String keyword, Pageable pageable) {
        String unaccented = SearchNormalizeUtil.toUnaccented(keyword);
        String slugKeyword = SearchNormalizeUtil.toSlug(keyword);
        Page<OfficialLyric> lyricsPage = officialLyricRepository.searchPublishedLyrics(keyword, unaccented, slugKeyword, pageable);
        List<OfficialLyric> lyricsList;
        if (lyricsPage.isEmpty()) {
            String lower = keyword.toLowerCase();
            lyricsList = officialLyricRepository.findAll().stream()
                    .filter(l -> "PUBLISHED".equalsIgnoreCase(l.getStatus()) && l.getTrack() != null && l.getTrack().getPublicationStatus() == TrackPublicationStatus.PUBLISHED)
                    .filter(l -> (l.getLyricContent() != null && (l.getLyricContent().toLowerCase().contains(lower) || SearchNormalizeUtil.toUnaccented(l.getLyricContent()).contains(unaccented)))
                            || (l.getTrack().getTitle() != null && (l.getTrack().getTitle().toLowerCase().contains(lower) || SearchNormalizeUtil.toUnaccented(l.getTrack().getTitle()).contains(unaccented))))
                    .toList();
        } else {
            lyricsList = lyricsPage.getContent();
        }

        List<LyricSearchResultResponse> responses = lyricsList.stream()
                .map(lyric -> {
                    TrackResponse trackResponse = trackCatalogService.mapToTrackResponse(lyric.getTrack());
                    String snippet = extractLyricSnippet(lyric.getLyricContent(), keyword);
                    return LyricSearchResultResponse.builder()
                            .officialLyricId(lyric.getId())
                            .track(trackResponse)
                            .lyricSnippet(snippet)
                            .build();
                })
                .toList();

        long total = lyricsPage.isEmpty() ? lyricsList.size() : lyricsPage.getTotalElements();
        return new PageImpl<>(responses, pageable, total);
    }

    /**
     * Extracts 1-2 snippet lines matching the search keyword, stripping LRC timestamp tags.
     */
    public String extractLyricSnippet(String lyricContent, String keyword) {
        if (lyricContent == null || keyword == null || lyricContent.isBlank() || keyword.isBlank()) {
            return "";
        }
        String[] lines = lyricContent.split("\\r?\\n");
        String lowerKeyword = keyword.toLowerCase();
        String unaccentedKeyword = SearchNormalizeUtil.toUnaccented(lowerKeyword);
        List<String> matchingLines = new ArrayList<>();

        for (String rawLine : lines) {
            // Strip timestamp like [01:23.45] or [00:12]
            String cleanLine = rawLine.replaceAll("\\[\\d{1,2}:\\d{2}(?:\\.\\d{1,3})?\\]", "").trim();
            if (cleanLine.toLowerCase().contains(lowerKeyword) || SearchNormalizeUtil.toUnaccented(cleanLine).contains(unaccentedKeyword)) {
                matchingLines.add(cleanLine);
                if (matchingLines.size() >= 2) break;
            }
        }

        if (matchingLines.isEmpty()) {
            // Fallback: search raw content in case timestamps interfered
            for (String rawLine : lines) {
                if (rawLine.toLowerCase().contains(lowerKeyword)) {
                    String clean = rawLine.replaceAll("\\[[^\\]]*\\]", "").trim();
                    if (!clean.isBlank()) {
                        matchingLines.add(clean);
                        if (matchingLines.size() >= 2) break;
                    }
                }
            }
        }

        return String.join(" ... ", matchingLines);
    }

    /**
     * Determines the most relevant top result among matching songs, albums, and creators.
     */
    private TopResultResponse determineTopResult(
            String keyword,
            List<TrackResponse> tracks,
            List<PublicAlbumResponse> albums,
            List<CreatorSearchResultResponse> creators
    ) {
        String lower = keyword.toLowerCase();
        String unaccented = SearchNormalizeUtil.toUnaccented(lower);

        // 1. Exact track match
        for (TrackResponse track : tracks) {
            if (track.title() != null && (track.title().equalsIgnoreCase(lower) || SearchNormalizeUtil.toUnaccented(track.title()).equalsIgnoreCase(unaccented))) {
                return TopResultResponse.builder().type("SONG").track(track).build();
            }
        }

        // 2. Exact album match
        for (PublicAlbumResponse album : albums) {
            if (album.getTitle() != null && (album.getTitle().equalsIgnoreCase(lower) || SearchNormalizeUtil.toUnaccented(album.getTitle()).equalsIgnoreCase(unaccented))) {
                return TopResultResponse.builder().type("ALBUM").album(album).build();
            }
        }

        // 3. Exact creator match
        for (CreatorSearchResultResponse creator : creators) {
            if ((creator.getDisplayName() != null && (creator.getDisplayName().equalsIgnoreCase(lower) || SearchNormalizeUtil.toUnaccented(creator.getDisplayName()).equalsIgnoreCase(unaccented)))
                    || (creator.getUsername() != null && creator.getUsername().equalsIgnoreCase(lower))) {
                return TopResultResponse.builder().type("CREATOR").creator(creator).build();
            }
        }

        // 4. Fallback to first available item (Songs > Albums > Creators)
        if (!tracks.isEmpty()) {
            return TopResultResponse.builder().type("SONG").track(tracks.get(0)).build();
        }
        if (!albums.isEmpty()) {
            return TopResultResponse.builder().type("ALBUM").album(albums.get(0)).build();
        }
        if (!creators.isEmpty()) {
            return TopResultResponse.builder().type("CREATOR").creator(creators.get(0)).build();
        }

        return null;
    }
}
