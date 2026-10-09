package groupone.soundwaveproject.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tự động tạo dữ liệu thể loại và bài hát mẫu khi bật app.seed.demo-enabled=true
 * phục vụ kiểm thử tính năng Stream Music (BR-09, BR-12, BR-13).
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DemoCatalogInitializer implements ApplicationRunner {
    private final GenreRepository genreRepository;
    private final TrackRepository trackRepository;
    private final AppUserRepository userRepository;

    @Value("${app.seed.demo-enabled:true}")
    private boolean demoEnabled;

    private static final String DEMO_AUDIO_URL = "https://res.cloudinary.com/demo/video/upload/dog.mp3";
    private static final String DEMO_COVER_URL = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!demoEnabled) {
            log.info("Demo catalog seeding is disabled.");
            return;
        }

        AppUser adminUser = userRepository.findAll().stream().findFirst().orElse(null);
        if (adminUser == null) {
            log.warn("Cannot seed demo catalog because no user exists in app_users yet.");
            return;
        }

        Genre popGenre = genreRepository.findBySlug("pop").orElseGet(() ->
                genreRepository.save(new Genre("Pop", "pop", "Nhạc Pop thịnh hành", adminUser.getId())));
        Genre acousticGenre = genreRepository.findBySlug("acoustic").orElseGet(() ->
                genreRepository.save(new Genre("Acoustic", "acoustic", "Nhạc mộc mạc", adminUser.getId())));

        // 1. Bài hát đã xuất bản (PUBLISHED - thời lượng 60s -> ngưỡng nghe BR.13 là 30s)
        if (trackRepository.findBySlugAndPublicationStatus("seed-som-mai-diu-dang", TrackPublicationStatus.PUBLISHED).isEmpty()) {
            Track publishedTrack = new Track(
                    adminUser.getId(),
                    acousticGenre,
                    null,
                    "Sớm Mai Dịu Dàng (Seed)",
                    "seed-som-mai-diu-dang",
                    "Bài hát đã xuất bản để kiểm tra catalog và playback.",
                    "seed/audio-published",
                    DEMO_AUDIO_URL,
                    "mp3",
                    60000,
                    "seed/cover-published",
                    DEMO_COVER_URL,
                    TrackPublicationStatus.PUBLISHED
            );
            publishedTrack.setPlayCountCache(1240L);
            trackRepository.save(publishedTrack);
            log.info("Seeded demo published track: Sớm Mai Dịu Dàng (id={})", publishedTrack.getId());
        }

        // 2. Bài hát ngắn (PUBLISHED - thời lượng 15s -> ngưỡng nghe BR.13 là 90% = 13.5s)
        if (trackRepository.findBySlugAndPublicationStatus("seed-giai-dieu-ngan-15s", TrackPublicationStatus.PUBLISHED).isEmpty()) {
            Track shortTrack = new Track(
                    adminUser.getId(),
                    popGenre,
                    null,
                    "Giai Điệu Ngắn 15s (Seed)",
                    "seed-giai-dieu-ngan-15s",
                    "Bài hát ngắn kiểm tra ngưỡng nghe 90% duration.",
                    "seed/audio-short",
                    DEMO_AUDIO_URL,
                    "mp3",
                    15000,
                    "seed/cover-short",
                    DEMO_COVER_URL,
                    TrackPublicationStatus.PUBLISHED
            );
            shortTrack.setPlayCountCache(50L);
            trackRepository.save(shortTrack);
            log.info("Seeded demo short track: Giai Điệu Ngắn 15s (id={})", shortTrack.getId());
        }

        // 3. Bài hát bản nháp (DRAFT - dùng để test quy tắc BR-09 trả về 404)
        if (trackRepository.findAll().stream().noneMatch(t -> "seed-draft-song".equals(t.getSlug()))) {
            Track draftTrack = new Track(
                    adminUser.getId(),
                    popGenre,
                    null,
                    "Bản Nháp Chưa Duyệt (Seed)",
                    "seed-draft-song",
                    "Bài hát bản nháp dùng để kiểm tra BR-09 từ chối phát.",
                    "seed/audio-draft",
                    DEMO_AUDIO_URL,
                    "mp3",
                    45000,
                    "seed/cover-draft",
                    DEMO_COVER_URL,
                    TrackPublicationStatus.DRAFT
            );
            trackRepository.save(draftTrack);
            log.info("Seeded demo draft track: Bản Nháp Chưa Duyệt (id={})", draftTrack.getId());
        }
    }
}
