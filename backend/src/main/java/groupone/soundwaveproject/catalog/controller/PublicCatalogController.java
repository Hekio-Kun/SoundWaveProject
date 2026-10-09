package groupone.soundwaveproject.catalog.controller;

import groupone.soundwaveproject.catalog.dto.PublicTrackResponse;
import groupone.soundwaveproject.catalog.service.PublicCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tracks")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final PublicCatalogService publicCatalogService;

    @GetMapping("/{idOrSlug}")
    public PublicTrackResponse getTrackByIdOrSlug(@PathVariable String idOrSlug) {
        return publicCatalogService.getTrackByIdOrSlug(idOrSlug);
    }

    @GetMapping("/{idOrSlug}/recommendations")
    public List<PublicTrackResponse> getRecommendations(
            @PathVariable String idOrSlug,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return publicCatalogService.getRecommendations(idOrSlug, limit);
    }
}
