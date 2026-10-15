-- ======================================================================================
-- SoundWave Seeding Script: 20261013_seed_users_and_interactions_by_tracks.sql
-- Mục đích: Khởi tạo dữ liệu người dùng (Nghệ sĩ chính chủ & Người nghe tương tác)
-- dựa trên các bài hát hiện có trong hệ thống SoundWave.
-- Môi trường áp dụng: Development & Testing
-- Mật khẩu đăng nhập mặc định cho toàn bộ tài khoản mới: Test@123456
-- ======================================================================================

BEGIN;

-- 1. Đảm bảo Role LISTENER tồn tại
INSERT INTO roles (code, name, description, created_at)
VALUES ('LISTENER', 'Listener', 'Standard user for streaming and managing personal library.', timezone('UTC', CURRENT_TIMESTAMP(3)))
ON CONFLICT (code) DO NOTHING;

DO $$
DECLARE
    v_listener_role_id SMALLINT;
    v_password_hash VARCHAR(255) := '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.'; -- Test@123456
    v_now TIMESTAMP := timezone('UTC', CURRENT_TIMESTAMP(3));
    
    -- Biến ID cho các nghệ sĩ
    v_id_sontung BIGINT;
    v_id_hieu BIGINT;
    v_id_mck BIGINT;
    v_id_uyenlinh BIGINT;
    v_id_hngle BIGINT;
    v_id_yoasobi BIGINT;
    v_id_yorushika BIGINT;
    v_id_yoko BIGINT;
    v_id_yamazaki BIGINT;
    v_id_lowg BIGINT;
    v_id_minhan BIGINT;

    -- Biến ID cho người nghe
    v_id_lananh BIGINT;
    v_id_quanghuy BIGINT;
    v_id_yuki BIGINT;
    v_id_minhduc BIGINT;
    v_id_baotram BIGINT;

    -- Biến ID Playlist
    v_pl_vpop BIGINT;
    v_pl_rap BIGINT;
    v_pl_anime BIGINT;
    v_pl_chill BIGINT;
    v_pl_trends BIGINT;
    
    -- Biến Track ID
    v_tr_noi_nay BIGINT;
    v_tr_exit_sign BIGINT;
    v_tr_baby BIGINT;
    v_tr_giua_dai_lo BIGINT;
    v_tr_tim_em BIGINT;
    v_tr_haru BIGINT;
    v_tr_evangelion BIGINT;
    v_tr_yoru BIGINT;
    v_tr_laviem BIGINT;
    v_tr_onemore BIGINT;
    v_tr_som_mai BIGINT;
    v_tr_giai_dieu_15s BIGINT;

BEGIN
    SELECT id INTO v_listener_role_id FROM roles WHERE code = 'LISTENER';

    -- ==================================================================================
    -- A. TẠO CÁC TÀI KHOẢN NGHỆ SĨ CHÍNH CHỦ (CREATORS)
    -- ==================================================================================

    -- 1. Sơn Tùng M-TP
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'sontungmtp@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_sontung;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_sontung, 'sontungmtp', 'Sơn Tùng M-TP', 'Ca sĩ, nhạc sĩ, nhà sản xuất âm nhạc V-Pop hàng đầu. Founder M-TP Entertainment.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 2. HIEUTHUHAI
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'hieuthuhai@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_hieu;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_hieu, 'hieuthuhai', 'HIEUTHUHAI', 'Rapper thành viên nhóm nhạc GERDNANG. Chủ nhân album thành công "Ai Cũng Phải Bắt Đầu Từ Đâu Đó".', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565335/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 3. MCK
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'mck@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_mck;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_mck, 'mck99', 'MCK', 'Rapper, ca sĩ, nhạc sĩ thuộc tổ đội RPT. Chủ nhân album đình đám "99%".', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565314/soundwave/tracks/covers/project-cover-baby-mck.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 4. Uyên Linh
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'uyenlinh@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_uyenlinh;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_uyenlinh, 'uyenlinh', 'Uyên Linh', 'Nữ ca sĩ sở hữu giọng hát nội lực, truyền cảm với các bản hit Ballad da diết.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565356/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 5. Hngle
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'hngle@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_hngle;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_hngle, 'hngle', 'Hngle', 'Nghệ sĩ Indie R&B trẻ với màu sắc âm nhạc hiện đại, cảm xúc và bay bổng.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565384/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 6. YOASOBI
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'yoasobi@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_yoasobi;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_yoasobi, 'yoasobi', 'YOASOBI', 'Japanese music superduo composed of producer Ayase and vocalist ikura, turning novels into music.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565560/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 7. Yorushika
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'yorushika@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_yorushika;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_yorushika, 'yorushika', 'Yorushika', 'Japanese rock duo consisting of producer n-buna and vocalist suis. Creators of nostalgic melodic themes.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565498/soundwave/tracks/covers/project-cover-haru-yorushika.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 8. Yoko Takahashi
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'yokotakahashi@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_yoko;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_yoko, 'yokotakahashi', 'Yoko Takahashi', 'Legendary Japanese singer acclaimed for performing the theme songs of Neon Genesis Evangelion.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565523/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 9. Masayoshi Yamazaki
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'yamazaki@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_yamazaki;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_yamazaki, 'yamazaki', 'Masayoshi Yamazaki', 'Japanese singer-songwriter and composer, famous for One more time, One more chance (5cm/s OST).', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791772519/soundwave/tracks/covers/user-3-cover-bac3273e-f60b-4aab-a53f-ebb9462eafd6.jpg', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 10. Low G
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'lowg@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_lowg;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_lowg, 'lowg', 'Low G', 'Rapper Hà Nội với flow độc bản và màu sắc âm nhạc biến hóa, thành viên Rap Nhà Làm.', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791631091/soundwave/tracks/covers/user-8-cover-dbabcd61-6fbe-45af-b1ea-9e45588da125.png', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- 11. Minh An Acoustic
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'minhan.creator@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_minhan;

    INSERT INTO user_profiles (user_id, username, display_name, bio, avatar_url, country_code, created_at, updated_at)
    VALUES (v_id_minhan, 'minhan_acoustic', 'Minh An Acoustic', 'Không gian âm nhạc mộc mạc nhẹ nhàng, giai điệu chữa lành tâm hồn của SoundWave.', 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, avatar_url = EXCLUDED.avatar_url;

    -- ==================================================================================
    -- B. CẬP NHẬT UPLOADER CỦA CÁC BÀI HÁT VỀ ĐÚNG NGHỆ SĨ
    -- ==================================================================================

    UPDATE tracks SET uploader_user_id = v_id_sontung WHERE slug = 'noi-nay-co-anh';
    UPDATE tracks SET uploader_user_id = v_id_hieu, album_id = NULL WHERE slug = 'exit-sign-hieuthuhai';
    UPDATE tracks SET uploader_user_id = v_id_mck, album_id = NULL WHERE slug = 'baby-mck';
    UPDATE tracks SET uploader_user_id = v_id_uyenlinh WHERE slug = 'giua-dai-lo-dong-tay';
    UPDATE tracks SET uploader_user_id = v_id_hngle WHERE slug = 'tim-em-hngle-bao-anh';
    UPDATE tracks SET uploader_user_id = v_id_yoasobi WHERE slug = 'yoru-ni-kakeru';
    UPDATE tracks SET uploader_user_id = v_id_yorushika WHERE slug = 'haru-yorushika';
    UPDATE tracks SET uploader_user_id = v_id_yoko WHERE slug = 'a-cruel-angels-thesis';
    UPDATE tracks SET uploader_user_id = v_id_yamazaki WHERE slug LIKE 'one-more-time-one-more-chance%';
    UPDATE tracks SET uploader_user_id = v_id_lowg WHERE slug LIKE 'laviem%';
    UPDATE tracks SET uploader_user_id = v_id_minhan WHERE slug IN ('seed-som-mai-diu-dang', 'seed-giai-dieu-ngan-15s', 'seed-draft-song');

    -- ==================================================================================
    -- C. TẠO TÀI KHOẢN NGƯỜI NGHE MẪU (LISTENERS)
    -- ==================================================================================

    -- 1. Lan Anh (V-Pop Fan)
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'lananh.listener@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_lananh;

    INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
    VALUES (v_id_lananh, 'lananh_vpop', 'Lan Anh', 'Yêu thích các giai điệu V-Pop ngọt ngào và các bản hit của Sơn Tùng M-TP, Uyên Linh.', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio;

    -- 2. Quang Huy (Hip-hop Head)
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'quanghuy.rap@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_quanghuy;

    INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
    VALUES (v_id_quanghuy, 'quanghuy_hiphop', 'Quang Huy', 'Rap Việt, flow bắt tai và âm nhạc giàu năng lượng bùng nổ.', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio;

    -- 3. Yuki Tanaka (Anime & J-Pop Lover)
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'yuki.anime@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_yuki;

    INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
    VALUES (v_id_yuki, 'yuki_jpop', 'Yuki Tanaka', 'Anime soundtracks & J-Pop enthusiast. YOASOBI and Yorushika repeat all day.', 'JP', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio;

    -- 4. Minh Đức (Chill & Acoustic)
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'minhduc.chill@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_minhduc;

    INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
    VALUES (v_id_minhduc, 'minhduc_chill', 'Minh Đức', 'Cần chút giai điệu bình yên và sâu lắng sau một ngày dài làm việc.', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio;

    -- 5. Bảo Trâm (Music Explorer)
    INSERT INTO app_users (role_id, email, password_hash, status, email_verified_at, created_at, updated_at)
    VALUES (v_listener_role_id, 'baotram.music@soundwave.io', v_password_hash, 'ACTIVE', v_now, v_now, v_now)
    ON CONFLICT (email) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_id_baotram;

    INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
    VALUES (v_id_baotram, 'baotram_explorer', 'Bảo Trâm', 'Khám phá bài hát mới mỗi ngày trên SoundWave. Âm nhạc là nguồn cảm hứng bất tận.', 'VN', v_now, v_now)
    ON CONFLICT (user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio;

    -- ==================================================================================
    -- D. LẤY TRACK ID THỰC TẾ TRONG HỆ THỐNG
    -- ==================================================================================

    SELECT id INTO v_tr_noi_nay FROM tracks WHERE slug = 'noi-nay-co-anh' LIMIT 1;
    SELECT id INTO v_tr_exit_sign FROM tracks WHERE slug = 'exit-sign-hieuthuhai' LIMIT 1;
    SELECT id INTO v_tr_baby FROM tracks WHERE slug = 'baby-mck' LIMIT 1;
    SELECT id INTO v_tr_giua_dai_lo FROM tracks WHERE slug = 'giua-dai-lo-dong-tay' LIMIT 1;
    SELECT id INTO v_tr_tim_em FROM tracks WHERE slug = 'tim-em-hngle-bao-anh' LIMIT 1;
    SELECT id INTO v_tr_haru FROM tracks WHERE slug = 'haru-yorushika' LIMIT 1;
    SELECT id INTO v_tr_evangelion FROM tracks WHERE slug = 'a-cruel-angels-thesis' LIMIT 1;
    SELECT id INTO v_tr_yoru FROM tracks WHERE slug = 'yoru-ni-kakeru' LIMIT 1;
    SELECT id INTO v_tr_laviem FROM tracks WHERE slug = 'laviem-1791631091415' LIMIT 1;
    SELECT id INTO v_tr_onemore FROM tracks WHERE slug = 'one-more-time-one-more-chance-1791896096019' LIMIT 1;
    SELECT id INTO v_tr_som_mai FROM tracks WHERE slug = 'seed-som-mai-diu-dang' LIMIT 1;
    SELECT id INTO v_tr_giai_dieu_15s FROM tracks WHERE slug = 'seed-giai-dieu-ngan-15s' LIMIT 1;

    -- ==================================================================================
    -- E. TẠO CÁC PLAYLIST MẪU CỦA NGƯỜI NGHE
    -- ==================================================================================

    -- 1. Playlist V-Pop của Lan Anh
    INSERT INTO playlists (owner_user_id, created_by_user_id, title, name, slug, description, visibility, is_private, cover_url, created_at, updated_at)
    VALUES (v_id_lananh, v_id_lananh, 'Giai Điệu V-Pop Ngọt Ngào', 'Giai Điệu V-Pop Ngọt Ngào', 'giai-dieu-vpop-ngot-ngao', 'Tuyển tập những bản ballad và pop Việt Nam da diết, tình cảm nhất.', 'PUBLIC', false, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_pl_vpop;

    IF v_pl_vpop IS NOT NULL THEN
        DELETE FROM playlist_tracks WHERE playlist_id = v_pl_vpop;
        IF v_tr_noi_nay IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_vpop, v_tr_noi_nay, v_id_lananh, 1, v_now);
        END IF;
        IF v_tr_giua_dai_lo IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_vpop, v_tr_giua_dai_lo, v_id_lananh, 2, v_now);
        END IF;
        IF v_tr_tim_em IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_vpop, v_tr_tim_em, v_id_lananh, 3, v_now);
        END IF;
    END IF;

    -- 2. Playlist Rap Việt của Quang Huy
    INSERT INTO playlists (owner_user_id, created_by_user_id, title, name, slug, description, visibility, is_private, cover_url, created_at, updated_at)
    VALUES (v_id_quanghuy, v_id_quanghuy, 'Vibe Rap Việt Cực Cháy', 'Vibe Rap Việt Cực Cháy', 'vibe-rap-viet-cuc-chay', 'List nhạc rap khởi động ngày mới tràn đầy năng lượng cùng HIEUTHUHAI, MCK, Low G.', 'PUBLIC', false, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565335/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_pl_rap;

    IF v_pl_rap IS NOT NULL THEN
        DELETE FROM playlist_tracks WHERE playlist_id = v_pl_rap;
        IF v_tr_exit_sign IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_rap, v_tr_exit_sign, v_id_quanghuy, 1, v_now);
        END IF;
        IF v_tr_baby IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_rap, v_tr_baby, v_id_quanghuy, 2, v_now);
        END IF;
        IF v_tr_laviem IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_rap, v_tr_laviem, v_id_quanghuy, 3, v_now);
        END IF;
    END IF;

    -- 3. Playlist Anime & J-Pop của Yuki Tanaka
    INSERT INTO playlists (owner_user_id, created_by_user_id, title, name, slug, description, visibility, is_private, cover_url, created_at, updated_at)
    VALUES (v_id_yuki, v_id_yuki, 'Anime Soundtracks & J-Pop Hits', 'Anime Soundtracks & J-Pop Hits', 'anime-soundtracks-jpop-hits', 'Collection of iconic themes from Evangelion, Frieren, and Makoto Shinkai works.', 'PUBLIC', false, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565560/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_pl_anime;

    IF v_pl_anime IS NOT NULL THEN
        DELETE FROM playlist_tracks WHERE playlist_id = v_pl_anime;
        IF v_tr_yoru IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_anime, v_tr_yoru, v_id_yuki, 1, v_now);
        END IF;
        IF v_tr_haru IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_anime, v_tr_haru, v_id_yuki, 2, v_now);
        END IF;
        IF v_tr_evangelion IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_anime, v_tr_evangelion, v_id_yuki, 3, v_now);
        END IF;
        IF v_tr_onemore IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_anime, v_tr_onemore, v_id_yuki, 4, v_now);
        END IF;
    END IF;

    -- 4. Playlist Chill của Minh Đức
    INSERT INTO playlists (owner_user_id, created_by_user_id, title, name, slug, description, visibility, is_private, cover_url, created_at, updated_at)
    VALUES (v_id_minhduc, v_id_minhduc, 'Acoustic & Late Night Chill', 'Acoustic & Late Night Chill', 'acoustic-late-night-chill', 'Âm nhạc mộc mạc thư giãn đêm khuya cho tâm hồn thư thái.', 'PUBLIC', false, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_pl_chill;

    IF v_pl_chill IS NOT NULL THEN
        DELETE FROM playlist_tracks WHERE playlist_id = v_pl_chill;
        IF v_tr_som_mai IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_chill, v_tr_som_mai, v_id_minhduc, 1, v_now);
        END IF;
        IF v_tr_giua_dai_lo IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_chill, v_tr_giua_dai_lo, v_id_minhduc, 2, v_now);
        END IF;
        IF v_tr_tim_em IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_chill, v_tr_tim_em, v_id_minhduc, 3, v_now);
        END IF;
        IF v_tr_giai_dieu_15s IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_chill, v_tr_giai_dieu_15s, v_id_minhduc, 4, v_now);
        END IF;
    END IF;

    -- 5. Playlist Hot Trends của Bảo Trâm
    INSERT INTO playlists (owner_user_id, created_by_user_id, title, name, slug, description, visibility, is_private, cover_url, created_at, updated_at)
    VALUES (v_id_baotram, v_id_baotram, 'SoundWave Hot Trends Daily', 'SoundWave Hot Trends Daily', 'soundwave-hot-trends-daily', 'Những giai điệu đang thịnh hành và được yêu thích nhất trên SoundWave.', 'PUBLIC', false, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565314/soundwave/tracks/covers/project-cover-baby-mck.webp', v_now, v_now)
    ON CONFLICT (slug) DO UPDATE SET updated_at = v_now
    RETURNING id INTO v_pl_trends;

    IF v_pl_trends IS NOT NULL THEN
        DELETE FROM playlist_tracks WHERE playlist_id = v_pl_trends;
        IF v_tr_noi_nay IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_trends, v_tr_noi_nay, v_id_baotram, 1, v_now);
        END IF;
        IF v_tr_exit_sign IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_trends, v_tr_exit_sign, v_id_baotram, 2, v_now);
        END IF;
        IF v_tr_yoru IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_trends, v_tr_yoru, v_id_baotram, 3, v_now);
        END IF;
        IF v_tr_baby IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_trends, v_tr_baby, v_id_baotram, 4, v_now);
        END IF;
        IF v_tr_haru IS NOT NULL THEN
            INSERT INTO playlist_tracks (playlist_id, track_id, added_by_user_id, position, added_at) VALUES (v_pl_trends, v_tr_haru, v_id_baotram, 5, v_now);
        END IF;
    END IF;

    -- ==================================================================================
    -- F. TẠO FAVORITES (BÀI HÁT YÊU THÍCH)
    -- ==================================================================================

    IF v_tr_noi_nay IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_lananh, v_tr_noi_nay, v_now) ON CONFLICT DO NOTHING;
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_baotram, v_tr_noi_nay, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_giua_dai_lo IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_lananh, v_tr_giua_dai_lo, v_now) ON CONFLICT DO NOTHING;
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_minhduc, v_tr_giua_dai_lo, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_exit_sign IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_quanghuy, v_tr_exit_sign, v_now) ON CONFLICT DO NOTHING;
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_baotram, v_tr_exit_sign, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_baby IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_quanghuy, v_tr_baby, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_laviem IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_quanghuy, v_tr_laviem, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_yoru IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_yuki, v_tr_yoru, v_now) ON CONFLICT DO NOTHING;
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_baotram, v_tr_yoru, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_haru IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_yuki, v_tr_haru, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_evangelion IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_yuki, v_tr_evangelion, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_onemore IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_yuki, v_tr_onemore, v_now) ON CONFLICT DO NOTHING;
    END IF;
    IF v_tr_som_mai IS NOT NULL THEN
        INSERT INTO favorites (user_id, track_id, created_at) VALUES (v_id_minhduc, v_tr_som_mai, v_now) ON CONFLICT DO NOTHING;
    END IF;

    -- ==================================================================================
    -- G. TẠO LỊCH SỬ NGHE NHẠC (LISTENING HISTORY)
    -- ==================================================================================

    IF v_tr_noi_nay IS NOT NULL THEN
        INSERT INTO listening_history (user_id, track_id, listened_duration_ms, completed, played_at)
        VALUES (v_id_lananh, v_tr_noi_nay, 230000, true, v_now - INTERVAL '2 hours');
        INSERT INTO listening_history (user_id, track_id, listened_duration_ms, completed, played_at)
        VALUES (v_id_baotram, v_tr_noi_nay, 230000, true, v_now - INTERVAL '5 hours');
    END IF;

    IF v_tr_exit_sign IS NOT NULL THEN
        INSERT INTO listening_history (user_id, track_id, listened_duration_ms, completed, played_at)
        VALUES (v_id_quanghuy, v_tr_exit_sign, 210000, true, v_now - INTERVAL '1 hours');
        INSERT INTO listening_history (user_id, track_id, listened_duration_ms, completed, played_at)
        VALUES (v_id_baotram, v_tr_exit_sign, 210000, true, v_now - INTERVAL '6 hours');
    END IF;

    IF v_tr_yoru IS NOT NULL THEN
        INSERT INTO listening_history (user_id, track_id, listened_duration_ms, completed, played_at)
        VALUES (v_id_yuki, v_tr_yoru, 260000, true, v_now - INTERVAL '3 hours');
    END IF;

    IF v_tr_haru IS NOT NULL THEN
        INSERT INTO listening_history (user_id, track_id, listened_duration_ms, completed, played_at)
        VALUES (v_id_yuki, v_tr_haru, 180000, true, v_now - INTERVAL '7 hours');
    END IF;

    IF v_tr_som_mai IS NOT NULL THEN
        INSERT INTO listening_history (user_id, track_id, listened_duration_ms, completed, played_at)
        VALUES (v_id_minhduc, v_tr_som_mai, 60000, true, v_now - INTERVAL '4 hours');
    END IF;

    -- ==================================================================================
    -- H. TẠO ĐÁNH GIÁ HỆ THỐNG (SYSTEM REVIEWS)
    -- ==================================================================================

    INSERT INTO system_reviews (user_id, rating, comment, status, created_at, updated_at)
    VALUES (v_id_lananh, 5, 'Giao diện web màu xanh dương và cát ấm nhìn rất dịu mắt, chất lượng âm thanh bài hát nghe cực kỳ mượt mà!', 'ACKNOWLEDGED', v_now - INTERVAL '1 day', v_now)
    ON CONFLICT DO NOTHING;

    INSERT INTO system_reviews (user_id, rating, comment, status, created_at, updated_at)
    VALUES (v_id_quanghuy, 5, 'Nhiều bài rap chất lượng, trình phát nhạc có hàng đợi rất tiện lợi. Chúc SoundWave ngày càng phát triển!', 'ACKNOWLEDGED', v_now - INTERVAL '2 days', v_now)
    ON CONFLICT DO NOTHING;

    INSERT INTO system_reviews (user_id, rating, comment, status, created_at, updated_at)
    VALUES (v_id_yuki, 5, 'Tuyệt vời, có cả nhạc anime chất lượng cao lẫn nhạc Việt!', 'ACKNOWLEDGED', v_now - INTERVAL '3 days', v_now)
    ON CONFLICT DO NOTHING;

    INSERT INTO system_reviews (user_id, rating, comment, status, created_at, updated_at)
    VALUES (v_id_minhduc, 5, 'Giao diện tối giản, nghe nhạc thư giãn buổi tối rất thích.', 'ACKNOWLEDGED', v_now - INTERVAL '4 days', v_now)
    ON CONFLICT DO NOTHING;

    INSERT INTO system_reviews (user_id, rating, comment, status, created_at, updated_at)
    VALUES (v_id_baotram, 5, 'Trải nghiệm nghe nhạc liền mạch, tìm kiếm bài hát theo thể loại rất nhanh chóng!', 'ACKNOWLEDGED', v_now - INTERVAL '5 days', v_now)
    ON CONFLICT DO NOTHING;

END $$;

COMMIT;
