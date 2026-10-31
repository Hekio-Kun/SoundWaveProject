-- ======================================================================================
-- SoundWave Local Data Restoration Script: restore_local_soundwave_data.sql
-- Mục đích: Khôi phục toàn bộ bảng và dữ liệu mẫu chuẩn (Nghệ sĩ, Bài hát Cloudinary, 
-- Album, Lyrics chính thức) cho Local PostgreSQL sau sự cố gián đoạn Neon.
-- ======================================================================================

BEGIN;

DO $$
DECLARE
    v_pwd VARCHAR(255) := '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.'; -- Test@123456
    v_now TIMESTAMP := timezone('UTC', CURRENT_TIMESTAMP(3));
    
    -- User IDs
    v_u_sontung BIGINT;
    v_u_mck BIGINT;
    v_u_hieu BIGINT;
    v_u_uyenlinh BIGINT;
    v_u_hngle BIGINT;
    v_u_yorushika BIGINT;
    v_u_yoko BIGINT;
    v_u_yoasobi BIGINT;
    v_u_hekio BIGINT;
    v_u_listener1 BIGINT;

    -- Album IDs
    v_alb_noinay BIGINT;
    v_alb_99 BIGINT;
    v_alb_aicungphai BIGINT;
    v_alb_dailo BIGINT;
    v_alb_thebook BIGINT;

    -- Genre IDs
    v_g_pop BIGINT;
    v_g_ballad BIGINT;
    v_g_rap BIGINT;
    v_g_rnb BIGINT;
    v_g_indie BIGINT;

    -- Track IDs
    v_tr_1 BIGINT;
    v_tr_2 BIGINT;
    v_tr_3 BIGINT;
    v_tr_4 BIGINT;
    v_tr_5 BIGINT;
    v_tr_6 BIGINT;
    v_tr_7 BIGINT;
    v_tr_8 BIGINT;

    -- Staff ID
    v_staff_id BIGINT;
BEGIN
    -- Lấy ID Thể loại
    SELECT id INTO v_g_pop FROM genres WHERE slug = 'pop';
    SELECT id INTO v_g_ballad FROM genres WHERE slug = 'ballad';
    SELECT id INTO v_g_rap FROM genres WHERE slug = 'rap-hip-hop';
    SELECT id INTO v_g_rnb FROM genres WHERE slug = 'rnb';
    SELECT id INTO v_g_indie FROM genres WHERE slug = 'indie';

    -- Lấy Staff ID
    SELECT id INTO v_staff_id FROM staffs WHERE role_id = 2 LIMIT 1;
    IF v_staff_id IS NULL THEN
        SELECT id INTO v_staff_id FROM staffs LIMIT 1;
    END IF;

    -- ==================================================================================
    -- 1. TẠO TÀI KHOẢN NGHỆ SĨ & PROFILE
    -- ==================================================================================
    -- Sơn Tùng M-TP
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('sontungmtp@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_sontung;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_sontung, 'sontungmtp', 'Sơn Tùng M-TP', 'Ca sĩ, nhạc sĩ, nhà sản xuất âm nhạc V-Pop hàng đầu. Founder M-TP Entertainment.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- MCK
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('mck@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_mck;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_mck, 'mck99', 'MCK', 'Rapper, ca sĩ, nhạc sĩ thuộc tổ đội RPT. Chủ nhân album đình đám 99%.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- HIEUTHUHAI
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('hieuthuhai@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_hieu;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_hieu, 'hieuthuhai', 'HIEUTHUHAI', 'Rapper thành viên nhóm nhạc GERDNANG. Chủ nhân album Ai Cũng Phải Bắt Đầu Từ Đâu Đó.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- Uyên Linh
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('uyenlinh@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_uyenlinh;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_uyenlinh, 'uyenlinh', 'Uyên Linh', 'Nữ ca sĩ sở hữu giọng hát nội lực, truyền cảm với các bản hit Ballad da diết.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- Hngle
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('hngle@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_hngle;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_hngle, 'hngle', 'Hngle ft. Bảo Anh', 'Nghệ sĩ Indie R&B trẻ với màu sắc âm nhạc hiện đại, cảm xúc và bay bổng.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- Yorushika
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('yorushika@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_yorushika;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_yorushika, 'yorushika', 'Yorushika', 'Nhóm nhạc rock/indie Nhật Bản được thành lập vào năm 2017 bởi n-buna và suis.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- Yoko Takahashi
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('yoko@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_yoko;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_yoko, 'yokotakahashi', 'Yoko Takahashi', 'Ca sĩ nổi tiếng với các bài hát anime kinh điển, đặc biệt là Evangelion.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- YOASOBI
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('yoasobi@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_yoasobi;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_yoasobi, 'yoasobi', 'YOASOBI', 'Bộ đôi âm nhạc Nhật Bản gồm nhà sản xuất Ayase và ca sĩ kiêm nhạc sĩ Ikura.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- Hekio (Default User / Creator)
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('hekio@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_hekio;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_hekio, 'hekio', 'Hekio', 'Creator on SoundWave platform.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- Listener mẫu
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('listener@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_listener1;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_listener1, 'listener_vn', 'Lan Anh', 'Yêu âm nhạc, thích nghe podcast và indie mỗi tối.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO NOTHING;

    -- ==================================================================================
    -- 2. TẠO ALBUM MẪU
    -- ==================================================================================
    INSERT INTO albums (title, slug, description, cover_url, created_by_user_id, status, release_date, published_at, created_at, updated_at)
    VALUES ('Nơi Này Có Anh', 'noi-nay-co-anh-album', 'Single phát hành năm 2017 của Sơn Tùng M-TP', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', v_u_sontung, 'PUBLISHED', '2017-02-14', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_alb_noinay;

    INSERT INTO albums (title, slug, description, cover_url, created_by_user_id, status, release_date, published_at, created_at, updated_at)
    VALUES ('99%', '99-percent-mck', 'Album đầu tay đình đám của MCK', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', v_u_mck, 'PUBLISHED', '2023-03-02', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_alb_99;

    INSERT INTO albums (title, slug, description, cover_url, created_by_user_id, status, release_date, published_at, created_at, updated_at)
    VALUES ('Ai Cũng Phải Bắt Đầu Từ Đâu Đó', 'ai-cung-phai-bat-dau-tu-dau-do', 'Album phòng thu đầu tay của rapper HIEUTHUHAI', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', v_u_hieu, 'PUBLISHED', '2023-10-16', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_alb_aicungphai;

    INSERT INTO albums (title, slug, description, cover_url, created_by_user_id, status, release_date, published_at, created_at, updated_at)
    VALUES ('Đại Lộ Đông Tây', 'dai-lo-dong-tay-single', 'Bản ballad da diết của Uyên Linh', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', v_u_uyenlinh, 'PUBLISHED', '2021-05-20', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_alb_dailo;

    INSERT INTO albums (title, slug, description, cover_url, created_by_user_id, status, release_date, published_at, created_at, updated_at)
    VALUES ('THE BOOK', 'the-book-yoasobi', 'Album EP đầu tay của bộ đôi YOASOBI', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', v_u_yoasobi, 'PUBLISHED', '2021-01-06', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_alb_thebook;

    -- ==================================================================================
    -- 3. TẠO CÁC BÀI HÁT CHÍNH THỨC (TRACKS VỚI CLOUDINARY AUDIO & COVERS)
    -- ==================================================================================
    -- Track 1: Nơi Này Có Anh
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, lyrics, approved_at, created_at, updated_at)
    VALUES (v_u_sontung, v_g_pop, v_alb_noinay, 'Nơi Này Có Anh', 'noi-nay-co-anh', 'Bản tình ca Pop ngọt ngào, lãng mạn đình đám của Sơn Tùng M-TP.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565402/soundwave/tracks/audio/project-track-noi-nay-co-anh.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 278269, 892300, 'PUBLISHED', '[00:00.00]Em là ai từ đâu bước đến nơi đây dịu dàng chân phương\n[00:15.00]Cầm tay anh đi qua bao giông tố cuộc đời...\n[00:30.00]Cầm tay anh, dựa vai anh\n[00:45.00]Đừng buông tay anh nhé!', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_1;

    -- Track 2: Baby (MCK)
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, lyrics, approved_at, created_at, updated_at)
    VALUES (v_u_mck, v_g_rap, v_alb_99, 'Baby', 'baby-mck', 'Bản hit đầy cảm xúc từ album 99% của MCK.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565312/soundwave/tracks/audio/project-track-baby-mck.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', 173740, 285420, 'PUBLISHED', '[00:00.00]Baby em là một giấc mơ\n[00:12.00]Mà anh không thể nào chạm tới...\n[00:25.00]Khi màn đêm buông xuống nơi đây\n[00:38.00]Chỉ còn nỗi nhớ đong đầy.', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_2;

    -- Track 3: Exit Sign (HIEUTHUHAI)
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, lyrics, approved_at, created_at, updated_at)
    VALUES (v_u_hieu, v_g_rap, v_alb_aicungphai, 'Exit Sign', 'exit-sign-hieuthuhai', 'Ca khúc nổi bật trong album Ai Cũng Phải Bắt Đầu Từ Đâu Đó của HIEUTHUHAI kết hợp cùng marzuz và Kewtiie.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565333/soundwave/tracks/audio/project-track-exit-sign-hieuthuhai.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', 201718, 421890, 'PUBLISHED', '[00:00.00]Em tìm lối ra nơi bảng exit sign\n[00:14.00]Để lại con tim anh vỡ tan trong đêm dài...\n[00:28.00]Liệu có cơ hội nào cho đôi ta bắt đầu lại?', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_3;

    -- Track 4: Giữa Đại Lộ Đông Tây
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, lyrics, approved_at, created_at, updated_at)
    VALUES (v_u_uyenlinh, v_g_ballad, v_alb_dailo, 'Giữa Đại Lộ Đông Tây', 'giua-dai-lo-dong-tay', 'Ca khúc ballad da diết sáng tác bởi Hứa Kim Tuyền qua giọng hát nội lực của Uyên Linh.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565353/soundwave/tracks/audio/project-track-giua-dai-lo-dong-tay.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', 226691, 356700, 'PUBLISHED', '[00:00.00]Giữa đại lộ đông tây\n[00:16.00]Có ai nghe thấy nỗi cô đơn này...\n[00:32.00]Dòng xe vội vã lướt qua nhanh\n[00:48.00]Chỉ còn em đứng lặng thầm.', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_4;

    -- Track 5: Tìm Em (Hngle ft. Bảo Anh)
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, lyrics, approved_at, created_at, updated_at)
    VALUES (v_u_hngle, v_g_rnb, NULL, 'Tìm Em', 'tim-em-hngle-bao-anh', 'Giai điệu R&B nhẹ nhàng, lãng mạn qua sự kết hợp ăn ý giữa Hngle và Bảo Anh.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565382/soundwave/tracks/audio/project-track-tim-em-hngle-bao-anh.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', 272170, 198400, 'PUBLISHED', '[00:00.00]Từng ngày tìm kiếm bóng hình em\n[00:15.00]Dù biết yêu thương đã khuất xa ngoài tầm tay...\n[00:30.00]Một lời hứa gió thoảng bay đi.', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_5;

    -- Track 6: Haru (晴る) - Yorushika
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, lyrics, approved_at, created_at, updated_at)
    VALUES (v_u_yorushika, v_g_indie, NULL, 'Haru (晴る)', 'haru-yorushika', 'Ca khúc chủ đề mở đầu của anime Frieren: Beyond Journey''s End thực hiện bởi nhóm nhạc Yorushika.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565495/soundwave/tracks/audio/project-track-haru-yorushika.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp', 276715, 312500, 'PUBLISHED', '[00:00.00]貴方の目にいつか映る\n[00:15.00]晴れた日の空のように...\n[00:30.00]風が吹き抜けるこの丘で\n[00:45.00]歩き続ける物語。', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_6;

    -- Track 7: A Cruel Angel's Thesis - Yoko Takahashi
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, lyrics, approved_at, created_at, updated_at)
    VALUES (v_u_yoko, v_g_pop, NULL, 'A Cruel Angel''s Thesis (残酷な天使のテーゼ)', 'a-cruel-angels-thesis', 'Bài hát chủ đề huyền thoại của anime Neon Genesis Evangelion trình bày bởi Yoko Takahashi.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565521/soundwave/tracks/audio/project-track-a-cruel-angels-thesis.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', 243905, 523100, 'PUBLISHED', '[00:00.00]残酷な天使のように\n[00:10.00]少年よ 神話になれ...\n[00:25.00]蒼い風がいま 胸のドアを叩いても\n[00:40.00]私だけをただ見つめて\n[00:55.00]微笑んでるあなた。', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_7;

    -- Track 8: Yoru ni Kakeru (夜に駆ける) - YOASOBI
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, lyrics, approved_at, created_at, updated_at)
    VALUES (v_u_yoasobi, v_g_pop, v_alb_thebook, 'Yoru ni Kakeru (夜に駆ける)', 'yoru-ni-kakeru', 'Bản hit đột phá toàn cầu của bộ đôi YOASOBI dựa trên tiểu thuyết Tanatosu no Yūwaku.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565419/soundwave/tracks/audio/project-track-yoru-ni-kakeru.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', 275043, 689400, 'PUBLISHED', '[00:00.00]沈むように溶けてゆくように\n[00:12.00]二人だけの空が広がる夜に...\n[00:25.00]「さよなら」だけだった\n[00:38.00]その一言で全てが分かった。', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_8;

    -- ==================================================================================
    -- 4. BỔ SUNG TRACK SUBMISSIONS (DÀNH CHO QUẢN LÝ KIỂM DUYỆT)
    -- ==================================================================================
    INSERT INTO track_submissions (track_id, submitted_by_user_id, reviewer_user_id, status, submitted_at, reviewed_at)
    SELECT id, uploader_user_id, v_staff_id, 'APPROVED', created_at, approved_at
    FROM tracks
    WHERE publication_status = 'PUBLISHED'
    ON CONFLICT DO NOTHING;

    -- ==================================================================================
    -- 5. ĐỒNG BỘ OFFICIAL LYRICS
    -- ==================================================================================
    INSERT INTO official_lyrics (track_id, lyric_content, status, created_by_user_id, created_at, updated_at)
    SELECT id, lyrics, 'PUBLISHED', v_staff_id, created_at, updated_at
    FROM tracks
    WHERE lyrics IS NOT NULL AND TRIM(lyrics) != ''
    ON CONFLICT (track_id) DO UPDATE SET lyric_content = EXCLUDED.lyric_content, status = 'PUBLISHED';

    -- Đồng bộ sang bảng personal_lyrics (Custom Lyric) cho tác giả và test listener
    INSERT INTO personal_lyrics (user_id, track_id, lyric_type, lyric_content, created_at, updated_at)
    SELECT uploader_user_id, id, 'CUSTOM', lyrics, created_at, updated_at
    FROM tracks
    WHERE lyrics IS NOT NULL AND TRIM(lyrics) != ''
    ON CONFLICT (user_id, track_id, lyric_type) DO UPDATE SET lyric_content = EXCLUDED.lyric_content;

    INSERT INTO personal_lyrics (user_id, track_id, lyric_type, lyric_content, created_at, updated_at)
    SELECT v_u_listener1, id, 'CUSTOM', lyrics, created_at, updated_at
    FROM tracks
    WHERE id IN (v_tr_1, v_tr_2) AND lyrics IS NOT NULL AND TRIM(lyrics) != ''
    ON CONFLICT (user_id, track_id, lyric_type) DO UPDATE SET lyric_content = EXCLUDED.lyric_content;

    -- ==================================================================================
    -- 6. TẠO PLAYLIST MẪU
    -- ==================================================================================
    INSERT INTO playlists (title, name, slug, description, cover_url, owner_user_id, created_by_user_id, is_private, visibility, created_at, updated_at)
    VALUES ('V-Pop Tuyển Chọn', 'V-Pop Tuyển Chọn', 'v-pop-tuyen-chon', 'Tuyển tập các bản hit V-Pop đỉnh cao', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', v_u_listener1, v_u_listener1, false, 'PUBLIC', v_now, v_now)
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO playlists (title, name, slug, description, cover_url, owner_user_id, created_by_user_id, is_private, visibility, created_at, updated_at)
    VALUES ('J-Pop / Anime Hits', 'J-Pop / Anime Hits', 'j-pop-anime-hits', 'Những bản nhạc Anime bất hủ', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', v_u_listener1, v_u_listener1, false, 'PUBLIC', v_now, v_now)
    ON CONFLICT (slug) DO NOTHING;

    -- Đồng bộ sequence cho các bảng
    PERFORM setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
    PERFORM setval(pg_get_serial_sequence('albums', 'id'), COALESCE(MAX(id), 1)) FROM albums;
    PERFORM setval(pg_get_serial_sequence('tracks', 'id'), COALESCE(MAX(id), 1)) FROM tracks;
    PERFORM setval(pg_get_serial_sequence('official_lyrics', 'id'), COALESCE(MAX(id), 1)) FROM official_lyrics;
    PERFORM setval(pg_get_serial_sequence('personal_lyrics', 'id'), COALESCE(MAX(id), 1)) FROM personal_lyrics;

END $$;

COMMIT;
