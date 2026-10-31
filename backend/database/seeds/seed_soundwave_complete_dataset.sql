-- ======================================================================================
-- SoundWave Complete Master Dataset Seed Script
-- File: seed_soundwave_complete_dataset.sql
-- Compatible with PostgreSQL 16/17/18 (Neon Cloud & Local PostgreSQL)
-- Architecture: Dual-tier Lyrics (official_lyrics table, no lyrics column in tracks)
-- ======================================================================================

BEGIN;

SET search_path TO public;

-- 1. SEED STAFF ROLES
INSERT INTO staff_roles (code, name, description, created_at)
VALUES 
    ('ADMIN', 'Administrator', 'Quản trị viên toàn quyền hệ thống SoundWave', timezone('UTC', CURRENT_TIMESTAMP(3))),
    ('STAFF', 'Staff', 'Nhân viên vận hành và kiểm duyệt nội dung SoundWave', timezone('UTC', CURRENT_TIMESTAMP(3)))
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. SEED STAFF ACCOUNTS
-- Password hash for 'Admin@123456' / 'Staff@123456' / 'Test@123456'
-- $2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM. (valid BCrypt)
DO $$
DECLARE
    v_admin_role_id SMALLINT;
    v_staff_role_id SMALLINT;
    v_now TIMESTAMP := timezone('UTC', CURRENT_TIMESTAMP(3));
    v_pwd VARCHAR(255) := '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.';
BEGIN
    SELECT id INTO v_admin_role_id FROM staff_roles WHERE code = 'ADMIN';
    SELECT id INTO v_staff_role_id FROM staff_roles WHERE code = 'STAFF';

    INSERT INTO staffs (role_id, email, password_hash, full_name, avatar_url, status, created_at, updated_at)
    VALUES 
        (v_admin_role_id, 'admin@soundwave.com', v_pwd, 'System Administrator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'ACTIVE', v_now, v_now),
        (v_staff_role_id, 'staff@soundwave.com', v_pwd, 'Content Moderator', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'ACTIVE', v_now, v_now)
    ON CONFLICT (email) DO UPDATE 
    SET full_name = EXCLUDED.full_name, updated_at = v_now;
END $$;

-- 3. SEED GENRES
INSERT INTO genres (name, slug, description, is_active, created_at, updated_at)
VALUES 
    ('Pop', 'pop', 'Giai điệu bắt tai, phổ biến rộng rãi.', true, timezone('UTC', CURRENT_TIMESTAMP(3)), timezone('UTC', CURRENT_TIMESTAMP(3))),
    ('Ballad', 'ballad', 'Những bản tình ca nhẹ nhàng, sâu lắng.', true, timezone('UTC', CURRENT_TIMESTAMP(3)), timezone('UTC', CURRENT_TIMESTAMP(3))),
    ('Rap / Hip-Hop', 'rap-hip-hop', 'Nhịp điệu sôi động, ca từ cá tính.', true, timezone('UTC', CURRENT_TIMESTAMP(3)), timezone('UTC', CURRENT_TIMESTAMP(3))),
    ('R&B', 'rnb', 'Rhythm and Blues mượt mà, cảm xúc.', true, timezone('UTC', CURRENT_TIMESTAMP(3)), timezone('UTC', CURRENT_TIMESTAMP(3))),
    ('Indie', 'indie', 'Âm nhạc độc lập tự do sáng tạo.', true, timezone('UTC', CURRENT_TIMESTAMP(3)), timezone('UTC', CURRENT_TIMESTAMP(3))),
    ('Acoustic', 'acoustic', 'Âm hưởng mộc mạc của nhạc cụ tự nhiên.', true, timezone('UTC', CURRENT_TIMESTAMP(3)), timezone('UTC', CURRENT_TIMESTAMP(3))),
    ('EDM', 'edm', 'Nhạc điện tử sôi động cho lễ hội và bữa tiệc.', true, timezone('UTC', CURRENT_TIMESTAMP(3)), timezone('UTC', CURRENT_TIMESTAMP(3))),
    ('Lo-fi', 'lo-fi', 'Giai điệu êm dịu, thư giãn tập trung.', true, timezone('UTC', CURRENT_TIMESTAMP(3)), timezone('UTC', CURRENT_TIMESTAMP(3)))
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 4. SEED ARTISTS, USERS, ALBUMS, TRACKS, OFFICIAL LYRICS, PLAYLISTS
DO $$
DECLARE
    v_pwd VARCHAR(255) := '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.'; -- Test@123456
    v_now TIMESTAMP := timezone('UTC', CURRENT_TIMESTAMP(3));
    
    -- Staff ID
    v_staff_id BIGINT;

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

    -- Playlist IDs
    v_pl_vpop BIGINT;
    v_pl_jpop BIGINT;
BEGIN
    -- Lấy Staff ID làm người duyệt & tạo official lyrics
    SELECT id INTO v_staff_id FROM staffs WHERE role_id = (SELECT id FROM staff_roles WHERE code = 'STAFF') LIMIT 1;
    IF v_staff_id IS NULL THEN
        SELECT id INTO v_staff_id FROM staffs LIMIT 1;
    END IF;

    -- Lấy Genre IDs
    SELECT id INTO v_g_pop FROM genres WHERE slug = 'pop';
    SELECT id INTO v_g_ballad FROM genres WHERE slug = 'ballad';
    SELECT id INTO v_g_rap FROM genres WHERE slug = 'rap-hip-hop';
    SELECT id INTO v_g_rnb FROM genres WHERE slug = 'rnb';
    SELECT id INTO v_g_indie FROM genres WHERE slug = 'indie';

    -- ==================================================================================
    -- 4.1. NGHỆ SĨ & NGƯỜI DÙNG (USERS & USER_PROFILES)
    -- ==================================================================================
    -- Sơn Tùng M-TP
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('sontungmtp@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_sontung;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_sontung, 'sontungmtp', 'Sơn Tùng M-TP', 'Ca sĩ, nhạc sĩ, nhà sản xuất âm nhạc V-Pop hàng đầu. Founder M-TP Entertainment.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- MCK
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('mck@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_mck;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_mck, 'mck99', 'MCK', 'Rapper, ca sĩ, nhạc sĩ thuộc tổ đội RPT. Chủ nhân album đình đám 99%.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- HIEUTHUHAI
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('hieuthuhai@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_hieu;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_hieu, 'hieuthuhai', 'HIEUTHUHAI', 'Rapper thành viên nhóm nhạc GERDNANG. Chủ nhân album Ai Cũng Phải Bắt Đầu Từ Đâu Đó.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- Uyên Linh
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('uyenlinh@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_uyenlinh;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_uyenlinh, 'uyenlinh', 'Uyên Linh', 'Nữ ca sĩ sở hữu giọng hát nội lực, truyền cảm với các bản hit Ballad da diết.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- Hngle
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('hngle@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_hngle;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_hngle, 'hngle', 'Hngle ft. Bảo Anh', 'Nghệ sĩ Indie R&B trẻ với màu sắc âm nhạc hiện đại, cảm xúc và bay bổng.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- Yorushika
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('yorushika@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_yorushika;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_yorushika, 'yorushika', 'Yorushika', 'Nhóm nhạc rock/indie Nhật Bản được thành lập vào năm 2017 bởi n-buna và suis.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- Yoko Takahashi
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('yoko@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_yoko;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_yoko, 'yokotakahashi', 'Yoko Takahashi', 'Ca sĩ nổi tiếng với các bài hát anime kinh điển, đặc biệt là Evangelion.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- YOASOBI
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('yoasobi@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_yoasobi;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_yoasobi, 'yoasobi', 'YOASOBI', 'Bộ đôi âm nhạc Nhật Bản gồm nhà sản xuất Ayase và ca sĩ kiêm nhạc sĩ Ikura.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- Hekio
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('hekio@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_hekio;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_hekio, 'hekio', 'Hekio', 'Creator on SoundWave platform.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- Lan Anh (Listener)
    INSERT INTO users (email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES ('listener@soundwave.io', v_pwd, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now RETURNING id INTO v_u_listener1;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_u_listener1, 'listener_vn', 'Lan Anh', 'Yêu âm nhạc, thích nghe podcast và indie mỗi tối.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, avatar_url = EXCLUDED.avatar_url;

    -- ==================================================================================
    -- 4.2. ALBUMS
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
    -- 4.3. BÀI HÁT (TRACKS VỚI CLOUDINARY AUDIO & COVERS, KHÔNG CÓ CỘT LYRICS)
    -- ==================================================================================
    -- Track 1: Nơi Này Có Anh
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, approved_at, created_at, updated_at)
    VALUES (v_u_sontung, v_g_pop, v_alb_noinay, 'Nơi Này Có Anh', 'noi-nay-co-anh', 'Bản tình ca Pop ngọt ngào, lãng mạn đình đám của Sơn Tùng M-TP.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565402/soundwave/tracks/audio/project-track-noi-nay-co-anh.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 278269, 892300, 'PUBLISHED', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_1;

    -- Track 2: Baby (MCK)
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, approved_at, created_at, updated_at)
    VALUES (v_u_mck, v_g_rap, v_alb_99, 'Baby', 'baby-mck', 'Bản hit đầy cảm xúc từ album 99% của MCK.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565312/soundwave/tracks/audio/project-track-baby-mck.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', 173740, 285420, 'PUBLISHED', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_2;

    -- Track 3: Exit Sign (HIEUTHUHAI)
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, approved_at, created_at, updated_at)
    VALUES (v_u_hieu, v_g_rap, v_alb_aicungphai, 'Exit Sign', 'exit-sign-hieuthuhai', 'Ca khúc nổi bật trong album Ai Cũng Phải Bắt Đầu Từ Đâu Đó của HIEUTHUHAI kết hợp cùng marzuz và Kewtiie.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565333/soundwave/tracks/audio/project-track-exit-sign-hieuthuhai.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', 201718, 421890, 'PUBLISHED', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_3;

    -- Track 4: Giữa Đại Lộ Đông Tây (Uyên Linh)
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, approved_at, created_at, updated_at)
    VALUES (v_u_uyenlinh, v_g_ballad, v_alb_dailo, 'Giữa Đại Lộ Đông Tây', 'giua-dai-lo-dong-tay', 'Ca khúc ballad da diết sáng tác bởi Hứa Kim Tuyền qua giọng hát nội lực của Uyên Linh.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565353/soundwave/tracks/audio/project-track-giua-dai-lo-dong-tay.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', 226691, 356700, 'PUBLISHED', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_4;

    -- Track 5: Tìm Em (Hngle ft. Bảo Anh)
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, approved_at, created_at, updated_at)
    VALUES (v_u_hngle, v_g_rnb, NULL, 'Tìm Em', 'tim-em-hngle-bao-anh', 'Giai điệu R&B nhẹ nhàng, lãng mạn qua sự kết hợp ăn ý giữa Hngle và Bảo Anh.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565382/soundwave/tracks/audio/project-track-tim-em-hngle-bao-anh.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', 272170, 198400, 'PUBLISHED', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_5;

    -- Track 6: Haru (晴る) - Yorushika
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, approved_at, created_at, updated_at)
    VALUES (v_u_yorushika, v_g_indie, NULL, 'Haru (晴る)', 'haru-yorushika', 'Ca khúc chủ đề mở đầu của anime Frieren: Beyond Journey''s End thực hiện bởi nhóm nhạc Yorushika.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565495/soundwave/tracks/audio/project-track-haru-yorushika.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp', 276715, 312500, 'PUBLISHED', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_6;

    -- Track 7: A Cruel Angel's Thesis - Yoko Takahashi
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, approved_at, created_at, updated_at)
    VALUES (v_u_yoko, v_g_pop, NULL, 'A Cruel Angel''s Thesis (残酷な天使のテーゼ)', 'a-cruel-angels-thesis', 'Bài hát chủ đề huyền thoại của anime Neon Genesis Evangelion trình bày bởi Yoko Takahashi.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565521/soundwave/tracks/audio/project-track-a-cruel-angels-thesis.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', 243905, 523100, 'PUBLISHED', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_7;

    -- Track 8: Yoru ni Kakeru (夜に駆ける) - YOASOBI
    INSERT INTO tracks (uploader_user_id, genre_id, album_id, title, slug, description, audio_format, audio_url, cover_url, duration_ms, play_count_cache, publication_status, approved_at, created_at, updated_at)
    VALUES (v_u_yoasobi, v_g_pop, v_alb_thebook, 'Yoru ni Kakeru (夜に駆ける)', 'yoru-ni-kakeru', 'Bản hit đột phá toàn cầu của bộ đôi YOASOBI dựa trên tiểu thuyết Tanatosu no Yūwaku.', 'mp3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565419/soundwave/tracks/audio/project-track-yoru-ni-kakeru.mp3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', 275043, 689400, 'PUBLISHED', v_now, v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_tr_8;

    -- ==================================================================================
    -- 4.4. TRACK SUBMISSIONS (APPROVED)
    -- ==================================================================================
    INSERT INTO track_submissions (track_id, submitted_by_user_id, reviewer_user_id, status, submitted_at, reviewed_at)
    VALUES
        (v_tr_1, v_u_sontung, v_staff_id, 'APPROVED', v_now, v_now),
        (v_tr_2, v_u_mck, v_staff_id, 'APPROVED', v_now, v_now),
        (v_tr_3, v_u_hieu, v_staff_id, 'APPROVED', v_now, v_now),
        (v_tr_4, v_u_uyenlinh, v_staff_id, 'APPROVED', v_now, v_now),
        (v_tr_5, v_u_hngle, v_staff_id, 'APPROVED', v_now, v_now),
        (v_tr_6, v_u_yorushika, v_staff_id, 'APPROVED', v_now, v_now),
        (v_tr_7, v_u_yoko, v_staff_id, 'APPROVED', v_now, v_now),
        (v_tr_8, v_u_yoasobi, v_staff_id, 'APPROVED', v_now, v_now)
    ON CONFLICT DO NOTHING;

    -- ==================================================================================
    -- 4.5. OFFICIAL LYRICS (BẢNG RIÊNG OFFICIAL_LYRICS)
    -- ==================================================================================
    INSERT INTO official_lyrics (track_id, lyric_content, status, created_by_user_id, created_at, updated_at)
    VALUES 
        (v_tr_1, '[00:00.00]Em là ai từ đâu bước đến nơi đây dịu dàng chân phương
[00:15.00]Cầm tay anh đi qua bao giông tố cuộc đời...
[00:30.00]Cầm tay anh, dựa vai anh
[00:45.00]Đừng buông tay anh nhé!', 'PUBLISHED', v_staff_id, v_now, v_now),

        (v_tr_2, '[00:00.00]Baby em là một giấc mơ
[00:12.00]Mà anh không thể nào chạm tới...
[00:25.00]Khi màn đêm buông xuống nơi đây
[00:38.00]Chỉ còn nỗi nhớ đong đầy.', 'PUBLISHED', v_staff_id, v_now, v_now),

        (v_tr_3, '[00:00.00]Em tìm lối ra nơi bảng exit sign
[00:14.00]Để lại con tim anh vỡ tan trong đêm dài...
[00:28.00]Liệu có cơ hội nào cho đôi ta bắt đầu lại?', 'PUBLISHED', v_staff_id, v_now, v_now),

        (v_tr_4, '[00:00.00]Giữa đại lộ đông tây
[00:16.00]Có ai nghe thấy nỗi cô đơn này...
[00:32.00]Dòng xe vội vã lướt qua nhanh
[00:48.00]Chỉ còn em đứng lặng thầm.', 'PUBLISHED', v_staff_id, v_now, v_now),

        (v_tr_5, '[00:00.00]Từng ngày tìm kiếm bóng hình em
[00:15.00]Dù biết yêu thương đã khuất xa ngoài tầm tay...
[00:30.00]Một lời hứa gió thoảng bay đi.', 'PUBLISHED', v_staff_id, v_now, v_now),

        (v_tr_6, '[00:00.00]貴方の目にいつか映る
[00:15.00]晴れた日の空のように...
[00:30.00]風が吹き抜けるこの丘で
[00:45.00]歩き続ける物語。', 'PUBLISHED', v_staff_id, v_now, v_now),

        (v_tr_7, '[00:00.00]残酷な天使のように
[00:10.00]少年よ 神話になれ...
[00:25.00]蒼い風がいま 胸のドアを叩いても
[00:40.00]私だけをただ見つめて
[00:55.00]微笑んでるあなた。', 'PUBLISHED', v_staff_id, v_now, v_now),

        (v_tr_8, '[00:00.00]沈むように溶けてゆくように
[00:12.00]二人だけの空が広がる夜に...
[00:25.00]「さよなら」だけだった
[00:38.00]その一言で全てが分かった。', 'PUBLISHED', v_staff_id, v_now, v_now)
    ON CONFLICT (track_id) DO UPDATE 
    SET lyric_content = EXCLUDED.lyric_content, status = 'PUBLISHED', updated_at = v_now;

    -- ==================================================================================
    -- 4.6. PLAYLISTS & PLAYLIST TRACKS
    -- ==================================================================================
    INSERT INTO playlists (title, name, slug, description, cover_url, owner_user_id, created_by_user_id, is_private, visibility, created_at, updated_at)
    VALUES ('V-Pop Tuyển Chọn', 'V-Pop Tuyển Chọn', 'v-pop-tuyen-chon', 'Tuyển tập các bản hit V-Pop đỉnh cao', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', v_u_listener1, v_u_listener1, false, 'PUBLIC', v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_pl_vpop;

    INSERT INTO playlists (title, name, slug, description, cover_url, owner_user_id, created_by_user_id, is_private, visibility, created_at, updated_at)
    VALUES ('J-Pop / Anime Hits', 'J-Pop / Anime Hits', 'j-pop-anime-hits', 'Những bản nhạc Anime bất hủ', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', v_u_listener1, v_u_listener1, false, 'PUBLIC', v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now RETURNING id INTO v_pl_jpop;

    -- Playlist tracks
    INSERT INTO playlist_tracks (playlist_id, track_id, position, added_by_user_id, added_at)
    VALUES 
        (v_pl_vpop, v_tr_1, 1, v_u_listener1, v_now),
        (v_pl_vpop, v_tr_2, 2, v_u_listener1, v_now),
        (v_pl_vpop, v_tr_3, 3, v_u_listener1, v_now),
        (v_pl_vpop, v_tr_4, 4, v_u_listener1, v_now),
        (v_pl_vpop, v_tr_5, 5, v_u_listener1, v_now),
        (v_pl_jpop, v_tr_6, 1, v_u_listener1, v_now),
        (v_pl_jpop, v_tr_7, 2, v_u_listener1, v_now),
        (v_pl_jpop, v_tr_8, 3, v_u_listener1, v_now)
    ON CONFLICT (playlist_id, track_id) DO NOTHING;

    -- ==================================================================================
    -- 4.7. RESET SEQUENCES
    -- ==================================================================================
    PERFORM setval(pg_get_serial_sequence('staff_roles', 'id'), COALESCE(MAX(id), 1)) FROM staff_roles;
    PERFORM setval(pg_get_serial_sequence('staffs', 'id'), COALESCE(MAX(id), 1)) FROM staffs;
    PERFORM setval(pg_get_serial_sequence('genres', 'id'), COALESCE(MAX(id), 1)) FROM genres;
    PERFORM setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
    PERFORM setval(pg_get_serial_sequence('albums', 'id'), COALESCE(MAX(id), 1)) FROM albums;
    PERFORM setval(pg_get_serial_sequence('tracks', 'id'), COALESCE(MAX(id), 1)) FROM tracks;
    PERFORM setval(pg_get_serial_sequence('track_submissions', 'id'), COALESCE(MAX(id), 1)) FROM track_submissions;
    PERFORM setval(pg_get_serial_sequence('official_lyrics', 'id'), COALESCE(MAX(id), 1)) FROM official_lyrics;
    PERFORM setval(pg_get_serial_sequence('playlists', 'id'), COALESCE(MAX(id), 1)) FROM playlists;
    PERFORM setval(pg_get_serial_sequence('playlist_tracks', 'id'), COALESCE(MAX(id), 1)) FROM playlist_tracks;

END $$;

COMMIT;
