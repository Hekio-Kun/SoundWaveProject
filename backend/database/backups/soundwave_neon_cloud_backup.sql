--
-- PostgreSQL database dump
--

\restrict Ci5FSIy1ODdWNXveqcm6JKPlHYk0smGISkcmrtidDZY3UdlC9qYWbajEbpjAolY

-- Dumped from database version 18.6 (ac70818)
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
DROP INDEX IF EXISTS public.uq_personal_lyrics_user_track_type;
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
ALTER TABLE IF EXISTS ONLY public.content_reports DROP CONSTRAINT IF EXISTS content_reports_pkey;
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
DROP TABLE IF EXISTS public.content_reports;
DROP TABLE IF EXISTS public.albums;
DROP TABLE IF EXISTS public.account_unlock_tokens;
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
    user_id bigint NOT NULL,
    id bigint CONSTRAINT account_unlock_tokens_id_not_null1 NOT NULL
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
-- Name: account_unlock_tokens_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.account_unlock_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.account_unlock_tokens_id_seq1
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
    updated_at timestamp(6) without time zone NOT NULL,
    id bigint CONSTRAINT albums_id_not_null1 NOT NULL
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
-- Name: albums_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.albums ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.albums_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: content_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_reports (
    report_id bigint CONSTRAINT content_reports_id_not_null NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    description character varying(2000),
    reason character varying(100) NOT NULL,
    reporter_id bigint NOT NULL,
    resolved_at timestamp(6) with time zone,
    reviewer_id bigint,
    reviewer_note text,
    status character varying(50) NOT NULL,
    target_id bigint NOT NULL,
    target_type character varying(50) NOT NULL,
    category character varying(50),
    handled_at timestamp(6) with time zone,
    handled_by_user_id bigint,
    resolution_note character varying(2000),
    submitted_by_user_id bigint,
    track_id bigint,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    id bigint CONSTRAINT content_reports_id_not_null1 NOT NULL
);


--
-- Name: content_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.content_reports ALTER COLUMN report_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.content_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: content_reports_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.content_reports ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.content_reports_id_seq1
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
    user_id bigint NOT NULL,
    id bigint CONSTRAINT email_verification_tokens_id_not_null1 NOT NULL
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
-- Name: email_verification_tokens_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.email_verification_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.email_verification_tokens_id_seq1
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
    updated_at timestamp(6) without time zone NOT NULL,
    id bigint CONSTRAINT genres_id_not_null1 NOT NULL
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
-- Name: genres_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.genres ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.genres_id_seq1
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
    user_id bigint NOT NULL,
    id bigint CONSTRAINT listening_history_id_not_null1 NOT NULL
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
-- Name: listening_history_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.listening_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.listening_history_id_seq1
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
    id bigint CONSTRAINT notifications_id_not_null1 NOT NULL,
    CONSTRAINT ck_notifications_type CHECK (((type)::text = ANY ((ARRAY['TRACK_APPROVED'::character varying, 'TRACK_REJECTED'::character varying, 'TRACK_TAKEN_DOWN'::character varying, 'TRACK_SUBMISSION'::character varying, 'REPORT_RESOLVED'::character varying, 'REPORT_REJECTED'::character varying, 'CONTENT_REPORT'::character varying, 'ACCOUNT_STATUS_CHANGED'::character varying, 'ROLE_CHANGED'::character varying, 'SYSTEM'::character varying, 'SYSTEM_NOTICE'::character varying])::text[]))),
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY (ARRAY[('TRACK_APPROVED'::character varying)::text, ('TRACK_REJECTED'::character varying)::text, ('TRACK_SUBMISSION'::character varying)::text, ('CONTENT_REPORT'::character varying)::text, ('SYSTEM_NOTICE'::character varying)::text])))
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
-- Name: notifications_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq1
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
    track_id bigint NOT NULL,
    id bigint CONSTRAINT official_lyrics_id_not_null1 NOT NULL
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
-- Name: official_lyrics_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.official_lyrics ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.official_lyrics_id_seq1
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
    user_id bigint NOT NULL,
    id bigint CONSTRAINT password_reset_tokens_id_not_null1 NOT NULL
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
-- Name: password_reset_tokens_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.password_reset_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.password_reset_tokens_id_seq1
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
    user_id bigint NOT NULL,
    id bigint CONSTRAINT personal_lyrics_id_not_null1 NOT NULL
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
-- Name: personal_lyrics_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.personal_lyrics ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.personal_lyrics_id_seq1
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
    visibility character varying(30) NOT NULL,
    id bigint CONSTRAINT playlists_id_not_null1 NOT NULL
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
-- Name: playlists_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.playlists ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.playlists_id_seq1
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
    user_id bigint,
    id bigint CONSTRAINT refresh_tokens_id_not_null1 NOT NULL
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
-- Name: refresh_tokens_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.refresh_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.refresh_tokens_id_seq1
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
    name character varying(80) NOT NULL,
    id smallint CONSTRAINT staff_roles_id_not_null1 NOT NULL
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
-- Name: staff_roles_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.staff_roles ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.staff_roles_id_seq1
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
    role_id smallint NOT NULL,
    id bigint CONSTRAINT staffs_id_not_null1 NOT NULL
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
-- Name: staffs_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.staffs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.staffs_id_seq1
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
    proposed_lyrics text,
    submission_type character varying(30),
    id bigint CONSTRAINT track_submissions_id_not_null1 NOT NULL,
    CONSTRAINT track_submissions_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('APPROVED'::character varying)::text, ('REJECTED'::character varying)::text]))),
    CONSTRAINT track_submissions_submission_type_check CHECK (((submission_type)::text = ANY ((ARRAY['TRACK_RELEASE'::character varying, 'LYRIC_UPDATE'::character varying])::text[])))
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
-- Name: track_submissions_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.track_submissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.track_submissions_id_seq1
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
    id bigint CONSTRAINT tracks_id_not_null1 NOT NULL,
    CONSTRAINT tracks_publication_status_check CHECK (((publication_status)::text = ANY (ARRAY[('DRAFT'::character varying)::text, ('PENDING'::character varying)::text, ('PUBLISHED'::character varying)::text, ('REJECTED'::character varying)::text, ('TAKEN_DOWN'::character varying)::text])))
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
-- Name: tracks_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.tracks ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tracks_id_seq1
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
    id bigint CONSTRAINT users_id_not_null1 NOT NULL,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('ACTIVE'::character varying)::text, ('TEMPORARILY_LOCKED'::character varying)::text, ('BANNED'::character varying)::text])))
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
-- Name: users_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq1
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

INSERT INTO public.albums VALUES (2, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', '2026-10-31 11:06:24.331', 2, 'Album đầu tay đình đám của MCK', '2026-10-31 11:06:24.331', '2023-03-02', '99-percent-mck', 'PUBLISHED', '99%', '2026-10-31 11:06:24.331', 1);
INSERT INTO public.albums VALUES (3, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', '2026-10-31 11:06:24.331', 3, 'Album phòng thu đầu tay của rapper HIEUTHUHAI', '2026-10-31 11:06:24.331', '2023-10-16', 'ai-cung-phai-bat-dau-tu-dau-do', 'PUBLISHED', 'Ai Cũng Phải Bắt Đầu Từ Đâu Đó', '2026-10-31 11:06:24.331', 2);
INSERT INTO public.albums VALUES (4, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', '2026-10-31 11:06:24.331', 4, 'Bản ballad da diết của Uyên Linh', '2026-10-31 11:06:24.331', '2021-05-20', 'dai-lo-dong-tay-single', 'PUBLISHED', 'Đại Lộ Đông Tây', '2026-10-31 11:06:24.331', 3);
INSERT INTO public.albums VALUES (5, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', '2026-10-31 11:06:24.331', 8, 'Album EP đầu tay của bộ đôi YOASOBI', '2026-10-31 11:06:24.331', '2021-01-06', 'the-book-yoasobi', 'PUBLISHED', 'THE BOOK', '2026-10-31 11:06:24.331', 4);
INSERT INTO public.albums VALUES (6, 'soundwave/albums/covers/user-2-album-cover-cda05a27-4c5a-457e-8fc7-264295cb7273', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793448041/soundwave/albums/covers/user-2-album-cover-cda05a27-4c5a-457e-8fc7-264295cb7273.jpg', '2026-10-31 05:00:50.498528', 2, 'nhạc hay lắm', NULL, '2026-10-31', 'ai-i-1793448050497', 'PENDING', 'Đại đi', '2026-10-31 05:24:55.939025', 5);
INSERT INTO public.albums VALUES (10, 'soundwave/albums/covers/user-3-album-cover-e9a9da45-8418-4664-bcfc-26efe7965af7', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793464344/soundwave/albums/covers/user-3-album-cover-e9a9da45-8418-4664-bcfc-26efe7965af7.png', '2026-10-31 09:32:32.329927', 3, NULL, '2026-10-31 09:33:51.153088', '2026-10-31', 'jkp-1793464352327', 'REJECTED', 'JKP', '2026-11-07 10:55:38.632327', 6);
INSERT INTO public.albums VALUES (7, 'soundwave/albums/covers/user-2-album-cover-b8c37e9b-072c-4c7c-98b3-115f2c165c02', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793451040/soundwave/albums/covers/user-2-album-cover-b8c37e9b-072c-4c7c-98b3-115f2c165c02.jpg', '2026-10-31 05:50:48.846252', 2, 'nhạc cũng hay á', '2026-10-31 05:52:31.977709', '2026-10-31', 'ai-ai-i-1793451048846', 'PUBLISHED', 'Đại đại đi', '2026-10-31 05:52:32.27799', 7);
INSERT INTO public.albums VALUES (9, 'soundwave/albums/covers/user-3-album-cover-f467812a-5105-45e7-bfa4-2a7b1cc4a3cb', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793458549/soundwave/albums/covers/user-3-album-cover-f467812a-5105-45e7-bfa4-2a7b1cc4a3cb.png', '2026-10-31 07:55:57.231734', 3, NULL, '2026-10-31 07:57:06.49059', '2026-10-31', 'xoay-vong-1793458557217', 'PUBLISHED', 'XOAY VÒNG', '2026-10-31 07:57:06.9884', 8);
INSERT INTO public.albums VALUES (8, 'soundwave/albums/covers/user-3-album-cover-fb822850-c089-400c-9358-b070cb33e4c4', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793458303/soundwave/albums/covers/user-3-album-cover-fb822850-c089-400c-9358-b070cb33e4c4.png', '2026-10-31 07:51:50.503816', 3, NULL, '2026-10-31 07:57:47.699239', '2026-10-31', 'hth-1793458310499', 'PUBLISHED', 'HTH', '2026-10-31 07:57:48.17667', 9);
INSERT INTO public.albums VALUES (1, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', '2026-10-31 11:06:24.331', 1, 'Single phát hành năm 2017 của Sơn Tùng M-TP', '2026-10-31 08:49:32.259661', '2017-02-14', 'noi-nay-co-anh-album', 'PUBLISHED', 'Nơi Này Có Anh', '2026-10-31 08:49:32.584977', 10);


--
-- Data for Name: content_reports; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.content_reports VALUES (1, '2026-11-05 15:36:27.484401+00', 'The track title and artist name do not match the actual performer in the audio file. It appears to be an unofficial cover.', 'Misleading Metadata / Impersonation', 1, '2026-11-05 16:56:42.773412+00', 2, 'None', 'DISMISSED', 1, 'TRACK', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 13:19:45.697432+00', 1);
INSERT INTO public.content_reports VALUES (8, '2026-11-04 17:14:27.074762+00', NULL, 'Copyright Infringement', 3, NULL, NULL, NULL, 'RESOLVED', 5, 'TRACK', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 13:19:45.697432+00', 2);
INSERT INTO public.content_reports VALUES (2, '2026-11-05 16:59:27.074762+00', NULL, 'Copyright Infringement', 2, '2026-11-05 17:17:03.611418+00', 2, 'No resolution note provided.', 'RESOLVED', 1, 'TRACK', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-06 13:19:45.697432+00', 3);
INSERT INTO public.content_reports VALUES (11, '2026-11-07 14:34:07.82781+00', 'Copyright Infringement - Unauthorized music distribution, sampled without permission, or intellectual property violation.', 'Copyright Infringement', 6, '2026-11-07 14:39:43.785357+00', 2, 'Nannn', 'RESOLVED', 4, 'TRACK', 'COPYRIGHT', NULL, NULL, NULL, 6, 4, '2026-11-07 14:39:44.16588+00', 4);
INSERT INTO public.content_reports VALUES (10, '2026-11-07 14:32:31.605421+00', 'Copyright Infringement - Unauthorized music distribution, sampled without permission, or intellectual property violation.', 'Copyright Infringement', 3, '2026-11-07 14:39:43.785357+00', 2, 'Nannn', 'RESOLVED', 4, 'TRACK', 'COPYRIGHT', NULL, NULL, NULL, 3, 4, '2026-11-07 14:39:44.200605+00', 5);
INSERT INTO public.content_reports VALUES (12, '2026-11-07 14:47:06.269139+00', 'Inappropriate or Offensive Content - Contains hate speech, gratuitous violence, harassment, or sexually explicit material.', 'Inappropriate or Offensive Content', 6, '2026-11-07 14:47:39.722994+00', 2, 'Inappropriate or Offensive Content', 'RESOLVED', 8, 'TRACK', 'INAPPROPRIATE_CONTENT', NULL, NULL, NULL, 6, 8, '2026-11-07 14:47:40.224062+00', 6);
INSERT INTO public.content_reports VALUES (6, '2026-11-05 15:44:27.074762+00', NULL, 'Spam or Damaged Audio', 1, '2026-11-07 14:54:25.076771+00', 2, 'nsk e', 'RESOLVED', 3, 'TRACK', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-07 14:54:25.481478+00', 7);
INSERT INTO public.content_reports VALUES (5, '2026-11-05 15:14:27.074762+00', NULL, 'Spam or Damaged Audio', 5, '2026-11-07 14:54:25.076771+00', 2, 'nsk e', 'RESOLVED', 3, 'TRACK', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-07 14:54:25.521003+00', 8);
INSERT INTO public.content_reports VALUES (13, '2026-11-07 15:07:05.40699+00', 'Inappropriate or Offensive Content - Contains hate speech, gratuitous violence, harassment, or sexually explicit material.', 'Inappropriate or Offensive Content', 6, '2026-11-07 15:17:20.334363+00', 2, 'mx', 'DISMISSED', 19, 'TRACK', 'INAPPROPRIATE_CONTENT', NULL, NULL, NULL, 6, 19, '2026-11-07 15:17:20.841594+00', 9);
INSERT INTO public.content_reports VALUES (3, '2026-11-05 17:04:27.074762+00', NULL, 'Copyright Infringement', 3, '2026-11-07 15:34:26.719995+00', 2, 'HDnm', 'DISMISSED', 1, 'TRACK', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-07 15:34:27.550994+00', 10);
INSERT INTO public.content_reports VALUES (14, '2026-11-07 15:35:00.973304+00', 'Spam or Damaged Audio - Audio stream is distorted, broken, repetitive commercial spam, or silent.', 'Spam or Damaged Audio', 6, '2026-11-07 15:35:40.164108+00', 2, 'Dêtlee', 'RESOLVED', 19, 'TRACK', 'OTHER', NULL, NULL, NULL, 6, 19, '2026-11-07 15:35:40.454332+00', 11);
INSERT INTO public.content_reports VALUES (15, '2026-11-07 17:54:51.573163+00', 'Inappropriate or Offensive Content - Contains hate speech, gratuitous violence, harassment, or sexually explicit material.', 'Inappropriate or Offensive Content', 3, '2026-11-07 17:55:22.965406+00', 2, 'mmhdd', 'RESOLVED', 21, 'TRACK', 'INAPPROPRIATE_CONTENT', NULL, NULL, NULL, 3, 21, '2026-11-07 17:55:23.320684+00', 12);
INSERT INTO public.content_reports VALUES (16, '2026-11-09 02:10:23.094063+00', 'Inappropriate or Offensive Content - Contains hate speech, gratuitous violence, harassment, or sexually explicit material.', 'Inappropriate or Offensive Content', 2, '2026-11-09 02:12:29.364764+00', 2, 'tessst', 'RESOLVED', 3, 'TRACK', 'INAPPROPRIATE_CONTENT', NULL, NULL, NULL, 2, 3, '2026-11-09 02:12:29.611393+00', 13);
INSERT INTO public.content_reports VALUES (18, '2026-11-09 02:45:25.923985+00', 'Inappropriate or Offensive Content - Contains hate speech, gratuitous violence, harassment, or sexually explicit material.', 'Inappropriate or Offensive Content', 2, '2026-11-09 02:48:06.28677+00', 2, 'abc', 'RESOLVED', 2, 'TRACK', 'INAPPROPRIATE_CONTENT', NULL, NULL, NULL, 2, 2, '2026-11-09 02:48:07.234866+00', 14);
INSERT INTO public.content_reports VALUES (4, '2026-11-05 16:14:27.074762+00', NULL, 'Inappropriate or Offensive Content', 4, '2026-11-09 02:48:06.28677+00', 2, 'abc', 'RESOLVED', 2, 'TRACK', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-09 02:48:07.305826+00', 15);
INSERT INTO public.content_reports VALUES (20, '2026-11-09 02:50:01.437952+00', 'Spam or Damaged Audio - Audio stream is distorted, broken, repetitive commercial spam, or silent.', 'Spam or Damaged Audio', 3, '2026-11-09 02:54:39.071258+00', 2, 'abc', 'RESOLVED', 15, 'TRACK', 'OTHER', NULL, NULL, NULL, 3, 15, '2026-11-09 02:54:39.401371+00', 16);
INSERT INTO public.content_reports VALUES (19, '2026-11-09 02:49:33.64967+00', 'Copyright Infringement - Unauthorized music distribution, sampled without permission, or intellectual property violation.', 'Copyright Infringement', 3, '2026-11-09 09:58:00.69093+00', 2, 'abcxyz', 'DISMISSED', 1, 'TRACK', 'COPYRIGHT', NULL, NULL, NULL, 3, 1, '2026-11-09 09:58:01.306652+00', 17);
INSERT INTO public.content_reports VALUES (21, '2026-11-09 09:50:03.506937+00', 'Copyright Infringement - Unauthorized music distribution, sampled without permission, or intellectual property violation.', 'Copyright Infringement', 13, '2026-11-09 09:58:26.598002+00', 2, 'abc xyz', 'RESOLVED', 16, 'TRACK', 'COPYRIGHT', NULL, NULL, NULL, 13, 16, '2026-11-09 09:58:26.943273+00', 18);


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.email_verification_tokens VALUES (1, '2026-11-07 06:04:45.879487', '2026-11-07 06:14:45.877599', '$2a$10$szFp7agEjv3JyNu8K5V5ZOkeHIoRxXEbWDX0BIGBQAy.yKwMYbYqG', '2026-11-07 06:05:19.88692', 11, 1);
INSERT INTO public.email_verification_tokens VALUES (2, '2026-11-07 06:34:43.995628', '2026-11-07 06:44:43.995628', '$2a$10$MuSEuPe0sX9RpEDnx0Af0ejdKpqD/TsEswfCMXTsILafn/a9cKjJ6', '2026-11-07 06:35:19.675426', 12, 2);
INSERT INTO public.email_verification_tokens VALUES (3, '2026-11-09 01:54:38.241412', '2026-11-09 02:04:38.241412', '$2a$10$qY1d7UV74UI7jEqOgOIfMupEnLfT9iz/zcUNwqbpmiWRTvXbxyU4C', '2026-11-09 01:58:45.111694', 13, 3);


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.favorites VALUES (1, 2, '2026-10-31 07:12:17.424148');
INSERT INTO public.favorites VALUES (8, 2, '2026-10-31 07:12:18.743975');
INSERT INTO public.favorites VALUES (7, 2, '2026-10-31 07:12:19.694644');
INSERT INTO public.favorites VALUES (3, 2, '2026-10-31 07:12:21.312033');
INSERT INTO public.favorites VALUES (4, 2, '2026-10-31 07:12:23.237003');
INSERT INTO public.favorites VALUES (2, 2, '2026-11-08 21:27:20.452192');
INSERT INTO public.favorites VALUES (1, 13, '2026-11-09 02:21:26.26581');
INSERT INTO public.favorites VALUES (7, 13, '2026-11-09 02:22:05.145689');
INSERT INTO public.favorites VALUES (3, 13, '2026-11-09 02:22:05.669613');
INSERT INTO public.favorites VALUES (6, 13, '2026-11-09 02:22:06.942142');
INSERT INTO public.favorites VALUES (2, 13, '2026-11-09 02:22:07.44453');
INSERT INTO public.favorites VALUES (5, 13, '2026-11-09 02:22:08.395452');


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.genres VALUES (1, '2026-10-31 11:06:24.331', NULL, 'Giai điệu bắt tai, phổ biến rộng rãi.', true, 'Pop', 'pop', '2026-10-31 11:06:24.331', 1);
INSERT INTO public.genres VALUES (2, '2026-10-31 11:06:24.331', NULL, 'Những bản tình ca nhẹ nhàng, sâu lắng.', true, 'Ballad', 'ballad', '2026-10-31 11:06:24.331', 2);
INSERT INTO public.genres VALUES (3, '2026-10-31 11:06:24.331', NULL, 'Nhịp điệu sôi động, ca từ cá tính.', true, 'Rap / Hip-Hop', 'rap-hip-hop', '2026-10-31 11:06:24.331', 3);
INSERT INTO public.genres VALUES (4, '2026-10-31 11:06:24.331', NULL, 'Rhythm and Blues mượt mà, cảm xúc.', true, 'R&B', 'rnb', '2026-10-31 11:06:24.331', 4);
INSERT INTO public.genres VALUES (5, '2026-10-31 11:06:24.331', NULL, 'Âm nhạc độc lập tự do sáng tạo.', true, 'Indie', 'indie', '2026-10-31 11:06:24.331', 5);
INSERT INTO public.genres VALUES (6, '2026-10-31 11:06:24.331', NULL, 'Âm hưởng mộc mạc của nhạc cụ tự nhiên.', true, 'Acoustic', 'acoustic', '2026-10-31 11:06:24.331', 6);
INSERT INTO public.genres VALUES (7, '2026-10-31 11:06:24.331', NULL, 'Nhạc điện tử sôi động cho lễ hội và bữa tiệc.', true, 'EDM', 'edm', '2026-10-31 11:06:24.331', 7);
INSERT INTO public.genres VALUES (8, '2026-10-31 11:06:24.331', NULL, 'Giai điệu êm dịu, thư giãn tập trung.', true, 'Lo-fi', 'lo-fi', '2026-10-31 11:06:24.331', 8);


--
-- Data for Name: listening_history; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.listening_history VALUES (1, false, 0, '2026-11-08 19:49:06.810149', 1, 1, 1);
INSERT INTO public.listening_history VALUES (44, false, 0, '2026-11-09 02:33:29.411123', 5, 13, 2);
INSERT INTO public.listening_history VALUES (28, false, 0, '2026-11-08 19:49:19.719364', 1, 3, 3);
INSERT INTO public.listening_history VALUES (33, false, 0, '2026-11-08 19:49:45.189729', 15, 3, 4);
INSERT INTO public.listening_history VALUES (23, false, 0, '2026-11-07 07:32:19.65872', 4, 3, 5);
INSERT INTO public.listening_history VALUES (24, false, 0, '2026-11-07 07:34:02.32143', 4, 6, 6);
INSERT INTO public.listening_history VALUES (25, false, 0, '2026-11-07 07:46:57.355926', 8, 6, 7);
INSERT INTO public.listening_history VALUES (38, false, 0, '2026-11-09 02:42:34.191749', 5, 2, 8);
INSERT INTO public.listening_history VALUES (2, false, 0, '2026-10-31 08:06:51.745644', 8, 1, 9);
INSERT INTO public.listening_history VALUES (26, false, 0, '2026-11-07 07:56:23.230145', 1, 6, 10);
INSERT INTO public.listening_history VALUES (27, false, 0, '2026-11-07 08:06:56.050083', 19, 6, 11);
INSERT INTO public.listening_history VALUES (34, false, 0, '2026-11-09 02:46:59.739856', 16, 2, 12);
INSERT INTO public.listening_history VALUES (22, false, 0, '2026-11-08 19:56:12.729819', 1, 11, 13);
INSERT INTO public.listening_history VALUES (45, false, 0, '2026-11-09 02:50:33.095699', 16, 13, 14);
INSERT INTO public.listening_history VALUES (8, false, 0, '2026-11-07 06:59:53.371267', 4, 2, 15);
INSERT INTO public.listening_history VALUES (5, false, 0, '2026-11-07 06:59:55.634168', 8, 2, 16);
INSERT INTO public.listening_history VALUES (15, false, 0, '2026-11-03 18:34:40.719161', 2, 1, 17);
INSERT INTO public.listening_history VALUES (18, false, 0, '2026-11-07 05:53:28.8297', 4, 1, 18);
INSERT INTO public.listening_history VALUES (19, false, 0, '2026-11-07 05:57:17.484865', 6, 1, 19);
INSERT INTO public.listening_history VALUES (35, false, 0, '2026-11-08 20:33:39.343245', 14, 2, 20);
INSERT INTO public.listening_history VALUES (4, false, 0, '2026-11-08 20:33:39.834951', 11, 2, 21);
INSERT INTO public.listening_history VALUES (36, false, 0, '2026-11-08 20:33:40.756152', 9, 2, 22);
INSERT INTO public.listening_history VALUES (3, false, 0, '2026-11-08 21:26:13.127857', 1, 2, 23);
INSERT INTO public.listening_history VALUES (6, false, 0, '2026-11-08 21:26:15.279193', 7, 2, 24);
INSERT INTO public.listening_history VALUES (32, false, 0, '2026-11-07 10:54:46.368677', 21, 3, 25);
INSERT INTO public.listening_history VALUES (31, false, 0, '2026-11-07 11:01:53.797304', 7, 3, 26);
INSERT INTO public.listening_history VALUES (37, false, 0, '2026-11-08 21:27:19.443159', 6, 2, 27);
INSERT INTO public.listening_history VALUES (17, false, 0, '2026-11-08 21:27:21.570132', 2, 2, 28);
INSERT INTO public.listening_history VALUES (16, false, 0, '2026-11-07 11:14:22.610467', 3, 1, 29);
INSERT INTO public.listening_history VALUES (29, false, 0, '2026-11-07 11:18:02.511324', 2, 3, 30);
INSERT INTO public.listening_history VALUES (7, false, 0, '2026-11-08 23:54:46.942255', 3, 2, 31);
INSERT INTO public.listening_history VALUES (20, false, 0, '2026-11-07 11:21:24.446867', 3, 3, 32);
INSERT INTO public.listening_history VALUES (30, false, 0, '2026-11-07 11:29:43.769939', 5, 3, 33);
INSERT INTO public.listening_history VALUES (21, false, 0, '2026-11-07 11:29:44.220039', 6, 3, 34);
INSERT INTO public.listening_history VALUES (40, false, 0, '2026-11-09 02:22:05.569687', 7, 13, 35);
INSERT INTO public.listening_history VALUES (42, false, 0, '2026-11-09 02:22:07.403611', 6, 13, 36);
INSERT INTO public.listening_history VALUES (43, false, 0, '2026-11-09 02:22:08.127049', 2, 13, 37);
INSERT INTO public.listening_history VALUES (41, false, 0, '2026-11-09 02:26:20.522617', 3, 13, 38);
INSERT INTO public.listening_history VALUES (39, false, 0, '2026-11-09 02:27:13.792381', 1, 13, 39);


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notifications VALUES (3, 2, '2026-10-31 12:52:32.171006+00', true, 'Your track "RainDance" has been approved and is now available in the public catalog.', '11', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 2, 1);
INSERT INTO public.notifications VALUES (2, 2, '2026-10-31 12:26:40.866236+00', true, '"Back to friends" needs revision: Audio file corrupted or encoding does not meet platform standards.', '10', 'TRACK', NULL, 'Revision requested', 'TRACK_REJECTED', 2, 2);
INSERT INTO public.notifications VALUES (1, 2, '2026-10-31 12:25:24.922197+00', true, 'Your track "Raindacnce" has been approved and is now available in the public catalog.', '9', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 2, 3);
INSERT INTO public.notifications VALUES (4, 2, '2026-10-31 13:52:53.017928+00', false, 'Track "Blue" has been submitted for moderation.', '19', 'SUBMISSION', 1, 'New submission for review', 'TRACK_SUBMISSION', NULL, 4);
INSERT INTO public.notifications VALUES (6, 2, '2026-10-31 13:53:06.075246+00', false, 'Track "In Love" has been submitted for moderation.', '20', 'SUBMISSION', 1, 'New submission for review', 'TRACK_SUBMISSION', NULL, 5);
INSERT INTO public.notifications VALUES (9, 3, '2026-10-31 13:54:04.801253+00', false, 'Track "SECRET" has been submitted for moderation.', '21', 'SUBMISSION', 1, 'New submission for review', 'TRACK_SUBMISSION', NULL, 6);
INSERT INTO public.notifications VALUES (12, 2, '2026-10-31 14:05:23.859101+00', false, 'Your track "SECRET" has been approved and is now available in the public catalog.', '15', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 3, 7);
INSERT INTO public.notifications VALUES (13, 2, '2026-10-31 14:52:41.041062+00', false, 'Your track "Thế Giới Của Anh" has been approved and is now available in the public catalog.', '17', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 3, 8);
INSERT INTO public.notifications VALUES (14, 2, '2026-10-31 14:56:30.526119+00', false, 'Your track "LAVIEM" in album "XOAY VÒNG" has been approved. It will be published once all tracks in the album are reviewed.', '19', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 3, 9);
INSERT INTO public.notifications VALUES (15, 2, '2026-10-31 14:57:06.853298+00', false, 'All tracks in album "XOAY VÒNG" have been reviewed. 1 track(s) have been approved and published to the public catalog.', '9', 'ALBUM', NULL, 'Album published', 'TRACK_APPROVED', 3, 10);
INSERT INTO public.notifications VALUES (16, 2, '2026-10-31 14:57:06.900302+00', false, '"SECRET" needs revision: Unlicensed sample, beat, or suspected copyright infringement.', '20', 'TRACK', NULL, 'Revision requested', 'TRACK_REJECTED', 3, 11);
INSERT INTO public.notifications VALUES (17, 2, '2026-10-31 14:57:48.044523+00', false, 'All tracks in album "HTH" have been reviewed. 1 track(s) have been approved and published to the public catalog.', '8', 'ALBUM', NULL, 'Album published', 'TRACK_APPROVED', 3, 12);
INSERT INTO public.notifications VALUES (18, 2, '2026-10-31 14:57:48.089098+00', false, '"TOP1" needs revision: Audio file corrupted or encoding does not meet platform standards.', '18', 'TRACK', NULL, 'Revision requested', 'TRACK_REJECTED', 3, 13);
INSERT INTO public.notifications VALUES (11, 2, '2026-10-31 14:05:08.033523+00', true, 'Your track "Blue" has been approved and is now available in the public catalog.', '16', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 2, 14);
INSERT INTO public.notifications VALUES (8, 2, '2026-10-31 13:53:38.734662+00', true, 'Your track "In Love" has been approved and is now available in the public catalog.', '14', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 2, 15);
INSERT INTO public.notifications VALUES (19, 1, '2026-10-31 15:17:14.709168+00', false, 'Track "Nơi Này Có Anh" has been updated and queued for re-moderation.', '26', 'SUBMISSION', 1, 'Track re-moderation required', 'TRACK_SUBMISSION', NULL, 16);
INSERT INTO public.notifications VALUES (23, 1, '2026-10-31 15:52:33.778016+00', true, 'Creator submitted updated lyrics for published track Nơi Này Có Anh.', '27', 'TRACK_SUBMISSION', NULL, 'Lyric Update Submitted', 'TRACK_SUBMISSION', 2, 17);
INSERT INTO public.notifications VALUES (25, 2, '2026-10-31 16:33:17.963361+00', false, 'Your track "HKTO" in album "JKP" has been approved. It will be published once all tracks in the album are reviewed.', '21', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 3, 18);
INSERT INTO public.notifications VALUES (26, 2, '2026-10-31 16:33:51.495729+00', false, 'All tracks in album "JKP" have been reviewed. 1 track(s) have been approved and published to the public catalog.', '10', 'ALBUM', NULL, 'Album published', 'TRACK_APPROVED', 3, 19);
INSERT INTO public.notifications VALUES (27, 2, '2026-10-31 16:33:51.546981+00', false, '"UITO" needs revision: Audio file corrupted or encoding does not meet platform standards.', '22', 'TRACK', NULL, 'Revision requested', 'TRACK_REJECTED', 3, 20);
INSERT INTO public.notifications VALUES (28, 3, '2026-11-02 03:18:40.605878+00', false, 'Track "LAVIEM" has been submitted for moderation.', '30', 'SUBMISSION', 1, 'New submission for review', 'TRACK_SUBMISSION', NULL, 21);
INSERT INTO public.notifications VALUES (32, 3, '2026-11-05 17:34:45.04954+00', false, 'Track "TOP 1" has been submitted for moderation.', '31', 'SUBMISSION', 5, 'New submission for review', 'TRACK_SUBMISSION', NULL, 22);
INSERT INTO public.notifications VALUES (35, 1, '2026-11-07 09:34:49.137533+00', false, 'Creator submitted updated lyrics for published track Nơi Này Có Anh.', '32', 'TRACK_SUBMISSION', NULL, 'Lyric Update Submitted', 'TRACK_SUBMISSION', 5, 23);
INSERT INTO public.notifications VALUES (39, 1, '2026-11-07 10:33:48.30848+00', false, 'Creator submitted updated lyrics for published track Nơi Này Có Anh.', '33', 'TRACK_SUBMISSION', NULL, 'Lyric Update Submitted', 'TRACK_SUBMISSION', 5, 24);
INSERT INTO public.notifications VALUES (5, 2, '2026-10-31 13:52:53.062063+00', true, 'Track "Blue" has been submitted for moderation.', '19', 'SUBMISSION', 2, 'New submission for review', 'TRACK_SUBMISSION', NULL, 25);
INSERT INTO public.notifications VALUES (7, 2, '2026-10-31 13:53:06.120112+00', true, 'Track "In Love" has been submitted for moderation.', '20', 'SUBMISSION', 2, 'New submission for review', 'TRACK_SUBMISSION', NULL, 26);
INSERT INTO public.notifications VALUES (10, 3, '2026-10-31 13:54:04.843738+00', true, 'Track "SECRET" has been submitted for moderation.', '21', 'SUBMISSION', 2, 'New submission for review', 'TRACK_SUBMISSION', NULL, 27);
INSERT INTO public.notifications VALUES (20, 1, '2026-10-31 15:17:14.739178+00', true, 'Track "Nơi Này Có Anh" has been updated and queued for re-moderation.', '26', 'SUBMISSION', 2, 'Track re-moderation required', 'TRACK_SUBMISSION', NULL, 28);
INSERT INTO public.notifications VALUES (29, 3, '2026-11-02 03:18:40.649328+00', true, 'Track "LAVIEM" has been submitted for moderation.', '30', 'SUBMISSION', 2, 'New submission for review', 'TRACK_SUBMISSION', NULL, 29);
INSERT INTO public.notifications VALUES (34, 3, '2026-11-05 17:34:45.193732+00', true, 'Track "TOP 1" has been submitted for moderation.', '31', 'SUBMISSION', 2, 'New submission for review', 'TRACK_SUBMISSION', NULL, 30);
INSERT INTO public.notifications VALUES (31, 2, '2026-11-05 17:17:03.614426+00', true, 'Violation confirmed: No resolution note provided.', '1', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 2, 31);
INSERT INTO public.notifications VALUES (36, 1, '2026-11-07 09:34:49.447075+00', true, 'Creator submitted updated lyrics for published track Nơi Này Có Anh.', '32', 'TRACK_SUBMISSION', NULL, 'Lyric Update Submitted', 'TRACK_SUBMISSION', 2, 32);
INSERT INTO public.notifications VALUES (41, 1, '2026-11-07 10:33:48.420188+00', true, 'Creator submitted updated lyrics for published track Nơi Này Có Anh.', '33', 'TRACK_SUBMISSION', NULL, 'Lyric Update Submitted', 'TRACK_SUBMISSION', 2, 33);
INSERT INTO public.notifications VALUES (33, 3, '2026-11-05 17:34:45.12179+00', true, 'Track "TOP 1" has been submitted for moderation.', '31', 'SUBMISSION', 1, 'New submission for review', 'TRACK_SUBMISSION', NULL, 34);
INSERT INTO public.notifications VALUES (42, 2, '2026-11-07 10:34:33.868854+00', true, 'Your lyric update for "Nơi Này Có Anh" has been approved and is now live!', '1', 'TRACK', NULL, 'Official Lyric Approved', 'TRACK_APPROVED', 1, 35);
INSERT INTO public.notifications VALUES (40, 1, '2026-11-07 10:33:48.363699+00', true, 'Creator submitted updated lyrics for published track Nơi Này Có Anh.', '33', 'TRACK_SUBMISSION', NULL, 'Lyric Update Submitted', 'TRACK_SUBMISSION', 1, 36);
INSERT INTO public.notifications VALUES (38, 2, '2026-11-07 09:36:46.903741+00', true, 'Your lyric update for "Nơi Này Có Anh" has been approved and is now live!', '1', 'TRACK', NULL, 'Official Lyric Approved', 'TRACK_APPROVED', 1, 37);
INSERT INTO public.notifications VALUES (37, 1, '2026-11-07 09:34:49.699392+00', true, 'Creator submitted updated lyrics for published track Nơi Này Có Anh.', '32', 'TRACK_SUBMISSION', NULL, 'Lyric Update Submitted', 'TRACK_SUBMISSION', 1, 38);
INSERT INTO public.notifications VALUES (30, 2, '2026-11-05 16:56:42.783428+00', true, 'Report dismissed: None', '1', 'TRACK', NULL, 'Content Report Dismissed', 'CONTENT_REPORT', 1, 39);
INSERT INTO public.notifications VALUES (24, 2, '2026-10-31 15:53:59.5913+00', true, 'Your lyric update for "Nơi Này Có Anh" has been approved and is now live!', '1', 'TRACK', NULL, 'Official Lyric Approved', 'TRACK_APPROVED', 1, 40);
INSERT INTO public.notifications VALUES (22, 1, '2026-10-31 15:52:33.734074+00', true, 'Creator submitted updated lyrics for published track Nơi Này Có Anh.', '27', 'TRACK_SUBMISSION', NULL, 'Lyric Update Submitted', 'TRACK_SUBMISSION', 1, 41);
INSERT INTO public.notifications VALUES (21, 2, '2026-10-31 15:49:32.481342+00', true, 'Your track "Nơi Này Có Anh" has been approved and is now available in the public catalog.', '1', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 1, 42);
INSERT INTO public.notifications VALUES (43, 2, '2026-11-07 14:39:43.843515+00', false, 'Violation confirmed: Nannn', '4', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 3, 43);
INSERT INTO public.notifications VALUES (44, 2, '2026-11-07 14:39:43.87855+00', false, 'Violation confirmed: Nannn', '4', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 6, 44);
INSERT INTO public.notifications VALUES (45, 2, '2026-11-07 14:44:15.886536+00', false, '"Giữa Đại Lộ Đông Tây" has been taken down: Copyright Infringement ne', '4', 'TRACK', NULL, 'Track taken down', 'TRACK_REJECTED', 4, 45);
INSERT INTO public.notifications VALUES (46, 2, '2026-11-07 14:47:39.785537+00', false, 'Violation confirmed: Inappropriate or Offensive Content', '8', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 6, 46);
INSERT INTO public.notifications VALUES (47, 2, '2026-11-07 14:47:48.109239+00', false, '"Yoru ni Kakeru (夜に駆ける)" has been taken down: Inappropriate or Offensive Content', '8', 'TRACK', NULL, 'Track taken down', 'TRACK_REJECTED', 8, 47);
INSERT INTO public.notifications VALUES (48, 2, '2026-11-07 14:54:25.121332+00', false, 'Violation confirmed: nsk e', '3', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 5, 48);
INSERT INTO public.notifications VALUES (50, 2, '2026-11-07 15:05:44.227186+00', false, 'Violation confirmed: ddd', '3', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 3, 49);
INSERT INTO public.notifications VALUES (51, 2, '2026-11-07 15:17:20.378542+00', false, 'Report dismissed: mx', '19', 'TRACK', NULL, 'Content Report Dismissed', 'CONTENT_REPORT', 6, 50);
INSERT INTO public.notifications VALUES (52, 2, '2026-11-07 15:34:26.967495+00', false, 'Report dismissed: HDnm', '1', 'TRACK', NULL, 'Content Report Dismissed', 'CONTENT_REPORT', 3, 51);
INSERT INTO public.notifications VALUES (53, 2, '2026-11-07 15:35:40.220812+00', false, 'Violation confirmed: Dêtlee', '19', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 6, 52);
INSERT INTO public.notifications VALUES (54, 2, '2026-11-07 15:35:56.120571+00', false, '"LAVIEM" has been taken down: Gididn', '19', 'TRACK', NULL, 'Track taken down', 'TRACK_REJECTED', 3, 53);
INSERT INTO public.notifications VALUES (55, 2, '2026-11-07 16:25:35.338668+00', false, 'Track "test" has been submitted for moderation.', '34', 'SUBMISSION', 1, 'New submission for review', 'TRACK_SUBMISSION', NULL, 54);
INSERT INTO public.notifications VALUES (56, 2, '2026-11-07 16:25:35.377981+00', false, 'Track "test" has been submitted for moderation.', '34', 'SUBMISSION', 5, 'New submission for review', 'TRACK_SUBMISSION', NULL, 55);
INSERT INTO public.notifications VALUES (58, 2, '2026-11-07 16:43:26.223298+00', false, 'Track "test" has been submitted for moderation.', '35', 'SUBMISSION', 1, 'New submission for review', 'TRACK_SUBMISSION', NULL, 56);
INSERT INTO public.notifications VALUES (59, 2, '2026-11-07 16:43:26.259594+00', false, 'Track "test" has been submitted for moderation.', '35', 'SUBMISSION', 5, 'New submission for review', 'TRACK_SUBMISSION', NULL, 57);
INSERT INTO public.notifications VALUES (62, 3, '2026-11-07 16:52:00.445277+00', false, 'Track "TOP1" has been submitted for moderation.', '36', 'SUBMISSION', 5, 'New submission for review', 'TRACK_SUBMISSION', NULL, 58);
INSERT INTO public.notifications VALUES (49, 2, '2026-11-07 14:54:25.164435+00', true, 'Violation confirmed: nsk e', '3', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 1, 59);
INSERT INTO public.notifications VALUES (64, 2, '2026-11-07 17:55:23.030471+00', false, 'Violation confirmed: mmhdd', '21', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 3, 60);
INSERT INTO public.notifications VALUES (65, 2, '2026-11-07 17:55:38.473326+00', false, 'Album "JKP" has been taken down because its remaining published track was removed.', '10', 'ALBUM', NULL, 'Album taken down', 'TRACK_REJECTED', 3, 61);
INSERT INTO public.notifications VALUES (66, 2, '2026-11-07 17:55:38.561131+00', false, '"HKTO" has been taken down: Don''t', '21', 'TRACK', NULL, 'Track taken down', 'TRACK_REJECTED', 3, 62);
INSERT INTO public.notifications VALUES (68, 2, '2026-11-09 02:48:06.35762+00', false, 'Violation confirmed: abc', '2', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 4, 63);
INSERT INTO public.notifications VALUES (71, 2, '2026-11-09 02:54:39.112987+00', false, 'Violation confirmed: abc', '15', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 3, 64);
INSERT INTO public.notifications VALUES (72, 2, '2026-11-09 02:54:57.298084+00', false, '"SECRET" has been taken down: abc', '15', 'TRACK', NULL, 'Track taken down', 'TRACK_REJECTED', 3, 65);
INSERT INTO public.notifications VALUES (67, 2, '2026-11-09 02:12:29.402167+00', true, 'Violation confirmed: tessst', '3', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 2, 66);
INSERT INTO public.notifications VALUES (69, 2, '2026-11-09 02:48:06.697599+00', true, 'Violation confirmed: abc', '2', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 2, 67);
INSERT INTO public.notifications VALUES (70, 2, '2026-11-09 02:48:32.712893+00', true, 'Report dismissed: abc', '3', 'TRACK', NULL, 'Content Report Dismissed', 'CONTENT_REPORT', 2, 68);
INSERT INTO public.notifications VALUES (73, 2, '2026-11-09 09:55:16.751233+00', false, 'Your track "LAVIEM" has been approved and is now available in the public catalog.', '23', 'TRACK', NULL, 'Track approved', 'TRACK_APPROVED', 3, 69);
INSERT INTO public.notifications VALUES (74, 2, '2026-11-09 09:56:25.765975+00', false, '"TOP 1" needs revision: Incomplete or placeholder metadata (title, artist or artwork).', '24', 'TRACK', NULL, 'Revision requested', 'TRACK_REJECTED', 3, 70);
INSERT INTO public.notifications VALUES (75, 2, '2026-11-09 09:58:00.759943+00', false, 'Report dismissed: abcxyz', '1', 'TRACK', NULL, 'Content Report Dismissed', 'CONTENT_REPORT', 3, 71);
INSERT INTO public.notifications VALUES (76, 2, '2026-11-09 09:58:26.685766+00', false, 'Violation confirmed: abc xyz', '16', 'TRACK', NULL, 'Content Report Resolved', 'CONTENT_REPORT', 13, 72);
INSERT INTO public.notifications VALUES (61, 3, '2026-11-07 16:52:00.402432+00', true, 'Track "TOP1" has been submitted for moderation.', '36', 'SUBMISSION', 1, 'New submission for review', 'TRACK_SUBMISSION', NULL, 73);
INSERT INTO public.notifications VALUES (63, 3, '2026-11-07 16:52:00.493771+00', true, 'Track "TOP1" has been submitted for moderation.', '36', 'SUBMISSION', 2, 'New submission for review', 'TRACK_SUBMISSION', NULL, 74);
INSERT INTO public.notifications VALUES (57, 2, '2026-11-07 16:25:35.409972+00', true, 'Track "test" has been submitted for moderation.', '34', 'SUBMISSION', 2, 'New submission for review', 'TRACK_SUBMISSION', NULL, 75);
INSERT INTO public.notifications VALUES (60, 2, '2026-11-07 16:43:26.292784+00', true, 'Track "test" has been submitted for moderation.', '35', 'SUBMISSION', 2, 'New submission for review', 'TRACK_SUBMISSION', NULL, 76);


--
-- Data for Name: official_lyrics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.official_lyrics VALUES (2, '2026-10-31 11:06:24.331+00', '[00:00.00]Baby em là một giấc mơ
[00:12.00]Mà anh không thể nào chạm tới...
[00:25.00]Khi màn đêm buông xuống nơi đây
[00:38.00]Chỉ còn nỗi nhớ đong đầy.', 'PUBLISHED', '2026-10-31 11:06:24.331+00', 2, 2, 1);
INSERT INTO public.official_lyrics VALUES (3, '2026-10-31 11:06:24.331+00', '[00:00.00]Em tìm lối ra nơi bảng exit sign
[00:14.00]Để lại con tim anh vỡ tan trong đêm dài...
[00:28.00]Liệu có cơ hội nào cho đôi ta bắt đầu lại?', 'PUBLISHED', '2026-10-31 11:06:24.331+00', 2, 3, 2);
INSERT INTO public.official_lyrics VALUES (4, '2026-10-31 11:06:24.331+00', '[00:00.00]Giữa đại lộ đông tây
[00:16.00]Có ai nghe thấy nỗi cô đơn này...
[00:32.00]Dòng xe vội vã lướt qua nhanh
[00:48.00]Chỉ còn em đứng lặng thầm.', 'PUBLISHED', '2026-10-31 11:06:24.331+00', 2, 4, 3);
INSERT INTO public.official_lyrics VALUES (5, '2026-10-31 11:06:24.331+00', '[00:00.00]Từng ngày tìm kiếm bóng hình em
[00:15.00]Dù biết yêu thương đã khuất xa ngoài tầm tay...
[00:30.00]Một lời hứa gió thoảng bay đi.', 'PUBLISHED', '2026-10-31 11:06:24.331+00', 2, 5, 4);
INSERT INTO public.official_lyrics VALUES (6, '2026-10-31 11:06:24.331+00', '[00:00.00]貴方の目にいつか映る
[00:15.00]晴れた日の空のように...
[00:30.00]風が吹き抜けるこの丘で
[00:45.00]歩き続ける物語。', 'PUBLISHED', '2026-10-31 11:06:24.331+00', 2, 6, 5);
INSERT INTO public.official_lyrics VALUES (7, '2026-10-31 11:06:24.331+00', '[00:00.00]残酷な天使のように
[00:10.00]少年よ 神話になれ...
[00:25.00]蒼い風がいま 胸のドアを叩いても
[00:40.00]私だけをただ見つめて
[00:55.00]微笑んでるあなた。', 'PUBLISHED', '2026-10-31 11:06:24.331+00', 2, 7, 6);
INSERT INTO public.official_lyrics VALUES (8, '2026-10-31 11:06:24.331+00', '[00:00.00]沈むように溶けてゆくように
[00:12.00]二人だけの空が広がる夜に...
[00:25.00]「さよなら」だけだった
[00:38.00]その一言で全てが分かった。', 'PUBLISHED', '2026-10-31 11:06:24.331+00', 2, 8, 7);
INSERT INTO public.official_lyrics VALUES (9, '2026-10-31 13:16:07.439776+00', '[00:00.00] Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50] ...
[00:10.25] Anh thường hay thức khuya
[00:11.80] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65] Rằng phải làm sao?
[00:15.88] Cũng chẳng biết đến bao giờ?
[00:20.30] Những lời ca dở dang
[00:21.91] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.69] Chạy theo đằng sau ánh sáng
[00:27.10] Cuối nơi chân trời
[00:29.48] Rồi em đến đây
[00:30.80] Dịu dàng cạnh bên anh
[00:33.07] Cơn mưa rơi trở nên long lanh
[00:35.46] Chẳng còn đợi trông
[00:37.47] Vì giấc mơ có em thêm màu xanh
[00:40.27] Thật lòng chẳng xa xôi
[00:43.07] Ước muốn anh ở ngay đây thôi
[00:45.85] Anh không bận tâm nữa
[00:47.46] Vì anh có em
[00:50.42] Nếu như ngày mai không diễn ra
[00:52.81] Giống cách mà anh cứ luôn mơ mộng?
[00:55.60] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.40] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99] Dặn lòng phải xứng đáng hơn
[01:05.98] Để anh trở thành chàng trai
[01:07.59] Top 1 trong mắt em
[01:11.34] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.06] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.46] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.07] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75] Bầu trời đêm okay cho nên không sao
[01:23.87] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.54] Dù cho phải gặp bao nhiêu gian khó
[01:27.79] Vẫn luôn là em dõi theo anh
[01:29.73] Dù anh đi đến đâu...
[01:31.59] Nếu như ngày mai không diễn ra
[01:33.99] Giống cách mà anh cứ luôn mơ mộng?
[01:36.78] Thì vẫn có một người luôn phía sau
[01:39.17] Nhẹ nắm tay anh
[01:41.59] Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78] Dặn lòng phải xứng đáng hơn
[01:46.79] Để anh trở thành chàng trai
[01:48.50] Top 1 trong mắt em
[01:52.50] Những cơ hội vụt qua đôi tay
[01:55.20] Vậy chắc chưa phải là ngày hôm nay
[01:57.79] Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.79] Từng câu nói mà anh
[02:00.90] Vẫn luôn tin vào
[02:02.48] Có những lần đôi mắt anh lạc phương hướng
[02:04.90] Để rồi đêm tối anh không về nhà
[02:07.68] Thì vẫn luôn là em
[02:08.87] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.46] Nếu như ngày mai không diễn ra
[02:15.31] Giống cách mà anh cứ luôn mơ mộng?
[02:18.11] Thì vẫn có một người luôn phía sau
[02:20.50] Nhẹ nắm tay anh
[02:22.90] Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50] Dặn lòng phải xứng đáng hơn
[02:28.50] Để anh trở thành chàng trai
[02:30.50] Top 1 trong mắt em...
[02:35.00] Top 1 trong mắt em
[02:40.00] Top 1 trong mắt em...
[02:46.00] ...
[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]', 'DRAFT', '2026-10-31 13:16:07.438782+00', NULL, 13, 8);
INSERT INTO public.official_lyrics VALUES (10, '2026-10-31 13:52:17.227361+00', '[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]

[00:00.00]Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50]...
[00:10.25]Anh thường hay thức khuya
[00:11.80]Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65]Rằng phải làm sao?
[00:15.88]Cũng chẳng biết đến bao giờ?
[00:20.30]Những lời ca dở dang
[00:21.91]Anh ngồi viết mãi vẫn còn chưa xong
[00:24.70]Chạy theo đằng sau ánh sáng
[00:27.10]Cuối nơi chân trời
[00:29.49]Rồi em đến đây
[00:30.80]Dịu dàng cạnh bên anh
[00:33.08]Cơn mưa rơi trở nên long lanh
[00:35.47]Chẳng còn đợi trông
[00:37.48]Vì giấc mơ có em thêm màu xanh
[00:40.27]Thật lòng chẳng xa xôi
[00:43.08]Ước muốn anh ở ngay đây thôi
[00:45.85]Anh không bận tâm nữa
[00:47.46]Vì anh có em
[00:50.43]Nếu như ngày mai không diễn ra
[00:52.81]Giống cách mà anh cứ luôn mơ mộng?
[00:55.60]Thì vẫn có một người luôn phía sau
[00:58.01]Nhẹ nắm tay anh
[01:00.41]Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99]Dặn lòng phải xứng đáng hơn
[01:05.98]Để anh trở thành chàng trai
[01:07.59]Top 1 trong mắt em
[01:11.35]Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.07]Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.47]Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.08]Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75]Bầu trời đêm okay cho nên không sao
[01:23.88]Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.55]Dù cho phải gặp bao nhiêu gian khó
[01:27.80]Vẫn luôn là em dõi theo anh
[01:29.74]Dù anh đi đến đâu...
[01:31.60]Nếu như ngày mai không diễn ra
[01:33.99]Giống cách mà anh cứ luôn mơ mộng?
[01:36.78]Thì vẫn có một người luôn phía sau
[01:39.17]Nhẹ nắm tay anh
[01:41.59]Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78]Dặn lòng phải xứng đáng hơn
[01:46.80]Để anh trở thành chàng trai
[01:48.50]Top 1 trong mắt em
[01:52.50]Những cơ hội vụt qua đôi tay
[01:55.20]Vậy chắc chưa phải là ngày hôm nay
[01:57.80]Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.80]Từng câu nói mà anh
[02:00.91]Vẫn luôn tin vào
[02:02.49]Có những lần đôi mắt anh lạc phương hướng
[02:04.90]Để rồi đêm tối anh không về nhà
[02:07.69]Thì vẫn luôn là em
[02:08.87]Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.47]Nếu như ngày mai không diễn ra
[02:15.32]Giống cách mà anh cứ luôn mơ mộng?
[02:18.11]Thì vẫn có một người luôn phía sau
[02:20.50]Nhẹ nắm tay anh
[02:22.90]Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50]Dặn lòng phải xứng đáng hơn
[02:28.50]Để anh trở thành chàng trai
[02:30.50]Top 1 trong mắt em...
[02:35.00]Top 1 trong mắt em
[02:40.00]Top 1 trong mắt em...
[02:46.00]...', 'DRAFT', '2026-10-31 13:52:17.227361+00', NULL, 15, 9);
INSERT INTO public.official_lyrics VALUES (11, '2026-10-31 14:55:57.485173+00', '[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]

[00:00.00]Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50]...
[00:10.25]Anh thường hay thức khuya
[00:11.80]Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65]Rằng phải làm sao?
[00:15.88]Cũng chẳng biết đến bao giờ?
[00:20.30]Những lời ca dở dang
[00:21.91]Anh ngồi viết mãi vẫn còn chưa xong
[00:24.70]Chạy theo đằng sau ánh sáng
[00:27.10]Cuối nơi chân trời
[00:29.49]Rồi em đến đây
[00:30.80]Dịu dàng cạnh bên anh
[00:33.08]Cơn mưa rơi trở nên long lanh
[00:35.47]Chẳng còn đợi trông
[00:37.48]Vì giấc mơ có em thêm màu xanh
[00:40.27]Thật lòng chẳng xa xôi
[00:43.08]Ước muốn anh ở ngay đây thôi
[00:45.85]Anh không bận tâm nữa
[00:47.46]Vì anh có em
[00:50.43]Nếu như ngày mai không diễn ra
[00:52.81]Giống cách mà anh cứ luôn mơ mộng?
[00:55.60]Thì vẫn có một người luôn phía sau
[00:58.01]Nhẹ nắm tay anh
[01:00.41]Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99]Dặn lòng phải xứng đáng hơn
[01:05.98]Để anh trở thành chàng trai
[01:07.59]Top 1 trong mắt em
[01:11.35]Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.07]Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.47]Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.08]Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75]Bầu trời đêm okay cho nên không sao
[01:23.88]Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.55]Dù cho phải gặp bao nhiêu gian khó
[01:27.80]Vẫn luôn là em dõi theo anh
[01:29.74]Dù anh đi đến đâu...
[01:31.60]Nếu như ngày mai không diễn ra
[01:33.99]Giống cách mà anh cứ luôn mơ mộng?
[01:36.78]Thì vẫn có một người luôn phía sau
[01:39.17]Nhẹ nắm tay anh
[01:41.59]Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78]Dặn lòng phải xứng đáng hơn
[01:46.80]Để anh trở thành chàng trai
[01:48.50]Top 1 trong mắt em
[01:52.50]Những cơ hội vụt qua đôi tay
[01:55.20]Vậy chắc chưa phải là ngày hôm nay
[01:57.80]Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.80]Từng câu nói mà anh
[02:00.91]Vẫn luôn tin vào
[02:02.49]Có những lần đôi mắt anh lạc phương hướng
[02:04.90]Để rồi đêm tối anh không về nhà
[02:07.69]Thì vẫn luôn là em
[02:08.87]Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.47]Nếu như ngày mai không diễn ra
[02:15.32]Giống cách mà anh cứ luôn mơ mộng?
[02:18.11]Thì vẫn có một người luôn phía sau
[02:20.50]Nhẹ nắm tay anh
[02:22.90]Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50]Dặn lòng phải xứng đáng hơn
[02:28.50]Để anh trở thành chàng trai
[02:30.50]Top 1 trong mắt em...
[02:35.00]Top 1 trong mắt em
[02:40.00]Top 1 trong mắt em...
[02:46.00]...', 'DRAFT', '2026-10-31 14:55:57.484173+00', NULL, 19, 10);
INSERT INTO public.official_lyrics VALUES (12, '2026-11-05 17:34:25.045464+00', '[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]

[00:00.00]Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50]...
[00:10.25]Anh thường hay thức khuya
[00:11.80]Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65]Rằng phải làm sao?
[00:15.88]Cũng chẳng biết đến bao giờ?
[00:20.30]Những lời ca dở dang
[00:21.91]Anh ngồi viết mãi vẫn còn chưa xong
[00:24.70]Chạy theo đằng sau ánh sáng
[00:27.10]Cuối nơi chân trời
[00:29.49]Rồi em đến đây
[00:30.80]Dịu dàng cạnh bên anh
[00:33.08]Cơn mưa rơi trở nên long lanh
[00:35.47]Chẳng còn đợi trông
[00:37.48]Vì giấc mơ có em thêm màu xanh
[00:40.27]Thật lòng chẳng xa xôi
[00:43.08]Ước muốn anh ở ngay đây thôi
[00:45.85]Anh không bận tâm nữa
[00:47.46]Vì anh có em
[00:50.43]Nếu như ngày mai không diễn ra
[00:52.81]Giống cách mà anh cứ luôn mơ mộng?
[00:55.60]Thì vẫn có một người luôn phía sau
[00:58.01]Nhẹ nắm tay anh
[01:00.41]Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99]Dặn lòng phải xứng đáng hơn
[01:05.98]Để anh trở thành chàng trai
[01:07.59]Top 1 trong mắt em
[01:11.35]Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.07]Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.47]Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.08]Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75]Bầu trời đêm okay cho nên không sao
[01:23.88]Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.55]Dù cho phải gặp bao nhiêu gian khó
[01:27.80]Vẫn luôn là em dõi theo anh
[01:29.74]Dù anh đi đến đâu...
[01:31.60]Nếu như ngày mai không diễn ra
[01:33.99]Giống cách mà anh cứ luôn mơ mộng?
[01:36.78]Thì vẫn có một người luôn phía sau
[01:39.17]Nhẹ nắm tay anh
[01:41.59]Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78]Dặn lòng phải xứng đáng hơn
[01:46.80]Để anh trở thành chàng trai
[01:48.50]Top 1 trong mắt em
[01:52.50]Những cơ hội vụt qua đôi tay
[01:55.20]Vậy chắc chưa phải là ngày hôm nay
[01:57.80]Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.80]Từng câu nói mà anh
[02:00.91]Vẫn luôn tin vào
[02:02.49]Có những lần đôi mắt anh lạc phương hướng
[02:04.90]Để rồi đêm tối anh không về nhà
[02:07.69]Thì vẫn luôn là em
[02:08.87]Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.47]Nếu như ngày mai không diễn ra
[02:15.32]Giống cách mà anh cứ luôn mơ mộng?
[02:18.11]Thì vẫn có một người luôn phía sau
[02:20.50]Nhẹ nắm tay anh
[02:22.90]Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50]Dặn lòng phải xứng đáng hơn
[02:28.50]Để anh trở thành chàng trai
[02:30.50]Top 1 trong mắt em...
[02:35.00]Top 1 trong mắt em
[02:40.00]Top 1 trong mắt em...
[02:46.00]...', 'DRAFT', '2026-11-05 17:34:25.04396+00', NULL, 24, 11);
INSERT INTO public.official_lyrics VALUES (1, '2026-10-31 11:06:24.331+00', '[00:29.69] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
[00:34.82] Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương (ngọt ngào trong sương)
[00:39.79] Ngắm em thật lâu, con tim anh yếu mềm
[00:45.15] Đắm say từ phút đó, từng giây trôi yêu thêm
[00:50.49] Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh (bộn bề nơi anh)
[00:55.78] Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh (bầu trời trong xanh)
[01:00.99] Liếc đôi hàng mi mong manh, anh thẫn thờ
[01:06.04] Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ
[01:11.20] Cầm tay anh (anh), dựa vai anh (anh)
[01:13.90] Kề bên anh, nơi này có anh
[01:16.28] Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[01:20.51] (Yêu em, thương em, con tim anh chân thành)
[01:21.81] Cầm tay anh (anh), dựa vai anh (anh)
[01:24.29] Kề bên anh, nơi này có anh
[01:26.62] Khép đôi mi thật lâu
[01:28.15] Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
[01:31.70] Mùa xuân đến bình yên, cho anh những giấc mơ
[01:37.21] Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[01:42.31] Mùa thu lá vàng rơi, đông sang, anh nhớ em
[01:47.56] Tình yêu bé nhỏ xin dành tặng riêng em
[01:54.54]
[02:03.51] (Yeah)
[02:04.06] Còn đó tiếng nói ấy bên tai vấn vương bao ngày qua
[02:06.70] Ánh mắt bối rối nhớ thương bao ngày qua
[02:09.59] Yêu em anh thẫn thờ, con tim bâng khuâng đâu có ngờ
[02:11.75] Chẳng bao giờ phải mong chờ, đợi ai trong chiều hoàng hôn mờ
[02:14.68] Đắm chìm hòa vào vần thơ, ngắm nhìn khờ dại mộng mơ
[02:17.09] Đừng bước vội vàng rồi làm ngơ, lạnh lùng đó làm bộ dạng thờ ơ
[02:19.75] Nhìn anh đi em nha, hướng nụ cười cho riêng anh nha
[02:21.84] Đơn giản là yêu, con tim anh lên tiếng thôi
[02:24.34] Cầm tay anh (anh), dựa vai anh (anh)
[02:27.05] Kề bên anh, nơi này có anh
[02:29.24] Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[02:33.78] (Yêu em, thương em, con tim anh chân thành)
[02:34.84] Cầm tay anh (anh), dựa vai anh (anh)
[02:37.50] Kề bên anh, nơi này có anh
[02:39.67] Khép đôi mi thật lâu
[02:41.12] Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
[02:45.02] Mùa xuân đến bình yên, cho anh những giấc mơ
[02:50.25] Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[02:55.25] Mùa thu lá vàng rơi, đông sang, anh nhớ em
[03:00.56] Tình yêu bé nhỏ xin dành tặng riêng em
[03:05.88] Ah-ah-oh-oh-oh-oh-oh-oh-oh, nhớ thương em
[03:11.18] Oh-oh-oh-oh-oh-oh-oh-oh-oh, nhớ thương em lắm
[03:17.02] Ah, phía sau chân trời
[03:21.42] Có ai băng qua lối về, cùng em đi trên đoạn đường dài
[03:26.97] Cầm tay anh (anh), dựa vai anh (anh)
[03:29.68] Kề bên anh, nơi này có anh
[03:31.80] Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[03:36.30] (Yêu em, thương em, con tim anh chân thành)
[03:37.36] Cầm tay anh (anh), dựa vai anh (anh)
[03:40.03] Kề bên anh, nơi này có anh
[03:42.36] Khép đôi mi thật lâu
[03:43.71] Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu (oh-oh)
[03:47.44] Mùa xuân đến bình yên, cho anh những giấc mơ
[03:52.75] Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[03:57.97] Mùa thu lá vàng rơi, đông sang, anh nhớ em
[04:03.27] Tình yêu bé nhỏ xin dành tặng riêng em
[04:08.34]', 'PUBLISHED', '2026-11-07 16:20:32.120694+00', 2, 1, 12);
INSERT INTO public.official_lyrics VALUES (14, '2026-11-07 16:51:33.162352+00', '[00:00.00] Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50] ...
[00:10.25] Anh thường hay thức khuya
[00:11.80] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65] Rằng phải làm sao?
[00:15.88] Cũng chẳng biết đến bao giờ?
[00:20.30] Những lời ca dở dang
[00:21.91] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.69] Chạy theo đằng sau ánh sáng
[00:27.10] Cuối nơi chân trời
[00:29.48] Rồi em đến đây
[00:30.80] Dịu dàng cạnh bên anh
[00:33.07] Cơn mưa rơi trở nên long lanh
[00:35.46] Chẳng còn đợi trông
[00:37.47] Vì giấc mơ có em thêm màu xanh
[00:40.27] Thật lòng chẳng xa xôi
[00:43.07] Ước muốn anh ở ngay đây thôi
[00:45.85] Anh không bận tâm nữa
[00:47.46] Vì anh có em
[00:50.42] Nếu như ngày mai không diễn ra
[00:52.81] Giống cách mà anh cứ luôn mơ mộng?
[00:55.60] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.40] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99] Dặn lòng phải xứng đáng hơn
[01:05.98] Để anh trở thành chàng trai
[01:07.59] Top 1 trong mắt em
[01:11.34] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.06] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.46] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.07] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75] Bầu trời đêm okay cho nên không sao
[01:23.87] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.54] Dù cho phải gặp bao nhiêu gian khó
[01:27.79] Vẫn luôn là em dõi theo anh
[01:29.73] Dù anh đi đến đâu...
[01:31.59] Nếu như ngày mai không diễn ra
[01:33.99] Giống cách mà anh cứ luôn mơ mộng?
[01:36.78] Thì vẫn có một người luôn phía sau
[01:39.17] Nhẹ nắm tay anh
[01:41.59] Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78] Dặn lòng phải xứng đáng hơn
[01:46.79] Để anh trở thành chàng trai
[01:48.50] Top 1 trong mắt em
[01:52.50] Những cơ hội vụt qua đôi tay
[01:55.20] Vậy chắc chưa phải là ngày hôm nay
[01:57.79] Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.79] Từng câu nói mà anh
[02:00.90] Vẫn luôn tin vào
[02:02.48] Có những lần đôi mắt anh lạc phương hướng
[02:04.90] Để rồi đêm tối anh không về nhà
[02:07.68] Thì vẫn luôn là em
[02:08.87] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.46] Nếu như ngày mai không diễn ra
[02:15.31] Giống cách mà anh cứ luôn mơ mộng?
[02:18.11] Thì vẫn có một người luôn phía sau
[02:20.50] Nhẹ nắm tay anh
[02:22.90] Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50] Dặn lòng phải xứng đáng hơn
[02:28.50] Để anh trở thành chàng trai
[02:30.50] Top 1 trong mắt em...
[02:35.00] Top 1 trong mắt em
[02:40.00] Top 1 trong mắt em...
[02:46.00] ...
[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]', 'DRAFT', '2026-11-07 16:51:33.161718+00', NULL, 27, 13);


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.password_reset_tokens VALUES (1, '2026-11-09 03:35:45.458729', '2026-11-09 03:45:45.458729', '$2a$10$ya.1qLhOHExKIFP9UQaaIeDoBJJQeQVqLYeyTrahCzKWjAbenFX2m', '2026-11-09 03:37:23.240892', 13, 1);


--
-- Data for Name: personal_lyrics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.personal_lyrics VALUES (2, '2026-10-31 11:06:24.331+00', '[00:00.00]Baby em là một giấc mơ
[00:12.00]Mà anh không thể nào chạm tới...
[00:25.00]Khi màn đêm buông xuống nơi đây
[00:38.00]Chỉ còn nỗi nhớ đong đầy.', 'CUSTOM', '2026-10-31 11:06:24.331+00', 2, 2, 1);
INSERT INTO public.personal_lyrics VALUES (3, '2026-10-31 11:06:24.331+00', '[00:00.00]Em tìm lối ra nơi bảng exit sign
[00:14.00]Để lại con tim anh vỡ tan trong đêm dài...
[00:28.00]Liệu có cơ hội nào cho đôi ta bắt đầu lại?', 'CUSTOM', '2026-10-31 11:06:24.331+00', 3, 3, 2);
INSERT INTO public.personal_lyrics VALUES (4, '2026-10-31 11:06:24.331+00', '[00:00.00]Giữa đại lộ đông tây
[00:16.00]Có ai nghe thấy nỗi cô đơn này...
[00:32.00]Dòng xe vội vã lướt qua nhanh
[00:48.00]Chỉ còn em đứng lặng thầm.', 'CUSTOM', '2026-10-31 11:06:24.331+00', 4, 4, 3);
INSERT INTO public.personal_lyrics VALUES (5, '2026-10-31 11:06:24.331+00', '[00:00.00]Từng ngày tìm kiếm bóng hình em
[00:15.00]Dù biết yêu thương đã khuất xa ngoài tầm tay...
[00:30.00]Một lời hứa gió thoảng bay đi.', 'CUSTOM', '2026-10-31 11:06:24.331+00', 5, 5, 4);
INSERT INTO public.personal_lyrics VALUES (6, '2026-10-31 11:06:24.331+00', '[00:00.00]貴方の目にいつか映る
[00:15.00]晴れた日の空のように...
[00:30.00]風が吹き抜けるこの丘で
[00:45.00]歩き続ける物語。', 'CUSTOM', '2026-10-31 11:06:24.331+00', 6, 6, 5);
INSERT INTO public.personal_lyrics VALUES (7, '2026-10-31 11:06:24.331+00', '[00:00.00]残酷な天使のように
[00:10.00]少年よ 神話になれ...
[00:25.00]蒼い風がいま 胸のドアを叩いても
[00:40.00]私だけをただ見つめて
[00:55.00]微笑んでるあなた。', 'CUSTOM', '2026-10-31 11:06:24.331+00', 7, 7, 6);
INSERT INTO public.personal_lyrics VALUES (8, '2026-10-31 11:06:24.331+00', '[00:00.00]沈むように溶けてゆくように
[00:12.00]二人だけの空が広がる夜に...
[00:25.00]「さよなら」だけだった
[00:38.00]その一言で全てが分かった。', 'CUSTOM', '2026-10-31 11:06:24.331+00', 8, 8, 7);
INSERT INTO public.personal_lyrics VALUES (9, '2026-10-31 13:16:07.439776+00', '[00:00.00] Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50] ...
[00:10.25] Anh thường hay thức khuya
[00:11.80] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65] Rằng phải làm sao?
[00:15.88] Cũng chẳng biết đến bao giờ?
[00:20.30] Những lời ca dở dang
[00:21.91] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.69] Chạy theo đằng sau ánh sáng
[00:27.10] Cuối nơi chân trời
[00:29.48] Rồi em đến đây
[00:30.80] Dịu dàng cạnh bên anh
[00:33.07] Cơn mưa rơi trở nên long lanh
[00:35.46] Chẳng còn đợi trông
[00:37.47] Vì giấc mơ có em thêm màu xanh
[00:40.27] Thật lòng chẳng xa xôi
[00:43.07] Ước muốn anh ở ngay đây thôi
[00:45.85] Anh không bận tâm nữa
[00:47.46] Vì anh có em
[00:50.42] Nếu như ngày mai không diễn ra
[00:52.81] Giống cách mà anh cứ luôn mơ mộng?
[00:55.60] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.40] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99] Dặn lòng phải xứng đáng hơn
[01:05.98] Để anh trở thành chàng trai
[01:07.59] Top 1 trong mắt em
[01:11.34] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.06] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.46] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.07] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75] Bầu trời đêm okay cho nên không sao
[01:23.87] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.54] Dù cho phải gặp bao nhiêu gian khó
[01:27.79] Vẫn luôn là em dõi theo anh
[01:29.73] Dù anh đi đến đâu...
[01:31.59] Nếu như ngày mai không diễn ra
[01:33.99] Giống cách mà anh cứ luôn mơ mộng?
[01:36.78] Thì vẫn có một người luôn phía sau
[01:39.17] Nhẹ nắm tay anh
[01:41.59] Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78] Dặn lòng phải xứng đáng hơn
[01:46.79] Để anh trở thành chàng trai
[01:48.50] Top 1 trong mắt em
[01:52.50] Những cơ hội vụt qua đôi tay
[01:55.20] Vậy chắc chưa phải là ngày hôm nay
[01:57.79] Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.79] Từng câu nói mà anh
[02:00.90] Vẫn luôn tin vào
[02:02.48] Có những lần đôi mắt anh lạc phương hướng
[02:04.90] Để rồi đêm tối anh không về nhà
[02:07.68] Thì vẫn luôn là em
[02:08.87] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.46] Nếu như ngày mai không diễn ra
[02:15.31] Giống cách mà anh cứ luôn mơ mộng?
[02:18.11] Thì vẫn có một người luôn phía sau
[02:20.50] Nhẹ nắm tay anh
[02:22.90] Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50] Dặn lòng phải xứng đáng hơn
[02:28.50] Để anh trở thành chàng trai
[02:30.50] Top 1 trong mắt em...
[02:35.00] Top 1 trong mắt em
[02:40.00] Top 1 trong mắt em...
[02:46.00] ...
[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]', 'CUSTOM', '2026-10-31 13:16:07.438782+00', 13, 3, 8);
INSERT INTO public.personal_lyrics VALUES (10, '2026-10-31 13:52:17.227361+00', '[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]

[00:00.00]Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50]...
[00:10.25]Anh thường hay thức khuya
[00:11.80]Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65]Rằng phải làm sao?
[00:15.88]Cũng chẳng biết đến bao giờ?
[00:20.30]Những lời ca dở dang
[00:21.91]Anh ngồi viết mãi vẫn còn chưa xong
[00:24.70]Chạy theo đằng sau ánh sáng
[00:27.10]Cuối nơi chân trời
[00:29.49]Rồi em đến đây
[00:30.80]Dịu dàng cạnh bên anh
[00:33.08]Cơn mưa rơi trở nên long lanh
[00:35.47]Chẳng còn đợi trông
[00:37.48]Vì giấc mơ có em thêm màu xanh
[00:40.27]Thật lòng chẳng xa xôi
[00:43.08]Ước muốn anh ở ngay đây thôi
[00:45.85]Anh không bận tâm nữa
[00:47.46]Vì anh có em
[00:50.43]Nếu như ngày mai không diễn ra
[00:52.81]Giống cách mà anh cứ luôn mơ mộng?
[00:55.60]Thì vẫn có một người luôn phía sau
[00:58.01]Nhẹ nắm tay anh
[01:00.41]Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99]Dặn lòng phải xứng đáng hơn
[01:05.98]Để anh trở thành chàng trai
[01:07.59]Top 1 trong mắt em
[01:11.35]Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.07]Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.47]Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.08]Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75]Bầu trời đêm okay cho nên không sao
[01:23.88]Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.55]Dù cho phải gặp bao nhiêu gian khó
[01:27.80]Vẫn luôn là em dõi theo anh
[01:29.74]Dù anh đi đến đâu...
[01:31.60]Nếu như ngày mai không diễn ra
[01:33.99]Giống cách mà anh cứ luôn mơ mộng?
[01:36.78]Thì vẫn có một người luôn phía sau
[01:39.17]Nhẹ nắm tay anh
[01:41.59]Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78]Dặn lòng phải xứng đáng hơn
[01:46.80]Để anh trở thành chàng trai
[01:48.50]Top 1 trong mắt em
[01:52.50]Những cơ hội vụt qua đôi tay
[01:55.20]Vậy chắc chưa phải là ngày hôm nay
[01:57.80]Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.80]Từng câu nói mà anh
[02:00.91]Vẫn luôn tin vào
[02:02.49]Có những lần đôi mắt anh lạc phương hướng
[02:04.90]Để rồi đêm tối anh không về nhà
[02:07.69]Thì vẫn luôn là em
[02:08.87]Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.47]Nếu như ngày mai không diễn ra
[02:15.32]Giống cách mà anh cứ luôn mơ mộng?
[02:18.11]Thì vẫn có một người luôn phía sau
[02:20.50]Nhẹ nắm tay anh
[02:22.90]Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50]Dặn lòng phải xứng đáng hơn
[02:28.50]Để anh trở thành chàng trai
[02:30.50]Top 1 trong mắt em...
[02:35.00]Top 1 trong mắt em
[02:40.00]Top 1 trong mắt em...
[02:46.00]...', 'CUSTOM', '2026-10-31 13:52:17.227361+00', 15, 3, 9);
INSERT INTO public.personal_lyrics VALUES (11, '2026-10-31 14:55:57.485173+00', '[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]

[00:00.00]Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50]...
[00:10.25]Anh thường hay thức khuya
[00:11.80]Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65]Rằng phải làm sao?
[00:15.88]Cũng chẳng biết đến bao giờ?
[00:20.30]Những lời ca dở dang
[00:21.91]Anh ngồi viết mãi vẫn còn chưa xong
[00:24.70]Chạy theo đằng sau ánh sáng
[00:27.10]Cuối nơi chân trời
[00:29.49]Rồi em đến đây
[00:30.80]Dịu dàng cạnh bên anh
[00:33.08]Cơn mưa rơi trở nên long lanh
[00:35.47]Chẳng còn đợi trông
[00:37.48]Vì giấc mơ có em thêm màu xanh
[00:40.27]Thật lòng chẳng xa xôi
[00:43.08]Ước muốn anh ở ngay đây thôi
[00:45.85]Anh không bận tâm nữa
[00:47.46]Vì anh có em
[00:50.43]Nếu như ngày mai không diễn ra
[00:52.81]Giống cách mà anh cứ luôn mơ mộng?
[00:55.60]Thì vẫn có một người luôn phía sau
[00:58.01]Nhẹ nắm tay anh
[01:00.41]Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99]Dặn lòng phải xứng đáng hơn
[01:05.98]Để anh trở thành chàng trai
[01:07.59]Top 1 trong mắt em
[01:11.35]Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.07]Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.47]Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.08]Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75]Bầu trời đêm okay cho nên không sao
[01:23.88]Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.55]Dù cho phải gặp bao nhiêu gian khó
[01:27.80]Vẫn luôn là em dõi theo anh
[01:29.74]Dù anh đi đến đâu...
[01:31.60]Nếu như ngày mai không diễn ra
[01:33.99]Giống cách mà anh cứ luôn mơ mộng?
[01:36.78]Thì vẫn có một người luôn phía sau
[01:39.17]Nhẹ nắm tay anh
[01:41.59]Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78]Dặn lòng phải xứng đáng hơn
[01:46.80]Để anh trở thành chàng trai
[01:48.50]Top 1 trong mắt em
[01:52.50]Những cơ hội vụt qua đôi tay
[01:55.20]Vậy chắc chưa phải là ngày hôm nay
[01:57.80]Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.80]Từng câu nói mà anh
[02:00.91]Vẫn luôn tin vào
[02:02.49]Có những lần đôi mắt anh lạc phương hướng
[02:04.90]Để rồi đêm tối anh không về nhà
[02:07.69]Thì vẫn luôn là em
[02:08.87]Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.47]Nếu như ngày mai không diễn ra
[02:15.32]Giống cách mà anh cứ luôn mơ mộng?
[02:18.11]Thì vẫn có một người luôn phía sau
[02:20.50]Nhẹ nắm tay anh
[02:22.90]Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50]Dặn lòng phải xứng đáng hơn
[02:28.50]Để anh trở thành chàng trai
[02:30.50]Top 1 trong mắt em...
[02:35.00]Top 1 trong mắt em
[02:40.00]Top 1 trong mắt em...
[02:46.00]...', 'CUSTOM', '2026-10-31 14:55:57.484173+00', 19, 3, 10);
INSERT INTO public.personal_lyrics VALUES (12, '2026-10-31 11:06:24.331+00', '[00:29.94] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
[00:34.67] Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương (ngọt ngào trong sương)
[00:40.13] Ngắm em thật lâu, con tim anh yếu mềm
[00:45.38] Đắm say từ phút đó, từng giây trôi yêu thêm
[00:50.42] Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh (bộn bề nơi anh)
[00:55.45] Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh (bầu trời trong xanh)
[01:01.06] Liếc đôi hàng mi mong manh, anh thẫn thờ
[01:06.20] Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ
[01:11.39] Cầm tay anh (anh), dựa vai anh (anh)
[01:14.10] Kề bên anh, nơi này có anh
[01:16.09] Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[01:20.45] (Yêu em, thương em, con tim anh chân thành)
[01:21.78] Cầm tay anh (anh), dựa vai anh (anh)
[01:24.53] Kề bên anh, nơi này có anh
[01:26.78] Khép đôi mi thật lâu
[01:28.25] Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
[01:31.71] Mùa xuân đến bình yên, cho anh những giấc mơ
[01:36.95] Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[01:42.56] Mùa thu lá vàng rơi, đông sang, anh nhớ em
[01:47.84] Tình yêu bé nhỏ xin dành tặng riêng em
(Yeah)
Còn đó tiếng nói ấy bên tai vấn vương bao ngày qua
Ánh mắt bối rối nhớ thương bao ngày qua
Yêu em anh thẫn thờ, con tim bâng khuâng đâu có ngờ
Chẳng bao giờ phải mong chờ, đợi ai trong chiều hoàng hôn mờ
Đắm chìm hòa vào vần thơ, ngắm nhìn khờ dại mộng mơ
Đừng bước vội vàng rồi làm ngơ, lạnh lùng đó làm bộ dạng thờ ơ
Nhìn anh đi em nha, hướng nụ cười cho riêng anh nha
Đơn giản là yêu, con tim anh lên tiếng thôi
Cầm tay anh (anh), dựa vai anh (anh)
Kề bên anh, nơi này có anh
Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
(Yêu em, thương em, con tim anh chân thành)
Cầm tay anh (anh), dựa vai anh (anh)
Kề bên anh, nơi này có anh
Khép đôi mi thật lâu
Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
Mùa xuân đến bình yên, cho anh những giấc mơ
Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
Mùa thu lá vàng rơi, đông sang, anh nhớ em
Tình yêu bé nhỏ xin dành tặng riêng em
Ah-ah-oh-oh-oh-oh-oh-oh-oh, nhớ thương em
Oh-oh-oh-oh-oh-oh-oh-oh-oh, nhớ thương em lắm
Ah, phía sau chân trời
Có ai băng qua lối về, cùng em đi trên đoạn đường dài
Cầm tay anh (anh), dựa vai anh (anh)
Kề bên anh, nơi này có anh
Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
(Yêu em, thương em, con tim anh chân thành)
Cầm tay anh (anh), dựa vai anh (anh)
Kề bên anh, nơi này có anh
Khép đôi mi thật lâu
Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu (oh-oh)
Mùa xuân đến bình yên, cho anh những giấc mơ
Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
Mùa thu lá vàng rơi, đông sang, anh nhớ em
Tình yêu bé nhỏ xin dành tặng riêng em', 'CUSTOM', '2026-10-31 15:53:59.63826+00', 1, 1, 11);
INSERT INTO public.personal_lyrics VALUES (24, '2026-11-05 17:34:25.045464+00', '[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]

[00:00.00]Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50]...
[00:10.25]Anh thường hay thức khuya
[00:11.80]Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65]Rằng phải làm sao?
[00:15.88]Cũng chẳng biết đến bao giờ?
[00:20.30]Những lời ca dở dang
[00:21.91]Anh ngồi viết mãi vẫn còn chưa xong
[00:24.70]Chạy theo đằng sau ánh sáng
[00:27.10]Cuối nơi chân trời
[00:29.49]Rồi em đến đây
[00:30.80]Dịu dàng cạnh bên anh
[00:33.08]Cơn mưa rơi trở nên long lanh
[00:35.47]Chẳng còn đợi trông
[00:37.48]Vì giấc mơ có em thêm màu xanh
[00:40.27]Thật lòng chẳng xa xôi
[00:43.08]Ước muốn anh ở ngay đây thôi
[00:45.85]Anh không bận tâm nữa
[00:47.46]Vì anh có em
[00:50.43]Nếu như ngày mai không diễn ra
[00:52.81]Giống cách mà anh cứ luôn mơ mộng?
[00:55.60]Thì vẫn có một người luôn phía sau
[00:58.01]Nhẹ nắm tay anh
[01:00.41]Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99]Dặn lòng phải xứng đáng hơn
[01:05.98]Để anh trở thành chàng trai
[01:07.59]Top 1 trong mắt em
[01:11.35]Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.07]Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.47]Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.08]Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75]Bầu trời đêm okay cho nên không sao
[01:23.88]Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.55]Dù cho phải gặp bao nhiêu gian khó
[01:27.80]Vẫn luôn là em dõi theo anh
[01:29.74]Dù anh đi đến đâu...
[01:31.60]Nếu như ngày mai không diễn ra
[01:33.99]Giống cách mà anh cứ luôn mơ mộng?
[01:36.78]Thì vẫn có một người luôn phía sau
[01:39.17]Nhẹ nắm tay anh
[01:41.59]Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78]Dặn lòng phải xứng đáng hơn
[01:46.80]Để anh trở thành chàng trai
[01:48.50]Top 1 trong mắt em
[01:52.50]Những cơ hội vụt qua đôi tay
[01:55.20]Vậy chắc chưa phải là ngày hôm nay
[01:57.80]Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.80]Từng câu nói mà anh
[02:00.91]Vẫn luôn tin vào
[02:02.49]Có những lần đôi mắt anh lạc phương hướng
[02:04.90]Để rồi đêm tối anh không về nhà
[02:07.69]Thì vẫn luôn là em
[02:08.87]Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.47]Nếu như ngày mai không diễn ra
[02:15.32]Giống cách mà anh cứ luôn mơ mộng?
[02:18.11]Thì vẫn có một người luôn phía sau
[02:20.50]Nhẹ nắm tay anh
[02:22.90]Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50]Dặn lòng phải xứng đáng hơn
[02:28.50]Để anh trở thành chàng trai
[02:30.50]Top 1 trong mắt em...
[02:35.00]Top 1 trong mắt em
[02:40.00]Top 1 trong mắt em...
[02:46.00]...', 'CUSTOM', '2026-11-05 17:34:25.04396+00', 24, 3, 12);
INSERT INTO public.personal_lyrics VALUES (52, '2026-11-07 16:51:33.162352+00', '[00:00.00] Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50] ...
[00:10.25] Anh thường hay thức khuya
[00:11.80] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65] Rằng phải làm sao?
[00:15.88] Cũng chẳng biết đến bao giờ?
[00:20.30] Những lời ca dở dang
[00:21.91] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.69] Chạy theo đằng sau ánh sáng
[00:27.10] Cuối nơi chân trời
[00:29.48] Rồi em đến đây
[00:30.80] Dịu dàng cạnh bên anh
[00:33.07] Cơn mưa rơi trở nên long lanh
[00:35.46] Chẳng còn đợi trông
[00:37.47] Vì giấc mơ có em thêm màu xanh
[00:40.27] Thật lòng chẳng xa xôi
[00:43.07] Ước muốn anh ở ngay đây thôi
[00:45.85] Anh không bận tâm nữa
[00:47.46] Vì anh có em
[00:50.42] Nếu như ngày mai không diễn ra
[00:52.81] Giống cách mà anh cứ luôn mơ mộng?
[00:55.60] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.40] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99] Dặn lòng phải xứng đáng hơn
[01:05.98] Để anh trở thành chàng trai
[01:07.59] Top 1 trong mắt em
[01:11.34] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.06] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.46] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.07] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75] Bầu trời đêm okay cho nên không sao
[01:23.87] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.54] Dù cho phải gặp bao nhiêu gian khó
[01:27.79] Vẫn luôn là em dõi theo anh
[01:29.73] Dù anh đi đến đâu...
[01:31.59] Nếu như ngày mai không diễn ra
[01:33.99] Giống cách mà anh cứ luôn mơ mộng?
[01:36.78] Thì vẫn có một người luôn phía sau
[01:39.17] Nhẹ nắm tay anh
[01:41.59] Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78] Dặn lòng phải xứng đáng hơn
[01:46.79] Để anh trở thành chàng trai
[01:48.50] Top 1 trong mắt em
[01:52.50] Những cơ hội vụt qua đôi tay
[01:55.20] Vậy chắc chưa phải là ngày hôm nay
[01:57.79] Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.79] Từng câu nói mà anh
[02:00.90] Vẫn luôn tin vào
[02:02.48] Có những lần đôi mắt anh lạc phương hướng
[02:04.90] Để rồi đêm tối anh không về nhà
[02:07.68] Thì vẫn luôn là em
[02:08.87] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.46] Nếu như ngày mai không diễn ra
[02:15.31] Giống cách mà anh cứ luôn mơ mộng?
[02:18.11] Thì vẫn có một người luôn phía sau
[02:20.50] Nhẹ nắm tay anh
[02:22.90] Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50] Dặn lòng phải xứng đáng hơn
[02:28.50] Để anh trở thành chàng trai
[02:30.50] Top 1 trong mắt em...
[02:35.00] Top 1 trong mắt em
[02:40.00] Top 1 trong mắt em...
[02:46.00] ...
[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]', 'CUSTOM', '2026-11-07 16:51:33.161718+00', 27, 3, 13);
INSERT INTO public.personal_lyrics VALUES (25, '2026-11-07 13:07:20.937439+00', '[00:29.69] Who are you, where did you come from, so gentle and pure? (gentle and pure)
[00:34.82] Who are you, like the morning sunshine sweet amid the dew? (sweet amid the dew)
[00:39.79] Gazing at you for so long, my heart turns weak and tender
[00:45.15] Enchanted from that very moment, loving you more with every passing second
[00:50.49] Over past days, the sunrise awakens and clears away all my worries (all my worries)
[00:55.78] Over past days, all my love and longing soar across the clear blue sky (clear blue sky)
[01:00.99] Glancing at your delicate eyelashes, I stand mesmerized
[01:06.04] Longing to gently kiss your hair, your lips, I dream
[01:11.20] Hold my hand (hand), lean on my shoulder (shoulder)
[01:13.90] Stay by my side, right here you have me
[01:16.28] The wind carries a love song, a thousand shooting stars softly embrace you
[01:20.51] (<Love you, adore you, my heart is so sincere>)
[01:21.81] Hold my hand (hand), lean on my shoulder (shoulder)
[01:24.29] Stay by my side, right here you have me
[01:26.62] Close your eyes for a long moment
[01:28.15] Wishing to be together forever, passionately in love like day one
[01:31.70] Spring arrives peacefully, bringing me sweet dreams
[01:37.21] Summer preserves rainy days, poetic and sweet
[01:42.31] Autumn yellow leaves fall, winter comes, I miss you
[01:47.56] This little love of mine is dedicated solely to you
[01:54.54]
[02:03.51] (Yeah)
[02:04.06] Still lingering in my ears, that sweet voice of yours through all these days
[02:06.70] Those shy eyes filled with longing all these days
[02:09.59] Loving you leaves me spellbound, my heart fluttered without warning
[02:11.75] Never once did I have to wait or pine for anyone in the dim twilight
[02:14.68] Immersed into poetic rhymes, gazing foolishly in daydreams
[02:17.09] Don''t rush away and pretend not to care, with that cold and aloof expression
[02:19.75] Look at me, my love, give that sweet smile just to me
[02:21.84] Simply because I love you, it''s just my heart speaking up
[02:24.34] Hold my hand (hand), lean on my shoulder (shoulder)
[02:27.05] Stay by my side, right here you have me
[02:29.24] The wind carries a love song, a thousand shooting stars softly embrace you
[02:33.78] (<Love you, adore you, my heart is so sincere>)
[02:34.84] Hold my hand (hand), lean on my shoulder (shoulder)
[02:37.50] Stay by my side, right here you have me
[02:39.67] Close your eyes for a long moment
[02:41.12] Wishing to be together forever, passionately in love like day one
[02:45.02] Spring arrives peacefully, bringing me sweet dreams
[02:50.25] Summer preserves rainy days, poetic and sweet
[02:55.25] Autumn yellow leaves fall, winter comes, I miss you
[03:00.56] This little love of mine is dedicated solely to you
[03:05.88] Ah-ah-oh-oh-oh-oh-oh-oh-oh, missing you
[03:11.18] Oh-oh-oh-oh-oh-oh-oh-oh-oh, missing you so much
[03:17.02] Ah, beyond the horizon
[03:21.42] Is someone crossing the pathway home, walking with you down the long road ahead
[03:26.97] Hold my hand (hand), lean on my shoulder (shoulder)
[03:29.68] Stay by my side, right here you have me
[03:31.80] The wind carries a love song, a thousand shooting stars softly embrace you
[03:36.30] (<Love you, adore you, my heart is so sincere>)
[03:37.36] Hold my hand (hand), lean on my shoulder (shoulder)
[03:40.03] Stay by my side, right here you have me
[03:42.36] Close your eyes for a long moment
[03:43.71] Wishing to be together forever, passionately in love like day one (oh-oh)
[03:47.44] Spring arrives peacefully, bringing me sweet dreams
[03:52.75] Summer preserves rainy days, poetic and sweet
[03:57.97] Autumn yellow leaves fall, winter comes, I miss you
[04:03.27] This little love of mine is dedicated solely to you
[04:08.34]', 'CUSTOM', '2026-11-07 13:51:23.528115+00', 1, 11, 14);
INSERT INTO public.personal_lyrics VALUES (53, '2026-11-09 02:58:59.757439+00', '[00:29.69] Who are you, where did you come from, so gentle and pure? (gentle and pure)
[00:34.82] Who are you, like the morning sunshine sweet amid the dew? (sweet amid the dew)
[00:39.79] Gazing at you for so long, my heart turns weak and tender
[00:45.15] Enchanted from that very moment, loving you more with every passing second
[00:50.49] Over past days, the sunrise awakens and clears away all my worries (all my worries)
[00:55.78] Over past days, all my love and longing soar across the clear blue sky (clear blue sky)
[01:00.99] Glancing at your delicate eyelashes, I stand mesmerized
[01:06.04] Longing to gently kiss your hair, your lips, I dream
[01:11.20] Hold my hand (hand), lean on my shoulder (shoulder)
[01:13.90] Stay by my side, right here you have me
[01:16.28] The wind carries a love song, a thousand shooting stars softly embrace you
[01:20.51] (<Love you, adore you, my heart is so sincere>)
[01:21.81] Hold my hand (hand), lean on my shoulder (shoulder)
[01:24.29] Stay by my side, right here you have me
[01:26.62] Close your eyes for a long moment
[01:28.15] Wishing to be together forever, passionately in love like day one
[01:31.70] Spring arrives peacefully, bringing me sweet dreams
[01:37.21] Summer preserves rainy days, poetic and sweet
[01:42.31] Autumn yellow leaves fall, winter comes, I miss you
[01:47.56] This little love of mine is dedicated solely to you
[01:54.54]
[02:03.51] (Yeah)
[02:04.06] Still lingering in my ears, that sweet voice of yours through all these days
[02:06.70] Those shy eyes filled with longing all these days
[02:09.59] Loving you leaves me spellbound, my heart fluttered without warning
[02:11.75] Never once did I have to wait or pine for anyone in the dim twilight
[02:14.68] Immersed into poetic rhymes, gazing foolishly in daydreams
[02:17.09] Don''t rush away and pretend not to care, with that cold and aloof expression
[02:19.75] Look at me, my love, give that sweet smile just to me
[02:21.84] Simply because I love you, it''s just my heart speaking up
[02:24.34] Hold my hand (hand), lean on my shoulder (shoulder)
[02:27.05] Stay by my side, right here you have me
[02:29.24] The wind carries a love song, a thousand shooting stars softly embrace you
[02:33.78] (<Love you, adore you, my heart is so sincere>)
[02:34.84] Hold my hand (hand), lean on my shoulder (shoulder)
[02:37.50] Stay by my side, right here you have me
[02:39.67] Close your eyes for a long moment
[02:41.12] Wishing to be together forever, passionately in love like day one
[02:45.02] Spring arrives peacefully, bringing me sweet dreams
[02:50.25] Summer preserves rainy days, poetic and sweet
[02:55.25] Autumn yellow leaves fall, winter comes, I miss you
[03:00.56] This little love of mine is dedicated solely to you
[03:05.88] Ah-ah-oh-oh-oh-oh-oh-oh-oh, missing you
[03:11.18] Oh-oh-oh-oh-oh-oh-oh-oh-oh, missing you so much
[03:17.02] Ah, beyond the horizon
[03:21.42] Is someone crossing the pathway home, walking with you down the long road ahead
[03:26.97] Hold my hand (hand), lean on my shoulder (shoulder)
[03:29.68] Stay by my side, right here you have me
[03:31.80] The wind carries a love song, a thousand shooting stars softly embrace you
[03:36.30] (<Love you, adore you, my heart is so sincere>)
[03:37.36] Hold my hand (hand), lean on my shoulder (shoulder)
[03:40.03] Stay by my side, right here you have me
[03:42.36] Close your eyes for a long moment
[03:43.71] Wishing to be together forever, passionately in love like day one (oh-oh)
[03:47.44] Spring arrives peacefully, bringing me sweet dreams
[03:52.75] Summer preserves rainy days, poetic and sweet
[03:57.97] Autumn yellow leaves fall, winter comes, I miss you
[04:03.27] This little love of mine is dedicated solely to you
[04:08.34]', 'CUSTOM', '2026-11-09 02:58:59.757439+00', 1, 2, 15);
INSERT INTO public.personal_lyrics VALUES (55, '2026-10-31 11:06:24.331+00', '[00:00.00]Baby em là một giấc mơ
[00:12.00]Mà anh không thể nào chạm tới...
[00:25.00]Khi màn đêm buông xuống nơi đây
[00:38.00]Chỉ còn nỗi nhớ đong đầy.', 'CUSTOM', '2026-10-31 11:06:24.331+00', 2, 5, 17);
INSERT INTO public.personal_lyrics VALUES (56, '2026-10-31 11:06:24.331+00', '[00:00.00]Em tìm lối ra nơi bảng exit sign
[00:14.00]Để lại con tim anh vỡ tan trong đêm dài...
[00:28.00]Liệu có cơ hội nào cho đôi ta bắt đầu lại?', 'CUSTOM', '2026-10-31 11:06:24.331+00', 3, 2, 18);
INSERT INTO public.personal_lyrics VALUES (57, '2026-10-31 11:06:24.331+00', '[00:00.00]Giữa đại lộ đông tây
[00:16.00]Có ai nghe thấy nỗi cô đơn này...
[00:32.00]Dòng xe vội vã lướt qua nhanh
[00:48.00]Chỉ còn em đứng lặng thầm.', 'CUSTOM', '2026-10-31 11:06:24.331+00', 4, 7, 19);
INSERT INTO public.personal_lyrics VALUES (58, '2026-10-31 11:06:24.331+00', '[00:00.00]Từng ngày tìm kiếm bóng hình em
[00:15.00]Dù biết yêu thương đã khuất xa ngoài tầm tay...
[00:30.00]Một lời hứa gió thoảng bay đi.', 'CUSTOM', '2026-10-31 11:06:24.331+00', 5, 2, 20);
INSERT INTO public.personal_lyrics VALUES (59, '2026-10-31 11:06:24.331+00', '[00:00.00]貴方の目にいつか映る
[00:15.00]晴れた日の空のように...
[00:30.00]風が吹き抜けるこの丘で
[00:45.00]歩き続ける物語。', 'CUSTOM', '2026-10-31 11:06:24.331+00', 6, 3, 21);
INSERT INTO public.personal_lyrics VALUES (60, '2026-10-31 11:06:24.331+00', '[00:00.00]残酷な天使のように
[00:10.00]少年よ 神話になれ...
[00:25.00]蒼い風がいま 胸のドアを叩いても
[00:40.00]私だけをただ見つめて
[00:55.00]微笑んでるあなた。', 'CUSTOM', '2026-10-31 11:06:24.331+00', 7, 3, 22);
INSERT INTO public.personal_lyrics VALUES (61, '2026-10-31 11:06:24.331+00', '[00:00.00]沈むように溶けてゆくように
[00:12.00]二人だけの空が広がる夜に...
[00:25.00]「さよなら」だけだった
[00:38.00]その一言で全てが分かった。', 'CUSTOM', '2026-10-31 11:06:24.331+00', 8, 2, 23);
INSERT INTO public.personal_lyrics VALUES (62, '2026-10-31 13:16:07.439776+00', '[00:00.00] Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50] ...
[00:10.25] Anh thường hay thức khuya
[00:11.80] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65] Rằng phải làm sao?
[00:15.88] Cũng chẳng biết đến bao giờ?
[00:20.30] Những lời ca dở dang
[00:21.91] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.69] Chạy theo đằng sau ánh sáng
[00:27.10] Cuối nơi chân trời
[00:29.48] Rồi em đến đây
[00:30.80] Dịu dàng cạnh bên anh
[00:33.07] Cơn mưa rơi trở nên long lanh
[00:35.46] Chẳng còn đợi trông
[00:37.47] Vì giấc mơ có em thêm màu xanh
[00:40.27] Thật lòng chẳng xa xôi
[00:43.07] Ước muốn anh ở ngay đây thôi
[00:45.85] Anh không bận tâm nữa
[00:47.46] Vì anh có em
[00:50.42] Nếu như ngày mai không diễn ra
[00:52.81] Giống cách mà anh cứ luôn mơ mộng?
[00:55.60] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.40] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99] Dặn lòng phải xứng đáng hơn
[01:05.98] Để anh trở thành chàng trai
[01:07.59] Top 1 trong mắt em
[01:11.34] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.06] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.46] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.07] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75] Bầu trời đêm okay cho nên không sao
[01:23.87] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.54] Dù cho phải gặp bao nhiêu gian khó
[01:27.79] Vẫn luôn là em dõi theo anh
[01:29.73] Dù anh đi đến đâu...
[01:31.59] Nếu như ngày mai không diễn ra
[01:33.99] Giống cách mà anh cứ luôn mơ mộng?
[01:36.78] Thì vẫn có một người luôn phía sau
[01:39.17] Nhẹ nắm tay anh
[01:41.59] Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78] Dặn lòng phải xứng đáng hơn
[01:46.79] Để anh trở thành chàng trai
[01:48.50] Top 1 trong mắt em
[01:52.50] Những cơ hội vụt qua đôi tay
[01:55.20] Vậy chắc chưa phải là ngày hôm nay
[01:57.79] Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.79] Từng câu nói mà anh
[02:00.90] Vẫn luôn tin vào
[02:02.48] Có những lần đôi mắt anh lạc phương hướng
[02:04.90] Để rồi đêm tối anh không về nhà
[02:07.68] Thì vẫn luôn là em
[02:08.87] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.46] Nếu như ngày mai không diễn ra
[02:15.31] Giống cách mà anh cứ luôn mơ mộng?
[02:18.11] Thì vẫn có một người luôn phía sau
[02:20.50] Nhẹ nắm tay anh
[02:22.90] Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50] Dặn lòng phải xứng đáng hơn
[02:28.50] Để anh trở thành chàng trai
[02:30.50] Top 1 trong mắt em...
[02:35.00] Top 1 trong mắt em
[02:40.00] Top 1 trong mắt em...
[02:46.00] ...
[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]', 'CUSTOM', '2026-10-31 13:16:07.438782+00', 13, 2, 24);
INSERT INTO public.personal_lyrics VALUES (65, '2026-11-05 17:34:25.045464+00', '[ti:Top 1 (Trong Mắt Em)]
[ar:buitruonglinh]
[al:Top 1 (Trong Mắt Em)]
[by:Antigravity]

[00:00.00]Top 1 (Trong Mắt Em) - buitruonglinh
[00:08.50]...
[00:10.25]Anh thường hay thức khuya
[00:11.80]Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.65]Rằng phải làm sao?
[00:15.88]Cũng chẳng biết đến bao giờ?
[00:20.30]Những lời ca dở dang
[00:21.91]Anh ngồi viết mãi vẫn còn chưa xong
[00:24.70]Chạy theo đằng sau ánh sáng
[00:27.10]Cuối nơi chân trời
[00:29.49]Rồi em đến đây
[00:30.80]Dịu dàng cạnh bên anh
[00:33.08]Cơn mưa rơi trở nên long lanh
[00:35.47]Chẳng còn đợi trông
[00:37.48]Vì giấc mơ có em thêm màu xanh
[00:40.27]Thật lòng chẳng xa xôi
[00:43.08]Ước muốn anh ở ngay đây thôi
[00:45.85]Anh không bận tâm nữa
[00:47.46]Vì anh có em
[00:50.43]Nếu như ngày mai không diễn ra
[00:52.81]Giống cách mà anh cứ luôn mơ mộng?
[00:55.60]Thì vẫn có một người luôn phía sau
[00:58.01]Nhẹ nắm tay anh
[01:00.41]Biết còn nhiều điều lo lắng đang vây quanh
[01:03.99]Dặn lòng phải xứng đáng hơn
[01:05.98]Để anh trở thành chàng trai
[01:07.59]Top 1 trong mắt em
[01:11.35]Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:14.07]Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:16.47]Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.08]Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.75]Bầu trời đêm okay cho nên không sao
[01:23.88]Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.55]Dù cho phải gặp bao nhiêu gian khó
[01:27.80]Vẫn luôn là em dõi theo anh
[01:29.74]Dù anh đi đến đâu...
[01:31.60]Nếu như ngày mai không diễn ra
[01:33.99]Giống cách mà anh cứ luôn mơ mộng?
[01:36.78]Thì vẫn có một người luôn phía sau
[01:39.17]Nhẹ nắm tay anh
[01:41.59]Biết còn nhiều điều lo lắng đang vây quanh
[01:44.78]Dặn lòng phải xứng đáng hơn
[01:46.80]Để anh trở thành chàng trai
[01:48.50]Top 1 trong mắt em
[01:52.50]Những cơ hội vụt qua đôi tay
[01:55.20]Vậy chắc chưa phải là ngày hôm nay
[01:57.80]Thì cứ tiếp tục để chạy theo tiếng gọi
[01:59.80]Từng câu nói mà anh
[02:00.91]Vẫn luôn tin vào
[02:02.49]Có những lần đôi mắt anh lạc phương hướng
[02:04.90]Để rồi đêm tối anh không về nhà
[02:07.69]Thì vẫn luôn là em
[02:08.87]Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:12.47]Nếu như ngày mai không diễn ra
[02:15.32]Giống cách mà anh cứ luôn mơ mộng?
[02:18.11]Thì vẫn có một người luôn phía sau
[02:20.50]Nhẹ nắm tay anh
[02:22.90]Biết còn nhiều điều lo lắng đang vây quanh
[02:26.50]Dặn lòng phải xứng đáng hơn
[02:28.50]Để anh trở thành chàng trai
[02:30.50]Top 1 trong mắt em...
[02:35.00]Top 1 trong mắt em
[02:40.00]Top 1 trong mắt em...
[02:46.00]...', 'CUSTOM', '2026-11-05 17:34:25.04396+00', 24, 1, 27);


--
-- Data for Name: playlist_tracks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:24.331', 10, 1, 1, 1);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:24.331', 10, 2, 1, 2);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:24.331', 10, 3, 1, 3);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:24.331', 10, 4, 1, 4);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:24.331', 10, 5, 1, 5);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:24.331', 10, 1, 2, 6);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:24.331', 10, 2, 2, 7);
INSERT INTO public.playlist_tracks VALUES ('2026-10-31 11:06:24.331', 10, 3, 2, 8);
INSERT INTO public.playlist_tracks VALUES ('2026-11-09 02:26:45.54402', 13, 1, 4, 3);
INSERT INTO public.playlist_tracks VALUES ('2026-11-09 02:27:16.265794', 13, 2, 4, 1);
INSERT INTO public.playlist_tracks VALUES ('2026-11-09 02:27:25.224615', 13, 3, 4, 5);


--
-- Data for Name: playlists; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.playlists VALUES (1, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', '2026-10-31 11:06:24.331', 10, 'Tuyển tập các bản hit V-Pop đỉnh cao', false, 'V-Pop Tuyển Chọn', 10, 'v-pop-tuyen-chon', 'V-Pop Tuyển Chọn', '2026-10-31 11:06:24.331', 'PUBLIC', 1);
INSERT INTO public.playlists VALUES (2, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', '2026-10-31 11:06:24.331', 10, 'Những bản nhạc Anime bất hủ', false, 'J-Pop / Anime Hits', 10, 'j-pop-anime-hits', 'J-Pop / Anime Hits', '2026-10-31 11:06:24.331', 'PUBLIC', 2);
INSERT INTO public.playlists VALUES (3, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793456436/soundwave/playlists/covers/user-2-playlist-cover-19248b7f-ddf4-485c-b75e-b26ce11df4bd.jpg', '2026-10-31 07:20:36.549721', 2, 'sdf', true, 'tổng hợp', 2, 'tong-hop', 'tổng hợp', '2026-10-31 07:20:36.549721', 'PRIVATE', 3);
INSERT INTO public.playlists VALUES (4, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1794216305/soundwave/playlists/covers/user-13-playlist-cover-42912a3f-1d78-4c81-9a12-b811fafc4c33.png', '2026-11-09 02:25:06.253209', 13, 'Lovely songs', true, 'Fav', 13, 'fav', 'Fav', '2026-11-09 02:27:25.643232', 'PRIVATE', 4);


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.refresh_tokens VALUES (3, '2026-10-31 04:49:25.328854', '2026-11-07 04:49:25.327855', NULL, '45346889b972ff13f2188a078294ee2122b7fe6cc315a20cd5aea8fc45502359', 1, NULL, 1);
INSERT INTO public.refresh_tokens VALUES (4, '2026-10-31 04:49:38.366089', '2026-11-07 04:49:38.366089', NULL, 'f749402a64211662531a2de2a1da68dbcf916a97878d7b4d7272b71c05ac5198', 2, NULL, 2);
INSERT INTO public.refresh_tokens VALUES (2, '2026-10-31 04:36:36.93654', '2026-11-30 04:36:36.93654', '2026-10-31 04:51:07.988284', '11a310d65b70bd68c4c2b7d892deca1caf3647e5c87a386cf529e03c4a33c342', NULL, 4, 3);
INSERT INTO public.refresh_tokens VALUES (7, '2026-10-31 04:56:02.988345', '2026-11-30 04:56:02.988345', '2026-10-31 05:01:38.82262', 'ee6fc009dbc0320a79779a6ca9cf6a1ad7aa00f0d4b07eeccf494f35696b804c', NULL, 2, 4);
INSERT INTO public.refresh_tokens VALUES (6, '2026-10-31 04:51:15.944849', '2026-11-30 04:51:15.944849', '2026-10-31 05:06:12.758325', '1f80e7807a894f4b0f252a09cf09b2d0542677b4d3f5663cb38e0afb31a33712', 2, NULL, 5);
INSERT INTO public.refresh_tokens VALUES (5, '2026-10-31 04:51:08.037918', '2026-11-07 04:51:08.037918', '2026-10-31 05:06:18.850216', 'dd837cda109f576507793247870d39623ddea30b2b2267f6a79f8efc2b597237', NULL, 4, 6);
INSERT INTO public.refresh_tokens VALUES (9, '2026-10-31 05:06:12.758325', '2026-11-07 05:06:12.758325', '2026-10-31 05:06:29.177277', '3c9e6de91c1fa5fa82601c47986b8998039c14c9efbbbf0adbd3f61adaf9dbe1', 2, NULL, 7);
INSERT INTO public.refresh_tokens VALUES (11, '2026-10-31 05:06:29.177277', '2026-11-07 05:06:29.177277', '2026-10-31 05:06:34.074181', '427e5b2595e8137a4ca8f5290d4b1aa9f5adcb7035d73335aa849163b8a0959a', 2, NULL, 8);
INSERT INTO public.refresh_tokens VALUES (12, '2026-10-31 05:06:34.075202', '2026-11-07 05:06:34.075202', '2026-10-31 05:06:53.895913', '3c543fcab5c75e43f813dfa47313c4cb46dac41c7931d60c41164d27c7b90687', 2, NULL, 9);
INSERT INTO public.refresh_tokens VALUES (13, '2026-10-31 05:06:53.895913', '2026-11-07 05:06:53.895913', '2026-10-31 05:08:16.597899', 'fb7618eb4f6d68a51dae70db47483d43306f983f6a9f267272fda99449b94a6e', 2, NULL, 10);
INSERT INTO public.refresh_tokens VALUES (14, '2026-10-31 05:08:16.597899', '2026-11-07 05:08:16.597899', '2026-10-31 05:08:48.614051', 'e168a5f2f64c07b9ccd019da4de1bb6e5753c6e913b92f78d9f4bbdf0e0199ec', 2, NULL, 11);
INSERT INTO public.refresh_tokens VALUES (15, '2026-10-31 05:08:48.614051', '2026-11-07 05:08:48.614051', '2026-10-31 05:15:53.218852', '65bae0b915c1a3e9b8076e4dc974968735121622ad84b613141dd17670b8a54b', 2, NULL, 12);
INSERT INTO public.refresh_tokens VALUES (8, '2026-10-31 05:01:39.085437', '2026-11-07 05:01:39.085437', '2026-10-31 05:16:58.383502', '40e21a697cc0a1b718a7f962b64f963cd812c5c7c17cabfd3a3e62f5ae9149b0', NULL, 2, 13);
INSERT INTO public.refresh_tokens VALUES (16, '2026-10-31 05:15:53.218852', '2026-11-07 05:15:53.218852', '2026-10-31 05:24:04.842879', 'da437ca236b42c43d6f3ee6d6c13430c7dab34ad2dab4e283352c8c80a712e39', 2, NULL, 14);
INSERT INTO public.refresh_tokens VALUES (18, '2026-10-31 05:24:04.843878', '2026-11-07 05:24:04.843878', '2026-10-31 05:24:10.925205', '62e04b6c60014e88952818752c3b8053c657b2759e682f012453649f5c709a51', 2, NULL, 15);
INSERT INTO public.refresh_tokens VALUES (17, '2026-10-31 05:16:58.44659', '2026-11-07 05:16:58.44659', '2026-10-31 05:24:30.886741', '71217ef7d44aa3e5fba64449a6ef8bc1a8af57f8571d9444d7571d4a4861bc68', NULL, 2, 16);
INSERT INTO public.refresh_tokens VALUES (20, '2026-10-31 05:24:30.954399', '2026-11-07 05:24:30.954399', '2026-10-31 05:24:32.620151', 'aa1554e11c9dc277710679774162978f8a95e09cff7186068c619cb21ca9e865', NULL, 2, 17);
INSERT INTO public.refresh_tokens VALUES (21, '2026-10-31 05:24:32.671431', '2026-11-07 05:24:32.671431', '2026-10-31 05:24:36.060647', 'b9257db40f914c41b0735dcfe45cf57bdc9c5e176708ba9f46cda099e909488d', NULL, 2, 18);
INSERT INTO public.refresh_tokens VALUES (22, '2026-10-31 05:24:36.108621', '2026-11-07 05:24:36.108621', '2026-10-31 05:24:36.331126', 'c721fafc990ef638565315356e3172f9233f21edc2c0e93d53b678673ba33415', NULL, 2, 19);
INSERT INTO public.refresh_tokens VALUES (23, '2026-10-31 05:24:36.375649', '2026-11-07 05:24:36.375649', '2026-10-31 05:24:36.712585', 'cf951cb84b6e5296ba74ab38828ed6970c57e8a89d66479c8f89c2500c09615a', NULL, 2, 20);
INSERT INTO public.refresh_tokens VALUES (24, '2026-10-31 05:24:36.752557', '2026-11-07 05:24:36.752557', '2026-10-31 05:24:45.902908', '660ba8af5328d3fef771f97a316b7e8f8c44ac28b2119afba032e937796fab76', NULL, 2, 21);
INSERT INTO public.refresh_tokens VALUES (19, '2026-10-31 05:24:10.926206', '2026-11-07 05:24:10.926206', '2026-10-31 05:24:47.263354', 'f33540201cf25a6a72aba17019f49ed51c1778dedbd5fe25683df8d1a978c02f', 2, NULL, 22);
INSERT INTO public.refresh_tokens VALUES (25, '2026-10-31 05:24:47.264415', '2026-11-07 05:24:47.264415', '2026-10-31 05:25:00.671622', '66eb694ec1a10f1e4d5a783e457d1cf1896d968bfb2294cc834b0c8ade107167', 2, NULL, 23);
INSERT INTO public.refresh_tokens VALUES (27, '2026-10-31 05:25:00.671622', '2026-11-07 05:25:00.671622', '2026-10-31 05:25:29.242822', 'd36bdc58fa91bd3fb57c43f96428211328de568d2aeb1d0e60f15c7dbef7cf2b', 2, NULL, 24);
INSERT INTO public.refresh_tokens VALUES (26, '2026-10-31 05:24:48.843515', '2026-11-30 05:24:48.843515', '2026-10-31 05:25:35.588097', '4ae52f3ccd4445bee8f9f057fbe1e42ec7c8299f709f1a54b24cd8d541781d2a', NULL, 2, 25);
INSERT INTO public.refresh_tokens VALUES (30, '2026-10-31 05:25:36.595888', '2026-11-07 05:25:36.595888', NULL, 'f4db2e859b19ff1c5c27da1d324e57a4de67fe530332a9d885c49374125ea716', NULL, 4, 26);
INSERT INTO public.refresh_tokens VALUES (10, '2026-10-31 05:06:18.978758', '2026-11-07 05:06:18.978758', '2026-10-31 05:25:36.546884', '79c7892c9a61e500fe02a22abf4f3ec395f0697734e1fd17d6fc674151e820a6', NULL, 4, 27);
INSERT INTO public.refresh_tokens VALUES (29, '2026-10-31 05:25:35.911807', '2026-11-07 05:25:35.911807', '2026-10-31 05:25:58.423017', '1515a1be39326e293bf317d0844f79794e3b7848eb238193ef33b0aafa2af18c', NULL, 2, 28);
INSERT INTO public.refresh_tokens VALUES (47, '2026-10-31 06:08:57.336015', '2026-11-07 06:08:57.336015', '2026-10-31 06:09:10.923204', '98efb86763a96ebf28e1ad229ee90a3645ca2be1947c9bb3ba81ad137b95704a', NULL, 2, 29);
INSERT INTO public.refresh_tokens VALUES (31, '2026-10-31 05:25:58.458372', '2026-11-07 05:25:58.458372', '2026-10-31 05:27:02.917242', '0d94e3a98f44b5fd6416fa1f6047e8ca3182f5aced4e133e9a19f637d63033c5', NULL, 2, 30);
INSERT INTO public.refresh_tokens VALUES (32, '2026-10-31 05:27:03.438209', '2026-11-07 05:27:03.438209', '2026-10-31 05:27:13.259319', 'efc3918453f2fea387af6a5243c2b37c5ce1db577215f2c41d175b9d5d89ebf7', NULL, 2, 31);
INSERT INTO public.refresh_tokens VALUES (37, '2026-10-31 05:42:58.53129', '2026-11-07 05:42:58.53129', '2026-10-31 05:52:48.137013', 'f198202e4655cf58baf1f99af160526c37f13695bb3ca840ab0c2ad7b7054ff3', NULL, 2, 32);
INSERT INTO public.refresh_tokens VALUES (33, '2026-10-31 05:27:13.375498', '2026-11-07 05:27:13.375498', '2026-10-31 05:27:38.016148', 'eeae3bc4b16e8ecc9f2b0ed9d159557b4014e9a09bdfafa9432259ef6c9dfcb9', NULL, 2, 33);
INSERT INTO public.refresh_tokens VALUES (35, '2026-10-31 05:34:18.495113', '2026-11-07 05:34:18.495113', NULL, '9e752e9f5137b0abc23b153fbb917056b4520e089923efb15b6aa3a121f976b6', NULL, 1, 34);
INSERT INTO public.refresh_tokens VALUES (1, '2026-10-31 04:19:57.254468', '2026-11-30 04:19:57.254468', '2026-10-31 05:34:18.441453', 'a5a67b523e15bfbf7145e114fa3541d273b72450375f727ea4e4b1b2c103d5d9', NULL, 1, 35);
INSERT INTO public.refresh_tokens VALUES (34, '2026-10-31 05:27:40.360184', '2026-11-30 05:27:40.360184', '2026-10-31 05:42:58.481951', '91d9194faeb43174b6216a73c7d83ef0cb5cfddb647b1aa3227972bfb2fa9398', NULL, 2, 36);
INSERT INTO public.refresh_tokens VALUES (36, '2026-10-31 05:34:20.961843', '2026-11-30 05:34:20.961843', '2026-10-31 05:49:36.96599', 'b8f2d8ff4da5aefbfbb4dbc561fe08ec1106a6af2d4d98d04e8e82462658b203', NULL, 1, 37);
INSERT INTO public.refresh_tokens VALUES (28, '2026-10-31 05:25:29.242822', '2026-11-07 05:25:29.242822', '2026-10-31 05:50:19.185355', '5cbf4c05adaf15a3129448fddeffa3f0e1180e8c6c750a2c6e32f86320ba5f03', 2, NULL, 38);
INSERT INTO public.refresh_tokens VALUES (39, '2026-10-31 05:50:19.185355', '2026-11-07 05:50:19.185355', '2026-10-31 05:51:57.788073', '14b2921f16681e1d87d49a822b3b3905fece8d826cdf7ea8ea570bf9d1d381f3', 2, NULL, 39);
INSERT INTO public.refresh_tokens VALUES (40, '2026-10-31 05:51:57.788073', '2026-11-07 05:51:57.788073', '2026-10-31 05:52:01.959743', '7a7354ff768728eecb689c14bd2c14cbe0a28a307ad6d0aa32917dcde3deb138', 2, NULL, 40);
INSERT INTO public.refresh_tokens VALUES (41, '2026-10-31 05:52:18.719438', '2026-11-30 05:52:18.719438', '2026-10-31 06:07:18.763913', '988ceee5990da48fa626e3bd8a554a6141226ddba192112dd691a06de563eeea', 2, NULL, 41);
INSERT INTO public.refresh_tokens VALUES (42, '2026-10-31 05:52:48.220181', '2026-11-07 05:52:48.220181', '2026-10-31 06:07:58.265548', '486336e4feae549b075099663d98d5e586216469499c9b587a50c6710f2a2ca8', NULL, 2, 42);
INSERT INTO public.refresh_tokens VALUES (46, '2026-10-31 06:08:43.631071', '2026-11-30 06:08:43.631071', '2026-10-31 06:08:57.308123', '48d9f7598771010b5628b25b856206192621b868216e5343e791f29bf2da982c', NULL, 2, 43);
INSERT INTO public.refresh_tokens VALUES (43, '2026-10-31 05:54:13.353478', '2026-11-30 05:54:13.353478', '2026-10-31 06:09:42.267182', '8daf4ceb0d0bc6a28c52d1f8840d5e3ac0f9352e5bf83391b2d4f836e38166d0', NULL, 2, 44);
INSERT INTO public.refresh_tokens VALUES (48, '2026-10-31 06:09:11.010381', '2026-11-07 06:09:11.010381', '2026-10-31 06:10:29.302541', 'f5bd6d9a1468c72af1037bae31b4afcccb4d7e78d293a04fa7819d96d6e70b93', NULL, 2, 45);
INSERT INTO public.refresh_tokens VALUES (49, '2026-10-31 06:09:42.295727', '2026-11-07 06:09:42.295727', '2026-10-31 06:14:12.036495', 'd018d5071455ca1d6fa0184baa0df07e7f06bd21d7a3d653ac90de531933e5a3', NULL, 2, 46);
INSERT INTO public.refresh_tokens VALUES (44, '2026-10-31 06:07:18.764911', '2026-11-07 06:07:18.763913', '2026-10-31 06:22:18.762259', 'eb99129f28b3571e1def57ffeeaf89914cbc0483cb1a2b355468ab1c5e13c3f9', 2, NULL, 47);
INSERT INTO public.refresh_tokens VALUES (45, '2026-10-31 06:07:58.306897', '2026-11-07 06:07:58.306897', '2026-10-31 06:22:58.252473', 'f121b0f6bce23b9e017d81553678b47503251a3117e69b3b98e75dac5d46c981', NULL, 2, 48);
INSERT INTO public.refresh_tokens VALUES (50, '2026-10-31 06:10:29.334221', '2026-11-07 06:10:29.334221', '2026-10-31 06:25:29.525912', 'c528f356baeb67b5b07f68ede95d60148719125d8190a49db967ab3d5e4595ab', NULL, 2, 49);
INSERT INTO public.refresh_tokens VALUES (52, '2026-10-31 06:14:12.075045', '2026-11-07 06:14:12.075045', '2026-10-31 06:25:43.198359', 'd0020a9d7db5c49a5f13eb8b45952154718da5d599152f5eb7071cea19434008', NULL, 2, 50);
INSERT INTO public.refresh_tokens VALUES (53, '2026-10-31 06:22:18.763194', '2026-11-07 06:22:18.763194', '2026-10-31 06:37:19.091281', 'ffde17d874c8cff00e0a5136dfd9db1863959df4afd3de2afc9867d067ffe319', 2, NULL, 51);
INSERT INTO public.refresh_tokens VALUES (55, '2026-10-31 06:25:29.554904', '2026-11-07 06:25:29.554904', '2026-10-31 06:40:40.713373', 'ea41d8655106a0a14cfb8d3523de763a07d425a0643117fa10c0ba25400dcbd0', NULL, 2, 52);
INSERT INTO public.refresh_tokens VALUES (56, '2026-10-31 06:25:43.409989', '2026-11-07 06:25:43.409989', '2026-10-31 06:40:44.388118', '75e4141776c6d75ca07a0fb3f68e474030acf51cb06c3b57074463d30cb4b9df', NULL, 2, 53);
INSERT INTO public.refresh_tokens VALUES (57, '2026-10-31 06:29:18.880274', '2026-11-07 06:29:18.880274', '2026-10-31 06:51:03.593821', 'cc51f4948a698895ee2ba104f4363657adc0f2fd666a974cfe711b74dba55b4c', NULL, 3, 54);
INSERT INTO public.refresh_tokens VALUES (38, '2026-10-31 05:49:37.0382', '2026-11-07 05:49:37.0382', '2026-10-31 06:42:49.787442', '94019046e2632b20c98ed8b251330c4b0eb17f6e043de7647b0fb0d662b7eabe', NULL, 1, 55);
INSERT INTO public.refresh_tokens VALUES (59, '2026-10-31 06:37:58.310318', '2026-11-07 06:37:58.310318', '2026-10-31 06:52:58.292346', '71ad43093483ec75ca7e015215e89f351f4cf8368c53f6bbfbc4b19939333f2c', NULL, 2, 56);
INSERT INTO public.refresh_tokens VALUES (51, '2026-10-31 06:13:57.007408', '2026-11-30 06:13:57.007408', '2026-10-31 06:29:18.821998', 'aef1b85a7a415015d49c67a733227a702b62fab8e242798be549b0fc8c92809b', NULL, 3, 57);
INSERT INTO public.refresh_tokens VALUES (58, '2026-10-31 06:37:19.091802', '2026-11-07 06:37:19.091802', '2026-10-31 06:52:21.6921', '1ce3f97804e4594f522700504a1d2fc7e6489c896d645e6599efa297f5646c00', 2, NULL, 58);
INSERT INTO public.refresh_tokens VALUES (701, '2026-11-08 21:01:37.309372', '2026-11-15 21:01:37.309372', '2026-11-08 21:01:52.176637', '166735af73fd9086ebf644cd928e4a1568e0e6dc9fa8d5d07dc53aae01fe22fa', 1, NULL, 59);
INSERT INTO public.refresh_tokens VALUES (718, '2026-11-09 00:09:48.446519', '2026-11-16 00:09:48.446519', '2026-11-09 00:24:48.425247', 'c968a90152c044b4adb5159e5bdf61d62c31404402212ad5748fefa271dd9fbf', NULL, 2, 60);
INSERT INTO public.refresh_tokens VALUES (719, '2026-11-09 00:24:48.451658', '2026-11-16 00:24:48.451658', '2026-11-09 00:39:48.456872', '0e6e6c175b224d60e649b34f9bb9107dfc267efc880f1b265472cf1161989261', NULL, 2, 61);
INSERT INTO public.refresh_tokens VALUES (720, '2026-11-09 00:39:48.487536', '2026-11-16 00:39:48.487536', '2026-11-09 00:54:48.465131', '710f8277a96dc343f08d31545106e679d01558f8c7353adc4e1a4dbbbf7db1f9', NULL, 2, 62);
INSERT INTO public.refresh_tokens VALUES (733, '2026-11-09 02:39:48.530464', '2026-11-16 02:39:48.530464', '2026-11-09 02:54:48.503205', '88ff287ca68c66b0d9c4ec27024aeb3ef6de33bcdf2639612ecef178fc5ca961', NULL, 2, 63);
INSERT INTO public.refresh_tokens VALUES (744, '2026-11-10 07:06:07.946038', '2026-12-10 07:06:07.946038', '2026-11-10 07:18:44.256259', '6c90fb10db1796148b416c03a737b37f51c76f44bfb3932d9dc9037acb8b21a6', 2, NULL, 64);
INSERT INTO public.refresh_tokens VALUES (762, '2026-11-12 03:45:11.137511', '2026-12-12 03:45:11.137511', '2026-11-12 04:00:14.447759', '7bb80677f9ce8a41e86c249251830592b2a00265618fd5a472eb02d0a5e899aa', 2, NULL, 65);
INSERT INTO public.refresh_tokens VALUES (612, '2026-11-07 09:44:15.366405', '2026-11-14 09:44:15.366405', '2026-11-07 09:48:33.259787', '5d2fc4ec4f9fed9da4d36ae9a105e8e2ca8b1841302fc8ffc4c9b69b7889fcb1', 2, NULL, 66);
INSERT INTO public.refresh_tokens VALUES (621, '2026-11-07 09:56:13.984141', '2026-11-14 09:56:13.984141', '2026-11-07 10:11:16.661305', '61f2aef4154a24c0a1e3d7bae51c59779963d370e329271e4e75f0b6d2ee46ba', NULL, 2, 67);
INSERT INTO public.refresh_tokens VALUES (635, '2026-11-07 10:34:37.683797', '2026-11-14 10:34:37.683797', '2026-11-07 10:49:37.577891', 'dc9387c9f5381f037b2d8811e50133d0d916876087ed1bca3c1d0dc555e172cd', NULL, 3, 68);
INSERT INTO public.refresh_tokens VALUES (658, '2026-11-08 19:34:18.843092', '2026-11-15 19:34:18.843092', '2026-11-08 19:34:27.820932', '899cd8d781e74bb5c9ce8d9bc47ff38f23245a63d808d55d698f78503e4613d6', 1, NULL, 69);
INSERT INTO public.refresh_tokens VALUES (659, '2026-11-08 19:35:00.927106', '2026-12-08 19:35:00.927106', '2026-11-08 19:39:15.416181', '8f18e61d14b80774e1b9a70d9175ded5b0b7ec723fb5a98a9f241e44caf0451e', 1, NULL, 70);
INSERT INTO public.refresh_tokens VALUES (664, '2026-11-08 19:44:29.266488', '2026-11-15 19:44:29.266488', NULL, '6038fb1555945d4fefe31155043da574ebdc4181d69470508eff1e1bbddcd2d4', NULL, 2, 71);
INSERT INTO public.refresh_tokens VALUES (663, '2026-11-08 19:43:44.172258', '2026-12-08 19:43:44.172258', '2026-11-08 19:44:29.427344', 'ca078930673c6b12550f6280b2aa34e3e4e498ee01049b8f4fdc030beb16f0d0', NULL, 2, 72);
INSERT INTO public.refresh_tokens VALUES (669, '2026-11-08 19:48:39.961946', '2026-12-08 19:48:39.961946', '2026-11-08 19:51:58.42888', 'f47eb9143b29ac90442e6b0af457f46d616a044cb7016fd819fb0789da72a1c4', NULL, 2, 73);
INSERT INTO public.refresh_tokens VALUES (678, '2026-11-08 19:55:22.081838', '2026-12-08 19:55:22.081838', '2026-11-08 19:56:26.167061', 'd35160a75e4fd09497c5dbff86a475bcac3835a40d8fb2f6b2e906113fb29c2b', NULL, 2, 74);
INSERT INTO public.refresh_tokens VALUES (682, '2026-11-08 20:06:48.593866', '2026-11-15 20:06:48.593866', '2026-11-08 20:21:48.343444', '67a62114ae65161788494cc736e29866518596f0bdf1f68a5bf0c56f8a68499f', NULL, 2, 75);
INSERT INTO public.refresh_tokens VALUES (690, '2026-11-08 20:37:02.315841', '2026-11-15 20:37:02.315841', '2026-11-08 20:52:48.332781', '3075103a508c47f3f3c573f49dfd6f5ed272535febbf42929346f6dddf6cb564', NULL, 2, 76);
INSERT INTO public.refresh_tokens VALUES (54, '2026-10-31 06:22:58.297124', '2026-11-07 06:22:58.297124', '2026-10-31 06:37:58.26615', 'eb532f3cfd5eebeb01cd7b3108ba2653aa3ba7123d38b8c832285ae98ebd9f2f', NULL, 2, 77);
INSERT INTO public.refresh_tokens VALUES (62, '2026-10-31 06:42:49.605812', '2026-11-07 06:42:49.605812', NULL, '03ff40b74663d1427d5c8d5735d75951c6c4265f326e221a6ada106760bf2a04', NULL, 1, 78);
INSERT INTO public.refresh_tokens VALUES (61, '2026-10-31 06:40:44.456211', '2026-11-07 06:40:44.456211', '2026-10-31 06:51:08.978177', '18672dc0b27a74181e2af191a01aeead984f87a33cbd8878958533eaa40b3299', NULL, 2, 79);
INSERT INTO public.refresh_tokens VALUES (64, '2026-10-31 06:51:03.625345', '2026-11-07 06:51:03.625345', '2026-10-31 06:52:46.889594', '7895565312ad4f0bd9714048c573468bbc42fd5c3107b19361f0943e0ceacc34', NULL, 3, 80);
INSERT INTO public.refresh_tokens VALUES (66, '2026-10-31 06:52:21.6921', '2026-11-07 06:52:21.6921', '2026-10-31 06:52:59.709573', '25fd516f1c861e61a9e2b81fb0e6f01ff4758cacf06098fd89b7921e905cec65', 2, NULL, 81);
INSERT INTO public.refresh_tokens VALUES (65, '2026-10-31 06:51:09.017413', '2026-11-07 06:51:09.017413', '2026-10-31 06:53:47.100126', '163de489401d4598ae9bca488a52c1b7d308b81d624dc936f39ef2c70a7b2f09', NULL, 2, 82);
INSERT INTO public.refresh_tokens VALUES (60, '2026-10-31 06:40:40.741377', '2026-11-07 06:40:40.741377', '2026-10-31 06:55:40.813873', '95c749670d05b96d019837fc61076154bdf9564af652e5b2ab980c36670ead86', NULL, 2, 83);
INSERT INTO public.refresh_tokens VALUES (72, '2026-10-31 06:57:58.073', '2026-11-07 06:57:58.073', NULL, 'd32fdf2fdb559d8b49d562d20c6e92155d78d3a08f2acbeeae03d8b1c7960c4d', NULL, 2, 84);
INSERT INTO public.refresh_tokens VALUES (70, '2026-10-31 06:53:47.189271', '2026-11-07 06:53:47.189271', '2026-10-31 06:57:57.961116', 'ff07ec3803de4d4666c37d370b59eeaa9ed74d6a65b43861e25cb870c7336fc0', NULL, 2, 85);
INSERT INTO public.refresh_tokens VALUES (63, '2026-10-31 06:42:49.831237', '2026-11-07 06:42:49.831237', '2026-10-31 06:58:36.922932', 'c74d49666555a0ea52183cb16d17e4fc29e225937b9c721b7d96cb61f0abe14e', NULL, 1, 86);
INSERT INTO public.refresh_tokens VALUES (71, '2026-10-31 06:55:40.942033', '2026-11-07 06:55:40.942033', '2026-10-31 07:01:36.698145', 'e323e8c5b9438ca4c00d1303d4703901ea29a304839e357b3c2abf031d10082e', NULL, 2, 87);
INSERT INTO public.refresh_tokens VALUES (74, '2026-10-31 07:01:36.777599', '2026-11-07 07:01:36.777599', '2026-10-31 07:01:44.447039', 'd68783ebe6f1f7a2b6737f87cf7e967351398e56253874281240837ce362f971', NULL, 2, 88);
INSERT INTO public.refresh_tokens VALUES (68, '2026-10-31 06:52:58.342466', '2026-11-07 06:52:58.342466', '2026-10-31 07:02:49.635561', '9606efad1d3a66f9edabe09fe6c898ad224dd6bfd717788303a1eb1368d6c96b', NULL, 2, 89);
INSERT INTO public.refresh_tokens VALUES (67, '2026-10-31 06:52:47.151605', '2026-11-07 06:52:47.151605', '2026-10-31 07:04:44.189301', 'bf9ddebbe5d10e1ec268ba387b99e9a2a6709da924324b0b055201ae98f36c58', NULL, 3, 90);
INSERT INTO public.refresh_tokens VALUES (69, '2026-10-31 06:52:59.710159', '2026-11-07 06:52:59.710159', '2026-10-31 07:04:48.539581', 'f8f92bc2b924af2d4752b86449afe32964641a9b97c76666d3ffde03bb9caf72', 2, NULL, 91);
INSERT INTO public.refresh_tokens VALUES (78, '2026-10-31 07:04:48.539581', '2026-11-07 07:04:48.539581', '2026-10-31 07:06:12.068021', '328cac274a64137f63641393fb7226df04f8d43487ac903cd78cba74236decb9', 2, NULL, 92);
INSERT INTO public.refresh_tokens VALUES (76, '2026-10-31 07:02:49.685068', '2026-11-07 07:02:49.685068', '2026-10-31 07:07:58.540798', '0c1a548f02ef2d2f142e33c153e0986a81416fb81758969416344d4154c4e2d4', NULL, 2, 93);
INSERT INTO public.refresh_tokens VALUES (80, '2026-10-31 07:07:58.574216', '2026-11-07 07:07:58.574216', '2026-10-31 07:08:58.400673', '715c4428156dffbc2c0ee83599590f3bc410a02097811738435d13f61e1a0a95', NULL, 2, 94);
INSERT INTO public.refresh_tokens VALUES (81, '2026-10-31 07:08:58.440673', '2026-11-07 07:08:58.440673', '2026-10-31 07:08:59.382481', '0662da33a988224641f9e056903ac5c0a08367ca725da12e2dd0072a00a5e488', NULL, 2, 95);
INSERT INTO public.refresh_tokens VALUES (79, '2026-10-31 07:06:12.068021', '2026-11-07 07:06:12.068021', '2026-10-31 07:09:07.067949', '7a231aba1dfbe59e8be97627ca211454a36ea3b7372840c6dd83aa065a98d35a', 2, NULL, 96);
INSERT INTO public.refresh_tokens VALUES (82, '2026-10-31 07:08:59.426481', '2026-11-07 07:08:59.426481', '2026-10-31 07:09:58.403202', '501b6c12b686cc500a5d90162b0254818a8d5fbeca13b88ee5a6b2ac016941f3', NULL, 2, 97);
INSERT INTO public.refresh_tokens VALUES (84, '2026-10-31 07:09:58.445007', '2026-11-07 07:09:58.445007', '2026-10-31 07:09:59.396211', '2d975e70579692f2cb75e94aa2f49771b644cef0061b9c82ebdc58d1ebb4381a', NULL, 2, 98);
INSERT INTO public.refresh_tokens VALUES (85, '2026-10-31 07:09:59.428034', '2026-11-07 07:09:59.428034', '2026-10-31 07:10:58.897261', '731a7be4f70b279f4460d19e9780b4d6cd6bbc99cd6dd3091ca96ce001f61b64', NULL, 2, 99);
INSERT INTO public.refresh_tokens VALUES (86, '2026-10-31 07:10:58.942244', '2026-11-07 07:10:58.942244', '2026-10-31 07:11:58.388785', 'fdbc9544eca9ac78e9fb5fd963307627fe31f55d8c04c28777ceb48e34949918', NULL, 2, 100);
INSERT INTO public.refresh_tokens VALUES (87, '2026-10-31 07:11:58.433438', '2026-11-07 07:11:58.433438', '2026-10-31 07:12:58.344605', 'ec3cb5852a257cc2edafcdc57cb81fa4f17e45897f8ed66a5335629dba78799c', NULL, 2, 101);
INSERT INTO public.refresh_tokens VALUES (90, '2026-10-31 07:14:58.447323', '2026-11-07 07:14:58.447323', '2026-10-31 07:15:58.879001', '52c3816858c80233a147fab0e6ccce036d1cccdfdc1a9f9ef069466ec7b4ded6', NULL, 2, 102);
INSERT INTO public.refresh_tokens VALUES (83, '2026-10-31 07:09:07.068915', '2026-11-07 07:09:07.068915', '2026-10-31 07:19:54.158781', 'af3b1bd1ab84dc3ef8337a8d0d0367e132b988c751ae5f60abab182538d4ce72', 2, NULL, 103);
INSERT INTO public.refresh_tokens VALUES (88, '2026-10-31 07:12:58.387405', '2026-11-07 07:12:58.387405', '2026-10-31 07:13:59.020182', '38d49c7c23f4098d09b04d9ce84044cc88948af80c1b770905f48d2783dbefa1', NULL, 2, 104);
INSERT INTO public.refresh_tokens VALUES (97, '2026-10-31 07:18:59.12357', '2026-11-07 07:18:59.12357', '2026-10-31 07:19:58.833088', '7206938fd385ca2d704cc976c9f8bac939a93da710e91b19068836822d39df32', NULL, 2, 105);
INSERT INTO public.refresh_tokens VALUES (75, '2026-10-31 07:01:44.474604', '2026-11-07 07:01:44.474604', '2026-10-31 07:16:45.718565', '12e799fcefb1e5b30a6f2eeea7b48d561c0c550614efdc39b44688af04b81cd8', NULL, 2, 106);
INSERT INTO public.refresh_tokens VALUES (91, '2026-10-31 07:15:58.926439', '2026-11-07 07:15:58.926439', '2026-10-31 07:16:58.413594', 'ff6e0e70354be013e7b0c44b6e71df84effe3896cd5203261f34c27a84486f09', NULL, 2, 107);
INSERT INTO public.refresh_tokens VALUES (99, '2026-10-31 07:19:58.876736', '2026-11-07 07:19:58.876736', '2026-10-31 07:20:58.892219', 'ce63a4dd0fd7d546f1b96370a720eabd16c3428c20ce0c8792e23a154d41d133', NULL, 2, 108);
INSERT INTO public.refresh_tokens VALUES (89, '2026-10-31 07:13:59.065828', '2026-11-07 07:13:59.065828', '2026-10-31 07:14:58.403494', 'fe955379d860b58505db10392eebd6ac7484c59c37c0a6165a2e339951bffc60', NULL, 2, 109);
INSERT INTO public.refresh_tokens VALUES (93, '2026-10-31 07:16:58.458642', '2026-11-07 07:16:58.458642', '2026-10-31 07:17:58.83914', '8201beb0f7c822de2dab2737a31a01dc69f31034dc4597809a247af1105a8ad6', NULL, 2, 110);
INSERT INTO public.refresh_tokens VALUES (92, '2026-10-31 07:16:45.745566', '2026-11-07 07:16:45.745566', '2026-10-31 07:18:31.544183', '443a9a406fe008636b7161c7f1d2ac649d429a4ede9480c997cd8fb9720c58a4', NULL, 2, 111);
INSERT INTO public.refresh_tokens VALUES (100, '2026-10-31 07:20:58.940361', '2026-11-07 07:20:58.940361', '2026-10-31 07:21:58.841239', '9fed4ae7e7328999000ff5fdb8f53d29dbd3f4067f67796af6d2c336a2e442c2', NULL, 2, 112);
INSERT INTO public.refresh_tokens VALUES (101, '2026-10-31 07:21:58.885121', '2026-11-07 07:21:58.885121', '2026-10-31 07:22:58.504583', 'f89043ae10d3a38285d65a63f372341c564ecd3bf4b0d492ff40e2d39159c75f', NULL, 2, 113);
INSERT INTO public.refresh_tokens VALUES (77, '2026-10-31 07:04:44.274498', '2026-11-07 07:04:44.274498', '2026-10-31 07:23:39.914509', 'c63aac8a977c85b57fe8abcab811d0217470969f4c71de4a215d4c3b99670427', NULL, 3, 114);
INSERT INTO public.refresh_tokens VALUES (94, '2026-10-31 07:17:58.894826', '2026-11-07 07:17:58.894826', '2026-10-31 07:18:59.076072', 'be1b517df7c033ec36ed3d0d4f704d45c2014d55bc1dd5722e1e5ac225c26f5e', NULL, 2, 115);
INSERT INTO public.refresh_tokens VALUES (102, '2026-10-31 07:22:58.793436', '2026-11-07 07:22:58.793436', '2026-10-31 07:23:58.402449', '6bc699a8f1efd5b73c76eb53929a2e05fc16ead97e48dca1004d363daea484b5', NULL, 2, 116);
INSERT INTO public.refresh_tokens VALUES (96, '2026-10-31 07:18:55.286832', '2026-11-30 07:18:55.28583', '2026-10-31 07:24:30.481532', 'a601b2085e6690299514636782b310396da634671a8b7fab096546ab03ab2d69', NULL, 2, 117);
INSERT INTO public.refresh_tokens VALUES (105, '2026-10-31 07:24:30.522543', '2026-11-07 07:24:30.522543', '2026-10-31 07:24:38.634858', 'ffcd5c7ec40a793a20b78dfaf60c6b14ae2033a8ebaefddf8f7ca5be116d193e', NULL, 2, 118);
INSERT INTO public.refresh_tokens VALUES (106, '2026-10-31 07:24:41.761615', '2026-11-30 07:24:41.761615', NULL, '2ff888e8bc63977c2f51f0001635b0b17f5ed0738907a31dd26c61bf358cf18e', NULL, 2, 119);
INSERT INTO public.refresh_tokens VALUES (104, '2026-10-31 07:23:58.450131', '2026-11-07 07:23:58.450131', '2026-10-31 07:24:58.385496', '94fdcc35bf4fef9b062b6bef790cef06586d1df790f8e50fc7c0cba0c4d0b92c', NULL, 2, 120);
INSERT INTO public.refresh_tokens VALUES (107, '2026-10-31 07:24:58.433897', '2026-11-07 07:24:58.433897', '2026-10-31 07:25:58.38166', '3e10f68ba2313bca1fe18ab42a8880c87d6b0463e4354f54ba344bf416670a90', NULL, 2, 121);
INSERT INTO public.refresh_tokens VALUES (108, '2026-10-31 07:25:58.412374', '2026-11-07 07:25:58.412374', '2026-10-31 07:26:58.33397', '9f2235f22a4ff2cd32ce5f4fdaac974c8bfa7a423b17b8ba0add34f5fac4ab4c', NULL, 2, 122);
INSERT INTO public.refresh_tokens VALUES (109, '2026-10-31 07:26:58.381602', '2026-11-07 07:26:58.381602', '2026-10-31 07:27:58.337431', '593415931c9b7d295929c377b3344ab7a0e8173b77aac2c8750c9492a68ba9c1', NULL, 2, 123);
INSERT INTO public.refresh_tokens VALUES (110, '2026-10-31 07:27:58.368868', '2026-11-07 07:27:58.368868', '2026-10-31 07:28:58.879234', '520e9f85c740ef773c61ce80b10118296d5b3d445478e179b397976959876e1f', NULL, 2, 124);
INSERT INTO public.refresh_tokens VALUES (111, '2026-10-31 07:28:58.925525', '2026-11-07 07:28:58.925525', '2026-10-31 07:29:58.819548', '02c0b6e0b3c31fc4c6369d1bdded4325a4ddede0a2803b5efd291e3ac4a8749e', NULL, 2, 125);
INSERT INTO public.refresh_tokens VALUES (112, '2026-10-31 07:29:58.877165', '2026-11-07 07:29:58.877165', '2026-10-31 07:30:58.773373', '0404776658f80eb92d21551c5695e351503829c9f0e36f55243429bd2256f805', NULL, 2, 126);
INSERT INTO public.refresh_tokens VALUES (622, '2026-11-07 09:58:45.470695', '2026-11-14 09:58:45.470695', NULL, '0533723e6b58087f955bad989648f7e2fa6bd4a5c3e69ea05e91b8d4058c2482', NULL, 2, 127);
INSERT INTO public.refresh_tokens VALUES (113, '2026-10-31 07:30:58.822961', '2026-11-07 07:30:58.822961', '2026-10-31 07:31:58.406862', 'f5b816cde4f1ca6d522aed83ac5457c74a3c472757b83726c9815c65eba4e98c', NULL, 2, 128);
INSERT INTO public.refresh_tokens VALUES (95, '2026-10-31 07:18:31.571381', '2026-11-07 07:18:31.571381', '2026-10-31 07:33:39.859125', 'accec6ba26fef9c237e20f1ff4949028b363177bb81949004dad0d522f27d359', NULL, 2, 129);
INSERT INTO public.refresh_tokens VALUES (117, '2026-10-31 07:33:58.449593', '2026-11-07 07:33:58.449593', '2026-10-31 07:34:58.794072', 'bcce65c587f8a3115cfcec866957856c6dd4d84735e49e676463d88ce9b0a85d', NULL, 2, 130);
INSERT INTO public.refresh_tokens VALUES (98, '2026-10-31 07:19:54.159353', '2026-11-07 07:19:54.159353', '2026-10-31 07:35:18.7482', '0a653184280b3c6b7a95b158c0c738fde0f787f21c779abdf71045092f516eed', 2, NULL, 131);
INSERT INTO public.refresh_tokens VALUES (103, '2026-10-31 07:23:39.988664', '2026-11-07 07:23:39.988664', '2026-10-31 07:49:52.944995', '36ecbae728e9f35e96b76b3ddeabc183dc7b277115190a01d9601672c67a9959', NULL, 3, 132);
INSERT INTO public.refresh_tokens VALUES (73, '2026-10-31 06:58:36.966791', '2026-11-07 06:58:36.966791', '2026-10-31 08:02:25.23661', 'cd3e610f41dfad29774746529a43fd89931b1cdc5a70eb0944f1d7e8d3dfa8f1', NULL, 1, 133);
INSERT INTO public.refresh_tokens VALUES (114, '2026-10-31 07:31:58.450558', '2026-11-07 07:31:58.450558', '2026-10-31 07:32:58.803912', '2df3c9e298081d3111660d3057c91de1a722c043444b976fb5e011fb2bb813e4', NULL, 2, 134);
INSERT INTO public.refresh_tokens VALUES (116, '2026-10-31 07:33:39.960936', '2026-11-07 07:33:39.960936', '2026-10-31 07:48:40.979952', '40391fd8e107f99f905187fa658c645fb80a401b86787aaf03b7200637329e93', NULL, 2, 135);
INSERT INTO public.refresh_tokens VALUES (702, '2026-11-08 21:02:13.265733', '2026-12-08 21:02:13.265733', '2026-11-08 21:02:17.292614', '6553a443771f46a3a343f9867e1118115626bf9b33a9a051ab10ffda7f4a988d', NULL, 2, 136);
INSERT INTO public.refresh_tokens VALUES (693, '2026-11-08 20:38:40.231903', '2026-11-15 20:38:40.231903', '2026-11-08 21:26:34.894969', '4bb14d4a47c629de2ddeaa79107914312c86bcaf20bd4ae261f5a2342a5d6c66', 2, NULL, 137);
INSERT INTO public.refresh_tokens VALUES (716, '2026-11-08 23:07:26.855815', '2026-11-15 23:07:26.855815', NULL, '417f309ddd17475dab477096035da0a7664481905790c06d53c4f0090bbb52db', NULL, 2, 138);
INSERT INTO public.refresh_tokens VALUES (602, '2026-11-07 09:28:30.620081', '2026-11-14 09:28:30.620081', '2026-11-07 09:44:15.366405', 'fde85d1a58734e5b9818f2242ff64426118393f038f7ee144cb7e205e077095e', 2, NULL, 139);
INSERT INTO public.refresh_tokens VALUES (616, '2026-11-07 09:48:33.260629', '2026-11-14 09:48:33.260629', '2026-11-07 09:49:43.541203', '123dce87a288b5812b196e006a1cffb7a31b56bfc604a6f05100972c78cdf032', 2, NULL, 140);
INSERT INTO public.refresh_tokens VALUES (636, '2026-11-07 10:35:15.373761', '2026-11-14 10:35:15.373761', '2026-11-07 10:53:19.218971', 'b130629c8fad48bcfdc17763b353f99e9235ee5d52306f3805ec8e7fad8c208b', 2, NULL, 141);
INSERT INTO public.refresh_tokens VALUES (662, '2026-11-08 19:43:12.448677', '2026-12-08 19:43:12.448677', '2026-11-08 19:58:54.434281', '9250b8260d191bd4aa7ddb158949895c04e868babe6631ba2f61b976034ed6b4', NULL, 2, 142);
INSERT INTO public.refresh_tokens VALUES (683, '2026-11-08 20:08:00.532693', '2026-11-15 20:08:00.532693', '2026-11-08 20:23:00.580163', '1a1f69935da128ef294b0d1c8d573aa01b51dac406104d8513d66d950eb1261e', 2, NULL, 143);
INSERT INTO public.refresh_tokens VALUES (623, '2026-11-07 09:59:19.47408', '2026-11-14 09:59:19.47408', '2026-11-08 20:34:19.876596', '444145d740452f9a57ef71dc08729ef8cbd61064a501675daf219db1474b607f', NULL, 2, 144);
INSERT INTO public.refresh_tokens VALUES (691, '2026-11-08 20:38:00.504694', '2026-11-15 20:38:00.504694', '2026-11-08 20:38:40.231903', '74d7a1a3e33e46ca2d9b54c99764bef8ab1657f2e1d328b18cd88136d8528ac7', 2, NULL, 145);
INSERT INTO public.refresh_tokens VALUES (732, '2026-11-09 02:36:19.966394', '2026-12-09 02:36:19.966394', '2026-11-09 02:47:09.892593', '14680e3aa94a2b0bce15ed979172a33fd568b54eacfe3cb83cd81a5c13bc6c97', NULL, 2, 146);
INSERT INTO public.refresh_tokens VALUES (735, '2026-11-09 02:51:06.415865', '2026-12-09 02:51:06.415865', '2026-11-09 02:53:13.663099', 'e27857cac5158565c2c5ebfeca9eb2b5894a5889dfe1099a4ad9523aef2c069c', NULL, 2, 147);
INSERT INTO public.refresh_tokens VALUES (745, '2026-11-10 07:19:00.999124', '2026-12-10 07:19:00.999124', '2026-11-10 07:34:14.155151', 'f42de08614274330442755db9f9514eb793498b126bea7854cdb9c9a687718e9', NULL, 2, 148);
INSERT INTO public.refresh_tokens VALUES (761, '2026-11-12 03:41:14.569939', '2026-11-19 03:41:14.569939', '2026-11-12 03:57:14.469957', 'c378edcaedd4735b6e5688a68180e3ae2c61988f76d3b18721dc0217fe66139a', NULL, 2, 149);
INSERT INTO public.refresh_tokens VALUES (763, '2026-11-12 03:57:14.567497', '2026-11-19 03:57:14.567497', '2026-11-12 04:12:30.328632', '2c327fe68104d6b5f977821795f35fb447620f15265b7ff1a002bf6b92476c1e', NULL, 2, 150);
INSERT INTO public.refresh_tokens VALUES (115, '2026-10-31 07:32:58.854166', '2026-11-07 07:32:58.854166', '2026-10-31 07:33:58.401818', 'c893cd3111186dfb75200420e4573561763ded91bd311e09967c791518ee6634', NULL, 2, 151);
INSERT INTO public.refresh_tokens VALUES (118, '2026-10-31 07:34:58.824239', '2026-11-07 07:34:58.824239', '2026-10-31 07:35:58.9638', '606bcac292194a4ecbf27a07d08ede25413da7e9feb3ef8723441350d724b5a1', NULL, 2, 152);
INSERT INTO public.refresh_tokens VALUES (120, '2026-10-31 07:35:59.008336', '2026-11-07 07:35:59.008336', '2026-10-31 07:36:58.382625', 'b555073da7f74b05f84e38f4520ab023a53fe7c6fd4274b467000aca072a9707', NULL, 2, 153);
INSERT INTO public.refresh_tokens VALUES (121, '2026-10-31 07:36:58.435376', '2026-11-07 07:36:58.435376', '2026-10-31 07:37:58.388174', '9a49d860992ce48bd20cbd4b18513814ddcfe87e916921a14b8b09971d692207', NULL, 2, 154);
INSERT INTO public.refresh_tokens VALUES (122, '2026-10-31 07:37:58.430778', '2026-11-07 07:37:58.430778', '2026-10-31 07:38:58.878287', 'e06387fd3711434294f4854d8663c9d4f3f861289a019c939cf324f4574f03d9', NULL, 2, 155);
INSERT INTO public.refresh_tokens VALUES (123, '2026-10-31 07:38:58.912897', '2026-11-07 07:38:58.912897', '2026-10-31 07:39:58.334484', 'fbd91d0bc3a94ee7dfc14391d00d09e95836caeecadd30d7c34c5f38a840d060', NULL, 2, 156);
INSERT INTO public.refresh_tokens VALUES (124, '2026-10-31 07:39:58.381979', '2026-11-07 07:39:58.381979', '2026-10-31 07:40:58.363382', '2e661df0af42c84bc30f24ae9a23ed6a554f88b8990db702ff989cf965ac065c', NULL, 2, 157);
INSERT INTO public.refresh_tokens VALUES (125, '2026-10-31 07:40:58.411176', '2026-11-07 07:40:58.411176', '2026-10-31 07:41:58.987489', '96a19f34c5f83aceb94cdc2c5a4f714cd648af6560c6dda7df92ff907ca7f0d9', NULL, 2, 158);
INSERT INTO public.refresh_tokens VALUES (126, '2026-10-31 07:41:59.032405', '2026-11-07 07:41:59.032405', '2026-10-31 07:43:00.489044', '5c7c3653a0e8e74fa8b925aa675b778ef22b19e58cb061fe29eda8d768eebde1', NULL, 2, 159);
INSERT INTO public.refresh_tokens VALUES (127, '2026-10-31 07:43:00.530738', '2026-11-07 07:43:00.530738', '2026-10-31 07:43:58.421065', '9a09507ba6cb1d7d69538914a71e70483f4bc7e2c17ff99af3d2b824e5929e42', NULL, 2, 160);
INSERT INTO public.refresh_tokens VALUES (128, '2026-10-31 07:43:58.490222', '2026-11-07 07:43:58.490222', '2026-10-31 07:44:58.846843', '734707a604da28fcc287386f6cf3ccff7726bf1a8c5e346bd15174b776efa5a8', NULL, 2, 161);
INSERT INTO public.refresh_tokens VALUES (129, '2026-10-31 07:44:40.423417', '2026-11-30 07:44:40.423417', '2026-10-31 07:45:21.089402', '0621488b37bd9c4c184ba664afce0bd279989e9dd3d8ad2bfdb9c3e7827b409c', NULL, 2, 162);
INSERT INTO public.refresh_tokens VALUES (131, '2026-10-31 07:45:21.118648', '2026-11-07 07:45:21.118648', '2026-10-31 07:45:41.354589', '2e2a406bdbf7e78ec8583211f58d3b5d8655e13fd36221bdd27ffd5f8a787e7b', NULL, 2, 163);
INSERT INTO public.refresh_tokens VALUES (130, '2026-10-31 07:44:58.887294', '2026-11-07 07:44:58.887294', '2026-10-31 07:45:58.39066', '7c79b22c8ea94c37f8899eab376f798b4e8e2ef4dd063eb867a5b6097c317580', NULL, 2, 164);
INSERT INTO public.refresh_tokens VALUES (132, '2026-10-31 07:45:41.380411', '2026-11-07 07:45:41.380411', '2026-10-31 07:46:02.345515', 'c64ca9ed3870af822bd496b3dd59e6430050bdc9e86ad5538e730531ba9378ba', NULL, 2, 165);
INSERT INTO public.refresh_tokens VALUES (134, '2026-10-31 07:46:02.394587', '2026-11-07 07:46:02.394587', '2026-10-31 07:46:21.339351', '0d1b8fbb93fd25e4cc645af2548e63feb7653c2e7005a76f94fffced99992686', NULL, 2, 166);
INSERT INTO public.refresh_tokens VALUES (135, '2026-10-31 07:46:21.367343', '2026-11-07 07:46:21.367343', '2026-10-31 07:46:22.440216', '1d82de06457e799e9a3f70c8f25db43ff0b031c4dea1d0043edce96ffa9f92ef', NULL, 2, 167);
INSERT INTO public.refresh_tokens VALUES (136, '2026-10-31 07:46:22.478776', '2026-11-07 07:46:22.478776', '2026-10-31 07:46:41.345063', '574bc3062558850b7f3c4caa4f5ad767252fc0bb5e6e5bf2f37bef6cf4b5aed7', NULL, 2, 168);
INSERT INTO public.refresh_tokens VALUES (137, '2026-10-31 07:46:41.376836', '2026-11-07 07:46:41.376836', '2026-10-31 07:46:42.313886', 'ce7b30589bce900a507430325d350e1b1a947876bb8ae48ad745dcc7a05e6287', NULL, 2, 169);
INSERT INTO public.refresh_tokens VALUES (133, '2026-10-31 07:45:58.436192', '2026-11-07 07:45:58.434935', '2026-10-31 07:46:58.357327', '492c7b7ef9dcf23337c77773d4f1cdea0162e4c1374490e96bc5164fd9c64b38', NULL, 2, 170);
INSERT INTO public.refresh_tokens VALUES (138, '2026-10-31 07:46:42.3442', '2026-11-07 07:46:42.3442', '2026-10-31 07:47:01.416861', '8f31dabb5288e7eb4d669e4c581ce564f8e45923491e5b3e0f40c89d73a62fb5', NULL, 2, 171);
INSERT INTO public.refresh_tokens VALUES (140, '2026-10-31 07:47:01.4648', '2026-11-07 07:47:01.4648', '2026-10-31 07:47:02.376262', 'a353d335c2e0291b06ae88d9aced1895b354a7780b8021b72217df564fa1c41d', NULL, 2, 172);
INSERT INTO public.refresh_tokens VALUES (141, '2026-10-31 07:47:02.40494', '2026-11-07 07:47:02.40494', '2026-10-31 07:47:42.419029', '878a1f244f9d8368bcbbf4e303d1f129e24bd2c09f7403ff36ace2523768c29e', NULL, 2, 173);
INSERT INTO public.refresh_tokens VALUES (139, '2026-10-31 07:46:58.397374', '2026-11-07 07:46:58.397374', '2026-10-31 07:47:58.405166', '1b643521d9d9c7d61f6709e3c48e446ca4197375991e8e68083899137a74610a', NULL, 2, 174);
INSERT INTO public.refresh_tokens VALUES (142, '2026-10-31 07:47:42.480931', '2026-11-07 07:47:42.480931', '2026-10-31 07:48:02.322259', '600860129224efd3df5b7bb0ce499b91aebb9bc925a35128f4aaacce4f5a6ffc', NULL, 2, 175);
INSERT INTO public.refresh_tokens VALUES (143, '2026-10-31 07:47:58.464541', '2026-11-07 07:47:58.464541', '2026-10-31 07:48:58.814675', 'b3049e300bd8a8d5ae8507bf62c0e579e40fb140c16c232086758518f6532b13', NULL, 2, 176);
INSERT INTO public.refresh_tokens VALUES (147, '2026-10-31 07:49:52.988513', '2026-11-07 07:49:52.988513', NULL, '40fd7399988d8e8a90e2a021df1f3c5fcc850ca8b870d42b6f27cab69692da90', NULL, 3, 177);
INSERT INTO public.refresh_tokens VALUES (146, '2026-10-31 07:48:58.857351', '2026-11-07 07:48:58.857351', '2026-10-31 07:49:58.383032', 'f9d55cc7f0c8f2e6c6ecca762d3dbd5b016a472b13ce67409f798e04daba3d41', NULL, 2, 178);
INSERT INTO public.refresh_tokens VALUES (119, '2026-10-31 07:35:18.7482', '2026-11-07 07:35:18.7482', '2026-10-31 07:50:34.742378', 'e8e4d62f67f69e94e8e9aa430afa30b18c46c04c2aad29589582a6f008925169', 2, NULL, 179);
INSERT INTO public.refresh_tokens VALUES (148, '2026-10-31 07:49:58.426791', '2026-11-07 07:49:58.426791', '2026-10-31 07:50:58.894596', '36ce9b5aca9d0f3a388259aba4f383a083d2a5f1860821565af1cc8c28e2b88b', NULL, 2, 180);
INSERT INTO public.refresh_tokens VALUES (150, '2026-10-31 07:50:58.934885', '2026-11-07 07:50:58.934885', '2026-10-31 07:51:58.353669', 'e2ac242e9f4333dfd673cdc78a7e5facacf23f367a051893549e6251b6eb77b9', NULL, 2, 181);
INSERT INTO public.refresh_tokens VALUES (151, '2026-10-31 07:51:58.400761', '2026-11-07 07:51:58.400761', '2026-10-31 07:52:58.81668', '55e5986c3013812aaa0c03abbd40b0bb1a35b219933b46f8dae978f2eed70567', NULL, 2, 182);
INSERT INTO public.refresh_tokens VALUES (145, '2026-10-31 07:48:41.093038', '2026-11-07 07:48:41.093038', '2026-10-31 07:53:41.085561', '5194304dccc5b13cd7ab3db172f08b412c3f262600e3c45bb6d56ccd5fe204e8', NULL, 2, 183);
INSERT INTO public.refresh_tokens VALUES (153, '2026-10-31 07:52:58.858841', '2026-11-07 07:52:58.858841', '2026-10-31 07:53:58.347077', 'd7e1aa04c3eb8773017eca715496d764ecf82341977caac99798f1fb634c7b38', NULL, 2, 184);
INSERT INTO public.refresh_tokens VALUES (155, '2026-10-31 07:53:58.389776', '2026-11-07 07:53:58.389776', '2026-10-31 07:54:58.334354', '6f3b71f83252c56018951255f38658aaf9fc4ae3dc9aba056c54cc0725d24fe9', NULL, 2, 185);
INSERT INTO public.refresh_tokens VALUES (156, '2026-10-31 07:54:58.381416', '2026-11-07 07:54:58.381416', '2026-10-31 07:55:58.38837', '251a253d113a2d9b2fe5d51c9b88534216e8b633d2bb8e4f8e136d5cb0165e67', NULL, 2, 186);
INSERT INTO public.refresh_tokens VALUES (149, '2026-10-31 07:50:34.742378', '2026-11-07 07:50:34.742378', '2026-10-31 07:56:16.046991', '2b63765d7a5bbcbe90936f01c6abbcbc4169e61185dc847e145fcfc9e802c9f9', 2, NULL, 187);
INSERT INTO public.refresh_tokens VALUES (152, '2026-10-31 07:52:49.726261', '2026-11-30 07:52:49.726261', '2026-10-31 07:56:35.112559', '28f51b3136fd7dbc190ed2cb20ce134a380056df1f42bd4b16c2d36fb256d8ad', NULL, 3, 188);
INSERT INTO public.refresh_tokens VALUES (157, '2026-10-31 07:55:58.433312', '2026-11-07 07:55:58.433312', '2026-10-31 07:56:58.370645', 'ca75576faefc1d284cd0e074692941209bbf2f2da2c15655588839d365b8b659', NULL, 2, 189);
INSERT INTO public.refresh_tokens VALUES (159, '2026-10-31 07:56:35.201943', '2026-11-07 07:56:35.201943', '2026-10-31 07:57:19.808271', '3d707b50e72c93672a452f91bf1bc85a55935f1493743e31b07b978c59c03116', NULL, 3, 190);
INSERT INTO public.refresh_tokens VALUES (160, '2026-10-31 07:56:58.411818', '2026-11-07 07:56:58.411818', '2026-10-31 07:57:58.807269', '40b79445457f4f4110cece1ad96f9865c0a5ec946e4cfd16a8ea4516de101954', NULL, 2, 191);
INSERT INTO public.refresh_tokens VALUES (162, '2026-10-31 07:57:58.849059', '2026-11-07 07:57:58.849059', '2026-10-31 07:58:58.747667', '21712bf389807e6b76cec83e2a919b9f88b77ace8a2b40d377d075e4e0624c4d', NULL, 2, 192);
INSERT INTO public.refresh_tokens VALUES (163, '2026-10-31 07:58:58.797989', '2026-11-07 07:58:58.797989', '2026-10-31 07:59:58.750559', 'd2b0ca7e808c14950ce802b160f462ec86a7d31b5a54762ece49182d206eda03', NULL, 2, 193);
INSERT INTO public.refresh_tokens VALUES (164, '2026-10-31 07:59:58.786991', '2026-11-07 07:59:58.786991', '2026-10-31 08:00:58.377855', '016cb2dcfd00673bc1e2f439b9f5d1ab21f94e601454babc70f5fa55a23a045e', NULL, 2, 194);
INSERT INTO public.refresh_tokens VALUES (165, '2026-10-31 08:00:58.417635', '2026-11-07 08:00:58.417635', '2026-10-31 08:01:58.781586', '014a3d3b8936559d252b03ab69e5745531e8b7a9328201317f595aac39c20c2b', NULL, 2, 195);
INSERT INTO public.refresh_tokens VALUES (166, '2026-10-31 08:01:58.825056', '2026-11-07 08:01:58.825056', '2026-10-31 08:02:58.321217', '946570ad0189967778f491221ebfbd6d0b8e9abbc21a51c97c6897e4a8d33938', NULL, 2, 196);
INSERT INTO public.refresh_tokens VALUES (144, '2026-10-31 07:48:02.350162', '2026-11-07 07:48:02.350162', '2026-10-31 08:03:42.457988', 'eff82e213bf6a9b3556e2d8913c449f969db96bae11e14871e41b25ef2ce1497', NULL, 2, 197);
INSERT INTO public.refresh_tokens VALUES (168, '2026-10-31 08:02:58.373034', '2026-11-07 08:02:58.373034', '2026-10-31 08:03:58.91213', 'b98a75e58b22ceca9953d3730b761dfda9674d0bb799866e13fdd61f42c7c725', NULL, 2, 198);
INSERT INTO public.refresh_tokens VALUES (737, '2026-11-09 02:54:48.530088', '2026-11-16 02:54:48.530088', NULL, 'e1c726736da859fe47a5d875ed1e9c2876e14fd2cef3355f3b3ff587ca23565c', NULL, 2, 199);
INSERT INTO public.refresh_tokens VALUES (170, '2026-10-31 08:03:58.955272', '2026-11-07 08:03:58.955272', '2026-10-31 08:04:59.090557', 'caa17ff51065ede48a8e445692f9edf72dc4e938b4aa6fab1cafe8b20df4000a', NULL, 2, 200);
INSERT INTO public.refresh_tokens VALUES (169, '2026-10-31 08:03:42.483714', '2026-11-07 08:03:42.483714', '2026-10-31 08:05:27.750576', '941857303830532da8b8556a7c717ab87fba0cd8a7691a36accac4210a378ca9', NULL, 2, 201);
INSERT INTO public.refresh_tokens VALUES (174, '2026-10-31 08:06:58.556078', '2026-11-07 08:06:58.556078', '2026-10-31 08:07:58.41256', '668d60bf86e713d76949b952908015b938cfdb1e859a7a27002e9eceb54de8dc', NULL, 2, 202);
INSERT INTO public.refresh_tokens VALUES (172, '2026-10-31 08:05:27.783254', '2026-11-07 08:05:27.783254', '2026-10-31 08:07:41.957325', '0ba5862df03132c79bdc43c3ed01533911f0a552d78b3dee574eebf7652aa1f5', NULL, 2, 203);
INSERT INTO public.refresh_tokens VALUES (154, '2026-10-31 07:53:41.127567', '2026-11-07 07:53:41.127567', '2026-10-31 08:09:29.759137', '3746298dd8cbbf5e5d3c3bd3ee9e5bbb05e2fd212cae8b4174fd288582e0196c', NULL, 2, 204);
INSERT INTO public.refresh_tokens VALUES (158, '2026-10-31 07:56:16.048005', '2026-11-07 07:56:16.048005', '2026-10-31 08:11:18.732063', 'faeabe3c11226ca5b1547aa149ad907ca6b271e5cab09e4f2f356e5f5e9473cb', 2, NULL, 205);
INSERT INTO public.refresh_tokens VALUES (161, '2026-10-31 07:57:19.897192', '2026-11-07 07:57:19.897192', '2026-10-31 09:31:16.705584', '9bdf2e028d306ee52985f7624d4c572d2c2af3d1eb281237a422c876ce97fbcb', NULL, 3, 206);
INSERT INTO public.refresh_tokens VALUES (171, '2026-10-31 08:04:59.147975', '2026-11-07 08:04:59.147975', '2026-10-31 08:05:58.96002', '23842a7cf43a308c13e47b5119cbcf08fd787bdfa0f68ca0722289f25fef6477', NULL, 2, 207);
INSERT INTO public.refresh_tokens VALUES (601, '2026-11-07 09:26:20.027557', '2026-11-14 09:26:20.027557', '2026-11-07 09:39:42.454204', 'd93b27187c0f6266519eaf28c832f002627bce6886b8646c02917ffa3c349762', NULL, 2, 208);
INSERT INTO public.refresh_tokens VALUES (607, '2026-11-07 09:39:42.49435', '2026-11-14 09:39:42.49435', '2026-11-07 09:40:00.479018', '1f54c40f2743bb0093e070898f67ac5f3a75e229e5375817869b7f9b7666f0ae', NULL, 2, 209);
INSERT INTO public.refresh_tokens VALUES (608, '2026-11-07 09:40:00.586778', '2026-11-14 09:40:00.586778', '2026-11-07 09:40:04.030461', '3d9f8f0d1864e3c790d0c8422d1684336fa6e13c9d4092e8bf533a0f7e128582', NULL, 2, 210);
INSERT INTO public.refresh_tokens VALUES (600, '2026-11-07 09:25:02.329828', '2026-11-14 09:25:02.329828', '2026-11-07 09:40:45.448394', 'abf8856be857925aa56da18cc8955960dec91029bda9b66e6e9d8d605b268895', NULL, 2, 211);
INSERT INTO public.refresh_tokens VALUES (609, '2026-11-07 09:40:04.06284', '2026-11-14 09:40:04.06284', '2026-11-07 09:56:13.949963', '5e165db5c7a6481c4f1351133ab1a8fa4a5003ab5519a04b7f4cb748d5a8c505', NULL, 2, 212);
INSERT INTO public.refresh_tokens VALUES (624, '2026-11-07 10:03:11.792215', '2026-11-14 10:03:11.792215', '2026-11-07 10:18:11.781965', 'ba4f225108305a3ac936f46b82fb231a3ee79a2374137084d31f159298d2740d', 2, NULL, 213);
INSERT INTO public.refresh_tokens VALUES (637, '2026-11-07 10:44:20.819275', '2026-11-14 10:44:20.819275', NULL, 'da08d6dc6d595ee73ae3c6aa0afb8ab3d035824e009081b34e2a94259911c798', NULL, 1, 214);
INSERT INTO public.refresh_tokens VALUES (704, '2026-11-08 21:03:50.236501', '2026-12-08 21:03:50.236501', '2026-11-08 21:12:43.28073', 'e67cdd1e3bddbcd8b9ba2f877b8ae7059bb7f818fe456bdb149a57434cbb23f9', 1, NULL, 215);
INSERT INTO public.refresh_tokens VALUES (648, '2026-11-08 19:09:56.606806', '2026-11-15 19:09:56.606806', '2026-11-08 19:25:48.266346', '94a7eedce547cf823e50a8f7658a1c9ebc77a68dfba66e1d0c35c13d513da49e', NULL, 2, 216);
INSERT INTO public.refresh_tokens VALUES (650, '2026-11-08 19:25:48.300092', '2026-11-15 19:25:48.300092', '2026-11-08 19:29:06.511296', '591141557184984f1f93e2a57c0265f31fdaf71a767cc8ea84e32653ccb63f00', NULL, 2, 217);
INSERT INTO public.refresh_tokens VALUES (665, '2026-11-08 19:44:29.46194', '2026-11-15 19:44:29.46194', '2026-11-08 19:47:44.207815', '4430cfc5527cd1f8d2165b3f9c581123c2f8e0d1ac9cd84ebf2029fd74586d8f', NULL, 2, 218);
INSERT INTO public.refresh_tokens VALUES (668, '2026-11-08 19:48:18.929917', '2026-12-08 19:48:18.929917', '2026-11-08 19:48:37.095926', '78ec5d34dec546c2503b4adc63a18c10aec945e2d4d42188df5f3032bb756ede', 2, NULL, 219);
INSERT INTO public.refresh_tokens VALUES (684, '2026-11-08 20:09:59.854045', '2026-11-15 20:09:59.854045', '2026-11-08 20:15:18.691336', 'cf9052908f8d3287df8b05500bcc2cfa9ecf3f0f9457146ba0eed6ade01e2106', NULL, 11, 220);
INSERT INTO public.refresh_tokens VALUES (692, '2026-11-08 20:38:09.677203', '2026-11-15 20:38:09.677203', '2026-11-08 20:39:38.85559', 'aeeefb63893b047acd590c504e89827a518a7e74e8ec16b3716925d26d35c18a', NULL, 2, 221);
INSERT INTO public.refresh_tokens VALUES (707, '2026-11-08 21:12:54.323372', '2026-12-08 21:12:54.323372', '2026-11-08 21:13:00.178914', 'eaddaa727c0770ad7186acb2134635465783cde9c099bc9f7e7c39f6934aa7b7', 2, NULL, 222);
INSERT INTO public.refresh_tokens VALUES (708, '2026-11-08 21:13:06.133409', '2026-12-08 21:13:06.133409', '2026-11-08 21:25:47.669493', '6ba69c6edc18ef12a47ac88750dfc30c269f5edccc06785c1b9a94be037699d8', 1, NULL, 223);
INSERT INTO public.refresh_tokens VALUES (717, '2026-11-08 23:54:34.130823', '2026-12-08 23:54:34.130823', '2026-11-09 00:09:48.420911', '61552ea2e96c964ede4ac1bd8e8f6f7927636ad02ff3371378ad7f01cd2b7e54', NULL, 2, 224);
INSERT INTO public.refresh_tokens VALUES (721, '2026-11-09 00:54:48.495071', '2026-11-16 00:54:48.495071', '2026-11-09 01:09:48.476891', '39ad4e510dc341d8c9a52c47e58418b46ec7af0af2185bae584eef3738ba6610', NULL, 2, 225);
INSERT INTO public.refresh_tokens VALUES (722, '2026-11-09 01:09:48.50885', '2026-11-16 01:09:48.50885', '2026-11-09 01:24:48.481728', '103b602b4086ceddfcb9e719d632ccaba424ba2613968c22d30b25e6f72b3fa0', NULL, 2, 226);
INSERT INTO public.refresh_tokens VALUES (738, '2026-11-09 03:09:15.397863', '2026-11-16 03:09:15.397863', '2026-11-09 03:24:15.305335', '0ae7f969e5af917bbec6e5cf57958b1568e32ca88859e0690360339104d1222c', 2, NULL, 227);
INSERT INTO public.refresh_tokens VALUES (746, '2026-11-10 07:34:14.266644', '2026-11-17 07:34:14.266644', '2026-11-10 07:50:14.142806', 'f9d33db69fc5510421c036f801394a25f0d3f18dcd48c3be19b34f689ccbd713', NULL, 2, 228);
INSERT INTO public.refresh_tokens VALUES (747, '2026-11-10 07:50:14.158625', '2026-11-17 07:50:14.158625', '2026-11-12 03:04:42.180558', 'cb1d2503d5cfbe6a3d526bb17a163ba2ec79d9b573c09f430cf1144d8422a349', NULL, 2, 229);
INSERT INTO public.refresh_tokens VALUES (764, '2026-11-12 04:00:14.447759', '2026-11-19 04:00:14.447759', '2026-11-12 04:15:14.483165', 'b107671f3f15a0eb62946845be172fe213f0b3063e77bd0f80d868df1783f803', 2, NULL, 230);
INSERT INTO public.refresh_tokens VALUES (173, '2026-10-31 08:05:59.021496', '2026-11-07 08:05:59.021496', '2026-10-31 08:06:58.504152', 'c868587e96c09ffce0f9144ebe158d368436c625f4025bf34ad4edf3ab3da67f', NULL, 2, 231);
INSERT INTO public.refresh_tokens VALUES (175, '2026-10-31 08:07:41.864443', '2026-11-07 08:07:41.864443', NULL, '88a498cee6bf8e2232cf11bca602c31ae2fcb1587d3b97a3a1ce35f0d2398fee', NULL, 2, 232);
INSERT INTO public.refresh_tokens VALUES (177, '2026-10-31 08:07:58.453636', '2026-11-07 08:07:58.453636', '2026-10-31 08:08:59.138991', '6a1d88234486a2e15ddbf27838b9e213dde5ef54a9bf50d179ba90446b3dcd0c', NULL, 2, 233);
INSERT INTO public.refresh_tokens VALUES (703, '2026-11-08 21:02:12.749508', '2026-12-08 21:02:12.745523', '2026-11-08 21:05:58.951679', '660ce81c5af32963a19ac3324f4db70b3e1e19d179e379a9b65fe6960558308f', NULL, 2, 234);
INSERT INTO public.refresh_tokens VALUES (723, '2026-11-09 01:24:48.516565', '2026-11-16 01:24:48.516565', '2026-11-09 01:39:48.480338', '27e3084a5a0907cb77fb4ef7223b36996f1963510ff2ab45b92be603e886511f', NULL, 2, 235);
INSERT INTO public.refresh_tokens VALUES (739, '2026-11-09 03:24:15.305335', '2026-11-16 03:24:15.305335', '2026-11-09 03:34:24.263047', '96bdcd347ce25da2de5360ae89c286f4997b09fd163d014492873b0d75bb405f', 2, NULL, 236);
INSERT INTO public.refresh_tokens VALUES (748, '2026-11-12 02:39:18.433781', '2026-11-19 02:39:18.433781', '2026-11-12 02:39:22.211403', '29115b173b993df87531144c21ce188d7c6b6db03e6dfd7d79628750874e9ddc', NULL, 2, 237);
INSERT INTO public.refresh_tokens VALUES (765, '2026-11-12 04:12:30.432717', '2026-11-19 04:12:30.432717', '2026-11-12 04:28:14.498821', '2783355823128406b8651392a58b9f7f0221e6981f9f5e1f3df7fc136269d48a', NULL, 2, 238);
INSERT INTO public.refresh_tokens VALUES (705, '2026-11-08 21:05:59.02081', '2026-11-15 21:05:59.02081', '2026-11-08 23:07:26.824814', '7ad4f4d5d8cd9391d4abfb62377d7d07926e2665ed7ab8addf3fa798910d7084', NULL, 2, 239);
INSERT INTO public.refresh_tokens VALUES (614, '2026-11-07 09:48:00.1046', '2026-12-07 09:48:00.1046', '2026-11-07 09:48:33.592067', '534b836c1a5965ea579598b3100fc13262fdc8f5642bc0895eaa4122d4bd3f44', NULL, 3, 240);
INSERT INTO public.refresh_tokens VALUES (625, '2026-11-07 10:04:37.594393', '2026-11-14 10:04:37.594393', '2026-11-07 10:19:37.58053', '094df49c263fe63859f0919f8e10612f0841fb059b2ec449c60b5f02acd4dc27', NULL, 3, 241);
INSERT INTO public.refresh_tokens VALUES (638, '2026-11-07 10:48:12.0716', '2026-11-14 10:48:12.0716', '2026-11-07 11:04:11.807203', '66913ac7a5724c9c3086fdd38a01f2151b7b2bfcfe286615dd9c5bad99a37e9a', 2, NULL, 242);
INSERT INTO public.refresh_tokens VALUES (766, '2026-11-12 04:15:14.483165', '2026-11-19 04:15:14.483165', '2026-11-12 04:30:14.413851', 'a34ea591f2c4f3d92b209f824b0ea8d8837e1e2672cc47fbe3ac53bd34e5a631', 2, NULL, 243);
INSERT INTO public.refresh_tokens VALUES (649, '2026-11-08 19:11:51.019349', '2026-12-08 19:11:51.019349', '2026-11-08 19:28:50.350099', '08ad82784f14337df039f5a44423f1c575c8bee0904c76bc14a681a941b89c31', 2, NULL, 244);
INSERT INTO public.refresh_tokens VALUES (651, '2026-11-08 19:28:50.323155', '2026-11-15 19:28:50.323155', '2026-11-08 19:42:57.310666', '700e27647339d799be7682d01432e8ff85387c8739cb36f92f7dd61d8cad1409', 2, NULL, 245);
INSERT INTO public.refresh_tokens VALUES (666, '2026-11-08 19:46:37.720842', '2026-12-08 19:46:37.720842', '2026-11-08 19:54:49.141212', 'fa3789ea7c3c62ceff8143eea4e27d1ade8ee978a0644ae883c6891c601f6d90', NULL, 1, 246);
INSERT INTO public.refresh_tokens VALUES (768, '2026-11-12 04:30:14.413851', '2026-11-19 04:30:14.413851', '2026-11-12 04:40:22.793846', '4b6da792db57152a37fa9e5e51bb8dddd7c6e157e49e87727056d29207964292', 2, NULL, 247);
INSERT INTO public.refresh_tokens VALUES (685, '2026-11-08 20:21:48.44565', '2026-11-15 20:21:48.44565', '2026-11-08 20:37:02.281683', 'c7b7e380388680b0f1c5e7ee71a1e7a7636cbc8f1bdf33ed80f6a03ebfc119b2', NULL, 2, 248);
INSERT INTO public.refresh_tokens VALUES (695, '2026-11-08 20:48:40.415612', '2026-11-15 20:48:40.415612', NULL, 'a95e4d7d946fcbb79de5cfedf08231b9f23c79816d726167be4e1fede95a2a42', NULL, 3, 249);
INSERT INTO public.refresh_tokens VALUES (176, '2026-10-31 08:07:42.045527', '2026-11-07 08:07:42.045527', '2026-10-31 08:07:58.420067', '8376d2a0d60bf30c4f2c16b1bddf66c3a7dbc294e24243db5c1ee0982db82912', NULL, 2, 250);
INSERT INTO public.refresh_tokens VALUES (178, '2026-10-31 08:07:58.446533', '2026-11-07 08:07:58.446533', '2026-10-31 08:08:03.344174', '74fbbd56405d960a9d109e52b1afaead0e6006022272382fbe0f5e1bb10edb50', NULL, 2, 251);
INSERT INTO public.refresh_tokens VALUES (179, '2026-10-31 08:08:03.372381', '2026-11-07 08:08:03.372381', '2026-10-31 08:08:18.381569', 'c421960ec4f6c8ebbc2feaf68c7953e39ad38519de4434aec74f1c208982f150', NULL, 2, 252);
INSERT INTO public.refresh_tokens VALUES (180, '2026-10-31 08:08:18.411904', '2026-11-07 08:08:18.411904', '2026-10-31 08:08:23.333771', 'b351f3346ed084a6c652f1e0f1f2e63bf282f674e3b82e5736ad77a0cce7df20', NULL, 2, 253);
INSERT INTO public.refresh_tokens VALUES (181, '2026-10-31 08:08:23.361448', '2026-11-07 08:08:23.361448', '2026-10-31 08:08:38.335671', '5824307c149283c89d4471a8063ee1a3168ea5f08fe499ddd526b15aac24031d', NULL, 2, 254);
INSERT INTO public.refresh_tokens VALUES (182, '2026-10-31 08:08:38.375578', '2026-11-07 08:08:38.375578', '2026-10-31 08:08:43.385882', '715eef207e054764abf4f4c8845ebc4d3a8c183d2e091cd5534a05b7c3fbbaf0', NULL, 2, 255);
INSERT INTO public.refresh_tokens VALUES (183, '2026-10-31 08:08:43.417194', '2026-11-07 08:08:43.417194', '2026-10-31 08:09:39.380906', '6c07676c8501931f114f93e2dd71b3962bd0f8a4b70655a90c970200951711c1', NULL, 2, 256);
INSERT INTO public.refresh_tokens VALUES (186, '2026-10-31 08:09:39.42324', '2026-11-07 08:09:39.42324', '2026-10-31 08:09:43.336556', '6d780a5a25f404094396f87daae4d0fac04679ee5f18961fc78cc9f2ded0adab', NULL, 2, 257);
INSERT INTO public.refresh_tokens VALUES (184, '2026-10-31 08:08:59.186618', '2026-11-07 08:08:59.186618', '2026-10-31 08:09:58.363526', '19f9ea74ac934327c98c8838cd60c118830af8e56f3f6099cfd3d1c0c4af5cba', NULL, 2, 258);
INSERT INTO public.refresh_tokens VALUES (187, '2026-10-31 08:09:43.363176', '2026-11-07 08:09:43.363176', '2026-10-31 08:10:40.350104', '0f9697fb94ac3cf08d94034b3aebc152b68f4d21d9731c15b6931f4f18b7b5db', NULL, 2, 259);
INSERT INTO public.refresh_tokens VALUES (189, '2026-10-31 08:10:40.376538', '2026-11-07 08:10:40.376538', '2026-10-31 08:10:42.386054', '063b9d41836c6693613d60321f2b17e0c02f6f8efe597cfd0d965e96e79f6067', NULL, 2, 260);
INSERT INTO public.refresh_tokens VALUES (188, '2026-10-31 08:09:58.412817', '2026-11-07 08:09:58.412817', '2026-10-31 08:10:58.791719', '339d2abcb4fe81017e8a5c91763899935fc1604d370ef53271b579050bf58d27', NULL, 2, 261);
INSERT INTO public.refresh_tokens VALUES (191, '2026-10-31 08:10:58.835246', '2026-11-07 08:10:58.835246', '2026-10-31 08:11:58.445109', '6a5dff5e94a5ae633a2c59470f9efa24460172e3cb79f802a6d095c2d7704e57', NULL, 2, 262);
INSERT INTO public.refresh_tokens VALUES (193, '2026-10-31 08:11:58.484702', '2026-11-07 08:11:58.484702', '2026-10-31 08:12:58.344512', '78d3d4ac4e7a84764d601f7b926f798d9de7e5f821ec1479470f400d079c15eb', NULL, 2, 263);
INSERT INTO public.refresh_tokens VALUES (190, '2026-10-31 08:10:42.470902', '2026-11-07 08:10:42.470902', '2026-10-31 08:13:32.569445', '482aea4837df4b4ac9242920123d969f51f91c56c390e859f6773bb51ac07430', NULL, 2, 264);
INSERT INTO public.refresh_tokens VALUES (195, '2026-10-31 08:13:32.628366', '2026-11-07 08:13:32.628366', '2026-10-31 08:13:37.054158', '61c20aed857d9745e525ec3c4b8bbe2be763ee53d92f704a50cd70ceeed27b9c', NULL, 2, 265);
INSERT INTO public.refresh_tokens VALUES (196, '2026-10-31 08:13:37.094062', '2026-11-07 08:13:37.094062', '2026-10-31 08:13:53.19139', '3e482d3d181d719be65de7805e48e0eceb76babfe3d6275618d6082985ce4a8f', NULL, 2, 266);
INSERT INTO public.refresh_tokens VALUES (194, '2026-10-31 08:12:58.387765', '2026-11-07 08:12:58.387765', '2026-10-31 08:13:58.817705', '6f1009651f3a69eb1703b083c63f3dafd148a332bfba62c2743cf64eea530d72', NULL, 2, 267);
INSERT INTO public.refresh_tokens VALUES (198, '2026-10-31 08:13:58.856689', '2026-11-07 08:13:58.856689', '2026-10-31 08:14:58.794737', '4cea9a8a1f639a979121c76f0b9ff1df0f06e49fefd9560e836fffd4a1adcaab', NULL, 2, 268);
INSERT INTO public.refresh_tokens VALUES (167, '2026-10-31 08:02:25.270477', '2026-11-07 08:02:25.270477', '2026-10-31 08:15:10.387128', '2b30b11e8a3e84768c408029ef2c7ed21d253bd1d8f1ab831ebb20b804af722e', NULL, 1, 269);
INSERT INTO public.refresh_tokens VALUES (199, '2026-10-31 08:14:58.837247', '2026-11-07 08:14:58.837247', '2026-10-31 08:15:58.796888', 'cdbe38c4bf894c2a6c16bbc89bed244bee11dc2bbfcdbdf966ca974f9e948e98', NULL, 2, 270);
INSERT INTO public.refresh_tokens VALUES (201, '2026-10-31 08:15:58.836012', '2026-11-07 08:15:58.836012', '2026-10-31 08:16:59.011656', '5b5aa44a60fea69a2bc3c77a205e69d86acff5d6b437175fe8d5f0f4396b3c74', NULL, 2, 271);
INSERT INTO public.refresh_tokens VALUES (202, '2026-10-31 08:16:59.051881', '2026-11-07 08:16:59.051881', '2026-10-31 08:17:58.855557', '566f19582d8aae8baa8db34e0dedea479e53c34d9fc7bc12ab2ddfac1ab0c253', NULL, 2, 272);
INSERT INTO public.refresh_tokens VALUES (203, '2026-10-31 08:17:58.900549', '2026-11-07 08:17:58.900549', '2026-10-31 08:18:58.3636', 'b011d14a7034967d6ba532846098f083752ad19fdcaba3d9fe6d879e27ee1f7b', NULL, 2, 273);
INSERT INTO public.refresh_tokens VALUES (204, '2026-10-31 08:18:58.416755', '2026-11-07 08:18:58.416755', '2026-10-31 08:19:58.354969', 'd23aecd5a8095728cb0fe1cd5aeec614eb0afbe01ec1dff3829dad409bd7143a', NULL, 2, 274);
INSERT INTO public.refresh_tokens VALUES (205, '2026-10-31 08:19:58.395439', '2026-11-07 08:19:58.395439', '2026-10-31 08:20:58.835636', '3739847e7f05404449ab110482cd22acc04d58e99caf62eee6824a78f5c6dac3', NULL, 2, 275);
INSERT INTO public.refresh_tokens VALUES (206, '2026-10-31 08:20:58.892478', '2026-11-07 08:20:58.892478', '2026-10-31 08:21:59.023861', '31c66964bd7b5d4de11ae93dae4c60745ae4d9c6edfbda64136506f76063ee28', NULL, 2, 276);
INSERT INTO public.refresh_tokens VALUES (207, '2026-10-31 08:21:59.062465', '2026-11-07 08:21:59.062465', '2026-10-31 08:22:58.348825', '6224902392e952e4f5a5f309515fc3197d30522c56038a12be47f3c626039cea', NULL, 2, 277);
INSERT INTO public.refresh_tokens VALUES (197, '2026-10-31 08:13:53.221504', '2026-11-07 08:13:53.221504', '2026-10-31 08:23:47.212272', '8ab149931e5a0e935587ccba4a9b13ba46310f4dfafe48badf4f7a3cfbe2984d', NULL, 2, 278);
INSERT INTO public.refresh_tokens VALUES (208, '2026-10-31 08:22:58.377285', '2026-11-07 08:22:58.377285', '2026-10-31 08:23:58.377199', 'ef18b48c2dc97084ed0ec3416348b0af8f7ec7fcf9ab137b22a38b5bee0052e5', NULL, 2, 279);
INSERT INTO public.refresh_tokens VALUES (209, '2026-10-31 08:23:47.401978', '2026-11-07 08:23:47.401978', '2026-10-31 08:24:32.696355', 'a52331814844b510e098b23d3548ab777722a98909bc39987a824da4e08d2060', NULL, 2, 280);
INSERT INTO public.refresh_tokens VALUES (211, '2026-10-31 08:24:32.749251', '2026-11-07 08:24:32.749251', '2026-10-31 08:24:34.414336', 'c25645bcc162ccb989cf0d64d9957a71ab595206025455713b9a09f8c51725d1', NULL, 2, 281);
INSERT INTO public.refresh_tokens VALUES (185, '2026-10-31 08:09:29.823797', '2026-11-07 08:09:29.823797', '2026-10-31 08:24:40.833864', 'aeb03118748e31b17217595f45c5c393e5b10a710668fc70ac66712d874081b1', NULL, 2, 282);
INSERT INTO public.refresh_tokens VALUES (212, '2026-10-31 08:24:34.539745', '2026-11-07 08:24:34.539745', '2026-10-31 08:24:54.386294', '52d25777ad3d4b6bc7c99300edb4fcfc370652257ef6d73e329bffaadba231fc', NULL, 2, 283);
INSERT INTO public.refresh_tokens VALUES (210, '2026-10-31 08:23:58.416572', '2026-11-07 08:23:58.416572', '2026-10-31 08:24:58.906756', '0948990f21906c93578b295ea1d6bac72bde0d2e0c0253c45994f0620a7ead8c', NULL, 2, 284);
INSERT INTO public.refresh_tokens VALUES (215, '2026-10-31 08:24:58.946484', '2026-11-07 08:24:58.946484', '2026-10-31 08:25:58.735653', '7dd6dccb1aa346b2f034f37c80ea0859694d466c5c336677d4ad161788ece7ed', NULL, 2, 285);
INSERT INTO public.refresh_tokens VALUES (216, '2026-10-31 08:25:58.776591', '2026-11-07 08:25:58.776591', '2026-10-31 08:26:58.884251', 'cbf810625ec982fd7a1d0e4dd4cdeeccc4eeaf9505804f1c084ba558a0b59381', NULL, 2, 286);
INSERT INTO public.refresh_tokens VALUES (217, '2026-10-31 08:26:58.927655', '2026-11-07 08:26:58.927655', '2026-10-31 08:27:58.789724', '1114e677af19f960f60003ebe3ea15dff5aacd067c6f2e05b42603643a3bccff', NULL, 2, 287);
INSERT INTO public.refresh_tokens VALUES (218, '2026-10-31 08:27:58.86395', '2026-11-07 08:27:58.86395', '2026-10-31 08:28:58.781587', '71be7f571af6f59124a8d4d6e16dd989106f5af0d2628242118e72fe7f561be2', NULL, 2, 288);
INSERT INTO public.refresh_tokens VALUES (214, '2026-10-31 08:24:54.413454', '2026-11-07 08:24:54.413454', '2026-10-31 08:29:54.366682', 'a9145c4329d2674e5fd19a4063f2efefb18c71823a8267b8de9526386ce51162', NULL, 2, 289);
INSERT INTO public.refresh_tokens VALUES (219, '2026-10-31 08:28:58.839806', '2026-11-07 08:28:58.839806', '2026-10-31 08:29:58.847897', '1e1d83ce9c20911a9cfc4a2e569f96264ee97ebee1b5ec1fd4ee61c93646d2ed', NULL, 2, 290);
INSERT INTO public.refresh_tokens VALUES (200, '2026-10-31 08:15:10.444228', '2026-11-07 08:15:10.444228', '2026-10-31 08:30:36.90495', 'ddc356d63c64e812e40e7f2119113522722b920af068a75926f2e4d5646dbe04', NULL, 1, 291);
INSERT INTO public.refresh_tokens VALUES (221, '2026-10-31 08:29:58.889175', '2026-11-07 08:29:58.889175', '2026-10-31 08:30:59.223443', '4a3d222f747374d4043efd4b8770ffae1a1edf1b5ec1012b78e5ced8b9ccab30', NULL, 2, 292);
INSERT INTO public.refresh_tokens VALUES (223, '2026-10-31 08:30:59.649978', '2026-11-07 08:30:59.649978', '2026-10-31 08:31:58.924451', '97518c5e782b3d2d89c7c9fc43c7a55e1e00f82826f5525837ca4f474a3268df', NULL, 2, 293);
INSERT INTO public.refresh_tokens VALUES (224, '2026-10-31 08:31:58.966781', '2026-11-07 08:31:58.966781', '2026-10-31 08:32:58.840917', '569fe9fdb7adafb6089a4165d8b5ba3124356ab658ce3e6dd4e68877536d93d1', NULL, 2, 294);
INSERT INTO public.refresh_tokens VALUES (222, '2026-10-31 08:30:36.93299', '2026-11-07 08:30:36.93299', '2026-10-31 08:33:39.985056', '9487c4d1d9dd473fe89db3db40d34ada2e124e363c1c6dddda2d3755a365875e', NULL, 1, 295);
INSERT INTO public.refresh_tokens VALUES (226, '2026-10-31 08:33:40.044426', '2026-11-07 08:33:40.044426', '2026-10-31 08:33:42.624638', 'eda7afb92af9a553f77ea716c6e7c060a1733f3e840d4ea9de325d076b32f254', NULL, 1, 296);
INSERT INTO public.refresh_tokens VALUES (225, '2026-10-31 08:32:58.883232', '2026-11-07 08:32:58.883232', '2026-10-31 08:33:58.504644', 'e246ca315297f02bf077d57e9946ae853375429cb0422a8464218076a472101f', NULL, 2, 297);
INSERT INTO public.refresh_tokens VALUES (227, '2026-10-31 08:33:42.748137', '2026-11-07 08:33:42.748137', '2026-10-31 08:34:25.671512', 'ba293500b1bfbdf7cdba294ae38f2a1628f42c813e498a876b616bdddf27de6a', NULL, 1, 298);
INSERT INTO public.refresh_tokens VALUES (229, '2026-10-31 08:34:25.711992', '2026-11-07 08:34:25.711992', '2026-10-31 08:34:50.295139', 'b1a6b8841f55dedcb8c1a0ddd562398296edbeb5c92d2323c6733fd99ecd8cf4', NULL, 1, 299);
INSERT INTO public.refresh_tokens VALUES (230, '2026-10-31 08:34:50.339297', '2026-11-07 08:34:50.339297', '2026-10-31 08:34:55.866396', 'a7c02b73ebde28d3422b0b80e23ecccc8751b2d5f82a8f9e12fe82a434bbf9bc', NULL, 1, 300);
INSERT INTO public.refresh_tokens VALUES (228, '2026-10-31 08:33:58.577703', '2026-11-07 08:33:58.577703', '2026-10-31 08:34:58.378072', '54b531a70287b285de78112eefa52844b6e57cf4e270b97526140d3d2e463eb2', NULL, 2, 301);
INSERT INTO public.refresh_tokens VALUES (235, '2026-10-31 08:36:58.382494', '2026-11-07 08:36:58.382494', '2026-10-31 08:37:58.46214', '653b477106b1da498c79d1f92f21d2c8a6bed6f5d9daa6419b7cd7e0840742c8', NULL, 2, 302);
INSERT INTO public.refresh_tokens VALUES (247, '2026-10-31 08:45:16.328041', '2026-11-07 08:45:16.328041', NULL, '4d7055188330b8b32d708cf03ca7c6f7965df5136fdfb49cfc9b9257bfd384fb', NULL, 2, 303);
INSERT INTO public.refresh_tokens VALUES (192, '2026-10-31 08:11:18.732063', '2026-11-07 08:11:18.732063', '2026-11-05 09:10:08.558024', 'e54d3640f59c955134ef6443b4d88645fdcba96c3b20c17254a37d2acdfcf9c0', 2, NULL, 304);
INSERT INTO public.refresh_tokens VALUES (232, '2026-10-31 08:35:13.019146', '2026-11-30 08:35:13.019146', '2026-10-31 08:35:43.191319', '785d1296cfd931ea740875ebde52f06f37cbe261c0fbacc604ab0c058c932345', 2, NULL, 305);
INSERT INTO public.refresh_tokens VALUES (233, '2026-10-31 08:35:43.192324', '2026-11-07 08:35:43.192324', '2026-10-31 08:39:15.256602', '43b38704b4ff01986e48096b9f11ffea2de78087e39f6fc9f8da9eec4b7b5587', 2, NULL, 306);
INSERT INTO public.refresh_tokens VALUES (238, '2026-10-31 08:39:15.256602', '2026-11-07 08:39:15.256602', '2026-10-31 08:48:55.870206', '02cf763c933196b530525644ba31f27dd4871ba1ee7cb16202595e38b94a18b4', 2, NULL, 307);
INSERT INTO public.refresh_tokens VALUES (610, '2026-11-07 09:40:45.480882', '2026-11-14 09:40:45.480882', '2026-11-07 09:43:03.327427', '4cf191823a6339e582dbffd91582d854e0217ee6a09de263e86cb5a83d5526c7', NULL, 2, 308);
INSERT INTO public.refresh_tokens VALUES (619, '2026-11-07 09:49:43.541203', '2026-11-14 09:49:43.541203', '2026-11-07 10:04:44.326931', '060bac005689fd11f79349c69c4d4f5337cdc73f9208a9963b57a26f8cc741e4', 2, NULL, 309);
INSERT INTO public.refresh_tokens VALUES (626, '2026-11-07 10:04:44.326931', '2026-11-14 10:04:44.326931', '2026-11-07 10:20:13.997325', 'd6b470af4a62fca58c35ef79e5f0034f5ace6fcc97ed3f30882a50ce678f4a4e', 2, NULL, 310);
INSERT INTO public.refresh_tokens VALUES (640, '2026-11-07 10:53:19.21948', '2026-11-14 10:53:19.21948', '2026-11-07 10:53:32.252397', '22926ceb994689068efb4d8de1eeb9ce1b44a53bdb6f6d661aaa66479ba084a7', 2, NULL, 311);
INSERT INTO public.refresh_tokens VALUES (639, '2026-11-07 10:49:37.612139', '2026-11-14 10:49:37.612139', '2026-11-07 11:04:37.604092', '70b31540b2f0019ce76d710a6f75e45b827f237d3d86930a24b162cee4833932', NULL, 3, 312);
INSERT INTO public.refresh_tokens VALUES (641, '2026-11-07 10:53:32.253368', '2026-11-14 10:53:32.253368', '2026-11-07 11:09:15.347509', '053ad20a1c4615be6478b0c19c34ab42c5d98fe28dddd7644b2fce4ce5cffb48', 2, NULL, 313);
INSERT INTO public.refresh_tokens VALUES (652, '2026-11-08 19:28:50.350099', '2026-11-15 19:28:50.350099', NULL, '32b783d2ef21eccee8e04fea4497a4b6eb97b91974265b655cac33f7656cd5a1', 2, NULL, 314);
INSERT INTO public.refresh_tokens VALUES (686, '2026-11-08 20:22:07.114213', '2026-11-15 20:22:07.114213', NULL, '1a6898ed0c36f6d9682e1c1dfc76b10eae54fbf1850148634808889dcd17e405', NULL, 2, 315);
INSERT INTO public.refresh_tokens VALUES (706, '2026-11-08 21:07:48.490379', '2026-11-15 21:07:48.490379', '2026-11-08 21:22:48.302545', 'ba62d38aece670bd95340e7892759958bf63419605fcf882004f4af9bf77a3b1', NULL, 2, 316);
INSERT INTO public.refresh_tokens VALUES (696, '2026-11-08 20:48:40.59295', '2026-11-15 20:48:40.59295', NULL, '56314dd7f78553d385ee7954878899f95ce02b7f2d12191c458e43584525a654', NULL, 3, 317);
INSERT INTO public.refresh_tokens VALUES (671, '2026-11-08 19:49:14.198871', '2026-12-08 19:49:14.198871', '2026-11-08 20:48:40.559938', '644e03f2aae1a235c8ea6f268005124a60684a51ca9dbfccd79fb7cb25be6d93', NULL, 3, 318);
INSERT INTO public.refresh_tokens VALUES (709, '2026-11-08 21:22:48.336483', '2026-11-15 21:22:48.336483', '2026-11-08 21:37:48.344504', '53d9fddc9a476779e7930995373555aa4ddba617e3783f247edf5e6cdd780908', NULL, 2, 319);
INSERT INTO public.refresh_tokens VALUES (712, '2026-11-08 21:37:48.389249', '2026-11-15 21:37:48.389249', '2026-11-08 21:38:35.444074', 'd08880f3cc0bac2a6fdb052942e291361fa3462e81da3050650771c83e730451', NULL, 2, 320);
INSERT INTO public.refresh_tokens VALUES (715, '2026-11-08 22:12:59.98013', '2026-11-15 22:12:59.98013', NULL, '1b8ecdcedc8cdaab333240dfd030ae1a49883dd1821c37d1ceba7f9276c959e5', NULL, 2, 321);
INSERT INTO public.refresh_tokens VALUES (713, '2026-11-08 21:38:35.474205', '2026-11-15 21:38:35.474205', '2026-11-08 22:12:59.941064', '7ea077a41d56a67d436e30c97fe6abebc7435a0c3f04d1958355d7851b52d76e', NULL, 2, 322);
INSERT INTO public.refresh_tokens VALUES (724, '2026-11-09 01:39:48.507097', '2026-11-16 01:39:48.507097', '2026-11-09 01:54:48.503031', '36f3a12c936de96ce92386b538148bab1e69cefe98f1a187cb65e6a1682e508e', NULL, 2, 323);
INSERT INTO public.refresh_tokens VALUES (740, '2026-11-09 03:45:45.635186', '2026-12-09 03:45:45.635186', '2026-11-10 06:40:36.206235', 'b5336b1236bc7798ad8e6ccf3bf0170f679f49ae7c0b58eb9b69ff83ca69d5c0', 2, NULL, 324);
INSERT INTO public.refresh_tokens VALUES (749, '2026-11-12 02:39:35.176467', '2026-12-12 02:39:35.176467', '2026-11-12 02:52:49.754786', 'e7d499acc47515ddcedd3cfeca794b748e6525d947e631b5331abdd4afb2410c', 1, NULL, 325);
INSERT INTO public.refresh_tokens VALUES (767, '2026-11-12 04:28:14.566712', '2026-11-19 04:28:14.566712', '2026-11-12 04:44:13.548022', '466d7d537a4a2a16350883464af1e33e00369ade939c7cd7344e0506c65c71d9', NULL, 2, 326);
INSERT INTO public.refresh_tokens VALUES (231, '2026-10-31 08:34:58.420247', '2026-11-07 08:34:58.420247', '2026-10-31 08:35:58.873978', 'e701366875c6c191f260a7651d79d4929e50e551d3d7d36ee4e755f3fec27cd9', NULL, 2, 327);
INSERT INTO public.refresh_tokens VALUES (241, '2026-10-31 08:40:58.971511', '2026-11-07 08:40:58.971511', '2026-10-31 08:41:58.371499', '61b8cb994092ab169f5ef1ec135c58497eed7b01f5431855a5295501c4601f20', NULL, 2, 328);
INSERT INTO public.refresh_tokens VALUES (246, '2026-10-31 08:44:58.878233', '2026-11-07 08:44:58.878233', '2026-10-31 08:45:58.823917', '603592315f507a028aa160473607511269818b6aa2ae745c050f281493282977', NULL, 2, 329);
INSERT INTO public.refresh_tokens VALUES (603, '2026-11-07 09:29:18.239225', '2026-11-14 09:29:18.239225', '2026-11-07 09:44:19.257867', '0e7cc87243c60588393c171d1b5d60b686515db4fc85b9573c69db236778665c', NULL, 2, 330);
INSERT INTO public.refresh_tokens VALUES (611, '2026-11-07 09:43:03.360927', '2026-11-14 09:43:03.360927', '2026-11-07 09:58:45.438599', '8eb04373b5161ef87e4ea0d43a24d9c83957e438797e47e4e0487e6c2f16cb77', NULL, 2, 331);
INSERT INTO public.refresh_tokens VALUES (627, '2026-11-07 10:08:23.116324', '2026-11-14 10:08:23.116324', '2026-11-07 10:24:11.785209', 'b796338e9535d374ffb72b7c6f4cd13e0abf926f8c08aabcdb013bf3a78dfadf', NULL, 1, 332);
INSERT INTO public.refresh_tokens VALUES (632, '2026-11-07 10:24:11.828334', '2026-11-14 10:24:11.828334', '2026-11-07 10:44:20.785841', '41aece99f3609b400ac3677d962ea327f1961894310d84c2cd6174b26dd0e1cc', NULL, 1, 333);
INSERT INTO public.refresh_tokens VALUES (642, '2026-11-07 11:04:11.807203', '2026-11-14 11:04:11.807203', NULL, '926a42ae6d3d50a4971d85a798e993e76b1885d28aa5906edc8de40e9bbcea4a', 2, NULL, 334);
INSERT INTO public.refresh_tokens VALUES (653, '2026-11-08 19:29:06.575445', '2026-11-15 19:29:06.575445', '2026-11-08 19:29:57.539556', 'e9ab15359c91016b347ade583ebcba23939c0b83106e3a806cc4379b458e46e8', NULL, 2, 335);
INSERT INTO public.refresh_tokens VALUES (672, '2026-11-08 19:50:05.655398', '2026-11-15 19:50:05.655398', '2026-11-08 19:52:07.849166', '7af0537fc808eb9fee9b7b3a3a1f5a8508a86664f2fa7c0bb9629eaad465280b', 2, NULL, 336);
INSERT INTO public.refresh_tokens VALUES (687, '2026-11-08 20:23:00.582193', '2026-11-15 20:23:00.582193', '2026-11-08 20:38:00.504694', '1370703e55dc3b82e8b41de5a6913c34ece55ea08ceb472ad2edf4793192df87', 2, NULL, 337);
INSERT INTO public.refresh_tokens VALUES (697, '2026-11-08 20:52:48.372233', '2026-11-15 20:52:48.372233', '2026-11-08 21:07:48.405195', '15cddbec58b0569a8cef3260df3e702dac1068b0e2e842d88df096bfa6c88039', NULL, 2, 338);
INSERT INTO public.refresh_tokens VALUES (710, '2026-11-08 21:25:52.050466', '2026-12-08 21:25:52.050466', '2026-11-09 01:51:52.015974', '2260f3b1f86b77aaf45d70d2021f7c69850261ff9170c3e6249ad6a6581c96b8', NULL, 2, 339);
INSERT INTO public.refresh_tokens VALUES (725, '2026-11-09 01:51:52.052557', '2026-11-16 01:51:52.052557', '2026-11-09 01:52:41.148247', 'b2aa85cbbb4eb52afc580e712017d27a1f6e00d27464cb50336cceb7835748c2', NULL, 2, 340);
INSERT INTO public.refresh_tokens VALUES (726, '2026-11-09 01:52:41.17567', '2026-11-16 01:52:41.17567', '2026-11-09 01:52:45.959011', '604d5b1944046c903b56ad426b84bfda5f2bf927fe92b1c742f480e4e649c83b', NULL, 2, 341);
INSERT INTO public.refresh_tokens VALUES (728, '2026-11-09 02:08:15.25492', '2026-12-09 02:08:15.25492', '2026-11-09 02:23:16.34569', '672b9102f81d42933855050abda8cad7caeb5cc354a2949d2988858775122a08', NULL, 13, 342);
INSERT INTO public.refresh_tokens VALUES (750, '2026-11-12 02:52:49.754786', '2026-11-19 02:52:49.754786', '2026-11-12 02:53:04.826606', 'dafa2a99a5a4a47d8b519279fcebec8d0e6822e3eca41bacf16edc1ded989a6d', 1, NULL, 343);
INSERT INTO public.refresh_tokens VALUES (751, '2026-11-12 02:53:13.315872', '2026-12-12 02:53:13.315872', NULL, '7b4642aa82667060a51ecb22fe940c0c83909a44e270cb067bc0f01580e4b910', 1, NULL, 344);
INSERT INTO public.refresh_tokens VALUES (752, '2026-11-12 02:55:29.589132', '2026-12-12 02:55:29.589132', '2026-11-12 03:10:30.514061', '9aac5a01db4dfc118691586d5f204946b7d00af64ec61a6365fe2c6f9274aa43', NULL, 2, 345);
INSERT INTO public.refresh_tokens VALUES (756, '2026-11-12 03:19:52.222628', '2026-11-19 03:19:52.222628', '2026-11-12 03:25:20.671479', '26034220c8e3c35a7c00bae1d2511ae371420c7bcd9a2c5feb56c8152e131b04', 1, NULL, 346);
INSERT INTO public.refresh_tokens VALUES (770, '2026-11-12 04:44:13.65085', '2026-11-19 04:44:13.65085', '2026-11-12 04:59:14.45521', '9c81c5daba9993313ae489173fdaa156eb65fca2a410304b908d8af8dbae38c7', NULL, 2, 348);
INSERT INTO public.refresh_tokens VALUES (234, '2026-10-31 08:35:58.915958', '2026-11-07 08:35:58.915958', '2026-10-31 08:36:58.339057', '75f0d3f0650871963a51d37a4f0006fb7926d031da94c75f69d5190f7506d07f', NULL, 2, 349);
INSERT INTO public.refresh_tokens VALUES (236, '2026-10-31 08:37:58.512169', '2026-11-07 08:37:58.512169', '2026-10-31 08:38:58.967621', '6e3bcdd5bd837d09380b4fc7c53191368a3aabc76f5f6e9e21a88768d5fa15fd', NULL, 2, 350);
INSERT INTO public.refresh_tokens VALUES (237, '2026-10-31 08:38:59.019326', '2026-11-07 08:38:59.019326', '2026-10-31 08:39:58.402857', '69ed5ea86bec21c163fa400ce92e722d77c408eb7720bc7c9592e870b56fa9b7', NULL, 2, 351);
INSERT INTO public.refresh_tokens VALUES (213, '2026-10-31 08:24:40.996709', '2026-11-07 08:24:40.996709', '2026-10-31 08:40:40.834222', '63bfd1a72cef4d2dc1bcf92367003497cad5a7d60760abe3fb49338eef3d5753', NULL, 2, 352);
INSERT INTO public.refresh_tokens VALUES (239, '2026-10-31 08:39:58.486542', '2026-11-07 08:39:58.486542', '2026-10-31 08:40:58.930474', '6a83be2d1d53a88953234b6a21c137b08255e85f15f32c732b9e9a0fff3b437a', NULL, 2, 353);
INSERT INTO public.refresh_tokens VALUES (242, '2026-10-31 08:41:58.416233', '2026-11-07 08:41:58.416233', '2026-10-31 08:42:59.232944', 'fec199f1608e22cd77ae6a873496b81efeda2aec480dac358be206913a1fce97', NULL, 2, 354);
INSERT INTO public.refresh_tokens VALUES (243, '2026-10-31 08:42:59.297435', '2026-11-07 08:42:59.297435', '2026-10-31 08:43:58.383253', 'feff1892620cabc981960a554405d54de12755dc5ca846f2816a353aeada7983', NULL, 2, 355);
INSERT INTO public.refresh_tokens VALUES (244, '2026-10-31 08:43:58.425262', '2026-11-07 08:43:58.425262', '2026-10-31 08:44:10.400989', '60c9e46a5064ed3f55ba69a3e36a113db73031d49860027f0a0afff690862b0e', NULL, 2, 356);
INSERT INTO public.refresh_tokens VALUES (245, '2026-10-31 08:44:10.439996', '2026-11-07 08:44:10.439996', '2026-10-31 08:44:58.831225', '5cdeb8f176ceb189dec047b751685240685b388f2aba4e387959b85cadce51c6', NULL, 2, 357);
INSERT INTO public.refresh_tokens VALUES (249, '2026-10-31 08:45:58.867433', '2026-11-07 08:45:58.867433', '2026-10-31 08:46:58.310405', 'f896536b43df4426b9db9836344462eecb25a75d77cef0209bf017afae9e0129', NULL, 2, 358);
INSERT INTO public.refresh_tokens VALUES (250, '2026-10-31 08:46:58.358004', '2026-11-07 08:46:58.358004', '2026-10-31 08:47:58.748044', 'b3645665961cf934c7d1904cee0356e019bc97d0b224b65c8bc5ff1161893bb6', NULL, 2, 359);
INSERT INTO public.refresh_tokens VALUES (251, '2026-10-31 08:47:58.796843', '2026-11-07 08:47:58.796843', '2026-10-31 08:48:58.772445', '65ed36a109711ac48f7b8f678286c13d38d306821ad656fa8294415c1601dc8e', NULL, 2, 360);
INSERT INTO public.refresh_tokens VALUES (253, '2026-10-31 08:48:58.824251', '2026-11-07 08:48:58.824251', '2026-10-31 08:49:58.3765', 'd687458b8abc278ef692e5361f9501e4e861d6f468b0effdf3e3eaefb2baf612', NULL, 2, 361);
INSERT INTO public.refresh_tokens VALUES (240, '2026-10-31 08:40:40.866891', '2026-11-07 08:40:40.866891', '2026-10-31 08:56:40.889977', '250db08adb8608095a788b2a2995903027156304de35a8ec2c6faf8b37ed721b', NULL, 2, 362);
INSERT INTO public.refresh_tokens VALUES (604, '2026-11-07 09:30:11.853028', '2026-11-14 09:30:11.853028', '2026-11-07 09:38:26.25056', '0dd96db2260004f225803334f3efa257027f8a01e42d218b081bc4dbdb72a91a', NULL, 1, 363);
INSERT INTO public.refresh_tokens VALUES (613, '2026-11-07 09:44:19.331129', '2026-11-14 09:44:19.331129', '2026-11-07 09:59:19.267813', '3fafdda3c90039a347d3d26457a69e669414a51f1ad4a2a583646152ba4127d6', NULL, 2, 364);
INSERT INTO public.refresh_tokens VALUES (628, '2026-11-07 10:11:16.694088', '2026-11-14 10:11:16.694088', '2026-11-07 10:26:19.961564', '9a23afbb64431df445d08a1aaffdbe6824cb0bcbb68d3a300b467c8d146f3c21', NULL, 2, 365);
INSERT INTO public.refresh_tokens VALUES (643, '2026-11-07 11:04:37.640428', '2026-11-14 11:04:37.640428', '2026-11-07 11:19:37.564612', 'b68277aca4ae91e3937def4fe9616b2aa1759545a017a0a43e6d70526885eb11', NULL, 3, 366);
INSERT INTO public.refresh_tokens VALUES (644, '2026-11-07 11:09:15.347509', '2026-11-14 11:09:15.347509', '2026-11-07 11:24:15.33371', '5101b15bd7e29197b5a34b4c5584c5942e9e8055c2156c31d7cbf543f05c3d2f', 2, NULL, 367);
INSERT INTO public.refresh_tokens VALUES (654, '2026-11-08 19:30:12.963698', '2026-12-08 19:30:12.963698', '2026-11-08 19:37:38.823592', '88b18d23de8983bb87c270a69791e8096051d3f0592eb9af0ced650e032118bf', NULL, 2, 368);
INSERT INTO public.refresh_tokens VALUES (660, '2026-11-08 19:37:46.881138', '2026-12-08 19:37:46.881138', '2026-11-08 19:41:04.561263', 'ffc9de5e5b2e095004adf56754ce5c070fb84c9216b883249742de20bf897be2', 1, NULL, 369);
INSERT INTO public.refresh_tokens VALUES (673, '2026-11-08 19:51:01.687199', '2026-12-08 19:51:01.687199', '2026-11-08 20:06:48.526811', '3f9ce8127dfe01eb2d8c5ea8488ecd9df379fdc651b945a6e59b6203e6adac28', NULL, 2, 370);
INSERT INTO public.refresh_tokens VALUES (711, '2026-11-08 21:26:34.897605', '2026-11-15 21:26:34.896434', '2026-11-08 21:42:00.535391', 'e73effbe214ba47ef3f81d95af98b6c6510b8224adce15d5812a430eabe1ee76', 2, NULL, 371);
INSERT INTO public.refresh_tokens VALUES (727, '2026-11-09 01:54:48.533397', '2026-11-16 01:54:48.533397', '2026-11-09 02:09:48.49757', 'fd1f1800133e5ab7384db31992e644d2f7cb8c2a9d671b3f10a1a47292734249', NULL, 2, 372);
INSERT INTO public.refresh_tokens VALUES (698, '2026-11-08 20:54:47.220581', '2026-11-15 20:54:47.220581', '2026-11-08 20:55:50.773504', '8177dc8ae5bed5df3794f26f447f4f5b959a54cd6d29f26a24c829df9d5cc06b', 1, NULL, 373);
INSERT INTO public.refresh_tokens VALUES (699, '2026-11-08 20:55:57.780489', '2026-12-08 20:55:57.780489', '2026-11-08 20:56:03.434376', 'da9a10144d7dd763ea6093d1721ef387bd9aeca801ec12dc85af1b017c25ff5b', 2, NULL, 374);
INSERT INTO public.refresh_tokens VALUES (753, '2026-11-12 03:04:42.21956', '2026-11-19 03:04:42.21956', '2026-11-12 03:04:46.429088', '128a3323079aef3d28db0cfcbaebfe06df7895c2c0decd9e9eb312cfadf0cf90', NULL, 2, 375);
INSERT INTO public.refresh_tokens VALUES (771, '2026-11-12 04:59:14.550651', '2026-11-19 04:59:14.550651', '2026-11-12 05:14:14.390496', '630553829f3c354d534c16ac445a923eaca2cea0e7fbedcfe912145ea4542b1d', NULL, 2, 376);
INSERT INTO public.refresh_tokens VALUES (220, '2026-10-31 08:29:54.818146', '2026-11-07 08:29:54.818146', '2026-10-31 08:45:16.634218', 'f837e12af2645651de1f82fd65fc783567a8d5c60f33dd866aaa9e9379fd3836', NULL, 2, 377);
INSERT INTO public.refresh_tokens VALUES (252, '2026-10-31 08:48:55.871534', '2026-11-07 08:48:55.871534', '2026-10-31 08:49:22.777187', 'a9165ddaf58405c96480466dae67f1271a19c511f011fddd30643b53126d123f', 2, NULL, 378);
INSERT INTO public.refresh_tokens VALUES (254, '2026-10-31 08:49:22.777187', '2026-11-07 08:49:22.777187', '2026-10-31 08:50:39.23518', '7110f643d21f73a05fd506c4f90b8b1bcd71924558fe2b57e7ea48974a542660', 2, NULL, 379);
INSERT INTO public.refresh_tokens VALUES (257, '2026-10-31 08:50:39.236181', '2026-11-07 08:50:39.236181', '2026-10-31 08:50:42.492709', '3e56392fb089bedd33f3cff772eaa92619a0012c5be38d239afabf1fbbe4c106', 2, NULL, 380);
INSERT INTO public.refresh_tokens VALUES (255, '2026-10-31 08:49:58.409969', '2026-11-07 08:49:58.409969', '2026-10-31 08:50:58.375555', '0f1294544e2ca2a8d99edf8a873c8263176b821b00d04028e7b42f4d60256735', NULL, 2, 381);
INSERT INTO public.refresh_tokens VALUES (259, '2026-10-31 08:50:58.419648', '2026-11-07 08:50:58.419648', '2026-10-31 08:51:58.38942', '630d1727af5ef615edbf6210f0dc7be03eefe3800fd9f0a2a135d09caab4dc68', NULL, 2, 382);
INSERT INTO public.refresh_tokens VALUES (260, '2026-10-31 08:51:58.437791', '2026-11-07 08:51:58.437791', '2026-10-31 08:52:58.811986', 'e52cfd337dcc26d50584d061e5299265171b6309d802771a91525e81f07b196e', NULL, 2, 383);
INSERT INTO public.refresh_tokens VALUES (261, '2026-10-31 08:52:58.851347', '2026-11-07 08:52:58.851347', '2026-10-31 08:53:59.193936', '241f0e16a52099f851a968dfbea86eb0b1f6ee50811aae12e68f58f34dd3c699', NULL, 2, 384);
INSERT INTO public.refresh_tokens VALUES (262, '2026-10-31 08:53:59.272881', '2026-11-07 08:53:59.272881', '2026-10-31 08:54:58.746534', '1119193cd6d3f58d5f2fca6e15a47e6aa297d0b3eff93b9691d8de3ed7a25c5d', NULL, 2, 385);
INSERT INTO public.refresh_tokens VALUES (263, '2026-10-31 08:54:58.786977', '2026-11-07 08:54:58.786977', '2026-10-31 08:55:58.803606', '18319779d98fecaebe6e5189ab5e1655ef4b9af4f81227fe4d4af6d195359e92', NULL, 2, 386);
INSERT INTO public.refresh_tokens VALUES (264, '2026-10-31 08:55:58.838177', '2026-11-07 08:55:58.838177', '2026-10-31 08:56:58.44348', '0b032c266d70c87c12da7e3bd009ea9d326eaf2229b4ab74ece94f6ba9a3d304', NULL, 2, 387);
INSERT INTO public.refresh_tokens VALUES (266, '2026-10-31 08:56:58.504342', '2026-11-07 08:56:58.504342', '2026-10-31 08:57:58.397409', 'f5e00912b2ffabd555be6f73f3e72943bcb73b98883c5bc3cb605adb90281dba', NULL, 2, 388);
INSERT INTO public.refresh_tokens VALUES (267, '2026-10-31 08:57:58.435121', '2026-11-07 08:57:58.435121', '2026-10-31 08:58:58.829465', 'a2282a24035012bf356ff07803494ad5436fdc90afa6f2cd66569ce2dc532a83', NULL, 2, 389);
INSERT INTO public.refresh_tokens VALUES (268, '2026-10-31 08:58:58.875371', '2026-11-07 08:58:58.875371', '2026-10-31 08:59:58.837792', '72e70dbb8fdfbb38a6e09616e046edde31db1f77ec942cb11ed9a4c5a04b9042', NULL, 2, 390);
INSERT INTO public.refresh_tokens VALUES (248, '2026-10-31 08:45:16.664832', '2026-11-07 08:45:16.664832', '2026-10-31 09:00:16.8965', '71bb550c354f00aa5a8f80d745cda91dadf8606631c240ce25056bfbfceb5f4a', NULL, 2, 391);
INSERT INTO public.refresh_tokens VALUES (269, '2026-10-31 08:59:58.876457', '2026-11-07 08:59:58.876457', '2026-10-31 09:00:58.384228', '8bdc4c8e1d783e3695ef9e7450cdbaf3f22d2da5d6824d16150aa311268e6baa', NULL, 2, 392);
INSERT INTO public.refresh_tokens VALUES (271, '2026-10-31 09:00:58.430795', '2026-11-07 09:00:58.430795', '2026-10-31 09:01:58.526684', '32951d97535e61dcf294d45e22c06e4e96fd7c2f0cb25a1404a244c72d679008', NULL, 2, 393);
INSERT INTO public.refresh_tokens VALUES (272, '2026-10-31 09:01:58.599899', '2026-11-07 09:01:58.599899', '2026-10-31 09:02:58.350864', '7fff1b1a14e848007898da8f3bff8c38151baf48c7e628ca33f5e9e1044a4885', NULL, 2, 394);
INSERT INTO public.refresh_tokens VALUES (273, '2026-10-31 09:02:58.393512', '2026-11-07 09:02:58.393512', '2026-10-31 09:03:58.848925', '87eebf961f48d052c2fb2eb33293e0d62bd197b3b3e120d1f55f86b17aabb226', NULL, 2, 395);
INSERT INTO public.refresh_tokens VALUES (274, '2026-10-31 09:03:58.89109', '2026-11-07 09:03:58.89109', '2026-10-31 09:04:58.354863', 'f0ae932a595f1a02a43fa6b07ca286525151a303cbf8ce6b938c4d1aef255f03', NULL, 2, 396);
INSERT INTO public.refresh_tokens VALUES (256, '2026-10-31 08:50:33.060807', '2026-11-30 08:50:33.060807', '2026-10-31 09:05:36.938459', '0989103a8b6a824b064f0e5b1d2dec8c7eb737ccad31e2e8de68e6067eac88bd', 2, NULL, 397);
INSERT INTO public.refresh_tokens VALUES (275, '2026-10-31 09:04:58.399366', '2026-11-07 09:04:58.399366', '2026-10-31 09:05:58.341355', 'fb560132b9e26871504fee2c4b7c8598c0be68c0dcbbc2833855441e2d819dfb', NULL, 2, 398);
INSERT INTO public.refresh_tokens VALUES (277, '2026-10-31 09:05:58.382405', '2026-11-07 09:05:58.382405', '2026-10-31 09:06:36.061346', '507755bdb80f572dae4e5d20bb665b064ddc88e573913675fb572895afcff153', NULL, 2, 399);
INSERT INTO public.refresh_tokens VALUES (258, '2026-10-31 08:50:47.693458', '2026-11-30 08:50:47.693458', '2026-10-31 09:06:36.945092', '6c1d112e16dbaedf6d1484840fa7efde148bcd62cfdac8f3c0b4e1f8134eea00', NULL, 1, 400);
INSERT INTO public.refresh_tokens VALUES (279, '2026-10-31 09:06:36.987853', '2026-11-07 09:06:36.987853', '2026-10-31 09:18:06.617938', '852118b3f89ce884ce0f6ff216bc354fc9f3e8d003d202e9d14a5e537958b979', NULL, 1, 401);
INSERT INTO public.refresh_tokens VALUES (281, '2026-10-31 09:19:12.24586', '2026-11-07 09:19:12.24586', NULL, '336ebba71127a5f01d441e343eb613c85c3a9fc583d857869eb5bd730d472f08', NULL, 2, 402);
INSERT INTO public.refresh_tokens VALUES (292, '2026-10-31 10:00:42.322811', '2026-11-07 10:00:42.321786', '2026-10-31 10:10:22.619753', '63baf752c160875caa2977ea029bbd33b0a23adcf034a427c8cec3d5f558b8ed', NULL, 2, 403);
INSERT INTO public.refresh_tokens VALUES (270, '2026-10-31 09:00:16.943275', '2026-11-07 09:00:16.943275', '2026-10-31 09:19:12.403583', 'dcbc5162fbf4701cf91e5a4b3cea2d87bb1897f0c4caeb0e6836f19b03c448d8', NULL, 2, 404);
INSERT INTO public.refresh_tokens VALUES (276, '2026-10-31 09:05:36.938459', '2026-11-07 09:05:36.938459', '2026-10-31 09:20:39.383988', '4fb91c03a8d819b2a8e64bcfdba83a524ea77eeb66efc9cad1c844c15e5e4927', 2, NULL, 405);
INSERT INTO public.refresh_tokens VALUES (283, '2026-10-31 09:20:39.385201', '2026-11-07 09:20:39.385201', '2026-10-31 09:20:48.759685', '77d6d6fdca9dfe6cf6df874ac3f6734c31b251bd513f6eb71dd40253e051d68b', 2, NULL, 406);
INSERT INTO public.refresh_tokens VALUES (286, '2026-10-31 09:33:04.072799', '2026-11-30 09:33:04.072799', NULL, 'a99076f8eb6122fe270767f5faf2100d037ff5357579e5043efe38d09ee260cd', 2, NULL, 407);
INSERT INTO public.refresh_tokens VALUES (285, '2026-10-31 09:31:16.764281', '2026-11-07 09:31:16.764281', '2026-10-31 09:33:24.072453', '89e6246308adbb5df191695e4a567217f1b261581c37629b9a08d1ac7e36f02f', NULL, 3, 408);
INSERT INTO public.refresh_tokens VALUES (287, '2026-10-31 09:33:24.118994', '2026-11-07 09:33:24.118994', '2026-10-31 09:33:55.700361', 'f47ae63a28c45967b4abf9ba9c45e9b32673e79040aaf30888d3a43bd0880229', NULL, 3, 409);
INSERT INTO public.refresh_tokens VALUES (282, '2026-10-31 09:19:12.434827', '2026-11-07 09:19:12.434827', '2026-10-31 09:34:42.270162', 'c91a1725eee35f35bc4c8ca80050f6e891cc38386919eb182529a9c2ee737f50', NULL, 2, 410);
INSERT INTO public.refresh_tokens VALUES (289, '2026-10-31 09:34:42.301003', '2026-11-07 09:34:42.301003', '2026-10-31 09:39:15.587536', '772c15b4eec59dcb5cbc353401525e6b9301d740c8be4afe1d8d87ed2e9c84b8', NULL, 2, 411);
INSERT INTO public.refresh_tokens VALUES (290, '2026-10-31 09:39:15.618583', '2026-11-07 09:39:15.618583', '2026-10-31 09:44:42.763453', '4b1a8001919cfd6aa99b7503858081b9dc015aa21e36660fc459a5c47e2d51f9', NULL, 2, 412);
INSERT INTO public.refresh_tokens VALUES (291, '2026-10-31 09:44:42.84346', '2026-11-07 09:44:42.84346', '2026-10-31 10:00:42.289209', '893aced11b98208835507a51b2a8dd4d9dbe4f215efe342e48dee2b1ea3c4757', NULL, 2, 413);
INSERT INTO public.refresh_tokens VALUES (293, '2026-10-31 10:10:22.653417', '2026-11-07 10:10:22.653417', '2026-10-31 10:10:23.995853', '589110b245f3e8b24a893b6e19b8c6c666b6ff1ebb91e48c43328159fd9758d2', NULL, 2, 414);
INSERT INTO public.refresh_tokens VALUES (295, '2026-10-31 10:10:43.205342', '2026-11-07 10:10:43.205342', NULL, 'efdc6eb296e1e6a8f15cfdbfe07ebd14658034ac23d896e0c5d4daedee08e8d0', NULL, 2, 415);
INSERT INTO public.refresh_tokens VALUES (294, '2026-10-31 10:10:24.077802', '2026-11-07 10:10:24.077802', '2026-10-31 10:10:43.178142', 'de176f11c57cbadb654dc069988b81fd60d8638338ae3ff8850be985aa38037d', NULL, 2, 416);
INSERT INTO public.refresh_tokens VALUES (278, '2026-10-31 09:06:36.126952', '2026-11-07 09:06:36.126952', '2026-11-01 04:10:02.961119', 'ae31d037f561ffcdb41f0960b11860d19ae59a2fbfc58756f7af85f138b45deb', NULL, 2, 417);
INSERT INTO public.refresh_tokens VALUES (297, '2026-11-01 19:50:12.283402', '2026-11-08 19:50:12.283402', NULL, '43422c5de787f5a913022c4cdb5c823b31f2d6498224934fee5e592f78f8f467', NULL, 1, 418);
INSERT INTO public.refresh_tokens VALUES (280, '2026-10-31 09:18:06.664968', '2026-11-07 09:18:06.664968', '2026-11-01 19:50:12.172422', 'facad9d7b44bbbe50f19514dae2bbeb201831ff2f75a41b715e4eb1460988dc8', NULL, 1, 419);
INSERT INTO public.refresh_tokens VALUES (284, '2026-10-31 09:20:48.759685', '2026-11-07 09:20:48.759685', '2026-11-01 19:50:44.188718', 'aa5cd552f47e8836718b9a41417db385fa5cc5035eac42567a4cfc65cd0c6d0d', 2, NULL, 420);
INSERT INTO public.refresh_tokens VALUES (299, '2026-11-01 19:50:44.188718', '2026-11-08 19:50:44.188718', '2026-11-01 19:50:47.758375', '5f2e25ff377615be2e90108d2706aeae91c1c07e7b40812fa71ba799ef5a5e98', 2, NULL, 421);
INSERT INTO public.refresh_tokens VALUES (300, '2026-11-01 19:50:47.758375', '2026-11-08 19:50:47.758375', '2026-11-01 19:50:51.354031', '718b7d6cbdf8aa79345acd67b6925a4f15b1fc53680336d432cca4fc2a8a35b1', 2, NULL, 422);
INSERT INTO public.refresh_tokens VALUES (298, '2026-11-01 19:50:13.738423', '2026-12-01 19:50:13.738423', '2026-11-01 20:05:52.813065', '0d931fd74ed4151e36be34a4b5f3f02a8c598e3d33c064ad7341e08bc4c6c779', NULL, 1, 423);
INSERT INTO public.refresh_tokens VALUES (301, '2026-11-01 19:51:01.480036', '2026-12-01 19:51:01.480036', '2026-11-01 20:06:52.775453', 'cd32fd13acfc8da06bca33b3cdc4fe462b537e7e7b8e6ea537033a0e10ab0c87', 2, NULL, 424);
INSERT INTO public.refresh_tokens VALUES (303, '2026-11-01 20:06:52.775453', '2026-11-08 20:06:52.775453', '2026-11-01 20:13:39.765295', '0bdd61fe65167dcd418fb1f989e856d3fa7e6c2acef8c52cae04326589c78f50', 2, NULL, 425);
INSERT INTO public.refresh_tokens VALUES (306, '2026-11-01 20:17:17.32852', '2026-11-08 20:17:17.32852', NULL, '2624d8b10cc5704f2345cc37daf6725121c511019d5137eb462cc0b428a30221', NULL, 3, 426);
INSERT INTO public.refresh_tokens VALUES (288, '2026-10-31 09:33:55.922359', '2026-11-07 09:33:55.922359', '2026-11-01 20:17:17.279929', '1815156efb6a7a695935d287545c29a3fc97f10afec226e1c6f2156a2246c344', NULL, 3, 427);
INSERT INTO public.refresh_tokens VALUES (307, '2026-11-01 20:18:49.961139', '2026-11-08 20:18:49.961139', NULL, 'a52d43649e3bc2bf024ae4893c3e09e644fc80a0d9b7c224e6c885bae29a4ae3', 2, NULL, 428);
INSERT INTO public.refresh_tokens VALUES (302, '2026-11-01 20:05:52.866277', '2026-11-08 20:05:52.866277', '2026-11-01 20:20:52.833648', 'd2eb0b67a9681676685a6f1514ec1b89632318989b99e680b8ecf8a82805f6e7', NULL, 1, 429);
INSERT INTO public.refresh_tokens VALUES (304, '2026-11-01 20:13:39.765295', '2026-11-08 20:13:39.765295', '2026-11-01 20:28:52.813913', '2e8932e6edd29ee147ff7f331c5fcf7e8271c7cad5157e25ddcab3e9d932adfd', 2, NULL, 430);
INSERT INTO public.refresh_tokens VALUES (265, '2026-10-31 08:56:40.927511', '2026-11-07 08:56:40.927511', '2026-11-01 21:18:39.256899', '21ddf71bdc2703c46f2ba57da6d2f5aeaa571ca5787d55125c84ef99f77c2b39', NULL, 2, 431);
INSERT INTO public.refresh_tokens VALUES (296, '2026-11-01 04:10:03.019782', '2026-11-08 04:10:03.019782', '2026-11-05 04:00:59.427468', 'f22d4c212124dff300db138bbc50146e6ae2b55f92f2a2cfed384a29f3eb9aca', NULL, 2, 432);
INSERT INTO public.refresh_tokens VALUES (305, '2026-11-01 20:17:04.196954', '2026-12-01 20:17:04.196954', '2026-11-01 20:18:49.960059', 'bceb79bd20476687aaa2e25432d322ed4b8f5821545cec9ab0c7eafc1e8f901d', 2, NULL, 433);
INSERT INTO public.refresh_tokens VALUES (308, '2026-11-01 20:20:52.934447', '2026-11-08 20:20:52.934447', '2026-11-01 20:29:56.586827', '94f50b8456671477fd5c239b3cba7478841b3a581a8895b361bfa6f6ac5c7873', NULL, 1, 434);
INSERT INTO public.refresh_tokens VALUES (309, '2026-11-01 20:28:52.813913', '2026-11-08 20:28:52.813913', '2026-11-01 20:36:14.3064', '48be501769e1a10795f4d8c55f626a39e21575b27442a06f9a53ca3490c4666e', 2, NULL, 435);
INSERT INTO public.refresh_tokens VALUES (310, '2026-11-01 20:29:56.635619', '2026-11-08 20:29:56.635619', '2026-11-01 20:45:52.776438', 'f1549e231ee26b57101363f5dbb62d617a72cde6d9d6a65b99282458d92afd5d', NULL, 1, 436);
INSERT INTO public.refresh_tokens VALUES (311, '2026-11-01 20:38:37.136511', '2026-12-01 20:38:37.136511', '2026-11-01 20:53:52.786521', '215dc7fd9f1bd8489fd919dc2d072d9e4d67e7149d097b38f62d1368393cfffa', 1, NULL, 437);
INSERT INTO public.refresh_tokens VALUES (314, '2026-11-01 21:00:52.896377', '2026-11-08 21:00:52.896377', NULL, '8d075382e5567476f5260ac875f55fca38a76c152e206ece4085a39af0584d50', NULL, 1, 438);
INSERT INTO public.refresh_tokens VALUES (312, '2026-11-01 20:45:52.808501', '2026-11-08 20:45:52.808501', '2026-11-01 21:00:52.829074', '214884709e2e7e800270e6af97d98c180841928b0a9ff83078cbb2df9164f8c9', NULL, 1, 439);
INSERT INTO public.refresh_tokens VALUES (313, '2026-11-01 20:53:52.786521', '2026-11-08 20:53:52.786521', '2026-11-01 21:08:52.779081', '971e924690a1794bbfb402f9458366d9cbb030ac28e9c0f662d409d2ba049c3a', 1, NULL, 440);
INSERT INTO public.refresh_tokens VALUES (318, '2026-11-01 21:23:57.784414', '2026-11-08 21:23:57.784414', NULL, '3e7f0077ca8220b3ad0c965fcd41c69a2fd6cac6223d2f000c8f0c8ac796479f', 1, NULL, 441);
INSERT INTO public.refresh_tokens VALUES (315, '2026-11-01 21:08:52.779081', '2026-11-08 21:08:52.779081', '2026-11-01 21:23:57.784414', '78383ab0c18502a9e727b0d465b66d4666b962188e1e42380ec6921c9d0e133f', 1, NULL, 442);
INSERT INTO public.refresh_tokens VALUES (319, '2026-11-03 17:58:17.069417', '2026-11-10 17:58:17.069417', NULL, 'a47038b64406a7788616bea100d8a59b1c349a41b64179ff1f6eb22e4ac92777', NULL, 1, 443);
INSERT INTO public.refresh_tokens VALUES (317, '2026-11-01 21:20:38.408005', '2026-12-01 21:20:38.408005', '2026-11-03 17:58:17.016552', 'd94128f5c7a8ebfec488f9cc578799597eb1abe7a6cf1b91fd8bdd25e7f8ab30', NULL, 1, 444);
INSERT INTO public.refresh_tokens VALUES (320, '2026-11-03 17:58:18.160149', '2026-12-03 17:58:18.160149', '2026-11-03 18:00:51.583699', 'e6e69c157530dd90566aff5c5a65e3822fd4552725d69d737d55baa95040a4d4', NULL, 1, 445);
INSERT INTO public.refresh_tokens VALUES (321, '2026-11-03 18:01:21.550715', '2026-12-03 18:01:21.550715', '2026-11-03 18:01:55.848309', '6209261d34c43be70e4327443bdb56d9f790fcc34cb0da210c874bbf673785a2', 2, NULL, 446);
INSERT INTO public.refresh_tokens VALUES (322, '2026-11-03 18:32:36.007156', '2026-12-03 18:32:36.007156', '2026-11-03 18:48:17.845283', '6f1e2a4b1c3817e74e4df02e1cb92037ef9b60e78b4ac69ebce460d61ed94d6b', NULL, 1, 447);
INSERT INTO public.refresh_tokens VALUES (323, '2026-11-03 18:48:17.995825', '2026-11-10 18:48:17.995825', '2026-11-03 18:57:03.961855', '23fca0f6bfd0bef350658d8dab474308b520371b8c0d24101faba07c527602ad', NULL, 1, 448);
INSERT INTO public.refresh_tokens VALUES (325, '2026-11-03 18:57:09.434809', '2026-11-10 18:57:09.434809', NULL, 'de2a88fcbbc1e9250700edfbab887ea79ae660b75e2b7c7b2ef8902305476a83', NULL, 1, 449);
INSERT INTO public.refresh_tokens VALUES (324, '2026-11-03 18:57:03.999924', '2026-11-10 18:57:03.999924', '2026-11-03 18:57:09.335839', 'c53707b80a776f6aa94d5f4bfde16d1ee2ef040880265aab07417229ce17d8b8', NULL, 1, 450);
INSERT INTO public.refresh_tokens VALUES (326, '2026-11-03 18:57:13.100382', '2026-12-03 18:57:13.100382', NULL, 'a0e5e815f5bfb71f93786f671b6601b63a69136a842535d485de9224a7874813', 2, NULL, 451);
INSERT INTO public.refresh_tokens VALUES (316, '2026-11-01 21:18:39.397991', '2026-11-08 21:18:39.397991', '2026-11-04 05:10:28.722407', 'a1f28713dbdc319d3869027c3060e2a73741baaf54916481dec928367a53f939', NULL, 2, 452);
INSERT INTO public.refresh_tokens VALUES (327, '2026-11-04 05:10:28.865904', '2026-11-11 05:10:28.864905', '2026-11-04 05:10:48.170535', '105a933f6b6ba840c185099c263977e528dae11ed6245d4185f1d9b6377f57c5', NULL, 2, 453);
INSERT INTO public.refresh_tokens VALUES (328, '2026-11-04 05:11:28.795642', '2026-12-04 05:11:28.795642', '2026-11-04 05:15:02.284303', 'd62f859234488a6d8dcbdb47e832966d25fa17408667cf9fa6a71fef1bfb1077', 1, NULL, 454);
INSERT INTO public.refresh_tokens VALUES (329, '2026-11-04 05:15:02.284303', '2026-11-11 05:15:02.284303', '2026-11-04 05:15:32.234399', '99c14bc8635c633be380c91d8c3f952a331a6f043a023bf05e1b76c453ffab39', 1, NULL, 455);
INSERT INTO public.refresh_tokens VALUES (330, '2026-11-04 05:15:32.2354', '2026-11-11 05:15:32.2354', '2026-11-04 05:29:04.286466', 'cfa1d90facb2a6f6349733d8e911917edfdece3cc00744202d0de43a61d0f381', 1, NULL, 456);
INSERT INTO public.refresh_tokens VALUES (331, '2026-11-04 05:29:04.286466', '2026-11-11 05:29:04.286466', '2026-11-04 05:29:33.883028', 'e826354092d7599fe97d3984bf0a3825f5b8bd980f1c9c17c4cf040a1643be7a', 1, NULL, 457);
INSERT INTO public.refresh_tokens VALUES (332, '2026-11-04 05:29:33.883028', '2026-11-11 05:29:33.883028', '2026-11-04 05:45:25.518487', 'f3552d5da8e60ff7441615438b70af29d66b89970907fc3a9b74ba3f85f92d14', 1, NULL, 458);
INSERT INTO public.refresh_tokens VALUES (333, '2026-11-04 05:45:25.518487', '2026-11-11 05:45:25.518487', '2026-11-05 02:37:57.78802', '70a8c65ddf1e12e6eaacbd9eef3075e890a994bbb0a70abc11d169421f4f3363', 1, NULL, 459);
INSERT INTO public.refresh_tokens VALUES (334, '2026-11-05 02:37:57.78802', '2026-11-12 02:37:57.78802', '2026-11-05 02:38:04.982549', '5bf610e9c823f788cc232f7f5055c4dace4e499eccdddc2435a97461f0623e9a', 1, NULL, 460);
INSERT INTO public.refresh_tokens VALUES (335, '2026-11-05 02:38:04.983555', '2026-11-12 02:38:04.983555', '2026-11-05 02:39:45.604768', 'd96051b2fad1b84850529a77d1d73aaf418adb560c57a9f447057bc573a9ab4f', 1, NULL, 461);
INSERT INTO public.refresh_tokens VALUES (336, '2026-11-05 02:39:45.604768', '2026-11-12 02:39:45.604768', '2026-11-05 02:39:48.917644', '9e8278eb25ef4b7292e7baeb2435d4d344608a62dc2a6f5a8c7f50bcfb4f01f2', 1, NULL, 462);
INSERT INTO public.refresh_tokens VALUES (337, '2026-11-05 02:39:48.917644', '2026-11-12 02:39:48.917644', '2026-11-05 02:39:51.072311', '440601a38aecb96e21e416fbbb0a1533beb580fd038d65c221ae318cd510cb80', 1, NULL, 463);
INSERT INTO public.refresh_tokens VALUES (359, '2026-11-05 06:44:33.399389', '2026-12-05 06:44:33.399389', '2026-11-07 09:25:02.272319', '1a15723e7f3659172332fd8c308ae89e4f9195ed81c2d686fd30155a692b41a5', NULL, 2, 464);
INSERT INTO public.refresh_tokens VALUES (348, '2026-11-05 04:14:00.010465', '2026-11-12 04:14:00.010465', '2026-11-05 04:14:15.426303', '9c1800e9e6b9a7223f588ab19a2e361aa582021091e278e5095b9f3030657ef9', 1, NULL, 465);
INSERT INTO public.refresh_tokens VALUES (339, '2026-11-05 03:25:01.957864', '2026-12-05 03:25:01.957864', '2026-11-05 03:33:52.174502', '5deb390f43988e999ab586d4405e1fd3be4a6ace2b08a0fb9f4db632286a5ce5', 1, NULL, 466);
INSERT INTO public.refresh_tokens VALUES (340, '2026-11-05 03:33:52.174502', '2026-11-12 03:33:52.174502', '2026-11-05 03:41:48.944356', '2700dac91377c0f5926b496975dcc4a3c47938a3b1202cdd83b47b6c67918b9b', 1, NULL, 467);
INSERT INTO public.refresh_tokens VALUES (341, '2026-11-05 03:41:48.945358', '2026-11-12 03:41:48.945358', '2026-11-05 03:42:24.179748', 'ce56702db40985a4e0a22a0d1b1d0c2bf27f1a8cb6a0bf43d57f4c6296b1485b', 1, NULL, 468);
INSERT INTO public.refresh_tokens VALUES (342, '2026-11-05 03:42:24.179748', '2026-11-12 03:42:24.179748', '2026-11-05 03:42:32.079381', '4ed617f7f5a06cc3cfa4e86559cc25376405fffedfb779697f5fb6560e675433', 1, NULL, 469);
INSERT INTO public.refresh_tokens VALUES (343, '2026-11-05 03:42:56.240639', '2026-12-05 03:42:56.240639', '2026-11-05 03:43:08.765114', 'ac6c24c47bcafc822f40a64d2810d042ee88a67f79768f2e7921e0d107513e64', 5, NULL, 470);
INSERT INTO public.refresh_tokens VALUES (344, '2026-11-05 04:00:59.494672', '2026-11-12 04:00:59.494672', '2026-11-05 04:01:07.745107', '9b78c4492fecb8649b227b61ee558de794e74c5a1eb6b27aeb591657b6e9327c', NULL, 2, 471);
INSERT INTO public.refresh_tokens VALUES (345, '2026-11-05 04:01:22.010679', '2026-12-05 04:01:22.010679', '2026-11-05 04:13:58.427381', '2c65123f7185c08ab69e41d45a507e2b38f61f0b636253adcbfae43c0e8958bb', 1, NULL, 472);
INSERT INTO public.refresh_tokens VALUES (346, '2026-11-05 04:13:58.427381', '2026-11-12 04:13:58.427381', '2026-11-05 04:13:59.109803', 'ae3889c19cbdbb6c6d1b9e10c37e77739595dee05a9bc77d2d03eb63a3f39af1', 1, NULL, 473);
INSERT INTO public.refresh_tokens VALUES (347, '2026-11-05 04:13:59.109803', '2026-11-12 04:13:59.109803', '2026-11-05 04:14:00.010465', '6f61c0fb928382166fc7824255cc894a3e0ac3f0a19dedc5875534c7734952f2', 1, NULL, 474);
INSERT INTO public.refresh_tokens VALUES (349, '2026-11-05 04:14:23.443504', '2026-12-05 04:14:23.443504', '2026-11-05 04:29:24.270957', 'b562e3959af9a153ea2744a885a5b1f789841b1f0c9ce892ab192c547b568c58', 1, NULL, 475);
INSERT INTO public.refresh_tokens VALUES (350, '2026-11-05 04:29:24.271968', '2026-11-12 04:29:24.271968', '2026-11-05 04:44:40.328941', 'e11e3e474c009376a1a38793f7a1911e4ec690f7cd1e99b55c0809bb863284e8', 1, NULL, 476);
INSERT INTO public.refresh_tokens VALUES (351, '2026-11-05 04:44:40.328941', '2026-11-12 04:44:40.328941', '2026-11-05 05:00:27.778627', 'edbe453e44143b4e21ca969de415e76fc5695d0d8c763abf4d094695f7a55c8e', 1, NULL, 477);
INSERT INTO public.refresh_tokens VALUES (352, '2026-11-05 05:00:27.778627', '2026-11-12 05:00:27.778627', '2026-11-05 05:15:40.300483', '280c626d7435ce2f2110528e506ef024f6ff15210df6c9f696638a9f3c7aef3b', 1, NULL, 478);
INSERT INTO public.refresh_tokens VALUES (353, '2026-11-05 05:15:40.300483', '2026-11-12 05:15:40.300483', '2026-11-05 05:30:40.264494', '8ec07f8efa68593d2a7f409cdaa76ae0c4ea5dd9d196f1441dc3ccd86d711995', 1, NULL, 479);
INSERT INTO public.refresh_tokens VALUES (354, '2026-11-05 05:30:40.264494', '2026-11-12 05:30:40.264494', '2026-11-05 05:46:30.273757', '717ffc5c62b81d2b657198ff54c223c6b19c8939fc16a0a92d9a588f5647ad6f', 1, NULL, 480);
INSERT INTO public.refresh_tokens VALUES (355, '2026-11-05 05:46:30.273757', '2026-11-12 05:46:30.273757', '2026-11-05 06:01:40.269967', 'f1a7f8a82779a90289de5139194c203da32d8296e909fe36aceb6fbc33cda5af', 1, NULL, 481);
INSERT INTO public.refresh_tokens VALUES (356, '2026-11-05 06:01:40.269967', '2026-11-12 06:01:40.269967', '2026-11-05 06:16:40.302515', '67f68d46fb75417b9fef1638807f4485a9a61b99238f278fdff4efdcf2cc2197', 1, NULL, 482);
INSERT INTO public.refresh_tokens VALUES (357, '2026-11-05 06:16:40.302515', '2026-11-12 06:16:40.302515', '2026-11-05 06:32:30.254897', '96ad288123ba4a1bae8ed464c7fcb6f3422bb3465e22595d5458815592b2cfe2', 1, NULL, 483);
INSERT INTO public.refresh_tokens VALUES (361, '2026-11-05 09:10:08.558024', '2026-11-12 09:10:08.558024', '2026-11-05 09:10:18.301669', '874aeee1d3269e863b1e31980a0edddc5598d3e6dc30d02eee222fcd193938c1', 2, NULL, 484);
INSERT INTO public.refresh_tokens VALUES (714, '2026-11-08 21:42:00.536398', '2026-11-15 21:42:00.536398', NULL, '2fe4e3fa0ed5af95cfdde394c108270b1b4d91349c4600332983406394a4eacd', 2, NULL, 485);
INSERT INTO public.refresh_tokens VALUES (360, '2026-11-05 09:03:27.029466', '2026-12-05 09:03:27.029466', '2026-11-05 09:19:23.329141', '7ca97a600bb87d8a02baefda6b8e62b3b9800f3bc48560206563657942eddf1f', 1, NULL, 486);
INSERT INTO public.refresh_tokens VALUES (365, '2026-11-05 09:34:39.978188', '2026-11-12 09:34:39.978188', '2026-11-05 09:50:40.043033', '03c0b5fb4ff071d5be740ce13123098a9345ff93890089688fc90e4fa48b4d62', 2, NULL, 487);
INSERT INTO public.refresh_tokens VALUES (363, '2026-11-05 09:19:23.329141', '2026-11-12 09:19:23.329141', '2026-11-05 11:10:01.494811', 'f1482799223eeef2273a357bd495119c6b299346b481dfe27c693465655441c4', 1, NULL, 488);
INSERT INTO public.refresh_tokens VALUES (358, '2026-11-05 06:32:30.254897', '2026-11-12 06:32:30.254897', '2026-11-06 06:20:09.032789', 'ab2ab7f676f81a7785cb5d638b095782082b731a94f5ba6ece09b74595fa8ae8', 1, NULL, 489);
INSERT INTO public.refresh_tokens VALUES (362, '2026-11-05 09:10:28.990182', '2026-12-05 09:10:28.990182', '2026-11-05 09:22:15.694563', '2292df9a589b809a1e89858ba6b22b16c841a83fab895afd84606fdf4dc914fd', 2, NULL, 490);
INSERT INTO public.refresh_tokens VALUES (605, '2026-11-07 09:33:11.875017', '2026-11-14 09:33:11.875017', '2026-11-07 09:48:11.776482', 'ca1d38868415a9faf4ccc0f7dc53240e6912f17edefc115e2319470d6bd9fe83', 2, NULL, 491);
INSERT INTO public.refresh_tokens VALUES (606, '2026-11-07 09:38:26.291789', '2026-11-14 09:38:26.291789', '2026-11-07 09:54:11.791916', '154edb4cc0abaf6799e08b4b151a65955c460cc01ac8b22b4a1d025aff45d493', NULL, 1, 492);
INSERT INTO public.refresh_tokens VALUES (615, '2026-11-07 09:48:11.776482', '2026-11-14 09:48:11.776482', '2026-11-07 10:03:11.791215', 'b06c6bfe58cf0eb481629edb1071efe5f0e4cc4be2905d116d92ab89063e54bf', 2, NULL, 493);
INSERT INTO public.refresh_tokens VALUES (620, '2026-11-07 09:54:11.833142', '2026-11-14 09:54:11.833142', '2026-11-07 10:08:23.074056', '18db3d75e85049a31d6f62b90fc9ab5451e4863d151881f8e1ac0bcc691a8c42', NULL, 1, 494);
INSERT INTO public.refresh_tokens VALUES (629, '2026-11-07 10:18:11.781965', '2026-11-14 10:18:11.781965', '2026-11-07 10:33:11.775426', '2f06d17b57d5f7b7db3b1c759673b05fd874f84676efcef65cdf8766a057ca18', 2, NULL, 495);
INSERT INTO public.refresh_tokens VALUES (634, '2026-11-07 10:33:11.77604', '2026-11-14 10:33:11.775426', '2026-11-07 10:48:12.0716', '710eb37dbcdf551945d34c4c60f44a271bb93d89dca5bc9d0c9476e68c3e42c3', 2, NULL, 496);
INSERT INTO public.refresh_tokens VALUES (700, '2026-11-08 20:56:09.503081', '2026-12-08 20:56:09.503081', '2026-11-08 21:01:37.309372', '22172c713aaea516179fd6100b6b2a48e21b36120fa63c7adf0b617544e000ee', 1, NULL, 497);
INSERT INTO public.refresh_tokens VALUES (655, '2026-11-08 19:33:58.094693', '2026-11-15 19:33:58.094693', '2026-11-08 19:34:03.394888', '79813bd9166dce5a946c49fbadabf41eec4fb01440a07cda54958c28278273d1', 2, NULL, 498);
INSERT INTO public.refresh_tokens VALUES (661, '2026-11-08 19:41:11.195731', '2026-11-15 19:41:11.195731', NULL, 'f7d986f421d34f2f46376c38c9ea58a360ad94d185dda808262a39861bfb1fd3', NULL, 3, 499);
INSERT INTO public.refresh_tokens VALUES (670, '2026-11-08 19:48:49.914241', '2026-11-15 19:48:49.914241', '2026-11-08 19:50:05.655398', 'c97922212cdf6f64d0887686664e7e6d0420952592f7db56cf7e83ab94a22665', 2, NULL, 500);
INSERT INTO public.refresh_tokens VALUES (677, '2026-11-08 19:54:57.351394', '2026-12-08 19:54:57.351394', '2026-11-08 20:09:59.812959', '81faaa504c40702d2cd4c20896d51d226d80093d20a5da5ee327a85c9744055f', NULL, 11, 501);
INSERT INTO public.refresh_tokens VALUES (688, '2026-11-08 20:32:37.253511', '2026-12-08 20:32:37.253511', '2026-11-12 02:39:18.392882', 'd4b9311ceb2b345ff026978dc9c24ee9ba578b8de8a0f824b5ec17e02d8a811c', NULL, 2, 502);
INSERT INTO public.refresh_tokens VALUES (754, '2026-11-12 03:04:51.873194', '2026-12-12 03:04:51.873194', '2026-11-12 03:19:52.222628', '67efad65804c8c15cabe4515b9a1c56a93f33e83ced21d1cc93fef87f3468e90', 1, NULL, 503);
INSERT INTO public.refresh_tokens VALUES (755, '2026-11-12 03:10:30.660047', '2026-11-19 03:10:30.660047', '2026-11-12 03:26:14.366867', '77b89726303bccd881654d56c93e0c213c7dee8df75199c3b38eeb595d2a285a', NULL, 2, 504);
INSERT INTO public.refresh_tokens VALUES (364, '2026-11-05 09:22:15.695582', '2026-11-12 09:22:15.695582', '2026-11-05 09:34:39.978188', '877bc6d37dc58b753f53d9ba1ca5a508f2ff6db9c34df6f6fff642fd07d4f487', 2, NULL, 506);
INSERT INTO public.refresh_tokens VALUES (366, '2026-11-05 09:50:40.043033', '2026-11-12 09:50:40.043033', '2026-11-05 10:06:40.097171', '9e8107b3c16f371cac3ba66742938259d0fcaec0c32be7792cf50b4ee78974e8', 2, NULL, 507);
INSERT INTO public.refresh_tokens VALUES (367, '2026-11-05 10:06:40.098172', '2026-11-12 10:06:40.098172', '2026-11-05 10:15:17.387171', '89054c65e1bb0ebb18e69b022d72be009256607bd3a280aec09659b2265de693', 2, NULL, 508);
INSERT INTO public.refresh_tokens VALUES (368, '2026-11-05 10:15:17.38878', '2026-11-12 10:15:17.38878', '2026-11-05 10:30:18.25722', '286187be3b40e618091b81b4d05f140449c61fa8b2c6abf77395ab6c2767b165', 2, NULL, 509);
INSERT INTO public.refresh_tokens VALUES (369, '2026-11-05 10:30:18.258225', '2026-11-12 10:30:18.258225', '2026-11-05 10:45:40.066924', '1d2abfa16e32f714ee1bb6991a59e54299789511b236a331625afdcf13bc86c6', 2, NULL, 510);
INSERT INTO public.refresh_tokens VALUES (370, '2026-11-05 10:32:31.539266', '2026-12-05 10:32:31.539266', '2026-11-05 10:47:40.065603', '517a0b90d4c7577460c733252ebf5adebe58ece09cb2b4ba4142fa015f2e3258', NULL, 3, 511);
INSERT INTO public.refresh_tokens VALUES (371, '2026-11-05 10:45:40.066924', '2026-11-12 10:45:40.066924', '2026-11-05 11:01:40.070206', '61ca5c3d77038ef5ba731d11f7bfabd2915ed1986326a038dcc76c2d193ef990', 2, NULL, 512);
INSERT INTO public.refresh_tokens VALUES (375, '2026-11-06 03:09:53.328376', '2026-12-06 03:09:53.328376', '2026-11-06 03:10:04.072081', '7794707f8860cab3172e67b8da4e15c4498f6cf0e5076725d70d2d50c921754e', 1, NULL, 513);
INSERT INTO public.refresh_tokens VALUES (377, '2026-11-06 06:20:09.033789', '2026-11-13 06:20:09.033789', '2026-11-06 06:20:20.964305', '5894150573b7d0b8f8d271091fae453a8b20d16c886ae934085c450e1b1af7f5', 1, NULL, 514);
INSERT INTO public.refresh_tokens VALUES (378, '2026-11-06 06:20:26.56764', '2026-12-06 06:20:26.56764', '2026-11-06 06:36:20.510828', '78600ac547622653700243b4ebc0102544a345762630d4a4b89aa343abd8eb76', NULL, 2, 515);
INSERT INTO public.refresh_tokens VALUES (379, '2026-11-06 06:36:20.560016', '2026-11-13 06:36:20.560016', '2026-11-06 06:51:20.503995', 'b0e46f04c73a8be981a5e74a4b61d2719bfba416f78f1f341bb58566c79a92a8', NULL, 2, 516);
INSERT INTO public.refresh_tokens VALUES (380, '2026-11-06 06:51:20.547863', '2026-11-13 06:51:20.547863', '2026-11-06 07:06:20.483619', '8d0a46371a286eabc9b8dc28f5cbbc4538c5785e401fbfd6dd181e9ea7b3b2f3', NULL, 2, 517);
INSERT INTO public.refresh_tokens VALUES (381, '2026-11-06 07:06:20.525838', '2026-11-13 07:06:20.525838', '2026-11-06 07:07:16.492935', '82c2b2c81cb1b6f2a53fe95ccc93b44962297355cd78f407b25fbfeeb26d3b52', NULL, 2, 518);
INSERT INTO public.refresh_tokens VALUES (382, '2026-11-06 07:07:16.537801', '2026-11-13 07:07:16.537801', '2026-11-06 07:07:27.495797', '62854641c39c7f89723d0145a4c3498f698175825c8abb14ae3f32dd355eec03', NULL, 2, 519);
INSERT INTO public.refresh_tokens VALUES (383, '2026-11-06 07:07:27.540675', '2026-11-13 07:07:27.540675', '2026-11-06 07:07:39.522988', '113d83aaad81880d4a79e05e1fe14c4e0cf859757bb26c38f0a9321f04b0295a', NULL, 2, 520);
INSERT INTO public.refresh_tokens VALUES (384, '2026-11-06 07:07:39.571934', '2026-11-13 07:07:39.571934', '2026-11-06 07:23:20.497473', '6a11c06d252c2c58a34c293464b649e9236975922c7c7c968ad9bf5db0ba6540', NULL, 2, 521);
INSERT INTO public.refresh_tokens VALUES (385, '2026-11-06 07:23:20.547007', '2026-11-13 07:23:20.547007', '2026-11-06 07:38:20.502164', 'f41cd02110b32bbc059a563ef89f78c98b991ad6c00aad2b43a78bfb0f7dff29', NULL, 2, 522);
INSERT INTO public.refresh_tokens VALUES (386, '2026-11-06 07:38:20.545769', '2026-11-13 07:38:20.545769', '2026-11-06 07:53:20.531999', '6ab33c48ee2d123966b9877cb836d449d9d2c3d63c7ed1bb968403d33670f207', NULL, 2, 523);
INSERT INTO public.refresh_tokens VALUES (387, '2026-11-06 07:53:20.579294', '2026-11-13 07:53:20.579294', '2026-11-06 08:08:20.549663', '46baef0027622b2afac6c3e5c0fb6542e52a15f32feb389007adbcf11bc63c52', NULL, 2, 524);
INSERT INTO public.refresh_tokens VALUES (388, '2026-11-06 08:08:20.596303', '2026-11-13 08:08:20.596303', '2026-11-06 08:23:20.611248', '7527eb8e605960742f0d2dd15ec63310440f5794ecbbfe4596db5325322a3e42', NULL, 2, 525);
INSERT INTO public.refresh_tokens VALUES (389, '2026-11-06 08:23:20.660954', '2026-11-13 08:23:20.660954', '2026-11-06 08:38:20.609808', 'e7fc4a0c2dd164f4338b651057ddecd57a969f8e23289b686ad6397bc965aabc', NULL, 2, 526);
INSERT INTO public.refresh_tokens VALUES (390, '2026-11-06 08:38:20.655585', '2026-11-13 08:38:20.655585', '2026-11-06 08:53:20.637625', '54136738784c4cae9cb1767726cfa5c68e5f0f1fd822d515259c32bc2c8ff9ee', NULL, 2, 527);
INSERT INTO public.refresh_tokens VALUES (391, '2026-11-06 08:53:20.684213', '2026-11-13 08:53:20.684213', '2026-11-06 09:08:20.657114', 'bd080eec38f90fe2e513329ba8e91e6db934f76b6ef84d4819f1b446259ae7b6', NULL, 2, 528);
INSERT INTO public.refresh_tokens VALUES (392, '2026-11-06 09:08:20.706109', '2026-11-13 09:08:20.706109', '2026-11-06 09:12:00.444928', '02b4f4940326393d760526a68c1059f34a0d54b3c386b6bc13ec6532ae63d29c', NULL, 2, 529);
INSERT INTO public.refresh_tokens VALUES (393, '2026-11-06 09:12:00.48893', '2026-11-13 09:12:00.48893', '2026-11-06 09:12:01.618448', 'b387ab9e602a67c1867184228a19bd1bbc73ce563a8f376e677e8e6bf055f1c2', NULL, 2, 530);
INSERT INTO public.refresh_tokens VALUES (394, '2026-11-06 09:12:01.668541', '2026-11-13 09:12:01.668541', '2026-11-06 09:12:07.252168', '8e608b6c0521a3494fb8fbb95d77237bb1288d70e1e5312fc460281bd7e19e90', NULL, 2, 531);
INSERT INTO public.refresh_tokens VALUES (395, '2026-11-06 09:12:09.706858', '2026-12-06 09:12:09.706858', '2026-11-06 09:27:20.651079', '7daa36c1b7f2a445e705adb14210d36c3b89be771b3bdf6e95abf3728f75fd44', NULL, 2, 532);
INSERT INTO public.refresh_tokens VALUES (397, '2026-11-07 02:03:57.489279', '2026-12-07 02:03:57.489279', '2026-11-07 02:18:58.953865', 'b7c5f2dd0574f97768ff173884b130f7546dd20571bc86ca0afe39122a5971c5', NULL, 1, 533);
INSERT INTO public.refresh_tokens VALUES (398, '2026-11-07 02:18:59.008267', '2026-11-14 02:18:59.008267', '2026-11-07 02:33:28.455675', 'b1d8d5c12feadaded9112f0b8da97f24f68e7a75f89af2bbce41ee3d1006f280', NULL, 1, 534);
INSERT INTO public.refresh_tokens VALUES (399, '2026-11-07 02:33:28.744512', '2026-11-14 02:33:28.744512', '2026-11-07 02:48:31.81602', 'f813214131d2ee37e86f826ab514dc0d77f715b44ad7d38208aa8459931d6edf', NULL, 1, 535);
INSERT INTO public.refresh_tokens VALUES (400, '2026-11-07 02:35:47.265845', '2026-12-07 02:35:47.265845', '2026-11-07 02:51:10.022501', '63e9c9fea7d4fee7bd5073df6f686b735f812fde3bc48a3721057a1d92e77827', 2, NULL, 536);
INSERT INTO public.refresh_tokens VALUES (401, '2026-11-07 02:48:31.975432', '2026-11-14 02:48:31.975432', '2026-11-07 03:12:22.786806', 'ec304a949501cbea0d5ce5b37fd11acb008ffa83edcde36392a4622b03a853d4', NULL, 1, 537);
INSERT INTO public.refresh_tokens VALUES (402, '2026-11-07 02:51:10.022501', '2026-11-14 02:51:10.022501', '2026-11-07 03:26:22.221316', '8e562aa2eedb7b5db3219a96c005d9abd2f827e4c723c38278b8ba24c0a6bd5c', 2, NULL, 538);
INSERT INTO public.refresh_tokens VALUES (403, '2026-11-07 03:12:23.090341', '2026-11-14 03:12:23.090341', '2026-11-07 03:27:34.890421', 'f00f36a8023d0d392416020da0e863c5233d08fe4396e8208374f9741766e28b', NULL, 1, 539);
INSERT INTO public.refresh_tokens VALUES (404, '2026-11-07 03:26:22.221316', '2026-11-14 03:26:22.221316', '2026-11-07 03:33:53.521501', '5865d4f6d8e039a463efc13e8994bde3a77cfb9575696dfca141f5bef7b980e3', 2, NULL, 540);
INSERT INTO public.refresh_tokens VALUES (374, '2026-11-05 11:10:01.494811', '2026-11-12 11:10:01.494811', '2026-11-07 03:43:00.018036', '3e388b3daaebc5f189eb5254110e8d473792354441312ce5dedc13eb912582d7', 1, NULL, 541);
INSERT INTO public.refresh_tokens VALUES (407, '2026-11-07 03:43:00.018036', '2026-11-14 03:43:00.018036', '2026-11-07 03:43:10.158675', '8b68d96b0cf85798d18e52eea348eeed6d392c4473bcd6aee157c050afc72be3', 1, NULL, 542);
INSERT INTO public.refresh_tokens VALUES (405, '2026-11-07 03:27:35.107196', '2026-11-14 03:27:35.107196', '2026-11-07 03:43:12.203409', '87f435b09c13a303108f2d94fa985e466db36c81c1d26ec6147984d7f01be879', NULL, 1, 543);
INSERT INTO public.refresh_tokens VALUES (408, '2026-11-07 03:43:12.382329', '2026-11-14 03:43:12.382329', '2026-11-07 03:45:07.935811', '4472177c3833d4808f9977d9f5d864ee9b4a14332f7c685cf68a5feed508cba4', NULL, 1, 544);
INSERT INTO public.refresh_tokens VALUES (406, '2026-11-07 03:33:53.521501', '2026-11-14 03:33:53.521501', '2026-11-07 03:49:12.697757', '86eab1d4fb4dd33f1edc61470fe4506fd91d8ba552db2e6151483b441cf2a14c', 2, NULL, 545);
INSERT INTO public.refresh_tokens VALUES (409, '2026-11-07 03:43:19.998286', '2026-12-07 03:43:19.998286', '2026-11-07 03:59:19.557236', '201dec816b5975afa52b23e7af69836467c9d0854e43985bc3c88f046d4bb1f0', 1, NULL, 546);
INSERT INTO public.refresh_tokens VALUES (410, '2026-11-07 03:45:08.045406', '2026-11-14 03:45:08.045406', '2026-11-07 04:00:08.798483', '19215ba0ec0cc1fe1faff1f7854bc918ac881917f35fa433f6b34c06ffdc5666', NULL, 1, 547);
INSERT INTO public.refresh_tokens VALUES (411, '2026-11-07 03:49:12.697757', '2026-11-14 03:49:12.697757', '2026-11-07 04:05:00.874556', 'e2ba3c03ed1efbc9e73930078f8f45effcda81a98ab1dcc067c20e4790ca4aa4', 2, NULL, 548);
INSERT INTO public.refresh_tokens VALUES (414, '2026-11-07 04:05:00.874556', '2026-11-14 04:05:00.874556', '2026-11-07 04:05:02.17614', '54dbbd53be294ee307f10767c31ea2387bf72dc1501b60b3f18711a6d62bc5b2', 2, NULL, 549);
INSERT INTO public.refresh_tokens VALUES (413, '2026-11-07 04:00:08.864312', '2026-11-14 04:00:08.863326', '2026-11-07 04:07:49.525616', '2497a3e60f00e876dfb433f73511612b2ff5e2375e379e643332438d8940522d', NULL, 1, 550);
INSERT INTO public.refresh_tokens VALUES (396, '2026-11-06 09:27:20.696512', '2026-11-13 09:27:20.696512', '2026-11-07 04:13:02.654932', 'bb929232472af3b4142b624aa9a76d3b7232e02a0ea95ace9e6a277cbb07dca2', NULL, 2, 551);
INSERT INTO public.refresh_tokens VALUES (376, '2026-11-06 03:10:04.072081', '2026-11-13 03:10:04.072081', '2026-11-08 19:34:13.35362', '9812140837aa7decf47c548db3ac35c95ee79e1e5e9ffb92fce29233cb4701da', 1, NULL, 552);
INSERT INTO public.refresh_tokens VALUES (416, '2026-11-07 04:13:02.765451', '2026-11-14 04:13:02.765451', '2026-11-07 04:13:39.458056', 'c472aa82d36a03050c23490e8b69d8be6dcf9a8a20d9ed5b4111120c70fa6a1a', NULL, 2, 553);
INSERT INTO public.refresh_tokens VALUES (412, '2026-11-07 03:59:19.557236', '2026-11-14 03:59:19.557236', '2026-11-07 04:14:19.655811', '529fdbd7fd638909a955bdd77aeee8f1f50f6ff9356cd1cd03849ed2bcbcddf3', 1, NULL, 554);
INSERT INTO public.refresh_tokens VALUES (415, '2026-11-07 04:05:02.17614', '2026-11-14 04:05:02.17614', '2026-11-07 04:20:11.872279', 'b7fbf594f50c67a8ae68b7f4b960d30d72ccfa12e7c5f7ec30ae192a72815a96', 2, NULL, 555);
INSERT INTO public.refresh_tokens VALUES (418, '2026-11-07 04:14:19.655811', '2026-11-14 04:14:19.655811', '2026-11-07 04:30:19.486332', '05161a76b1b69329c2b289c3dd42c06c9149a50943a3cb2de08f0148a193ae47', 1, NULL, 556);
INSERT INTO public.refresh_tokens VALUES (419, '2026-11-07 04:17:25.93912', '2026-12-07 04:17:25.93912', '2026-11-07 04:32:52.861444', '9cc8bfaef11ee4fcaaf7c09324af4f0a8ada530f0cbb1c4f2f68f6db698f7030', NULL, 1, 557);
INSERT INTO public.refresh_tokens VALUES (420, '2026-11-07 04:20:11.872279', '2026-11-14 04:20:11.872279', '2026-11-07 04:33:35.133939', '7927eaa11df8ecd74934698c405c225b626b06a0ba9fd1cb0c395f01d5cf9534', 2, NULL, 558);
INSERT INTO public.refresh_tokens VALUES (421, '2026-11-07 04:29:20.405849', '2026-11-14 04:29:20.405849', '2026-11-07 04:44:20.308251', '0a0aef5a8751ed003d085e2b09cd2e0f5eb67ba28656ad7ad322aa0244c7ee34', NULL, 2, 559);
INSERT INTO public.refresh_tokens VALUES (373, '2026-11-05 11:01:40.070206', '2026-11-12 11:01:40.070206', '2026-11-07 05:48:27.855994', '48f6dc5f0f1921e682aa1113765306351c099c69d84225888083d393dac9fa56', 2, NULL, 560);
INSERT INTO public.refresh_tokens VALUES (417, '2026-11-07 04:13:39.597697', '2026-11-14 04:13:39.597697', '2026-11-07 04:29:20.352302', '87f6ea52d98e6e34ce4e451f23b013c0157f304b1bbbe5d3ddf37bf14a52d0fd', NULL, 2, 561);
INSERT INTO public.refresh_tokens VALUES (423, '2026-11-07 04:32:52.911636', '2026-11-14 04:32:52.911636', '2026-11-07 04:33:34.198048', 'a7e3c1295a02c14dbcc8667ca02ab99fa14e6e0e90adbaa73e1207637b3ff389', NULL, 1, 562);
INSERT INTO public.refresh_tokens VALUES (422, '2026-11-07 04:30:19.486332', '2026-11-14 04:30:19.486332', '2026-11-07 04:45:19.641973', '30cc570a8f7442ffeded44996683ffe267424aa073a0435ee7a38d2bccb6e63d', 1, NULL, 563);
INSERT INTO public.refresh_tokens VALUES (424, '2026-11-07 04:33:34.243844', '2026-11-14 04:33:34.243844', '2026-11-07 04:46:10.522041', 'c12e7051d17ffefc65264ca920d10ae7e4d651202d8ad7fd8fb283597a3fe56e', NULL, 1, 564);
INSERT INTO public.refresh_tokens VALUES (425, '2026-11-07 04:33:35.133939', '2026-11-14 04:33:35.133939', '2026-11-07 04:49:12.418373', 'bc26c845bfea8c363b27d5200424beb02d1366a525e738f678b87440bb75a8ae', 2, NULL, 565);
INSERT INTO public.refresh_tokens VALUES (427, '2026-11-07 04:45:19.641973', '2026-11-14 04:45:19.641973', '2026-11-07 05:00:19.375307', '29d5135cdd875a2268242e3fbba641bb218ee537d6e42ca894eab43164a0a4d8', 1, NULL, 566);
INSERT INTO public.refresh_tokens VALUES (426, '2026-11-07 04:44:20.554211', '2026-11-14 04:44:20.554211', '2026-11-07 05:00:20.291462', '11e37e25ea5c88e4d4545fb9ffec3a82c739f0e4cb60bd2cd8b9948ce6546581', NULL, 2, 567);
INSERT INTO public.refresh_tokens VALUES (428, '2026-11-07 04:46:10.558618', '2026-11-14 04:46:10.558618', '2026-11-07 05:01:11.803507', '9f6463508e3bada6532b663d7039a38bf9d065fb1ea6659129a95d34c8263bbd', NULL, 1, 568);
INSERT INTO public.refresh_tokens VALUES (431, '2026-11-07 05:00:20.387839', '2026-11-14 05:00:20.387839', '2026-11-07 05:02:31.000674', '13c8436206b2b1d708dc92aeb2fd091e68204fe9f26c7ac7888e5298784138dc', NULL, 2, 569);
INSERT INTO public.refresh_tokens VALUES (429, '2026-11-07 04:49:12.418373', '2026-11-14 04:49:12.418373', '2026-11-07 05:05:11.850393', 'd26e17f427dbb6571e4bdd5081a695a22ba7476c96a504833eb94ab3dd3a52e5', 2, NULL, 570);
INSERT INTO public.refresh_tokens VALUES (430, '2026-11-07 05:00:19.375307', '2026-11-14 05:00:19.375307', '2026-11-07 05:15:19.305748', '2ed0e819268330a9c3e819d726ce01e0933f9e9be8aed2d59e3c1bf56a36d26e', 1, NULL, 571);
INSERT INTO public.refresh_tokens VALUES (433, '2026-11-07 05:02:31.055349', '2026-11-14 05:02:31.055349', '2026-11-07 05:18:20.762456', '40fc554b1f19e9bdaf136a720f27435f1e27a1b809691b17a1451c9235f2b536', NULL, 2, 572);
INSERT INTO public.refresh_tokens VALUES (434, '2026-11-07 05:05:11.851392', '2026-11-14 05:05:11.851392', '2026-11-07 05:20:11.978526', '53165da7977ce86c1ff1e8fb8de49ccf18b24039f39c7627137a91049b653c07', 2, NULL, 573);
INSERT INTO public.refresh_tokens VALUES (438, '2026-11-07 05:23:14.199519', '2026-11-14 05:23:14.199519', NULL, '21bb130cc57fb66eba4356b20df0f1f39a689e1b384892f09bf095ae826c8a3c', NULL, 1, 574);
INSERT INTO public.refresh_tokens VALUES (432, '2026-11-07 05:01:11.871397', '2026-11-14 05:01:11.871397', '2026-11-07 05:23:14.047295', '82bd1f076f54337d5d58ee9dad177cbe6a8587c3e201c0c6eb4593a716313d4a', NULL, 1, 575);
INSERT INTO public.refresh_tokens VALUES (436, '2026-11-07 05:18:20.850136', '2026-11-14 05:18:20.850136', '2026-11-07 05:28:46.919025', '3fdae9f321c1950026b04eb62dd15fe183cd6b23352a467f423ed6386f6bfcb6', NULL, 2, 576);
INSERT INTO public.refresh_tokens VALUES (435, '2026-11-07 05:15:19.305748', '2026-11-14 05:15:19.305748', '2026-11-07 05:30:19.173048', '1338bcfdccf55c8e6cfbef881b4b305ef962411fd0b1342a2caff7cb7c307d40', 1, NULL, 577);
INSERT INTO public.refresh_tokens VALUES (437, '2026-11-07 05:20:11.978526', '2026-11-14 05:20:11.978526', '2026-11-07 05:36:11.768414', '123c5e6d2a7bd78fad1efdf7adb05d3bfc92ac81633d5645a3612e8d4dedefa8', 2, NULL, 578);
INSERT INTO public.refresh_tokens VALUES (439, '2026-11-07 05:28:46.977268', '2026-11-14 05:28:46.97627', '2026-11-07 05:44:20.25785', '23d1087b953f603d4c5cda70d92a6effe5c131ff64405fbb9b7e6097dbbbd966', NULL, 2, 579);
INSERT INTO public.refresh_tokens VALUES (440, '2026-11-07 05:30:19.173048', '2026-11-14 05:30:19.173048', '2026-11-07 05:45:19.870045', '533922943775acf147d20dfbe7a60a0f085eeef6a34edd916ab21c7326bcb389', 1, NULL, 580);
INSERT INTO public.refresh_tokens VALUES (442, '2026-11-07 05:44:20.301525', '2026-11-14 05:44:20.301525', '2026-11-07 05:59:20.629181', 'b72065d754bd820f59dd9d034dede4f840705a4788725f38d9fa43e50fbcfa2b', NULL, 2, 581);
INSERT INTO public.refresh_tokens VALUES (450, '2026-11-07 06:00:03.230467', '2026-11-14 06:00:03.230467', NULL, '10b3a50b48c69b13ca014cc424e0bc9e4ba5afbf15f609342cdc67fb851afafe', NULL, 3, 582);
INSERT INTO public.refresh_tokens VALUES (444, '2026-11-07 05:48:27.857005', '2026-11-14 05:48:27.857005', '2026-11-07 05:48:52.535873', 'a9f1713bf2557bcc3be5dfcf00c20cd4428132f38531a9bedb56cde31d5d5323', 2, NULL, 583);
INSERT INTO public.refresh_tokens VALUES (372, '2026-11-05 10:47:40.117806', '2026-11-12 10:47:40.117806', '2026-11-07 06:00:03.042347', '02975032240003636888d27ae9534b1a093ae28770bb419f86fd7005375c6f5e', NULL, 3, 584);
INSERT INTO public.refresh_tokens VALUES (445, '2026-11-07 05:48:52.536865', '2026-11-14 05:48:52.536865', '2026-11-07 05:49:38.076627', '4aee1c1b9940374dcdf1a29126185616a22598d0e1556d0daf19bbfbbeeca634', 2, NULL, 585);
INSERT INTO public.refresh_tokens VALUES (441, '2026-11-07 05:36:11.768414', '2026-11-14 05:36:11.768414', '2026-11-07 05:51:15.923468', 'f09b9bd482739ef0c935cb025fc97c880fe6712e2653c5e82dfcf3b3c222156b', 2, NULL, 586);
INSERT INTO public.refresh_tokens VALUES (443, '2026-11-07 05:45:19.870045', '2026-11-14 05:45:19.870045', '2026-11-07 06:01:19.60387', '0b5c9fdb41713423a85e49b36561e8d385c2c0f7c0149a8e819deeffd3401776', 1, NULL, 587);
INSERT INTO public.refresh_tokens VALUES (446, '2026-11-07 05:49:45.917918', '2026-12-07 05:49:45.917918', '2026-11-07 06:02:25.152369', 'c990700d3b3f824daa11c461e95481236bce9dd86bbd6ee12112882eb6d9fd0c', 1, NULL, 588);
INSERT INTO public.refresh_tokens VALUES (447, '2026-11-07 05:50:34.088883', '2026-12-07 05:50:34.088883', '2026-11-07 06:04:04.467504', '69af57d4d7267738322540e1e82063bbd5e9e07be83dde5d2bbfe0df11abadb5', NULL, 1, 589);
INSERT INTO public.refresh_tokens VALUES (453, '2026-11-07 06:03:10.961621', '2026-12-07 06:03:10.961621', '2026-11-07 06:04:24.003784', '9f785108d1c837e73d1bec21918739e031178719517dd67fd4ea1d18f6f8f35b', 2, NULL, 590);
INSERT INTO public.refresh_tokens VALUES (448, '2026-11-07 05:51:15.924468', '2026-11-14 05:51:15.924468', '2026-11-07 06:06:35.847411', '292efb32090dc9be367e650aa65fad052b74a53d5b0ff19f1b91fb5062d5c48f', 2, NULL, 591);
INSERT INTO public.refresh_tokens VALUES (449, '2026-11-07 05:59:20.823181', '2026-11-14 05:59:20.823181', '2026-11-07 06:15:20.321879', 'efe18b9deb69b094f9651dd726f47ed223ca6d174a0477141c4596ff056bd2cd', NULL, 2, 592);
INSERT INTO public.refresh_tokens VALUES (451, '2026-11-07 06:00:22.732223', '2026-12-07 06:00:22.732223', '2026-11-07 06:16:15.414879', 'ec0e51532bd52f8c7ac36a6e9d3f62b43947037c34375ace8444aac88c77fff4', NULL, 3, 593);
INSERT INTO public.refresh_tokens VALUES (452, '2026-11-07 06:01:19.60455', '2026-11-14 06:01:19.60455', '2026-11-07 06:17:19.122471', 'f1ad6dc771a11ab775d2af864cfcf728d5fd2182d1684950ae3ea81c153f4f59', 1, NULL, 594);
INSERT INTO public.refresh_tokens VALUES (454, '2026-11-07 06:04:24.003784', '2026-11-14 06:04:24.003784', '2026-11-07 06:19:25.73801', 'c716e414092d1354a678f569df989eed8ced16e8b51ac655d874d5123649ad04', 2, NULL, 595);
INSERT INTO public.refresh_tokens VALUES (455, '2026-11-07 06:05:50.763617', '2026-12-07 06:05:50.763617', '2026-11-07 06:21:11.769345', '0fbe5733dac547be9935a5c4763d5325eb55498a76eed3783a44b5dc08b8cd16', NULL, 11, 596);
INSERT INTO public.refresh_tokens VALUES (456, '2026-11-07 06:06:35.847411', '2026-11-14 06:06:35.847411', '2026-11-07 06:21:46.742996', '21c228cf71194d71f365571933b23d755472aaa39fd1e06bb298a22153879a83', 2, NULL, 597);
INSERT INTO public.refresh_tokens VALUES (459, '2026-11-07 06:17:19.122471', '2026-11-14 06:17:19.122471', '2026-11-07 06:26:16.028302', '5a71fd0dbbca8b68357689a8de0e99e75b8596fa4050060eb585aacb97f0a619', 1, NULL, 598);
INSERT INTO public.refresh_tokens VALUES (457, '2026-11-07 06:15:20.398131', '2026-11-14 06:15:20.398131', '2026-11-07 06:30:20.337433', '0716f2cbd975cca6462bdd60e64905021d07da61291d66587310ee824399162f', NULL, 2, 599);
INSERT INTO public.refresh_tokens VALUES (463, '2026-11-07 06:26:16.028302', '2026-11-14 06:26:16.028302', '2026-11-07 06:33:38.136364', '2f02a17427c069ecfb8511238f77021564221e5eb8a9c23460caa074a49a8765', 1, NULL, 600);
INSERT INTO public.refresh_tokens VALUES (465, '2026-11-07 06:33:38.136364', '2026-11-14 06:33:38.136364', '2026-11-07 06:33:48.3305', '1167a08cbf62fb057cdf324eb5b1ba333a79df4b434a3ede7893fa54fadb27a6', 1, NULL, 601);
INSERT INTO public.refresh_tokens VALUES (460, '2026-11-07 06:19:25.73801', '2026-11-14 06:19:25.73801', '2026-11-07 06:35:15.361658', 'b4848d8fca5fa28c0b84ee3f5fd7754e325fa59f9a0560bc4a497c52890ecab8', 2, NULL, 602);
INSERT INTO public.refresh_tokens VALUES (467, '2026-11-07 06:36:03.473127', '2026-12-07 06:36:03.473127', '2026-11-07 06:36:22.104766', '7480da5a4da3e7842ea2077fb036b31ef9453e8632bfa32a34f45ffd05378f8d', 5, NULL, 603);
INSERT INTO public.refresh_tokens VALUES (468, '2026-11-07 06:36:53.044332', '2026-11-14 06:36:53.044332', NULL, '9ea4334751ee39295f18dbcf5a0ef66b08ac416fc0891a8fde860cc1e8d397a6', 2, NULL, 604);
INSERT INTO public.refresh_tokens VALUES (466, '2026-11-07 06:35:15.361658', '2026-11-14 06:35:15.361658', '2026-11-07 06:36:53.044332', '3a486334013a21fb02ebc7bd90fd4f8fb9d7d4987d8da1df57c66144a5a1673d', 2, NULL, 605);
INSERT INTO public.refresh_tokens VALUES (462, '2026-11-07 06:21:46.742996', '2026-11-14 06:21:46.742996', '2026-11-07 06:37:12.075395', '10c0d994f5e0ce5e899ede6a478a2ce1749b1d584e71d7bf4fd523db7fbfaa07', 2, NULL, 606);
INSERT INTO public.refresh_tokens VALUES (471, '2026-11-07 06:38:47.004679', '2026-11-14 06:38:47.004679', NULL, 'a80a5cc05c00217da7a505f845502619ccfe8e85fc8c194bd825d062922bebc3', NULL, 3, 607);
INSERT INTO public.refresh_tokens VALUES (458, '2026-11-07 06:16:15.719536', '2026-11-14 06:16:15.719536', '2026-11-07 06:38:46.969836', '60fd48e6787f3527cf5e45ce7e248940cbb96a54731fbe944612f4115289be37', NULL, 3, 608);
INSERT INTO public.refresh_tokens VALUES (472, '2026-11-07 06:39:57.454758', '2026-12-07 06:39:57.454758', '2026-11-07 06:40:29.679757', 'fa0a67f997b3b97965180a9f05d506d3a00aeb4f5e0c852738be349e61956c9f', NULL, 2, 609);
INSERT INTO public.refresh_tokens VALUES (461, '2026-11-07 06:21:11.804041', '2026-11-14 06:21:11.804041', '2026-11-07 06:41:09.88255', '20b4f02f8653d5f952fe93df57322031a8fb490f5920b23429543f3ff785ec5c', NULL, 11, 610);
INSERT INTO public.refresh_tokens VALUES (474, '2026-11-07 06:41:59.204368', '2026-12-07 06:41:59.204368', NULL, '419796137123c448666f9827b6b190ac4b1a33c194867ccd7016a4d5a6a04ca7', NULL, 3, 611);
INSERT INTO public.refresh_tokens VALUES (464, '2026-11-07 06:30:20.421402', '2026-11-14 06:30:20.421402', '2026-11-07 06:46:19.473293', 'b56ecdb4d29385a23c2c250767f4d93350d47f5bcdeb2632b5421d21a27ab8e4', NULL, 2, 612);
INSERT INTO public.refresh_tokens VALUES (475, '2026-11-07 06:44:15.259045', '2026-11-14 06:44:15.259045', '2026-11-07 06:48:55.516853', '1b788bd74165374c5f1ef97498668fe1e04b30c4315aa89eb7eb1e10ee9e7bbb', NULL, 11, 613);
INSERT INTO public.refresh_tokens VALUES (469, '2026-11-07 06:37:12.075395', '2026-11-14 06:37:12.075395', '2026-11-07 06:53:11.792559', 'd84205f62e18a80e6093563436a7ea126099c2d84dbd3f5fcea27dbae165e9bc', 2, NULL, 614);
INSERT INTO public.refresh_tokens VALUES (473, '2026-11-07 06:41:09.96923', '2026-11-14 06:41:09.96923', '2026-11-07 06:44:15.188626', '89367a4d1e343f5c63da7bcd4fc5c070cd90f9b6fe387a57f9ddc2b3eae193d3', NULL, 11, 615);
INSERT INTO public.refresh_tokens VALUES (470, '2026-11-07 06:38:19.587736', '2026-12-07 06:38:19.587736', '2026-11-07 06:54:15.507995', '250f9ae29ed0b9eaa4604f8b2b19d7242f61cd1087e5b56cb417882b8097965e', 2, NULL, 616);
INSERT INTO public.refresh_tokens VALUES (482, '2026-11-07 06:59:28.514213', '2026-11-14 06:59:28.514213', NULL, 'd0ae5658981fc43be7cb1a494a1a9ddd812c7ed5b6cc774ad856b29952c08868', NULL, 3, 617);
INSERT INTO public.refresh_tokens VALUES (478, '2026-11-07 06:51:14.885422', '2026-12-07 06:51:14.885422', '2026-11-07 06:59:28.418719', '5d1bf83ae321beadc939fffb662fe7803d3461f4c1e0e7a4c07260e8a396f483', NULL, 3, 618);
INSERT INTO public.refresh_tokens VALUES (480, '2026-11-07 06:54:15.509024', '2026-11-14 06:54:15.509024', '2026-11-07 06:59:30.227645', 'f9fea5038553e25a1f4152ae263b4e1c4216a825463b54a88c5bf8cbd21037d1', 2, NULL, 619);
INSERT INTO public.refresh_tokens VALUES (476, '2026-11-07 06:46:19.551751', '2026-11-14 06:46:19.551751', '2026-11-07 07:01:20.138648', 'dc1972c2f3e58d9b61ccf0a530d6e16582039bb9b45c74b3bf65ee3d0f651bbb', NULL, 2, 620);
INSERT INTO public.refresh_tokens VALUES (484, '2026-11-07 07:01:20.182882', '2026-11-14 07:01:20.182882', '2026-11-07 07:03:46.242234', 'be72a56858d1c4035c3049b95bdc8b47e14ccea7dbdeb298e3390bce89973a4d', NULL, 2, 621);
INSERT INTO public.refresh_tokens VALUES (479, '2026-11-07 06:53:11.792559', '2026-11-14 06:53:11.792559', '2026-11-07 07:06:00.842967', '962e0b547ac6161c02db341d6c17842f0da331d76a0ee5298abcb86d4963a976', 2, NULL, 622);
INSERT INTO public.refresh_tokens VALUES (477, '2026-11-07 06:48:55.60206', '2026-11-14 06:48:55.60206', '2026-11-07 07:06:00.947155', 'f2f6093b2c6a35fbfa218fa7864eb39c33638cea590d226b3502cab5fc7d4a5a', NULL, 11, 623);
INSERT INTO public.refresh_tokens VALUES (485, '2026-11-07 07:03:46.301034', '2026-11-14 07:03:46.301034', '2026-11-07 07:06:21.430316', '7d2b0d66ed28bbefae4b7c84d3a59038ce5f9ba7fdf7fbc19e898a427d2852f0', NULL, 2, 624);
INSERT INTO public.refresh_tokens VALUES (490, '2026-11-07 07:09:37.237081', '2026-11-14 07:09:37.237081', NULL, '231cd2a77649887a8b073790bf5c76f736b53394b7081f173fee1890e6cfbc10', NULL, 2, 625);
INSERT INTO public.refresh_tokens VALUES (503, '2026-11-07 07:29:42.400031', '2026-11-14 07:29:42.400031', '2026-11-07 07:32:40.306917', 'a148b45f1b76e4a70bd2f9672d56901cf7b937b8a1edcd2bfb098d0fcbf0dd31', NULL, 3, 626);
INSERT INTO public.refresh_tokens VALUES (481, '2026-11-07 06:59:22.461066', '2026-12-07 06:59:22.461066', '2026-11-07 07:09:37.307078', 'd679102e512029fee245496eec9c170b485096b7d4a4fd48181dc7e1fa9e612b', NULL, 2, 627);
INSERT INTO public.refresh_tokens VALUES (491, '2026-11-07 07:09:37.354849', '2026-11-14 07:09:37.354849', '2026-11-07 07:11:24.025295', 'd5e6d497746548dd016d738144ad34d3df2d461b92e5495fdfe60a58bf858c99', NULL, 2, 628);
INSERT INTO public.refresh_tokens VALUES (489, '2026-11-07 07:06:21.649234', '2026-11-14 07:06:21.649234', '2026-11-07 07:12:15.348194', '2344e76c172c298f885e73d50850a9c29e795a0c7c8eb4e92503a5b965e662a0', NULL, 2, 629);
INSERT INTO public.refresh_tokens VALUES (486, '2026-11-07 07:03:57.572201', '2026-12-07 07:03:57.572201', '2026-11-07 07:14:09.987389', 'ede6564f078b20b7b40cab577e4ddf758825b1076e969644f68fca4aa87b4012', NULL, 3, 630);
INSERT INTO public.refresh_tokens VALUES (493, '2026-11-07 07:12:15.523141', '2026-11-14 07:12:15.523141', '2026-11-07 07:15:11.126327', '31a6d2c4a32f7c5a5c296b3444294456f2eac36c101ad4f5b9faf145e937278b', NULL, 2, 631);
INSERT INTO public.refresh_tokens VALUES (483, '2026-11-07 06:59:30.227645', '2026-11-14 06:59:30.227645', '2026-11-07 07:15:15.35389', 'f4a949a5d3dd35cb49d51d4a557293094ad316d0cd0263d8c5a936f9ed016885', 2, NULL, 632);
INSERT INTO public.refresh_tokens VALUES (495, '2026-11-07 07:15:11.168082', '2026-11-14 07:15:11.168082', '2026-11-07 07:15:24.12329', '17be4e0e021937eab22fb692ae9b082280f5c585d8a05ad93375da9198faf800', NULL, 2, 633);
INSERT INTO public.refresh_tokens VALUES (496, '2026-11-07 07:15:15.35389', '2026-11-14 07:15:15.35389', '2026-11-07 07:16:27.509667', '42b4e9a7ed4f6f9aa16d4d6f2bd500ce58f28da18d949b29322cc306ddba83f8', 2, NULL, 634);
INSERT INTO public.refresh_tokens VALUES (487, '2026-11-07 07:06:00.842967', '2026-11-14 07:06:00.842967', '2026-11-07 07:21:11.797495', '5902fc281147b16266f5d38be22438030ec16507c731c9429df9f4c5b0104d10', 2, NULL, 635);
INSERT INTO public.refresh_tokens VALUES (488, '2026-11-07 07:06:01.009005', '2026-11-14 07:06:01.009005', '2026-11-07 07:21:11.806004', '3f5b68d0cac99f6b0dd8c3f633f1ef8153deef10efd758e390acffd2d4c6c557', NULL, 11, 636);
INSERT INTO public.refresh_tokens VALUES (492, '2026-11-07 07:11:24.059639', '2026-11-14 07:11:24.059639', '2026-11-07 07:27:11.21396', '46c04acc5c60c796927462f9be8520a6f1724e46dd41ab868a282bd40ffb8461', NULL, 2, 637);
INSERT INTO public.refresh_tokens VALUES (500, '2026-11-07 07:21:11.851461', '2026-11-14 07:21:11.851461', '2026-11-07 07:27:35.619054', '1d839d382f729ace721df3a323bfacb1d38f9197170363060d790cae494044b4', NULL, 11, 638);
INSERT INTO public.refresh_tokens VALUES (494, '2026-11-07 07:14:10.029389', '2026-11-14 07:14:10.029389', '2026-11-07 07:29:42.264632', '81177655e5e4eb83413e6fadc3106893a5a5de77a56358b575a54ae0a7d67538', NULL, 3, 639);
INSERT INTO public.refresh_tokens VALUES (498, '2026-11-07 07:16:27.509667', '2026-11-14 07:16:27.509667', '2026-11-07 07:30:02.562293', '1f84fcbcd1a700d0cc1ad7c1f4f080fb66aca67b07bcc024a8329b546c351242', 2, NULL, 640);
INSERT INTO public.refresh_tokens VALUES (497, '2026-11-07 07:15:24.159362', '2026-11-14 07:15:24.159362', '2026-11-07 07:31:20.052218', '0a3c4096d037bfa8372d1c01c0f1b421bf901dce04b2f70ffc85f592224de481', NULL, 2, 641);
INSERT INTO public.refresh_tokens VALUES (499, '2026-11-07 07:21:11.797495', '2026-11-14 07:21:11.797495', '2026-11-07 07:36:11.821017', '5cfe05d4755a5718c99664e625ddfcfb6eed4297721f6cc7ba2d9b3d3a8d2a48', 2, NULL, 642);
INSERT INTO public.refresh_tokens VALUES (501, '2026-11-07 07:27:11.296538', '2026-11-14 07:27:11.296538', '2026-11-07 07:42:19.148826', 'b4125af49c505c09c476a37a3b3743509f951bc47e0dce9aeea651cb2f013d0e', NULL, 2, 643);
INSERT INTO public.refresh_tokens VALUES (502, '2026-11-07 07:27:35.673092', '2026-11-14 07:27:35.673092', '2026-11-07 07:43:11.810037', 'c8eb4454fa36d9494178a27ef4304de5b7538fbcfe7ae7519ef7a74167642e4d', NULL, 11, 644);
INSERT INTO public.refresh_tokens VALUES (504, '2026-11-07 07:30:02.562798', '2026-11-14 07:30:02.562798', '2026-11-07 07:45:02.942754', '69ffe3c198cf1d32a9084b4d817156a89baccf9def3d97a9b616b2eab87e91eb', 2, NULL, 645);
INSERT INTO public.refresh_tokens VALUES (506, '2026-11-07 07:33:37.002585', '2026-12-07 07:33:37.002585', '2026-11-07 07:45:08.117293', '3fe3412c57739670d26ba14f86f0f21fb09beb229eadbc49727be121af496ac0', NULL, 6, 646);
INSERT INTO public.refresh_tokens VALUES (505, '2026-11-07 07:31:20.088162', '2026-11-14 07:31:20.088162', '2026-11-07 07:47:20.031074', '2be141efcc277349ff0043dc92b816313a3f21a08443cba4d2f1939bbc76787b', NULL, 2, 647);
INSERT INTO public.refresh_tokens VALUES (511, '2026-11-07 07:45:08.161916', '2026-11-14 07:45:08.161916', '2026-11-07 07:48:03.85474', '1558e99a9a656bff7f29804297c797ac5b3309407e32afd2a2d9556125858c0c', NULL, 6, 648);
INSERT INTO public.refresh_tokens VALUES (509, '2026-11-07 07:43:11.873736', '2026-11-14 07:43:11.873736', '2026-11-07 07:49:45.102956', '39ede842b08865b912ad253b281bb8800a050deaa0af020e71c0f36bf8f21bdb', NULL, 11, 649);
INSERT INTO public.refresh_tokens VALUES (507, '2026-11-07 07:36:11.821017', '2026-11-14 07:36:11.821017', '2026-11-07 07:51:11.771602', '27091d93a06490274e06ef658aa923cb9535cdf06900e3fe39b9cd6c449a7d20', 2, NULL, 650);
INSERT INTO public.refresh_tokens VALUES (514, '2026-11-07 07:49:45.182439', '2026-11-14 07:49:45.182439', '2026-11-07 07:53:03.515747', '1e2669e8c81ce5f983d225cc4328ad5b1b33c6a02f75c703fc8cf1bfc8eb622e', NULL, 11, 651);
INSERT INTO public.refresh_tokens VALUES (508, '2026-11-07 07:42:19.324727', '2026-11-14 07:42:19.324727', '2026-11-07 07:57:19.604346', '40b8aeafc55087891e6e8f639790b7058a17751618938f8bc737e60477d093a6', NULL, 2, 652);
INSERT INTO public.refresh_tokens VALUES (513, '2026-11-07 07:48:04.394123', '2026-11-14 07:48:04.394123', '2026-11-07 07:59:03.387175', '58ef15f9669ec1f66b1277149a5cd003173ef476f305199b290cccb66e308848', NULL, 6, 653);
INSERT INTO public.refresh_tokens VALUES (510, '2026-11-07 07:45:02.943742', '2026-11-14 07:45:02.943742', '2026-11-07 07:59:04.370256', '8dea0a9fbed409db23505b70e450087e87778abec1fc76abe756d7b4ffe8b294', 2, NULL, 654);
INSERT INTO public.refresh_tokens VALUES (512, '2026-11-07 07:47:20.065213', '2026-11-14 07:47:20.065213', '2026-11-07 08:03:20.027113', 'fed3a6b7a0bf4b276774bafb67acf93637bb8faec5d1ed8f66a0fe93a4a95d7c', NULL, 2, 655);
INSERT INTO public.refresh_tokens VALUES (519, '2026-11-07 07:59:04.370256', '2026-11-14 07:59:04.370256', '2026-11-07 08:06:04.374915', '39492b75fac65fb2f4d50ed9c25f5ab69b838b4ba51884db02327a595cf22f78', 2, NULL, 656);
INSERT INTO public.refresh_tokens VALUES (518, '2026-11-07 07:59:03.438872', '2026-11-14 07:59:03.438872', '2026-11-07 08:06:05.502216', '176922c95589ddb727f216313a955e3a31ce17bff9204f68c4f805d6453ed010', NULL, 6, 657);
INSERT INTO public.refresh_tokens VALUES (515, '2026-11-07 07:51:11.771602', '2026-11-14 07:51:11.771602', '2026-11-07 08:06:11.798927', '73d892b3c97cd3d5de99a3dbbcf7f17d222867de50adc2fb78534df138a2feca', 2, NULL, 658);
INSERT INTO public.refresh_tokens VALUES (516, '2026-11-07 07:53:10.797464', '2026-12-07 07:53:10.797464', '2026-11-07 08:08:11.807576', '125739ae608eaefb2ac3e38f1e2339955fc51ebfc8c10a8b001ec84cf20d1b23', NULL, 11, 659);
INSERT INTO public.refresh_tokens VALUES (521, '2026-11-07 08:06:04.374915', '2026-11-14 08:06:04.374915', '2026-11-07 08:08:38.104817', '0d36c4e62e856a43f7f6441dc8a2647f5a0dc493f8ad9e09604804225b41f3f6', 2, NULL, 660);
INSERT INTO public.refresh_tokens VALUES (517, '2026-11-07 07:57:19.687398', '2026-11-14 07:57:19.687398', '2026-11-07 08:13:06.283701', '1e9ea45a267c155b65abd10201b1dcc88a3c460f766de6e194a059d0adc4e0a1', NULL, 2, 661);
INSERT INTO public.refresh_tokens VALUES (522, '2026-11-07 08:06:05.814002', '2026-11-14 08:06:05.814002', '2026-11-07 08:18:16.656026', '320958d8b9aec020a73f1f4a070941b065f2328ac5fd2ab36063aea73bb0c35a', NULL, 6, 662);
INSERT INTO public.refresh_tokens VALUES (520, '2026-11-07 08:03:20.067804', '2026-11-14 08:03:20.067804', '2026-11-07 08:19:20.03185', '8acc1d51d75d5e7c780cb1d464504cfaf8eaa9f54f2eb970b50b8574965b318c', NULL, 2, 663);
INSERT INTO public.refresh_tokens VALUES (523, '2026-11-07 08:06:11.798927', '2026-11-14 08:06:11.798927', '2026-11-07 08:21:11.779622', 'eb0c22fc2574b6376ae081a435ed47583750a102982527905231a4ca9d3a901f', 2, NULL, 664);
INSERT INTO public.refresh_tokens VALUES (531, '2026-11-07 08:24:15.382701', '2026-11-14 08:24:15.382701', '2026-11-07 08:25:37.345196', 'ee26e9c5d59e48abd53babe1b9accaefa8e749dd4dbbb3f3a16e1de51464d799', 2, NULL, 665);
INSERT INTO public.refresh_tokens VALUES (526, '2026-11-07 08:13:06.379754', '2026-11-14 08:13:06.379754', '2026-11-07 08:28:19.272645', '5fc01b58bb1bb738b08a34202beab6823f951da61476d9e7c4cd9359ace71aa8', NULL, 2, 666);
INSERT INTO public.refresh_tokens VALUES (529, '2026-11-07 08:21:11.779622', '2026-11-14 08:21:11.779622', '2026-11-07 08:30:21.78581', 'f5bc4f42d10611d0e9bc9b7d0fe8fbb08df8d5c283e068a611a49ca1254af748', 2, NULL, 667);
INSERT INTO public.refresh_tokens VALUES (527, '2026-11-07 08:18:16.71445', '2026-11-14 08:18:16.71445', '2026-11-07 08:33:49.126781', '309c3b64e51d782c1962bd36e2e97d6847e613b83ed4af37742c9107b78662ac', NULL, 6, 668);
INSERT INTO public.refresh_tokens VALUES (530, '2026-11-07 08:24:11.819356', '2026-11-14 08:24:11.819356', '2026-11-07 08:34:16.417448', 'b055c37c8d278a30f83bb342212d7c363d109f1382585b40b120dac27668901c', NULL, 11, 669);
INSERT INTO public.refresh_tokens VALUES (528, '2026-11-07 08:19:20.081891', '2026-11-14 08:19:20.081891', '2026-11-07 08:35:20.087694', '48f5ce9a7e42290841d6b24ef1ba6f42de5bc5a10b40d21edb506a1974dd98df', NULL, 2, 670);
INSERT INTO public.refresh_tokens VALUES (524, '2026-11-07 08:08:11.877319', '2026-11-14 08:08:11.877319', '2026-11-07 08:24:11.779239', 'a7d4e226f4511b4b30fcf3e58c7ed38ec15c26f4da800b49c34a034643148d47', NULL, 11, 671);
INSERT INTO public.refresh_tokens VALUES (535, '2026-11-07 08:30:21.78581', '2026-11-14 08:30:21.78581', '2026-11-07 08:46:11.800558', 'd43d64c830b8914d616561e608289b1a00d29cb73583defcb6d73b9fbea02029', 2, NULL, 672);
INSERT INTO public.refresh_tokens VALUES (617, '2026-11-07 09:48:33.631108', '2026-11-14 09:48:33.631108', NULL, 'a461b77448520951f004b4e1a42780f190e4e78e4902ecde9babd0944901052d', NULL, 3, 673);
INSERT INTO public.refresh_tokens VALUES (630, '2026-11-07 10:19:37.617054', '2026-11-14 10:19:37.617054', '2026-11-07 10:34:37.639902', '2a198e79a86342b22fbefd446445ac838ea9144575ff644cd07840a0c3a5fa3f', NULL, 3, 674);
INSERT INTO public.refresh_tokens VALUES (631, '2026-11-07 10:20:13.997325', '2026-11-14 10:20:13.997325', '2026-11-07 10:35:15.373761', '7f3ab69e81ff33356f573480e258fcf559c1eade3d8ee36426a10ba0a7e4c44c', 2, NULL, 675);
INSERT INTO public.refresh_tokens VALUES (729, '2026-11-09 02:09:48.528001', '2026-11-16 02:09:48.528001', '2026-11-09 02:24:48.499319', 'bfd29ca1568b255c75816e4cac8a9a41a43dc6f1de3cf5d4fb23049c11a037c8', NULL, 2, 676);
INSERT INTO public.refresh_tokens VALUES (731, '2026-11-09 02:24:48.530181', '2026-11-16 02:24:48.530181', '2026-11-09 02:39:48.499943', '41e15ff465f08e161398b388e6c709d32a1b8dbd657e998d3bed60b2bf3724d8', NULL, 2, 677);
INSERT INTO public.refresh_tokens VALUES (645, '2026-11-07 11:13:50.711919', '2026-12-07 11:13:50.710886', NULL, '0ad0a05c870aff41239eeef007a7646b7633a3cd1e338960891380187bc33ee4', NULL, 1, 678);
INSERT INTO public.refresh_tokens VALUES (656, '2026-11-08 19:34:12.165045', '2026-12-08 19:34:12.165045', '2026-11-08 19:48:49.914241', 'cc084c6a37b264f45121f9c4583f8b3c2ab22b30b1964e014e4e987d3f4a33fd', 2, NULL, 679);
INSERT INTO public.refresh_tokens VALUES (741, '2026-11-10 06:40:36.206235', '2026-11-17 06:40:36.206235', '2026-11-10 06:56:14.030641', '4ba6d3d741cb76f6d5fe426a13f9368595f2ad73f1b9dfc815832fca853ff3eb', 2, NULL, 680);
INSERT INTO public.refresh_tokens VALUES (675, '2026-11-08 19:52:07.851182', '2026-11-15 19:52:07.851182', '2026-11-08 20:08:00.532693', '1eb4d6e41491f63c4a678cc5b715b821803264314cb3c3165205fb97d3828517', 2, NULL, 681);
INSERT INTO public.refresh_tokens VALUES (680, '2026-11-08 19:58:54.544361', '2026-11-15 19:58:54.544361', '2026-11-08 20:22:07.067039', '9a1c84b4aec117ab175045928ccf4cdc3f2fd7ecc1bbebb28ca8555ec866b97f', NULL, 2, 682);
INSERT INTO public.refresh_tokens VALUES (689, '2026-11-08 20:34:19.904277', '2026-11-15 20:34:19.904277', '2026-11-08 20:38:09.642449', '19f855528e8b11efd4a4898d37fc903fae3f52712d5619a218ebef62d631462e', NULL, 2, 683);
INSERT INTO public.refresh_tokens VALUES (694, '2026-11-08 20:39:46.397591', '2026-12-08 20:39:46.397591', '2026-11-08 20:54:47.219455', '87e9b6e8afe71b5e00360e7291b7c3e54cf51a77ed0b6365d1da80420763207d', 1, NULL, 684);
INSERT INTO public.refresh_tokens VALUES (757, '2026-11-12 03:25:20.671479', '2026-11-19 03:25:20.671479', '2026-11-12 03:25:29.831979', '75c3bcb53d70eaa57dff39b8f4ac392ae4184cbc68e9eeb00c297c25e5e5ba1a', 1, NULL, 685);
INSERT INTO public.refresh_tokens VALUES (758, '2026-11-12 03:25:29.831979', '2026-11-19 03:25:29.831979', '2026-11-12 03:25:41.719192', 'fd249d07adb49414c0e5b861f2003272d84dc7f76446a909db1bc15bb5aadc1d', 1, NULL, 686);
INSERT INTO public.refresh_tokens VALUES (759, '2026-11-12 03:25:41.72606', '2026-11-19 03:25:41.72606', '2026-11-12 03:45:04.713996', 'fcd377acdb4cbbb7b5584bf86ff9a75cb85406732ab39da802ad594fa8956655', 1, NULL, 687);
INSERT INTO public.refresh_tokens VALUES (525, '2026-11-07 08:08:38.104817', '2026-11-14 08:08:38.104817', '2026-11-07 08:24:15.382701', 'c1e8c42b8b2619717b61090c83daa68458a87498fccba9c3dfc3ff3d06317387', 2, NULL, 688);
INSERT INTO public.refresh_tokens VALUES (532, '2026-11-07 08:25:37.345196', '2026-11-14 08:25:37.345196', '2026-11-07 08:25:48.341067', '031b228f027ec14e084f7a01e85b89cc45c1da3b101d8d76b5744b6c2838447e', 2, NULL, 689);
INSERT INTO public.refresh_tokens VALUES (536, '2026-11-07 08:33:49.174085', '2026-11-14 08:33:49.174085', NULL, 'd3866a603e1c0edfaa81698c65f336fd6c4d5207c099400cec70ee47c376471c', NULL, 6, 690);
INSERT INTO public.refresh_tokens VALUES (541, '2026-11-07 08:43:19.223912', '2026-11-14 08:43:19.223912', '2026-11-07 08:58:19.266369', 'd7410b7321237e0fd763270286b0588e75fe6ee9238e2366adfdbd096155cd2c', NULL, 2, 691);
INSERT INTO public.refresh_tokens VALUES (533, '2026-11-07 08:25:48.342069', '2026-11-14 08:25:48.341067', '2026-11-07 08:40:50.003781', '40abc1769203115142268448e609ee4d5ef56344b9121fb1bba56ecd0fd00437', 2, NULL, 692);
INSERT INTO public.refresh_tokens VALUES (534, '2026-11-07 08:28:19.397993', '2026-11-14 08:28:19.397993', '2026-11-07 08:43:19.161807', '31d0524d259bd0f6d96f9e72b35f944ff069660d13674a143613a44d03d33ab4', NULL, 2, 693);
INSERT INTO public.refresh_tokens VALUES (538, '2026-11-07 08:35:20.136504', '2026-11-14 08:35:20.136504', '2026-11-07 08:46:34.022169', '3a672e9332024aa4eca1c40e26b3a92535e7046ff7a3f98f44b3c236428198ed', NULL, 2, 694);
INSERT INTO public.refresh_tokens VALUES (543, '2026-11-07 08:46:34.078241', '2026-11-14 08:46:34.078241', '2026-11-07 08:47:20.129952', 'cfe5a8b96beeafbe6c333c8d2c50ff278316a93a2328f55098f12673f811da2c', NULL, 2, 695);
INSERT INTO public.refresh_tokens VALUES (544, '2026-11-07 08:47:20.168576', '2026-11-14 08:47:20.168576', '2026-11-07 08:47:35.1177', '817721386b0e80e6240af1f0be0c9ace116186f75cd60c819a77b8af53ecc486', NULL, 2, 696);
INSERT INTO public.refresh_tokens VALUES (545, '2026-11-07 08:47:35.172293', '2026-11-14 08:47:35.172293', '2026-11-07 08:48:20.220574', 'd47d0ac3fd7109436584ec9aa1468ac483fd429a019a81a6a639daee329476f7', NULL, 2, 697);
INSERT INTO public.refresh_tokens VALUES (546, '2026-11-07 08:48:20.267771', '2026-11-14 08:48:20.267771', '2026-11-07 08:48:35.105741', 'ed8f400d4b4e8ab48f8d6ae282bd59f4fcaa0b189af70f251cbd33f176245a78', NULL, 2, 698);
INSERT INTO public.refresh_tokens VALUES (547, '2026-11-07 08:48:35.157439', '2026-11-14 08:48:35.157439', '2026-11-07 08:49:20.215682', 'f3e3dc75434556c7a86553aea5d65c7f6a9ca78cf3bea5cabdb475e639d93d42', NULL, 2, 699);
INSERT INTO public.refresh_tokens VALUES (537, '2026-11-07 08:34:16.629933', '2026-11-14 08:34:16.629933', '2026-11-07 08:50:11.782802', '96544d0e5734ce6c957536e7526bc3fbaf7b4c35a7c9d63ca7c62d900d7e849b', NULL, 11, 700);
INSERT INTO public.refresh_tokens VALUES (548, '2026-11-07 08:49:20.268372', '2026-11-14 08:49:20.268372', '2026-11-07 08:50:21.099212', '9e22302ef36ae32a63195bd2cb88664d50482b1c493b14e6445fb4e6ab6c1ce6', NULL, 2, 701);
INSERT INTO public.refresh_tokens VALUES (550, '2026-11-07 08:50:21.179047', '2026-11-14 08:50:21.179047', '2026-11-07 08:51:20.214863', 'de18b1fb9268ab480fc587d400de3521676a4d1c525c3e43a9a918716b31eeab', NULL, 2, 702);
INSERT INTO public.refresh_tokens VALUES (551, '2026-11-07 08:51:20.265689', '2026-11-14 08:51:20.265689', '2026-11-07 08:52:20.654444', 'e1fec4e5f202736f0cda6e74743e79867784583feb78662aafecd038eac00728', NULL, 2, 703);
INSERT INTO public.refresh_tokens VALUES (549, '2026-11-07 08:50:11.858655', '2026-11-14 08:50:11.858655', '2026-11-07 08:53:04.786653', 'a2d89c6d0055703e158ef7e976c3016825be5ad719db1d8d9ecd4429ccd3913c', NULL, 11, 704);
INSERT INTO public.refresh_tokens VALUES (552, '2026-11-07 08:52:20.723528', '2026-11-14 08:52:20.723528', '2026-11-07 08:53:20.642495', '48e187384e5de09f76aba03bea1992962827578970ce86ac35d6978a0daab97e', NULL, 2, 705);
INSERT INTO public.refresh_tokens VALUES (540, '2026-11-07 08:40:50.004781', '2026-11-14 08:40:50.004781', '2026-11-07 08:53:30.636551', 'da478b61b97082d52aec4d2ebe18efeb71d28314343ee731bb5faad9d4ae036a', 2, NULL, 706);
INSERT INTO public.refresh_tokens VALUES (554, '2026-11-07 08:53:20.694819', '2026-11-14 08:53:20.694819', '2026-11-07 08:54:20.158128', '4c0abcae6995b2dc4f193e7be1b98d5884069720dd3ce3b55d0616b9d83a890c', NULL, 2, 707);
INSERT INTO public.refresh_tokens VALUES (556, '2026-11-07 08:54:20.192715', '2026-11-14 08:54:20.192715', '2026-11-07 08:55:20.133261', '57d1f36cdecfcf07d8af88c62534c2603ec1d0dc8bbe205bf794fa1e39672a69', NULL, 2, 708);
INSERT INTO public.refresh_tokens VALUES (557, '2026-11-07 08:55:20.189731', '2026-11-14 08:55:20.189731', '2026-11-07 08:55:35.238087', 'cdb839b4db9f88eaf0ddbb9f5757dadf5123195a582578aa064fed67ca85d802', NULL, 2, 709);
INSERT INTO public.refresh_tokens VALUES (555, '2026-11-07 08:53:30.637434', '2026-11-14 08:53:30.637434', '2026-11-07 08:56:06.151588', 'dd2ad94506e9b1d40885f91807851f4924d9b19621d31782216ce53899c538fc', 2, NULL, 710);
INSERT INTO public.refresh_tokens VALUES (558, '2026-11-07 08:55:35.287491', '2026-11-14 08:55:35.287491', '2026-11-07 08:56:20.217961', 'add8219b268ac5071b47cedc9e4049991a7f7323bcbbb40a258ea95d0debc8da', NULL, 2, 711);
INSERT INTO public.refresh_tokens VALUES (560, '2026-11-07 08:56:20.264472', '2026-11-14 08:56:20.264472', '2026-11-07 08:57:20.761255', '7829a1852ae388e2a238761b2f8b16df21ba3c39cf8f47057df8e841f86a4629', NULL, 2, 712);
INSERT INTO public.refresh_tokens VALUES (561, '2026-11-07 08:57:20.815896', '2026-11-14 08:57:20.815896', '2026-11-07 08:58:20.707259', '2d20c75622838416bda9001102240ad0b7ab80acf044d4145b5ac1a6e7145507', NULL, 2, 713);
INSERT INTO public.refresh_tokens VALUES (563, '2026-11-07 08:58:20.755344', '2026-11-14 08:58:20.755344', '2026-11-07 08:58:57.93289', '79e7d7d4c20bd542e7938b279fe474195c70c08336c16f6b7c09835a963f85f4', NULL, 2, 714);
INSERT INTO public.refresh_tokens VALUES (565, '2026-11-07 08:59:18.68409', '2026-11-14 08:59:18.68409', NULL, '529b37c578ea346ab5cc378e5e48bca04e3deeef72c1a933c05e85c11a15c685', NULL, 3, 715);
INSERT INTO public.refresh_tokens VALUES (539, '2026-11-07 08:39:49.349125', '2026-12-07 08:39:49.349125', '2026-11-07 08:59:18.649445', '98211f590b87230c1cec60c7fffcd078f0a7e1cd8847f6ed7890e0609c620745', NULL, 3, 716);
INSERT INTO public.refresh_tokens VALUES (564, '2026-11-07 08:58:57.968771', '2026-11-14 08:58:57.968771', '2026-11-07 08:59:20.100852', '46a0b77ad168496148f327f9ade5dc03f3eba44b822ebd0ec9cfce4caa11800f', NULL, 2, 717);
INSERT INTO public.refresh_tokens VALUES (553, '2026-11-07 08:53:04.951063', '2026-11-14 08:53:04.951063', '2026-11-07 08:59:26.998602', '232b800fea34089cdeb0e79f1abb051935ebc11df1b609b4da177b6a0569a49f', NULL, 11, 718);
INSERT INTO public.refresh_tokens VALUES (566, '2026-11-07 08:59:20.153175', '2026-11-14 08:59:20.153175', '2026-11-07 08:59:35.111428', 'fdc21872daa8d776341754967112aa48f9e21359d492e10930680f438f812989', NULL, 2, 719);
INSERT INTO public.refresh_tokens VALUES (568, '2026-11-07 08:59:35.159925', '2026-11-14 08:59:35.159925', '2026-11-07 09:00:20.152079', '009a26139f87e699f15b273c4fa8ce720290636cbe4153aa680056543a7080ff', NULL, 2, 720);
INSERT INTO public.refresh_tokens VALUES (569, '2026-11-07 09:00:20.196267', '2026-11-14 09:00:20.196267', '2026-11-07 09:00:35.097068', 'b2f20a10f5c883fd20cc03bf02e8a0789c63fb2eece6b61bef9582f92b54f271', NULL, 2, 721);
INSERT INTO public.refresh_tokens VALUES (570, '2026-11-07 09:00:35.146695', '2026-11-14 09:00:35.146695', '2026-11-07 09:01:20.121236', 'b1b3987b59072b9a1453d19d61213398d1aa113158cb6ebb0485a5cb05cafef0', NULL, 2, 722);
INSERT INTO public.refresh_tokens VALUES (571, '2026-11-07 09:01:20.181411', '2026-11-14 09:01:20.181411', '2026-11-07 09:02:16.142062', '387423360f4e62e5b506c75dfe4731047349275f4ff12aaa01866a79192504bd', NULL, 2, 723);
INSERT INTO public.refresh_tokens VALUES (572, '2026-11-07 09:02:16.189848', '2026-11-14 09:02:16.189848', '2026-11-07 09:02:20.101719', 'd88060743943286980b08ee3fc770038b33772e8e431087527da913aab2ade13', NULL, 2, 724);
INSERT INTO public.refresh_tokens VALUES (573, '2026-11-07 09:02:20.150785', '2026-11-14 09:02:20.150785', '2026-11-07 09:02:34.54888', '7bbe05c4598b762756ca23f1c3675c8ad96294ca488764bfb37ae54966fce9a1', NULL, 2, 725);
INSERT INTO public.refresh_tokens VALUES (574, '2026-11-07 09:02:34.597646', '2026-11-14 09:02:34.597646', '2026-11-07 09:03:20.104705', 'a75aa4978c92c4541362a627772903e9ee9231c4b8d98ad76d27cf6348fee569', NULL, 2, 726);
INSERT INTO public.refresh_tokens VALUES (575, '2026-11-07 09:03:20.15434', '2026-11-14 09:03:20.15434', '2026-11-07 09:03:35.155231', '76d1b62b1344ab52dd505451441829ee95e15fa52d5c9dd5788738b02a2aa40a', NULL, 2, 727);
INSERT INTO public.refresh_tokens VALUES (576, '2026-11-07 09:03:35.20546', '2026-11-14 09:03:35.20546', '2026-11-07 09:04:20.615997', '37d5ffda4292b1daf996917e5daeebc6eb9cb987964943f3853cb4488cd87d64', NULL, 2, 728);
INSERT INTO public.refresh_tokens VALUES (577, '2026-11-07 09:04:20.668395', '2026-11-14 09:04:20.668395', '2026-11-07 09:05:20.634145', 'cfbdfa2d1c95f19c3826ed1daa9ce4c78ebc56efae527da6fedcb5ce03b03b85', NULL, 2, 729);
INSERT INTO public.refresh_tokens VALUES (578, '2026-11-07 09:05:20.689067', '2026-11-14 09:05:20.689067', '2026-11-07 09:06:20.139788', 'd4b265c6f11e9a5b99f64a3123923e2aa607b9cc7cd19a92dd3155ce7d6b44d7', NULL, 2, 730);
INSERT INTO public.refresh_tokens VALUES (579, '2026-11-07 09:06:20.187777', '2026-11-14 09:06:20.187777', '2026-11-07 09:06:34.546751', 'a4cd0b43594dc5bf85f527bee31eb31fea544ec18e6d971f756fe73069b73b29', NULL, 2, 731);
INSERT INTO public.refresh_tokens VALUES (580, '2026-11-07 09:06:34.595836', '2026-11-14 09:06:34.595836', '2026-11-07 09:07:20.084928', 'f5960eb0d8ae7d0fb828c7d6d71252c2716a66963650578ffcef5ce2aed406a1', NULL, 2, 732);
INSERT INTO public.refresh_tokens VALUES (581, '2026-11-07 09:07:20.136353', '2026-11-14 09:07:20.136353', '2026-11-07 09:07:34.485152', '6897b421e69dc7fdbb1b1493ebd3cc452d81308b691e370865e3b3db0d81abb5', NULL, 2, 733);
INSERT INTO public.refresh_tokens VALUES (582, '2026-11-07 09:07:34.518231', '2026-11-14 09:07:34.518231', '2026-11-07 09:08:20.034879', '5d7461de8a4c6a2b873b336e3218246c71a34aef250674e2a471bf97af066950', NULL, 2, 734);
INSERT INTO public.refresh_tokens VALUES (583, '2026-11-07 09:08:20.064729', '2026-11-14 09:08:20.064729', '2026-11-07 09:08:35.028462', 'f32af5fa5e0543c30423cbba574b8f3f98e0c34c228dd5663f1f3db8de598bc4', NULL, 2, 735);
INSERT INTO public.refresh_tokens VALUES (542, '2026-11-07 08:46:11.800558', '2026-11-14 08:46:11.800558', '2026-11-07 09:09:04.156514', '68dece9199e5b74b90b8fb1d45ac6c451c6e7fa89d1877981090bf78a87d3174', 2, NULL, 736);
INSERT INTO public.refresh_tokens VALUES (584, '2026-11-07 09:08:35.060456', '2026-11-14 09:08:35.060456', '2026-11-07 09:09:20.043761', 'c16f374ab48fab69f7fc9cf82e61054d7fb2826e395f7f32596fcbae0ae43af2', NULL, 2, 737);
INSERT INTO public.refresh_tokens VALUES (586, '2026-11-07 09:09:20.075265', '2026-11-14 09:09:20.075265', '2026-11-07 09:09:35.127933', '534964568a319e57a3659a63db0934325ecc0a9e59e945cbd97bbafacd729070', NULL, 2, 738);
INSERT INTO public.refresh_tokens VALUES (588, '2026-11-07 09:10:20.135306', '2026-11-14 09:10:20.135306', '2026-11-07 09:10:32.251042', 'ced6330c210f7e7894e3ce34e822edecf39e62d575f767054489dac4627411df', NULL, 2, 739);
INSERT INTO public.refresh_tokens VALUES (585, '2026-11-07 09:09:04.156514', '2026-11-14 09:09:04.156514', '2026-11-07 09:13:03.864397', '8a3ab0d4fff6f9fbc67ffc5a3f8c8f6904dfd00a182c0b8b4ea7a063fb928acd', 2, NULL, 740);
INSERT INTO public.refresh_tokens VALUES (562, '2026-11-07 08:58:19.352617', '2026-11-14 08:58:19.352617', '2026-11-07 09:13:19.264299', 'e3c51639104cc159628b499d011cf5d78fbc7b0e4db0a30002b61c5606e25e07', NULL, 2, 741);
INSERT INTO public.refresh_tokens VALUES (567, '2026-11-07 08:59:27.111773', '2026-11-14 08:59:27.111773', '2026-11-07 09:13:21.311742', 'd87b1fdf8d5144418bf02ad69553bc9fac6a29726153b96fee202b2c95bbe26e', NULL, 11, 742);
INSERT INTO public.refresh_tokens VALUES (559, '2026-11-07 08:56:06.151588', '2026-11-14 08:56:06.151588', '2026-11-07 09:13:30.170592', '3d02f1be96b95303564821d9e31fbb0218d43779bc79a351a6499c4594863ab3', 2, NULL, 743);
INSERT INTO public.refresh_tokens VALUES (587, '2026-11-07 09:09:35.179526', '2026-11-14 09:09:35.179526', '2026-11-07 09:10:20.085084', '57d64af6e9def73e99ad4f566c45d3772c0b0c6eb1ced9f41c06c74b9bb9ec09', NULL, 2, 744);
INSERT INTO public.refresh_tokens VALUES (589, '2026-11-07 09:10:32.29149', '2026-11-14 09:10:32.29149', '2026-11-07 09:10:34.541629', '4d97c35791d52421cb9d1a1d5ede5bd74fc685d06dc2d458bd39bdf70f90ab18', NULL, 2, 745);
INSERT INTO public.refresh_tokens VALUES (590, '2026-11-07 09:10:34.591184', '2026-11-14 09:10:34.591184', '2026-11-07 09:26:19.983748', '3550bc9875d3afa67bb80bdaa68e765b1d8d6b2afccdb6a03d6585bd3c622e88', NULL, 2, 746);
INSERT INTO public.refresh_tokens VALUES (594, '2026-11-07 09:13:30.170592', '2026-11-14 09:13:30.170592', '2026-11-07 09:28:30.618982', '601772393c2c18da3d8d5d1a4a7b1a8ced02a2d584b883fd053865d76c515c6c', 2, NULL, 747);
INSERT INTO public.refresh_tokens VALUES (592, '2026-11-07 09:13:19.367998', '2026-11-14 09:13:19.367998', '2026-11-07 09:29:18.178064', '27deccf6b3185b5cc7f7f597144f260021bd663440736040d97bacf0a0b1a320', NULL, 2, 748);
INSERT INTO public.refresh_tokens VALUES (595, '2026-11-07 09:15:04.067893', '2026-12-07 09:15:04.067893', '2026-11-07 09:30:11.806253', '56423d1cebcfdfae64906b296bd33a67e835cf375c19503adb9a7b714a965c2c', NULL, 1, 749);
INSERT INTO public.refresh_tokens VALUES (593, '2026-11-07 09:13:22.154704', '2026-11-14 09:13:22.154704', '2026-11-07 09:14:48.693308', '103e9ecd82418a810f77b05571ac4e3029429ec36c25856d706eec4ad5ece6dd', NULL, 11, 750);
INSERT INTO public.refresh_tokens VALUES (599, '2026-11-07 09:18:05.890497', '2026-11-14 09:18:05.890497', '2026-11-07 09:33:11.874035', '604a016433a469f372331dd639669433e11934cc1eac3caec968722969099e25', 2, NULL, 751);
INSERT INTO public.refresh_tokens VALUES (618, '2026-11-07 09:49:36.83063', '2026-12-07 09:49:36.83063', '2026-11-07 10:04:37.561644', '7cd4fb51d45e8dcab6add1c47ed94b8ef72143d0eef3161503e4d3ae066e2fe5', NULL, 3, 752);
INSERT INTO public.refresh_tokens VALUES (633, '2026-11-07 10:26:19.993684', '2026-11-14 10:26:19.993684', '2026-11-08 19:09:56.562746', '27ee7135012092f8ebd45fdbc7a1c7991646762acbdc49fb70e524cc41478ec6', NULL, 2, 753);
INSERT INTO public.refresh_tokens VALUES (647, '2026-11-07 11:24:15.33371', '2026-11-14 11:24:15.33371', '2026-11-08 19:33:58.094184', 'df40a4bf3ca87c028e3ca1bff34b8f3c94d8d6d4a521659d9c5099be3905e2c2', 2, NULL, 754);
INSERT INTO public.refresh_tokens VALUES (657, '2026-11-08 19:34:13.35362', '2026-11-15 19:34:13.35362', '2026-11-08 19:34:18.843092', '42abcf55d9962752a8874ed04144ded2490ba884e1c8e74b1431969b9025dda3', 1, NULL, 755);
INSERT INTO public.refresh_tokens VALUES (646, '2026-11-07 11:19:37.600729', '2026-11-14 11:19:37.600729', '2026-11-08 19:41:11.159033', '57eb0b1fd8bb804f5a7d37a437d71f35caa09a6ead4d3b22ff9cc38f6c8b8858', NULL, 3, 756);
INSERT INTO public.refresh_tokens VALUES (667, '2026-11-08 19:47:51.616591', '2026-12-08 19:47:51.616591', '2026-11-08 19:48:11.222531', 'bdf16cf1095a344f38694a9468090839963f933c87e6a311d1a898b34572de2c', 2, NULL, 757);
INSERT INTO public.refresh_tokens VALUES (674, '2026-11-08 19:52:06.444233', '2026-12-08 19:52:06.444233', '2026-11-08 19:53:52.167925', 'b840ade4088f3099ae85cbcf22997ba4150e81672c84c37ca7125f6fab003359', 1, NULL, 758);
INSERT INTO public.refresh_tokens VALUES (591, '2026-11-07 09:13:03.864397', '2026-11-14 09:13:03.864397', '2026-11-07 09:16:10.399658', 'a04747fecb5a150eda2dc6efc0aa1e76c4dc81b4e316d91e2cd70e31f8c62b9b', 2, NULL, 759);
INSERT INTO public.refresh_tokens VALUES (596, '2026-11-07 09:16:10.400657', '2026-11-14 09:16:10.400657', '2026-11-07 09:16:54.071628', 'ffa19ff0cb287a372681099bc1b6f959110511a8b7ae6b75873167318274186a', 2, NULL, 760);
INSERT INTO public.refresh_tokens VALUES (676, '2026-11-08 19:54:00.322047', '2026-12-08 19:54:00.322047', '2026-11-08 19:55:08.65604', '565ac23a4236594d8e7dcd7f22bfe6f482fbb41b8aba0670633dd09ef42e4bf3', 2, NULL, 761);
INSERT INTO public.refresh_tokens VALUES (679, '2026-11-08 19:57:19.793564', '2026-12-08 19:57:19.793564', '2026-11-08 19:59:48.205231', 'a6ae8aaa273ebddf833073b0d6715869d02f70346d5d24c6aa61b5881fdfbdeb', NULL, 2, 762);
INSERT INTO public.refresh_tokens VALUES (597, '2026-11-07 09:16:54.072651', '2026-11-14 09:16:54.072651', '2026-11-07 09:17:40.355537', 'f477955047b6191cee0299ef1546e3bb3b126cb871a83d8efad839ae6862f7a8', 2, NULL, 763);
INSERT INTO public.refresh_tokens VALUES (681, '2026-11-08 19:59:52.683764', '2026-12-08 19:59:52.683764', '2026-11-08 20:00:03.717447', '005e9c3d882418f9ea4cd3e1fb0fff07dda6f301126816f7732302cbf939df7e', NULL, 2, 764);
INSERT INTO public.refresh_tokens VALUES (730, '2026-11-09 02:23:16.444711', '2026-11-16 02:23:16.444711', '2026-11-09 02:35:58.246838', 'df6ceffd70d399691f07d08f591584d67ee54a06d3a57325ae22ca6aca512da9', NULL, 13, 765);
INSERT INTO public.refresh_tokens VALUES (734, '2026-11-09 02:47:15.415027', '2026-12-09 02:47:15.415027', '2026-11-09 02:51:00.950492', '8788379dfb8f7d5a3379ab2fef5ef74de8c79022b9ce3f799e9f1571988ef611', NULL, 13, 766);
INSERT INTO public.refresh_tokens VALUES (598, '2026-11-07 09:17:40.355537', '2026-11-14 09:17:40.355537', '2026-11-07 09:18:05.890497', 'c39f878e58665e4eaf91e4e0bdaa5028d113fa19bbc0d052934ffa955b930907', 2, NULL, 767);
INSERT INTO public.refresh_tokens VALUES (736, '2026-11-09 02:53:21.107334', '2026-12-09 02:53:21.107334', '2026-11-09 03:09:15.397863', '5de52cd5be7b8eba7e4f037a5c401297b9ea181c83d4273758048462113397a7', 2, NULL, 768);
INSERT INTO public.refresh_tokens VALUES (742, '2026-11-10 06:56:14.031639', '2026-11-17 06:56:14.031639', '2026-11-10 07:05:13.877475', '9ecdddca8edcfd2adfac200c1d5f1594dfd96b715e13289a7f668021beaafbfe', 2, NULL, 769);
INSERT INTO public.refresh_tokens VALUES (743, '2026-11-10 07:05:19.61319', '2026-12-10 07:05:19.61319', '2026-11-10 07:06:03.031158', 'a02527a1638cbf252ba8dca1dc432891d2bc9330d77c6c64822af45c96e283e0', 1, NULL, 770);
INSERT INTO public.refresh_tokens VALUES (760, '2026-11-12 03:26:14.397257', '2026-11-19 03:26:14.397257', '2026-11-12 03:41:14.474011', '924cf1fc4175c2b245653f373905e6618f66d8061629359aadfb3d2b673bdd9e', NULL, 2, 771);
INSERT INTO public.refresh_tokens VALUES (769, '2026-11-12 04:40:29.06539', '2026-12-12 04:40:29.06539', '2026-11-12 05:48:49.203923', '12f2013f9c572db177eaa9b890712c66f8379bc4aa17ad0f31b010fccae8b171', 1, NULL, 347);
INSERT INTO public.refresh_tokens VALUES (772, '2026-11-12 05:14:14.406537', '2026-11-19 05:14:14.406537', '2026-11-12 05:48:50.618413', '7432966df8dbb488ddc87048ee53472be7cd4da2ed902bbc52fd180666c93326', NULL, 2, 505);
INSERT INTO public.refresh_tokens VALUES (774, '2026-11-12 05:48:50.655451', '2026-11-19 05:48:50.655451', '2026-11-12 05:48:51.887165', 'bce83437ad9275c3547b8f1e551c4d70b22e17ced6fef976d028c1b56c73b802', NULL, 2, 773);
INSERT INTO public.refresh_tokens VALUES (773, '2026-11-12 05:48:49.203923', '2026-11-19 05:48:49.203923', '2026-11-12 05:48:52.432817', 'b2e741a29965e4cbddafaf2ad5db243cea1c64fcbad3002b1099bbe165625769', 1, NULL, 772);
INSERT INTO public.refresh_tokens VALUES (775, '2026-11-12 05:48:51.924144', '2026-11-19 05:48:51.924144', '2026-11-12 05:49:16.021144', '6c5a8617083d10d738cf8a91ca0b7002e0d5b47b611eb534718afcbdaabe581a', NULL, 2, 774);
INSERT INTO public.refresh_tokens VALUES (776, '2026-11-12 05:49:06.654747', '2026-12-12 05:49:06.654747', '2026-11-12 06:04:07.451537', '45d811b7f54203edf9609fa0883982b98f02c66a2046d8817048a48c353d3063', 1, NULL, 775);
INSERT INTO public.refresh_tokens VALUES (777, '2026-11-12 05:49:16.118223', '2026-11-19 05:49:16.118223', '2026-11-12 06:05:14.375854', '47dfa382efa687ecd8d1e0fa3bd64386d1d11266ed0ed1a235e16f03717206f4', NULL, 2, 776);
INSERT INTO public.refresh_tokens VALUES (778, '2026-11-12 05:58:39.088451', '2026-12-12 05:58:39.088451', '2026-11-12 06:13:39.742023', 'd4088341df173b8f38f192289667e08157930091bc3c74efa9cf63a94598b86b', NULL, 7, 777);
INSERT INTO public.refresh_tokens VALUES (782, '2026-11-12 06:14:00.603983', '2026-11-19 06:14:00.603983', NULL, '9a921f32c0e7bd2a586ac8cd2d3e2dfa2c801206f5f10b8fe62f1191f2040e5e', NULL, 2, 781);
INSERT INTO public.refresh_tokens VALUES (780, '2026-11-12 06:05:14.407718', '2026-11-19 06:05:14.407718', '2026-11-12 06:14:00.548641', '7e675148c88b8e02fc31ef54c2a05298dc9b51d1a7b24fb0f7ac6a8635fd0693', NULL, 2, 779);
INSERT INTO public.refresh_tokens VALUES (779, '2026-11-12 06:04:07.451537', '2026-11-19 06:04:07.451537', '2026-11-12 06:19:14.46975', 'b5e4a6ded97c135aa68a28db145068e3c81d5f30dc08ea515aa5c2c1081b9a43', 1, NULL, 778);
INSERT INTO public.refresh_tokens VALUES (781, '2026-11-12 06:13:39.77454', '2026-11-19 06:13:39.77454', '2026-11-12 06:28:50.278854', '1344c9ebebeb8e40eabc6ad0f6929d98437e6cfbf5fdc13820b4e746345745e7', NULL, 7, 780);
INSERT INTO public.refresh_tokens VALUES (783, '2026-11-12 06:19:14.470281', '2026-11-19 06:19:14.470281', '2026-11-12 06:35:10.370722', '1905329a6c43def760b25020623c6e23392dcdadc9ffdcda03452077c02983c4', 1, NULL, 782);
INSERT INTO public.refresh_tokens VALUES (786, '2026-11-12 06:44:47.642365', '2026-11-19 06:44:47.642365', NULL, 'd1ac61afb2abaf12c7e57d3858fdbb348f4bd801f226037a95b653b812dcb90d', NULL, 7, 785);
INSERT INTO public.refresh_tokens VALUES (784, '2026-11-12 06:28:50.369065', '2026-11-19 06:28:50.369065', '2026-11-12 06:44:47.602881', 'fbf91c158b45fb02c2e927422826eee62313cb421ee5be184dee19d975a8353a', NULL, 7, 783);
INSERT INTO public.refresh_tokens VALUES (787, '2026-11-12 06:50:14.465598', '2026-11-19 06:50:14.465598', NULL, '9c37526e849484868d13bef2c38a21418aea40627311cb4cfaf4ad583a4ab021', 1, NULL, 786);
INSERT INTO public.refresh_tokens VALUES (785, '2026-11-12 06:35:10.370722', '2026-11-19 06:35:10.370722', '2026-11-12 06:50:14.465598', '44af1a05ab7faab839dfdc85ec1a37d476671b0dcec3d5a0080eeddd4de5c2ff', 1, NULL, 784);


--
-- Data for Name: staff_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.staff_roles VALUES (1, 'ADMIN', '2026-10-31 11:06:24.331', 'Quản trị viên toàn quyền hệ thống SoundWave', 'Administrator', 1);
INSERT INTO public.staff_roles VALUES (2, 'STAFF', '2026-10-31 11:06:24.331', 'Nhân viên vận hành và kiểm duyệt nội dung SoundWave', 'Staff', 2);


--
-- Data for Name: staffs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.staffs VALUES (1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', '2026-10-31 11:06:24.331', 'admin@soundwave.com', 'System Administrator', '2026-11-12 04:40:29.06539', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-11-12 04:40:29.107453', 1, 2);
INSERT INTO public.staffs VALUES (6, NULL, '2026-11-08 19:36:18.157954', 'dotranthienphuc230@gmail.com', 'ABC', NULL, '$2a$10$Nc7SA801TxKmIDQy7mGQv.VdMPKEAl7SpJH1YG3PEr6VugKGOZktK', 'ACTIVE', '2026-11-08 19:36:18.157954', 2, 3);
INSERT INTO public.staffs VALUES (5, NULL, '2026-11-05 03:41:58.776564', 'haotntce200338@gmail.com', 'Trần Nguyễn Thanh Hào', '2026-11-07 06:36:03.473127', '$2a$10$IyiUPJK2robgc/eCVgvVEeijbRdevUO2DDVXoZD6kIcHUD9BDUU6q', 'INACTIVE', '2026-11-08 19:38:37.724188', 2, 4);
INSERT INTO public.staffs VALUES (2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', '2026-10-31 11:06:24.331', 'staff@soundwave.com', 'Content Moderator', '2026-11-12 05:49:06.647789', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-11-12 05:49:06.802857', 2, 1);


--
-- Data for Name: track_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.track_submissions VALUES (1, NULL, '2026-10-31 11:06:24.331+00', NULL, 2, 'APPROVED', '2026-10-31 11:06:24.331+00', 1, NULL, 1, NULL, NULL, 1);
INSERT INTO public.track_submissions VALUES (2, NULL, '2026-10-31 11:06:24.331+00', NULL, 2, 'APPROVED', '2026-10-31 11:06:24.331+00', 2, NULL, 2, NULL, NULL, 2);
INSERT INTO public.track_submissions VALUES (3, NULL, '2026-10-31 11:06:24.331+00', NULL, 2, 'APPROVED', '2026-10-31 11:06:24.331+00', 3, NULL, 3, NULL, NULL, 3);
INSERT INTO public.track_submissions VALUES (5, NULL, '2026-10-31 11:06:24.331+00', NULL, 2, 'APPROVED', '2026-10-31 11:06:24.331+00', 5, NULL, 5, NULL, NULL, 4);
INSERT INTO public.track_submissions VALUES (6, NULL, '2026-10-31 11:06:24.331+00', NULL, 2, 'APPROVED', '2026-10-31 11:06:24.331+00', 6, NULL, 6, NULL, NULL, 5);
INSERT INTO public.track_submissions VALUES (7, NULL, '2026-10-31 11:06:24.331+00', NULL, 2, 'APPROVED', '2026-10-31 11:06:24.331+00', 7, NULL, 7, NULL, NULL, 6);
INSERT INTO public.track_submissions VALUES (15, NULL, '2026-10-31 12:25:24.766251+00', NULL, 2, 'APPROVED', '2026-10-31 12:24:55.777023+00', 2, 'Album submission: Đại đi', 9, NULL, NULL, 7);
INSERT INTO public.track_submissions VALUES (16, 'Audio file corrupted or encoding does not meet platform standards.', '2026-10-31 12:26:40.771305+00', NULL, 2, 'REJECTED', '2026-10-31 12:24:55.820312+00', 2, 'Album submission: Đại đi', 10, NULL, NULL, 8);
INSERT INTO public.track_submissions VALUES (17, NULL, '2026-10-31 12:52:31.977709+00', NULL, 2, 'APPROVED', '2026-10-31 12:50:55.883148+00', 2, 'Album submission: Đại đại đi', 11, NULL, NULL, 9);
INSERT INTO public.track_submissions VALUES (20, NULL, '2026-10-31 13:53:38.616801+00', NULL, 2, 'APPROVED', '2026-10-31 13:53:05.923746+00', 2, NULL, 14, NULL, NULL, 10);
INSERT INTO public.track_submissions VALUES (19, NULL, '2026-10-31 14:05:07.87508+00', NULL, 2, 'APPROVED', '2026-10-31 13:52:52.823417+00', 2, NULL, 16, NULL, NULL, 11);
INSERT INTO public.track_submissions VALUES (22, NULL, '2026-10-31 14:52:40.646168+00', NULL, 2, 'APPROVED', '2026-10-31 14:51:59.274095+00', 3, 'Album submission: HTH', 17, NULL, NULL, 12);
INSERT INTO public.track_submissions VALUES (25, 'Unlicensed sample, beat, or suspected copyright infringement.', '2026-10-31 14:57:06.49059+00', NULL, 2, 'REJECTED', '2026-10-31 14:56:06.833209+00', 3, 'Album submission: XOAY VÒNG', 20, NULL, NULL, 13);
INSERT INTO public.track_submissions VALUES (23, 'Audio file corrupted or encoding does not meet platform standards.', '2026-10-31 14:57:47.699239+00', NULL, 2, 'REJECTED', '2026-10-31 14:51:59.317925+00', 3, 'Album submission: HTH', 18, NULL, NULL, 14);
INSERT INTO public.track_submissions VALUES (26, NULL, '2026-10-31 15:49:32.259661+00', NULL, 2, 'APPROVED', '2026-10-31 15:17:14.570238+00', 1, 'Published track updated by creator and queued for mandatory re-moderation.', 1, NULL, NULL, 15);
INSERT INTO public.track_submissions VALUES (27, NULL, '2026-10-31 15:53:59.381757+00', NULL, 2, 'APPROVED', '2026-10-31 15:52:33.559188+00', 1, NULL, 1, '[00:29.94] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
[00:34.67] Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương (ngọt ngào trong sương)
[00:40.13] Ngắm em thật lâu, con tim anh yếu mềm
[00:45.38] Đắm say từ phút đó, từng giây trôi yêu thêm
[00:50.42] Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh (bộn bề nơi anh)
[00:55.45] Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh (bầu trời trong xanh)
[01:01.06] Liếc đôi hàng mi mong manh, anh thẫn thờ
[01:06.20] Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ
[01:11.39] Cầm tay anh (anh), dựa vai anh (anh)
[01:14.10] Kề bên anh, nơi này có anh
[01:16.09] Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[01:20.45] (Yêu em, thương em, con tim anh chân thành)
[01:21.78] Cầm tay anh (anh), dựa vai anh (anh)
[01:24.53] Kề bên anh, nơi này có anh
[01:26.78] Khép đôi mi thật lâu
[01:28.25] Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
[01:31.71] Mùa xuân đến bình yên, cho anh những giấc mơ
[01:36.95] Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[01:42.56] Mùa thu lá vàng rơi, đông sang, anh nhớ em
[01:47.84] Tình yêu bé nhỏ xin dành tặng riêng em
(Yeah)
Còn đó tiếng nói ấy bên tai vấn vương bao ngày qua
Ánh mắt bối rối nhớ thương bao ngày qua
Yêu em anh thẫn thờ, con tim bâng khuâng đâu có ngờ
Chẳng bao giờ phải mong chờ, đợi ai trong chiều hoàng hôn mờ
Đắm chìm hòa vào vần thơ, ngắm nhìn khờ dại mộng mơ
Đừng bước vội vàng rồi làm ngơ, lạnh lùng đó làm bộ dạng thờ ơ
Nhìn anh đi em nha, hướng nụ cười cho riêng anh nha
Đơn giản là yêu, con tim anh lên tiếng thôi
Cầm tay anh (anh), dựa vai anh (anh)
Kề bên anh, nơi này có anh
Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
(Yêu em, thương em, con tim anh chân thành)
Cầm tay anh (anh), dựa vai anh (anh)
Kề bên anh, nơi này có anh
Khép đôi mi thật lâu
Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
Mùa xuân đến bình yên, cho anh những giấc mơ
Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
Mùa thu lá vàng rơi, đông sang, anh nhớ em
Tình yêu bé nhỏ xin dành tặng riêng em
Ah-ah-oh-oh-oh-oh-oh-oh-oh, nhớ thương em
Oh-oh-oh-oh-oh-oh-oh-oh-oh, nhớ thương em lắm
Ah, phía sau chân trời
Có ai băng qua lối về, cùng em đi trên đoạn đường dài
Cầm tay anh (anh), dựa vai anh (anh)
Kề bên anh, nơi này có anh
Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
(Yêu em, thương em, con tim anh chân thành)
Cầm tay anh (anh), dựa vai anh (anh)
Kề bên anh, nơi này có anh
Khép đôi mi thật lâu
Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu (oh-oh)
Mùa xuân đến bình yên, cho anh những giấc mơ
Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
Mùa thu lá vàng rơi, đông sang, anh nhớ em
Tình yêu bé nhỏ xin dành tặng riêng em', 'LYRIC_UPDATE', 16);
INSERT INTO public.track_submissions VALUES (29, 'Audio file corrupted or encoding does not meet platform standards.', '2026-10-31 16:33:51.153088+00', NULL, 2, 'REJECTED', '2026-10-31 16:32:39.579582+00', 3, 'Album submission: JKP', 22, NULL, 'TRACK_RELEASE', 17);
INSERT INTO public.track_submissions VALUES (4, 'Copyright Infringement ne', '2026-11-07 14:44:15.787403+00', NULL, 2, 'REJECTED', '2026-10-31 11:06:24.331+00', 4, NULL, 4, NULL, NULL, 18);
INSERT INTO public.track_submissions VALUES (8, 'Inappropriate or Offensive Content', '2026-11-07 14:47:48.032305+00', NULL, 2, 'REJECTED', '2026-10-31 11:06:24.331+00', 8, NULL, 8, NULL, NULL, 19);
INSERT INTO public.track_submissions VALUES (24, 'Gididn', '2026-11-07 15:35:56.078577+00', NULL, 2, 'REJECTED', '2026-10-31 14:56:06.787022+00', 3, 'Album submission: XOAY VÒNG', 19, NULL, NULL, 20);
INSERT INTO public.track_submissions VALUES (28, 'Don''t', '2026-11-07 17:55:38.388457+00', NULL, 2, 'REJECTED', '2026-10-31 16:32:39.533907+00', 3, 'Album submission: JKP', 21, NULL, 'TRACK_RELEASE', 21);
INSERT INTO public.track_submissions VALUES (21, 'abc', '2026-11-09 02:54:57.23616+00', NULL, 2, 'REJECTED', '2026-10-31 13:54:04.656652+00', 3, NULL, 15, NULL, NULL, 22);
INSERT INTO public.track_submissions VALUES (30, NULL, '2026-11-09 09:55:16.237388+00', NULL, 2, 'APPROVED', '2026-11-02 03:18:40.317888+00', 3, NULL, 23, NULL, 'TRACK_RELEASE', 23);
INSERT INTO public.track_submissions VALUES (31, 'Incomplete or placeholder metadata (title, artist or artwork).', '2026-11-09 09:56:25.448626+00', NULL, 2, 'REJECTED', '2026-11-05 17:34:44.747599+00', 3, NULL, 24, NULL, 'TRACK_RELEASE', 24);
INSERT INTO public.track_submissions VALUES (32, NULL, '2026-11-07 09:36:46.565316+00', NULL, 2, 'APPROVED', '2026-11-07 09:34:48.262892+00', 1, NULL, 1, '[ti:Nơi Này Có Anh]
[ar:Sơn Tùng M-TP]
[al:Nơi Này Có Anh (Official Music Video)]
[by:SoundWave]
[length:04:38]

[00:29.69]Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
[00:34.83]Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương (ngọt ngào trong sương)
[00:39.80]Ngắm em thật lâu, con tim anh yếu mềm
[00:45.16]Đắm say từ phút đó, từng giây trôi yêu thêm
[00:50.49]Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh (bộn bề nơi anh)
[00:55.78]Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh (bầu trời trong xanh)
[01:00.99]Liếc đôi hàng mi mong manh, anh thẫn thờ
[01:06.04]Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ
[01:11.20]Cầm tay anh (anh), dựa vai anh (anh)
[01:13.91]Kề bên anh, nơi này có anh
[01:16.29]Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[01:20.51](Yêu em, thương em, con tim anh chân thành)
[01:21.82]Cầm tay anh (anh), dựa vai anh (anh)
[01:24.30]Kề bên anh, nơi này có anh
[01:26.63]Khép đôi mi thật lâu
[01:28.15]Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
[01:31.70]Mùa xuân đến bình yên, cho anh những giấc mơ
[01:37.22]Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[01:42.32]Mùa thu lá vàng rơi, đông sang, anh nhớ em
[01:47.56]Tình yêu bé nhỏ xin dành tặng riêng em
[01:54.55]
[02:03.52](Yeah)
[02:04.06]Còn đó tiếng nói ấy bên tai vấn vương bao ngày qua
[02:06.70]Ánh mắt bối rối nhớ thương bao ngày qua
[02:09.59]Yêu em anh thẫn thờ, con tim bâng khuâng đâu có ngờ
[02:11.75]Chẳng bao giờ phải mong chờ, đợi ai trong chiều hoàng hôn mờ
[02:14.68]Đắm chìm hòa vào vần thơ, ngắm nhìn khờ dại mộng mơ
[02:17.10]Đừng bước vội vàng rồi làm ngơ, lạnh lùng đó làm bộ dạng thờ ơ
[02:19.75]Nhìn anh đi em nha, hướng nụ cười cho riêng anh nha
[02:21.84]Đơn giản là yêu, con tim anh lên tiếng thôi
[02:24.34]Cầm tay anh (anh), dựa vai anh (anh)
[02:27.05]Kề bên anh, nơi này có anh
[02:29.24]Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[02:33.78](Yêu em, thương em, con tim anh chân thành)
[02:34.85]Cầm tay anh (anh), dựa vai anh (anh)
[02:37.51]Kề bên anh, nơi này có anh
[02:39.67]Khép đôi mi thật lâu
[02:41.12]Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
[02:45.02]Mùa xuân đến bình yên, cho anh những giấc mơ
[02:50.25]Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[02:55.26]Mùa thu lá vàng rơi, đông sang, anh nhớ em
[03:00.57]Tình yêu bé nhỏ xin dành tặng riêng em
[03:05.89]Ah-ah-oh-oh-oh-oh-oh-oh-oh, nhớ thương em
[03:11.18]Oh-oh-oh-oh-oh-oh-oh-oh-oh, nhớ thương em lắm
[03:17.02]Ah, phía sau chân trời
[03:21.42]Có ai băng qua lối về, cùng em đi trên đoạn đường dài
[03:26.98]Cầm tay anh (anh), dựa vai anh (anh)
[03:29.68]Kề bên anh, nơi này có anh
[03:31.80]Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[03:36.30](Yêu em, thương em, con tim anh chân thành)
[03:37.36]Cầm tay anh (anh), dựa vai anh (anh)
[03:40.03]Kề bên anh, nơi này có anh
[03:42.36]Khép đôi mi thật lâu
[03:43.72]Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu (oh-oh)
[03:47.45]Mùa xuân đến bình yên, cho anh những giấc mơ
[03:52.75]Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[03:57.98]Mùa thu lá vàng rơi, đông sang, anh nhớ em
[04:03.27]Tình yêu bé nhỏ xin dành tặng riêng em
[04:08.34]', 'LYRIC_UPDATE', 25);
INSERT INTO public.track_submissions VALUES (33, NULL, '2026-11-07 10:34:33.372242+00', NULL, 2, 'APPROVED', '2026-11-07 10:33:48.084155+00', 1, NULL, 1, '[00:29.69]Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
[00:34.83]Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương (ngọt ngào trong sương)
[00:39.80]Ngắm em thật lâu, con tim anh yếu mềm
[00:45.16]Đắm say từ phút đó, từng giây trôi yêu thêm
[00:50.49]Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh (bộn bề nơi anh)
[00:55.78]Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh (bầu trời trong xanh)
[01:00.99]Liếc đôi hàng mi mong manh, anh thẫn thờ
[01:06.04]Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ
[01:11.20]Cầm tay anh (anh), dựa vai anh (anh)
[01:13.91]Kề bên anh, nơi này có anh
[01:16.29]Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[01:20.51](Yêu em, thương em, con tim anh chân thành)
[01:21.82]Cầm tay anh (anh), dựa vai anh (anh)
[01:24.30]Kề bên anh, nơi này có anh
[01:26.63]Khép đôi mi thật lâu
[01:28.15]Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
[01:31.70]Mùa xuân đến bình yên, cho anh những giấc mơ
[01:37.22]Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[01:42.32]Mùa thu lá vàng rơi, đông sang, anh nhớ em
[01:47.56]Tình yêu bé nhỏ xin dành tặng riêng em
[01:54.55]
[02:03.52](Yeah)
[02:04.06]Còn đó tiếng nói ấy bên tai vấn vương bao ngày qua
[02:06.70]Ánh mắt bối rối nhớ thương bao ngày qua
[02:09.59]Yêu em anh thẫn thờ, con tim bâng khuâng đâu có ngờ
[02:11.75]Chẳng bao giờ phải mong chờ, đợi ai trong chiều hoàng hôn mờ
[02:14.68]Đắm chìm hòa vào vần thơ, ngắm nhìn khờ dại mộng mơ
[02:17.10]Đừng bước vội vàng rồi làm ngơ, lạnh lùng đó làm bộ dạng thờ ơ
[02:19.75]Nhìn anh đi em nha, hướng nụ cười cho riêng anh nha
[02:21.84]Đơn giản là yêu, con tim anh lên tiếng thôi
[02:24.34]Cầm tay anh (anh), dựa vai anh (anh)
[02:27.05]Kề bên anh, nơi này có anh
[02:29.24]Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[02:33.78](Yêu em, thương em, con tim anh chân thành)
[02:34.85]Cầm tay anh (anh), dựa vai anh (anh)
[02:37.51]Kề bên anh, nơi này có anh
[02:39.67]Khép đôi mi thật lâu
[02:41.12]Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu
[02:45.02]Mùa xuân đến bình yên, cho anh những giấc mơ
[02:50.25]Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[02:55.26]Mùa thu lá vàng rơi, đông sang, anh nhớ em
[03:00.57]Tình yêu bé nhỏ xin dành tặng riêng em
[03:05.89]Ah-ah-oh-oh-oh-oh-oh-oh-oh, nhớ thương em
[03:11.18]Oh-oh-oh-oh-oh-oh-oh-oh-oh, nhớ thương em lắm
[03:17.02]Ah, phía sau chân trời
[03:21.42]Có ai băng qua lối về, cùng em đi trên đoạn đường dài
[03:26.98]Cầm tay anh (anh), dựa vai anh (anh)
[03:29.68]Kề bên anh, nơi này có anh
[03:31.80]Gió mang câu tình ca, ngàn ánh sao vụt qua, nhẹ ôm lấy em
[03:36.30](Yêu em, thương em, con tim anh chân thành)
[03:37.36]Cầm tay anh (anh), dựa vai anh (anh)
[03:40.03]Kề bên anh, nơi này có anh
[03:42.36]Khép đôi mi thật lâu
[03:43.72]Nguyện mãi bên cạnh nhau, yêu say đắm như ngày đầu (oh-oh)
[03:47.45]Mùa xuân đến bình yên, cho anh những giấc mơ
[03:52.75]Hạ lưu giữ ngày mưa, ngọt ngào nên thơ
[03:57.98]Mùa thu lá vàng rơi, đông sang, anh nhớ em
[04:03.27]Tình yêu bé nhỏ xin dành tặng riêng em
[04:08.34]', 'LYRIC_UPDATE', 26);
INSERT INTO public.track_submissions VALUES (36, NULL, NULL, NULL, NULL, 'PENDING', '2026-11-07 16:52:00.244741+00', 3, NULL, 27, NULL, 'TRACK_RELEASE', 27);


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tracks VALUES (9, '2026-10-31 05:25:24.766251', 'mp3', 'soundwave/tracks/audio/user-2-track-13b5a180-80ec-4e12-a1c7-3ff2f0e0a4a0', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793448045/soundwave/tracks/audio/user-2-track-13b5a180-80ec-4e12-a1c7-3ff2f0e0a4a0.mp3', 'soundwave/albums/covers/user-2-album-cover-cda05a27-4c5a-457e-8fc7-264295cb7273', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793448041/soundwave/albums/covers/user-2-album-cover-cda05a27-4c5a-457e-8fc7-264295cb7273.jpg', '2026-10-31 05:00:50.642284', 'nhạc chill chill', 221008, NULL, 1, 'PUBLISHED', 'raindacnce-1793448050642-3b0f23', 'Raindacnce', 1, '2026-11-08 20:33:40.870478', 2, 6, 4, 1);
INSERT INTO public.tracks VALUES (5, '2026-10-31 11:06:24.331', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565382/soundwave/tracks/audio/project-track-tim-em-hngle-bao-anh.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', '2026-10-31 11:06:24.331', 'Giai điệu R&B nhẹ nhàng, lãng mạn qua sự kết hợp ăn ý giữa Hngle và Bảo Anh.', 272170, NULL, 198426, 'PUBLISHED', 'tim-em-hngle-bao-anh', 'Tìm Em', NULL, '2026-11-09 02:42:34.371541', 5, NULL, 4, 2);
INSERT INTO public.tracks VALUES (10, NULL, 'mp3', 'soundwave/tracks/audio/user-2-track-205f2ee2-ec4e-4a8e-898e-8d8af96f17c3', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793448049/soundwave/tracks/audio/user-2-track-205f2ee2-ec4e-4a8e-898e-8d8af96f17c3.mp3', 'soundwave/albums/covers/user-2-album-cover-cda05a27-4c5a-457e-8fc7-264295cb7273', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793448041/soundwave/albums/covers/user-2-album-cover-cda05a27-4c5a-457e-8fc7-264295cb7273.jpg', '2026-10-31 05:00:50.771256', 'nhạc buồn nha', 201665, 'Audio file corrupted or encoding does not meet platform standards.', 0, 'REJECTED', 'back-to-friends-1793448050771-d08fbd', 'Back to friends', 2, '2026-10-31 05:26:40.930165', 2, 6, 1, 3);
INSERT INTO public.tracks VALUES (7, '2026-10-31 11:06:24.331', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565521/soundwave/tracks/audio/project-track-a-cruel-angels-thesis.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', '2026-10-31 11:06:24.331', 'Bài hát chủ đề huyền thoại của anime Neon Genesis Evangelion trình bày bởi Yoko Takahashi.', 243905, NULL, 523111, 'PUBLISHED', 'a-cruel-angels-thesis', 'A Cruel Angel''s Thesis (残酷な天使のテーゼ)', NULL, '2026-11-09 02:22:05.694651', 7, NULL, 1, 4);
INSERT INTO public.tracks VALUES (12, NULL, 'mp3', 'soundwave/tracks/audio/user-2-track-5f4b8d64-4e21-4cc2-aba2-05c077bad0a4', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793451047/soundwave/tracks/audio/user-2-track-5f4b8d64-4e21-4cc2-aba2-05c077bad0a4.mp3', 'soundwave/albums/covers/user-2-album-cover-b8c37e9b-072c-4c7c-98b3-115f2c165c02', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793451040/soundwave/albums/covers/user-2-album-cover-b8c37e9b-072c-4c7c-98b3-115f2c165c02.jpg', '2026-10-31 05:50:49.007447', 'nhạc buồn nha', 201665, NULL, 0, 'PENDING', 'back-to-friends-1793451049007-e80e5f', 'Back to friends', 2, '2026-10-31 05:50:56.085221', 2, 7, 1, 5);
INSERT INTO public.tracks VALUES (15, '2026-10-31 07:05:23.718618', 'mp3', 'soundwave/tracks/audio/user-3-track-ce79685f-cad1-4e51-a770-b8f591010656', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793454734/soundwave/tracks/audio/user-3-track-ce79685f-cad1-4e51-a770-b8f591010656.mp3', 'soundwave/tracks/covers/user-3-cover-b0b8f767-5aae-4d4b-9cc3-89d324842df5', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793454737/soundwave/tracks/covers/user-3-cover-b0b8f767-5aae-4d4b-9cc3-89d324842df5.png', '2026-10-31 06:52:17.146013', NULL, 280560, 'abc', 2, 'TAKEN_DOWN', 'secret-1793454737139', 'SECRET', NULL, '2026-11-08 19:54:57.410308', 3, NULL, 6, 6);
INSERT INTO public.tracks VALUES (13, NULL, 'mp3', 'soundwave/tracks/audio/user-3-track-8375ba01-9a99-4bdb-b71d-85a0edb6b278', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793452566/soundwave/tracks/audio/user-3-track-8375ba01-9a99-4bdb-b71d-85a0edb6b278.mp3', NULL, NULL, '2026-10-31 06:16:07.314628', NULL, 187742, NULL, 0, 'DRAFT', 'top-1-1793452567310', 'TOP 1', NULL, '2026-10-31 06:16:07.314628', 3, NULL, 6, 7);
INSERT INTO public.tracks VALUES (2, '2026-10-31 11:06:24.331', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565312/soundwave/tracks/audio/project-track-baby-mck.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', '2026-10-31 11:06:24.331', 'Bản hit đầy cảm xúc từ album 99% của MCK.', 173740, NULL, 285455, 'PUBLISHED', 'baby-mck', 'Baby', NULL, '2026-11-09 02:22:08.564279', 2, 2, 3, 8);
INSERT INTO public.tracks VALUES (8, '2026-10-31 11:06:24.331', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565419/soundwave/tracks/audio/project-track-yoru-ni-kakeru.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', '2026-10-31 11:06:24.331', 'Bản hit đột phá toàn cầu của bộ đôi YOASOBI dựa trên tiểu thuyết Tanatosu no Yūwaku.', 275043, 'Inappropriate or Offensive Content', 689420, 'TAKEN_DOWN', 'yoru-ni-kakeru', 'Yoru ni Kakeru (夜に駆ける)', NULL, '2026-11-07 07:47:48.246293', 8, 5, 1, 9);
INSERT INTO public.tracks VALUES (6, '2026-10-31 11:06:24.331', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565495/soundwave/tracks/audio/project-track-haru-yorushika.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp', '2026-10-31 11:06:24.331', 'Ca khúc chủ đề mở đầu của anime Frieren: Beyond Journey''s End thực hiện bởi nhóm nhạc Yorushika.', 276715, NULL, 312529, 'PUBLISHED', 'haru-yorushika', 'Haru (晴る)', NULL, '2026-11-09 02:22:07.610943', 6, NULL, 5, 10);
INSERT INTO public.tracks VALUES (3, '2026-10-31 11:06:24.331', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565333/soundwave/tracks/audio/project-track-exit-sign-hieuthuhai.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', '2026-10-31 11:06:24.331', 'Ca khúc nổi bật trong album Ai Cũng Phải Bắt Đầu Từ Đâu Đó của HIEUTHUHAI kết hợp cùng marzuz và Kewtiie.', 201718, NULL, 421937, 'PUBLISHED', 'exit-sign-hieuthuhai', 'Exit Sign', NULL, '2026-11-09 02:26:20.616056', 3, 3, 3, 11);
INSERT INTO public.tracks VALUES (18, NULL, 'mp3', 'soundwave/tracks/audio/user-3-track-7d56431a-f54c-45d1-b2bf-f5c07d617e3e', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793458310/soundwave/tracks/audio/user-3-track-7d56431a-f54c-45d1-b2bf-f5c07d617e3e.mp3', 'soundwave/albums/covers/user-3-album-cover-fb822850-c089-400c-9358-b070cb33e4c4', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793458303/soundwave/albums/covers/user-3-album-cover-fb822850-c089-400c-9358-b070cb33e4c4.png', '2026-10-31 07:51:50.662702', NULL, 187742, 'Audio file corrupted or encoding does not meet platform standards.', 0, 'REJECTED', 'top1-1793458310662-4a52ca', 'TOP1', 2, '2026-10-31 07:57:47.825158', 3, 8, 6, 12);
INSERT INTO public.tracks VALUES (11, '2026-10-31 05:52:31.977709', 'mp3', 'soundwave/tracks/audio/user-2-track-f42de389-c8c3-41d8-a460-6d07f067e598', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793451044/soundwave/tracks/audio/user-2-track-f42de389-c8c3-41d8-a460-6d07f067e598.mp3', 'soundwave/albums/covers/user-2-album-cover-b8c37e9b-072c-4c7c-98b3-115f2c165c02', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793451040/soundwave/albums/covers/user-2-album-cover-b8c37e9b-072c-4c7c-98b3-115f2c165c02.jpg', '2026-10-31 05:50:48.933044', 'nhạc chill chill', 221008, NULL, 2, 'PUBLISHED', 'raindance-1793451048933-5008bc', 'RainDance', 1, '2026-11-08 20:33:39.933739', 2, 7, 4, 13);
INSERT INTO public.tracks VALUES (16, '2026-10-31 07:05:07.87508', 'mp3', 'soundwave/tracks/audio/user-2-track-5338f57a-c487-4336-91d7-e223c94b8d3f', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793454749/soundwave/tracks/audio/user-2-track-5338f57a-c487-4336-91d7-e223c94b8d3f.mp3', 'soundwave/tracks/covers/user-2-cover-b5237f94-6d97-4e2a-a875-d14d45ed655d', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793454750/soundwave/tracks/covers/user-2-cover-b5237f94-6d97-4e2a-a875-d14d45ed655d.jpg', '2026-10-31 06:52:30.7569', NULL, 214357, NULL, 7, 'PUBLISHED', 'blue-1793454750756', 'Blue', NULL, '2026-11-09 02:50:33.409323', 2, NULL, 4, 14);
INSERT INTO public.tracks VALUES (22, NULL, 'mp3', 'soundwave/tracks/audio/user-3-track-612c8397-c0e9-4db1-a57f-3002a3c40d38', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793464352/soundwave/tracks/audio/user-3-track-612c8397-c0e9-4db1-a57f-3002a3c40d38.mp3', 'soundwave/albums/covers/user-3-album-cover-e9a9da45-8418-4664-bcfc-26efe7965af7', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793464344/soundwave/albums/covers/user-3-album-cover-e9a9da45-8418-4664-bcfc-26efe7965af7.png', '2026-10-31 09:32:32.486853', NULL, 280560, 'Audio file corrupted or encoding does not meet platform standards.', 0, 'REJECTED', 'uito-1793464352486-075c39', 'UITO', 2, '2026-10-31 09:33:51.28222', 3, 10, 6, 15);
INSERT INTO public.tracks VALUES (20, NULL, 'mp3', 'soundwave/tracks/audio/user-3-track-ea89d26d-9c7a-4dbd-9792-569c5a725a8d', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793458557/soundwave/tracks/audio/user-3-track-ea89d26d-9c7a-4dbd-9792-569c5a725a8d.mp3', 'soundwave/albums/covers/user-3-album-cover-f467812a-5105-45e7-bfa4-2a7b1cc4a3cb', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793458549/soundwave/albums/covers/user-3-album-cover-f467812a-5105-45e7-bfa4-2a7b1cc4a3cb.png', '2026-10-31 07:55:57.534057', NULL, 212108, 'Unlicensed sample, beat, or suspected copyright infringement.', 0, 'REJECTED', 'secret-1793458557534-fe295d', 'SECRET', 2, '2026-10-31 07:57:06.624195', 3, 9, 6, 16);
INSERT INTO public.tracks VALUES (14, '2026-10-31 06:53:38.616801', 'mp3', 'soundwave/tracks/audio/user-2-track-fdde6ffc-4924-4c17-a31a-52c7de5fef8a', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793453268/soundwave/tracks/audio/user-2-track-fdde6ffc-4924-4c17-a31a-52c7de5fef8a.mp3', 'soundwave/tracks/covers/user-2-cover-ddc9b632-4cd6-44c0-8252-f84ebd061ceb', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793453270/soundwave/tracks/covers/user-2-cover-ddc9b632-4cd6-44c0-8252-f84ebd061ceb.jpg', '2026-10-31 06:27:50.47223', NULL, 200923, NULL, 1, 'PUBLISHED', 'in-love-1793453270470', 'In Love', NULL, '2026-11-08 20:33:39.634415', 2, NULL, 4, 17);
INSERT INTO public.tracks VALUES (17, '2026-10-31 07:57:47.699239', 'mp3', 'soundwave/tracks/audio/user-3-track-84c0af7d-eb6e-4c59-abcb-ff9a00e6473f', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793458307/soundwave/tracks/audio/user-3-track-84c0af7d-eb6e-4c59-abcb-ff9a00e6473f.mp3', 'soundwave/albums/covers/user-3-album-cover-fb822850-c089-400c-9358-b070cb33e4c4', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793458303/soundwave/albums/covers/user-3-album-cover-fb822850-c089-400c-9358-b070cb33e4c4.png', '2026-10-31 07:51:50.607586', NULL, 212108, NULL, 0, 'PUBLISHED', 'the-gioi-cua-anh-1793458310603-786177', 'Thế Giới Của Anh', 1, '2026-10-31 07:57:48.17667', 3, 8, 6, 18);
INSERT INTO public.tracks VALUES (21, '2026-10-31 09:33:51.153088', 'mp3', 'soundwave/tracks/audio/user-3-track-30d92eb7-b6f6-408f-a7b4-22a25b5248de', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793464348/soundwave/tracks/audio/user-3-track-30d92eb7-b6f6-408f-a7b4-22a25b5248de.mp3', 'soundwave/albums/covers/user-3-album-cover-e9a9da45-8418-4664-bcfc-26efe7965af7', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793464344/soundwave/albums/covers/user-3-album-cover-e9a9da45-8418-4664-bcfc-26efe7965af7.png', '2026-10-31 09:32:32.439358', NULL, 187742, 'Don''t', 2, 'TAKEN_DOWN', 'hkto-1793464352438-8a43db', 'HKTO', 1, '2026-11-07 10:55:38.390479', 3, 10, 6, 19);
INSERT INTO public.tracks VALUES (19, '2026-10-31 07:57:06.49059', 'mp3', 'soundwave/tracks/audio/user-3-track-6759cc73-f6cd-4e29-8bc7-284ece916286', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793458553/soundwave/tracks/audio/user-3-track-6759cc73-f6cd-4e29-8bc7-284ece916286.mp3', 'soundwave/albums/covers/user-3-album-cover-f467812a-5105-45e7-bfa4-2a7b1cc4a3cb', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793458549/soundwave/albums/covers/user-3-album-cover-f467812a-5105-45e7-bfa4-2a7b1cc4a3cb.png', '2026-10-31 07:55:57.378294', NULL, 270620, 'Gididn', 2, 'TAKEN_DOWN', 'laviem-1793458557376-666b8f', 'LAVIEM', 1, '2026-11-07 08:35:56.191039', 3, 9, 6, 20);
INSERT INTO public.tracks VALUES (23, '2026-11-09 02:55:16.237388', 'mp3', 'soundwave/tracks/audio/user-3-track-49c27bff-097a-4c67-b354-1ba4a61005a5', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793589485/soundwave/tracks/audio/user-3-track-49c27bff-097a-4c67-b354-1ba4a61005a5.mp3', NULL, NULL, '2026-11-01 20:18:06.453637', NULL, 270620, NULL, 0, 'PUBLISHED', 'laviem-1793589486450', 'LAVIEM', NULL, '2026-11-09 02:55:16.953328', 3, NULL, 7, 21);
INSERT INTO public.tracks VALUES (4, '2026-10-31 11:06:24.331', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565353/soundwave/tracks/audio/project-track-giua-dai-lo-dong-tay.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', '2026-10-31 11:06:24.331', 'Ca khúc ballad da diết sáng tác bởi Hứa Kim Tuyền qua giọng hát nội lực của Uyên Linh.', 226691, 'Copyright Infringement ne', 356710, 'TAKEN_DOWN', 'giua-dai-lo-dong-tay', 'Giữa Đại Lộ Đông Tây', NULL, '2026-11-07 07:44:16.241172', 4, 4, 2, 22);
INSERT INTO public.tracks VALUES (27, NULL, 'mp3', 'soundwave/tracks/audio/user-3-track-c1242af8-a354-42cc-be56-eca4ca013f54', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1794070288/soundwave/tracks/audio/user-3-track-c1242af8-a354-42cc-be56-eca4ca013f54.mp3', 'soundwave/tracks/covers/user-3-cover-8da18d0c-f399-4e00-b6a2-702d52436b82', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1794070291/soundwave/tracks/covers/user-3-cover-8da18d0c-f399-4e00-b6a2-702d52436b82.png', '2026-11-07 09:51:33.085916', NULL, 187742, NULL, 0, 'PENDING', 'top1-1794070293081', 'TOP1', NULL, '2026-11-07 09:52:00.579948', 3, NULL, 6, 23);
INSERT INTO public.tracks VALUES (1, '2026-10-31 08:49:32.259661', 'mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565402/soundwave/tracks/audio/project-track-noi-nay-co-anh.mp3', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', '2026-10-31 11:06:24.331', 'Bản tình ca Pop ngọt ngào, lãng mạn đình đám của Sơn Tùng M-TP.', 278269, NULL, 892543, 'PUBLISHED', 'noi-nay-co-anh', 'Nơi Này Có Anh', NULL, '2026-11-09 02:27:13.892983', 1, 1, 1, 24);
INSERT INTO public.tracks VALUES (24, NULL, 'mp3', 'soundwave/tracks/audio/user-3-track-2fd26d35-95d9-4ef5-a0e6-b8a66afe7a9d', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793900061/soundwave/tracks/audio/user-3-track-2fd26d35-95d9-4ef5-a0e6-b8a66afe7a9d.mp3', 'soundwave/tracks/covers/user-3-cover-13796068-9751-4e29-8f5e-bf9f1a578974', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793900064/soundwave/tracks/covers/user-3-cover-13796068-9751-4e29-8f5e-bf9f1a578974.png', '2026-11-05 10:34:24.907624', NULL, 187742, 'Incomplete or placeholder metadata (title, artist or artwork).', 0, 'REJECTED', 'top-1-1793900064902', 'TOP 1', NULL, '2026-11-09 02:56:25.968451', 3, NULL, 6, 25);


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_profiles VALUES (1, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'Ca sĩ, nhạc sĩ, nhà sản xuất âm nhạc V-Pop hàng đầu. Founder M-TP Entertainment.', 'VN', '2026-10-31 11:06:24.331', NULL, 'Sơn Tùng M-TP', '2026-10-31 11:06:24.331', 'sontungmtp');
INSERT INTO public.user_profiles VALUES (2, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-baby-mck.webp', 'Rapper, ca sĩ, nhạc sĩ thuộc tổ đội RPT. Chủ nhân album đình đám 99%.', 'VN', '2026-10-31 11:06:24.331', NULL, 'MCK', '2026-10-31 11:06:24.331', 'mck99');
INSERT INTO public.user_profiles VALUES (3, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', 'Rapper thành viên nhóm nhạc GERDNANG. Chủ nhân album Ai Cũng Phải Bắt Đầu Từ Đâu Đó.', 'VN', '2026-10-31 11:06:24.331', NULL, 'HIEUTHUHAI', '2026-10-31 11:06:24.331', 'hieuthuhai');
INSERT INTO public.user_profiles VALUES (4, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', 'Nữ ca sĩ sở hữu giọng hát nội lực, truyền cảm với các bản hit Ballad da diết.', 'VN', '2026-10-31 11:06:24.331', NULL, 'Uyên Linh', '2026-10-31 11:06:24.331', 'uyenlinh');
INSERT INTO public.user_profiles VALUES (5, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', 'Nghệ sĩ Indie R&B trẻ với màu sắc âm nhạc hiện đại, cảm xúc và bay bổng.', 'VN', '2026-10-31 11:06:24.331', NULL, 'Hngle ft. Bảo Anh', '2026-10-31 11:06:24.331', 'hngle');
INSERT INTO public.user_profiles VALUES (6, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-haru-yorushika.webp', 'Nhóm nhạc rock/indie Nhật Bản được thành lập vào năm 2017 bởi n-buna và suis.', 'JP', '2026-10-31 11:06:24.331', NULL, 'Yorushika', '2026-10-31 11:06:24.331', 'yorushika');
INSERT INTO public.user_profiles VALUES (7, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', 'Ca sĩ nổi tiếng với các bài hát anime kinh điển, đặc biệt là Evangelion.', 'JP', '2026-10-31 11:06:24.331', NULL, 'Yoko Takahashi', '2026-10-31 11:06:24.331', 'yokotakahashi');
INSERT INTO public.user_profiles VALUES (8, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', 'Bộ đôi âm nhạc Nhật Bản gồm nhà sản xuất Ayase và ca sĩ kiêm nhạc sĩ Ikura.', 'JP', '2026-10-31 11:06:24.331', NULL, 'YOASOBI', '2026-10-31 11:06:24.331', 'yoasobi');
INSERT INTO public.user_profiles VALUES (9, NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 'Creator on SoundWave platform.', 'VN', '2026-10-31 11:06:24.331', NULL, 'Hekio', '2026-10-31 11:06:24.331', 'hekio');
INSERT INTO public.user_profiles VALUES (10, NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Yêu âm nhạc, thích nghe podcast và indie mỗi tối.', 'VN', '2026-10-31 11:06:24.331', NULL, 'Lan Anh', '2026-10-31 11:06:24.331', 'listener_vn');
INSERT INTO public.user_profiles VALUES (11, NULL, NULL, NULL, NULL, '2026-11-07 06:04:45.787727', NULL, 'LE HAI DUY', '2026-11-07 06:04:45.787727', 'lehaiduy1900');
INSERT INTO public.user_profiles VALUES (12, NULL, NULL, NULL, NULL, '2026-11-07 06:34:43.90745', NULL, 'Nguyễn Thanh Hào Trần', '2026-11-07 06:34:43.90745', 'haotntce200338');
INSERT INTO public.user_profiles VALUES (13, NULL, NULL, NULL, NULL, '2026-11-09 01:54:38.167161', NULL, 'Nguyễn Thanh Hào Trần', '2026-11-09 01:54:38.167161', 'haotta8');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (5, '2026-10-31 11:06:24.331', NULL, 'hngle@soundwave.io', '2026-10-31 11:06:24.331', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:24.331', 1);
INSERT INTO public.users VALUES (7, '2026-10-31 11:06:24.331', NULL, 'yoko@soundwave.io', '2026-10-31 11:06:24.331', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:24.331', 2);
INSERT INTO public.users VALUES (8, '2026-10-31 11:06:24.331', NULL, 'yoasobi@soundwave.io', '2026-10-31 11:06:24.331', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:24.331', 3);
INSERT INTO public.users VALUES (9, '2026-10-31 11:06:24.331', NULL, 'hekio@soundwave.io', '2026-10-31 11:06:24.331', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:24.331', 4);
INSERT INTO public.users VALUES (10, '2026-10-31 11:06:24.331', NULL, 'listener@soundwave.io', '2026-10-31 11:06:24.331', NULL, NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 11:06:24.331', 5);
INSERT INTO public.users VALUES (4, '2026-10-31 11:06:24.331', NULL, 'uyenlinh@soundwave.io', '2026-10-31 11:06:24.331', '2026-10-31 04:36:36.935529', NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-31 04:36:37.351247', 6);
INSERT INTO public.users VALUES (6, '2026-10-31 11:06:24.331', NULL, 'yorushika@soundwave.io', '2026-10-31 11:06:24.331', '2026-11-07 07:33:37.002585', NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-11-07 07:33:37.445236', 8);
INSERT INTO public.users VALUES (1, '2026-10-31 11:06:24.331', NULL, 'sontungmtp@soundwave.io', '2026-10-31 11:06:24.331', '2026-11-08 19:46:37.718215', NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-11-08 19:46:37.818136', 9);
INSERT INTO public.users VALUES (3, '2026-10-31 11:06:24.331', NULL, 'hieuthuhai@soundwave.io', '2026-10-31 11:06:24.331', '2026-11-08 19:49:14.196805', NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-11-08 19:49:14.260698', 10);
INSERT INTO public.users VALUES (11, '2026-11-07 06:04:45.283775', NULL, 'lehaiduy1900@gmail.com', '2026-11-07 06:05:19.88692', '2026-11-08 19:54:57.350396', NULL, '$2a$10$6prPvYmRaSpAmPaZk4bGlefOkwta7aTzBXklui22QkB2BKOpLHDZG', 'ACTIVE', '2026-11-08 19:54:57.39357', 11);
INSERT INTO public.users VALUES (12, '2026-11-07 06:34:43.837998', NULL, 'haotntce200338@gmail.com', '2026-11-07 06:35:19.675426', NULL, NULL, '$2a$10$o84Jv39WlRwNIvMQMG/.LeKdzbvrM8tSzvSag3EdMatoD7Oep9VRu', 'ACTIVE', '2026-11-07 06:35:19.676433', 12);
INSERT INTO public.users VALUES (13, '2026-11-09 01:54:38.012451', NULL, 'haotta8@gmail.com', '2026-11-09 01:58:45.111694', '2026-11-09 02:47:15.415027', NULL, '$2a$10$J3MqUVl.6jZOMFzCqGSgI.NMhdlnTKaEPI4O1sx1o7EO/Ezhh1pdm', 'ACTIVE', '2026-11-09 03:37:23.310117', 13);
INSERT INTO public.users VALUES (2, '2026-10-31 11:06:24.331', NULL, 'mck@soundwave.io', '2026-10-31 11:06:24.331', '2026-11-12 05:58:39.087447', NULL, '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-11-12 05:58:39.151572', 7);


--
-- Name: account_unlock_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.account_unlock_tokens_id_seq', 1, false);


--
-- Name: account_unlock_tokens_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.account_unlock_tokens_id_seq1', 1, false);


--
-- Name: albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.albums_id_seq', 10, true);


--
-- Name: albums_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.albums_id_seq1', 10, true);


--
-- Name: content_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_reports_id_seq', 21, true);


--
-- Name: content_reports_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_reports_id_seq1', 18, true);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 3, true);


--
-- Name: email_verification_tokens_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq1', 3, true);


--
-- Name: genres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.genres_id_seq', 8, true);


--
-- Name: genres_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.genres_id_seq1', 8, true);


--
-- Name: listening_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.listening_history_id_seq', 45, true);


--
-- Name: listening_history_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.listening_history_id_seq1', 39, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 76, true);


--
-- Name: notifications_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq1', 76, true);


--
-- Name: official_lyrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.official_lyrics_id_seq', 14, true);


--
-- Name: official_lyrics_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.official_lyrics_id_seq1', 13, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, true);


--
-- Name: password_reset_tokens_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq1', 1, true);


--
-- Name: personal_lyrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_lyrics_id_seq', 65, true);


--
-- Name: personal_lyrics_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_lyrics_id_seq1', 40, true);


--
-- Name: playlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.playlists_id_seq', 4, true);


--
-- Name: playlists_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.playlists_id_seq1', 4, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 787, true);


--
-- Name: refresh_tokens_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq1', 786, true);


--
-- Name: staff_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_roles_id_seq', 2, true);


--
-- Name: staff_roles_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_roles_id_seq1', 2, true);


--
-- Name: staffs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staffs_id_seq', 6, true);


--
-- Name: staffs_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staffs_id_seq1', 4, true);


--
-- Name: track_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.track_submissions_id_seq', 36, true);


--
-- Name: track_submissions_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.track_submissions_id_seq1', 27, true);


--
-- Name: tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tracks_id_seq', 27, true);


--
-- Name: tracks_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tracks_id_seq1', 25, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- Name: users_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq1', 13, true);


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
-- Name: content_reports content_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT content_reports_pkey PRIMARY KEY (report_id);


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
-- Name: uq_personal_lyrics_user_track_type; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_personal_lyrics_user_track_type ON public.personal_lyrics USING btree (user_id, track_id, lyric_type);


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

\unrestrict Ci5FSIy1ODdWNXveqcm6JKPlHYk0smGISkcmrtidDZY3UdlC9qYWbajEbpjAolY

