package groupone.soundwaveproject.config;

import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class CatalogDataInitializer implements ApplicationRunner {

    private final GenreRepository genreRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initDefaultGenres();
    }

    private void initDefaultGenres() {
        if (genreRepository.count() == 0) {
            List<Genre> defaultGenres = List.of(
                    Genre.builder().name("Pop").slug("pop").description("Bright, catchy, and popular melodies.").isActive(true).build(),
                    Genre.builder().name("Ballad").slug("ballad").description("Gentle, heartfelt songs rich in emotion.").isActive(true).build(),
                    Genre.builder().name("Rap / Hip-hop").slug("rap-hip-hop").description("Energetic beats with honest, expressive lyrics.").isActive(true).build(),
                    Genre.builder().name("R&B").slug("rnb").description("Smooth, warm, and soulful melodies.").isActive(true).build(),
                    Genre.builder().name("Acoustic").slug("acoustic").description("Natural sounds from acoustic guitar and piano.").isActive(true).build(),
                    Genre.builder().name("EDM").slug("edm").description("High-energy modern electronic music.").isActive(true).build(),
                    Genre.builder().name("Indie").slug("indie").description("Independent music with a free and distinctive spirit.").isActive(true).build(),
                    Genre.builder().name("Lofi").slug("lofi").description("Relaxing sounds for studying and working.").isActive(true).build()
            );

            genreRepository.saveAll(defaultGenres);
            log.info("Initialized {} default music genres in catalog.", defaultGenres.size());
        }
    }
}
