package groupone.soundwaveproject;

import groupone.soundwaveproject.library.dto.request.PlaylistRequest;
import groupone.soundwaveproject.library.dto.response.PlaylistResponse;
import groupone.soundwaveproject.library.service.PlaylistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SoundWaveProjectApplicationTests {

    @Autowired
    private PlaylistService playlistService;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Test
    void contextLoads() {
    }

}
