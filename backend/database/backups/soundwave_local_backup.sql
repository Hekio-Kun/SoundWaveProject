--
-- PostgreSQL database dump
--

\restrict BJmEbO2tp4Q2jKF4qxUYH1gFikaayv4OMocu7FUddJXEt5l7OaJtmgCqqbNm06h

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP PUBLICATION IF EXISTS neon_to_local_pub;
DROP PUBLICATION IF EXISTS neon_soundwave_pub;
ALTER TABLE IF EXISTS ONLY public.official_lyrics DROP CONSTRAINT IF EXISTS fkrr6yuyyqw16u7flxk2qn7pne0;
ALTER TABLE IF EXISTS ONLY public.playlist_tracks DROP CONSTRAINT IF EXISTS fkn9g4py06v2tmrisjdvxvjeb7x;
ALTER TABLE IF EXISTS ONLY public.personal_lyrics DROP CONSTRAINT IF EXISTS fkm4a2d4m7le5sk8d1pja8020jn;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS fkl95wc4ai7byhyogfs6eb9ah8q;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS fkk3ndxg5xp6v7wd4gjyusp15gq;
ALTER TABLE IF EXISTS ONLY public.user_profiles DROP CONSTRAINT IF EXISTS fkjcad5nfve11khsnpwj1mv8frj;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS fki1c4mmamlb8keqt74k4lrtwhc;
ALTER TABLE IF EXISTS ONLY public.playlist_tracks DROP CONSTRAINT IF EXISTS fkhjkawu4qwjhxcpveah0pymuct;
ALTER TABLE IF EXISTS ONLY public.personal_lyrics DROP CONSTRAINT IF EXISTS fkh84hfpu9xy9ju9f7f5adygbax;
ALTER TABLE IF EXISTS ONLY public.listening_history DROP CONSTRAINT IF EXISTS fkgl5tks7mr7upg8ao1gtgh8ngl;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS fkeip8uycx67nectnxmakr56uuy;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS fkdcmijveo7n1lql01vav1u2jd2;
ALTER TABLE IF EXISTS ONLY public.account_unlock_tokens DROP CONSTRAINT IF EXISTS fkbi5l81rgcaqd1cva4nk6k9ex5;
ALTER TABLE IF EXISTS ONLY public.staffs DROP CONSTRAINT IF EXISTS fkawutf3mnj24xcfp8gpe33ftpx;
ALTER TABLE IF EXISTS ONLY public.official_lyrics DROP CONSTRAINT IF EXISTS fkaapwxgur5skqdrnov9ldxgq9o;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS fk7weekvjfll0bifyfyx25to00l;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS fk1lih5y2npsf8u5o3vhdb9y0os;
DROP INDEX IF EXISTS public.idx_notifications_user_created;
DROP INDEX IF EXISTS public.idx_notifications_staff_created;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS ukpe1a9woik1k97l87cieguyhh4;
ALTER TABLE IF EXISTS ONLY public.staff_roles DROP CONSTRAINT IF EXISTS ukp4175toby5p4krj9la28k3hce;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS uko2mlirhldriil2y7krapq4frt;
ALTER TABLE IF EXISTS ONLY public.albums DROP CONSTRAINT IF EXISTS uknpxg9602prdf6t9ad77qjwhq;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS ukm0wdj2culolvegk3wuc1953kd;
ALTER TABLE IF EXISTS ONLY public.official_lyrics DROP CONSTRAINT IF EXISTS ukj81seth96sxlupo9e9jk3rfp9;
ALTER TABLE IF EXISTS ONLY public.staffs DROP CONSTRAINT IF EXISTS ukikcos5mg2rbdhyg1v5dbyu5is;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS ukfun8evwjl5g8ps273eipowm7f;
ALTER TABLE IF EXISTS ONLY public.playlists DROP CONSTRAINT IF EXISTS ukbq229u3bbkas0bmcvn265p3b2;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS ukajre85ybxavf1tt4omkrs5p6g;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS ukah12jdrm74nfnmu11x9xxlbex;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS uk6dotkott2kjsp8vw4d0m25fb7;
ALTER TABLE IF EXISTS ONLY public.user_profiles DROP CONSTRAINT IF EXISTS uk5vlt12tabpccuckq0e84nhs4c;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS tracks_pkey;
ALTER TABLE IF EXISTS ONLY public.track_submissions DROP CONSTRAINT IF EXISTS track_submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.staffs DROP CONSTRAINT IF EXISTS staffs_pkey;
ALTER TABLE IF EXISTS ONLY public.staff_roles DROP CONSTRAINT IF EXISTS staff_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.playlists DROP CONSTRAINT IF EXISTS playlists_pkey;
ALTER TABLE IF EXISTS ONLY public.playlist_tracks DROP CONSTRAINT IF EXISTS pk_playlist_tracks;
ALTER TABLE IF EXISTS ONLY public.personal_lyrics DROP CONSTRAINT IF EXISTS personal_lyrics_pkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.official_lyrics DROP CONSTRAINT IF EXISTS official_lyrics_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.listening_history DROP CONSTRAINT IF EXISTS listening_history_pkey;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS genres_pkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_pkey;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS email_verification_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.albums DROP CONSTRAINT IF EXISTS albums_pkey;
ALTER TABLE IF EXISTS ONLY public.account_unlock_tokens DROP CONSTRAINT IF EXISTS account_unlock_tokens_pkey;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.tracks;
DROP TABLE IF EXISTS public.track_submissions;
DROP TABLE IF EXISTS public.staffs;
DROP TABLE IF EXISTS public.staff_roles;
DROP TABLE IF EXISTS public.refresh_tokens;
DROP TABLE IF EXISTS public.playlists;
DROP TABLE IF EXISTS public.playlist_tracks;
DROP TABLE IF EXISTS public.personal_lyrics;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP TABLE IF EXISTS public.official_lyrics;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.listening_history;
DROP TABLE IF EXISTS public.genres;
DROP TABLE IF EXISTS public.favorites;
DROP TABLE IF EXISTS public.email_verification_tokens;
DROP TABLE IF EXISTS public.albums;
DROP TABLE IF EXISTS public.account_unlock_tokens;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_unlock_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account_unlock_tokens (
    unlock_token_id bigint CONSTRAINT account_unlock_tokens_id_not_null NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    token_hash character varying(255) NOT NULL,
    used_at timestamp(6) without time zone,
    user_id bigint NOT NULL
);


--
-- Name: account_unlock_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.account_unlock_tokens ALTER COLUMN unlock_token_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.account_unlock_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: albums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.albums (
    album_id bigint CONSTRAINT albums_id_not_null NOT NULL,
    cover_public_id character varying(255),
    cover_url character varying(2048),
    created_at timestamp(6) without time zone NOT NULL,
    created_by_user_id bigint NOT NULL,
    description character varying(2000),
    published_at timestamp(6) without time zone,
    release_date date,
    slug character varying(220) NOT NULL,
    status character varying(30) NOT NULL,
    title character varying(200) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: albums_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.albums ALTER COLUMN album_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.albums_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verification_tokens (
    verification_token_id bigint CONSTRAINT email_verification_tokens_id_not_null NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    token_hash character varying(255) NOT NULL,
    used_at timestamp(6) without time zone,
    user_id bigint NOT NULL
);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.email_verification_tokens ALTER COLUMN verification_token_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.email_verification_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    track_id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL
);


--
-- Name: genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genres (
    genre_id bigint CONSTRAINT genres_id_not_null NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by_user_id bigint,
    description character varying(1000),
    is_active boolean NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: genres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.genres ALTER COLUMN genre_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.genres_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: listening_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listening_history (
    history_id bigint CONSTRAINT listening_history_id_not_null NOT NULL,
    completed boolean NOT NULL,
    listened_duration_ms integer NOT NULL,
    played_at timestamp(6) without time zone NOT NULL,
    track_id bigint NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: listening_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.listening_history ALTER COLUMN history_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.listening_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    notification_id bigint CONSTRAINT notifications_id_not_null NOT NULL,
    actor_id bigint,
    created_at timestamp(6) with time zone NOT NULL,
    is_read boolean NOT NULL,
    message character varying(500) NOT NULL,
    reference_id character varying(100),
    reference_type character varying(50),
    staff_id bigint,
    title character varying(150) NOT NULL,
    type character varying(50) NOT NULL,
    user_id bigint,
    CONSTRAINT ck_notifications_type CHECK (((type)::text = ANY ((ARRAY['TRACK_APPROVED'::character varying, 'TRACK_REJECTED'::character varying, 'TRACK_TAKEN_DOWN'::character varying, 'TRACK_SUBMISSION'::character varying, 'REPORT_RESOLVED'::character varying, 'REPORT_REJECTED'::character varying, 'CONTENT_REPORT'::character varying, 'ACCOUNT_STATUS_CHANGED'::character varying, 'ROLE_CHANGED'::character varying, 'SYSTEM'::character varying, 'SYSTEM_NOTICE'::character varying])::text[]))),
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['TRACK_APPROVED'::character varying, 'TRACK_REJECTED'::character varying, 'TRACK_SUBMISSION'::character varying, 'CONTENT_REPORT'::character varying, 'SYSTEM_NOTICE'::character varying])::text[])))
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN notification_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: official_lyrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.official_lyrics (
    official_lyric_id bigint CONSTRAINT official_lyrics_id_not_null NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    lyric_content text NOT NULL,
    status character varying(30) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    created_by_user_id bigint,
    track_id bigint NOT NULL
);


--
-- Name: official_lyrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.official_lyrics ALTER COLUMN official_lyric_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.official_lyrics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    reset_token_id bigint CONSTRAINT password_reset_tokens_id_not_null NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    token_hash character varying(255) NOT NULL,
    used_at timestamp(6) without time zone,
    user_id bigint NOT NULL
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.password_reset_tokens ALTER COLUMN reset_token_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: personal_lyrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_lyrics (
    personal_lyric_id bigint CONSTRAINT personal_lyrics_id_not_null NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    lyric_content text NOT NULL,
    lyric_type character varying(20) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    track_id bigint NOT NULL,
    user_id bigint NOT NULL
);


--
-- Name: personal_lyrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.personal_lyrics ALTER COLUMN personal_lyric_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.personal_lyrics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: playlist_tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlist_tracks (
    added_at timestamp(6) without time zone NOT NULL,
    added_by_user_id bigint NOT NULL,
    "position" integer NOT NULL,
    playlist_id bigint NOT NULL,
    track_id bigint NOT NULL
);


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlists (
    playlist_id bigint CONSTRAINT playlists_id_not_null NOT NULL,
    cover_public_id character varying(255),
    cover_url character varying(2048),
    created_at timestamp(6) without time zone NOT NULL,
    created_by_user_id bigint NOT NULL,
    description character varying(2000),
    is_private boolean NOT NULL,
    name character varying(150) NOT NULL,
    owner_user_id bigint NOT NULL,
    slug character varying(180) NOT NULL,
    title character varying(150) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    visibility character varying(30) NOT NULL
);


--
-- Name: playlists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.playlists ALTER COLUMN playlist_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.playlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    refresh_token_id bigint CONSTRAINT refresh_tokens_id_not_null NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    revoked_at timestamp(6) without time zone,
    token_hash character varying(255) NOT NULL,
    staff_id bigint,
    user_id bigint
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.refresh_tokens ALTER COLUMN refresh_token_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: staff_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_roles (
    role_id smallint CONSTRAINT staff_roles_id_not_null NOT NULL,
    code character varying(30) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description character varying(500),
    name character varying(80) NOT NULL
);


--
-- Name: staff_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.staff_roles ALTER COLUMN role_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.staff_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: staffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staffs (
    staff_id bigint CONSTRAINT staffs_id_not_null NOT NULL,
    avatar_url character varying(2048),
    created_at timestamp(6) without time zone NOT NULL,
    email character varying(320) NOT NULL,
    full_name character varying(120) NOT NULL,
    last_login_at timestamp(6) without time zone,
    password_hash character varying(255) NOT NULL,
    status character varying(30) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    role_id smallint NOT NULL
);


--
-- Name: staffs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.staffs ALTER COLUMN staff_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.staffs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: track_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.track_submissions (
    submission_id bigint CONSTRAINT track_submissions_id_not_null NOT NULL,
    rejection_reason character varying(1000),
    reviewed_at timestamp(6) with time zone,
    reviewer_note character varying(2000),
    reviewer_user_id bigint,
    status character varying(30) NOT NULL,
    submitted_at timestamp(6) with time zone NOT NULL,
    submitted_by_user_id bigint NOT NULL,
    submitter_note character varying(2000),
    track_id bigint NOT NULL,
    CONSTRAINT track_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: track_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.track_submissions ALTER COLUMN submission_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.track_submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tracks (
    track_id bigint CONSTRAINT tracks_id_not_null NOT NULL,
    approved_at timestamp(6) without time zone,
    audio_format character varying(20) NOT NULL,
    audio_public_id character varying(255),
    audio_url character varying(2048),
    cover_public_id character varying(255),
    cover_url character varying(2048),
    created_at timestamp(6) without time zone NOT NULL,
    description character varying(2000),
    duration_ms integer NOT NULL,
    latest_rejection_reason character varying(1000),
    play_count_cache bigint NOT NULL,
    publication_status character varying(30) NOT NULL,
    slug character varying(220) NOT NULL,
    title character varying(200) NOT NULL,
    track_number integer,
    updated_at timestamp(6) without time zone NOT NULL,
    uploader_user_id bigint NOT NULL,
    album_id bigint,
    genre_id bigint NOT NULL,
    CONSTRAINT tracks_publication_status_check CHECK (((publication_status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PENDING'::character varying, 'PUBLISHED'::character varying, 'REJECTED'::character varying, 'TAKEN_DOWN'::character varying])::text[])))
);


--
-- Name: tracks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tracks ALTER COLUMN track_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tracks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    user_id bigint NOT NULL,
    avatar_public_id character varying(255),
    avatar_url character varying(2048),
    bio character varying(1000),
    country_code character(2),
    created_at timestamp(6) without time zone NOT NULL,
    date_of_birth date,
    display_name character varying(120) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    username character varying(50) NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id bigint CONSTRAINT users_id_not_null NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    deleted_at timestamp(6) without time zone,
    email character varying(320) NOT NULL,
    email_verified_at timestamp(6) without time zone,
    last_login_at timestamp(6) without time zone,
    locked_until timestamp(6) without time zone,
    password_hash character varying(255) NOT NULL,
    status character varying(30) NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'TEMPORARILY_LOCKED'::character varying, 'BANNED'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN user_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: account_unlock_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.albums VALUES (1, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', '2026-10-31 11:06:11.511', 1, 'Single phát hành năm 2017 của Sơn Tùng M-TP', '2026-10-31 11:06:11.511', '2017-02-14', 'noi-nay-co-anh-album', 'PUBLISHED', 'Nơi Này Có Anh', '2026-10-31 11:06:11.511');
INSERT INTO public.albums VALUES (2, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', '2026-10-31 11:06:11.511', 2, 'Album đầu tay đình đám của MCK', '2026-10-31 11:06:11.511', '2023-03-02', '99-percent-mck', 'PUBLISHED', '99%', '2026-10-31 11:06:11.511');
INSERT INTO public.albums VALUES (3, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', '2026-10-31 11:06:11.511', 3, 'Album phòng thu đầu tay của rapper HIEUTHUHAI', '2026-10-31 11:06:11.511', '2023-10-16', 'ai-cung-phai-bat-dau-tu-dau-do', 'PUBLISHED', 'Ai Cũng Phải Bắt Đầu Từ Đâu Đó', '2026-10-31 11:06:11.511');
INSERT INTO public.albums VALUES (4, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', '2026-10-31 11:06:11.511', 4, 'Bản ballad da diết của Uyên Linh', '2026-10-31 11:06:11.511', '2021-05-20', 'dai-lo-dong-tay-single', 'PUBLISHED', 'Đại Lộ Đông Tây', '2026-10-31 11:06:11.511');
INSERT INTO public.albums VALUES (5, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', '2026-10-31 11:06:11.511', 8, 'Album EP đầu tay của bộ đôi YOASOBI', '2026-10-31 11:06:11.511', '2021-01-06', 'the-book-yoasobi', 'PUBLISHED', 'THE BOOK', '2026-10-31 11:06:11.511');


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.genres VALUES (1, '2026-10-31 11:06:11.511', NULL, 'Giai điệu bắt tai, phổ biến rộng rãi.', true, 'Pop', 'pop', '2026-10-31 11:06:11.511');
INSERT INTO public.genres VALUES (2, '2026-10-31 11:06:11.511', NULL, 'Những bản tình ca nhẹ nhàng, sâu lắng.', true, 'Ballad', 'ballad', '2026-10-31 11:06:11.511');
INSERT INTO public.genres VALUES (3, '2026-10-31 11:06:11.511', NULL, 'Nhịp điệu sôi động, ca từ cá tính.', true, 'Rap / Hip-Hop', 'rap-hip-hop', '2026-10-31 11:06:11.511');
INSERT INTO public.genres VALUES (4, '2026-10-31 11:06:11.511', NULL, 'Rhythm and Blues mượt mà, cảm xúc.', true, 'R&B', 'rnb', '2026-10-31 11:06:11.511');
INSERT INTO public.genres VALUES (5, '2026-10-31 11:06:11.511', NULL, 'Âm nhạc độc lập tự do sáng tạo.', true, 'Indie', 'indie', '2026-10-31 11:06:11.511');
INSERT INTO public.genres VALUES (6, '2026-10-31 11:06:11.511', NULL, 'Âm hưởng mộc mạc của nhạc cụ tự nhiên.', true, 'Acoustic', 'acoustic', '2026-10-31 11:06:11.511');
INSERT INTO public.genres VALUES (7, '2026-10-31 11:06:11.511', NULL, 'Nhạc điện tử sôi động cho lễ hội và bữa tiệc.', true, 'EDM', 'edm', '2026-10-31 11:06:11.511');
INSERT INTO public.genres VALUES (8, '2026-10-31 11:06:11.511', NULL, 'Giai điệu êm dịu, thư giãn tập trung.', true, 'Lo-fi', 'lo-fi', '2026-10-31 11:06:11.511');


--
-- Data for Name: listening_history; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: official_lyrics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.official_lyrics VALUES (1, '2026-10-31 11:06:11.511+07', '[00:00.00]Em là ai từ đâu bước đến nơi đây dịu dàng chân phương
[00:15.00]Cầm tay anh đi qua bao giông tố cuộc đời...
[00:30.00]Cầm tay anh, dựa vai anh
[00:45.00]Đừng buông tay anh nhé!', 'PUBLISHED', '2026-10-31 11:06:11.511+07', 2, 1);
INSERT INTO public.official_lyrics VALUES (2, '2026-10-31 11:06:11.511+07', '[00:00.00]Baby em là một giấc mơ
[00:12.00]Mà anh không thể nào chạm tới...
[00:25.00]Khi màn đêm buông xuống nơi đây
[00:38.00]Chỉ còn nỗi nhớ đong đầy.', 'PUBLISHED', '2026-10-31 11:06:11.511+07', 2, 2);
INSERT INTO public.official_lyrics VALUES (3, '2026-10-31 11:06:11.511+07', '[00:00.00]Em tìm lối ra nơi bảng exit sign
[00:14.00]Để lại con tim anh vỡ tan trong đêm dài...
[00:28.00]Liệu có cơ hội nào cho đôi ta bắt đầu lại?', 'PUBLISHED', '2026-10-31 11:06:11.511+07', 2, 3);
INSERT INTO public.official_lyrics VALUES (4, '2026-10-31 11:06:11.511+07', '[00:00.00]Giữa đại lộ đông tây
[00:16.00]Có ai nghe thấy nỗi cô đơn này...
[00:32.00]Dòng xe vội vã lướt qua nhanh
[00:48.00]Chỉ còn em đứng lặng thầm.', 'PUBLISHED', '2026-10-31 11:06:11.511+07', 2, 4);
INSERT INTO public.official_lyrics VALUES (5, '2026-10-31 11:06:11.511+07', '[00:00.00]Từng ngày tìm kiếm bóng hình em
[00:15.00]Dù biết yêu thương đã khuất xa ngoài tầm tay...
[00:30.00]Một lời hứa gió thoảng bay đi.', 'PUBLISHED', '2026-10-31 11:06:11.511+07', 2, 5);
INSERT INTO public.official_lyrics VALUES (6, '2026-10-31 11:06:11.511+07', '[00:00.00]貴方の目にいつか映る
[00:15.00]晴れた日の空のように...
[00:30.00]風が吹き抜けるこの丘で
[00:45.00]歩き続ける物語。', 'PUBLISHED', '2026-10-31 11:06:11.511+07', 2, 6);
INSERT INTO public.official_lyrics VALUES (7, '2026-10-31 11:06:11.511+07', '[00:00.00]残酷な天使のように
[00:10.00]少年よ 神話になれ...
[00:25.00]蒼い風がいま 胸のドアを叩いても
[00:40.00]私だけをただ見つめて
[00:55.00]微笑んでるあなた。', 'PUBLISHED', '2026-10-31 11:06:11.511+07', 2, 7);
INSERT INTO public.official_lyrics VALUES (8, '2026-10-31 11:06:11.511+07', '[00:00.00]沈むように溶けてゆくように
[00:12.00]二人だけの空が広がる夜に...
[00:25.00]「さよなら」だけだった
[00:38.00]その一言で全てが分かった。', 'PUBLISHED', '2026-10-31 11:06:11.511+07', 2, 8);


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: personal_lyrics; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: playlist_tracks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:11.511', 10, 1, 1, 1);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:11.511', 10, 2, 1, 2);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:11.511', 10, 3, 1, 3);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:11.511', 10, 4, 1, 4);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:11.511', 10, 5, 1, 5);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:11.511', 10, 1, 2, 6);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:11.511', 10, 2, 2, 7);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:11.511', 10, 3, 2, 8);


--
-- Data for Name: playlists; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.playlists VALUES (1, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', '2026-10-31 11:06:11.511', 10, 'Tuyển tập các bản hit V-Pop đỉnh cao', false, 'V-Pop Tuyển Chọn', 10, 'v-pop-tuyen-chon', 'V-Pop Tuyển Chọn', '2026-10-31 11:06:11.511', 'PUBLIC');
INSERT INTO public.playlists VALUES (2, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', '2026-10-31 11:06:11.511', 10, 'Những bản nhạc Anime bất hủ', false, 'J-Pop / Anime Hits', 10, 'j-pop-anime-hits', 'J-Pop / Anime Hits', '2026-10-31 11:06:11.511', 'PUBLIC');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: staff_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.staff_roles VALUES (3, 'ADMIN', '2026-10-31 11:06:11.511', 'Quản trị viên toàn quyền hệ thống SoundWave', 'Administrator');
INSERT INTO public.staff_roles VALUES (4, 'STAFF', '2026-10-31 11:06:11.511', 'Nhân viên vận hành và kiểm duyệt nội dung SoundWave', 'Staff');


--
-- Data for Name: staffs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.staffs VALUES (1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', '2026-10-31 11:06:11.511', 'admin@soundwave.com', 'System Administrator', NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511', 3);
INSERT INTO public.staffs VALUES (2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', '2026-10-31 11:06:11.511', 'staff@soundwave.com', 'Content Moderator', NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511', 4);


--
-- Data for Name: track_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.track_submissions VALUES (1, NULL, '2026-10-31 11:06:11.511+07', NULL, 2, 'APPROVED', '2026-10-31 11:06:11.511+07', 1, NULL, 1);
INSERT INTO public.track_submissions VALUES (2, NULL, '2026-10-31 11:06:11.511+07', NULL, 2, 'APPROVED', '2026-10-31 11:06:11.511+07', 2, NULL, 2);
INSERT INTO public.track_submissions VALUES (3, NULL, '2026-10-31 11:06:11.511+07', NULL, 2, 'APPROVED', '2026-10-31 11:06:11.511+07', 3, NULL, 3);
INSERT INTO public.track_submissions VALUES (4, NULL, '2026-10-31 11:06:11.511+07', NULL, 2, 'APPROVED', '2026-10-31 11:06:11.511+07', 4, NULL, 4);
INSERT INTO public.track_submissions VALUES (5, NULL, '2026-10-31 11:06:11.511+07', NULL, 2, 'APPROVED', '2026-10-31 11:06:11.511+07', 5, NULL, 5);
INSERT INTO public.track_submissions VALUES (6, NULL, '2026-10-31 11:06:11.511+07', NULL, 2, 'APPROVED', '2026-10-31 11:06:11.511+07', 6, NULL, 6);
INSERT INTO public.track_submissions VALUES (7, NULL, '2026-10-31 11:06:11.511+07', NULL, 2, 'APPROVED', '2026-10-31 11:06:11.511+07', 7, NULL, 7);
INSERT INTO public.track_submissions VALUES (8, NULL, '2026-10-31 11:06:11.511+07', NULL, 2, 'APPROVED', '2026-10-31 11:06:11.511+07', 8, NULL, 8);


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tracks VALUES (1, '2026-10-31 11:06:11.511', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565402/soundwave/tracks/audio/project-track-noi-nay-co-anh.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', '2026-10-31 11:06:11.511', 'Bản tình ca Pop ngọt ngào, lãng mạn đình đám của Sơn Tùng M-TP.', 278269, NULL, 892300, 'PUBLISHED', 'noi-nay-co-anh', 'Nơi Này Có Anh', NULL, '2026-10-31 11:06:11.511', 1, 1, 1);
INSERT INTO public.tracks VALUES (2, '2026-10-31 11:06:11.511', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565312/soundwave/tracks/audio/project-track-baby-mck.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', '2026-10-31 11:06:11.511', 'Bản hit đầy cảm xúc từ album 99% của MCK.', 173740, NULL, 285420, 'PUBLISHED', 'baby-mck', 'Baby', NULL, '2026-10-31 11:06:11.511', 2, 2, 3);
INSERT INTO public.tracks VALUES (3, '2026-10-31 11:06:11.511', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565333/soundwave/tracks/audio/project-track-exit-sign-hieuthuhai.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', '2026-10-31 11:06:11.511', 'Ca khúc nổi bật trong album Ai Cũng Phải Bắt Đầu Từ Đâu Đó của HIEUTHUHAI kết hợp cùng marzuz và Kewtiie.', 201718, NULL, 421890, 'PUBLISHED', 'exit-sign-hieuthuhai', 'Exit Sign', NULL, '2026-10-31 11:06:11.511', 3, 3, 3);
INSERT INTO public.tracks VALUES (4, '2026-10-31 11:06:11.511', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565353/soundwave/tracks/audio/project-track-giua-dai-lo-dong-tay.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', '2026-10-31 11:06:11.511', 'Ca khúc ballad da diết sáng tác bởi Hứa Kim Tuyền qua giọng hát nội lực của Uyên Linh.', 226691, NULL, 356700, 'PUBLISHED', 'giua-dai-lo-dong-tay', 'Giữa Đại Lộ Đông Tây', NULL, '2026-10-31 11:06:11.511', 4, 4, 2);
INSERT INTO public.tracks VALUES (5, '2026-10-31 11:06:11.511', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565382/soundwave/tracks/audio/project-track-tim-em-hngle-bao-anh.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', '2026-10-31 11:06:11.511', 'Giai điệu R&B nhẹ nhàng, lãng mạn qua sự kết hợp ăn ý giữa Hngle và Bảo Anh.', 272170, NULL, 198400, 'PUBLISHED', 'tim-em-hngle-bao-anh', 'Tìm Em', NULL, '2026-10-31 11:06:11.511', 5, NULL, 4);
INSERT INTO public.tracks VALUES (6, '2026-10-31 11:06:11.511', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565495/soundwave/tracks/audio/project-track-haru-yorushika.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp', '2026-10-31 11:06:11.511', 'Ca khúc chủ đề mở đầu của anime Frieren: Beyond Journey''s End thực hiện bởi nhóm nhạc Yorushika.', 276715, NULL, 312500, 'PUBLISHED', 'haru-yorushika', 'Haru (晴る)', NULL, '2026-10-31 11:06:11.511', 6, NULL, 5);
INSERT INTO public.tracks VALUES (7, '2026-10-31 11:06:11.511', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565521/soundwave/tracks/audio/project-track-a-cruel-angels-thesis.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', '2026-10-31 11:06:11.511', 'Bài hát chủ đề huyền thoại của anime Neon Genesis Evangelion trình bày bởi Yoko Takahashi.', 243905, NULL, 523100, 'PUBLISHED', 'a-cruel-angels-thesis', 'A Cruel Angel''s Thesis (残酷な天使のテーゼ)', NULL, '2026-10-31 11:06:11.511', 7, NULL, 1);
INSERT INTO public.tracks VALUES (8, '2026-10-31 11:06:11.511', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565419/soundwave/tracks/audio/project-track-yoru-ni-kakeru.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', '2026-10-31 11:06:11.511', 'Bản hit đột phá toàn cầu của bộ đôi YOASOBI dựa trên tiểu thuyết Tanatosu no Yūwaku.', 275043, NULL, 689400, 'PUBLISHED', 'yoru-ni-kakeru', 'Yoru ni Kakeru (夜に駆ける)', NULL, '2026-10-31 11:06:11.511', 8, 5, 1);


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_profiles VALUES (1, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'Ca sĩ, nhạc sĩ, nhà sản xuất âm nhạc V-Pop hàng đầu. Founder M-TP Entertainment.', 'VN', '2026-10-31 11:06:11.511', NULL, 'Sơn Tùng M-TP', '2026-10-31 11:06:11.511', 'sontungmtp');
INSERT INTO public.user_profiles VALUES (2, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', 'Rapper, ca sĩ, nhạc sĩ thuộc tổ đội RPT. Chủ nhân album đình đám 99%.', 'VN', '2026-10-31 11:06:11.511', NULL, 'MCK', '2026-10-31 11:06:11.511', 'mck99');
INSERT INTO public.user_profiles VALUES (3, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', 'Rapper thành viên nhóm nhạc GERDNANG. Chủ nhân album Ai Cũng Phải Bắt Đầu Từ Đâu Đó.', 'VN', '2026-10-31 11:06:11.511', NULL, 'HIEUTHUHAI', '2026-10-31 11:06:11.511', 'hieuthuhai');
INSERT INTO public.user_profiles VALUES (4, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', 'Nữ ca sĩ sở hữu giọng hát nội lực, truyền cảm với các bản hit Ballad da diết.', 'VN', '2026-10-31 11:06:11.511', NULL, 'Uyên Linh', '2026-10-31 11:06:11.511', 'uyenlinh');
INSERT INTO public.user_profiles VALUES (5, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', 'Nghệ sĩ Indie R&B trẻ với màu sắc âm nhạc hiện đại, cảm xúc và bay bổng.', 'VN', '2026-10-31 11:06:11.511', NULL, 'Hngle ft. Bảo Anh', '2026-10-31 11:06:11.511', 'hngle');
INSERT INTO public.user_profiles VALUES (6, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp', 'Nhóm nhạc rock/indie Nhật Bản được thành lập vào năm 2017 bởi n-buna và suis.', 'JP', '2026-10-31 11:06:11.511', NULL, 'Yorushika', '2026-10-31 11:06:11.511', 'yorushika');
INSERT INTO public.user_profiles VALUES (7, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', 'Ca sĩ nổi tiếng với các bài hát anime kinh điển, đặc biệt là Evangelion.', 'JP', '2026-10-31 11:06:11.511', NULL, 'Yoko Takahashi', '2026-10-31 11:06:11.511', 'yokotakahashi');
INSERT INTO public.user_profiles VALUES (8, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', 'Bộ đôi âm nhạc Nhật Bản gồm nhà sản xuất Ayase và ca sĩ kiêm nhạc sĩ Ikura.', 'JP', '2026-10-31 11:06:11.511', NULL, 'YOASOBI', '2026-10-31 11:06:11.511', 'yoasobi');
INSERT INTO public.user_profiles VALUES (9, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'Creator on SoundWave platform.', 'VN', '2026-10-31 11:06:11.511', NULL, 'Hekio', '2026-10-31 11:06:11.511', 'hekio');
INSERT INTO public.user_profiles VALUES (10, NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Yêu âm nhạc, thích nghe podcast và indie mỗi tối.', 'VN', '2026-10-31 11:06:11.511', NULL, 'Lan Anh', '2026-10-31 11:06:11.511', 'listener_vn');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, '2026-10-31 11:06:11.511', NULL, 'sontungmtp@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (2, '2026-10-31 11:06:11.511', NULL, 'mck@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (3, '2026-10-31 11:06:11.511', NULL, 'hieuthuhai@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (4, '2026-10-31 11:06:11.511', NULL, 'uyenlinh@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (5, '2026-10-31 11:06:11.511', NULL, 'hngle@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (6, '2026-10-31 11:06:11.511', NULL, 'yorushika@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (7, '2026-10-31 11:06:11.511', NULL, 'yoko@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (8, '2026-10-31 11:06:11.511', NULL, 'yoasobi@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (9, '2026-10-31 11:06:11.511', NULL, 'hekio@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');
INSERT INTO public.users VALUES (10, '2026-10-31 11:06:11.511', NULL, 'listener@soundwave.io', '2026-10-31 11:06:11.511', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:11.511');


--
-- Name: account_unlock_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.account_unlock_tokens_id_seq', 1, false);


--
-- Name: albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.albums_id_seq', 5, true);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 1, false);


--
-- Name: genres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.genres_id_seq', 8, true);


--
-- Name: listening_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.listening_history_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: official_lyrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.official_lyrics_id_seq', 8, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: personal_lyrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_lyrics_id_seq', 1, false);


--
-- Name: playlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.playlists_id_seq', 2, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 1, false);


--
-- Name: staff_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_roles_id_seq', 4, true);


--
-- Name: staffs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staffs_id_seq', 2, true);


--
-- Name: track_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.track_submissions_id_seq', 8, true);


--
-- Name: tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tracks_id_seq', 8, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: account_unlock_tokens account_unlock_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_unlock_tokens
    ADD CONSTRAINT account_unlock_tokens_pkey PRIMARY KEY (unlock_token_id);


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (album_id);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (verification_token_id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (track_id, user_id);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (genre_id);


--
-- Name: listening_history listening_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history
    ADD CONSTRAINT listening_history_pkey PRIMARY KEY (history_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: official_lyrics official_lyrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_lyrics
    ADD CONSTRAINT official_lyrics_pkey PRIMARY KEY (official_lyric_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (reset_token_id);


--
-- Name: personal_lyrics personal_lyrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lyrics
    ADD CONSTRAINT personal_lyrics_pkey PRIMARY KEY (personal_lyric_id);


--
-- Name: playlist_tracks pk_playlist_tracks; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT pk_playlist_tracks PRIMARY KEY (playlist_id, track_id);


--
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (playlist_id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (refresh_token_id);


--
-- Name: staff_roles staff_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_pkey PRIMARY KEY (role_id);


--
-- Name: staffs staffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_pkey PRIMARY KEY (staff_id);


--
-- Name: track_submissions track_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_submissions
    ADD CONSTRAINT track_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (track_id);


--
-- Name: user_profiles uk5vlt12tabpccuckq0e84nhs4c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT uk5vlt12tabpccuckq0e84nhs4c UNIQUE (username);


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: email_verification_tokens ukah12jdrm74nfnmu11x9xxlbex; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT ukah12jdrm74nfnmu11x9xxlbex UNIQUE (token_hash);


--
-- Name: password_reset_tokens ukajre85ybxavf1tt4omkrs5p6g; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT ukajre85ybxavf1tt4omkrs5p6g UNIQUE (token_hash);


--
-- Name: playlists ukbq229u3bbkas0bmcvn265p3b2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT ukbq229u3bbkas0bmcvn265p3b2 UNIQUE (slug);


--
-- Name: genres ukfun8evwjl5g8ps273eipowm7f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT ukfun8evwjl5g8ps273eipowm7f UNIQUE (slug);


--
-- Name: staffs ukikcos5mg2rbdhyg1v5dbyu5is; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT ukikcos5mg2rbdhyg1v5dbyu5is UNIQUE (email);


--
-- Name: official_lyrics ukj81seth96sxlupo9e9jk3rfp9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_lyrics
    ADD CONSTRAINT ukj81seth96sxlupo9e9jk3rfp9 UNIQUE (track_id);


--
-- Name: tracks ukm0wdj2culolvegk3wuc1953kd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT ukm0wdj2culolvegk3wuc1953kd UNIQUE (slug);


--
-- Name: albums uknpxg9602prdf6t9ad77qjwhq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT uknpxg9602prdf6t9ad77qjwhq UNIQUE (slug);


--
-- Name: refresh_tokens uko2mlirhldriil2y7krapq4frt; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT uko2mlirhldriil2y7krapq4frt UNIQUE (token_hash);


--
-- Name: staff_roles ukp4175toby5p4krj9la28k3hce; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT ukp4175toby5p4krj9la28k3hce UNIQUE (code);


--
-- Name: genres ukpe1a9woik1k97l87cieguyhh4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT ukpe1a9woik1k97l87cieguyhh4 UNIQUE (name);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_notifications_staff_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_staff_created ON public.notifications USING btree (staff_id, created_at DESC);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: refresh_tokens fk1lih5y2npsf8u5o3vhdb9y0os; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk1lih5y2npsf8u5o3vhdb9y0os FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: tracks fk7weekvjfll0bifyfyx25to00l; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT fk7weekvjfll0bifyfyx25to00l FOREIGN KEY (genre_id) REFERENCES public.genres(genre_id);


--
-- Name: official_lyrics fkaapwxgur5skqdrnov9ldxgq9o; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_lyrics
    ADD CONSTRAINT fkaapwxgur5skqdrnov9ldxgq9o FOREIGN KEY (created_by_user_id) REFERENCES public.staffs(staff_id);


--
-- Name: staffs fkawutf3mnj24xcfp8gpe33ftpx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT fkawutf3mnj24xcfp8gpe33ftpx FOREIGN KEY (role_id) REFERENCES public.staff_roles(role_id);


--
-- Name: account_unlock_tokens fkbi5l81rgcaqd1cva4nk6k9ex5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_unlock_tokens
    ADD CONSTRAINT fkbi5l81rgcaqd1cva4nk6k9ex5 FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: tracks fkdcmijveo7n1lql01vav1u2jd2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT fkdcmijveo7n1lql01vav1u2jd2 FOREIGN KEY (album_id) REFERENCES public.albums(album_id);


--
-- Name: refresh_tokens fkeip8uycx67nectnxmakr56uuy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fkeip8uycx67nectnxmakr56uuy FOREIGN KEY (staff_id) REFERENCES public.staffs(staff_id);


--
-- Name: listening_history fkgl5tks7mr7upg8ao1gtgh8ngl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history
    ADD CONSTRAINT fkgl5tks7mr7upg8ao1gtgh8ngl FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: personal_lyrics fkh84hfpu9xy9ju9f7f5adygbax; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lyrics
    ADD CONSTRAINT fkh84hfpu9xy9ju9f7f5adygbax FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: playlist_tracks fkhjkawu4qwjhxcpveah0pymuct; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT fkhjkawu4qwjhxcpveah0pymuct FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: email_verification_tokens fki1c4mmamlb8keqt74k4lrtwhc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT fki1c4mmamlb8keqt74k4lrtwhc FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: user_profiles fkjcad5nfve11khsnpwj1mv8frj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fkjcad5nfve11khsnpwj1mv8frj FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: password_reset_tokens fkk3ndxg5xp6v7wd4gjyusp15gq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT fkk3ndxg5xp6v7wd4gjyusp15gq FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: favorites fkl95wc4ai7byhyogfs6eb9ah8q; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fkl95wc4ai7byhyogfs6eb9ah8q FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: personal_lyrics fkm4a2d4m7le5sk8d1pja8020jn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lyrics
    ADD CONSTRAINT fkm4a2d4m7le5sk8d1pja8020jn FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: playlist_tracks fkn9g4py06v2tmrisjdvxvjeb7x; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT fkn9g4py06v2tmrisjdvxvjeb7x FOREIGN KEY (playlist_id) REFERENCES public.playlists(playlist_id);


--
-- Name: official_lyrics fkrr6yuyyqw16u7flxk2qn7pne0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_lyrics
    ADD CONSTRAINT fkrr6yuyyqw16u7flxk2qn7pne0 FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: neon_soundwave_pub; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION neon_soundwave_pub FOR ALL TABLES WITH (publish = 'insert, update, delete, truncate');


--
-- Name: neon_to_local_pub; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION neon_to_local_pub FOR ALL TABLES WITH (publish = 'insert, update, delete, truncate');


--
-- PostgreSQL database dump complete
--

\unrestrict BJmEbO2tp4Q2jKF4qxUYH1gFikaayv4OMocu7FUddJXEt5l7OaJtmgCqqbNm06h

