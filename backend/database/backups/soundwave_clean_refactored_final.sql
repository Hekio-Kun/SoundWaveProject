--
-- PostgreSQL database dump
--

\restrict cJOgpX5qaqCh9L5DjwpETnMyPgOmlSc3OsE7X0n6jGq97sxoBgBowAwZNyuotIe

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
ALTER TABLE IF EXISTS ONLY public.staffs DROP CONSTRAINT IF EXISTS staffs_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.official_lyrics DROP CONSTRAINT IF EXISTS fkaapwxgur5skqdrnov9ldxgq9o;
ALTER TABLE IF EXISTS ONLY public.account_unlock_tokens DROP CONSTRAINT IF EXISTS fka3fpk5xbjuof254bc5skirifc;
ALTER TABLE IF EXISTS ONLY public.user_profiles DROP CONSTRAINT IF EXISTS fk_user_profiles_users;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS fk_tracks_uploader_app_users;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS fk_tracks_genres;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS fk_tracks_albums;
ALTER TABLE IF EXISTS ONLY public.track_submissions DROP CONSTRAINT IF EXISTS fk_track_submissions_tracks;
ALTER TABLE IF EXISTS ONLY public.track_submissions DROP CONSTRAINT IF EXISTS fk_track_submissions_submitter_app_users;
ALTER TABLE IF EXISTS ONLY public.track_submissions DROP CONSTRAINT IF EXISTS fk_track_submissions_reviewer_staffs;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS fk_refresh_tokens_app_users;
ALTER TABLE IF EXISTS ONLY public.playlists DROP CONSTRAINT IF EXISTS fk_playlists_owner_app_users;
ALTER TABLE IF EXISTS ONLY public.playlist_tracks DROP CONSTRAINT IF EXISTS fk_playlist_tracks_tracks;
ALTER TABLE IF EXISTS ONLY public.playlist_tracks DROP CONSTRAINT IF EXISTS fk_playlist_tracks_playlists;
ALTER TABLE IF EXISTS ONLY public.playlist_tracks DROP CONSTRAINT IF EXISTS fk_playlist_tracks_added_by_app_users;
ALTER TABLE IF EXISTS ONLY public.personal_lyrics DROP CONSTRAINT IF EXISTS fk_personal_lyrics_tracks;
ALTER TABLE IF EXISTS ONLY public.personal_lyrics DROP CONSTRAINT IF EXISTS fk_personal_lyrics_app_users;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS fk_password_reset_tokens_app_users;
ALTER TABLE IF EXISTS ONLY public.official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_tracks;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS fk_notifications_app_users;
ALTER TABLE IF EXISTS ONLY public.listening_history DROP CONSTRAINT IF EXISTS fk_listening_history_tracks;
ALTER TABLE IF EXISTS ONLY public.listening_history DROP CONSTRAINT IF EXISTS fk_listening_history_app_users;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS fk_genres_created_by_app_users;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS fk_favorites_tracks;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS fk_favorites_app_users;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS fk_email_verification_tokens_app_users;
ALTER TABLE IF EXISTS ONLY public.content_reports DROP CONSTRAINT IF EXISTS fk_content_reports_tracks;
ALTER TABLE IF EXISTS ONLY public.content_reports DROP CONSTRAINT IF EXISTS fk_content_reports_submitter_app_users;
ALTER TABLE IF EXISTS ONLY public.content_reports DROP CONSTRAINT IF EXISTS fk_content_reports_handler_staffs;
ALTER TABLE IF EXISTS ONLY public.albums DROP CONSTRAINT IF EXISTS fk_albums_created_by_app_users;
ALTER TABLE IF EXISTS ONLY public.account_unlock_tokens DROP CONSTRAINT IF EXISTS account_unlock_tokens_staff_id_fkey;
DROP INDEX IF EXISTS public.ux_track_submissions_one_pending_per_track;
DROP INDEX IF EXISTS public.ix_tracks_uploader_user_id;
DROP INDEX IF EXISTS public.ix_tracks_public_catalog;
DROP INDEX IF EXISTS public.ix_tracks_album_id;
DROP INDEX IF EXISTS public.ix_track_submissions_moderation_queue;
DROP INDEX IF EXISTS public.ix_refresh_tokens_active_by_user;
DROP INDEX IF EXISTS public.ix_playlists_public;
DROP INDEX IF EXISTS public.ix_playlists_owner_user_id;
DROP INDEX IF EXISTS public.ix_playlist_tracks_track_id;
DROP INDEX IF EXISTS public.ix_personal_lyrics_user_track;
DROP INDEX IF EXISTS public.ix_password_reset_tokens_user_id;
DROP INDEX IF EXISTS public.ix_notifications_user_unread;
DROP INDEX IF EXISTS public.ix_listening_history_user_played_at;
DROP INDEX IF EXISTS public.ix_favorites_track_id;
DROP INDEX IF EXISTS public.ix_email_verification_tokens_user_id;
DROP INDEX IF EXISTS public.ix_content_reports_submitter;
DROP INDEX IF EXISTS public.ix_content_reports_moderation_queue;
DROP INDEX IF EXISTS public.ix_app_users_status;
DROP INDEX IF EXISTS public.ix_albums_created_by_user_id;
DROP INDEX IF EXISTS public.idx_notifications_user_created;
DROP INDEX IF EXISTS public.idx_notifications_staff_created;
ALTER TABLE IF EXISTS ONLY public.user_profiles DROP CONSTRAINT IF EXISTS uq_user_profiles_username;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS uq_tracks_slug;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS uq_refresh_tokens_hash;
ALTER TABLE IF EXISTS ONLY public.playlist_tracks DROP CONSTRAINT IF EXISTS uq_playlist_tracks_position;
ALTER TABLE IF EXISTS ONLY public.personal_lyrics DROP CONSTRAINT IF EXISTS uq_personal_lyrics_user_track_type;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS uq_password_reset_tokens_hash;
ALTER TABLE IF EXISTS ONLY public.official_lyrics DROP CONSTRAINT IF EXISTS uq_official_lyrics_track;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS uq_genres_slug;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS uq_genres_name;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS uq_email_verification_tokens_hash;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS uq_app_users_email;
ALTER TABLE IF EXISTS ONLY public.albums DROP CONSTRAINT IF EXISTS uq_albums_slug;
ALTER TABLE IF EXISTS ONLY public.playlists DROP CONSTRAINT IF EXISTS ukbq229u3bbkas0bmcvn265p3b2;
ALTER TABLE IF EXISTS ONLY public.staffs DROP CONSTRAINT IF EXISTS staffs_pkey;
ALTER TABLE IF EXISTS ONLY public.staffs DROP CONSTRAINT IF EXISTS staffs_email_key;
ALTER TABLE IF EXISTS ONLY public.staff_roles DROP CONSTRAINT IF EXISTS staff_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.staff_roles DROP CONSTRAINT IF EXISTS staff_roles_code_key;
ALTER TABLE IF EXISTS ONLY public.user_profiles DROP CONSTRAINT IF EXISTS pk_user_profiles;
ALTER TABLE IF EXISTS ONLY public.tracks DROP CONSTRAINT IF EXISTS pk_tracks;
ALTER TABLE IF EXISTS ONLY public.track_submissions DROP CONSTRAINT IF EXISTS pk_track_submissions;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS pk_refresh_tokens;
ALTER TABLE IF EXISTS ONLY public.playlists DROP CONSTRAINT IF EXISTS pk_playlists;
ALTER TABLE IF EXISTS ONLY public.playlist_tracks DROP CONSTRAINT IF EXISTS pk_playlist_tracks;
ALTER TABLE IF EXISTS ONLY public.personal_lyrics DROP CONSTRAINT IF EXISTS pk_personal_lyrics;
ALTER TABLE IF EXISTS ONLY public.password_reset_tokens DROP CONSTRAINT IF EXISTS pk_password_reset_tokens;
ALTER TABLE IF EXISTS ONLY public.official_lyrics DROP CONSTRAINT IF EXISTS pk_official_lyrics;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS pk_notifications;
ALTER TABLE IF EXISTS ONLY public.listening_history DROP CONSTRAINT IF EXISTS pk_listening_history;
ALTER TABLE IF EXISTS ONLY public.genres DROP CONSTRAINT IF EXISTS pk_genres;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS pk_favorites;
ALTER TABLE IF EXISTS ONLY public.email_verification_tokens DROP CONSTRAINT IF EXISTS pk_email_verification_tokens;
ALTER TABLE IF EXISTS ONLY public.content_reports DROP CONSTRAINT IF EXISTS pk_content_reports;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS pk_app_users;
ALTER TABLE IF EXISTS ONLY public.albums DROP CONSTRAINT IF EXISTS pk_albums;
ALTER TABLE IF EXISTS ONLY public.account_unlock_tokens DROP CONSTRAINT IF EXISTS account_unlock_tokens_pkey;
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
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.albums;
DROP TABLE IF EXISTS public.account_unlock_tokens;
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
    user_id bigint,
    staff_id bigint
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
    created_by_user_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    slug character varying(220) NOT NULL,
    description character varying(2000),
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    cover_public_id character varying(255),
    cover_url character varying(2048),
    release_date date,
    published_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    latest_rejection_reason character varying(1000),
    reviewed_at timestamp(6) without time zone,
    reviewer_note character varying(2000),
    reviewer_user_id bigint,
    CONSTRAINT ck_albums_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying])::text[])))
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
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id bigint CONSTRAINT app_users_id_not_null NOT NULL,
    email character varying(320) CONSTRAINT app_users_email_not_null NOT NULL,
    password_hash character varying(255) CONSTRAINT app_users_password_hash_not_null NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying CONSTRAINT app_users_status_not_null NOT NULL,
    email_verified_at timestamp(3) without time zone,
    last_login_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) CONSTRAINT app_users_created_at_not_null NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) CONSTRAINT app_users_updated_at_not_null NOT NULL,
    locked_until timestamp(6) without time zone,
    CONSTRAINT ck_app_users_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'BANNED'::character varying])::text[])))
);


--
-- Name: app_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN user_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.app_users_id_seq
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
    track_id bigint NOT NULL,
    submitted_by_user_id bigint NOT NULL,
    handled_by_user_id bigint,
    category character varying(50) NOT NULL,
    description character varying(2000) NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    resolution_note character varying(2000),
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    handled_at timestamp(3) without time zone,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    reason character varying(100),
    reporter_id bigint,
    resolved_at timestamp(6) with time zone,
    reviewer_id bigint,
    reviewer_note text,
    target_id bigint,
    target_type character varying(50),
    CONSTRAINT ck_content_reports_category CHECK (((category)::text = ANY ((ARRAY['COPYRIGHT'::character varying, 'INAPPROPRIATE_CONTENT'::character varying, 'INCORRECT_METADATA'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT ck_content_reports_handling CHECK (((((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('WITHDRAWN'::character varying)::text])) AND (handled_at IS NULL)) OR (((status)::text = ANY (ARRAY[('RESOLVED'::character varying)::text, ('REJECTED'::character varying)::text])) AND (handled_by_user_id IS NOT NULL) AND (handled_at IS NOT NULL) AND (resolution_note IS NOT NULL)))),
    CONSTRAINT ck_content_reports_status CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('RESOLVED'::character varying)::text, ('REJECTED'::character varying)::text, ('WITHDRAWN'::character varying)::text])))
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
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verification_tokens (
    verification_token_id bigint CONSTRAINT email_verification_tokens_id_not_null NOT NULL,
    user_id bigint NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    CONSTRAINT ck_email_verification_tokens_expiry CHECK ((expires_at > created_at))
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
    user_id bigint NOT NULL,
    track_id bigint NOT NULL,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL
);


--
-- Name: genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genres (
    genre_id bigint CONSTRAINT genres_id_not_null NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description character varying(1000),
    is_active boolean DEFAULT true NOT NULL,
    created_by_user_id bigint,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL
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
    user_id bigint NOT NULL,
    track_id bigint NOT NULL,
    listened_duration_ms integer NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    played_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    CONSTRAINT ck_listening_history_duration CHECK ((listened_duration_ms >= 0))
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
    user_id bigint,
    type character varying(50) NOT NULL,
    title character varying(150) NOT NULL,
    message character varying(500) NOT NULL,
    action_url character varying(2048),
    read_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    actor_id bigint,
    reference_id character varying(100),
    reference_type character varying(50),
    is_read boolean DEFAULT false NOT NULL,
    staff_id bigint,
    CONSTRAINT ck_notifications_type CHECK (((type)::text = ANY ((ARRAY['TRACK_APPROVED'::character varying, 'TRACK_REJECTED'::character varying, 'TRACK_TAKEN_DOWN'::character varying, 'TRACK_SUBMISSION'::character varying, 'REPORT_RESOLVED'::character varying, 'REPORT_REJECTED'::character varying, 'CONTENT_REPORT'::character varying, 'ACCOUNT_STATUS_CHANGED'::character varying, 'ROLE_CHANGED'::character varying, 'SYSTEM'::character varying, 'SYSTEM_NOTICE'::character varying])::text[])))
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
    track_id bigint NOT NULL,
    lyric_content text NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_by_user_id bigint NOT NULL,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    CONSTRAINT ck_official_lyrics_status CHECK (((status)::text = ANY (ARRAY[('DRAFT'::character varying)::text, ('PUBLISHED'::character varying)::text])))
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
    user_id bigint,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    used_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    staff_id bigint,
    CONSTRAINT ck_password_reset_tokens_expiry CHECK ((expires_at > created_at))
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
    user_id bigint NOT NULL,
    track_id bigint NOT NULL,
    lyric_type character varying(20) DEFAULT 'CUSTOM'::character varying NOT NULL,
    lyric_content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    CONSTRAINT ck_personal_lyrics_type CHECK (((lyric_type)::text = ANY ((ARRAY['CUSTOM'::character varying, 'TRANSLATION'::character varying])::text[])))
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
    playlist_id bigint NOT NULL,
    track_id bigint NOT NULL,
    added_by_user_id bigint NOT NULL,
    "position" integer NOT NULL,
    added_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    CONSTRAINT ck_playlist_tracks_position CHECK (("position" > 0))
);


--
-- Name: playlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.playlists (
    playlist_id bigint CONSTRAINT playlists_id_not_null NOT NULL,
    owner_user_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    description character varying(2000),
    visibility character varying(30) DEFAULT 'PRIVATE'::character varying NOT NULL,
    cover_public_id character varying(255),
    cover_url character varying(2048),
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    created_by_user_id bigint NOT NULL,
    is_private boolean NOT NULL,
    slug character varying(180) NOT NULL,
    title character varying(150) NOT NULL,
    CONSTRAINT ck_playlists_visibility CHECK (((visibility)::text = ANY (ARRAY[('PUBLIC'::character varying)::text, ('PRIVATE'::character varying)::text])))
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
    user_id bigint,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    revoked_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    staff_id bigint,
    CONSTRAINT ck_refresh_tokens_expiry CHECK ((expires_at > created_at))
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
    name character varying(80) NOT NULL,
    description character varying(500),
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL
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
    role_id smallint NOT NULL,
    email character varying(320) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(120) NOT NULL,
    avatar_url character varying(2048),
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL
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
    track_id bigint NOT NULL,
    submitted_by_user_id bigint NOT NULL,
    reviewer_user_id bigint,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    submitter_note character varying(2000),
    reviewer_note character varying(2000),
    rejection_reason character varying(1000),
    submitted_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    reviewed_at timestamp(3) without time zone,
    submission_type character varying(30) DEFAULT 'TRACK_RELEASE'::character varying NOT NULL,
    proposed_lyrics text,
    CONSTRAINT ck_track_submissions_rejection_reason CHECK ((((status)::text <> 'REJECTED'::text) OR (rejection_reason IS NOT NULL))),
    CONSTRAINT ck_track_submissions_review_result CHECK (((((status)::text = 'PENDING'::text) AND (reviewed_at IS NULL)) OR (((status)::text = ANY ((ARRAY['APPROVED'::character varying, 'REJECTED'::character varying])::text[])) AND (reviewer_user_id IS NOT NULL) AND (reviewed_at IS NOT NULL)))),
    CONSTRAINT ck_track_submissions_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT ck_track_submissions_type CHECK (((submission_type)::text = ANY ((ARRAY['TRACK_RELEASE'::character varying, 'LYRIC_UPDATE'::character varying])::text[])))
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
    uploader_user_id bigint NOT NULL,
    album_id bigint,
    genre_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    slug character varying(220) NOT NULL,
    description character varying(2000),
    track_number integer,
    publication_status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    approved_at timestamp(3) without time zone,
    latest_rejection_reason character varying(1000),
    audio_public_id character varying(255),
    audio_url character varying(2048),
    audio_format character varying(20) NOT NULL,
    duration_ms integer NOT NULL,
    cover_public_id character varying(255),
    cover_url character varying(2048),
    play_count_cache bigint DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    lyrics text,
    CONSTRAINT ck_tracks_duration_ms CHECK ((duration_ms >= 0)),
    CONSTRAINT ck_tracks_play_count_cache CHECK ((play_count_cache >= 0)),
    CONSTRAINT ck_tracks_publication_status CHECK (((publication_status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PENDING'::character varying, 'PUBLISHED'::character varying, 'REJECTED'::character varying, 'TAKEN_DOWN'::character varying])::text[]))),
    CONSTRAINT ck_tracks_track_number CHECK (((track_number IS NULL) OR (track_number > 0)))
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
    username character varying(50) NOT NULL,
    display_name character varying(120) NOT NULL,
    bio character varying(1000),
    avatar_public_id character varying(255),
    avatar_url character varying(2048),
    date_of_birth date,
    country_code character(2),
    created_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP(3)) NOT NULL
);


--
-- Data for Name: account_unlock_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.albums VALUES (1, 3, 'Rap', 'rap-1791638067718', 'abc', 'PUBLISHED', 'soundwave/albums/covers/user-3-album-cover-0bc87820-18c4-41f4-a517-6eb2462f1f93', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791638066/soundwave/albums/covers/user-3-album-cover-0bc87820-18c4-41f4-a517-6eb2462f1f93.jpg', '2026-10-10', '2026-10-10 06:14:27.989', '2026-10-10 06:14:27.72', '2026-10-10 06:14:28.033', NULL, NULL, NULL, NULL);
INSERT INTO public.albums VALUES (10, 7, 'HVL', 'hvl-1792081422268', 'HVL Album description', 'PUBLISHED', 'soundwave/albums/covers/user-7-album-cover-95bb81e1-bac1-4525-af40-93cea2143976', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792081546/soundwave/albums/covers/user-7-album-cover-95bb81e1-bac1-4525-af40-93cea2143976.jpg', '2026-10-15', '2026-10-15 14:28:26.196', '2026-10-15 09:23:42.271', '2026-10-15 14:28:32.6', NULL, NULL, NULL, NULL);
INSERT INTO public.albums VALUES (11, 8, 'TINHHA', 'tinhha-1792319206587', 'This is an upbeat song.', 'PUBLISHED', 'soundwave/albums/covers/user-8-album-cover-cc31450f-a733-4957-932d-a6de9f544701', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792319206/soundwave/albums/covers/user-8-album-cover-cc31450f-a733-4957-932d-a6de9f544701.png', '2026-10-18', '2026-10-18 03:32:16.177', '2026-10-18 03:26:46.591', '2026-10-18 03:32:22.53', NULL, NULL, NULL, NULL);
INSERT INTO public.albums VALUES (12, 8, 'ANHTRAISAYHI', 'anhtraisayhi-1792321662147', 'songs that evoke intense emotions', 'PUBLISHED', 'soundwave/albums/covers/user-8-album-cover-02816132-3f58-4dd0-bd86-45bbb9ea1999', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792321661/soundwave/albums/covers/user-8-album-cover-02816132-3f58-4dd0-bd86-45bbb9ea1999.png', '2026-10-18', '2026-10-18 04:08:58.693', '2026-10-18 04:07:42.148', '2026-10-18 04:09:04.696', NULL, NULL, NULL, NULL);
INSERT INTO public.albums VALUES (15, 10, 'Nhạc hay', 'nhac-hay-1793151460992', NULL, 'PUBLISHED', NULL, NULL, '2026-10-28', '2026-10-27 18:40:20.221', '2026-10-27 18:37:40.994', '2026-10-27 18:41:46.242', NULL, NULL, NULL, NULL);
INSERT INTO public.albums VALUES (16, 8, 'MRT', 'mrt-1793439786130', NULL, 'DRAFT', 'soundwave/albums/covers/user-8-album-cover-bf5eae17-996a-4b95-a465-a765438c608b', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793439719/soundwave/albums/covers/user-8-album-cover-bf5eae17-996a-4b95-a465-a765438c608b.png', '2026-10-31', NULL, '2026-10-31 02:43:06.135', '2026-10-31 02:43:06.135', NULL, NULL, NULL, NULL);


--
-- Data for Name: content_reports; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.email_verification_tokens VALUES (2, 4, '$2a$10$2LD9vOIvD0dyv1/uARCQDe23l09JcgNwDNTBRyxD0AM6.2ewsT6.S', '2026-10-09 06:25:51.459', '2026-10-09 06:16:20.48', '2026-10-09 06:15:51.459');
INSERT INTO public.email_verification_tokens VALUES (6, 5, '$2a$10$4ZCO4hPUKl0vRkFTK8BryepoCy4X/cP.S1uTBHtiakhKMtrH3Yj3u', '2026-10-09 10:21:02.907', NULL, '2026-10-09 10:11:02.907');
INSERT INTO public.email_verification_tokens VALUES (3, 5, '$2a$10$NaZZ3FWMF2gGj1RrL.wszum7iJ0GDizKWYslJ3ocieBX/biw8EBAG', '2026-10-09 06:32:11.848', '2026-10-09 10:11:02.779', '2026-10-09 06:22:11.849');


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.favorites VALUES (21, 10, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (25, 10, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (21, 8, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (24, 8, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (22, 7, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (25, 7, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (22, 6, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (22, 15, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (23, 13, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (25, 13, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (23, 11, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (23, 12, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (23, 26, '2026-10-13 15:04:04.013');
INSERT INTO public.favorites VALUES (6, 50, '2026-10-19 06:08:16.888');
INSERT INTO public.favorites VALUES (6, 49, '2026-10-20 00:31:39.379');
INSERT INTO public.favorites VALUES (6, 56, '2026-10-25 10:54:56.412');


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.genres VALUES (1, 'Pop', 'pop', 'Bright, catchy, and popular melodies.', true, NULL, '2026-10-09 13:32:34.754', '2026-10-09 13:32:34.754');
INSERT INTO public.genres VALUES (2, 'Ballad', 'ballad', 'Gentle, heartfelt songs rich in emotion.', true, NULL, '2026-10-09 13:32:34.82', '2026-10-09 13:32:34.82');
INSERT INTO public.genres VALUES (3, 'Rap / Hip-hop', 'rap-hip-hop', 'Energetic beats with honest, expressive lyrics.', true, NULL, '2026-10-09 13:32:34.862', '2026-10-09 13:32:34.862');
INSERT INTO public.genres VALUES (4, 'R&B', 'rnb', 'Smooth, warm, and soulful melodies.', true, NULL, '2026-10-09 13:32:34.913', '2026-10-09 13:32:34.913');
INSERT INTO public.genres VALUES (6, 'EDM', 'edm', 'High-energy modern electronic music.', true, NULL, '2026-10-09 13:32:35.002', '2026-10-09 13:32:35.002');
INSERT INTO public.genres VALUES (7, 'Indie', 'indie', 'Independent music with a free and distinctive spirit.', true, NULL, '2026-10-09 13:32:35.053', '2026-10-09 13:32:35.053');
INSERT INTO public.genres VALUES (8, 'Lofi', 'lofi', 'Relaxing sounds for studying and working.', true, NULL, '2026-10-09 13:32:35.1', '2026-10-09 13:32:35.1');
INSERT INTO public.genres VALUES (5, 'Acoustic', 'acoustic', 'Natural sounds from acoustic guitar and piano.', true, NULL, '2026-10-09 13:32:34.958', '2026-10-22 10:53:33.789');
INSERT INTO public.genres VALUES (9, 'minh', 'minh', 'khvcdgi,', true, NULL, '2026-10-18 00:09:28.37', '2026-10-22 11:12:52.957');


--
-- Data for Name: listening_history; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.listening_history VALUES (1, 3, 13, 32003, false, '2026-10-09 10:22:27.498');
INSERT INTO public.listening_history VALUES (182, 10, 59, 0, false, '2026-10-27 18:35:26.23');
INSERT INTO public.listening_history VALUES (184, 10, 7, 30241, false, '2026-11-08 07:09:59.174');
INSERT INTO public.listening_history VALUES (4, 3, 6, 30223, false, '2026-10-09 10:28:22.265');
INSERT INTO public.listening_history VALUES (5, 3, 7, 30036, false, '2026-10-09 10:29:22.253');
INSERT INTO public.listening_history VALUES (6, 3, 8, 30242, false, '2026-10-09 10:30:22.565');
INSERT INTO public.listening_history VALUES (7, 3, 13, 30208, false, '2026-10-09 10:31:22.639');
INSERT INTO public.listening_history VALUES (8, 3, 8, 30230, false, '2026-10-09 10:40:32.528');
INSERT INTO public.listening_history VALUES (9, 3, 7, 30216, false, '2026-10-09 10:41:32.649');
INSERT INTO public.listening_history VALUES (10, 3, 9, 33100, false, '2026-10-09 10:41:46.223');
INSERT INTO public.listening_history VALUES (11, 3, 10, 181900, false, '2026-10-09 10:42:26.819');
INSERT INTO public.listening_history VALUES (12, 3, 8, 30189, false, '2026-10-09 20:12:53.993');
INSERT INTO public.listening_history VALUES (13, 3, 10, 30026, false, '2026-10-09 20:16:40.613');
INSERT INTO public.listening_history VALUES (14, 3, 9, 30168, false, '2026-10-09 20:22:48.903');
INSERT INTO public.listening_history VALUES (15, 8, 8, 30097, false, '2026-10-09 23:00:14.139');
INSERT INTO public.listening_history VALUES (16, 3, 6, 30090, false, '2026-10-10 06:06:47.875');
INSERT INTO public.listening_history VALUES (17, 3, 13, 30218, false, '2026-10-10 07:08:06.96');
INSERT INTO public.listening_history VALUES (18, 3, 11, 30006, false, '2026-10-10 07:10:26.485');
INSERT INTO public.listening_history VALUES (19, 3, 6, 30026, false, '2026-10-10 07:11:17.173');
INSERT INTO public.listening_history VALUES (20, 3, 12, 30061, false, '2026-10-10 07:15:04.364');
INSERT INTO public.listening_history VALUES (26, 3, 10, 30254, false, '2026-10-10 07:24:12.262');
INSERT INTO public.listening_history VALUES (27, 3, 7, 30003, false, '2026-10-10 22:26:36.531');
INSERT INTO public.listening_history VALUES (28, 3, 10, 30244, false, '2026-10-10 22:30:19.271');
INSERT INTO public.listening_history VALUES (29, 3, 15, 30217, false, '2026-10-11 05:50:33.562');
INSERT INTO public.listening_history VALUES (30, 3, 16, 52200, false, '2026-10-11 06:00:47.278');
INSERT INTO public.listening_history VALUES (32, 3, 16, 138500, false, '2026-10-11 06:11:34.861');
INSERT INTO public.listening_history VALUES (33, 3, 16, 30600, false, '2026-10-11 06:28:04.637');
INSERT INTO public.listening_history VALUES (35, 3, 6, 30205, false, '2026-10-13 03:39:18.012');
INSERT INTO public.listening_history VALUES (37, 3, 13, 30208, false, '2026-10-13 06:51:40.471');
INSERT INTO public.listening_history VALUES (43, 9, 26, 30178, false, '2026-10-13 07:21:02.875');
INSERT INTO public.listening_history VALUES (44, 9, 16, 30195, false, '2026-10-13 07:26:37.232');
INSERT INTO public.listening_history VALUES (45, 9, 26, 30217, false, '2026-10-13 07:27:17.76');
INSERT INTO public.listening_history VALUES (48, 21, 10, 230000, true, '2026-10-13 13:04:04.013');
INSERT INTO public.listening_history VALUES (49, 25, 10, 230000, true, '2026-10-13 10:04:04.013');
INSERT INTO public.listening_history VALUES (50, 22, 7, 210000, true, '2026-10-13 14:04:04.013');
INSERT INTO public.listening_history VALUES (51, 25, 7, 210000, true, '2026-10-13 09:04:04.013');
INSERT INTO public.listening_history VALUES (52, 23, 13, 260000, true, '2026-10-13 12:04:04.013');
INSERT INTO public.listening_history VALUES (53, 23, 11, 180000, true, '2026-10-13 08:04:04.013');
INSERT INTO public.listening_history VALUES (56, 15, 12, 124808, false, '2026-10-13 08:11:07.132');
INSERT INTO public.listening_history VALUES (57, 15, 7, 30227, false, '2026-10-13 08:13:36.778');
INSERT INTO public.listening_history VALUES (58, 10, 7, 30239, false, '2026-10-14 01:42:38.176');
INSERT INTO public.listening_history VALUES (59, 10, 26, 32800, false, '2026-10-14 01:43:30.72');
INSERT INTO public.listening_history VALUES (60, 9, 34, 30199, false, '2026-10-15 14:56:04.703');
INSERT INTO public.listening_history VALUES (61, 9, 38, 30086, false, '2026-10-15 15:05:14.562');
INSERT INTO public.listening_history VALUES (62, 9, 36, 30203, false, '2026-10-15 15:09:43.248');
INSERT INTO public.listening_history VALUES (63, 9, 34, 30197, false, '2026-10-15 15:12:38.217');
INSERT INTO public.listening_history VALUES (64, 9, 38, 30203, false, '2026-10-15 15:17:11.624');
INSERT INTO public.listening_history VALUES (65, 9, 36, 30202, false, '2026-10-15 15:21:40.284');
INSERT INTO public.listening_history VALUES (66, 9, 34, 30218, false, '2026-10-15 15:24:35.295');
INSERT INTO public.listening_history VALUES (67, 9, 38, 30245, false, '2026-10-15 15:29:08.614');
INSERT INTO public.listening_history VALUES (85, 10, 12, 30032, false, '2026-10-18 01:19:31.054');
INSERT INTO public.listening_history VALUES (86, 10, 7, 30022, false, '2026-10-18 01:23:34.981');
INSERT INTO public.listening_history VALUES (87, 10, 11, 30000, false, '2026-10-18 01:26:56.861');
INSERT INTO public.listening_history VALUES (90, 10, 12, 30030, false, '2026-10-18 01:40:47.14');
INSERT INTO public.listening_history VALUES (91, 10, 7, 30255, false, '2026-10-18 01:44:51.327');
INSERT INTO public.listening_history VALUES (92, 10, 11, 30243, false, '2026-10-18 01:48:13.07');
INSERT INTO public.listening_history VALUES (95, 10, 12, 30258, false, '2026-10-18 02:02:03.284');
INSERT INTO public.listening_history VALUES (96, 10, 7, 30001, false, '2026-10-18 02:06:07.088');
INSERT INTO public.listening_history VALUES (97, 10, 11, 30249, false, '2026-10-18 02:09:29.104');
INSERT INTO public.listening_history VALUES (100, 10, 12, 30062, false, '2026-10-18 02:23:19.175');
INSERT INTO public.listening_history VALUES (101, 10, 7, 30011, false, '2026-10-18 02:27:23.037');
INSERT INTO public.listening_history VALUES (102, 10, 11, 30257, false, '2026-10-18 02:30:45.092');
INSERT INTO public.listening_history VALUES (105, 10, 12, 30251, false, '2026-10-18 02:44:35.25');
INSERT INTO public.listening_history VALUES (106, 10, 7, 30253, false, '2026-10-18 02:48:39.218');
INSERT INTO public.listening_history VALUES (107, 9, 38, 30015, false, '2026-10-18 02:49:23.992');
INSERT INTO public.listening_history VALUES (108, 10, 11, 30228, false, '2026-10-18 02:52:00.984');
INSERT INTO public.listening_history VALUES (109, 9, 36, 30204, false, '2026-10-18 02:53:52.858');
INSERT INTO public.listening_history VALUES (111, 9, 34, 30212, false, '2026-10-18 02:56:48.026');
INSERT INTO public.listening_history VALUES (112, 9, 34, 156383, false, '2026-10-18 02:58:54.36');
INSERT INTO public.listening_history VALUES (113, 9, 34, 171273, false, '2026-10-18 02:59:09.042');
INSERT INTO public.listening_history VALUES (115, 9, 26, 30209, false, '2026-10-18 03:01:21.448');
INSERT INTO public.listening_history VALUES (116, 10, 12, 30269, false, '2026-10-18 03:05:51.303');
INSERT INTO public.listening_history VALUES (117, 9, 38, 30225, false, '2026-10-18 03:06:45.74');
INSERT INTO public.listening_history VALUES (118, 10, 7, 30252, false, '2026-10-18 03:09:55.231');
INSERT INTO public.listening_history VALUES (119, 9, 36, 30208, false, '2026-10-18 03:11:14.369');
INSERT INTO public.listening_history VALUES (120, 10, 11, 30252, false, '2026-10-18 03:13:17.001');
INSERT INTO public.listening_history VALUES (121, 9, 34, 30208, false, '2026-10-18 03:14:09.358');
INSERT INTO public.listening_history VALUES (123, 9, 26, 30233, false, '2026-10-18 03:18:42.749');
INSERT INTO public.listening_history VALUES (125, 9, 38, 30258, false, '2026-10-18 03:24:17.17');
INSERT INTO public.listening_history VALUES (126, 10, 12, 30249, false, '2026-10-18 03:27:07.315');
INSERT INTO public.listening_history VALUES (127, 9, 36, 30044, false, '2026-10-18 03:28:46.692');
INSERT INTO public.listening_history VALUES (128, 10, 7, 30241, false, '2026-10-18 03:31:11.379');
INSERT INTO public.listening_history VALUES (129, 10, 11, 30240, false, '2026-10-18 03:34:33.087');
INSERT INTO public.listening_history VALUES (130, 9, 38, 30027, false, '2026-10-18 03:38:39.225');
INSERT INTO public.listening_history VALUES (133, 10, 12, 30227, false, '2026-10-18 03:48:23.589');
INSERT INTO public.listening_history VALUES (134, 10, 7, 30250, false, '2026-10-18 03:52:27.423');
INSERT INTO public.listening_history VALUES (135, 10, 11, 30243, false, '2026-10-18 03:55:49.001');
INSERT INTO public.listening_history VALUES (138, 9, 36, 30213, false, '2026-10-18 04:07:32.77');
INSERT INTO public.listening_history VALUES (139, 10, 12, 30027, false, '2026-10-18 04:09:39.258');
INSERT INTO public.listening_history VALUES (140, 10, 7, 30008, false, '2026-10-18 04:13:42.978');
INSERT INTO public.listening_history VALUES (141, 10, 11, 30036, false, '2026-10-18 04:17:04.855');
INSERT INTO public.listening_history VALUES (143, 9, 50, 30165, false, '2026-10-18 04:23:36.843');
INSERT INTO public.listening_history VALUES (145, 10, 12, 30254, false, '2026-10-18 04:30:55.339');
INSERT INTO public.listening_history VALUES (146, 10, 7, 30258, false, '2026-10-18 04:34:59.281');
INSERT INTO public.listening_history VALUES (147, 10, 11, 30002, false, '2026-10-18 04:38:20.833');
INSERT INTO public.listening_history VALUES (148, 9, 50, 55500, false, '2026-10-18 04:40:12.439');
INSERT INTO public.listening_history VALUES (185, 10, 10, 30078, false, '2026-11-08 07:11:07.718');
INSERT INTO public.listening_history VALUES (186, 10, 13, 30035, false, '2026-11-08 07:15:46.106');
INSERT INTO public.listening_history VALUES (151, 10, 12, 30258, false, '2026-10-18 04:52:11.409');
INSERT INTO public.listening_history VALUES (152, 10, 7, 30245, false, '2026-10-18 04:56:15.312');
INSERT INTO public.listening_history VALUES (153, 10, 11, 30260, false, '2026-10-18 04:59:37.114');
INSERT INTO public.listening_history VALUES (156, 10, 12, 30253, false, '2026-10-18 05:13:27.323');
INSERT INTO public.listening_history VALUES (157, 10, 7, 30013, false, '2026-10-18 05:17:31.016');
INSERT INTO public.listening_history VALUES (158, 10, 11, 30256, false, '2026-10-18 05:20:53.028');
INSERT INTO public.listening_history VALUES (161, 10, 12, 30028, false, '2026-10-18 05:34:43.116');
INSERT INTO public.listening_history VALUES (162, 10, 7, 30228, false, '2026-10-18 05:38:47.264');
INSERT INTO public.listening_history VALUES (166, 6, 47, 30006, false, '2026-10-18 08:21:18.537');
INSERT INTO public.listening_history VALUES (168, 10, 12, 30041, false, '2026-10-22 10:37:02.687');
INSERT INTO public.listening_history VALUES (170, 9, 56, 31043, false, '2026-10-23 02:30:41.825');
INSERT INTO public.listening_history VALUES (171, 9, 58, 30021, false, '2026-10-23 04:02:56.38');
INSERT INTO public.listening_history VALUES (180, 6, 13, 0, false, '2026-10-25 10:54:36.798');
INSERT INTO public.listening_history VALUES (167, 6, 56, 0, false, '2026-10-25 10:54:56.998');
INSERT INTO public.listening_history VALUES (160, 10, 13, 0, false, '2026-10-27 18:47:49.724');
INSERT INTO public.listening_history VALUES (175, 6, 45, 0, false, '2026-10-23 04:50:12.129');
INSERT INTO public.listening_history VALUES (174, 6, 38, 0, false, '2026-10-23 04:50:43.834');
INSERT INTO public.listening_history VALUES (169, 10, 10, 0, false, '2026-10-31 02:11:18.799');
INSERT INTO public.listening_history VALUES (165, 6, 7, 0, false, '2026-10-23 05:25:52.348');
INSERT INTO public.listening_history VALUES (178, 6, 11, 0, false, '2026-10-23 05:25:52.66');
INSERT INTO public.listening_history VALUES (164, 6, 6, 0, false, '2026-10-23 05:38:57.864');
INSERT INTO public.listening_history VALUES (179, 6, 12, 0, false, '2026-10-23 06:31:01.878');
INSERT INTO public.listening_history VALUES (177, 6, 9, 0, false, '2026-10-23 10:09:37.204');
INSERT INTO public.listening_history VALUES (176, 6, 8, 0, false, '2026-10-23 10:11:09.608');
INSERT INTO public.listening_history VALUES (181, 6, 15, 0, false, '2026-10-23 10:11:34.242');
INSERT INTO public.listening_history VALUES (173, 6, 50, 0, false, '2026-10-25 10:42:28.454');
INSERT INTO public.listening_history VALUES (172, 6, 49, 0, false, '2026-10-25 10:42:29.776');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notifications VALUES (1, 8, 'TRACK_REJECTED', 'Track Needs Revision', 'Your track "SECRET" was not approved. Reason: Audio file corrupted or encoding does not meet platform standards.', '/creator/tracks/20/rejection', NULL, '2026-10-11 12:24:39.366', NULL, NULL, NULL, false, NULL);
INSERT INTO public.notifications VALUES (2, 8, 'TRACK_REJECTED', 'Track Needs Revision', 'Your track "TOP 1" was not approved. Reason: Unlicensed sample, beat, or suspected copyright infringement.', '/creator/tracks/19/rejection', NULL, '2026-10-11 12:31:14.483', NULL, NULL, NULL, false, NULL);
INSERT INTO public.notifications VALUES (78, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Raindance" has been submitted for moderation.', NULL, NULL, '2026-10-23 10:53:54.321', 7, '56', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (83, 7, 'TRACK_APPROVED', 'Track approved', 'Your track "Raindance" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-23 11:01:15.688', 2, '58', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (86, 8, 'TRACK_REJECTED', 'Revision requested', '"SAU HÌNH BÓNG ẤY" needs revision: Incomplete or placeholder metadata (title, artist or artwork).', NULL, NULL, '2026-10-23 12:44:15.154', 2, '23', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (90, 8, 'TRACK_APPROVED', 'Track approved', 'Your track "TOP1" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-23 13:12:06.403', 2, '59', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (91, NULL, 'TRACK_SUBMISSION', 'Track re-moderation required', 'Track "In Love" has been updated and queued for re-moderation.', NULL, NULL, '2026-10-24 10:27:56.036', 9, '59', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (79, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Raindance" has been submitted for moderation.', NULL, NULL, '2026-10-23 10:53:54.359', 7, '56', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (92, NULL, 'TRACK_SUBMISSION', 'Track re-moderation required', 'Track "In Love" has been updated and queued for re-moderation.', NULL, NULL, '2026-10-24 10:27:56.078', 9, '59', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (97, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "TOP1" has been submitted for moderation.', NULL, NULL, '2026-10-24 17:02:14.204', 9, '61', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (96, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "TOP1" has been submitted for moderation.', NULL, NULL, '2026-10-24 17:02:14.163', 9, '61', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (16, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "Không Buông" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-15 21:42:46.348', 2, '36', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (103, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "In Love" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-24 17:20:23.819', 2, '61', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (104, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "TOP1" has been submitted for moderation.', NULL, NULL, '2026-10-27 16:16:09.286', 8, '64', 'SUBMISSION', false, 2);
INSERT INTO public.notifications VALUES (105, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "TOP1" has been submitted for moderation.', NULL, NULL, '2026-10-27 16:16:09.345', 8, '64', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (19, 9, 'TRACK_REJECTED', 'Revision requested', '"3017-2" needs revision: test notification', NULL, NULL, '2026-10-15 21:53:24.698', 2, '38', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (106, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Nơi Này Có Anh" has been submitted for moderation.', NULL, NULL, '2026-10-28 01:23:20.913', 10, '65', 'SUBMISSION', false, 2);
INSERT INTO public.notifications VALUES (107, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Nơi Này Có Anh" has been submitted for moderation.', NULL, NULL, '2026-10-28 01:23:20.966', 10, '65', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (110, 10, 'TRACK_REJECTED', 'Revision requested', '"Nơi Này Có Anh" needs revision: không hayy', NULL, NULL, '2026-10-28 01:41:24.224', 2, '65', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (22, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "3017-2" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-15 21:54:49.226', 2, '38', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (34, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "Cho tui đi theo" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-18 08:46:40.266', 2, '40', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (10, 7, 'TRACK_APPROVED', 'Track approved', 'Your track "MẮT MÔI TAY CHÂN" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-15 21:28:32.504', 2, '33', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (29, 9, 'TRACK_REJECTED', 'Revision requested', '"Cho tui đi theo" needs revision: Audio clipping or severe distortion detected in master stream.', NULL, NULL, '2026-10-18 08:29:44.965', 2, '40', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (44, 9, 'TRACK_REJECTED', 'Revision requested', '"Phải lòng" needs revision: Audio file corrupted or encoding does not meet platform standards.', NULL, NULL, '2026-10-18 10:08:52.896', 2, '43', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (41, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "Phải lòng" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-18 10:05:06.666', 2, '42', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (48, 8, 'TRACK_APPROVED', 'Track approved', 'Your track "LAVIEM" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-18 10:32:22.388', 2, '45', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (50, 8, 'TRACK_APPROVED', 'Track approved', 'Your track "LAVIEM" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-18 11:09:04.554', 2, '47', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (57, 8, 'TRACK_REJECTED', 'Revision requested', '"TOP 1" needs revision: Audio file corrupted or encoding does not meet platform standards.', NULL, NULL, '2026-10-18 11:16:33.074', 2, '48', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (55, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "Buông" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-18 11:13:33.091', 2, '50', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (56, 8, 'TRACK_APPROVED', 'Track approved', 'Your track "TOP 1" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-18 11:15:47.358', 2, '46', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (58, 8, 'TRACK_APPROVED', 'Track approved', 'Your track "SECRET" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-18 11:27:43.751', 2, '49', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (59, 9, 'TRACK_REJECTED', 'Revision requested', '"TOP1" needs revision: Audio file corrupted or encoding does not meet platform standards.', NULL, NULL, '2026-10-18 11:46:25.332', 2, '53', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (60, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "SECRET" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-18 11:46:53.865', 2, '52', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (61, 9, 'TRACK_REJECTED', 'Revision requested', '"THEGIOICUAANH" needs revision: Audio clipping or severe distortion detected in master stream.', NULL, NULL, '2026-10-18 11:55:10.824', 2, '54', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (62, 9, 'TRACK_REJECTED', 'Revision requested', '"SECRET" needs revision: Audio file corrupted or encoding does not meet platform standards.', NULL, NULL, '2026-10-18 11:55:28.346', 2, '55', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (80, 7, 'TRACK_REJECTED', 'Revision requested', '"Raindance" needs revision: Description kì cục quá', NULL, NULL, '2026-10-23 10:55:31.341', 2, '58', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (66, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "LAVIEM" has been submitted for moderation.', NULL, NULL, '2026-10-19 01:45:20.093', 9, '54', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (84, 8, 'TRACK_APPROVED', 'Track approved', 'Your track "Thế Giới Của Anh" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-23 12:26:05.005', 2, '21', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (87, 8, 'TRACK_REJECTED', 'Revision requested', '"MRT" needs revision: Audio file corrupted or encoding does not meet platform standards.', NULL, NULL, '2026-10-23 12:45:52.614', 2, '22', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (67, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "LAVIEM" has been submitted for moderation.', NULL, NULL, '2026-10-19 01:45:20.153', 9, '54', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (93, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "In Love" has been submitted for moderation.', NULL, NULL, '2026-10-24 10:45:47.981', 9, '60', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (68, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "LAVIEM" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-19 01:46:26.854', 2, '56', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (94, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "In Love" has been submitted for moderation.', NULL, NULL, '2026-10-24 10:45:48.014', 9, '60', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (26, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "3017-2" has been submitted for moderation.', NULL, NULL, '2026-10-18 08:20:15.235', 9, '35', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (12, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Không Buông" has been submitted for moderation.', NULL, NULL, '2026-10-15 21:41:31.417', 9, '31', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (14, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Không Buông" has been submitted for moderation.', NULL, NULL, '2026-10-15 21:42:12.51', 9, '32', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (15, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Không Buông" has been submitted for moderation.', NULL, NULL, '2026-10-15 21:42:12.536', 9, '32', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (13, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Không Buông" has been submitted for moderation.', NULL, NULL, '2026-10-15 21:41:31.444', 9, '31', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (17, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "3017-2" has been submitted for moderation.', NULL, NULL, '2026-10-15 21:52:45.901', 9, '33', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (18, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "3017-2" has been submitted for moderation.', NULL, NULL, '2026-10-15 21:52:45.926', 9, '33', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (20, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "3017-2" has been submitted for moderation.', NULL, NULL, '2026-10-15 21:54:23.094', 9, '34', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (21, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "3017-2" has been submitted for moderation.', NULL, NULL, '2026-10-15 21:54:23.122', 9, '34', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (25, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "3017-2" has been submitted for moderation.', NULL, NULL, '2026-10-18 08:20:15.138', 9, '35', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (27, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Cho tui đi theo" has been submitted for moderation.', NULL, NULL, '2026-10-18 08:28:25.523', 9, '36', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (30, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Cho tui đi theo" has been submitted for moderation.', NULL, NULL, '2026-10-18 08:33:39.687', 9, '37', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (32, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 08:37:31.66', 9, '38', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (37, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 10:03:27.874', 9, '39', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (39, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 10:04:24.12', 9, '40', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (42, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 10:08:20.381', 9, '41', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (28, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Cho tui đi theo" has been submitted for moderation.', NULL, NULL, '2026-10-18 08:28:25.577', 9, '36', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (31, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Cho tui đi theo" has been submitted for moderation.', NULL, NULL, '2026-10-18 08:33:39.737', 9, '37', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (33, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 08:37:31.702', 9, '38', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (38, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 10:03:27.919', 9, '39', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (40, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 10:04:24.169', 9, '40', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (43, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 10:08:20.431', 9, '41', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (99, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-24 17:02:52.02', 9, '62', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (100, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "Phải lòng" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-24 17:03:11.954', 2, '44', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (98, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-24 17:02:51.985', 9, '62', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (108, 10, 'TRACK_APPROVED', 'Track approved', 'Your track "Nơi Này Có Anh" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-28 01:31:34.518', 2, '64', 'TRACK', false, NULL);
INSERT INTO public.notifications VALUES (53, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Buông" has been submitted for moderation.', NULL, NULL, '2026-10-18 11:12:16.07', 9, '49', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (46, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 10:19:43.628', 9, '42', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (51, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Buông" has been submitted for moderation.', NULL, NULL, '2026-10-18 11:11:02.648', 9, '48', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (81, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Raindance" has been submitted for moderation.', NULL, NULL, '2026-10-23 11:00:39.465', 7, '57', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (85, 9, 'TRACK_REJECTED', 'Revision requested', '"Phải lòng" needs revision: Incomplete or placeholder metadata (title, artist or artwork). These', NULL, NULL, '2026-10-23 12:27:53.141', 2, '44', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (88, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "TOP1" has been submitted for moderation.', NULL, NULL, '2026-10-23 13:11:25.378', 8, '58', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (82, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Raindance" has been submitted for moderation.', NULL, NULL, '2026-10-23 11:00:39.504', 7, '57', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (89, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "TOP1" has been submitted for moderation.', NULL, NULL, '2026-10-23 13:11:25.427', 8, '58', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (95, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "In Love" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-24 10:46:23.184', 2, '56', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (75, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Blue" has been submitted for moderation.', NULL, NULL, '2026-10-23 10:44:32.862', 9, '55', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (47, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Phải lòng" has been submitted for moderation.', NULL, NULL, '2026-10-18 10:19:43.682', 9, '42', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (52, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Buông" has been submitted for moderation.', NULL, NULL, '2026-10-18 11:11:02.868', 9, '48', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (54, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Buông" has been submitted for moderation.', NULL, NULL, '2026-10-18 11:12:16.122', 9, '49', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (76, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "Blue" has been submitted for moderation.', NULL, NULL, '2026-10-23 10:44:32.947', 9, '55', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (77, 9, 'TRACK_APPROVED', 'Track approved', 'Your track "Blue" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-23 10:46:08.437', 2, '57', 'TRACK', true, NULL);
INSERT INTO public.notifications VALUES (102, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "In Love" has been submitted for moderation.', NULL, NULL, '2026-10-24 17:19:46.216', 9, '63', 'SUBMISSION', false, 1);
INSERT INTO public.notifications VALUES (101, NULL, 'TRACK_SUBMISSION', 'New submission for review', 'Track "In Love" has been submitted for moderation.', NULL, NULL, '2026-10-24 17:19:46.181', 9, '63', 'SUBMISSION', true, 2);
INSERT INTO public.notifications VALUES (109, 10, 'TRACK_APPROVED', 'Track approved', 'Your track "Nơi Này Có Anh 2" has been approved and is now available in the public catalog.', NULL, NULL, '2026-10-28 01:40:20.407', 2, '66', 'TRACK', false, NULL);


--
-- Data for Name: official_lyrics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.official_lyrics VALUES (1, 49, '[Intro]
[00:00] (Nhạc dạo đầu)
[Verse 1: CONGB & Cody Nam Võ]
[00:15] Kể từ khi gặp em, trí nhớ hơi bị kém
[00:19] Những món ăn thân quen sao nay bỗng dưng chẳng thèm?
[00:22] Dù bụng đói cồn cào, lại chẳng thể nói lời nào
[00:26] Vì gu em không thích người quá cao
[00:30] Mà anh chẳng hề cao, tính nóng hơi bị láo
[00:33] Nói những câu tào lao khi em nói câu xin chào
[00:37] Vậy thì theo anh đến một nơi, không có biển khơi
[00:41] Chỉ có vườn với trái cây mà thôi
[Pre-Chorus: Quang Hùng MasterD]
[00:44] Vườn anh có trái dưa, trái dâu, trái thơm, trái nho, có luôn banana
[00:50] Nhưng thiếu đi trái tim của một người
[00:53] Lòng anh như gió đông giữa trời đêm
[00:55] Mong thấy em khi bình minh lên, oh-hoh
[Chorus: Cody Nam Võ & Quang Hùng MasterD]
[00:57] Tình đầu ngây thơ mà em, đúng không?
[01:01] Còn chưa nắm tay, chưa về tới phòng
[01:04] Mình còn trông ngóng biết nhiều về nhau
[01:07] Đêm đến ta lại ngắm sao, làm sao mở lòng?
[01:12] Chẳng phải em muốn được anh ghé tai?
[01:15] Thầm thì vài câu suốt bao đêm dài
[01:19] Trời cao có thấu nỗi lòng tận mây xanh?
[01:22] Nói em nghe bí mật của anh!
[Rap Verse: Wren Evans]
[01:26] Nói hết bí mật thì có yêu không?
[01:30] Muốn thấy bí mật hay em muốn nghe bằng lời nói?
[01:34] Đến đây với anh, trăm nghe không bằng một lần thấy
[01:37] Ai rồi cũng phải yêu rồi đấy, baby, ooh-ooh
[01:41] Phải làm sao để gặp my baby?
[01:44] Muốn yêu em chân thành vì anh đâu muốn yêu theo phong trào mà bae
[01:48] Em quen anh chân thành, làm một bộ phim hai ta đóng vai người yêu
[01:52] Rất muốn ai đó có thể nói ra hết sự thật
[01:54] Rằng anh thương em rất nhiều
[01:56] Giờ này nếu thắc mắc em qua bên...
[Bridge: Cody Nam Võ, CONGB & Quang Hùng MasterD]
[02:00] ("Baby à, anh đã nói là em trao cho anh trái tim, sao lại là trái bơ đó hả? Thôi CONGB dô!")
[02:08] Vậy người có muốn mình tay nắm tay?
[02:12] Tình anh đã trao không cần giãi bày
[02:15] Nụ cười em sáng hơn mặt trăng đang lên
[02:19] Chiếu sâu vào trái tim, anh không đỡ được
[02:23] Tặng nàng bài thơ dù không có hay
[02:26] Chỉ mong em hiểu lấy tâm tư này
[02:30] Trời cao có thấu nỗi lòng tận mây xanh?
[02:34] Nói em nghe bí mật của anh!
(Tone nâng nửa cung)

[Chorus: Wren Evans & Cody Nam Võ]
[02:38] Tình đầu ngây thơ mà em, đúng không?
[02:41] Còn chưa nắm tay, chưa về tới phòng
[02:45] Mình còn trông ngóng biết nhiều về nhau
[02:48] Đêm đến ta lại ngắm sao, làm sao mở lòng?
[02:52] Chẳng phải em muốn được anh ghé tai?
[02:56] Thầm thì vài câu suốt bao đêm dài
[03:00] Trời cao có thấu nỗi lòng tận mây xanh?
[03:04] Nói em nghe bí mật của anh!
[Outro]
[03:08] Bí mật của anh...
[03:12] Nói em nghe bí mật của anh...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (2, 59, '[00:10.00] Anh thường hay thức khuya
[00:11.00] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.00] Rằng phải làm sao?
[00:15.00] Cũng chẳng biết đến bao giờ?
[00:20.00] Những lời ca dở dang
[00:21.00] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.00] Chạy theo đằng sau ánh sáng
[00:27.00] Cuối nơi chân trời.
[00:29.00] Rồi em đến đây dịu dàng cạnh bên anh
[00:33.00] Cơn mưa rơi trở nên long lanh
[00:35.00] Chẳng còn đợi trông
[00:37.00] Vì giấc mơ có em thêm màu xanh
[00:40.00] Thật lòng chẳng xa xôi
[00:43.00] Ước muốn anh ở ngay đây thôi
[00:45.00] Anh không bận tâm nữa
[00:47.00] Vì anh có em.
[00:50.00] Nếu như ngày mai không diễn ra
[00:52.00] Giống cách mà anh cứ luôn mơ mộng?
[00:55.00] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.00] Dặn lòng phải xứng đáng hơn
[01:05.00] Để anh trở thành chàng trai
[01:07.00] Top 1 trong mắt em.
[01:13.00] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15.00] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17.00] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.00] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.00] Bầu trời đêm okay cho nên không sao
[01:23.00] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.00] Dù cho phải gặp bao nhiêu gian khó
[01:28.00] Vẫn luôn là em dõi theo anh
[01:31.00] Dù anh đi đến đâu...
[01:45.00] Nếu như ngày mai không diễn ra
[01:47.00] Giống cách mà anh cứ luôn mơ mộng?
[01:50.00] Thì vẫn có một người luôn phía sau
[01:53.00] Nhẹ nắm tay anh
[01:55.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:58.00] Dặn lòng phải xứng đáng hơn
[02:00.00] Để anh trở thành chàng trai
[02:02.00] Top 1 trong mắt em.
[02:08.00] Những cơ hội vụt qua đôi tay
[02:11.00] Vậy chắc chưa phải là ngày hôm nay
[02:14.00] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17.00] Từng câu nói mà anh vẫn luôn tin vào.
[02:20.00] Có những lần đôi mắt anh lạc phương hướng
[02:23.00] Để rồi đêm tối anh không về nhà
[02:26.00] Thì vẫn luôn là em
[02:28.00] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:30.00] Nếu như ngày mai không diễn ra
[02:32.00] Giống cách mà anh cứ luôn mơ mộng
[02:35.00] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40.00] Biết còn nhiều điều lo lắng đang vây quanh
[02:43.00] Dặn lòng phải xứng đáng hơn
[02:45.00] Để anh trở thành chàng trai
[02:48.00] Top 1 trong mắt em...
[02:53.00] Top 1 trong mắt em.
[Verse 1]
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Chorus & Outro]', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (3, 48, '[Verse 1]
[00:10] Anh thường hay thức khuya
[00:11] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14] Rằng phải làm sao?
[00:15] Cũng chẳng biết đến bao giờ?
[00:20] Những lời ca dở dang
[00:21] Anh ngồi viết mãi vẫn còn chưa xong
[00:24] Chạy theo đằng sau ánh sáng
[00:27] Cuối nơi chân trời.
[00:29] Rồi em đến đây dịu dàng cạnh bên anh
[00:33] Cơn mưa rơi trở nên long lanh
[00:35] Chẳng còn đợi trông
[00:37] Vì giấc mơ có em thêm màu xanh
[00:40] Thật lòng chẳng xa xôi
[00:43] Ước muốn anh ở ngay đây thôi
[00:45] Anh không bận tâm nữa
[00:47] Vì anh có em.
[Chorus]
[00:50] Nếu như ngày mai không diễn ra
[00:52] Giống cách mà anh cứ luôn mơ mộng?
[00:55] Thì vẫn có một người luôn phía sau
[00:58] Nhẹ nắm tay anh
[01:00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03] Dặn lòng phải xứng đáng hơn
[01:05] Để anh trở thành chàng trai
[01:07] Top 1 trong mắt em.
[Verse 2]
[01:13] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21] Bầu trời đêm okay cho nên không sao
[01:23] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26] Dù cho phải gặp bao nhiêu gian khó
[01:28] Vẫn luôn là em dõi theo anh
[01:31] Dù anh đi đến đâu...
[Chorus]
[01:45] Nếu như ngày mai không diễn ra
[01:47] Giống cách mà anh cứ luôn mơ mộng?
[01:50] Thì vẫn có một người luôn phía sau
[01:53] Nhẹ nắm tay anh
[01:55] Biết còn nhiều điều lo lắng đang vây quanh
[01:58] Dặn lòng phải xứng đáng hơn
[02:00] Để anh trở thành chàng trai
[02:02] Top 1 trong mắt em.
[Bridge]
[02:08] Những cơ hội vụt qua đôi tay
[02:11] Vậy chắc chưa phải là ngày hôm nay
[02:14] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17] Từng câu nói mà anh vẫn luôn tin vào.
[02:20] Có những lần đôi mắt anh lạc phương hướng
[02:23] Để rồi đêm tối anh không về nhà
[02:26] Thì vẫn luôn là em
[02:28] Ngọn đèn rực rỡ chiếu soi nơi anh...
[Chorus & Outro]
[02:30] Nếu như ngày mai không diễn ra
[02:32] Giống cách mà anh cứ luôn mơ mộng
[02:35] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40] Biết còn nhiều điều lo lắng đang vây quanh
[02:43] Dặn lòng phải xứng đáng hơn
[02:45] Để anh trở thành chàng trai
[02:48] Top 1 trong mắt em...
[02:53] Top 1 trong mắt em.', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (4, 47, '[00:02] Còn cần thiết nữa, nói chi đến đây cũng thừa
[00:04] Giờ chỉ còn mình với vấn vương (Rượu vang pha với cơn mưa)
[00:07] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:09] Biết sao hết cho vừa?
[00:11] Lòng nhau mới thấu đây em
[Chorus: CAPTAIN BOY & CoolKid]
[00:13] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[00:17] Rượu vang pha với cơn mưa
[00:20] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:22] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[00:26] Dệt hàng triệu vết thương, tự vùi mình trước gương
[00:30] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[00:33] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[00:37] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Verse 1: Pháp Kiều & CAPTAIN BOY]
[00:41] Ta chia tay, vì sao em ơi?
[00:44] Điều này anh muốn hỏi lâu rồi
[00:47] Những khung trời kỷ niệm vỡ đôi
[00:50] Có phải vì một câu anh đã lỡ lời?
[00:54] Sau đêm nay, tự ta cho ta
[00:57] Em và anh một đoạn kết mới
[01:00] Dù rằng mình còn yêu nhau rất nhiều đấy
[01:04] Nhưng để ở lại thì anh nghĩ là không
[Pre-Chorus: Quang Hùng MasterD]
[01:06] Và sau những cảm xúc nhất thời
[01:10] Người bên em giờ này chẳng còn là anh
[01:13] Gửi lại quá khứ cung đàn đã vỡ
[01:17] Vì những vấn vương ấy chưa kịp thành lời
[Chorus: Quang Hùng MasterD & CAPTAIN BOY]
[01:19] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[01:23] Rượu vang pha với cơn mưa
[01:26] Hàng trăm lý do cũng chẳng thể cứu vãn
[01:28] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[01:33] Dệt hàng triệu vết thương, tự vùi mình trước gương
[01:36] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[01:39] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[01:43] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Post-Chorus: Quang Hùng MasterD & CoolKid]
[01:46] Tất cả là tại vì em, em, em, em, em, e-em
[01:50] Người xa lạ anh từng quen
[01:53] Tất cả là tại vì em, em, em, em, em, e-em
[01:57] Kẻ ngốc đang say tình dưới ngọn đèn
[01:59] Tất cả là tại vì em, em, em, em, em, e-em
[02:03] Người xa lạ anh từng quen
[02:06] Tất cả là tại vì em, em, em, em, em, yeah-eh-eh
[02:10] Kẻ ngốc đang say tình dưới ngọn đèn
[Verse 2: Pháp Kiều]
[02:13] Lau đôi mi, đây là nước mắt hay mưa
[02:15] Buông đôi tay, anh đâu muốn phải dây dưa
[02:17] Quên đi đôi mắt ấy khi xưa, chẳng bên nhau được nữa
[02:20] Sau bao lần đau, anh lại cho đi và quên
[02:22] Anh ghét nỗi đau, cơn mưa đêm kia và em
[02:24] Ta vội quên rồi, những điều sao thật quen
[02:27] Để nỗi buồn kia gọi tên mỗi khi bài ca bật lên
[Pre-Chorus: CoolKid & Quang Hùng MasterD]
[02:28] Và sau những cảm xúc nhất thời
[02:30] Người bên em giờ này chẳng còn là anh
[02:33] Gửi lại quá khứ cung đàn đã vỡ
[02:37] Vì những vấn vương ấy chưa kịp thành lời
[Chorus: Cả nhóm]
[02:39] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[02:43] Rượu vang pha với cơn mưa
[02:45] Hàng trăm lý do cũng chẳng thể cứu vãn
[02:48] Biết sao hết cho vừa lòng nhau mới thấu đây em?
[02:52] Dệt hàng triệu vết thương, tự vùi mình trước gương
[02:56] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[03:03] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[03:07] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Outro]
[03:11] Tất cả là tại vì em...
[03:15] Người xa lạ anh từng quen...
[03:19] Tất cả là tại vì em...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (5, 29, '[00:30.01] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
[00:34.96] Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương (ngọt ngào trong sương)
[00:40.32] Ngắm em thật lâu, con tim anh yếu mềm
[00:45.10] Đắm say từ phút đó, từng giây trôi yêu thêm
[00:50.57] Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh (bộn bề nơi anh)
[00:55.84] Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh (bầu trời trong xanh)
[01:00.75] Liếc đôi hàng mi mong manh, anh thẫn thờ
[01:06.14] Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ
[01:11.50] Cầm tay anh (anh), dựa vai anh (anh)
[01:13.98] Kề bên anh, nơi này có anh', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (6, 58, '[00:18.00] Let''s get the party started
[00:20.00] See you at the bar, you was hardly talkin''
[00:22.00] That''s when I knew that your heart was scarrin''
[00:24.00] Friends to lovers, need a part to star in, like, "Wait, babe
[00:27.00] Let me ask your pardon
[00:29.00] This ain''t Gucci, this is Prada, darlin''
[00:31.00] If you want somethin'', you can ask me, darlin''"
[00:34.00] Then you started laughin'' ''cause you think I''m jokin''
[00:36.00] But lookin'' in your eyes is the best thing
[00:38.00] Brake lights givin'' you the red skin
[00:40.00] You was in a bad mood from we stepped in
[00:42.00] Though you checked out ''fore we even checked in
[00:44.00] On the phone you gon'' vent to your best friend
[00:46.00] The one who gave me the lecture, but I ain''t gon'' sweat you, babe
[00:49.00] I''ma let you catch up with your boy, undress you
[00:52.00] And let me tell you why I''ma bless you
[00:55.00] It''s the way my mind is fallin'' away
[00:59.00] In my heart, I know
[01:02.00] You feel the same when you''re with me
[01:05.00] You know I''m all you need
[01:07.00] You''re where I wanna be
[01:09.00] My darling, can''t you see?
[01:12.00] I love you
[01:16.00] I love you
[01:20.00] I love you
[01:24.00] I love you
[01:29.00] I love you
[01:31.00] Fell into you
[01:33.00] Say you want me in the mood
[01:35.00] Tryna hide my feelings for you
[01:37.00] Don''t wanna argue, not with you
[01:39.00] Tell me why you''re so in denial
[01:41.00] Hold me close, don''t tell me goodnight
[01:43.00] Are you down to get me?
[01:46.00] Tell me when you''re ready, I''m ready
[01:49.00] We can get into it or we can get intimate
[01:52.00] The shower when you sing in it
[01:53.00] Better than Beyoncé, I like the sound of fiancée
[01:56.00] You know it''s got a little ring to it
[01:58.00] And really when I think of it
[01:59.00] Growin'' up, I didn''t ever see marriages
[02:01.00] No weddings, no horse, no carriages
[02:03.00] I wanna do things different and change the narrative
[02:06.00] God knows you a wild child, beautiful child, I need your help
[02:09.00] Lookin'' like you come from the ''90s by yourself
[02:11.00] My mum sixty-one and her favourite line to tell her son is
[02:14.00] "Sometimes she wish that she had a girl"
[02:15.00] I wanna take you back to a time, back to a trip
[02:18.00] You had that white wine that I never got to sip
[02:20.00] And dinner wasn''t ruined ''cause you never got to pick
[02:22.00] I know that everybody told me that I''m sick ''cause
[02:24.00] It''s the way my mind is fallin'' away
[02:28.00] In my heart, I know
[02:30.00] You feel the same when you''re with me
[02:33.00] You know I''m all you need
[02:36.00] You''re where I wanna be
[02:38.00] My darling, can''t you see?
[02:41.00] I love you (Me and you, never let me go)
[02:45.00] (Me and you, I''ll tell you two times)
[02:47.00] I love you (Me and you, never let me go)
[02:50.00] (Me and you, tell me two times)
[02:52.00] I love you (Me and you, never let me go)
[02:54.00] (Me and you, tell me two times)
[02:56.00] I love you (Me and you, never let me go)
[02:58.00] (Me and you, tell me two times)
[03:00.00] I said lean with it, rock with it
[03:03.00] Your finger, I could put a rock in it
[03:05.00] Fin-finger, I could put a rock in it
[03:07.00] Bank card, they gon'' put a block in it
[03:09.00] Said rock with it, bounce with it
[03:12.00] The left wrist, I could put my house in it
[03:14.00] You wanna bet, babe? I could put my house in it
[03:16.00] Paper, I could put my spouse in it
[03:18.00] I said shimmy shimmy yay, shimmy
[03:20.00] Shimmy shimmy yah
[03:21.00] 5''9", brown eyes, and she in it, in it
[03:23.00] Shimmy shimmy yay, shimmy
[03:25.00] Shimmy shimmy yah
[03:26.00] 5''9", brown eyes, innit, innit
[03:28.00] Shimmy shimmy yay, shimmy
[03:30.00] Shimmy shimmy yah
[03:31.00] 5''9", brown eyes, and she in-in—
[03:33.00] Shimmy shimmy yay, shimmy
[03:34.00] Shimmy shimmy yah
[03:35.00] 5''9", brown eyes...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (7, 50, '[00:00.60] Từ giờ anh sẽ xóa đi hết kỉ niệm
[00:05.15] Anh sẽ quên hết thứ anh đã tin
[00:09.94] Chẳng để sót lại gì làm anh lưu luyến
[00:16.85] Anh chẳng còn sức để ôm vào lòng
[00:21.05] Hãy để mọi thứ trôi đi theo dòng
[00:25.50] Hãy cứ xem như chuyện mình chỉ là giấc mơ
[00:33.20] Cũng đã bao tháng trôi qua
[00:37.20] Mà anh cứ ngỡ chỉ mới hôm qua
[00:40.79] Có lẽ anh chỉ chực chờ hoài, rồi đếm giây trôi
[00:44.50] Xong cứ nghĩ mãi về đôi ta, oh
[00:48.50] Từng hứa sẽ quên em nhanh
[00:52.00] Mà dường như cơn mưa mãi không tạnh
[00:55.50] Nhìn em vui hạnh phúc bên ai rồi
[00:59.20] Mà sao tim anh chẳng đành?
[01:03.20] Từ giờ anh sẽ xóa đi hết kỷ niệm
[01:07.04] Anh sẽ quên hết thứ anh đã tin
[01:11.84] Chẳng để sót lại gì làm anh lưu luyến
[01:18.25] Anh chẳng còn sức để ôm vào lòng
[01:22.50] Hãy để mọi thứ trôi đi theo dòng
[01:27.00] Và cứ xem như chuyện mình chỉ là giấc mơ (chỉ là giấc mơ)
[01:34.00] Baby, anh nhận ra ta chưa từng chịu nghe nhau nói
[01:36.40] Cứ trách và móc để dần nỗi nhớ nhân đôi
[01:38.40] Không bận tâm rồi một ngày cơn giông tới
[01:40.59] Để nó cuốn đi hết, giờ thì hai đứa hai nơi
[01:42.70] Ta phí thời giờ với những lần tranh cãi
[01:44.70] Cũng chỉ để nhận lại dòng nước mắt tuôn rơi
[01:47.00] Rớt thành dòng, tích thành vùng biên hải
[01:49.00] Rồi lại đặt câu hỏi, "Sao tan nát em ơi?"
[01:51.20] Oh, ta thường sống như vậy mà
[01:53.20] Biết là bad vẫn cố chấp như vậy mà
[01:55.20] Nước mắt siết thành thác, tới khô khốc như vậy mà
[01:57.20] Tình mình hóa tan nát cũng vì ngu ngốc như vậy mà
[01:59.20] Oh, chỉ là vài lời cuối rồi anh hứa rằng mình sẽ cố quên đi em
[02:03.00] Nếu mai này em tìm được hạnh phúc, hãy chậm lại một chút để lắng nghe nhau thêm
[02:06.20] Anh đã cố để quên em nhanh
[02:09.80] Mà dường như cơn mưa mãi không tạnh
[02:13.19] Nhìn em vui hạnh phúc bên ai rồi
[02:17.00] Mà sao tim anh chẳng đành
[02:21.00] Từ giờ anh sẽ xóa đi hết kỷ niệm
[02:24.80] Anh sẽ quên hết thứ anh đã tin
[02:29.00] Chẳng để sót lại gì làm anh lưu luyến
[02:35.80] Anh chẳng còn sức để ôm vào lòng
[02:40.00] Hãy để mọi thứ trôi đi theo dòng
[02:44.50] Và cứ xem như chuyện mình chỉ là giấc mơ
[02:51.80] Anh từng ước thời gian ngưng đọng
[02:55.80] Để được ôm em vào mãi trong lòng
[02:59.80] Giờ mọi thứ như hóa vô vọng
[03:03.80] Anh phải làm sao để qua cơn giông?
[03:07.80] Từng lời em nói còn vang bên tai
[03:11.80] Dù anh đã cố để chẳng nhớ lại
[03:15.80] Từ giờ ta chấm dứt chia hai
[03:19.19] Hãy quên giấc mơ yêu mãi không phai', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (8, 10, '[00:29.94] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
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
[02:03.49] (Yeah)
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
Tình yêu bé nhỏ xin dành tặng riêng em', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (9, 20, '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (10, 19, '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (11, 46, '[00:00.00] [Verse 1]
[00:10.00] Anh thường hay thức khuya
[00:11.00] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.00] Rằng phải làm sao?
[00:15.00] Cũng chẳng biết đến bao giờ?
[00:20.00] Những lời ca dở dang
[00:21.00] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.00] Chạy theo đằng sau ánh sáng
[00:27.00] Cuối nơi chân trời.
[00:29.00] Rồi em đến đây dịu dàng cạnh bên anh
[00:33.00] Cơn mưa rơi trở nên long lanh
[00:35.00] Chẳng còn đợi trông
[00:37.00] Vì giấc mơ có em thêm màu xanh
[00:40.00] Thật lòng chẳng xa xôi
[00:43.00] Ước muốn anh ở ngay đây thôi
[00:45.00] Anh không bận tâm nữa
[00:47.00] Vì anh có em.
[00:50.00] Nếu như ngày mai không diễn ra
[00:52.00] Giống cách mà anh cứ luôn mơ mộng?
[00:55.00] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.00] Dặn lòng phải xứng đáng hơn
[01:05.00] Để anh trở thành chàng trai
[01:07.00] Top 1 trong mắt em.
[01:13.00] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15.00] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17.00] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.00] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.00] Bầu trời đêm okay cho nên không sao
[01:23.00] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.00] Dù cho phải gặp bao nhiêu gian khó
[01:28.00] Vẫn luôn là em dõi theo anh
[01:31.00] Dù anh đi đến đâu...
[01:45.00] Nếu như ngày mai không diễn ra
[01:47.00] Giống cách mà anh cứ luôn mơ mộng?
[01:50.00] Thì vẫn có một người luôn phía sau
[01:53.00] Nhẹ nắm tay anh
[01:55.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:58.00] Dặn lòng phải xứng đáng hơn
[02:00.00] Để anh trở thành chàng trai
[02:02.00] Top 1 trong mắt em.
[02:08.00] Những cơ hội vụt qua đôi tay
[02:11.00] Vậy chắc chưa phải là ngày hôm nay
[02:14.00] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17.00] Từng câu nói mà anh vẫn luôn tin vào.
[02:20.00] Có những lần đôi mắt anh lạc phương hướng
[02:23.00] Để rồi đêm tối anh không về nhà
[02:26.00] Thì vẫn luôn là em
[02:28.00] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:30.00] Nếu như ngày mai không diễn ra
[02:32.00] Giống cách mà anh cứ luôn mơ mộng
[02:35.00] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40.00] Biết còn nhiều điều lo lắng đang vây quanh
[02:43.00] Dặn lòng phải xứng đáng hơn
[02:45.00] Để anh trở thành chàng trai
[02:48.00] Top 1 trong mắt em...
[02:53.00] Top 1 trong mắt em.
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Chorus & Outro]', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (12, 45, '[00:02.00] Còn cần thiết nữa, nói chi đến đây cũng thừa
[00:04.00] Giờ chỉ còn mình với vấn vương (Rượu vang pha với cơn mưa)
[00:07.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:09.00] Biết sao hết cho vừa?
[00:11.00] Lòng nhau mới thấu đây em
[00:13.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[00:17.00] Rượu vang pha với cơn mưa
[00:20.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:22.00] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[00:26.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[00:30.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[00:33.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[00:37.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[00:41.00] Ta chia tay, vì sao em ơi?
[00:44.00] Điều này anh muốn hỏi lâu rồi
[00:47.00] Những khung trời kỷ niệm vỡ đôi
[00:50.00] Có phải vì một câu anh đã lỡ lời?
[00:54.00] Sau đêm nay, tự ta cho ta
[00:57.00] Em và anh một đoạn kết mới
[01:00.00] Dù rằng mình còn yêu nhau rất nhiều đấy
[01:04.00] Nhưng để ở lại thì anh nghĩ là không
[01:06.00] Và sau những cảm xúc nhất thời
[01:10.00] Người bên em giờ này chẳng còn là anh
[01:13.00] Gửi lại quá khứ cung đàn đã vỡ
[01:17.00] Vì những vấn vương ấy chưa kịp thành lời
[01:19.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[01:23.00] Rượu vang pha với cơn mưa
[01:26.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[01:28.00] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[01:33.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[01:36.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[01:39.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[01:43.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[01:46.00] Tất cả là tại vì em, em, em, em, em, e-em
[01:50.00] Người xa lạ anh từng quen
[01:53.00] Tất cả là tại vì em, em, em, em, em, e-em
[01:57.00] Kẻ ngốc đang say tình dưới ngọn đèn
[01:59.00] Tất cả là tại vì em, em, em, em, em, e-em
[02:03.00] Người xa lạ anh từng quen
[02:06.00] Tất cả là tại vì em, em, em, em, em, yeah-eh-eh
[02:10.00] Kẻ ngốc đang say tình dưới ngọn đèn
[02:13.00] Lau đôi mi, đây là nước mắt hay mưa
[02:15.00] Buông đôi tay, anh đâu muốn phải dây dưa
[02:17.00] Quên đi đôi mắt ấy khi xưa, chẳng bên nhau được nữa
[02:20.00] Sau bao lần đau, anh lại cho đi và quên
[02:22.00] Anh ghét nỗi đau, cơn mưa đêm kia và em
[02:24.00] Ta vội quên rồi, những điều sao thật quen
[02:27.00] Để nỗi buồn kia gọi tên mỗi khi bài ca bật lên
[02:28.00] Và sau những cảm xúc nhất thời
[02:30.00] Người bên em giờ này chẳng còn là anh
[02:33.00] Gửi lại quá khứ cung đàn đã vỡ
[02:37.00] Vì những vấn vương ấy chưa kịp thành lời
[02:39.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[02:43.00] Rượu vang pha với cơn mưa
[02:45.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[02:48.00] Biết sao hết cho vừa lòng nhau mới thấu đây em?
[02:52.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[02:56.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[03:03.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[03:07.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[03:11.00] Tất cả là tại vì em...
[03:15.00] Người xa lạ anh từng quen...
[03:19.00] Tất cả là tại vì em...
[Chorus: CAPTAIN BOY & CoolKid]
[Verse 1: Pháp Kiều & CAPTAIN BOY]
[Pre-Chorus: Quang Hùng MasterD]
[Chorus: Quang Hùng MasterD & CAPTAIN BOY]
[Post-Chorus: Quang Hùng MasterD & CoolKid]
[Verse 2: Pháp Kiều]
[Pre-Chorus: CoolKid & Quang Hùng MasterD]
[Chorus: Cả nhóm]
[Outro]', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (13, 56, '[00:21.57] Nơi anh bao năm không có nắng
[00:24.28] Và mưa giăng nơi em đôi khi cũng chưa từng muốn ngừng
[00:27.00] Mà đi bao xa ta vẫn thấy ngắn
[00:29.19] Vì nơi đâu cũng là nhà
[00:32.46] Anh băng qua bao la con sóng trắng
[00:35.13] Niềm tin mong manh cũng chỉ biết giăng buồm thật căng
[00:37.75] Để mà lênh đênh trôi mang theo bao cố gắng
[00:40.10] Dù mưa gió có lỡ xô anh đi xa bến bờ
[00:43.03] Vì ngày đó anh chẳng cần biết điều gì đến
[00:46.95] Cũng chẳng thể viết vội đoạn kết
[00:49.67] Khi còn chưa đi hết những xước chai, những đúng sai
[00:53.96] Và ngoài đó hoang tàn giằng xé
[00:56.64] Thì ở đây vẫn có điều nhỏ bé
[00:59.46] Mà lặng lẽ vun xây những mơ mộng này
[01:02.25] Để hôm nay khi đứng đây, em chính là điều nhỏ bé ở bên bờ
[01:05.62] (<I''m in love, I''m in love, in love with you>) ooh, my love
[01:08.42] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[01:11.15] (<I''m in love, I''m in love, in love with you>) ở bên bờ, ở bên bờ cùng mong nhớ
[01:16.64] (<I''m in love, I''m in love, in love with you>) ooh, my love
[01:19.37] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[01:22.06] (<I''m in love, I''m in love, in love with you>)
[01:24.28] Em vẫn luôn rạng rỡ, gom từng thương nhớ nơi bến bờ
[01:27.51] Yeah, nhiều cô gái không hiểu được anh
[01:29.78] Và có nhiều mối quan hệ ngày xưa cũng tự kết thúc vì nó
[01:32.72] Anh là kiểu người mà nếu muốn đùa cợt thì nhanh
[01:35.28] Nhưng để ngồi xuống nói chuyện mở lòng thực sự thì khó
[01:37.45] Chắc là anh không giỏi chuyện đó, anh vô thức giấu hết đi
[01:40.31] Anh vô thức giấu hết đi vào trong hố đen những luồng suy nghĩ
[01:43.17] Và em là người đầu tiên dạy anh nghĩ gì phải nói ra
[01:45.87] Nhưng nhiều lúc nói tự nhiên cổ họng của anh bị nghẹn và
[01:48.25] Não không nghĩ được gì cả, cảm giác đấy khá kì lạ
[01:51.06] Cảm giác như không sắp xếp được đúng suy nghĩ để cho mình tả
[01:53.75] Lớn lên anh nhận ra mở lòng là kĩ năng
[01:56.15] Anh nghĩ EQ anh chưa cao và anh chưa thực sự chín chắn, ah
[01:59.25] Đôi nào chả có cãi vã khi căng thẳng tăng dần lên
[02:01.92] Sẽ có những chủ đề thực sự nhạy cảm nếu như đề cập đến
[02:04.68] Nhưng cho đến cuối em vẫn bình tĩnh nghe anh (nghe)
[02:07.43] Nói với anh rằng nếu từ đầu anh cho em biết thì mưa giông trong đầu anh sẽ tạnh thôi
[02:11.46] Ngày trôi, đầu anh trở nên thảnh thơi
[02:13.62] Anh thấy hạnh phúc khi ở cùng em nhìn mưa bên ngoài rơi
[02:16.49] Anh chưa bao giờ cảm thấy an toàn và yên tâm như thế
[02:19.12] Và mình có thể nói chuyện hàng giờ về chỉ một chủ đề
[02:22.12] You''re the only girl showing me the way to love
[02:24.62] Only one I trust, ain''t afraid to tell the world
[02:27.50] Many things to learn, anh không cần gì hơn
[02:29.57] Ngoài thấy em ở bên cạnh anh khi anh mở mắt dậy vào sáng sớm, ah
[02:32.06] Ooh, my love (I''m in love, I''m in love, in love with you)
[02:34.62] Ooh, my love (yeah) (I''m in love, I''m in love, in love with you)
[02:37.32] Nơi ấy em chờ (I''m in love, I''m in love, in love with you) (this song''s for you)
[02:40.21] Ở bên bờ, ở bên bờ cùng mong nhớ (ah, ah, ah, ah)
[02:43.81] (<I''m in love, I''m in love, in love with you>) ooh, my love
[02:46.59] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[02:49.21] (<I''m in love, I''m in love, in love with you>) yeah
[02:51.43] Em vẫn luôn rạng rỡ, gom từng thương nhớ nơi bến bờ (yeah, yeah, yeah, yeah)
[02:54.65] (<I''m in love, I''m in love, in love with you>) I''m in love with you
[02:57.65] (<I''m in love, I''m in love>) in love with you, in love (I''m in love, I''m in love, in love with you)
[03:00.21] (<I''m in love, I''m in love, in love with you>) I''m in love with you (hah)
[03:04.52] My love ở bên bờ (Low G) (I''m in love, I''m in love, in love with you)
[03:06.78] Bên bờ có em chờ (and JustaTee) (I''m in love, I''m in love, in love with you)
[03:09.18] Ooh-ooh-ooh (2025) (I''m in love, I''m in love, in love with you)
[03:13.00] I''m in love with you, with you, with you', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (14, 63, '[ti:Top 1 (Trong Mắt Em)]
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
[02:46.00]...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (15, 22, '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (16, 21, '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (17, 23, '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');
INSERT INTO public.official_lyrics VALUES (18, 15, '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', 'PUBLISHED', 1, '2026-10-31 08:34:25.722', '2026-10-31 08:34:25.722');


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: personal_lyrics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.personal_lyrics VALUES (1, 8, 49, 'CUSTOM', '[Intro]
[00:00] (Nhạc dạo đầu)
[Verse 1: CONGB & Cody Nam Võ]
[00:15] Kể từ khi gặp em, trí nhớ hơi bị kém
[00:19] Những món ăn thân quen sao nay bỗng dưng chẳng thèm?
[00:22] Dù bụng đói cồn cào, lại chẳng thể nói lời nào
[00:26] Vì gu em không thích người quá cao
[00:30] Mà anh chẳng hề cao, tính nóng hơi bị láo
[00:33] Nói những câu tào lao khi em nói câu xin chào
[00:37] Vậy thì theo anh đến một nơi, không có biển khơi
[00:41] Chỉ có vườn với trái cây mà thôi
[Pre-Chorus: Quang Hùng MasterD]
[00:44] Vườn anh có trái dưa, trái dâu, trái thơm, trái nho, có luôn banana
[00:50] Nhưng thiếu đi trái tim của một người
[00:53] Lòng anh như gió đông giữa trời đêm
[00:55] Mong thấy em khi bình minh lên, oh-hoh
[Chorus: Cody Nam Võ & Quang Hùng MasterD]
[00:57] Tình đầu ngây thơ mà em, đúng không?
[01:01] Còn chưa nắm tay, chưa về tới phòng
[01:04] Mình còn trông ngóng biết nhiều về nhau
[01:07] Đêm đến ta lại ngắm sao, làm sao mở lòng?
[01:12] Chẳng phải em muốn được anh ghé tai?
[01:15] Thầm thì vài câu suốt bao đêm dài
[01:19] Trời cao có thấu nỗi lòng tận mây xanh?
[01:22] Nói em nghe bí mật của anh!
[Rap Verse: Wren Evans]
[01:26] Nói hết bí mật thì có yêu không?
[01:30] Muốn thấy bí mật hay em muốn nghe bằng lời nói?
[01:34] Đến đây với anh, trăm nghe không bằng một lần thấy
[01:37] Ai rồi cũng phải yêu rồi đấy, baby, ooh-ooh
[01:41] Phải làm sao để gặp my baby?
[01:44] Muốn yêu em chân thành vì anh đâu muốn yêu theo phong trào mà bae
[01:48] Em quen anh chân thành, làm một bộ phim hai ta đóng vai người yêu
[01:52] Rất muốn ai đó có thể nói ra hết sự thật
[01:54] Rằng anh thương em rất nhiều
[01:56] Giờ này nếu thắc mắc em qua bên...
[Bridge: Cody Nam Võ, CONGB & Quang Hùng MasterD]
[02:00] ("Baby à, anh đã nói là em trao cho anh trái tim, sao lại là trái bơ đó hả? Thôi CONGB dô!")
[02:08] Vậy người có muốn mình tay nắm tay?
[02:12] Tình anh đã trao không cần giãi bày
[02:15] Nụ cười em sáng hơn mặt trăng đang lên
[02:19] Chiếu sâu vào trái tim, anh không đỡ được
[02:23] Tặng nàng bài thơ dù không có hay
[02:26] Chỉ mong em hiểu lấy tâm tư này
[02:30] Trời cao có thấu nỗi lòng tận mây xanh?
[02:34] Nói em nghe bí mật của anh!
(Tone nâng nửa cung)

[Chorus: Wren Evans & Cody Nam Võ]
[02:38] Tình đầu ngây thơ mà em, đúng không?
[02:41] Còn chưa nắm tay, chưa về tới phòng
[02:45] Mình còn trông ngóng biết nhiều về nhau
[02:48] Đêm đến ta lại ngắm sao, làm sao mở lòng?
[02:52] Chẳng phải em muốn được anh ghé tai?
[02:56] Thầm thì vài câu suốt bao đêm dài
[03:00] Trời cao có thấu nỗi lòng tận mây xanh?
[03:04] Nói em nghe bí mật của anh!
[Outro]
[03:08] Bí mật của anh...
[03:12] Nói em nghe bí mật của anh...', '2026-10-18 04:08:25.657', '2026-10-18 04:27:43.854');
INSERT INTO public.personal_lyrics VALUES (2, 8, 59, 'CUSTOM', '[00:10.00] Anh thường hay thức khuya
[00:11.00] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.00] Rằng phải làm sao?
[00:15.00] Cũng chẳng biết đến bao giờ?
[00:20.00] Những lời ca dở dang
[00:21.00] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.00] Chạy theo đằng sau ánh sáng
[00:27.00] Cuối nơi chân trời.
[00:29.00] Rồi em đến đây dịu dàng cạnh bên anh
[00:33.00] Cơn mưa rơi trở nên long lanh
[00:35.00] Chẳng còn đợi trông
[00:37.00] Vì giấc mơ có em thêm màu xanh
[00:40.00] Thật lòng chẳng xa xôi
[00:43.00] Ước muốn anh ở ngay đây thôi
[00:45.00] Anh không bận tâm nữa
[00:47.00] Vì anh có em.
[00:50.00] Nếu như ngày mai không diễn ra
[00:52.00] Giống cách mà anh cứ luôn mơ mộng?
[00:55.00] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.00] Dặn lòng phải xứng đáng hơn
[01:05.00] Để anh trở thành chàng trai
[01:07.00] Top 1 trong mắt em.
[01:13.00] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15.00] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17.00] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.00] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.00] Bầu trời đêm okay cho nên không sao
[01:23.00] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.00] Dù cho phải gặp bao nhiêu gian khó
[01:28.00] Vẫn luôn là em dõi theo anh
[01:31.00] Dù anh đi đến đâu...
[01:45.00] Nếu như ngày mai không diễn ra
[01:47.00] Giống cách mà anh cứ luôn mơ mộng?
[01:50.00] Thì vẫn có một người luôn phía sau
[01:53.00] Nhẹ nắm tay anh
[01:55.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:58.00] Dặn lòng phải xứng đáng hơn
[02:00.00] Để anh trở thành chàng trai
[02:02.00] Top 1 trong mắt em.
[02:08.00] Những cơ hội vụt qua đôi tay
[02:11.00] Vậy chắc chưa phải là ngày hôm nay
[02:14.00] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17.00] Từng câu nói mà anh vẫn luôn tin vào.
[02:20.00] Có những lần đôi mắt anh lạc phương hướng
[02:23.00] Để rồi đêm tối anh không về nhà
[02:26.00] Thì vẫn luôn là em
[02:28.00] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:30.00] Nếu như ngày mai không diễn ra
[02:32.00] Giống cách mà anh cứ luôn mơ mộng
[02:35.00] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40.00] Biết còn nhiều điều lo lắng đang vây quanh
[02:43.00] Dặn lòng phải xứng đáng hơn
[02:45.00] Để anh trở thành chàng trai
[02:48.00] Top 1 trong mắt em...
[02:53.00] Top 1 trong mắt em.
[Verse 1]
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Chorus & Outro]', '2026-10-23 06:10:57.506', '2026-10-23 06:12:06.533');
INSERT INTO public.personal_lyrics VALUES (3, 8, 48, 'CUSTOM', '[Verse 1]
[00:10] Anh thường hay thức khuya
[00:11] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14] Rằng phải làm sao?
[00:15] Cũng chẳng biết đến bao giờ?
[00:20] Những lời ca dở dang
[00:21] Anh ngồi viết mãi vẫn còn chưa xong
[00:24] Chạy theo đằng sau ánh sáng
[00:27] Cuối nơi chân trời.
[00:29] Rồi em đến đây dịu dàng cạnh bên anh
[00:33] Cơn mưa rơi trở nên long lanh
[00:35] Chẳng còn đợi trông
[00:37] Vì giấc mơ có em thêm màu xanh
[00:40] Thật lòng chẳng xa xôi
[00:43] Ước muốn anh ở ngay đây thôi
[00:45] Anh không bận tâm nữa
[00:47] Vì anh có em.
[Chorus]
[00:50] Nếu như ngày mai không diễn ra
[00:52] Giống cách mà anh cứ luôn mơ mộng?
[00:55] Thì vẫn có một người luôn phía sau
[00:58] Nhẹ nắm tay anh
[01:00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03] Dặn lòng phải xứng đáng hơn
[01:05] Để anh trở thành chàng trai
[01:07] Top 1 trong mắt em.
[Verse 2]
[01:13] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21] Bầu trời đêm okay cho nên không sao
[01:23] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26] Dù cho phải gặp bao nhiêu gian khó
[01:28] Vẫn luôn là em dõi theo anh
[01:31] Dù anh đi đến đâu...
[Chorus]
[01:45] Nếu như ngày mai không diễn ra
[01:47] Giống cách mà anh cứ luôn mơ mộng?
[01:50] Thì vẫn có một người luôn phía sau
[01:53] Nhẹ nắm tay anh
[01:55] Biết còn nhiều điều lo lắng đang vây quanh
[01:58] Dặn lòng phải xứng đáng hơn
[02:00] Để anh trở thành chàng trai
[02:02] Top 1 trong mắt em.
[Bridge]
[02:08] Những cơ hội vụt qua đôi tay
[02:11] Vậy chắc chưa phải là ngày hôm nay
[02:14] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17] Từng câu nói mà anh vẫn luôn tin vào.
[02:20] Có những lần đôi mắt anh lạc phương hướng
[02:23] Để rồi đêm tối anh không về nhà
[02:26] Thì vẫn luôn là em
[02:28] Ngọn đèn rực rỡ chiếu soi nơi anh...
[Chorus & Outro]
[02:30] Nếu như ngày mai không diễn ra
[02:32] Giống cách mà anh cứ luôn mơ mộng
[02:35] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40] Biết còn nhiều điều lo lắng đang vây quanh
[02:43] Dặn lòng phải xứng đáng hơn
[02:45] Để anh trở thành chàng trai
[02:48] Top 1 trong mắt em...
[02:53] Top 1 trong mắt em.', '2026-10-18 04:08:18.719', '2026-10-18 04:16:33.268');
INSERT INTO public.personal_lyrics VALUES (4, 8, 47, 'CUSTOM', '[00:02] Còn cần thiết nữa, nói chi đến đây cũng thừa
[00:04] Giờ chỉ còn mình với vấn vương (Rượu vang pha với cơn mưa)
[00:07] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:09] Biết sao hết cho vừa?
[00:11] Lòng nhau mới thấu đây em
[Chorus: CAPTAIN BOY & CoolKid]
[00:13] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[00:17] Rượu vang pha với cơn mưa
[00:20] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:22] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[00:26] Dệt hàng triệu vết thương, tự vùi mình trước gương
[00:30] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[00:33] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[00:37] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Verse 1: Pháp Kiều & CAPTAIN BOY]
[00:41] Ta chia tay, vì sao em ơi?
[00:44] Điều này anh muốn hỏi lâu rồi
[00:47] Những khung trời kỷ niệm vỡ đôi
[00:50] Có phải vì một câu anh đã lỡ lời?
[00:54] Sau đêm nay, tự ta cho ta
[00:57] Em và anh một đoạn kết mới
[01:00] Dù rằng mình còn yêu nhau rất nhiều đấy
[01:04] Nhưng để ở lại thì anh nghĩ là không
[Pre-Chorus: Quang Hùng MasterD]
[01:06] Và sau những cảm xúc nhất thời
[01:10] Người bên em giờ này chẳng còn là anh
[01:13] Gửi lại quá khứ cung đàn đã vỡ
[01:17] Vì những vấn vương ấy chưa kịp thành lời
[Chorus: Quang Hùng MasterD & CAPTAIN BOY]
[01:19] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[01:23] Rượu vang pha với cơn mưa
[01:26] Hàng trăm lý do cũng chẳng thể cứu vãn
[01:28] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[01:33] Dệt hàng triệu vết thương, tự vùi mình trước gương
[01:36] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[01:39] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[01:43] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Post-Chorus: Quang Hùng MasterD & CoolKid]
[01:46] Tất cả là tại vì em, em, em, em, em, e-em
[01:50] Người xa lạ anh từng quen
[01:53] Tất cả là tại vì em, em, em, em, em, e-em
[01:57] Kẻ ngốc đang say tình dưới ngọn đèn
[01:59] Tất cả là tại vì em, em, em, em, em, e-em
[02:03] Người xa lạ anh từng quen
[02:06] Tất cả là tại vì em, em, em, em, em, yeah-eh-eh
[02:10] Kẻ ngốc đang say tình dưới ngọn đèn
[Verse 2: Pháp Kiều]
[02:13] Lau đôi mi, đây là nước mắt hay mưa
[02:15] Buông đôi tay, anh đâu muốn phải dây dưa
[02:17] Quên đi đôi mắt ấy khi xưa, chẳng bên nhau được nữa
[02:20] Sau bao lần đau, anh lại cho đi và quên
[02:22] Anh ghét nỗi đau, cơn mưa đêm kia và em
[02:24] Ta vội quên rồi, những điều sao thật quen
[02:27] Để nỗi buồn kia gọi tên mỗi khi bài ca bật lên
[Pre-Chorus: CoolKid & Quang Hùng MasterD]
[02:28] Và sau những cảm xúc nhất thời
[02:30] Người bên em giờ này chẳng còn là anh
[02:33] Gửi lại quá khứ cung đàn đã vỡ
[02:37] Vì những vấn vương ấy chưa kịp thành lời
[Chorus: Cả nhóm]
[02:39] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[02:43] Rượu vang pha với cơn mưa
[02:45] Hàng trăm lý do cũng chẳng thể cứu vãn
[02:48] Biết sao hết cho vừa lòng nhau mới thấu đây em?
[02:52] Dệt hàng triệu vết thương, tự vùi mình trước gương
[02:56] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[03:03] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[03:07] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Outro]
[03:11] Tất cả là tại vì em...
[03:15] Người xa lạ anh từng quen...
[03:19] Tất cả là tại vì em...', '2026-10-18 04:07:58.548', '2026-10-18 04:09:04.695');
INSERT INTO public.personal_lyrics VALUES (5, 3, 29, 'CUSTOM', '[00:30.01] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
[00:34.96] Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương (ngọt ngào trong sương)
[00:40.32] Ngắm em thật lâu, con tim anh yếu mềm
[00:45.10] Đắm say từ phút đó, từng giây trôi yêu thêm
[00:50.57] Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh (bộn bề nơi anh)
[00:55.84] Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh (bầu trời trong xanh)
[01:00.75] Liếc đôi hàng mi mong manh, anh thẫn thờ
[01:06.14] Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ
[01:11.50] Cầm tay anh (anh), dựa vai anh (anh)
[01:13.98] Kề bên anh, nơi này có anh', '2026-10-13 10:17:52.818', '2026-10-15 13:11:08.058');
INSERT INTO public.personal_lyrics VALUES (6, 10, 10, 'CUSTOM', '[00:29.94] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
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
[02:03.49] (Yeah)
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
Tình yêu bé nhỏ xin dành tặng riêng em', '2026-10-09 10:03:23.723', '2026-10-13 12:25:51.556');
INSERT INTO public.personal_lyrics VALUES (7, 7, 58, 'CUSTOM', '[00:18.00] Let''s get the party started
[00:20.00] See you at the bar, you was hardly talkin''
[00:22.00] That''s when I knew that your heart was scarrin''
[00:24.00] Friends to lovers, need a part to star in, like, "Wait, babe
[00:27.00] Let me ask your pardon
[00:29.00] This ain''t Gucci, this is Prada, darlin''
[00:31.00] If you want somethin'', you can ask me, darlin''"
[00:34.00] Then you started laughin'' ''cause you think I''m jokin''
[00:36.00] But lookin'' in your eyes is the best thing
[00:38.00] Brake lights givin'' you the red skin
[00:40.00] You was in a bad mood from we stepped in
[00:42.00] Though you checked out ''fore we even checked in
[00:44.00] On the phone you gon'' vent to your best friend
[00:46.00] The one who gave me the lecture, but I ain''t gon'' sweat you, babe
[00:49.00] I''ma let you catch up with your boy, undress you
[00:52.00] And let me tell you why I''ma bless you
[00:55.00] It''s the way my mind is fallin'' away
[00:59.00] In my heart, I know
[01:02.00] You feel the same when you''re with me
[01:05.00] You know I''m all you need
[01:07.00] You''re where I wanna be
[01:09.00] My darling, can''t you see?
[01:12.00] I love you
[01:16.00] I love you
[01:20.00] I love you
[01:24.00] I love you
[01:29.00] I love you
[01:31.00] Fell into you
[01:33.00] Say you want me in the mood
[01:35.00] Tryna hide my feelings for you
[01:37.00] Don''t wanna argue, not with you
[01:39.00] Tell me why you''re so in denial
[01:41.00] Hold me close, don''t tell me goodnight
[01:43.00] Are you down to get me?
[01:46.00] Tell me when you''re ready, I''m ready
[01:49.00] We can get into it or we can get intimate
[01:52.00] The shower when you sing in it
[01:53.00] Better than Beyoncé, I like the sound of fiancée
[01:56.00] You know it''s got a little ring to it
[01:58.00] And really when I think of it
[01:59.00] Growin'' up, I didn''t ever see marriages
[02:01.00] No weddings, no horse, no carriages
[02:03.00] I wanna do things different and change the narrative
[02:06.00] God knows you a wild child, beautiful child, I need your help
[02:09.00] Lookin'' like you come from the ''90s by yourself
[02:11.00] My mum sixty-one and her favourite line to tell her son is
[02:14.00] "Sometimes she wish that she had a girl"
[02:15.00] I wanna take you back to a time, back to a trip
[02:18.00] You had that white wine that I never got to sip
[02:20.00] And dinner wasn''t ruined ''cause you never got to pick
[02:22.00] I know that everybody told me that I''m sick ''cause
[02:24.00] It''s the way my mind is fallin'' away
[02:28.00] In my heart, I know
[02:30.00] You feel the same when you''re with me
[02:33.00] You know I''m all you need
[02:36.00] You''re where I wanna be
[02:38.00] My darling, can''t you see?
[02:41.00] I love you (Me and you, never let me go)
[02:45.00] (Me and you, I''ll tell you two times)
[02:47.00] I love you (Me and you, never let me go)
[02:50.00] (Me and you, tell me two times)
[02:52.00] I love you (Me and you, never let me go)
[02:54.00] (Me and you, tell me two times)
[02:56.00] I love you (Me and you, never let me go)
[02:58.00] (Me and you, tell me two times)
[03:00.00] I said lean with it, rock with it
[03:03.00] Your finger, I could put a rock in it
[03:05.00] Fin-finger, I could put a rock in it
[03:07.00] Bank card, they gon'' put a block in it
[03:09.00] Said rock with it, bounce with it
[03:12.00] The left wrist, I could put my house in it
[03:14.00] You wanna bet, babe? I could put my house in it
[03:16.00] Paper, I could put my spouse in it
[03:18.00] I said shimmy shimmy yay, shimmy
[03:20.00] Shimmy shimmy yah
[03:21.00] 5''9", brown eyes, and she in it, in it
[03:23.00] Shimmy shimmy yay, shimmy
[03:25.00] Shimmy shimmy yah
[03:26.00] 5''9", brown eyes, innit, innit
[03:28.00] Shimmy shimmy yay, shimmy
[03:30.00] Shimmy shimmy yah
[03:31.00] 5''9", brown eyes, and she in-in—
[03:33.00] Shimmy shimmy yay, shimmy
[03:34.00] Shimmy shimmy yah
[03:35.00] 5''9", brown eyes...', '2026-10-23 03:53:53.742', '2026-10-23 04:01:15.76');
INSERT INTO public.personal_lyrics VALUES (8, 9, 50, 'CUSTOM', '[00:00.60] Từ giờ anh sẽ xóa đi hết kỉ niệm
[00:05.15] Anh sẽ quên hết thứ anh đã tin
[00:09.94] Chẳng để sót lại gì làm anh lưu luyến
[00:16.85] Anh chẳng còn sức để ôm vào lòng
[00:21.05] Hãy để mọi thứ trôi đi theo dòng
[00:25.50] Hãy cứ xem như chuyện mình chỉ là giấc mơ
[00:33.20] Cũng đã bao tháng trôi qua
[00:37.20] Mà anh cứ ngỡ chỉ mới hôm qua
[00:40.79] Có lẽ anh chỉ chực chờ hoài, rồi đếm giây trôi
[00:44.50] Xong cứ nghĩ mãi về đôi ta, oh
[00:48.50] Từng hứa sẽ quên em nhanh
[00:52.00] Mà dường như cơn mưa mãi không tạnh
[00:55.50] Nhìn em vui hạnh phúc bên ai rồi
[00:59.20] Mà sao tim anh chẳng đành?
[01:03.20] Từ giờ anh sẽ xóa đi hết kỷ niệm
[01:07.04] Anh sẽ quên hết thứ anh đã tin
[01:11.84] Chẳng để sót lại gì làm anh lưu luyến
[01:18.25] Anh chẳng còn sức để ôm vào lòng
[01:22.50] Hãy để mọi thứ trôi đi theo dòng
[01:27.00] Và cứ xem như chuyện mình chỉ là giấc mơ (chỉ là giấc mơ)
[01:34.00] Baby, anh nhận ra ta chưa từng chịu nghe nhau nói
[01:36.40] Cứ trách và móc để dần nỗi nhớ nhân đôi
[01:38.40] Không bận tâm rồi một ngày cơn giông tới
[01:40.59] Để nó cuốn đi hết, giờ thì hai đứa hai nơi
[01:42.70] Ta phí thời giờ với những lần tranh cãi
[01:44.70] Cũng chỉ để nhận lại dòng nước mắt tuôn rơi
[01:47.00] Rớt thành dòng, tích thành vùng biên hải
[01:49.00] Rồi lại đặt câu hỏi, "Sao tan nát em ơi?"
[01:51.20] Oh, ta thường sống như vậy mà
[01:53.20] Biết là bad vẫn cố chấp như vậy mà
[01:55.20] Nước mắt siết thành thác, tới khô khốc như vậy mà
[01:57.20] Tình mình hóa tan nát cũng vì ngu ngốc như vậy mà
[01:59.20] Oh, chỉ là vài lời cuối rồi anh hứa rằng mình sẽ cố quên đi em
[02:03.00] Nếu mai này em tìm được hạnh phúc, hãy chậm lại một chút để lắng nghe nhau thêm
[02:06.20] Anh đã cố để quên em nhanh
[02:09.80] Mà dường như cơn mưa mãi không tạnh
[02:13.19] Nhìn em vui hạnh phúc bên ai rồi
[02:17.00] Mà sao tim anh chẳng đành
[02:21.00] Từ giờ anh sẽ xóa đi hết kỷ niệm
[02:24.80] Anh sẽ quên hết thứ anh đã tin
[02:29.00] Chẳng để sót lại gì làm anh lưu luyến
[02:35.80] Anh chẳng còn sức để ôm vào lòng
[02:40.00] Hãy để mọi thứ trôi đi theo dòng
[02:44.50] Và cứ xem như chuyện mình chỉ là giấc mơ
[02:51.80] Anh từng ước thời gian ngưng đọng
[02:55.80] Để được ôm em vào mãi trong lòng
[02:59.80] Giờ mọi thứ như hóa vô vọng
[03:03.80] Anh phải làm sao để qua cơn giông?
[03:07.80] Từng lời em nói còn vang bên tai
[03:11.80] Dù anh đã cố để chẳng nhớ lại
[03:15.80] Từ giờ ta chấm dứt chia hai
[03:19.19] Hãy quên giấc mơ yêu mãi không phai', '2026-10-18 04:11:02.147', '2026-10-18 04:13:33.218');
INSERT INTO public.personal_lyrics VALUES (9, 8, 20, 'CUSTOM', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', '2026-10-11 11:34:34.227', '2026-10-11 12:24:39.545');
INSERT INTO public.personal_lyrics VALUES (10, 8, 19, 'CUSTOM', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', '2026-10-11 11:28:21.352', '2026-10-11 12:31:14.697');
INSERT INTO public.personal_lyrics VALUES (11, 8, 46, 'CUSTOM', '[00:00.00] [Verse 1]
[00:10.00] Anh thường hay thức khuya
[00:11.00] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.00] Rằng phải làm sao?
[00:15.00] Cũng chẳng biết đến bao giờ?
[00:20.00] Những lời ca dở dang
[00:21.00] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.00] Chạy theo đằng sau ánh sáng
[00:27.00] Cuối nơi chân trời.
[00:29.00] Rồi em đến đây dịu dàng cạnh bên anh
[00:33.00] Cơn mưa rơi trở nên long lanh
[00:35.00] Chẳng còn đợi trông
[00:37.00] Vì giấc mơ có em thêm màu xanh
[00:40.00] Thật lòng chẳng xa xôi
[00:43.00] Ước muốn anh ở ngay đây thôi
[00:45.00] Anh không bận tâm nữa
[00:47.00] Vì anh có em.
[00:50.00] Nếu như ngày mai không diễn ra
[00:52.00] Giống cách mà anh cứ luôn mơ mộng?
[00:55.00] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.00] Dặn lòng phải xứng đáng hơn
[01:05.00] Để anh trở thành chàng trai
[01:07.00] Top 1 trong mắt em.
[01:13.00] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15.00] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17.00] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.00] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.00] Bầu trời đêm okay cho nên không sao
[01:23.00] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.00] Dù cho phải gặp bao nhiêu gian khó
[01:28.00] Vẫn luôn là em dõi theo anh
[01:31.00] Dù anh đi đến đâu...
[01:45.00] Nếu như ngày mai không diễn ra
[01:47.00] Giống cách mà anh cứ luôn mơ mộng?
[01:50.00] Thì vẫn có một người luôn phía sau
[01:53.00] Nhẹ nắm tay anh
[01:55.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:58.00] Dặn lòng phải xứng đáng hơn
[02:00.00] Để anh trở thành chàng trai
[02:02.00] Top 1 trong mắt em.
[02:08.00] Những cơ hội vụt qua đôi tay
[02:11.00] Vậy chắc chưa phải là ngày hôm nay
[02:14.00] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17.00] Từng câu nói mà anh vẫn luôn tin vào.
[02:20.00] Có những lần đôi mắt anh lạc phương hướng
[02:23.00] Để rồi đêm tối anh không về nhà
[02:26.00] Thì vẫn luôn là em
[02:28.00] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:30.00] Nếu như ngày mai không diễn ra
[02:32.00] Giống cách mà anh cứ luôn mơ mộng
[02:35.00] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40.00] Biết còn nhiều điều lo lắng đang vây quanh
[02:43.00] Dặn lòng phải xứng đáng hơn
[02:45.00] Để anh trở thành chàng trai
[02:48.00] Top 1 trong mắt em...
[02:53.00] Top 1 trong mắt em.
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Chorus & Outro]', '2026-10-18 03:27:17.708', '2026-10-18 04:15:47.504');
INSERT INTO public.personal_lyrics VALUES (12, 8, 45, 'CUSTOM', '[00:02.00] Còn cần thiết nữa, nói chi đến đây cũng thừa
[00:04.00] Giờ chỉ còn mình với vấn vương (Rượu vang pha với cơn mưa)
[00:07.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:09.00] Biết sao hết cho vừa?
[00:11.00] Lòng nhau mới thấu đây em
[00:13.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[00:17.00] Rượu vang pha với cơn mưa
[00:20.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:22.00] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[00:26.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[00:30.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[00:33.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[00:37.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[00:41.00] Ta chia tay, vì sao em ơi?
[00:44.00] Điều này anh muốn hỏi lâu rồi
[00:47.00] Những khung trời kỷ niệm vỡ đôi
[00:50.00] Có phải vì một câu anh đã lỡ lời?
[00:54.00] Sau đêm nay, tự ta cho ta
[00:57.00] Em và anh một đoạn kết mới
[01:00.00] Dù rằng mình còn yêu nhau rất nhiều đấy
[01:04.00] Nhưng để ở lại thì anh nghĩ là không
[01:06.00] Và sau những cảm xúc nhất thời
[01:10.00] Người bên em giờ này chẳng còn là anh
[01:13.00] Gửi lại quá khứ cung đàn đã vỡ
[01:17.00] Vì những vấn vương ấy chưa kịp thành lời
[01:19.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[01:23.00] Rượu vang pha với cơn mưa
[01:26.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[01:28.00] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[01:33.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[01:36.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[01:39.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[01:43.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[01:46.00] Tất cả là tại vì em, em, em, em, em, e-em
[01:50.00] Người xa lạ anh từng quen
[01:53.00] Tất cả là tại vì em, em, em, em, em, e-em
[01:57.00] Kẻ ngốc đang say tình dưới ngọn đèn
[01:59.00] Tất cả là tại vì em, em, em, em, em, e-em
[02:03.00] Người xa lạ anh từng quen
[02:06.00] Tất cả là tại vì em, em, em, em, em, yeah-eh-eh
[02:10.00] Kẻ ngốc đang say tình dưới ngọn đèn
[02:13.00] Lau đôi mi, đây là nước mắt hay mưa
[02:15.00] Buông đôi tay, anh đâu muốn phải dây dưa
[02:17.00] Quên đi đôi mắt ấy khi xưa, chẳng bên nhau được nữa
[02:20.00] Sau bao lần đau, anh lại cho đi và quên
[02:22.00] Anh ghét nỗi đau, cơn mưa đêm kia và em
[02:24.00] Ta vội quên rồi, những điều sao thật quen
[02:27.00] Để nỗi buồn kia gọi tên mỗi khi bài ca bật lên
[02:28.00] Và sau những cảm xúc nhất thời
[02:30.00] Người bên em giờ này chẳng còn là anh
[02:33.00] Gửi lại quá khứ cung đàn đã vỡ
[02:37.00] Vì những vấn vương ấy chưa kịp thành lời
[02:39.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[02:43.00] Rượu vang pha với cơn mưa
[02:45.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[02:48.00] Biết sao hết cho vừa lòng nhau mới thấu đây em?
[02:52.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[02:56.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[03:03.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[03:07.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[03:11.00] Tất cả là tại vì em...
[03:15.00] Người xa lạ anh từng quen...
[03:19.00] Tất cả là tại vì em...
[Chorus: CAPTAIN BOY & CoolKid]
[Verse 1: Pháp Kiều & CAPTAIN BOY]
[Pre-Chorus: Quang Hùng MasterD]
[Chorus: Quang Hùng MasterD & CAPTAIN BOY]
[Post-Chorus: Quang Hùng MasterD & CoolKid]
[Verse 2: Pháp Kiều]
[Pre-Chorus: CoolKid & Quang Hùng MasterD]
[Chorus: Cả nhóm]
[Outro]', '2026-10-18 03:27:12.163', '2026-10-18 03:32:22.53');
INSERT INTO public.personal_lyrics VALUES (13, 9, 56, 'CUSTOM', '[00:21.57] Nơi anh bao năm không có nắng
[00:24.28] Và mưa giăng nơi em đôi khi cũng chưa từng muốn ngừng
[00:27.00] Mà đi bao xa ta vẫn thấy ngắn
[00:29.19] Vì nơi đâu cũng là nhà
[00:32.46] Anh băng qua bao la con sóng trắng
[00:35.13] Niềm tin mong manh cũng chỉ biết giăng buồm thật căng
[00:37.75] Để mà lênh đênh trôi mang theo bao cố gắng
[00:40.10] Dù mưa gió có lỡ xô anh đi xa bến bờ
[00:43.03] Vì ngày đó anh chẳng cần biết điều gì đến
[00:46.95] Cũng chẳng thể viết vội đoạn kết
[00:49.67] Khi còn chưa đi hết những xước chai, những đúng sai
[00:53.96] Và ngoài đó hoang tàn giằng xé
[00:56.64] Thì ở đây vẫn có điều nhỏ bé
[00:59.46] Mà lặng lẽ vun xây những mơ mộng này
[01:02.25] Để hôm nay khi đứng đây, em chính là điều nhỏ bé ở bên bờ
[01:05.62] (<I''m in love, I''m in love, in love with you>) ooh, my love
[01:08.42] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[01:11.15] (<I''m in love, I''m in love, in love with you>) ở bên bờ, ở bên bờ cùng mong nhớ
[01:16.64] (<I''m in love, I''m in love, in love with you>) ooh, my love
[01:19.37] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[01:22.06] (<I''m in love, I''m in love, in love with you>)
[01:24.28] Em vẫn luôn rạng rỡ, gom từng thương nhớ nơi bến bờ
[01:27.51] Yeah, nhiều cô gái không hiểu được anh
[01:29.78] Và có nhiều mối quan hệ ngày xưa cũng tự kết thúc vì nó
[01:32.72] Anh là kiểu người mà nếu muốn đùa cợt thì nhanh
[01:35.28] Nhưng để ngồi xuống nói chuyện mở lòng thực sự thì khó
[01:37.45] Chắc là anh không giỏi chuyện đó, anh vô thức giấu hết đi
[01:40.31] Anh vô thức giấu hết đi vào trong hố đen những luồng suy nghĩ
[01:43.17] Và em là người đầu tiên dạy anh nghĩ gì phải nói ra
[01:45.87] Nhưng nhiều lúc nói tự nhiên cổ họng của anh bị nghẹn và
[01:48.25] Não không nghĩ được gì cả, cảm giác đấy khá kì lạ
[01:51.06] Cảm giác như không sắp xếp được đúng suy nghĩ để cho mình tả
[01:53.75] Lớn lên anh nhận ra mở lòng là kĩ năng
[01:56.15] Anh nghĩ EQ anh chưa cao và anh chưa thực sự chín chắn, ah
[01:59.25] Đôi nào chả có cãi vã khi căng thẳng tăng dần lên
[02:01.92] Sẽ có những chủ đề thực sự nhạy cảm nếu như đề cập đến
[02:04.68] Nhưng cho đến cuối em vẫn bình tĩnh nghe anh (nghe)
[02:07.43] Nói với anh rằng nếu từ đầu anh cho em biết thì mưa giông trong đầu anh sẽ tạnh thôi
[02:11.46] Ngày trôi, đầu anh trở nên thảnh thơi
[02:13.62] Anh thấy hạnh phúc khi ở cùng em nhìn mưa bên ngoài rơi
[02:16.49] Anh chưa bao giờ cảm thấy an toàn và yên tâm như thế
[02:19.12] Và mình có thể nói chuyện hàng giờ về chỉ một chủ đề
[02:22.12] You''re the only girl showing me the way to love
[02:24.62] Only one I trust, ain''t afraid to tell the world
[02:27.50] Many things to learn, anh không cần gì hơn
[02:29.57] Ngoài thấy em ở bên cạnh anh khi anh mở mắt dậy vào sáng sớm, ah
[02:32.06] Ooh, my love (I''m in love, I''m in love, in love with you)
[02:34.62] Ooh, my love (yeah) (I''m in love, I''m in love, in love with you)
[02:37.32] Nơi ấy em chờ (I''m in love, I''m in love, in love with you) (this song''s for you)
[02:40.21] Ở bên bờ, ở bên bờ cùng mong nhớ (ah, ah, ah, ah)
[02:43.81] (<I''m in love, I''m in love, in love with you>) ooh, my love
[02:46.59] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[02:49.21] (<I''m in love, I''m in love, in love with you>) yeah
[02:51.43] Em vẫn luôn rạng rỡ, gom từng thương nhớ nơi bến bờ (yeah, yeah, yeah, yeah)
[02:54.65] (<I''m in love, I''m in love, in love with you>) I''m in love with you
[02:57.65] (<I''m in love, I''m in love>) in love with you, in love (I''m in love, I''m in love, in love with you)
[03:00.21] (<I''m in love, I''m in love, in love with you>) I''m in love with you (hah)
[03:04.52] My love ở bên bờ (Low G) (I''m in love, I''m in love, in love with you)
[03:06.78] Bên bờ có em chờ (and JustaTee) (I''m in love, I''m in love, in love with you)
[03:09.18] Ooh-ooh-ooh (2025) (I''m in love, I''m in love, in love with you)
[03:13.00] I''m in love with you, with you, with you', '2026-10-18 18:45:19.44', '2026-10-24 03:46:23.253');
INSERT INTO public.personal_lyrics VALUES (14, 8, 63, 'CUSTOM', '[ti:Top 1 (Trong Mắt Em)]
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
[02:46.00]...', '2026-10-27 09:15:54.625', '2026-10-27 09:16:09.449');
INSERT INTO public.personal_lyrics VALUES (15, 8, 22, 'CUSTOM', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', '2026-10-11 12:40:35.924', '2026-10-23 05:45:52.741');
INSERT INTO public.personal_lyrics VALUES (16, 8, 21, 'CUSTOM', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', '2026-10-11 12:29:20.299', '2026-10-23 05:26:05.087');
INSERT INTO public.personal_lyrics VALUES (17, 8, 23, 'CUSTOM', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', '2026-10-11 12:42:57.053', '2026-10-23 05:44:15.242');
INSERT INTO public.personal_lyrics VALUES (18, 19, 15, 'CUSTOM', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...', '2026-10-10 04:18:11.421', '2026-10-10 04:19:55.926');


--
-- Data for Name: playlist_tracks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.playlist_tracks VALUES (16, 50, 9, 5, '2026-10-18 04:16:06.55');
INSERT INTO public.playlist_tracks VALUES (18, 13, 10, 1, '2026-10-27 08:15:44.562');
INSERT INTO public.playlist_tracks VALUES (6, 16, 3, 3, '2026-10-10 08:16:09.121');
INSERT INTO public.playlist_tracks VALUES (6, 12, 3, 4, '2026-10-10 08:16:09.918');
INSERT INTO public.playlist_tracks VALUES (6, 13, 3, 5, '2026-10-10 08:16:14.269');
INSERT INTO public.playlist_tracks VALUES (6, 11, 3, 6, '2026-10-10 08:16:16.278');
INSERT INTO public.playlist_tracks VALUES (6, 10, 3, 7, '2026-10-10 08:16:18.011');
INSERT INTO public.playlist_tracks VALUES (6, 6, 3, 8, '2026-10-10 08:16:20.136');
INSERT INTO public.playlist_tracks VALUES (17, 16, 9, 7, '2026-10-18 03:11:16.523');
INSERT INTO public.playlist_tracks VALUES (7, 15, 6, 1, '2026-10-10 07:16:15.026');
INSERT INTO public.playlist_tracks VALUES (7, 11, 6, 2, '2026-10-10 07:16:21.166');
INSERT INTO public.playlist_tracks VALUES (7, 9, 6, 3, '2026-10-10 07:16:22.136');
INSERT INTO public.playlist_tracks VALUES (7, 7, 6, 4, '2026-10-10 07:16:23.653');
INSERT INTO public.playlist_tracks VALUES (7, 12, 6, 5, '2026-10-10 07:16:25.011');
INSERT INTO public.playlist_tracks VALUES (6, 8, 3, 1, '2026-10-10 07:22:37.245');
INSERT INTO public.playlist_tracks VALUES (6, 15, 3, 2, '2026-10-10 07:22:33.314');
INSERT INTO public.playlist_tracks VALUES (11, 10, 21, 1, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (11, 8, 21, 2, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (11, 9, 21, 3, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (12, 7, 22, 1, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (12, 6, 22, 2, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (12, 15, 22, 3, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (13, 13, 23, 1, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (13, 11, 23, 2, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (13, 12, 23, 3, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (13, 26, 23, 4, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (14, 8, 24, 2, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (14, 9, 24, 3, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (15, 10, 25, 1, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (15, 7, 25, 2, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (15, 13, 25, 3, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (15, 6, 25, 4, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (15, 11, 25, 5, '2026-10-13 15:04:04.013');
INSERT INTO public.playlist_tracks VALUES (16, 38, 9, 1, '2026-10-15 14:57:04.928');
INSERT INTO public.playlist_tracks VALUES (16, 36, 9, 2, '2026-10-15 14:57:05.411');
INSERT INTO public.playlist_tracks VALUES (16, 34, 9, 3, '2026-10-15 14:57:06.437');
INSERT INTO public.playlist_tracks VALUES (17, 38, 9, 1, '2026-10-18 01:51:18.482');
INSERT INTO public.playlist_tracks VALUES (17, 36, 9, 2, '2026-10-18 01:51:19.454');
INSERT INTO public.playlist_tracks VALUES (17, 33, 9, 5, '2026-10-18 01:51:40.422');
INSERT INTO public.playlist_tracks VALUES (17, 15, 9, 8, '2026-10-18 03:11:23.341');
INSERT INTO public.playlist_tracks VALUES (17, 34, 9, 3, '2026-10-18 01:51:28.704');
INSERT INTO public.playlist_tracks VALUES (17, 26, 9, 4, '2026-10-18 01:51:29.7');
INSERT INTO public.playlist_tracks VALUES (17, 8, 9, 6, '2026-10-18 02:46:45.504');
INSERT INTO public.playlist_tracks VALUES (16, 26, 9, 4, '2026-10-18 02:48:47.212');
INSERT INTO public.playlist_tracks VALUES (17, 11, 9, 9, '2026-10-18 03:11:24.738');
INSERT INTO public.playlist_tracks VALUES (17, 13, 9, 10, '2026-10-18 03:11:26.848');
INSERT INTO public.playlist_tracks VALUES (17, 12, 9, 11, '2026-10-18 03:11:32.797');
INSERT INTO public.playlist_tracks VALUES (17, 10, 9, 12, '2026-10-18 03:11:36.234');
INSERT INTO public.playlist_tracks VALUES (17, 9, 9, 13, '2026-10-18 03:11:42.028');


--
-- Data for Name: playlists; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.playlists VALUES (6, 3, 'tổng hợp', 'dau', 'PRIVATE', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791601974/soundwave/playlists/covers/user-3-playlist-cover-1f4bd05f-0f31-4740-89eb-7be206428e9f.jpg', '2026-10-09 20:11:36.313', '2026-10-10 08:17:30.502', 3, true, 'tong-hop', 'tổng hợp');
INSERT INTO public.playlists VALUES (8, 8, 'M', '', 'PRIVATE', NULL, 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%3E%0A%20%20%20%20%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%230e7490%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23d4a373%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%0A%20%20%20%20%3Crect%20width%3D%22600%22%20height%3D%22600%22%20rx%3D%2232%22%20fill%3D%22url(%23g)%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-30%20380C100%20210%20170%20530%20315%20315S520%20120%20660%20268%22%20fill%3D%22none%22%20stroke%3D%22%2367e8f9%22%20stroke-width%3D%2280%22%20stroke-linecap%3D%22round%22%20opacity%3D%22.8%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2242%22%20y%3D%22535%22%20fill%3D%22white%22%20font-family%3D%22Arial%2Csans-serif%22%20font-weight%3D%22700%22%20font-size%3D%2238%22%3ES%E1%BB%9AM%20MAI%3C%2Ftext%3E%0A%20%20%3C%2Fsvg%3E', '2026-10-10 09:43:34.716', '2026-10-10 09:43:34.716', 8, true, 'm', 'M');
INSERT INTO public.playlists VALUES (11, 21, 'Giai Điệu V-Pop Ngọt Ngào', 'Tuyển tập những bản ballad và pop Việt Nam da diết, tình cảm nhất.', 'PRIVATE', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', 21, false, 'giai-dieu-vpop-ngot-ngao', 'Giai Điệu V-Pop Ngọt Ngào');
INSERT INTO public.playlists VALUES (12, 22, 'Vibe Rap Việt Cực Cháy', 'List nhạc rap khởi động ngày mới tràn đầy năng lượng cùng HIEUTHUHAI, MCK, Low G.', 'PRIVATE', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565335/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', 22, false, 'vibe-rap-viet-cuc-chay', 'Vibe Rap Việt Cực Cháy');
INSERT INTO public.playlists VALUES (13, 23, 'Anime Soundtracks & J-Pop Hits', 'Collection of iconic themes from Evangelion, Frieren, and Makoto Shinkai works.', 'PRIVATE', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565560/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', 23, false, 'anime-soundtracks-jpop-hits', 'Anime Soundtracks & J-Pop Hits');
INSERT INTO public.playlists VALUES (15, 25, 'SoundWave Hot Trends Daily', 'Những giai điệu đang thịnh hành và được yêu thích nhất trên SoundWave.', 'PRIVATE', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565314/soundwave/tracks/covers/project-cover-baby-mck.webp', '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', 25, false, 'soundwave-hot-trends-daily', 'SoundWave Hot Trends Daily');
INSERT INTO public.playlists VALUES (7, 6, 'Mèo Béo', 'Béo béo', 'PRIVATE', NULL, 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%3E%0A%20%20%20%20%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%230e7490%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23d4a373%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%0A%20%20%20%20%3Crect%20width%3D%22600%22%20height%3D%22600%22%20rx%3D%2232%22%20fill%3D%22url(%23g)%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-30%20380C100%20210%20170%20530%20315%20315S520%20120%20660%20268%22%20fill%3D%22none%22%20stroke%3D%22%2367e8f9%22%20stroke-width%3D%2280%22%20stroke-linecap%3D%22round%22%20opacity%3D%22.8%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2242%22%20y%3D%22535%22%20fill%3D%22white%22%20font-family%3D%22Arial%2Csans-serif%22%20font-weight%3D%22700%22%20font-size%3D%2238%22%3ES%E1%BB%9AM%20MAI%3C%2Ftext%3E%0A%20%20%3C%2Fsvg%3E', '2026-10-10 07:16:00.446', '2026-10-10 07:16:25.788', 6, true, 'meo-beo', 'Mèo Béo');
INSERT INTO public.playlists VALUES (14, 24, 'Acoustic & Late Night Chill', 'Âm nhạc mộc mạc thư giãn đêm khuya cho tâm hồn thư thái.', 'PRIVATE', NULL, 'https://res.cloudinary.com/demo/image/upload/sample.jpg', '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', 24, false, 'acoustic-late-night-chill', 'Acoustic & Late Night Chill');
INSERT INTO public.playlists VALUES (17, 9, 'Ngọt', '', 'PRIVATE', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792313579/soundwave/playlists/covers/user-9-playlist-cover-1fd65e3a-4dec-471e-a0fc-6367ca1a9bca.jpg', '2026-10-18 01:50:58.531', '2026-10-18 03:11:44.125', 9, true, 'ngot-1', 'Ngọt');
INSERT INTO public.playlists VALUES (16, 9, 'Nhạc của Tuấn', '', 'PRIVATE', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792101420/soundwave/playlists/covers/user-9-playlist-cover-b29b15f4-86c0-44d1-8b5c-449579c0a79b.jpg', '2026-10-15 14:56:58.077', '2026-10-18 04:29:59.619', 9, true, 'nhac-cua-tuan', 'Nhạc của Tuấn');
INSERT INTO public.playlists VALUES (4, 3, 'Ngọt', '', 'PRIVATE', NULL, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600', '2026-10-09 19:42:24.862', '2026-10-09 19:42:24.862', 3, true, 'ngot', 'Ngọt');
INSERT INTO public.playlists VALUES (18, 10, 'dfsasdf', '', 'PRIVATE', NULL, 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%3E%0A%20%20%20%20%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%230e7490%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23d4a373%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%0A%20%20%20%20%3Crect%20width%3D%22600%22%20height%3D%22600%22%20rx%3D%2232%22%20fill%3D%22url(%23g)%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-30%20380C100%20210%20170%20530%20315%20315S520%20120%20660%20268%22%20fill%3D%22none%22%20stroke%3D%22%2367e8f9%22%20stroke-width%3D%2280%22%20stroke-linecap%3D%22round%22%20opacity%3D%22.8%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2242%22%20y%3D%22535%22%20fill%3D%22white%22%20font-family%3D%22Arial%2Csans-serif%22%20font-weight%3D%22700%22%20font-size%3D%2238%22%3ES%E1%BB%9AM%20MAI%3C%2Ftext%3E%0A%20%20%3C%2Fsvg%3E', '2026-10-27 08:14:53.484', '2026-10-27 08:15:44.831', 10, true, 'dfsasdf', 'dfsasdf');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.refresh_tokens VALUES (1478, 10, '8e328872820733f8173ada69b205d25f33380777c5a2c71e78ac4e32e623793f', '2026-12-08 07:09:39.487', '2026-11-08 07:25:36.086', '2026-11-08 07:09:39.487', NULL);
INSERT INTO public.refresh_tokens VALUES (3, 4, 'b21af44db7e4ac027e9677538a466b73ffd7fd24ec2aa3510313791315051e6b', '2026-11-08 06:16:28.939', '2026-10-09 06:16:45.286', '2026-10-09 06:16:28.939', NULL);
INSERT INTO public.refresh_tokens VALUES (1, NULL, '21bc9d8068df055b25bc40da36ba802c802f7374696ede8397dbce4bd42f5985', '2026-11-08 05:47:42.241', '2026-10-09 05:47:50.55', '2026-10-09 05:47:42.241', 2);
INSERT INTO public.refresh_tokens VALUES (4, 4, '17244b11798cdc4f6f87c27ef6e0c1913a5bf336b56e30e3988876558125059b', '2026-11-08 06:16:47.745', '2026-10-09 06:32:31.643', '2026-10-09 06:16:47.745', NULL);
INSERT INTO public.refresh_tokens VALUES (7, 4, 'c0d15d9b22b2681ea4a4f78ad7754c63751d223a22bc3d904a80ea996676d6da', '2026-10-16 06:32:31.683', '2026-10-09 07:43:36.669', '2026-10-09 06:32:31.683', NULL);
INSERT INTO public.refresh_tokens VALUES (11, 4, 'c73234e94036929ce419070f173bc3b5c002c935d310c28193ebf19d250a8f86', '2026-10-16 07:43:36.72', '2026-10-09 08:14:14.714', '2026-10-09 07:43:36.72', NULL);
INSERT INTO public.refresh_tokens VALUES (15, 4, '52799955b2d616249d3b527b82c1af296fabdb66a253d22de582bf383b9ef175', '2026-10-16 08:14:14.76', '2026-10-09 08:27:15.905', '2026-10-09 08:14:14.76', NULL);
INSERT INTO public.refresh_tokens VALUES (21, 4, '1034b1af1755501a1e471a074c46443d589156e7f619344dae51a45a6916d5c8', '2026-10-16 08:27:15.944', '2026-10-09 08:44:26.191', '2026-10-09 08:27:15.944', NULL);
INSERT INTO public.refresh_tokens VALUES (22, 4, 'bf018386f3f0988628ae57f3f07311718e23ad71a0f674c2845dd69c418b9517', '2026-10-16 08:44:26.245', '2026-10-09 08:44:27.716', '2026-10-09 08:44:26.245', NULL);
INSERT INTO public.refresh_tokens VALUES (23, 4, 'b7829d316284e9d2d769ef4972af581f773c6c3cbc6b7b94ece4d55d7d716deb', '2026-10-16 08:44:27.811', '2026-10-09 08:45:07.957', '2026-10-09 08:44:27.811', NULL);
INSERT INTO public.refresh_tokens VALUES (25, 4, '55166a2799372ddf69a10bcce594f9435a6dcbf478117a5a29f41f4f7024d734', '2026-10-16 09:10:07.968', NULL, '2026-10-09 09:10:07.968', NULL);
INSERT INTO public.refresh_tokens VALUES (24, 4, '6f9a3247d42d9ca42261d14a853575aedd2415655797549bc4ee7f16672dfd29', '2026-11-08 08:45:09.935', '2026-10-09 09:10:07.922', '2026-10-09 08:45:09.935', NULL);
INSERT INTO public.refresh_tokens VALUES (28, 4, '24419e3f4701c7d743e993d97b88b0fb1e5681682e5ddd8b01c4f8df37d1a7b4', '2026-11-08 09:16:03.353', '2026-10-09 09:17:33.04', '2026-10-09 09:16:03.353', NULL);
INSERT INTO public.refresh_tokens VALUES (26, 4, 'ebae632698560610a3dc01b226900b45e6de7b9db7a91066ab347ccb97094586', '2026-11-08 09:10:09.052', '2026-10-09 09:28:03.535', '2026-10-09 09:10:09.052', NULL);
INSERT INTO public.refresh_tokens VALUES (34, 4, '40a6500f9626bad609c41dc8876caf88449bfc81e02a52772009f34c475927a7', '2026-10-16 09:43:28.804', NULL, '2026-10-09 09:43:28.804', NULL);
INSERT INTO public.refresh_tokens VALUES (32, 4, '00e791efbea38d7b9ad42aa3723452c3ee714f4e8fc2f3c5d7862c8dae98e46c', '2026-10-16 09:28:03.574', '2026-10-09 09:43:28.766', '2026-10-09 09:28:03.574', NULL);
INSERT INTO public.refresh_tokens VALUES (41, 4, 'dcf8f8143d45483689b49242ec3cf31af84d233770b991d68b7bf188cfcf1518', '2026-11-08 10:10:12.107', '2026-10-09 10:11:06.91', '2026-10-09 10:10:12.107', NULL);
INSERT INTO public.refresh_tokens VALUES (47, 4, 'e4e3f0a754fa164bb66539207ffcdcdeb3904b7d0faec35cb3a37397c28ad319', '2026-11-08 10:15:44.542', '2026-10-09 10:16:13.784', '2026-10-09 10:15:44.542', NULL);
INSERT INTO public.refresh_tokens VALUES (1479, 10, '6f86da58ee81efad3b2cde8f31ca8d9a90c62a9beecacd380a31ba2b4bda8bef', '2026-11-15 07:25:36.126', NULL, '2026-11-08 07:25:36.126', NULL);
INSERT INTO public.refresh_tokens VALUES (868, NULL, '2412fd4d65661798d0d8362ea220446c67e8575be102387d69514347677fe7ec', '2026-11-21 09:14:00.299', '2026-10-22 09:14:47.905', '2026-10-22 09:14:00.299', 2);
INSERT INTO public.refresh_tokens VALUES (73, NULL, '54d3b09f010f2b8671610552f7709b7cb8704d6b83dd032ace97290c21fb4921', '2026-11-08 19:37:57.643', NULL, '2026-10-09 19:37:57.643', 1);
INSERT INTO public.refresh_tokens VALUES (1146, NULL, '68b2d251b3c5376a237a018600f433718120cf914cbffaa8865ac709611523a9', '2026-10-30 07:52:01.936', '2026-10-23 07:53:01.955', '2026-10-23 07:52:01.936', 1);
INSERT INTO public.refresh_tokens VALUES (869, NULL, 'eb34913986c0e7b5207694ef9d00212f538505abbf1c89b9f693fd86b0680c12', '2026-10-29 09:14:47.905', '2026-10-22 09:30:33.901', '2026-10-22 09:14:47.905', 2);
INSERT INTO public.refresh_tokens VALUES (870, NULL, '7b8611ca6b278669f5e8dd0355a93a7778aee527d0b8939c2e48cd81ed1707f3', '2026-10-29 09:19:11.399', NULL, '2026-10-22 09:19:11.399', 2);
INSERT INTO public.refresh_tokens VALUES (871, NULL, 'cb267e3c25fa7ce882ee3d536bcf03c180f7881d91b0c7d38d5ea774dc9f1bb1', '2026-10-29 09:19:43.444', NULL, '2026-10-22 09:19:43.444', 2);
INSERT INTO public.refresh_tokens VALUES (872, NULL, '999283af18f0f7d872b10d44f56f3ad4c73479e9e7be4c6df3ef3edf9e0bb9cb', '2026-10-29 09:21:17.23', NULL, '2026-10-22 09:21:17.23', 2);
INSERT INTO public.refresh_tokens VALUES (180, 4, '5e9b45ccad056a005d4f120504c44a50002d4e4102f92f6331eb88b419774538', '2026-11-12 05:37:25.813', '2026-10-13 05:38:10.148', '2026-10-13 05:37:25.813', NULL);
INSERT INTO public.refresh_tokens VALUES (1147, NULL, '5dd0450a62a50cb96141607f43526bff3ea651711bae4540312dd3f5eeda1919', '2026-10-30 07:53:01.956', '2026-10-23 07:54:02.527', '2026-10-23 07:53:01.956', 1);
INSERT INTO public.refresh_tokens VALUES (873, NULL, 'ab6c13af65167c5f088dcd0540b5168b72bf1ed7d699857f4680e57de20bc1d2', '2026-10-29 09:30:33.901', '2026-10-22 09:32:59.164', '2026-10-22 09:30:33.901', 2);
INSERT INTO public.refresh_tokens VALUES (874, NULL, '9e6bf89b4670fd6c1f504c2e3fa9c1addd485251b4438a3bde701b7cafe0e694', '2026-10-29 09:32:59.164', '2026-10-22 09:33:03.343', '2026-10-22 09:32:59.164', 2);
INSERT INTO public.refresh_tokens VALUES (875, NULL, 'ff38ea6370c12758a960aefb8bfad35bc61b9700ab496b68be52152eb4fd0b3d', '2026-11-21 09:33:24.487', '2026-10-22 09:34:02.951', '2026-10-22 09:33:24.487', 2);
INSERT INTO public.refresh_tokens VALUES (876, NULL, '0118d38aace6278d3518119b5c68f868f6fa799d84c867a70440b362c439ba90', '2026-10-29 09:34:02.951', '2026-10-22 09:34:28.564', '2026-10-22 09:34:02.951', 2);
INSERT INTO public.refresh_tokens VALUES (878, NULL, '74c2eade71d0218229b0ebd960adf635329dccfe184165a03a35472b9ef6af51', '2026-10-29 09:38:33.125', NULL, '2026-10-22 09:38:33.125', 2);
INSERT INTO public.refresh_tokens VALUES (879, NULL, 'c7874694425d605c6a07ceab610db35a96e82f7be955427759b8ef85a5031b78', '2026-10-29 09:38:33.458', NULL, '2026-10-22 09:38:33.458', 1);
INSERT INTO public.refresh_tokens VALUES (880, NULL, 'c43216545446d7a2b3c05552282cbc52bdc6253be657e180c0cc68588d36b046', '2026-10-29 09:44:31.866', NULL, '2026-10-22 09:44:31.866', 2);
INSERT INTO public.refresh_tokens VALUES (881, NULL, '2d53c84e56b3579f2d4c2f663f4bfa24cbc8d5755ea68b736918b1e94b06be30', '2026-10-29 09:47:52.053', NULL, '2026-10-22 09:47:52.053', 2);
INSERT INTO public.refresh_tokens VALUES (877, NULL, '86037297e2c1837f904200f3571f21f24e2e7ca01bb490015ac665b0e9a3d2a9', '2026-10-29 09:34:28.564', '2026-10-22 09:49:34.05', '2026-10-22 09:34:28.564', 2);
INSERT INTO public.refresh_tokens VALUES (995, NULL, '62e570a5afabd11042830d258407d81eca807eba739a5cc5043c722d21b5635a', '2026-10-30 03:08:54.39', '2026-10-23 03:23:54.385', '2026-10-23 03:08:54.39', 2);
INSERT INTO public.refresh_tokens VALUES (1047, NULL, 'a7b0e4eb29e90a23d38f6860a2fc5e8c70ed9757fb60fdc8de4e59914a560444', '2026-10-30 03:55:29.844', '2026-10-23 03:55:31.672', '2026-10-23 03:55:29.844', 2);
INSERT INTO public.refresh_tokens VALUES (1049, NULL, '7d6f33ed9eed00d4133e769609552fba679a768e272f86161f0e34604ea6a3b3', '2026-10-30 03:56:02.435', '2026-10-23 03:56:04.433', '2026-10-23 03:56:02.435', 2);
INSERT INTO public.refresh_tokens VALUES (1050, NULL, '562ac1ba63e7ef94375248d79817819a77b4d40205888d9c8fc86026fb06d3f9', '2026-10-30 03:56:04.433', '2026-10-23 03:56:05.189', '2026-10-23 03:56:04.433', 2);
INSERT INTO public.refresh_tokens VALUES (1057, NULL, '6dc64119398b20b454e561379aae0bbd6e2a262d0bc2f733fab8acc3736e2827', '2026-11-22 04:00:59.032', '2026-10-23 04:01:21.289', '2026-10-23 04:00:59.032', 2);
INSERT INTO public.refresh_tokens VALUES (1062, NULL, 'dbd9277deca94606352d62cc5fa7307f60695f5adf11c9e6abf3048cd4138bc9', '2026-10-30 04:08:54.402', '2026-10-23 04:15:34.565', '2026-10-23 04:08:54.402', 2);
INSERT INTO public.refresh_tokens VALUES (883, NULL, 'aac4e3e8e5dbec21b63e5bb2d0d85018688fc390f669e32c424d2067d3e33943', '2026-10-29 09:49:37.806', NULL, '2026-10-22 09:49:37.806', 2);
INSERT INTO public.refresh_tokens VALUES (884, NULL, 'deeb99653cdf48ed82ea0f175372425dbe4c69b43332220d890ef3daf63c4fec', '2026-10-29 09:49:49.597', NULL, '2026-10-22 09:49:49.597', 1);
INSERT INTO public.refresh_tokens VALUES (248, NULL, 'd063df99214f6388db36d70ac0ec673fce3abcd9e1689185a055c7db810916ee', '2026-10-20 09:19:31.442', '2026-10-13 09:20:31.548', '2026-10-13 09:19:31.442', 2);
INSERT INTO public.refresh_tokens VALUES (886, NULL, 'a72af624c386ac5d60e1ecc0b065a0abeb28da84b355b5f89467724ca167e2bb', '2026-10-29 09:50:19.646', NULL, '2026-10-22 09:50:19.646', 2);
INSERT INTO public.refresh_tokens VALUES (887, NULL, '0b65799d0220d6ba6cf2d379d25ea168e8196474130c8f8aa85d4fe72121ba82', '2026-10-29 09:54:06.811', NULL, '2026-10-22 09:54:06.811', 2);
INSERT INTO public.refresh_tokens VALUES (882, NULL, '146a300f4b6e165563c4da70a713602ae74ed197416d66dcb5b90153d7c2a667', '2026-10-29 09:49:34.05', '2026-10-22 09:57:00.704', '2026-10-22 09:49:34.05', 2);
INSERT INTO public.refresh_tokens VALUES (888, NULL, '1290b53793d20edaf03cc8c42766fdf5f73a8a2f4e2409d229285ba6e1a0f8da', '2026-10-29 09:57:00.704', '2026-10-22 09:57:11.25', '2026-10-22 09:57:00.704', 2);
INSERT INTO public.refresh_tokens VALUES (889, NULL, '4503add56aa8f7121f8afa92cb45b16ba20608b80b276bdb8c1920222c3494e3', '2026-11-21 09:57:19.724', '2026-10-22 09:57:26.712', '2026-10-22 09:57:19.724', 1);
INSERT INTO public.refresh_tokens VALUES (890, NULL, 'd9fd17ce303491bdfc50292620b23bb10a564b47de8edd7a9cc788691e6aa99e', '2026-10-29 09:57:26.712', '2026-10-22 09:57:29.611', '2026-10-22 09:57:26.712', 1);
INSERT INTO public.refresh_tokens VALUES (1037, NULL, '60416c94a52938fb86def61e65b0c2ce151ed740ee9ec8d7e973776a9ecd85c6', '2026-11-22 03:45:47.62', '2026-10-23 03:46:22.323', '2026-10-23 03:45:47.62', 2);
INSERT INTO public.refresh_tokens VALUES (1024, NULL, 'ce7a4c1785b8827bb0e4412690e3c96de9283bb208d0a9632293847ae7f45a0f', '2026-10-30 03:38:54.386', '2026-10-23 03:53:54.397', '2026-10-23 03:38:54.386', 2);
INSERT INTO public.refresh_tokens VALUES (1041, NULL, '9ee1d9820a94669c12a3d91b425b6e356762505ed4c3340641cdebbb0bb2b463', '2026-11-22 03:54:45.289', '2026-10-23 03:54:49.817', '2026-10-23 03:54:45.289', 2);
INSERT INTO public.refresh_tokens VALUES (1042, NULL, '408e3c92106855abb144ff52b8188002769a6b98b257c68af5988d0434ddfe55', '2026-10-30 03:54:49.817', '2026-10-23 03:54:51.229', '2026-10-23 03:54:49.817', 2);
INSERT INTO public.refresh_tokens VALUES (1043, NULL, 'ca3a85656dc572213c34fe74832266b1e8c05b0db2b6d6e61e11d96be3859fc1', '2026-10-30 03:54:51.229', '2026-10-23 03:54:51.383', '2026-10-23 03:54:51.229', 2);
INSERT INTO public.refresh_tokens VALUES (1044, NULL, '58b498212f1a3c37278a3a030801022b5517e81e0f24e6b06bcfb78f6ff85342', '2026-10-30 03:54:51.383', '2026-10-23 03:55:09.835', '2026-10-23 03:54:51.383', 2);
INSERT INTO public.refresh_tokens VALUES (1053, NULL, '76de930f94527fd51408d37f33216e6cf006ea7e09a68c2db704f33c99321a34', '2026-10-30 03:56:05.76', '2026-10-23 03:56:08.041', '2026-10-23 03:56:05.76', 2);
INSERT INTO public.refresh_tokens VALUES (1054, NULL, '40da4ac4ddac2724a5bd597dfb91077911898720c842bb3f33e28c3fe7511443', '2026-10-30 03:56:08.041', '2026-10-23 03:56:09.143', '2026-10-23 03:56:08.041', 2);
INSERT INTO public.refresh_tokens VALUES (1055, NULL, '3b3b80ca42840c9dd72eb903be7128b442a71c7ed96ccd7abc388df57228bc5e', '2026-10-30 03:56:09.143', '2026-10-23 03:56:17.895', '2026-10-23 03:56:09.143', 2);
INSERT INTO public.refresh_tokens VALUES (1039, NULL, '2a6ddca0ba687ed6f49c47f682d0267c7f1f77b22b63c05aabe1b5ec923c492b', '2026-10-30 03:53:54.398', '2026-10-23 04:08:54.401', '2026-10-23 03:53:54.398', 2);
INSERT INTO public.refresh_tokens VALUES (891, NULL, 'f5f11a2038dbf5a5a578af210ebfa6ce7fbf541558a3b418ee8ae166462fa9ac', '2026-11-21 09:57:52.582', '2026-10-22 09:58:06.616', '2026-10-22 09:57:52.582', 2);
INSERT INTO public.refresh_tokens VALUES (892, NULL, '3d2e6823b5ca0f9ebf89e8e917df912f8bf4b6c5c82651a39d123000b202caa2', '2026-10-29 09:58:06.616', '2026-10-22 09:58:10.709', '2026-10-22 09:58:06.616', 2);
INSERT INTO public.refresh_tokens VALUES (953, NULL, '813ec7d39692c19481752e7b9c4f7d63c2e4fe0691ca4fb1b8706d58b9c57608', '2026-10-30 01:34:52.904', NULL, '2026-10-23 01:34:52.904', 2);
INSERT INTO public.refresh_tokens VALUES (339, NULL, '69922307984510b711effd11d26cd61273f697ee0c1c2d8960437f25f99bda37', '2026-10-20 12:25:55.039', NULL, '2026-10-13 12:25:55.039', 2);
INSERT INTO public.refresh_tokens VALUES (962, NULL, '0dc5db9acc3e1c0700d9285f4a07e468e386dafd5e117273e4d8de2cf37bf479', '2026-10-30 02:07:57.274', '2026-10-23 02:23:54.334', '2026-10-23 02:07:57.274', 2);
INSERT INTO public.refresh_tokens VALUES (998, NULL, 'b9df75c485152953a9b3274df1c0d6d502a80a2a163512219bfc799bb9cb0a1f', '2026-10-30 03:23:54.385', '2026-10-23 03:38:54.386', '2026-10-23 03:23:54.385', 2);
INSERT INTO public.refresh_tokens VALUES (893, NULL, 'f8a69141df0e9845b5d985429ae883987fa09e373c1cf6c02d2e165cd903112d', '2026-10-29 09:58:10.709', '2026-10-22 10:04:39.446', '2026-10-22 09:58:10.709', 2);
INSERT INTO public.refresh_tokens VALUES (398, NULL, '05a86ce3f7e074ba278e121194cf4579326ed62ad855b1db0d4dbd6acd79eb10', '2026-10-25 00:23:32.954', '2026-10-18 00:39:32.898', '2026-10-18 00:23:32.954', 2);
INSERT INTO public.refresh_tokens VALUES (1339, NULL, '6a2d604e3ed3bc45dccb5e88b5fa4642f46a3d5e9b2558d79ce9f9f6287b3df5', '2026-11-03 06:07:03.316', NULL, '2026-10-27 06:07:03.316', 2);
INSERT INTO public.refresh_tokens VALUES (399, NULL, 'cb4f1fc820cb7bb43516a808582b1fb28babbb318c126f8991fcfaec5a5240ec', '2026-10-25 00:24:32.971', '2026-10-18 00:39:14.384', '2026-10-18 00:24:32.971', 1);
INSERT INTO public.refresh_tokens VALUES (894, NULL, '039444b0c379c6c1510eb6e89ad6c5d264d83ffd26dade654ac8cfd051148599', '2026-10-29 10:04:39.446', '2026-10-22 10:04:46.788', '2026-10-22 10:04:39.446', 2);
INSERT INTO public.refresh_tokens VALUES (896, NULL, 'e15fcbdd13abcefc15d99e50fbb40fd8b0460a504233af8cd05854fec026b476', '2026-11-21 10:05:27.278', '2026-10-22 10:05:41.214', '2026-10-22 10:05:27.278', 2);
INSERT INTO public.refresh_tokens VALUES (902, NULL, '3772a75d62db250b7a9332f545463e2392047ae8b283b2b9daa9d3288e45cdb1', '2026-10-29 10:28:48.77', NULL, '2026-10-22 10:28:48.77', 2);
INSERT INTO public.refresh_tokens VALUES (903, NULL, 'd6e1115e01d42daff22e831a4221a421ad6b6e3f250f193ef4fd6bde3aeced46', '2026-10-29 10:36:00.787', '2026-10-22 10:36:12.006', '2026-10-22 10:36:00.787', 2);
INSERT INTO public.refresh_tokens VALUES (403, NULL, '7c940c66a3da4d767ad71f15920d793f6d2d19b71699b5459d1983c66ccd7e6c', '2026-11-17 00:44:40.707', '2026-10-18 01:00:32.894', '2026-10-18 00:44:40.707', 1);
INSERT INTO public.refresh_tokens VALUES (1148, NULL, '7c2bf82bdfc1a186f711b9a9e549e17ce5de9de7d4ec77685437b53012a37c14', '2026-10-30 07:54:02.527', '2026-10-23 07:55:02.047', '2026-10-23 07:54:02.527', 1);
INSERT INTO public.refresh_tokens VALUES (895, NULL, 'c574129047e37f52dde4ef80b4d2c8dfeba2d6300efeaa0c655982870e867a0f', '2026-11-21 10:04:56.781', '2026-10-22 10:05:20.13', '2026-10-22 10:04:56.781', 2);
INSERT INTO public.refresh_tokens VALUES (1340, NULL, '14ddfd74e123146c84bc1af6c3849e1f205a7b6d1d8cfe4ef5419d3e082585e8', '2026-11-03 06:11:53.246', NULL, '2026-10-27 06:11:53.246', 2);
INSERT INTO public.refresh_tokens VALUES (897, NULL, '4f61d1894c5522db5961d1fc9be36aa10ea807322b0f3513ec1261824fd06bee', '2026-10-29 10:05:41.214', '2026-10-22 10:05:47.694', '2026-10-22 10:05:41.214', 2);
INSERT INTO public.refresh_tokens VALUES (900, NULL, '99a598ab3d4f098c25f407d893617564695d7a5f068e0f4b2125a7fad8bbeacd', '2026-10-29 10:13:04.002', NULL, '2026-10-22 10:13:04.002', 2);
INSERT INTO public.refresh_tokens VALUES (901, NULL, '1ba2ee37159a7a377f79f64c263c12a712bcb919e4e3cc0cb6959c7215630350', '2026-10-29 10:13:32.468', NULL, '2026-10-22 10:13:32.468', 2);
INSERT INTO public.refresh_tokens VALUES (898, NULL, '4f82806e598a90d99482b022dbef3c72fb611c86f591012403e689fcd818f7cb', '2026-11-21 10:05:54.16', '2026-10-22 10:36:00.786', '2026-10-22 10:05:54.16', 2);
INSERT INTO public.refresh_tokens VALUES (956, NULL, 'ddb98c1ddeaf0fe0a400a5073f338870e295b2e3401edba6540947e1108f9c0c', '2026-10-30 01:41:19.042', NULL, '2026-10-23 01:41:19.042', 2);
INSERT INTO public.refresh_tokens VALUES (1003, NULL, '9280dd6e414477be2a50a34778d6912f0289143cc616b172e0ab9b82c70b5bdf', '2026-11-22 03:35:20.427', '2026-10-23 03:35:24.576', '2026-10-23 03:35:20.427', 1);
INSERT INTO public.refresh_tokens VALUES (1004, NULL, '7055d9d7f13c1e37f11239a05a957371445da7839c55eb96302af7761e256779', '2026-11-22 03:35:30.775', '2026-10-23 03:35:35.168', '2026-10-23 03:35:30.775', 2);
INSERT INTO public.refresh_tokens VALUES (504, NULL, '5909256874ad7f3d90fd930a81e68923ad5776acfea59a47badefdb476351add', '2026-10-25 02:57:17.55', '2026-10-18 03:12:32.891', '2026-10-18 02:57:17.55', 2);
INSERT INTO public.refresh_tokens VALUES (959, NULL, 'e149dfe169689c319c5507b212b891f2c472d9a0c9375dd983770d0d4e5cc24f', '2026-11-22 01:52:56.262', '2026-10-23 02:07:57.274', '2026-10-23 01:52:56.262', 2);
INSERT INTO public.refresh_tokens VALUES (1005, NULL, 'f5eba1cf8f3fa66570f5d2b95abb5a90082f17bdd2c357c59589a5cd74290521', '2026-10-30 03:35:35.168', '2026-10-23 03:35:44.95', '2026-10-23 03:35:35.168', 2);
INSERT INTO public.refresh_tokens VALUES (1149, NULL, '7a4d742c04b3ad5bd934d17a27ff521993a3c9429fb96dd691b3bcddae2ca0ea', '2026-10-30 07:55:02.047', '2026-10-23 07:56:02.147', '2026-10-23 07:55:02.047', 1);
INSERT INTO public.refresh_tokens VALUES (906, NULL, '53adeb0c6d26512a2875c4c2b818513443e6568f086fcd1a5932db9f4240fb02', '2026-11-21 10:53:14.471', '2026-10-22 11:08:56.682', '2026-10-22 10:53:14.472', 1);
INSERT INTO public.refresh_tokens VALUES (814, NULL, '4e212c0e8caaad92b4d52cd303036aae882a689f9c9da0b1fd8b34bd70cc5e06', '2026-10-25 04:57:32.912', NULL, '2026-10-18 04:57:32.912', 2);
INSERT INTO public.refresh_tokens VALUES (907, NULL, 'f92961729c2ba9f4edb094a9f0fdac93f001b65f82d044da12a471a42cc328ab', '2026-10-29 11:08:56.682', NULL, '2026-10-22 11:08:56.682', 1);
INSERT INTO public.refresh_tokens VALUES (655, NULL, 'e608380a02b5820d4a3b4b94abc69f450965b8a8077eab2af6cd25b79efce749', '2026-10-25 03:38:27.385', '2026-10-18 03:53:32.885', '2026-10-18 03:38:27.385', 2);
INSERT INTO public.refresh_tokens VALUES (1150, NULL, '402e3db043128c7765921c34bc8f84745fd81b9e6668f02f2536f089a37eec7e', '2026-10-30 07:56:02.147', '2026-10-23 07:57:02.13', '2026-10-23 07:56:02.147', 1);
INSERT INTO public.refresh_tokens VALUES (715, NULL, '6f701a320403c4713d4f4afc4555b9292ba98b98d9fd5e3329eb9753bc457a69', '2026-10-25 04:10:32.932', '2026-10-18 04:18:43.238', '2026-10-18 04:10:32.932', 2);
INSERT INTO public.refresh_tokens VALUES (6, NULL, '7330259bed1dada3d16cc6240cc0af746649b9bc6d52fcf4601780f7d460e26e', '2026-11-08 06:28:44.397', NULL, '2026-10-09 06:28:44.397', 1);
INSERT INTO public.refresh_tokens VALUES (8, NULL, 'f69cbfd718a47fffed78d2d8a2b0b95b1e7f183543b2ccb57e62d046777f6861', '2026-11-08 06:42:16.287', '2026-10-09 06:42:19.336', '2026-10-09 06:42:16.287', 1);
INSERT INTO public.refresh_tokens VALUES (30, NULL, 'c98a82685a2bcbf6a34f7ffc69c96eae24a78ea172dc19b625a5e9bc7fc5c28b', '2026-11-08 09:17:38.565', '2026-10-09 09:23:50.001', '2026-10-09 09:17:38.565', 2);
INSERT INTO public.refresh_tokens VALUES (39, NULL, 'df6999f71737e4acbad66574d3e7fe96a14f6640b296937fa2af96072ef79920', '2026-11-08 10:09:52.951', '2026-10-09 10:09:55.685', '2026-10-09 10:09:52.951', 2);
INSERT INTO public.refresh_tokens VALUES (40, NULL, '887d6de46d21684d9e65322612f29b6a535a0227ffb759fa00788867e10f42d3', '2026-11-08 10:10:01.573', '2026-10-09 10:10:07.507', '2026-10-09 10:10:01.573', 2);
INSERT INTO public.refresh_tokens VALUES (42, NULL, '54d06635a48b38e2afd0399cac5275953fa05c29811736c6e83397c89006bdfc', '2026-11-08 10:11:11.531', '2026-10-09 10:11:21.895', '2026-10-09 10:11:11.531', 2);
INSERT INTO public.refresh_tokens VALUES (44, NULL, '8436238a9468097020e6bd5d8d81479b232f1c914f023d924d6807b9aefa5ec9', '2026-11-08 10:12:38.155', '2026-10-09 10:12:42.81', '2026-10-09 10:12:38.155', 2);
INSERT INTO public.refresh_tokens VALUES (75, NULL, '7babc2f5b0b93f64990921e01cc085317d0db94fdbd7f0dd9d9ff2d21e2bd527', '2026-11-08 20:03:53.936', NULL, '2026-10-09 20:03:53.936', 1);
INSERT INTO public.refresh_tokens VALUES (127, NULL, '5a8dcf08df57fc15fa27d962a794d6f79347d8e428592a4626c260b3d9d9eab9', '2026-10-17 09:41:30.169', '2026-10-11 11:28:33.144', '2026-10-10 09:41:30.169', 1);
INSERT INTO public.refresh_tokens VALUES (80, NULL, '1dd48032330cf528e42e7ddaff294fa9b31d336c5e6fbd3ea7d3a679dd92b610', '2026-10-16 23:09:42.134', '2026-10-09 23:51:22.964', '2026-10-09 23:09:42.134', 2);
INSERT INTO public.refresh_tokens VALUES (81, NULL, 'a94bf8900ba92fd1fbbcee29a1114ae6a71ddeb6aa0b9ddea80145619023821e', '2026-10-16 23:51:23.011', '2026-10-09 23:52:22.644', '2026-10-09 23:51:23.011', 2);
INSERT INTO public.refresh_tokens VALUES (82, NULL, 'a8856beae181849fdd0dfc828e02f428c14ccdbeda33d9395482f2233c192bc2', '2026-10-16 23:52:22.678', '2026-10-10 03:34:44.578', '2026-10-09 23:52:22.678', 2);
INSERT INTO public.refresh_tokens VALUES (153, NULL, 'ce61c4621361f74e469fb6cfe71fa7420106d58b1fefe6be8ce5fb2b07d01ee2', '2026-11-10 11:29:19.296', '2026-10-11 11:44:21.595', '2026-10-11 11:29:19.296', 2);
INSERT INTO public.refresh_tokens VALUES (155, NULL, '7eaec48830f04c9d4435d7e10d6abf0bae920911fa36b9687ed315ecdea4785e', '2026-10-18 11:44:21.665', '2026-10-11 12:24:15.755', '2026-10-11 11:44:21.665', 2);
INSERT INTO public.refresh_tokens VALUES (85, NULL, '804e357fed573ce530e2a394f340e61abdb1c13a45172024870f3cadb2532be4', '2026-10-17 03:34:50.91', '2026-10-10 04:18:14.109', '2026-10-10 03:34:50.91', 2);
INSERT INTO public.refresh_tokens VALUES (160, NULL, 'e0a5ba456895fd8dd3407139fa7cb607893fe6f8c9faf015715e254359345643', '2026-10-18 12:27:34.701', '2026-10-11 12:43:03.674', '2026-10-11 12:27:34.701', 2);
INSERT INTO public.refresh_tokens VALUES (115, NULL, '5d8e9cd0b03bd14ec1b598711574d2336498b6dc844f83a0e68369cb939419b5', '2026-11-09 07:56:08.431', '2026-10-10 08:59:56.742', '2026-10-10 07:56:08.431', 2);
INSERT INTO public.refresh_tokens VALUES (966, NULL, '7e46929298e79f6ef7898b11207d60244c0ac480b36812651c4a43944da079ef', '2026-10-30 02:23:54.334', '2026-10-23 02:38:54.359', '2026-10-23 02:23:54.334', 2);
INSERT INTO public.refresh_tokens VALUES (123, NULL, 'c95d1d304c080f9bc88b40b48919485c9b623283af7900d9777c71596beb6c38', '2026-10-17 08:59:56.793', '2026-10-10 09:25:38.876', '2026-10-10 08:59:56.794', 2);
INSERT INTO public.refresh_tokens VALUES (249, NULL, 'ed5fabe49b53dfc96aec798eff6026ce8c4effe506957f30b53e49bd68e14b70', '2026-10-20 09:20:31.584', '2026-10-13 09:21:31.56', '2026-10-13 09:20:31.584', 2);
INSERT INTO public.refresh_tokens VALUES (152, NULL, 'e16b615edcb63b3312d33cfbea5d15505ad185719a1b773d7f5faf9c1bb6d090', '2026-10-18 11:28:33.207', '2026-10-11 11:29:06.872', '2026-10-11 11:28:33.207', 1);
INSERT INTO public.refresh_tokens VALUES (77, NULL, 'dac98b46c3761cc4c8b22f52bc7b608899ba9d4aeb30c28f96edc761d881d1ce', '2026-11-08 22:46:50.487', '2026-10-09 23:09:42.099', '2026-10-09 22:46:50.487', 2);
INSERT INTO public.refresh_tokens VALUES (84, NULL, '3283a02c7dd340877a7f52d562754a27216c33a85fdda646a63f0d48e75c28ca', '2026-10-17 03:34:44.624', '2026-10-10 03:34:50.865', '2026-10-10 03:34:44.624', 2);
INSERT INTO public.refresh_tokens VALUES (156, NULL, '1a51bdc114c15c5fc392c32137049dbc1d296fff5dda98f1f411df5fb908f777', '2026-10-18 12:24:15.818', '2026-10-11 12:27:34.618', '2026-10-11 12:24:15.818', 2);
INSERT INTO public.refresh_tokens VALUES (163, NULL, 'cdf9de1739f4544aa5f2b935fc7f179838e276d744a223d3eca924600d836451', '2026-10-18 12:43:03.753', '2026-10-11 12:51:32.991', '2026-10-11 12:43:03.753', 2);
INSERT INTO public.refresh_tokens VALUES (165, NULL, '2b13a0d5b5565bc576fdcd6fd82258d2ae61334c9cf8959a905b42c427fc8f07', '2026-10-18 12:51:33.058', '2026-10-11 19:37:14.319', '2026-10-11 12:51:33.058', 2);
INSERT INTO public.refresh_tokens VALUES (124, NULL, 'cb182f19a56a5672e084970eb4c214f1e1434935c7c7a9d6e121e426e6d8061e', '2026-10-17 09:25:38.95', '2026-10-10 09:25:43.228', '2026-10-10 09:25:38.95', 2);
INSERT INTO public.refresh_tokens VALUES (125, NULL, '8b2265d6b82e46db7de33a3bb87836cb8bce320d27ea74729eba37123d674ee6', '2026-11-09 09:26:09.931', '2026-10-10 09:27:51.504', '2026-10-10 09:26:09.931', 1);
INSERT INTO public.refresh_tokens VALUES (126, NULL, '9b4ff192257e354951949d30989b35ac3a57b3db657d23dfc0a2f1605d015957', '2026-10-17 09:27:51.552', '2026-10-10 09:41:30.109', '2026-10-10 09:27:51.552', 1);
INSERT INTO public.refresh_tokens VALUES (172, NULL, 'aecf7480b461cfe5a2206e774d9090e653eda72738fd543a2b92bf3f17876feb', '2026-10-18 19:37:14.357', '2026-10-11 20:29:41.201', '2026-10-11 19:37:14.357', 2);
INSERT INTO public.refresh_tokens VALUES (182, NULL, 'aac6489c1e7a38bbc6e4c79a3947f445b36e3ad38027cfb44a0df5681c0476dd', '2026-11-12 05:51:32.762', '2026-10-13 05:55:13.169', '2026-10-13 05:51:32.762', 2);
INSERT INTO public.refresh_tokens VALUES (184, NULL, 'cf4213f7f68bd45e56ba4112488b4a810961bfca174aaf6238b7e61f13c40217', '2026-10-20 05:55:13.25', '2026-10-13 06:19:18.246', '2026-10-13 05:55:13.25', 2);
INSERT INTO public.refresh_tokens VALUES (186, NULL, '60422e146d2ed2a4899d65053e1315cc2ea7652a0d9e154512a4f980a6c1d5ca', '2026-11-12 06:01:49.913', '2026-10-13 06:21:11.534', '2026-10-13 06:01:49.913', 2);
INSERT INTO public.refresh_tokens VALUES (188, NULL, '4ffeb5ab8b8b4cebe0e10aede699bb817875a3110b0d88afe610f174b4fedff8', '2026-10-20 06:19:18.285', '2026-10-13 06:21:34.669', '2026-10-13 06:19:18.285', 2);
INSERT INTO public.refresh_tokens VALUES (174, NULL, '1f2a93abfcd8317f7d04f56cdeb144bb02cd1fa0f0508ba77e7a09039f43bce9', '2026-10-18 20:29:41.291', '2026-10-13 06:29:35.295', '2026-10-11 20:29:41.291', 2);
INSERT INTO public.refresh_tokens VALUES (198, NULL, '08411aa53e2e9d81b85d025099374140650d3cc16a17e9f644914866a138e48d', '2026-10-20 06:29:35.478', '2026-10-13 06:43:00.506', '2026-10-13 06:29:35.478', 2);
INSERT INTO public.refresh_tokens VALUES (202, NULL, '4fa498efccddfafebe4c6d3541a6056d08b26cd459bbb6fc2655f652ed648347', '2026-10-20 06:43:00.56', '2026-10-13 06:51:36.24', '2026-10-13 06:43:00.56', 2);
INSERT INTO public.refresh_tokens VALUES (204, NULL, 'a528d96e87be11c0abd11db3ecdfae4d154bd01b4ae589cc3c768e3125639cd7', '2026-10-20 06:51:36.298', '2026-10-13 07:02:02.238', '2026-10-13 06:51:36.298', 2);
INSERT INTO public.refresh_tokens VALUES (209, NULL, '9b4e707b84d282ed974ad94817be602231f72a434f163f521117bb7b16c6228f', '2026-10-20 07:02:02.296', '2026-10-13 07:32:16.502', '2026-10-13 07:02:02.296', 2);
INSERT INTO public.refresh_tokens VALUES (220, NULL, '282708486623841dba856845ba576e88c6aec3f1a52070a63cfcb61c3ac6ecd4', '2026-10-20 07:32:16.542', '2026-10-13 08:19:05.555', '2026-10-13 07:32:16.542', 2);
INSERT INTO public.refresh_tokens VALUES (226, NULL, '55879f7ab9fafaee4c0d3fa46880814605afabcb70a424f91da9f65c86196e00', '2026-11-12 08:11:33.436', NULL, '2026-10-13 08:11:33.436', 2);
INSERT INTO public.refresh_tokens VALUES (250, NULL, '5f7a0cfae7fc98b42675e2a73d37ae448766ca933e6720e97102d8669e1419f1', '2026-10-20 09:21:31.6', '2026-10-13 09:22:31.532', '2026-10-13 09:21:31.6', 2);
INSERT INTO public.refresh_tokens VALUES (228, NULL, '4dff0d739328468632fe0e810687b8035b12a927eb3878938b0e725c86d36abe', '2026-10-20 08:19:05.587', '2026-10-13 08:19:50.141', '2026-10-13 08:19:05.587', 2);
INSERT INTO public.refresh_tokens VALUES (251, NULL, '6b046ed09fab6a991b6447c64cd431e79c81aa956f7de76e49a1072d3b2de7e2', '2026-10-20 09:22:31.568', '2026-10-13 09:23:31.547', '2026-10-13 09:22:31.568', 2);
INSERT INTO public.refresh_tokens VALUES (252, NULL, 'b31de1d568033f2f56df1eec97168a633917cc0d209c6729bbf94f01cd34ebed', '2026-10-20 09:23:31.587', '2026-10-13 09:24:31.495', '2026-10-13 09:23:31.587', 2);
INSERT INTO public.refresh_tokens VALUES (253, NULL, '8e48d5b56dfc3eebc5c35328c9288530b080b9cbb01bc54b64cd4d79be148eef', '2026-10-20 09:24:31.531', '2026-10-13 09:25:31.523', '2026-10-13 09:24:31.531', 2);
INSERT INTO public.refresh_tokens VALUES (229, NULL, 'f73db6b9b90af064941105d22c79d3dbf9bd92e85af873a279571fd677c73f2f', '2026-10-20 08:19:50.236', '2026-10-13 09:17:31.717', '2026-10-13 08:19:50.236', 2);
INSERT INTO public.refresh_tokens VALUES (255, NULL, '8b9d70401a41809923151954a77cfc9af54fe14baa6c943d79876eb9283ea2b1', '2026-10-20 09:26:31.563', '2026-10-13 09:27:31.592', '2026-10-13 09:26:31.563', 2);
INSERT INTO public.refresh_tokens VALUES (256, NULL, '4e4c1ad0262ee8b4818bf4d4f5b77a803b075ebad0d929ec43046fe1f983f36a', '2026-10-20 09:27:31.631', '2026-10-13 09:28:31.359', '2026-10-13 09:27:31.631', 2);
INSERT INTO public.refresh_tokens VALUES (257, NULL, 'fcc0ad12440fa1a12e8cc6d5a29f16444328903c882f626da4dff41f5200c1bb', '2026-10-20 09:28:31.396', '2026-10-13 09:29:31.556', '2026-10-13 09:28:31.396', 2);
INSERT INTO public.refresh_tokens VALUES (264, NULL, '83b83631fc060ab833329eb684e6b52eed94c9ca7e4c391d3b3efcb19497675c', '2026-10-20 09:32:31.417', '2026-10-13 09:33:31.459', '2026-10-13 09:32:31.417', 2);
INSERT INTO public.refresh_tokens VALUES (268, NULL, '1ed0f414caeeff57845764acb0b7814f089cd77f86a644f415b787000efe2199', '2026-10-20 09:35:31.602', '2026-10-13 09:36:31.373', '2026-10-13 09:35:31.602', 2);
INSERT INTO public.refresh_tokens VALUES (274, NULL, 'd20dd56efaeb04da7eb0ee36ae11467cc7d4d857a5e644eecc9b7fc00f26b402', '2026-10-20 09:40:31.602', '2026-10-13 09:41:31.484', '2026-10-13 09:40:31.602', 2);
INSERT INTO public.refresh_tokens VALUES (275, NULL, 'b1c9bc79ddc678ea4fa7c9bcb2aaae4a37c34dc984b46fc7476be802c70137bd', '2026-10-20 09:41:31.512', '2026-10-13 09:42:31.51', '2026-10-13 09:41:31.512', 2);
INSERT INTO public.refresh_tokens VALUES (278, NULL, '136448e261a3449a2398683ab28219ba24da4217a3f133bc75480fb0dd524911', '2026-10-20 09:44:31.401', '2026-10-13 09:45:31.314', '2026-10-13 09:44:31.401', 2);
INSERT INTO public.refresh_tokens VALUES (281, NULL, '04593dc45931c81158b57b415128c641c5863914aa6dbd58d516de74de9880f4', '2026-10-20 09:46:31.344', '2026-10-13 09:47:31.315', '2026-10-13 09:46:31.344', 2);
INSERT INTO public.refresh_tokens VALUES (284, NULL, '8fe7ebd54d73a3ccce5746f6537ccfe4d8464318fb78aaab1dc8bf4f03063cb8', '2026-10-20 09:47:31.344', '2026-10-13 09:48:31.345', '2026-10-13 09:47:31.344', 2);
INSERT INTO public.refresh_tokens VALUES (285, NULL, '04f89398373be978769071b8da50b587f7ceac598d43d7c828ca6fd87ecdc93f', '2026-10-20 09:48:31.374', '2026-10-13 09:49:31.388', '2026-10-13 09:48:31.374', 2);
INSERT INTO public.refresh_tokens VALUES (288, NULL, '17e23f6f1cb0ae1501c25adbdb2ed5c1e5c433fc3feab6017d25a04b103548e6', '2026-10-20 09:51:31.346', '2026-10-13 09:52:31.356', '2026-10-13 09:51:31.346', 2);
INSERT INTO public.refresh_tokens VALUES (289, NULL, 'c1a109bfa97770092fcd6e34a4f2b786b0ed50797b8e2ac09598a89904ba86cf', '2026-10-20 09:52:31.405', '2026-10-13 09:53:31.368', '2026-10-13 09:52:31.405', 2);
INSERT INTO public.refresh_tokens VALUES (290, NULL, '4747dfdd8ea6293321ca93ce13ca405852cd5aeb18c75964fcb1fbe0fb9c3d35', '2026-10-20 09:53:31.411', '2026-10-13 09:54:31.511', '2026-10-13 09:53:31.411', 2);
INSERT INTO public.refresh_tokens VALUES (297, NULL, '5abbe79913b9073b49b3830b42034184f68a1025f6b54d956f5513d7e8e5e3c1', '2026-10-20 10:00:31.406', '2026-10-13 10:01:31.353', '2026-10-13 10:00:31.406', 2);
INSERT INTO public.refresh_tokens VALUES (299, NULL, '4989ce35da13e4d50f94e1e87824e9c89e91b1ed9f4bd5e6c6ae5cbb5871ea5d', '2026-10-20 10:01:31.404', '2026-10-13 10:02:31.421', '2026-10-13 10:01:31.404', 2);
INSERT INTO public.refresh_tokens VALUES (302, NULL, '8a47172b6b7a6ba9cf429776a32fe285a70b609da17146b8bdf15a1825fc7f42', '2026-10-20 10:04:31.612', '2026-10-13 10:05:31.54', '2026-10-13 10:04:31.612', 2);
INSERT INTO public.refresh_tokens VALUES (304, NULL, '6594e9d929f265d68a2a86e7eed2df0eb2b6af6d48205059f4153221dca08d92', '2026-10-20 10:06:31.446', '2026-10-13 10:07:31.403', '2026-10-13 10:06:31.446', 2);
INSERT INTO public.refresh_tokens VALUES (306, NULL, '3f49396beb5990b6e9b14a0b0844f8a2d181d5cb2108e5de0e0fba95fc0de870', '2026-10-20 10:08:31.497', '2026-10-13 10:09:31.419', '2026-10-13 10:08:31.497', 2);
INSERT INTO public.refresh_tokens VALUES (307, NULL, 'a678df96beeec8232f25721f1c48982237a72216febfd98f4103b8a7ec30f483', '2026-10-20 10:09:31.466', '2026-10-13 11:29:20.991', '2026-10-13 10:09:31.466', 2);
INSERT INTO public.refresh_tokens VALUES (88, NULL, '1795f9dcd0eb026f936a7018cb8d80f8093d287dc91acea0afdb6fde34f22e09', '2026-10-17 04:18:14.154', '2026-10-13 11:31:43.578', '2026-10-10 04:18:14.154', 2);
INSERT INTO public.refresh_tokens VALUES (322, NULL, '246fc13ee8c39949ddf4dfbef1a6c23dc820b0ea5c3f60de51d512fd7c57a84a', '2026-10-20 11:31:43.611', '2026-10-13 11:31:49.1', '2026-10-13 11:31:43.611', 2);
INSERT INTO public.refresh_tokens VALUES (327, NULL, '1c46fcd84f9daa2259f8efe603d4a1f9c3b94a115077abc02622f3644c1e0f2e', '2026-10-20 12:19:54.076', '2026-10-13 12:20:52.555', '2026-10-13 12:19:54.076', 2);
INSERT INTO public.refresh_tokens VALUES (333, NULL, '89ae04cab6e518dda636aea88f555f04affb1dc634efa03359d6c4de00c9abf9', '2026-10-20 12:23:25.634', '2026-10-13 12:23:32.493', '2026-10-13 12:23:25.634', 2);
INSERT INTO public.refresh_tokens VALUES (334, NULL, '4817c9fc915987eb74ea1bd3691939d429671343109e517d35693a1c91367d55', '2026-10-20 12:23:32.527', '2026-10-13 12:23:59.585', '2026-10-13 12:23:32.527', 2);
INSERT INTO public.refresh_tokens VALUES (335, NULL, 'c0ba3c65306ccb7a3f33fe8e31c0e7a3a90e3dcf897d3967da21df06d3c0d603', '2026-11-12 12:24:27.234', '2026-10-13 12:24:57.692', '2026-10-13 12:24:27.234', 2);
INSERT INTO public.refresh_tokens VALUES (321, NULL, '6380cfd3d701d09faa06116e5e1c6b2e456e6551527d171892efa80a607cad56', '2026-10-20 11:29:21.023', '2026-10-15 05:38:19.115', '2026-10-13 11:29:21.023', 2);
INSERT INTO public.refresh_tokens VALUES (254, NULL, '2a612d7f4fdc8be316c3ad412512f16382a5240770626adbad65aba5e0f81e3e', '2026-10-20 09:25:31.572', '2026-10-13 09:26:31.525', '2026-10-13 09:25:31.572', 2);
INSERT INTO public.refresh_tokens VALUES (258, NULL, '66cec10b0d2d7168485dac268d8c0df0cb487e11afba6b38755393d656a584ee', '2026-10-20 09:29:31.659', '2026-10-13 09:30:31.842', '2026-10-13 09:29:31.659', 2);
INSERT INTO public.refresh_tokens VALUES (246, NULL, 'd24a13b1ffb89ee72707eb62ce350894e92e6d091bc992ac76c7906af75fc815', '2026-10-20 09:17:31.764', '2026-10-13 09:18:31.34', '2026-10-13 09:17:31.764', 2);
INSERT INTO public.refresh_tokens VALUES (247, NULL, 'a2b542cb038a864e9bc31324ab1b4d09d3bab2daca05ea0d0a1dc705de0a9104', '2026-10-20 09:18:31.379', '2026-10-13 09:19:31.403', '2026-10-13 09:18:31.379', 2);
INSERT INTO public.refresh_tokens VALUES (260, NULL, '48294bfa01b486bfebc510dab1a7bb1d2bf975a486f03095ef11a4bd52413b7e', '2026-10-20 09:30:31.882', '2026-10-13 09:31:31.397', '2026-10-13 09:30:31.882', 2);
INSERT INTO public.refresh_tokens VALUES (263, NULL, '5468b3301f7bef72876da9a48a69e9df4cd17763e123f44573f10fc969d0b71c', '2026-10-20 09:31:31.436', '2026-10-13 09:32:31.379', '2026-10-13 09:31:31.436', 2);
INSERT INTO public.refresh_tokens VALUES (265, NULL, 'd04dbcc4c847db6dff699d5aa8ef6dc671b04a2e6cc5efce02789fe6b8ba96f9', '2026-10-20 09:33:31.498', '2026-10-13 09:33:50.735', '2026-10-13 09:33:31.498', 2);
INSERT INTO public.refresh_tokens VALUES (266, NULL, 'd3877fa2f8bdd4daf3d29b068725cce33a652a1bb7343ce0a63fc0c1ec3d30dc', '2026-10-20 09:33:50.789', '2026-10-13 09:34:31.53', '2026-10-13 09:33:50.789', 2);
INSERT INTO public.refresh_tokens VALUES (267, NULL, 'f1162dfe8cd761f11ac856e5544f26f2b5459fde3c9578b099c5ddae4a36cc3a', '2026-10-20 09:34:31.569', '2026-10-13 09:35:31.559', '2026-10-13 09:34:31.569', 2);
INSERT INTO public.refresh_tokens VALUES (270, NULL, '0468cae479a176122a156eee8bc90e319ba8f6170c360433c478a997799990b1', '2026-10-20 09:36:31.409', '2026-10-13 09:37:31.492', '2026-10-13 09:36:31.409', 2);
INSERT INTO public.refresh_tokens VALUES (271, NULL, 'a8d70b425e1073f5b1d28e2b75456f7c8771cb91e54cbac7874d89d2ea33b902', '2026-10-20 09:37:31.542', '2026-10-13 09:38:31.581', '2026-10-13 09:37:31.542', 2);
INSERT INTO public.refresh_tokens VALUES (272, NULL, 'e4fbe10fb8a3841cc3f6f0493b674140b36c4c2cdb59f11dfc0c0eabfe5d77ce', '2026-10-20 09:38:31.616', '2026-10-13 09:39:31.575', '2026-10-13 09:38:31.616', 2);
INSERT INTO public.refresh_tokens VALUES (273, NULL, 'ccd79e336e974c0d92f19456ce42de4de1bc3362f231e6793e8aee62ccf4fc86', '2026-10-20 09:39:31.623', '2026-10-13 09:40:31.558', '2026-10-13 09:39:31.623', 2);
INSERT INTO public.refresh_tokens VALUES (276, NULL, '1ae5c54e737829f27485cd970f77b71fb3a57d498880a34de8016e773461c3a4', '2026-10-20 09:42:31.541', '2026-10-13 09:43:31.559', '2026-10-13 09:42:31.541', 2);
INSERT INTO public.refresh_tokens VALUES (277, NULL, '9c6d9a7b4d26726f6d53da11a546199845f5054e6700a6ade76e524a4407b16d', '2026-10-20 09:43:31.607', '2026-10-13 09:44:31.368', '2026-10-13 09:43:31.607', 2);
INSERT INTO public.refresh_tokens VALUES (279, NULL, 'bd3158b77b4d65497186dbd6038d66a28b1ba5bf19895cc5f62b7735db63f72d', '2026-10-20 09:45:31.344', '2026-10-13 09:46:31.314', '2026-10-13 09:45:31.344', 2);
INSERT INTO public.refresh_tokens VALUES (286, NULL, 'de2fcf7eac0a78c2f8070519397324e979caf3dc8126c91733afe6f47f8d6c52', '2026-10-20 09:49:31.416', '2026-10-13 09:50:31.3', '2026-10-13 09:49:31.416', 2);
INSERT INTO public.refresh_tokens VALUES (287, NULL, '56c2cd9510991eac1a56e15e21a9ed4ba8a99b220ca847f86f202cfab42764d6', '2026-10-20 09:50:31.33', '2026-10-13 09:51:31.317', '2026-10-13 09:50:31.33', 2);
INSERT INTO public.refresh_tokens VALUES (291, NULL, '75718bc7978e7ba8e1bcafda4038ef361d067dc7e055d23680ee325dd0881b8d', '2026-10-20 09:54:31.539', '2026-10-13 09:55:31.478', '2026-10-13 09:54:31.539', 2);
INSERT INTO public.refresh_tokens VALUES (292, NULL, '4bcbe68b005b30f7d41b0e1f53dac5abd5bf3ade71aa760b8b166de18dcb0b3d', '2026-10-20 09:55:31.52', '2026-10-13 09:56:31.489', '2026-10-13 09:55:31.52', 2);
INSERT INTO public.refresh_tokens VALUES (293, NULL, '7482d28fe7d8fa0275273537a9264be688b3bdf7c31807c963a4ad065af18f84', '2026-10-20 09:56:31.516', '2026-10-13 09:57:31.492', '2026-10-13 09:56:31.517', 2);
INSERT INTO public.refresh_tokens VALUES (294, NULL, 'b70bd5106179b570a043ad1919cea8ed6d34f55612b6b4670eea9fe78725be5b', '2026-10-20 09:57:31.533', '2026-10-13 09:58:31.329', '2026-10-13 09:57:31.533', 2);
INSERT INTO public.refresh_tokens VALUES (295, NULL, 'd8c526ae2ceb69360ae6bf03813b351cb6d0fd0f282e1f55cbeb8638da4dea39', '2026-10-20 09:58:31.364', '2026-10-13 09:59:31.375', '2026-10-13 09:58:31.364', 2);
INSERT INTO public.refresh_tokens VALUES (296, NULL, '94cfda42cbfd2ce82d0000a93a4a72103da3b3ce831f6a32ec61ebfcc78d6191', '2026-10-20 09:59:31.421', '2026-10-13 10:00:31.36', '2026-10-13 09:59:31.421', 2);
INSERT INTO public.refresh_tokens VALUES (300, NULL, '64eb42ac2f82e1e6f3e2c9db05bcff7f1c29936a8c103d19bf0f06fef464fd89', '2026-10-20 10:02:31.466', '2026-10-13 10:03:31.493', '2026-10-13 10:02:31.466', 2);
INSERT INTO public.refresh_tokens VALUES (301, NULL, '296d5cce5633cc3849c63f0cb2cabb24018bf23713fdbc811714822e132c3cb1', '2026-10-20 10:03:31.545', '2026-10-13 10:04:31.569', '2026-10-13 10:03:31.545', 2);
INSERT INTO public.refresh_tokens VALUES (303, NULL, 'e9543807fd11d0b5ae03aad0738fcf60433e8ecc6b2ca256e466a08b915bafa2', '2026-10-20 10:05:31.597', '2026-10-13 10:06:31.419', '2026-10-13 10:05:31.597', 2);
INSERT INTO public.refresh_tokens VALUES (305, NULL, '58f951ac3dabab6bcba73d0b77c117d20d5354054622104b93116d2abb988891', '2026-10-20 10:07:31.448', '2026-10-13 10:08:31.464', '2026-10-13 10:07:31.448', 2);
INSERT INTO public.refresh_tokens VALUES (309, NULL, '098d048739f64278916cc1b70a91870792cbde817c2674910063ea7e638015fe', '2026-11-12 10:18:10.398', '2026-10-13 10:20:18.08', '2026-10-13 10:18:10.398', 2);
INSERT INTO public.refresh_tokens VALUES (323, NULL, 'c1ce6ab9ae182ba3c34c3b86c837ec5c823256884b056f7e8785693dd7ad7a4d', '2026-11-12 11:32:02.835', NULL, '2026-10-13 11:32:02.835', 1);
INSERT INTO public.refresh_tokens VALUES (326, NULL, 'ed9d1f9c709f74fbff493f85067266389cb20353455fe43a8e2b98a52d056f6e', '2026-11-12 12:09:35.143', '2026-10-13 12:19:54.046', '2026-10-13 12:09:35.143', 2);
INSERT INTO public.refresh_tokens VALUES (330, NULL, '54aeae1bd88b0f22792f01bd3aa974c3829ce5e0f92f43c7a09936c39c95ec2c', '2026-11-12 12:22:44.823', '2026-10-13 12:23:04.288', '2026-10-13 12:22:44.823', 2);
INSERT INTO public.refresh_tokens VALUES (331, NULL, '3bc11e608611e357e823e7da60af8bc0f84e629064eaa44cc45fd44bf58b0cc6', '2026-10-20 12:23:04.318', '2026-10-13 12:23:14.641', '2026-10-13 12:23:04.318', 2);
INSERT INTO public.refresh_tokens VALUES (332, NULL, 'c66d22540b8512eedee886bb203153838749f5ff4bddf444ab28175b9a6a6758', '2026-10-20 12:23:14.674', '2026-10-13 12:23:25.602', '2026-10-13 12:23:14.674', 2);
INSERT INTO public.refresh_tokens VALUES (336, NULL, 'f7e8a3c16d6824a6e044f50bff9e893ed7d751451724977a09031686f502f2ee', '2026-10-20 12:24:57.734', '2026-10-13 12:25:45.201', '2026-10-13 12:24:57.734', 2);
INSERT INTO public.refresh_tokens VALUES (338, NULL, '4d8df370b5815a719f058dce76504ca9f59fa894555ae60c2ae6403f78308c73', '2026-10-20 12:25:45.231', '2026-10-13 12:25:55.002', '2026-10-13 12:25:45.231', 2);
INSERT INTO public.refresh_tokens VALUES (374, NULL, '407999f2f392cbcaf55b7b24c354c6f048f6bd63ad18e21a65389cf20e010d2b', '2026-11-14 14:42:28.582', '2026-10-15 14:42:59.174', '2026-10-15 14:42:28.582', 2);
INSERT INTO public.refresh_tokens VALUES (376, NULL, '9bdf3221603741fbff48afa54a3c61381162ef893dcd2166f35c643af263970e', '2026-11-14 14:52:54.523', '2026-10-15 14:53:34.038', '2026-10-15 14:52:54.523', 2);
INSERT INTO public.refresh_tokens VALUES (344, NULL, 'd1f196c327644544a4544b94227f2b5a26fcfb57408b486e96760af9d7bb510e', '2026-10-22 05:38:19.167', '2026-10-15 06:46:42.746', '2026-10-15 05:38:19.167', 2);
INSERT INTO public.refresh_tokens VALUES (378, NULL, 'dbc45851f57b6a185aa4c94ef3e98de994f29abdaef9d9d378c11d3d0d88ce9b', '2026-11-14 14:54:32.748', '2026-10-15 14:54:55.573', '2026-10-15 14:54:32.748', 2);
INSERT INTO public.refresh_tokens VALUES (356, NULL, 'c71854244d8be9c4a22a82548bb04869fb9dc31dffca1ed0141a59a95f032a4e', '2026-10-22 09:01:05.195', NULL, '2026-10-15 09:01:05.195', 1);
INSERT INTO public.refresh_tokens VALUES (369, NULL, '66bf588e29a4f3f01ad8d3f9632950685d7ae4e864bf48118ffbccdbf1f8e46c', '2026-11-14 12:59:20.121', '2026-10-15 13:10:04.103', '2026-10-15 12:59:20.121', 2);
INSERT INTO public.refresh_tokens VALUES (370, NULL, 'e2a2a30eb05a212d499192400c689c9a9bf954a96511bba6e8e859fb9178feff', '2026-10-22 13:10:04.129', '2026-10-15 13:11:13.187', '2026-10-15 13:10:04.129', 2);
INSERT INTO public.refresh_tokens VALUES (346, NULL, '44382a16c2cd6ceec9d1ea315e283ccdcbd11ac84df133a1cdcf53166eaa2017', '2026-10-22 06:46:42.793', '2026-10-18 00:07:35.039', '2026-10-15 06:46:42.793', 2);
INSERT INTO public.refresh_tokens VALUES (394, NULL, '7a70bdcb34d817b8961c9685681a93407fb7dea55cebf0ef2d39c284fdc6452a', '2026-10-25 00:07:35.092', '2026-10-18 00:23:32.916', '2026-10-18 00:07:35.092', 2);
INSERT INTO public.refresh_tokens VALUES (395, NULL, '187fbadcc32bfe987f61c259fe25e86fd2acac4b98c26ca20b9933f7a2f3b519', '2026-11-17 00:08:42.681', '2026-10-18 00:24:32.914', '2026-10-18 00:08:42.681', 1);
INSERT INTO public.refresh_tokens VALUES (558, NULL, '02b9d53f78815745aa13257160e19fe47d952a0b8824b885012ce56dfb60a2ea', '2026-10-25 03:12:32.938', '2026-10-18 03:27:16.257', '2026-10-18 03:12:32.938', 2);
INSERT INTO public.refresh_tokens VALUES (401, NULL, '20a2851a0c897979ea0c8f1b6552cad3bfa8773b89bd42bb20098a63c79e66f2', '2026-10-25 00:39:14.431', '2026-10-18 00:39:19.92', '2026-10-18 00:39:14.431', 1);
INSERT INTO public.refresh_tokens VALUES (402, NULL, '70c30981f1649dc6c56e4c871d5160d059301a13a0e293dba18fb4183ac39152', '2026-10-25 00:39:32.948', '2026-10-18 00:44:22.431', '2026-10-18 00:39:32.948', 2);
INSERT INTO public.refresh_tokens VALUES (407, NULL, '42bc4243c6de2fff56c1f32ee7fa0dfee5b32b46b6eda615afc08e77e7623174', '2026-10-25 01:00:32.938', '2026-10-18 01:16:32.9', '2026-10-18 01:00:32.938', 1);
INSERT INTO public.refresh_tokens VALUES (613, NULL, '342d7130c514e5faac7451b593b00bca9e34ce15e34f6750345566e403d8f32d', '2026-10-25 03:27:16.302', '2026-10-18 03:38:27.329', '2026-10-18 03:27:16.302', 2);
INSERT INTO public.refresh_tokens VALUES (412, NULL, 'e157483c20a66260ddcad1335096729e4592c30cb157c9b2ad51e4657322db0b', '2026-10-25 01:16:32.952', '2026-10-18 01:32:32.914', '2026-10-18 01:16:32.952', 1);
INSERT INTO public.refresh_tokens VALUES (415, NULL, '0a0a4114f1da87054246d7730b45dc9e9b16ce45179c86150b8c5adf18acb7e9', '2026-11-17 01:29:17.284', '2026-10-18 01:44:32.889', '2026-10-18 01:29:17.284', 2);
INSERT INTO public.refresh_tokens VALUES (420, NULL, 'bf2d9ac2c067075813b300d0de39d9b1896ad286da321f32c96dd29f3e55ccc1', '2026-10-25 01:44:32.942', '2026-10-18 01:46:08.747', '2026-10-18 01:44:32.942', 2);
INSERT INTO public.refresh_tokens VALUES (422, NULL, 'd54e9b40e9ad4b235f2ccd2399cf4ca7a8872890231321c6383f79ba1246996b', '2026-10-25 01:46:08.795', '2026-10-18 01:46:21.441', '2026-10-18 01:46:08.795', 2);
INSERT INTO public.refresh_tokens VALUES (417, NULL, 'afc63ce9badf9089ed8d0d39312c2011b0999ca5a0e7ae0829e755d77a99eb05', '2026-10-25 01:32:32.964', '2026-10-18 01:48:32.898', '2026-10-18 01:32:32.964', 1);
INSERT INTO public.refresh_tokens VALUES (423, NULL, '5c4d67a5ef693a61b34b2d04024c608172d7c80de4b7fd3feb2e184bc41bd3b2', '2026-10-25 01:46:21.532', '2026-10-18 02:01:25.866', '2026-10-18 01:46:21.532', 2);
INSERT INTO public.refresh_tokens VALUES (424, NULL, '14c3df13a14f2261b432dc9f868a625ebd4194d632c31607a3d99cded028e9fb', '2026-10-25 01:48:32.945', '2026-10-18 02:03:41.87', '2026-10-18 01:48:32.945', 1);
INSERT INTO public.refresh_tokens VALUES (429, NULL, 'cd9dc9680ba005b005e548ba0d5a1e3656aac8fae953c9ef473a04743afe2a4d', '2026-10-25 02:03:41.921', '2026-10-18 02:19:32.934', '2026-10-18 02:03:41.921', 1);
INSERT INTO public.refresh_tokens VALUES (461, NULL, '033039ff9426fab5b114a0b8da49bd15c5dbd7f11752996a0971f2e33d9e34bb', '2026-10-25 02:33:24.6', NULL, '2026-10-18 02:33:24.6', 2);
INSERT INTO public.refresh_tokens VALUES (428, NULL, '4fdd73fe60703c7ca523e00da23bc9f0cc9e53912f44c40923bf67b59383fc70', '2026-10-25 02:01:25.911', '2026-10-18 02:33:24.749', '2026-10-18 02:01:25.911', 2);
INSERT INTO public.refresh_tokens VALUES (435, NULL, '9b064dcdae0ef6b0f992f472f2e8a5c14a94605768f4c07d04a1ddcb0d5c73d6', '2026-10-25 02:19:32.981', '2026-10-18 02:35:32.98', '2026-10-18 02:19:32.982', 1);
INSERT INTO public.refresh_tokens VALUES (466, NULL, 'eb5a0b0d9c360acbdcf54c733a79f124fa9a486883f3a4a253bf8b2563f21bb4', '2026-10-25 02:35:33.032', '2026-10-18 02:51:32.864', '2026-10-18 02:35:33.032', 1);
INSERT INTO public.refresh_tokens VALUES (462, NULL, '90b90673b315061f7bc4670fc93b80e145534b27f18fd79653d690999019b659', '2026-10-25 02:33:24.806', '2026-10-18 02:48:32.895', '2026-10-18 02:33:24.806', 2);
INSERT INTO public.refresh_tokens VALUES (489, NULL, '0a7543bfe829c9d9f818b82a71062089eb48ec982cf9c862a43801baab8c829b', '2026-10-25 02:51:32.911', '2026-10-18 02:55:19.006', '2026-10-18 02:51:32.911', 1);
INSERT INTO public.refresh_tokens VALUES (495, NULL, 'd4f2511cdf772fb7becb74fda5327a513cf07f4f02fa6cf02cccf37e9a85ed83', '2026-10-25 02:55:19.084', '2026-10-18 02:55:54.994', '2026-10-18 02:55:19.084', 1);
INSERT INTO public.refresh_tokens VALUES (497, NULL, 'd4db9f1b9b91f5546c3b537f2771e7ff9bf72acfd2cf24b3763ffef4294e67cf', '2026-10-25 02:55:55.043', '2026-10-18 02:55:59.969', '2026-10-18 02:55:55.043', 1);
INSERT INTO public.refresh_tokens VALUES (498, NULL, 'cae0d00dc5513fff887ef5d6b9ab960b2d95f492826b8774dc5f652158f8cf2d', '2026-10-25 02:56:00.017', '2026-10-18 02:56:00.928', '2026-10-18 02:56:00.017', 1);
INSERT INTO public.refresh_tokens VALUES (484, NULL, 'bb15c6653e09e3896995573213a6de5e5867e2785f04e17dc785070b0965c422', '2026-10-25 02:48:32.943', '2026-10-18 02:57:17.505', '2026-10-18 02:48:32.943', 2);
INSERT INTO public.refresh_tokens VALUES (1151, NULL, '01c3391d8d000a6dcd4978817c430202a14668f21d0c93163b3981ea2bdfe71b', '2026-10-30 07:57:02.13', '2026-10-23 07:58:02.143', '2026-10-23 07:57:02.13', 1);
INSERT INTO public.refresh_tokens VALUES (678, NULL, 'a365faf8bcba0095733fafaeae6b20de0dbfdf973f9da86378ae2dfc68396baf', '2026-10-25 03:53:32.931', '2026-10-18 03:55:30.069', '2026-10-18 03:53:32.931', 2);
INSERT INTO public.refresh_tokens VALUES (682, NULL, '6a551885c0a193fba2674727583b0b3850bc0248aa17ab63759f0c99b61d77a2', '2026-10-25 03:55:30.119', '2026-10-18 04:10:32.881', '2026-10-18 03:55:30.119', 2);
INSERT INTO public.refresh_tokens VALUES (740, NULL, 'fc5423ef302e4804ae07e6a9cd20afa4a77af2d22f575c095a8e1a6734d7db55', '2026-10-25 04:27:14.82', '2026-10-18 04:42:18.88', '2026-10-18 04:27:14.82', 2);
INSERT INTO public.refresh_tokens VALUES (774, NULL, '4f48022b6b67b07026f15b5b1ff32ac7bf39ac3732eabe5b5a77d215f2ae77f3', '2026-10-25 04:42:18.974', '2026-10-18 04:57:32.868', '2026-10-18 04:42:18.974', 2);
INSERT INTO public.refresh_tokens VALUES (727, NULL, '7adc9ffda0485b7af21b4129bcc39ee2cece139e80c6487ebe4d5d22b16cab7a', '2026-10-25 04:18:43.316', '2026-10-18 04:27:14.771', '2026-10-18 04:18:43.316', 2);
INSERT INTO public.refresh_tokens VALUES (978, NULL, '49c67b20f36d30163c66576afbdfbaccd395a332dcf04c7e54460ba8629705f3', '2026-10-30 02:38:54.359', '2026-10-23 02:53:54.437', '2026-10-23 02:38:54.359', 2);
INSERT INTO public.refresh_tokens VALUES (992, NULL, '928785645ea1124a2ff60cd5f332c2aebeb87425c3bfd43f2b80fe830f214f8e', '2026-10-30 02:53:54.437', '2026-10-23 03:08:54.389', '2026-10-23 02:53:54.437', 2);
INSERT INTO public.refresh_tokens VALUES (1045, NULL, '7319c474c1266ce0be8136d18d34f2bfc7c102e36eca80e5f8def25cf48eec5e', '2026-10-30 03:55:09.835', '2026-10-23 03:55:25.607', '2026-10-23 03:55:09.835', 2);
INSERT INTO public.refresh_tokens VALUES (1046, NULL, '474672800027776494182683206b703c2ecd02af5106eee736b1ec4aa523bebf', '2026-10-30 03:55:25.607', '2026-10-23 03:55:29.844', '2026-10-23 03:55:25.607', 2);
INSERT INTO public.refresh_tokens VALUES (1048, NULL, '6a726f72cbd127117530d46baa0affb4491d04d20317ebab46ce7a139c6998c2', '2026-10-30 03:55:31.672', '2026-10-23 03:56:02.434', '2026-10-23 03:55:31.672', 2);
INSERT INTO public.refresh_tokens VALUES (1051, NULL, 'daa9d36422c01627463aade579d28210a2ffd64c81b05b1c641791172f3de36d', '2026-10-30 03:56:05.189', '2026-10-23 03:56:05.475', '2026-10-23 03:56:05.189', 2);
INSERT INTO public.refresh_tokens VALUES (1052, NULL, 'a8644f33e48d35f46f6879ca049438bc2caa8c3691be8dc292129f123ece0398', '2026-10-30 03:56:05.475', '2026-10-23 03:56:05.76', '2026-10-23 03:56:05.475', 2);
INSERT INTO public.refresh_tokens VALUES (1063, NULL, '8a7e91914e62f653dcbcaae413a3ab222d4555a551bc580be84c3808b48f4a62', '2026-10-30 04:15:34.565', '2026-10-23 04:19:20.011', '2026-10-23 04:15:34.565', 2);
INSERT INTO public.refresh_tokens VALUES (1065, NULL, '840a83c4b8899804f04d3d7bbc9d3d4dddad38153b21e82ae1b10346db1f00f4', '2026-10-30 04:19:20.011', '2026-10-23 04:20:24.638', '2026-10-23 04:19:20.011', 2);
INSERT INTO public.refresh_tokens VALUES (1066, NULL, 'a7913222cf969bef1c679120bb2072df6470db72703d7931368a5221a2f2dc10', '2026-11-22 04:20:31.799', '2026-10-23 04:35:32.401', '2026-10-23 04:20:31.799', 1);
INSERT INTO public.refresh_tokens VALUES (843, NULL, '8b2f0f41f4a069ac9897159d7606b9e1302811742947192e27d14b6137b3f8e1', '2026-11-17 18:42:55.856', '2026-10-23 06:05:42.211', '2026-10-18 18:42:55.856', 2);
INSERT INTO public.refresh_tokens VALUES (1152, NULL, 'bd3da197601541bef73baa8a17ea4a74be3c0ce9618433b9332787d7bd341030', '2026-10-30 07:58:02.143', '2026-10-23 07:59:02.056', '2026-10-23 07:58:02.143', 1);
INSERT INTO public.refresh_tokens VALUES (1071, NULL, 'd66c7e95d759e72b7b6bf2506b1d1126fbf45b7662aa2b7bf9be438dae4101af', '2026-10-30 04:35:32.401', '2026-10-23 04:37:06.236', '2026-10-23 04:35:32.401', 1);
INSERT INTO public.refresh_tokens VALUES (1153, NULL, '250e3c6a021d9d6f9f5e62ebd5197918077a551621f2e0e9911157ad3a0b709e', '2026-10-30 07:59:02.056', '2026-10-23 08:00:02.079', '2026-10-23 07:59:02.056', 1);
INSERT INTO public.refresh_tokens VALUES (1075, NULL, '3960cef1fe937c5e66f871d0e18e4d1f2e312bd7c783f9a24e651dd88a097062', '2026-10-30 04:45:41.832', NULL, '2026-10-23 04:45:41.832', 2);
INSERT INTO public.refresh_tokens VALUES (1154, NULL, '17abb3f1e4f96ab69153b5abc63a1a793c3eaa35201fb6b70bbb143bc1de02ae', '2026-10-30 08:00:02.08', '2026-10-23 08:01:02.096', '2026-10-23 08:00:02.08', 1);
INSERT INTO public.refresh_tokens VALUES (1155, NULL, 'cd55d9c5749f04d9a3d6b7b0c396f71b7acde4a8b6f0e037cdf56eb91b058d7e', '2026-10-30 08:01:02.097', '2026-10-23 08:02:02.086', '2026-10-23 08:01:02.097', 1);
INSERT INTO public.refresh_tokens VALUES (1156, NULL, '07806f3c57af98c382467a758d3f3be436cbbf54141a40a2c0da8ff4204db60a', '2026-10-30 08:02:02.086', '2026-10-23 08:03:01.973', '2026-10-23 08:02:02.086', 1);
INSERT INTO public.refresh_tokens VALUES (1072, NULL, '33b59ac34b6f5031b96ad9b4899f00a833c1d97edae0786b9c732f195cf32020', '2026-11-22 04:37:14.276', '2026-10-23 04:52:54.389', '2026-10-23 04:37:14.276', 2);
INSERT INTO public.refresh_tokens VALUES (1160, NULL, 'b37b5d9b609d2724e2df34abaa0bae19675511b92e70ee9febb96ec0b3c8c451', '2026-10-30 08:04:01.996', '2026-10-23 08:05:02.008', '2026-10-23 08:04:01.996', 1);
INSERT INTO public.refresh_tokens VALUES (1166, NULL, 'b1a69e073bf32714c8e4012a38a43f5df9e42013f261a80c92f359224ab24cae', '2026-10-30 08:07:02.079', '2026-10-23 08:08:02.165', '2026-10-23 08:07:02.079', 1);
INSERT INTO public.refresh_tokens VALUES (1168, NULL, '5616a869de6a9576d69136286cb87c27e6298f7f1115d0e436f65515bef671d3', '2026-10-30 08:08:02.165', '2026-10-23 08:09:02.265', '2026-10-23 08:08:02.165', 1);
INSERT INTO public.refresh_tokens VALUES (1170, NULL, '5b4374b92ee387ec09f9ad3195cd95cc8e102f1e79fc38be3bc35837d7b43e4f', '2026-10-30 08:09:02.265', '2026-10-23 08:10:02.173', '2026-10-23 08:09:02.265', 1);
INSERT INTO public.refresh_tokens VALUES (1172, NULL, '99e9b7e473203b203dcc129e4273e5227a12512244b9a755b973ec5d22f0867b', '2026-10-30 08:10:02.173', '2026-10-23 08:11:02.087', '2026-10-23 08:10:02.173', 1);
INSERT INTO public.refresh_tokens VALUES (1180, NULL, '44154120350b737495045bb600e3e032ea769345b54cac3cf88ed738e38dd7d4', '2026-10-30 08:14:01.988', '2026-10-23 08:15:01.957', '2026-10-23 08:14:01.988', 1);
INSERT INTO public.refresh_tokens VALUES (1184, NULL, '8997c20cb99c9e4592a3108d642fafb47d4f3cfaea00a2fdacda5e2e21876e66', '2026-10-30 08:16:02.152', '2026-10-23 08:17:02.119', '2026-10-23 08:16:02.152', 1);
INSERT INTO public.refresh_tokens VALUES (1186, NULL, 'c65b5b6c6dd4af826041cefc005a67bf6437f3f17e816b2ecc79c51ed5739d29', '2026-10-30 08:17:02.119', '2026-10-23 08:18:01.973', '2026-10-23 08:17:02.119', 1);
INSERT INTO public.refresh_tokens VALUES (1189, NULL, '08c4780a03f90383f6a1e3df87153e8f86990f14193aaca01613fe566e7ec693', '2026-10-30 08:18:01.973', '2026-10-23 08:19:02.19', '2026-10-23 08:18:01.973', 1);
INSERT INTO public.refresh_tokens VALUES (1191, NULL, 'fbabf6895b07a370cbfd137e1332bb452841c0ca237e2c089bdeefd2b3d60076', '2026-10-30 08:19:02.19', '2026-10-23 08:20:02.126', '2026-10-23 08:19:02.19', 1);
INSERT INTO public.refresh_tokens VALUES (1199, NULL, '793ce59c1199620196e198a2c4aa72b509548301e1dbcddfdd65a66f5464dbf9', '2026-10-30 08:23:01.946', '2026-10-23 08:24:01.907', '2026-10-23 08:23:01.946', 1);
INSERT INTO public.refresh_tokens VALUES (1201, NULL, 'b68e953b81e96933bd95d016ce899ac545bc2a156ef231deb1bab8336b657d2a', '2026-10-30 08:24:01.907', '2026-10-23 08:25:01.939', '2026-10-23 08:24:01.907', 1);
INSERT INTO public.refresh_tokens VALUES (1203, NULL, 'd0e94229eb06adcbf962d4b6ed85d2c6014017e9349acab62cc2927e96bb4166', '2026-10-30 08:25:01.939', '2026-10-23 08:26:02.05', '2026-10-23 08:25:01.939', 1);
INSERT INTO public.refresh_tokens VALUES (1081, NULL, '500875f1cc04c99baab0470be55b6f98a7822e6c3df55272fac9fe862fab2ac1', '2026-10-30 04:52:54.39', '2026-10-23 05:07:54.537', '2026-10-23 04:52:54.39', 2);
INSERT INTO public.refresh_tokens VALUES (1085, NULL, '1e01fdc6537a52641cb8ecd7ca958ecee8dcf80b5f0b18a0b80f062b4955a6c5', '2026-10-30 05:07:54.537', '2026-10-23 05:11:55.027', '2026-10-23 05:07:54.537', 2);
INSERT INTO public.refresh_tokens VALUES (1087, NULL, 'ba9353384379fe9367713167eb248d2812b8ce9c13316ee338ad28f31c049240', '2026-10-30 05:11:55.027', '2026-10-23 05:26:55.304', '2026-10-23 05:11:55.027', 2);
INSERT INTO public.refresh_tokens VALUES (1101, NULL, '5c25620dfbca2af9a9afa7c7085e84745999f2a3cd43a70dd9b090b3596482d8', '2026-10-30 05:42:43.607', NULL, '2026-10-23 05:42:43.607', 2);
INSERT INTO public.refresh_tokens VALUES (1096, NULL, 'd1906c00635f47207e4b06472ce17cd206ea2dc6b427d70cd5be5488f3edea80', '2026-10-30 05:26:55.304', '2026-10-23 05:42:54.393', '2026-10-23 05:26:55.304', 2);
INSERT INTO public.refresh_tokens VALUES (1102, NULL, 'a7e444b5ba06738b602fb4f2f2b0213ee726a5a60eca32f32f3212da2d42ec2f', '2026-10-30 05:42:54.393', '2026-10-23 05:57:59.404', '2026-10-23 05:42:54.393', 2);
INSERT INTO public.refresh_tokens VALUES (1110, NULL, 'ae7246e3d97816d80236e7fb545791b9414ca240771049afa32efa63964a86ec', '2026-10-30 06:04:02.614', NULL, '2026-10-23 06:04:02.614', 2);
INSERT INTO public.refresh_tokens VALUES (1111, NULL, '64bc5b6b14e6f72f996d50ba6ea5a7efd7ea0567f6479c2c234faaf42ef48180', '2026-10-30 06:05:42.211', '2026-10-23 06:05:47.087', '2026-10-23 06:05:42.211', 2);
INSERT INTO public.refresh_tokens VALUES (1107, NULL, 'bf1535358dd182b331124ce4357f9468d7f18dc01476da2b42310971faa70627', '2026-10-30 05:57:59.404', '2026-10-23 06:11:31.315', '2026-10-23 05:57:59.404', 2);
INSERT INTO public.refresh_tokens VALUES (1113, NULL, '508e16b5429ad0bacd7dc2f1283e26d4c9a43ccd1eda592e17de46ffd06e2b64', '2026-10-30 06:11:31.315', '2026-10-23 06:23:41.882', '2026-10-23 06:11:31.315', 2);
INSERT INTO public.refresh_tokens VALUES (1116, NULL, '96738718bab49c400737d943ed4659162039f747cd976652b3949a578a71af12', '2026-11-22 06:23:49.333', '2026-10-23 06:38:54.41', '2026-10-23 06:23:49.333', 1);
INSERT INTO public.refresh_tokens VALUES (1119, NULL, '09f2b6a4f69ac7a50923ec43692036227673d9facd044f4e25639586b92b5392', '2026-10-30 06:38:54.41', '2026-10-23 06:53:54.519', '2026-10-23 06:38:54.41', 1);
INSERT INTO public.refresh_tokens VALUES (1122, NULL, 'd861503dde3f9776ba7ab86b1beb409a079ce45f0421e6b66825f26419fdf232', '2026-10-30 06:53:54.519', '2026-10-23 07:08:54.407', '2026-10-23 06:53:54.519', 1);
INSERT INTO public.refresh_tokens VALUES (1125, NULL, 'ea9589d1f632c2bb0a8ab3f80a837a1ed8c5f08d6149e66fac77cc71a74d098d', '2026-10-30 07:08:54.407', '2026-10-23 07:23:54.391', '2026-10-23 07:08:54.407', 1);
INSERT INTO public.refresh_tokens VALUES (1128, NULL, 'e0d2bb3f7e30b61eac5e42352b1a0d4da6c40a37cbfeb1ce5db9ff8eeda97924', '2026-10-30 07:23:54.391', '2026-10-23 07:38:54.73', '2026-10-23 07:23:54.391', 1);
INSERT INTO public.refresh_tokens VALUES (1131, NULL, '47199369bde64436a806989d96f52f118b42e777ba5f1913e74b3acb950621b9', '2026-10-30 07:38:54.733', '2026-10-23 07:40:02.227', '2026-10-23 07:38:54.733', 1);
INSERT INTO public.refresh_tokens VALUES (1132, NULL, 'f5ccac49dea2db37e5f5f4ae338c9914a72ff3f00f0ae5767d18cf7206402df7', '2026-10-30 07:40:02.228', '2026-10-23 07:41:01.929', '2026-10-23 07:40:02.228', 1);
INSERT INTO public.refresh_tokens VALUES (1133, NULL, 'd2ed2b651b10ea2a26da7844fab9222b8b1b526c13818c33bbf241acaff2abb4', '2026-10-30 07:41:01.93', '2026-10-23 07:42:01.924', '2026-10-23 07:41:01.93', 1);
INSERT INTO public.refresh_tokens VALUES (1134, NULL, '530bcbdc1f290cea2741a1df24ad3d5412a5ecbebe99264abb9455298a901e66', '2026-10-30 07:42:01.924', '2026-10-23 07:43:01.952', '2026-10-23 07:42:01.924', 1);
INSERT INTO public.refresh_tokens VALUES (1136, NULL, 'e6dcbdfdf55f239f42e3c3bb428a1fc70e65910a8a3ddb189066c03183a5d046', '2026-10-30 07:44:02.098', '2026-10-23 07:45:02.203', '2026-10-23 07:44:02.098', 1);
INSERT INTO public.refresh_tokens VALUES (1135, NULL, '5686d216e6d17a2d8713a0671f1ae7b5f4be21539978cb6f162b38e16616e3ba', '2026-10-30 07:43:01.952', '2026-10-23 07:44:02.097', '2026-10-23 07:43:01.952', 1);
INSERT INTO public.refresh_tokens VALUES (1145, NULL, '2f7bd13b672645edbac08f9172a66907b0f275bde8215b60c3ea4a328e48348c', '2026-10-30 07:51:02.163', '2026-10-23 07:52:01.936', '2026-10-23 07:51:02.163', 1);
INSERT INTO public.refresh_tokens VALUES (1137, NULL, '97ceb8a04ca6317e322d84bd7bfce2bf43ecb73a9ae519e56d4b61f0badd181f', '2026-10-30 07:45:02.204', '2026-10-23 07:46:02.091', '2026-10-23 07:45:02.204', 1);
INSERT INTO public.refresh_tokens VALUES (1138, NULL, 'c376c4791d3a7323d902aa3f6c10a6a3318ce4ed64d1fa88206e5551f64b0fab', '2026-10-30 07:46:02.091', '2026-10-23 07:47:02.206', '2026-10-23 07:46:02.091', 1);
INSERT INTO public.refresh_tokens VALUES (1139, NULL, 'dfde4d88c4e7774fd410cf175b86f576d43ac7060719f94fd86181024bfdd736', '2026-10-30 07:47:02.207', '2026-10-23 07:48:02.228', '2026-10-23 07:47:02.207', 1);
INSERT INTO public.refresh_tokens VALUES (1158, NULL, '0d09b546f087ac071743f53659fa60601057e38c51657f22a15a57dbf49f726c', '2026-10-30 08:03:01.973', '2026-10-23 08:04:01.996', '2026-10-23 08:03:01.973', 1);
INSERT INTO public.refresh_tokens VALUES (1141, NULL, '5949df8d4bbea9b00b3e6b9b0cf966f83f705b8d1af46cae06d994b1f9beda3a', '2026-10-30 07:48:02.229', '2026-10-23 07:49:02.135', '2026-10-23 07:48:02.229', 1);
INSERT INTO public.refresh_tokens VALUES (1143, NULL, '1ec53239d415613fd1086ec8bde09ca6160ed84f6a0647f650440aa6c305966c', '2026-10-30 07:49:02.135', '2026-10-23 07:50:02.027', '2026-10-23 07:49:02.135', 1);
INSERT INTO public.refresh_tokens VALUES (1144, NULL, 'f91bd910d8410e51dd83a75ceada7c68d34161a4fa05d685a6903db500bc512c', '2026-10-30 07:50:02.027', '2026-10-23 07:51:02.163', '2026-10-23 07:50:02.027', 1);
INSERT INTO public.refresh_tokens VALUES (1162, NULL, 'f479a6be502f9934107990da56340b8cbe4f8a854b36b20b8669ca072c118b12', '2026-10-30 08:05:02.009', '2026-10-23 08:06:01.963', '2026-10-23 08:05:02.009', 1);
INSERT INTO public.refresh_tokens VALUES (1164, NULL, 'a7f8191fc83cf78939bd04737d5e02abc34fd9fbb19e46055f0df21e8c55dcd2', '2026-10-30 08:06:01.964', '2026-10-23 08:07:02.079', '2026-10-23 08:06:01.964', 1);
INSERT INTO public.refresh_tokens VALUES (1174, NULL, '95d670e479166bf746ec8e4cc0de74c1d625e4f1e9e9a318829b4df8ab292b4e', '2026-10-30 08:11:02.087', '2026-10-23 08:12:02.174', '2026-10-23 08:11:02.087', 1);
INSERT INTO public.refresh_tokens VALUES (1176, NULL, 'd918914bcbf770b27d0daa5e9f3d3c4ba61e8128d042e9098fbc997b80acb823', '2026-10-30 08:12:02.175', '2026-10-23 08:13:02.204', '2026-10-23 08:12:02.175', 1);
INSERT INTO public.refresh_tokens VALUES (1178, NULL, '05d3a0c632c84f323a51af531905dbf55e8ab5030dfe18b22b086bd56e147824', '2026-10-30 08:13:02.204', '2026-10-23 08:14:01.987', '2026-10-23 08:13:02.204', 1);
INSERT INTO public.refresh_tokens VALUES (1182, NULL, 'a9d6effd2154632b1caa2702e3aa2682c6166a0f7dea05ee9786a61a4aba6c97', '2026-10-30 08:15:01.957', '2026-10-23 08:16:02.152', '2026-10-23 08:15:01.957', 1);
INSERT INTO public.refresh_tokens VALUES (1193, NULL, 'a553fc0de91df9b2ea2d432b8150c5f25df8aa826e607ab28b310dca5452b4c3', '2026-10-30 08:20:02.127', '2026-10-23 08:21:01.965', '2026-10-23 08:20:02.127', 1);
INSERT INTO public.refresh_tokens VALUES (1195, NULL, '1d975893e2c3e1ff6786036e4ba550f78ee1cb42913d0183ccba667e20507a0f', '2026-10-30 08:21:01.965', '2026-10-23 08:22:01.944', '2026-10-23 08:21:01.965', 1);
INSERT INTO public.refresh_tokens VALUES (1197, NULL, 'e6fd00da0b89d27dc6146513a5a0cbe0744b01d5baae66a52d9d843605b928aa', '2026-10-30 08:22:01.944', '2026-10-23 08:23:01.946', '2026-10-23 08:22:01.944', 1);
INSERT INTO public.refresh_tokens VALUES (1205, NULL, 'f9ed60ad4a1762f2597413909626d99a458c5504f5984e5119cc5d40598e9623', '2026-10-30 08:26:02.051', '2026-10-23 09:47:23.519', '2026-10-23 08:26:02.051', 1);
INSERT INTO public.refresh_tokens VALUES (1270, NULL, '204c09fc7a72df79b78cc9f9ac3f5bc527984c7b5eb22b1801b8eb67c087b118', '2026-11-22 11:48:16.047', '2026-10-27 08:58:52.44', '2026-10-23 11:48:16.047', 2);
INSERT INTO public.refresh_tokens VALUES (1249, NULL, '7d2157bd7b80c23f01f50a63f8b38ad47258162b50edd2859e412508f97a7f20', '2026-10-30 09:47:23.519', '2026-10-23 10:02:54.505', '2026-10-23 09:47:23.519', 1);
INSERT INTO public.refresh_tokens VALUES (1252, NULL, 'e2ab7a69d9e6542426b5192d2a24e838d7752285fe88bb665f4737149e43508c', '2026-10-30 10:02:54.506', '2026-10-23 10:17:54.616', '2026-10-23 10:02:54.506', 1);
INSERT INTO public.refresh_tokens VALUES (1263, NULL, 'cb4bcc2b6b29d5c61fdf3ff8baad88a443f80679aff19803da5c9eced8196a6e', '2026-10-30 10:17:54.616', '2026-10-23 10:32:54.718', '2026-10-23 10:17:54.616', 1);
INSERT INTO public.refresh_tokens VALUES (1265, NULL, '93265b066490ea5238a3bcf1ff25343b8fbffdd001dea5fbb238ff0a91c5313d', '2026-10-30 10:32:54.718', '2026-10-23 10:41:27.918', '2026-10-23 10:32:54.718', 1);
INSERT INTO public.refresh_tokens VALUES (1266, NULL, '2a707081c8132e7a12d15faf04c61b7e1596b8e49fa34eb84977773dc7d9bda0', '2026-10-30 10:41:27.918', '2026-10-23 11:36:37.088', '2026-10-23 10:41:27.918', 1);
INSERT INTO public.refresh_tokens VALUES (1268, NULL, '5e12de8deee90a3695aa6acc51754b3f2d4b31164d2f16eff394daf7928c532c', '2026-10-30 11:36:37.088', '2026-10-23 11:37:38.383', '2026-10-23 11:36:37.088', 1);
INSERT INTO public.refresh_tokens VALUES (1269, NULL, '4bd18b61413808fe46171f87dd78ebcb725ab6d34845cf24f0b77e68b5415607', '2026-10-30 11:37:38.384', '2026-10-23 11:47:59.207', '2026-10-23 11:37:38.384', 1);
INSERT INTO public.refresh_tokens VALUES (1277, NULL, '35eb1c7f252a8f45e074d4c806deaf81e8048cfadd71d0dba6aaa82abaaed175', '2026-10-31 03:14:17.211', NULL, '2026-10-24 03:14:17.211', 2);
INSERT INTO public.refresh_tokens VALUES (1280, NULL, '2ba25245d81d8ccab9cfeb5139a955b2e7b6ed5049842d82e06675eb2f993c7f', '2026-11-23 03:46:07.447', '2026-10-24 03:46:28.739', '2026-10-24 03:46:07.447', 2);
INSERT INTO public.refresh_tokens VALUES (1291, NULL, '20fa6ce5e66bab6f17c9262ac7b8e081ddfd229c94bebeff3f97a759cd500dc5', '2026-10-31 09:57:52.719', NULL, '2026-10-24 09:57:52.719', 2);
INSERT INTO public.refresh_tokens VALUES (1293, NULL, '58844dfbcd24e53097b6ace92eb42e5870fceefca3f0e6c81cb7606a6ebf84c9', '2026-11-23 10:02:27.245', '2026-10-24 10:02:39.202', '2026-10-24 10:02:27.245', 2);
INSERT INTO public.refresh_tokens VALUES (1295, NULL, 'c4a1252e6f4838a67377c2a8a6147cb90dbbc1e6e7250c951abf16f447a8397e', '2026-11-23 10:02:59.229', '2026-10-24 10:03:15.328', '2026-10-24 10:02:59.229', 2);
INSERT INTO public.refresh_tokens VALUES (1298, NULL, '9e43dc06cec1e7a7c6cba3d2f083285efb101c3503f60805755a78137bee6908', '2026-11-23 10:20:12.455', '2026-10-24 10:20:29.122', '2026-10-24 10:20:12.455', 2);
INSERT INTO public.refresh_tokens VALUES (1349, NULL, '2b5a1ff7f73703911675ceae7ee94e1d9246181e6e36859f6cd5e9323a889239', '2026-11-03 09:31:41.669', '2026-10-27 09:46:38.329', '2026-10-27 09:31:41.669', 2);
INSERT INTO public.refresh_tokens VALUES (1350, NULL, 'ed19dde8c906e4371d85806e548b883fcd8af9de186e974506a973efcb918412', '2026-11-03 09:46:38.329', '2026-10-27 09:59:04.199', '2026-10-27 09:46:38.329', 2);
INSERT INTO public.refresh_tokens VALUES (1351, NULL, 'dcb38d8673b8f7cc93bd1ad5519ef0b5479995569b132a0d871a561f706661b6', '2026-11-03 09:59:04.199', '2026-10-27 10:14:41.69', '2026-10-27 09:59:04.199', 2);
INSERT INTO public.refresh_tokens VALUES (1360, NULL, 'fbcbf4202978ba39d1d1a99a6651fb7bdbbc313d3bfd4b3c7588e0024563ff0e', '2026-11-03 11:59:41.654', '2026-10-27 12:14:41.647', '2026-10-27 11:59:41.654', 2);
INSERT INTO public.refresh_tokens VALUES (1366, NULL, '9bcaa71901fccf9f380e587da705502009cb27627d8d82ca4947c2223c634e9b', '2026-11-26 18:05:21.125', '2026-10-27 18:05:24.673', '2026-10-27 18:05:21.125', 2);
INSERT INTO public.refresh_tokens VALUES (1375, NULL, '5db469be829219ef759917a3f4fea56adeb9c9d63a3237f685ddd68d2d9dc1d7', '2026-11-26 18:24:41.492', '2026-10-27 18:24:45.109', '2026-10-27 18:24:41.492', 2);
INSERT INTO public.refresh_tokens VALUES (1381, NULL, 'fcba339fab393e0967f6a52d2f53e45f7512f929a36d9e86365ed95486dd03fc', '2026-11-03 18:25:21.163', '2026-10-27 18:25:21.993', '2026-10-27 18:25:21.163', 2);
INSERT INTO public.refresh_tokens VALUES (1371, NULL, '97b7e166df7b4562c573a21278d0a2973f4c749e973c3e931f8fc81572736358', '2026-11-03 18:20:39.255', '2026-10-27 18:35:40.76', '2026-10-27 18:20:39.255', 2);
INSERT INTO public.refresh_tokens VALUES (1389, NULL, '4311fac7dc098149e263db9897ea193e082b2aca73acabefec0d7bf274576342', '2026-11-03 18:35:40.761', '2026-10-27 18:50:40.761', '2026-10-27 18:35:40.761', 2);
INSERT INTO public.refresh_tokens VALUES (1404, NULL, '2d5b2d0bb2fae48365d0f1689c9ed960772b7f0d0c2538a41b47219703bc0705', '2026-11-07 00:54:48.026', NULL, '2026-10-31 00:54:48.026', 2);
INSERT INTO public.refresh_tokens VALUES (1412, NULL, '67383d7c9dc91d82fa752a9ad7e5f0124bb48c1c01e3a3e4a4b3243bbd9e910e', '2026-11-07 01:36:13.802', NULL, '2026-10-31 01:36:13.802', 2);
INSERT INTO public.refresh_tokens VALUES (1413, NULL, '29e78931165bd38b4699f6a2133c472a5ddffbfdf79c0f8986350d0f375d7a75', '2026-11-07 01:36:59.578', NULL, '2026-10-31 01:36:59.578', 2);
INSERT INTO public.refresh_tokens VALUES (1416, NULL, '5bdffdb80ffe29c876b8ea568bca02dcc07896a11e249e5ed3ba4bae684ac5ed', '2026-11-07 01:38:38.744', NULL, '2026-10-31 01:38:38.744', 2);
INSERT INTO public.refresh_tokens VALUES (1417, NULL, '9a1fd0813be0312015b2f71c0758ea1d9b48ff97f259df1be79c6bf8974b2c8e', '2026-11-07 01:39:36.39', NULL, '2026-10-31 01:39:36.39', 2);
INSERT INTO public.refresh_tokens VALUES (1410, NULL, '95cb48a617fc8bd4c294a5f1091a9086bd9bfdbe1d19286acbe41a4ab810a606', '2026-11-07 01:27:43.279', '2026-10-31 01:43:19.012', '2026-10-31 01:27:43.279', 2);
INSERT INTO public.refresh_tokens VALUES (1419, NULL, 'dd924b65e7f46fe8da1d95e6103d45d79aa8d321de8eb56bc610189809db0f68', '2026-11-07 01:43:19.013', '2026-10-31 01:46:05.871', '2026-10-31 01:43:19.013', 1);
INSERT INTO public.refresh_tokens VALUES (1423, NULL, 'c3396c380e71d1c7ae9feaf8edc9ae078e32e9493b7cfc1478970ac8e2aed0ae', '2026-11-07 01:46:05.872', '2026-10-31 02:01:11.802', '2026-10-31 01:46:05.872', 1);
INSERT INTO public.refresh_tokens VALUES (1444, NULL, '6d174d39fd00664265e37575fcec65a7858691965fb048190b298ea72b65c551', '2026-11-07 02:01:11.802', '2026-10-31 02:10:41.482', '2026-10-31 02:01:11.802', 1);
INSERT INTO public.refresh_tokens VALUES (1459, NULL, 'c69453804d972c597fd87c0dc1d8d393fe0b3d9748567803c9bd6f3dec31ed3e', '2026-11-07 02:10:41.482', '2026-10-31 02:12:37.436', '2026-10-31 02:10:41.482', 1);
INSERT INTO public.refresh_tokens VALUES (1462, NULL, '7af3e58c7fcce3b5cd15eafc1699b83eb05a6c3431b37578f7eb08d18abd8aab', '2026-11-07 02:14:41.322', NULL, '2026-10-31 02:14:41.322', 2);
INSERT INTO public.refresh_tokens VALUES (1463, NULL, '2c4289da7064ec44f78b7c195733010b9fb86d9f2d234446af9768fb486581ba', '2026-11-07 02:15:36.456', NULL, '2026-10-31 02:15:36.456', 2);
INSERT INTO public.refresh_tokens VALUES (1461, NULL, 'a9df04db26bf5f36c0019fc185f44d6ffb87a71fd562b466708a7920f3c208f7', '2026-11-07 02:13:23.746', '2026-10-31 02:28:23.849', '2026-10-31 02:13:23.746', 2);
INSERT INTO public.refresh_tokens VALUES (1344, NULL, 'f79ba72b973cdb270a09239165c6a7541bab24ae30d9047bd9d863477fa28ec6', '2026-11-03 08:58:52.441', '2026-10-27 09:14:41.664', '2026-10-27 08:58:52.441', 2);
INSERT INTO public.refresh_tokens VALUES (1346, NULL, 'e428d0006709b399215287682ac2b74bbebfde219f2656eca092f6d8b55df54f', '2026-11-03 09:14:41.665', '2026-10-27 09:16:18.32', '2026-10-27 09:14:41.665', 2);
INSERT INTO public.refresh_tokens VALUES (1348, NULL, '2938b437678a88d063177a227b6f2894523b34b1540b9158a060a9683fcd55a6', '2026-11-03 09:16:18.32', '2026-10-27 09:31:41.668', '2026-10-27 09:16:18.32', 2);
INSERT INTO public.refresh_tokens VALUES (1352, NULL, '6cb36eac3ea82a1e1ff7c0f903ce99daf67ce18fc8da0489be9e3948eb0321ff', '2026-11-03 10:14:41.69', '2026-10-27 10:29:41.618', '2026-10-27 10:14:41.69', 2);
INSERT INTO public.refresh_tokens VALUES (1353, NULL, 'ae7b2a4e54df16ce6beadd65de60035023e220b399896c3e03c8486aad4d2d9f', '2026-11-03 10:29:41.619', '2026-10-27 10:44:41.628', '2026-10-27 10:29:41.619', 2);
INSERT INTO public.refresh_tokens VALUES (1354, NULL, 'a1b3fb575d00f687b7a541c778938f38a78c8f2b0fa921662d60a8539174b53b', '2026-11-03 10:44:41.628', '2026-10-27 10:59:41.661', '2026-10-27 10:44:41.628', 2);
INSERT INTO public.refresh_tokens VALUES (1361, NULL, '2111973209fb61a1deabbb25b329196fd1f079d0c30cab424a25581812aa7169', '2026-11-03 12:14:41.647', '2026-10-27 12:29:41.665', '2026-10-27 12:14:41.647', 2);
INSERT INTO public.refresh_tokens VALUES (1362, NULL, '5c38a319626c55eccb83c5cd20b414c16110fa44d33576fae0f8affb5b98f00d', '2026-11-03 12:29:41.666', '2026-10-27 18:02:02.024', '2026-10-27 12:29:41.666', 2);
INSERT INTO public.refresh_tokens VALUES (1363, NULL, '469cfa78191f0e6acd6f679f23038d8a1d024bb10980d7082380a0faa14d22c5', '2026-11-03 18:02:02.025', '2026-10-27 18:02:14.362', '2026-10-27 18:02:02.025', 2);
INSERT INTO public.refresh_tokens VALUES (1369, NULL, 'a37387c181a22658cc4be077fc25796783f4635d1e9b113725670366b2203c38', '2026-11-26 18:09:57.46', '2026-10-27 18:10:09.807', '2026-10-27 18:09:57.46', 2);
INSERT INTO public.refresh_tokens VALUES (1376, NULL, 'fd2734d3b7c5f9cb756d13a3d6bacf3e74dcecd8b7e5452d7358575ff60e0473', '2026-11-03 18:24:45.109', '2026-10-27 18:25:02.027', '2026-10-27 18:24:45.109', 2);
INSERT INTO public.refresh_tokens VALUES (1377, NULL, 'b7e63438a4c707998bcae0ccbcbd35784d546757ced9437f0f5c2460a9f3a81b', '2026-11-03 18:25:02.027', '2026-10-27 18:25:04.341', '2026-10-27 18:25:02.027', 2);
INSERT INTO public.refresh_tokens VALUES (1378, NULL, '1057feee54cbe8a1b2262a2f88a5366fd2c806709119113cb7883860624c9c10', '2026-11-03 18:25:04.341', '2026-10-27 18:25:19.909', '2026-10-27 18:25:04.341', 2);
INSERT INTO public.refresh_tokens VALUES (1379, NULL, '425f67c642a2b47f7c460bbe25a89dcc35302a0560045d6037df1957d8b17840', '2026-11-03 18:25:19.909', '2026-10-27 18:25:20.655', '2026-10-27 18:25:19.909', 2);
INSERT INTO public.refresh_tokens VALUES (1384, NULL, '7523fc88cd2bc91825141a52a50cbce69b6493cd0193837de80506b267d1e27e', '2026-11-26 18:26:28.055', '2026-10-27 18:27:10.507', '2026-10-27 18:26:28.055', 2);
INSERT INTO public.refresh_tokens VALUES (1394, NULL, '3b265d5e5875807f1d15e65ab4e82546f7866f7a85e3f78c9b13dbf4f02567ff', '2026-11-03 18:46:53.883', NULL, '2026-10-27 18:46:53.883', 2);
INSERT INTO public.refresh_tokens VALUES (1395, NULL, 'f1785a83269cf041bf4cb327a35b5ec0a16914f8c990d0905534338a1fabc07c', '2026-11-03 18:50:40.762', '2026-10-31 01:05:07.966', '2026-10-27 18:50:40.762', 2);
INSERT INTO public.refresh_tokens VALUES (1406, NULL, '2674ea0f9fb1cf193b2beff6a9347d19e717a647244c972107bc005e4124e37b', '2026-11-07 01:05:07.967', '2026-10-31 01:05:14.3', '2026-10-31 01:05:07.967', 2);
INSERT INTO public.refresh_tokens VALUES (1441, NULL, '48f0d0bf63b6b2bf7e3ac977c5e3ba14acab3f4f369d4094381c55a230c6ea45', '2026-11-07 01:56:59.61', NULL, '2026-10-31 01:56:59.61', 2);
INSERT INTO public.refresh_tokens VALUES (1442, NULL, '5a4cab181626e4c1a17beb17dbe4084522a795d96e4fa58ac14a76b27c06f7f9', '2026-11-07 01:58:23.739', '2026-10-31 02:13:23.746', '2026-10-31 01:58:23.739', 2);
INSERT INTO public.refresh_tokens VALUES (1470, NULL, '7419a9a9c9e4c6e39385c817f53757af8f0272854f358a11db06ec3d70f8cfd2', '2026-11-07 02:21:34.678', NULL, '2026-10-31 02:21:34.678', 2);
INSERT INTO public.refresh_tokens VALUES (1356, NULL, '1df09c66df6b8c5bc908d2f5b216d51fe49b0e1e36e857d604eef38bab5429d9', '2026-11-03 10:59:41.661', '2026-10-27 11:14:41.679', '2026-10-27 10:59:41.661', 2);
INSERT INTO public.refresh_tokens VALUES (1357, NULL, 'aacf1deddb4ed8b564c7303f0d8e3635d0fcfdc45f6a266ea7963e35a20c1dde', '2026-11-03 11:14:41.68', '2026-10-27 11:29:41.662', '2026-10-27 11:14:41.68', 2);
INSERT INTO public.refresh_tokens VALUES (1358, NULL, '9399f7738916aae0b7a5eb8a485caeb28308eadc3370fe07d6d9b5991431dd8c', '2026-11-03 11:29:41.662', '2026-10-27 11:44:41.669', '2026-10-27 11:29:41.662', 2);
INSERT INTO public.refresh_tokens VALUES (1359, NULL, 'e4297abd11cbdb6267dcd38bf0dfd00bedd51b756accd14fef8863523ca88d91', '2026-11-03 11:44:41.669', '2026-10-27 11:59:41.654', '2026-10-27 11:44:41.669', 2);
INSERT INTO public.refresh_tokens VALUES (1368, NULL, '47862be3de1a8086c309fcede850a784cf0305759ce979c2c9d36a7b049029ca', '2026-11-26 18:05:28.128', '2026-10-27 18:20:39.254', '2026-10-27 18:05:28.128', 2);
INSERT INTO public.refresh_tokens VALUES (1380, NULL, 'fe28879c6671b3b1ae9ea911270a2d0b3a33a8aa20607da7db348e55143c792a', '2026-11-03 18:25:20.655', '2026-10-27 18:25:21.163', '2026-10-27 18:25:20.655', 2);
INSERT INTO public.refresh_tokens VALUES (1382, NULL, '22fcbe56a056f914e534c886dcf3114510cd4d81dc372f9bcf78fc9942a0ccff', '2026-11-03 18:25:21.994', '2026-10-27 18:25:31.269', '2026-10-27 18:25:21.994', 2);
INSERT INTO public.refresh_tokens VALUES (1385, NULL, '9c8db859b896977bf823ee4650587abb3a396049a0b2b90893d58f664e0560bc', '2026-11-26 18:27:23.337', '2026-10-27 18:30:57.213', '2026-10-27 18:27:23.337', 1);
INSERT INTO public.refresh_tokens VALUES (1386, NULL, 'e1615b8560dd8214c73450ab20f37f10e4ced924ff3fd9960e4bfe7b7c37607a', '2026-11-26 18:31:05.52', '2026-10-27 18:46:53.883', '2026-10-27 18:31:05.52', 2);
INSERT INTO public.refresh_tokens VALUES (1303, NULL, '7b1f36178767df876e90cca107a5aa6598d70405c7d05725b31a5ee007c7416e', '2026-11-01 07:49:10.132', NULL, '2026-10-25 07:49:10.132', 2);
INSERT INTO public.refresh_tokens VALUES (1407, NULL, 'b380e7f045e3ec0ca1044c515f008147f4f9eeca89a3318aee3b6f224236e3e8', '2026-11-30 01:06:21.795', NULL, '2026-10-31 01:06:21.795', 1);
INSERT INTO public.refresh_tokens VALUES (1409, NULL, 'c85b2ffc44ce4da8b1b66ef415951ea9dc3d06de8a52cac5b0ab14e0ccb94ec1', '2026-11-30 01:12:42.339', '2026-10-31 01:27:43.279', '2026-10-31 01:12:42.339', 2);
INSERT INTO public.refresh_tokens VALUES (1414, NULL, 'fb329b67d7b1cd63e6813f6709cda45a2368ec457ececbf6d23469ed83c4d005', '2026-11-07 01:37:37.785', NULL, '2026-10-31 01:37:37.785', 2);
INSERT INTO public.refresh_tokens VALUES (1415, NULL, '2f8019384302200d09ec39d4dce5abc7d56ab094873866ddba54c36b72be2ed5', '2026-11-07 01:37:59.493', NULL, '2026-10-31 01:37:59.493', 2);
INSERT INTO public.refresh_tokens VALUES (1418, NULL, 'c4425b4bb515614e1a32f9fcc440144dc6e81cc7f8bcf191b249e3cf02bdc735', '2026-11-07 01:42:52.091', NULL, '2026-10-31 01:42:52.091', 2);
INSERT INTO public.refresh_tokens VALUES (1315, NULL, 'e3f04c8fd5edf85fe52dc3d3bf010d6e843a9d7e4bb6582738bb481ed0057b4f', '2026-11-01 10:52:42.708', NULL, '2026-10-25 10:52:42.708', 2);
INSERT INTO public.refresh_tokens VALUES (1411, NULL, 'ee699e466e618613ec82871da19550f778c7bb23c80bff83c68e10e6486566b4', '2026-11-30 01:27:52.754', '2026-10-31 01:43:19.012', '2026-10-31 01:27:52.754', 1);
INSERT INTO public.refresh_tokens VALUES (1421, NULL, 'b5753077181217400c9ec5289acd17fae1854d3a15903b56d957116e0dafdbf4', '2026-11-07 01:43:34.931', NULL, '2026-10-31 01:43:34.931', 2);
INSERT INTO public.refresh_tokens VALUES (1424, NULL, 'cdd6dedfdfc28999b00ae7e0b5bb18894a8eec413eb8a07f340cfb7f59cc9621', '2026-11-07 01:48:12.319', NULL, '2026-10-31 01:48:12.319', 2);
INSERT INTO public.refresh_tokens VALUES (1420, NULL, 'cc9d3dc23039138bfbece17535e6ecb233d19198caeaf887c69b1ee8d59cf0a0', '2026-11-07 01:43:19.013', '2026-10-31 01:58:23.739', '2026-10-31 01:43:19.013', 2);
INSERT INTO public.refresh_tokens VALUES (1475, NULL, '1dc7d85d5c1aa6d4375d3c2542005f866bea30679fc98b26077fb070b4b0df44', '2026-11-07 02:31:40.426', NULL, '2026-10-31 02:31:40.426', 2);
INSERT INTO public.refresh_tokens VALUES (1473, NULL, '635efdd32f634c59e037a6f85389f602c8a64c727e5442fd9203e05f519d277b', '2026-11-07 02:28:23.85', '2026-10-31 02:31:40.426', '2026-10-31 02:28:23.85', 2);
INSERT INTO public.refresh_tokens VALUES (1477, NULL, 'c877d5ef8799073f2b47f9ec67c58a2e8637599a3467bf0a282e05cbc45e9f15', '2026-11-07 02:36:23.804', NULL, '2026-10-31 02:36:23.804', 2);


--
-- Data for Name: staff_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.staff_roles VALUES (1, 'ADMIN', 'Administrator', 'Quản trị viên toàn quyền hệ thống SoundWave', '2026-10-22 13:50:18.34');
INSERT INTO public.staff_roles VALUES (2, 'STAFF', 'Staff', 'Nhân viên vận hành và kiểm duyệt nội dung SoundWave', '2026-10-22 13:50:18.34');


--
-- Data for Name: staffs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.staffs VALUES (1, 1, 'admin@soundwave.com', '$2a$10$6pPSoWtZk1dZa5jbp3k81.UpH42XtWRWDlnPro9mf7XvY9732If8m', 'System Administrator', NULL, 'ACTIVE', '2026-10-31 01:27:52.753', '2026-10-09 05:32:20.233', '2026-10-31 01:27:52.871');
INSERT INTO public.staffs VALUES (2, 2, 'staff@soundwave.com', '$2a$10$meEHWfdR3hK5/q3.MHwii.lEyMjY/Z9gkKnXBouMa4jMigSkye.yS', 'Content Moderator', NULL, 'ACTIVE', '2026-10-31 02:36:23.8', '2026-10-09 05:32:20.505', '2026-10-31 02:36:23.995');


--
-- Data for Name: track_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.track_submissions VALUES (60, 56, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-24 10:45:47.849', '2026-10-24 10:46:17.124', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (62, 44, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-24 17:02:51.85', '2026-10-24 17:03:07.317', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (63, 61, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-24 17:19:46.026', '2026-10-24 17:20:19.543', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (6, 16, 3, 2, 'APPROVED', NULL, 'good music hay nha', NULL, '2026-10-10 15:05:42.484', '2026-10-10 15:06:11.632', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (64, 63, 8, NULL, 'PENDING', NULL, NULL, NULL, '2026-10-27 16:16:09.059', NULL, 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (7, 17, 3, 2, 'REJECTED', NULL, NULL, 'Audio clipping or severe distortion detected in master stream.', '2026-10-10 15:08:50.236', '2026-10-10 15:09:04.685', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (10, 20, 8, 2, 'REJECTED', NULL, NULL, 'Audio file corrupted or encoding does not meet platform standards.', '2026-10-11 18:34:34.817', '2026-10-11 19:24:34.02', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (9, 19, 8, 2, 'REJECTED', NULL, NULL, 'Unlicensed sample, beat, or suspected copyright infringement.', '2026-10-11 18:28:22.042', '2026-10-11 19:31:09.626', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (68, 67, 8, NULL, 'PENDING', 'Album submission: MRT', NULL, NULL, '2026-10-31 09:43:06.284', NULL, 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (69, 68, 8, NULL, 'PENDING', 'Album submission: MRT', NULL, NULL, '2026-10-31 09:43:06.448', NULL, 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (70, 69, 8, NULL, 'PENDING', 'Album submission: MRT', NULL, NULL, '2026-10-31 09:43:06.53', NULL, 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (33, 38, 9, 2, 'APPROVED', NULL, NULL, 'test notification', '2026-10-15 21:52:45.848', '2026-10-15 22:52:45.848', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (56, 58, 7, 2, 'APPROVED', NULL, NULL, 'Description kì cục quá', '2026-10-23 10:53:54.165', '2026-10-23 11:53:54.165', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (4, 14, 19, 2, 'REJECTED', NULL, NULL, 'Incomplete or placeholder metadata (title, artist or artwork).', '2026-10-10 10:34:38.919', '2026-10-10 11:19:20.404', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (5, 15, 19, 2, 'APPROVED', NULL, 'Good Music', NULL, '2026-10-10 11:18:11.891', '2026-10-10 11:19:50.896', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (16, 26, 18, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-13 12:54:56.462', '2026-10-13 13:19:18.747', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (18, 11, 16, 2, 'APPROVED', 'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.', 'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.', NULL, '2026-10-09 10:04:58.459', '2026-10-09 10:04:58.459', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (19, 12, 17, 2, 'APPROVED', 'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.', 'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.', NULL, '2026-10-09 10:05:23.504', '2026-10-09 10:05:23.504', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (20, 10, 10, 2, 'APPROVED', 'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.', 'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.', NULL, '2026-10-09 10:03:23.723', '2026-10-09 10:03:23.723', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (21, 13, 15, 2, 'APPROVED', 'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.', 'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.', NULL, '2026-10-09 10:06:00.496', '2026-10-09 10:06:00.496', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (22, 8, 13, 2, 'APPROVED', 'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.', 'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.', NULL, '2026-10-09 10:02:36.028', '2026-10-09 10:02:36.028', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (23, 6, 12, 2, 'APPROVED', 'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.', 'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.', NULL, '2026-10-09 10:01:54.581', '2026-10-09 10:01:54.581', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (26, 9, 14, 2, 'APPROVED', 'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.', 'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.', NULL, '2026-10-09 10:03:04.748', '2026-10-09 10:03:04.748', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (27, 7, 11, 2, 'APPROVED', 'Yêu cầu kiểm duyệt và phát hành bản thu chính thức trên SoundWave.', 'Đã thẩm định: Chất lượng âm thanh đạt chuẩn, metadata và bản quyền hợp lệ.', NULL, '2026-10-09 10:02:15.314', '2026-10-09 10:02:15.314', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (29, 34, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-15 19:58:32.912', '2026-10-15 19:59:34.745', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (17, 29, 3, 2, 'REJECTED', NULL, NULL, 'test nofication', '2026-10-13 17:17:53.441', '2026-10-15 20:11:03.101', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (28, 33, 7, 2, 'APPROVED', 'Album submission: HVL', NULL, NULL, '2026-10-15 16:23:42.457', '2026-10-15 21:28:26.196', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (31, 36, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-15 21:41:31.348', '2026-10-15 21:42:42.255', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (34, 38, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-15 21:54:23.039', '2026-10-15 21:54:44', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (43, 45, 8, 2, 'APPROVED', 'Album submission: TINHHA', NULL, NULL, '2026-10-18 10:27:12.31', '2026-10-18 10:32:16.177', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (45, 47, 8, 2, 'APPROVED', 'Album submission: ANHTRAISAYHI', NULL, NULL, '2026-10-18 11:07:58.6', '2026-10-18 11:08:58.693', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (49, 50, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-18 11:12:15.965', '2026-10-18 11:13:26.372', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (44, 46, 8, 2, 'APPROVED', 'Album submission: TINHHA', NULL, NULL, '2026-10-18 10:27:17.757', '2026-10-18 11:15:40.893', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (46, 48, 8, 2, 'REJECTED', 'Album submission: ANHTRAISAYHI', NULL, 'Audio file corrupted or encoding does not meet platform standards.', '2026-10-18 11:08:18.769', '2026-10-18 11:16:27.247', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (47, 49, 8, 2, 'APPROVED', 'Album submission: ANHTRAISAYHI', NULL, NULL, '2026-10-18 11:08:25.711', '2026-10-18 11:27:37.857', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (54, 56, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-19 01:45:19.961', '2026-10-19 01:46:19.651', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (55, 57, 9, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-23 10:44:32.671', '2026-10-23 10:45:59.614', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (57, 58, 7, 2, 'APPROVED', NULL, NULL, NULL, '2026-10-23 11:00:39.32', '2026-10-23 11:01:10.831', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (11, 21, 8, 2, 'APPROVED', NULL, 'good music', NULL, '2026-10-11 19:29:21.028', '2026-10-23 12:25:58.116', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (42, 44, 9, 2, 'REJECTED', NULL, NULL, 'Incomplete or placeholder metadata (title, artist or artwork). These', '2026-10-18 10:19:43.541', '2026-10-23 12:27:46.676', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (13, 23, 8, 2, 'REJECTED', NULL, NULL, 'Incomplete or placeholder metadata (title, artist or artwork).', '2026-10-11 19:42:57.721', '2026-10-23 12:44:08.127', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (12, 22, 8, 2, 'REJECTED', NULL, NULL, 'Audio file corrupted or encoding does not meet platform standards.', '2026-10-11 19:40:36.557', '2026-10-23 12:45:52.388', 'TRACK_RELEASE', NULL);
INSERT INTO public.track_submissions VALUES (58, 59, 8, 2, 'APPROVED', NULL, 'Good Music', NULL, '2026-10-23 13:11:25.186', '2026-10-23 13:12:06.227', 'TRACK_RELEASE', NULL);


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tracks VALUES (49, 8, 12, 5, 'SECRET', 'secret-1792321705657-278984', 'cool', 3, 'PUBLISHED', '2026-10-18 04:27:37.857', NULL, 'soundwave/tracks/audio/user-8-track-d93c5323-91aa-4001-a028-0a344bddb19e', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792321704/soundwave/tracks/audio/user-8-track-d93c5323-91aa-4001-a028-0a344bddb19e.mp3', 'mp3', 280560, 'soundwave/albums/covers/user-8-album-cover-02816132-3f58-4dd0-bd86-45bbb9ea1999', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792321661/soundwave/albums/covers/user-8-album-cover-02816132-3f58-4dd0-bd86-45bbb9ea1999.png', 6, '2026-10-18 04:08:25.657', '2026-10-18 04:27:43.854', '[Intro]
[00:00] (Nhạc dạo đầu)
[Verse 1: CONGB & Cody Nam Võ]
[00:15] Kể từ khi gặp em, trí nhớ hơi bị kém
[00:19] Những món ăn thân quen sao nay bỗng dưng chẳng thèm?
[00:22] Dù bụng đói cồn cào, lại chẳng thể nói lời nào
[00:26] Vì gu em không thích người quá cao
[00:30] Mà anh chẳng hề cao, tính nóng hơi bị láo
[00:33] Nói những câu tào lao khi em nói câu xin chào
[00:37] Vậy thì theo anh đến một nơi, không có biển khơi
[00:41] Chỉ có vườn với trái cây mà thôi
[Pre-Chorus: Quang Hùng MasterD]
[00:44] Vườn anh có trái dưa, trái dâu, trái thơm, trái nho, có luôn banana
[00:50] Nhưng thiếu đi trái tim của một người
[00:53] Lòng anh như gió đông giữa trời đêm
[00:55] Mong thấy em khi bình minh lên, oh-hoh
[Chorus: Cody Nam Võ & Quang Hùng MasterD]
[00:57] Tình đầu ngây thơ mà em, đúng không?
[01:01] Còn chưa nắm tay, chưa về tới phòng
[01:04] Mình còn trông ngóng biết nhiều về nhau
[01:07] Đêm đến ta lại ngắm sao, làm sao mở lòng?
[01:12] Chẳng phải em muốn được anh ghé tai?
[01:15] Thầm thì vài câu suốt bao đêm dài
[01:19] Trời cao có thấu nỗi lòng tận mây xanh?
[01:22] Nói em nghe bí mật của anh!
[Rap Verse: Wren Evans]
[01:26] Nói hết bí mật thì có yêu không?
[01:30] Muốn thấy bí mật hay em muốn nghe bằng lời nói?
[01:34] Đến đây với anh, trăm nghe không bằng một lần thấy
[01:37] Ai rồi cũng phải yêu rồi đấy, baby, ooh-ooh
[01:41] Phải làm sao để gặp my baby?
[01:44] Muốn yêu em chân thành vì anh đâu muốn yêu theo phong trào mà bae
[01:48] Em quen anh chân thành, làm một bộ phim hai ta đóng vai người yêu
[01:52] Rất muốn ai đó có thể nói ra hết sự thật
[01:54] Rằng anh thương em rất nhiều
[01:56] Giờ này nếu thắc mắc em qua bên...
[Bridge: Cody Nam Võ, CONGB & Quang Hùng MasterD]
[02:00] ("Baby à, anh đã nói là em trao cho anh trái tim, sao lại là trái bơ đó hả? Thôi CONGB dô!")
[02:08] Vậy người có muốn mình tay nắm tay?
[02:12] Tình anh đã trao không cần giãi bày
[02:15] Nụ cười em sáng hơn mặt trăng đang lên
[02:19] Chiếu sâu vào trái tim, anh không đỡ được
[02:23] Tặng nàng bài thơ dù không có hay
[02:26] Chỉ mong em hiểu lấy tâm tư này
[02:30] Trời cao có thấu nỗi lòng tận mây xanh?
[02:34] Nói em nghe bí mật của anh!
(Tone nâng nửa cung)

[Chorus: Wren Evans & Cody Nam Võ]
[02:38] Tình đầu ngây thơ mà em, đúng không?
[02:41] Còn chưa nắm tay, chưa về tới phòng
[02:45] Mình còn trông ngóng biết nhiều về nhau
[02:48] Đêm đến ta lại ngắm sao, làm sao mở lòng?
[02:52] Chẳng phải em muốn được anh ghé tai?
[02:56] Thầm thì vài câu suốt bao đêm dài
[03:00] Trời cao có thấu nỗi lòng tận mây xanh?
[03:04] Nói em nghe bí mật của anh!
[Outro]
[03:08] Bí mật của anh...
[03:12] Nói em nghe bí mật của anh...');
INSERT INTO public.tracks VALUES (59, 8, NULL, 5, 'TOP1', 'top1-1792761057504', 'Chill and relax', NULL, 'PUBLISHED', '2026-10-23 06:12:06.227', NULL, 'soundwave/tracks/audio/user-8-track-88349f96-7172-4b63-92eb-f82d8b08be78', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792761053/soundwave/tracks/audio/user-8-track-88349f96-7172-4b63-92eb-f82d8b08be78.mp3', 'mp3', 187742, 'soundwave/tracks/covers/user-8-cover-d519cd8b-488d-4336-a66e-1d40753b45da', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792761057/soundwave/tracks/covers/user-8-cover-d519cd8b-488d-4336-a66e-1d40753b45da.png', 1, '2026-10-23 06:10:57.506', '2026-10-23 06:12:06.533', '[00:10.00] Anh thường hay thức khuya
[00:11.00] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.00] Rằng phải làm sao?
[00:15.00] Cũng chẳng biết đến bao giờ?
[00:20.00] Những lời ca dở dang
[00:21.00] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.00] Chạy theo đằng sau ánh sáng
[00:27.00] Cuối nơi chân trời.
[00:29.00] Rồi em đến đây dịu dàng cạnh bên anh
[00:33.00] Cơn mưa rơi trở nên long lanh
[00:35.00] Chẳng còn đợi trông
[00:37.00] Vì giấc mơ có em thêm màu xanh
[00:40.00] Thật lòng chẳng xa xôi
[00:43.00] Ước muốn anh ở ngay đây thôi
[00:45.00] Anh không bận tâm nữa
[00:47.00] Vì anh có em.
[00:50.00] Nếu như ngày mai không diễn ra
[00:52.00] Giống cách mà anh cứ luôn mơ mộng?
[00:55.00] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.00] Dặn lòng phải xứng đáng hơn
[01:05.00] Để anh trở thành chàng trai
[01:07.00] Top 1 trong mắt em.
[01:13.00] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15.00] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17.00] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.00] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.00] Bầu trời đêm okay cho nên không sao
[01:23.00] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.00] Dù cho phải gặp bao nhiêu gian khó
[01:28.00] Vẫn luôn là em dõi theo anh
[01:31.00] Dù anh đi đến đâu...
[01:45.00] Nếu như ngày mai không diễn ra
[01:47.00] Giống cách mà anh cứ luôn mơ mộng?
[01:50.00] Thì vẫn có một người luôn phía sau
[01:53.00] Nhẹ nắm tay anh
[01:55.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:58.00] Dặn lòng phải xứng đáng hơn
[02:00.00] Để anh trở thành chàng trai
[02:02.00] Top 1 trong mắt em.
[02:08.00] Những cơ hội vụt qua đôi tay
[02:11.00] Vậy chắc chưa phải là ngày hôm nay
[02:14.00] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17.00] Từng câu nói mà anh vẫn luôn tin vào.
[02:20.00] Có những lần đôi mắt anh lạc phương hướng
[02:23.00] Để rồi đêm tối anh không về nhà
[02:26.00] Thì vẫn luôn là em
[02:28.00] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:30.00] Nếu như ngày mai không diễn ra
[02:32.00] Giống cách mà anh cứ luôn mơ mộng
[02:35.00] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40.00] Biết còn nhiều điều lo lắng đang vây quanh
[02:43.00] Dặn lòng phải xứng đáng hơn
[02:45.00] Để anh trở thành chàng trai
[02:48.00] Top 1 trong mắt em...
[02:53.00] Top 1 trong mắt em.
[Verse 1]
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Chorus & Outro]');
INSERT INTO public.tracks VALUES (48, 8, 12, 5, 'TOP 1', 'top-1-1792321698719-42966a', 'chill', 2, 'REJECTED', NULL, 'Audio file corrupted or encoding does not meet platform standards.', 'soundwave/tracks/audio/user-8-track-aec0fbf4-448b-433e-ae26-81f2197cd832', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792321698/soundwave/tracks/audio/user-8-track-aec0fbf4-448b-433e-ae26-81f2197cd832.mp3', 'mp3', 187742, 'soundwave/albums/covers/user-8-album-cover-02816132-3f58-4dd0-bd86-45bbb9ea1999', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792321661/soundwave/albums/covers/user-8-album-cover-02816132-3f58-4dd0-bd86-45bbb9ea1999.png', 0, '2026-10-18 04:08:18.719', '2026-10-18 04:16:33.268', '[Verse 1]
[00:10] Anh thường hay thức khuya
[00:11] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14] Rằng phải làm sao?
[00:15] Cũng chẳng biết đến bao giờ?
[00:20] Những lời ca dở dang
[00:21] Anh ngồi viết mãi vẫn còn chưa xong
[00:24] Chạy theo đằng sau ánh sáng
[00:27] Cuối nơi chân trời.
[00:29] Rồi em đến đây dịu dàng cạnh bên anh
[00:33] Cơn mưa rơi trở nên long lanh
[00:35] Chẳng còn đợi trông
[00:37] Vì giấc mơ có em thêm màu xanh
[00:40] Thật lòng chẳng xa xôi
[00:43] Ước muốn anh ở ngay đây thôi
[00:45] Anh không bận tâm nữa
[00:47] Vì anh có em.
[Chorus]
[00:50] Nếu như ngày mai không diễn ra
[00:52] Giống cách mà anh cứ luôn mơ mộng?
[00:55] Thì vẫn có một người luôn phía sau
[00:58] Nhẹ nắm tay anh
[01:00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03] Dặn lòng phải xứng đáng hơn
[01:05] Để anh trở thành chàng trai
[01:07] Top 1 trong mắt em.
[Verse 2]
[01:13] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21] Bầu trời đêm okay cho nên không sao
[01:23] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26] Dù cho phải gặp bao nhiêu gian khó
[01:28] Vẫn luôn là em dõi theo anh
[01:31] Dù anh đi đến đâu...
[Chorus]
[01:45] Nếu như ngày mai không diễn ra
[01:47] Giống cách mà anh cứ luôn mơ mộng?
[01:50] Thì vẫn có một người luôn phía sau
[01:53] Nhẹ nắm tay anh
[01:55] Biết còn nhiều điều lo lắng đang vây quanh
[01:58] Dặn lòng phải xứng đáng hơn
[02:00] Để anh trở thành chàng trai
[02:02] Top 1 trong mắt em.
[Bridge]
[02:08] Những cơ hội vụt qua đôi tay
[02:11] Vậy chắc chưa phải là ngày hôm nay
[02:14] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17] Từng câu nói mà anh vẫn luôn tin vào.
[02:20] Có những lần đôi mắt anh lạc phương hướng
[02:23] Để rồi đêm tối anh không về nhà
[02:26] Thì vẫn luôn là em
[02:28] Ngọn đèn rực rỡ chiếu soi nơi anh...
[Chorus & Outro]
[02:30] Nếu như ngày mai không diễn ra
[02:32] Giống cách mà anh cứ luôn mơ mộng
[02:35] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40] Biết còn nhiều điều lo lắng đang vây quanh
[02:43] Dặn lòng phải xứng đáng hơn
[02:45] Để anh trở thành chàng trai
[02:48] Top 1 trong mắt em...
[02:53] Top 1 trong mắt em.');
INSERT INTO public.tracks VALUES (47, 8, 12, 5, 'LAVIEM', 'laviem-1792321678547-9df166', 'funny', 1, 'PUBLISHED', '2026-10-18 04:08:58.693', NULL, 'soundwave/tracks/audio/user-8-track-d4cf6a2f-1911-4eae-bb6d-f57c5d592da1', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792321677/soundwave/tracks/audio/user-8-track-d4cf6a2f-1911-4eae-bb6d-f57c5d592da1.mp3', 'mp3', 270620, 'soundwave/albums/covers/user-8-album-cover-02816132-3f58-4dd0-bd86-45bbb9ea1999', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792321661/soundwave/albums/covers/user-8-album-cover-02816132-3f58-4dd0-bd86-45bbb9ea1999.png', 1, '2026-10-18 04:07:58.548', '2026-10-18 04:09:04.695', '[00:02] Còn cần thiết nữa, nói chi đến đây cũng thừa
[00:04] Giờ chỉ còn mình với vấn vương (Rượu vang pha với cơn mưa)
[00:07] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:09] Biết sao hết cho vừa?
[00:11] Lòng nhau mới thấu đây em
[Chorus: CAPTAIN BOY & CoolKid]
[00:13] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[00:17] Rượu vang pha với cơn mưa
[00:20] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:22] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[00:26] Dệt hàng triệu vết thương, tự vùi mình trước gương
[00:30] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[00:33] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[00:37] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Verse 1: Pháp Kiều & CAPTAIN BOY]
[00:41] Ta chia tay, vì sao em ơi?
[00:44] Điều này anh muốn hỏi lâu rồi
[00:47] Những khung trời kỷ niệm vỡ đôi
[00:50] Có phải vì một câu anh đã lỡ lời?
[00:54] Sau đêm nay, tự ta cho ta
[00:57] Em và anh một đoạn kết mới
[01:00] Dù rằng mình còn yêu nhau rất nhiều đấy
[01:04] Nhưng để ở lại thì anh nghĩ là không
[Pre-Chorus: Quang Hùng MasterD]
[01:06] Và sau những cảm xúc nhất thời
[01:10] Người bên em giờ này chẳng còn là anh
[01:13] Gửi lại quá khứ cung đàn đã vỡ
[01:17] Vì những vấn vương ấy chưa kịp thành lời
[Chorus: Quang Hùng MasterD & CAPTAIN BOY]
[01:19] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[01:23] Rượu vang pha với cơn mưa
[01:26] Hàng trăm lý do cũng chẳng thể cứu vãn
[01:28] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[01:33] Dệt hàng triệu vết thương, tự vùi mình trước gương
[01:36] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[01:39] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[01:43] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Post-Chorus: Quang Hùng MasterD & CoolKid]
[01:46] Tất cả là tại vì em, em, em, em, em, e-em
[01:50] Người xa lạ anh từng quen
[01:53] Tất cả là tại vì em, em, em, em, em, e-em
[01:57] Kẻ ngốc đang say tình dưới ngọn đèn
[01:59] Tất cả là tại vì em, em, em, em, em, e-em
[02:03] Người xa lạ anh từng quen
[02:06] Tất cả là tại vì em, em, em, em, em, yeah-eh-eh
[02:10] Kẻ ngốc đang say tình dưới ngọn đèn
[Verse 2: Pháp Kiều]
[02:13] Lau đôi mi, đây là nước mắt hay mưa
[02:15] Buông đôi tay, anh đâu muốn phải dây dưa
[02:17] Quên đi đôi mắt ấy khi xưa, chẳng bên nhau được nữa
[02:20] Sau bao lần đau, anh lại cho đi và quên
[02:22] Anh ghét nỗi đau, cơn mưa đêm kia và em
[02:24] Ta vội quên rồi, những điều sao thật quen
[02:27] Để nỗi buồn kia gọi tên mỗi khi bài ca bật lên
[Pre-Chorus: CoolKid & Quang Hùng MasterD]
[02:28] Và sau những cảm xúc nhất thời
[02:30] Người bên em giờ này chẳng còn là anh
[02:33] Gửi lại quá khứ cung đàn đã vỡ
[02:37] Vì những vấn vương ấy chưa kịp thành lời
[Chorus: Cả nhóm]
[02:39] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[02:43] Rượu vang pha với cơn mưa
[02:45] Hàng trăm lý do cũng chẳng thể cứu vãn
[02:48] Biết sao hết cho vừa lòng nhau mới thấu đây em?
[02:52] Dệt hàng triệu vết thương, tự vùi mình trước gương
[02:56] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[03:03] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[03:07] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[Outro]
[03:11] Tất cả là tại vì em...
[03:15] Người xa lạ anh từng quen...
[03:19] Tất cả là tại vì em...');
INSERT INTO public.tracks VALUES (29, 3, NULL, 4, 'test lyric', 'test-lyric-1791911872813', NULL, NULL, 'REJECTED', NULL, 'test nofication', 'soundwave/tracks/audio/user-3-track-dc954fef-7c07-4abd-a55a-cd775b5cc421', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791911870/soundwave/tracks/audio/user-3-track-dc954fef-7c07-4abd-a55a-cd775b5cc421.mp3', 'mp3', 278269, 'soundwave/tracks/covers/user-3-cover-f9e28c2a-d764-4d4b-916a-0f4deaf066b8', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791911872/soundwave/tracks/covers/user-3-cover-f9e28c2a-d764-4d4b-916a-0f4deaf066b8.jpg', 0, '2026-10-13 10:17:52.818', '2026-10-15 13:11:08.058', '[00:30.01] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
[00:34.96] Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương (ngọt ngào trong sương)
[00:40.32] Ngắm em thật lâu, con tim anh yếu mềm
[00:45.10] Đắm say từ phút đó, từng giây trôi yêu thêm
[00:50.57] Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh (bộn bề nơi anh)
[00:55.84] Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh (bầu trời trong xanh)
[01:00.75] Liếc đôi hàng mi mong manh, anh thẫn thờ
[01:06.14] Muốn hôn nhẹ mái tóc, bờ môi em, anh mơ
[01:11.50] Cầm tay anh (anh), dựa vai anh (anh)
[01:13.98] Kề bên anh, nơi này có anh');
INSERT INTO public.tracks VALUES (33, 7, 10, 3, 'MẮT MÔI TAY CHÂN', 'mat-moi-tay-chan-1792081422366-f8b98a', NULL, 1, 'PUBLISHED', '2026-10-15 14:28:26.196', NULL, 'tracks/audio123', 'https://res.cloudinary.com/demo/video/upload/sample.mp3', 'mp3', 221000, 'albums/cover123', 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 0, '2026-10-15 09:23:42.367', '2026-10-15 14:28:32.6', NULL);
INSERT INTO public.tracks VALUES (34, 9, NULL, 2, 'Ngồi nhìn em khóc', 'ngoi-nhin-em-khoc-1792094294074', NULL, NULL, 'PUBLISHED', '2026-10-15 12:59:34.745', NULL, 'soundwave/tracks/audio/user-9-track-82ec541d-e5af-4b3f-91ae-a4eb44f5ca37', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792094295/soundwave/tracks/audio/user-9-track-82ec541d-e5af-4b3f-91ae-a4eb44f5ca37.mp3', 'mp3', 273231, 'soundwave/tracks/covers/user-9-cover-1673bd25-4978-4a38-95e5-f5a319e6b061', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792094296/soundwave/tracks/covers/user-9-cover-1673bd25-4978-4a38-95e5-f5a319e6b061.jpg', 7, '2026-10-15 12:58:14.076', '2026-10-15 12:59:39.328', NULL);
INSERT INTO public.tracks VALUES (30, 3, NULL, 5, 'test lyric', 'test-lyric-1791916099813', NULL, NULL, 'DRAFT', NULL, NULL, 'soundwave/tracks/audio/user-3-track-14c2697a-85e1-4a7c-b724-a43681e2f309', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791916098/soundwave/tracks/audio/user-3-track-14c2697a-85e1-4a7c-b724-a43681e2f309.mp3', 'mp3', 278269, NULL, NULL, 0, '2026-10-13 11:28:19.813', '2026-10-13 11:28:19.813', NULL);
INSERT INTO public.tracks VALUES (58, 7, NULL, 1, 'Raindance', 'raindance-1792752833740', 'Ca khúc nổi tiếng của rapper người Anh Dave kết hợp với nữ ca sĩ Tems, thuộc album The Boy Who Played the Harp phát hành năm 2025.', NULL, 'PUBLISHED', '2026-10-23 04:01:10.831', NULL, 'soundwave/tracks/audio/user-7-track-2f722e95-9496-432e-9da8-61598ebce0ef', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792752829/soundwave/tracks/audio/user-7-track-2f722e95-9496-432e-9da8-61598ebce0ef.mp3', 'mp3', 221008, 'soundwave/tracks/covers/user-7-cover-98d73612-2d55-46bb-ad22-8fec9dfc5a17', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792752832/soundwave/tracks/covers/user-7-cover-98d73612-2d55-46bb-ad22-8fec9dfc5a17.png', 1, '2026-10-23 03:53:53.742', '2026-10-23 04:01:15.76', '[00:18.00] Let''s get the party started
[00:20.00] See you at the bar, you was hardly talkin''
[00:22.00] That''s when I knew that your heart was scarrin''
[00:24.00] Friends to lovers, need a part to star in, like, "Wait, babe
[00:27.00] Let me ask your pardon
[00:29.00] This ain''t Gucci, this is Prada, darlin''
[00:31.00] If you want somethin'', you can ask me, darlin''"
[00:34.00] Then you started laughin'' ''cause you think I''m jokin''
[00:36.00] But lookin'' in your eyes is the best thing
[00:38.00] Brake lights givin'' you the red skin
[00:40.00] You was in a bad mood from we stepped in
[00:42.00] Though you checked out ''fore we even checked in
[00:44.00] On the phone you gon'' vent to your best friend
[00:46.00] The one who gave me the lecture, but I ain''t gon'' sweat you, babe
[00:49.00] I''ma let you catch up with your boy, undress you
[00:52.00] And let me tell you why I''ma bless you
[00:55.00] It''s the way my mind is fallin'' away
[00:59.00] In my heart, I know
[01:02.00] You feel the same when you''re with me
[01:05.00] You know I''m all you need
[01:07.00] You''re where I wanna be
[01:09.00] My darling, can''t you see?
[01:12.00] I love you
[01:16.00] I love you
[01:20.00] I love you
[01:24.00] I love you
[01:29.00] I love you
[01:31.00] Fell into you
[01:33.00] Say you want me in the mood
[01:35.00] Tryna hide my feelings for you
[01:37.00] Don''t wanna argue, not with you
[01:39.00] Tell me why you''re so in denial
[01:41.00] Hold me close, don''t tell me goodnight
[01:43.00] Are you down to get me?
[01:46.00] Tell me when you''re ready, I''m ready
[01:49.00] We can get into it or we can get intimate
[01:52.00] The shower when you sing in it
[01:53.00] Better than Beyoncé, I like the sound of fiancée
[01:56.00] You know it''s got a little ring to it
[01:58.00] And really when I think of it
[01:59.00] Growin'' up, I didn''t ever see marriages
[02:01.00] No weddings, no horse, no carriages
[02:03.00] I wanna do things different and change the narrative
[02:06.00] God knows you a wild child, beautiful child, I need your help
[02:09.00] Lookin'' like you come from the ''90s by yourself
[02:11.00] My mum sixty-one and her favourite line to tell her son is
[02:14.00] "Sometimes she wish that she had a girl"
[02:15.00] I wanna take you back to a time, back to a trip
[02:18.00] You had that white wine that I never got to sip
[02:20.00] And dinner wasn''t ruined ''cause you never got to pick
[02:22.00] I know that everybody told me that I''m sick ''cause
[02:24.00] It''s the way my mind is fallin'' away
[02:28.00] In my heart, I know
[02:30.00] You feel the same when you''re with me
[02:33.00] You know I''m all you need
[02:36.00] You''re where I wanna be
[02:38.00] My darling, can''t you see?
[02:41.00] I love you (Me and you, never let me go)
[02:45.00] (Me and you, I''ll tell you two times)
[02:47.00] I love you (Me and you, never let me go)
[02:50.00] (Me and you, tell me two times)
[02:52.00] I love you (Me and you, never let me go)
[02:54.00] (Me and you, tell me two times)
[02:56.00] I love you (Me and you, never let me go)
[02:58.00] (Me and you, tell me two times)
[03:00.00] I said lean with it, rock with it
[03:03.00] Your finger, I could put a rock in it
[03:05.00] Fin-finger, I could put a rock in it
[03:07.00] Bank card, they gon'' put a block in it
[03:09.00] Said rock with it, bounce with it
[03:12.00] The left wrist, I could put my house in it
[03:14.00] You wanna bet, babe? I could put my house in it
[03:16.00] Paper, I could put my spouse in it
[03:18.00] I said shimmy shimmy yay, shimmy
[03:20.00] Shimmy shimmy yah
[03:21.00] 5''9", brown eyes, and she in it, in it
[03:23.00] Shimmy shimmy yay, shimmy
[03:25.00] Shimmy shimmy yah
[03:26.00] 5''9", brown eyes, innit, innit
[03:28.00] Shimmy shimmy yay, shimmy
[03:30.00] Shimmy shimmy yah
[03:31.00] 5''9", brown eyes, and she in-in—
[03:33.00] Shimmy shimmy yay, shimmy
[03:34.00] Shimmy shimmy yah
[03:35.00] 5''9", brown eyes...');
INSERT INTO public.tracks VALUES (7, 11, NULL, 3, 'Exit Sign', 'exit-sign-hieuthuhai', 'Ca khúc nổi bật trong album Ai Cũng Phải Bắt Đầu Từ Đâu Đó của HIEUTHUHAI kết hợp cùng marzuz và Kewtiie.', 2, 'PUBLISHED', '2026-10-09 10:02:15.314', NULL, 'soundwave/tracks/audio/project-track-exit-sign-hieuthuhai', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565333/soundwave/tracks/audio/project-track-exit-sign-hieuthuhai.mp3', 'mp3', 201718, 'soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565335/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', 28471, '2026-10-09 10:02:15.314', '2026-10-11 03:20:10.993', NULL);
INSERT INTO public.tracks VALUES (14, 19, NULL, 6, 'LAVIEM', 'laviem-1791628478397', 'cheerful music', NULL, 'REJECTED', NULL, 'Incomplete or placeholder metadata (title, artist or artwork).', 'soundwave/tracks/audio/user-8-track-77c015f5-065e-4aed-af0a-2520edbaf78d', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791628476/soundwave/tracks/audio/user-8-track-77c015f5-065e-4aed-af0a-2520edbaf78d.mp3', 'mp3', 270620, 'soundwave/tracks/covers/user-8-cover-a112720c-2e65-4fe5-bb6f-755e129c578f', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791628478/soundwave/tracks/covers/user-8-cover-a112720c-2e65-4fe5-bb6f-755e129c578f.png', 0, '2026-10-10 03:34:38.404', '2026-10-10 04:19:29.926', NULL);
INSERT INTO public.tracks VALUES (61, 9, NULL, 5, 'In Love', 'in-love-1792862381088', NULL, NULL, 'TAKEN_DOWN', '2026-10-24 10:20:19.543', NULL, NULL, NULL, 'mp3', 200923, NULL, NULL, 0, '2026-10-24 10:19:41.089', '2026-10-24 10:20:39.656', NULL);
INSERT INTO public.tracks VALUES (5, 20, NULL, 1, 'Bản Nháp Chưa Duyệt (Seed)', 'seed-draft-song', 'Bài hát bản nháp dùng để kiểm tra BR-09 từ chối phát.', NULL, 'DRAFT', NULL, NULL, 'seed/audio-draft', 'https://res.cloudinary.com/demo/video/upload/dog.mp3', 'mp3', 45000, 'seed/cover-draft', 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 0, '2026-10-09 07:52:43.18', '2026-10-09 07:52:43.18', NULL);
INSERT INTO public.tracks VALUES (50, 9, NULL, 4, 'Buông', 'buong-1792321862145', NULL, NULL, 'PUBLISHED', '2026-10-18 04:13:26.372', NULL, 'soundwave/tracks/audio/user-9-track-5bad8921-b956-44f9-8206-dd2cdf5f0369', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792321859/soundwave/tracks/audio/user-9-track-5bad8921-b956-44f9-8206-dd2cdf5f0369.mp3', 'mp3', 205171, 'soundwave/tracks/covers/user-9-cover-e549b824-73fe-4568-8c8b-ac309f3740f3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792321861/soundwave/tracks/covers/user-9-cover-e549b824-73fe-4568-8c8b-ac309f3740f3.jpg', 8, '2026-10-18 04:11:02.147', '2026-10-18 04:13:33.218', '[00:00.60] Từ giờ anh sẽ xóa đi hết kỉ niệm
[00:05.15] Anh sẽ quên hết thứ anh đã tin
[00:09.94] Chẳng để sót lại gì làm anh lưu luyến
[00:16.85] Anh chẳng còn sức để ôm vào lòng
[00:21.05] Hãy để mọi thứ trôi đi theo dòng
[00:25.50] Hãy cứ xem như chuyện mình chỉ là giấc mơ
[00:33.20] Cũng đã bao tháng trôi qua
[00:37.20] Mà anh cứ ngỡ chỉ mới hôm qua
[00:40.79] Có lẽ anh chỉ chực chờ hoài, rồi đếm giây trôi
[00:44.50] Xong cứ nghĩ mãi về đôi ta, oh
[00:48.50] Từng hứa sẽ quên em nhanh
[00:52.00] Mà dường như cơn mưa mãi không tạnh
[00:55.50] Nhìn em vui hạnh phúc bên ai rồi
[00:59.20] Mà sao tim anh chẳng đành?
[01:03.20] Từ giờ anh sẽ xóa đi hết kỷ niệm
[01:07.04] Anh sẽ quên hết thứ anh đã tin
[01:11.84] Chẳng để sót lại gì làm anh lưu luyến
[01:18.25] Anh chẳng còn sức để ôm vào lòng
[01:22.50] Hãy để mọi thứ trôi đi theo dòng
[01:27.00] Và cứ xem như chuyện mình chỉ là giấc mơ (chỉ là giấc mơ)
[01:34.00] Baby, anh nhận ra ta chưa từng chịu nghe nhau nói
[01:36.40] Cứ trách và móc để dần nỗi nhớ nhân đôi
[01:38.40] Không bận tâm rồi một ngày cơn giông tới
[01:40.59] Để nó cuốn đi hết, giờ thì hai đứa hai nơi
[01:42.70] Ta phí thời giờ với những lần tranh cãi
[01:44.70] Cũng chỉ để nhận lại dòng nước mắt tuôn rơi
[01:47.00] Rớt thành dòng, tích thành vùng biên hải
[01:49.00] Rồi lại đặt câu hỏi, "Sao tan nát em ơi?"
[01:51.20] Oh, ta thường sống như vậy mà
[01:53.20] Biết là bad vẫn cố chấp như vậy mà
[01:55.20] Nước mắt siết thành thác, tới khô khốc như vậy mà
[01:57.20] Tình mình hóa tan nát cũng vì ngu ngốc như vậy mà
[01:59.20] Oh, chỉ là vài lời cuối rồi anh hứa rằng mình sẽ cố quên đi em
[02:03.00] Nếu mai này em tìm được hạnh phúc, hãy chậm lại một chút để lắng nghe nhau thêm
[02:06.20] Anh đã cố để quên em nhanh
[02:09.80] Mà dường như cơn mưa mãi không tạnh
[02:13.19] Nhìn em vui hạnh phúc bên ai rồi
[02:17.00] Mà sao tim anh chẳng đành
[02:21.00] Từ giờ anh sẽ xóa đi hết kỷ niệm
[02:24.80] Anh sẽ quên hết thứ anh đã tin
[02:29.00] Chẳng để sót lại gì làm anh lưu luyến
[02:35.80] Anh chẳng còn sức để ôm vào lòng
[02:40.00] Hãy để mọi thứ trôi đi theo dòng
[02:44.50] Và cứ xem như chuyện mình chỉ là giấc mơ
[02:51.80] Anh từng ước thời gian ngưng đọng
[02:55.80] Để được ôm em vào mãi trong lòng
[02:59.80] Giờ mọi thứ như hóa vô vọng
[03:03.80] Anh phải làm sao để qua cơn giông?
[03:07.80] Từng lời em nói còn vang bên tai
[03:11.80] Dù anh đã cố để chẳng nhớ lại
[03:15.80] Từ giờ ta chấm dứt chia hai
[03:19.19] Hãy quên giấc mơ yêu mãi không phai');
INSERT INTO public.tracks VALUES (44, 9, NULL, 5, 'Phải lòng', 'phai-long-1792318735196', NULL, NULL, 'TAKEN_DOWN', '2026-10-24 10:03:07.317', NULL, NULL, NULL, 'mp3', 268525, NULL, NULL, 0, '2026-10-18 03:18:55.197', '2026-10-24 10:08:25.757', NULL);
INSERT INTO public.tracks VALUES (36, 9, NULL, 2, 'Không Buông', 'khong-buong-1792100491097', NULL, NULL, 'PUBLISHED', '2026-10-15 14:42:42.255', NULL, 'soundwave/tracks/audio/user-9-track-389a3a87-ba00-4392-b1ac-d3830acf1631', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792100491/soundwave/tracks/audio/user-9-track-389a3a87-ba00-4392-b1ac-d3830acf1631.mp3', 'mp3', 174875, 'soundwave/tracks/covers/user-9-cover-35d6692c-bd31-4266-a4f0-1b2a9d05bd54', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792100493/soundwave/tracks/covers/user-9-cover-35d6692c-bd31-4266-a4f0-1b2a9d05bd54.jpg', 8, '2026-10-15 14:41:31.098', '2026-10-15 14:42:46.426', NULL);
INSERT INTO public.tracks VALUES (17, 3, 1, 3, 'IDK', 'idk-1791644929842', NULL, NULL, 'REJECTED', NULL, 'Audio clipping or severe distortion detected in master stream.', 'soundwave/tracks/audio/user-3-track-125b4b65-0a23-4345-91d1-521eae157b7d', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791644925/soundwave/tracks/audio/user-3-track-125b4b65-0a23-4345-91d1-521eae157b7d.mp3', 'mp3', 367525, 'soundwave/tracks/covers/user-3-cover-f3c8d0f7-7e19-48e6-adc0-a43a40c3b617', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791644928/soundwave/tracks/covers/user-3-cover-f3c8d0f7-7e19-48e6-adc0-a43a40c3b617.jpg', 0, '2026-10-10 08:08:49.844', '2026-10-11 07:19:16.137', NULL);
INSERT INTO public.tracks VALUES (67, 8, 16, 5, 'LAV', 'lav-1793439786219-2b0451', NULL, 1, 'PENDING', NULL, NULL, 'soundwave/tracks/audio/user-8-track-d553f41d-409e-4d89-b899-1134f3ddf1a2', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793439737/soundwave/tracks/audio/user-8-track-d553f41d-409e-4d89-b899-1134f3ddf1a2.mp3', 'mp3', 270620, 'soundwave/albums/covers/user-8-album-cover-bf5eae17-996a-4b95-a465-a765438c608b', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793439719/soundwave/albums/covers/user-8-album-cover-bf5eae17-996a-4b95-a465-a765438c608b.png', 0, '2026-10-31 02:43:06.222', '2026-10-31 02:43:06.222', NULL);
INSERT INTO public.tracks VALUES (6, 12, NULL, 3, 'Baby', 'baby-mck', 'Bản hit đầy cảm xúc từ album 99% của MCK.', 1, 'PUBLISHED', '2026-10-09 10:01:54.581', NULL, 'soundwave/tracks/audio/project-track-baby-mck', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565312/soundwave/tracks/audio/project-track-baby-mck.mp3', 'mp3', 173740, 'soundwave/tracks/covers/project-cover-baby-mck', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565314/soundwave/tracks/covers/project-cover-baby-mck.webp', 15216, '2026-10-09 10:01:54.581', '2026-10-11 03:20:10.897', NULL);
INSERT INTO public.tracks VALUES (68, 8, 16, 5, 'TOP 1', 'top-1-1793439786408-6ae43e', NULL, 2, 'PENDING', NULL, NULL, 'soundwave/tracks/audio/user-8-track-491309af-a644-4612-99a8-67db0f15b669', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793439761/soundwave/tracks/audio/user-8-track-491309af-a644-4612-99a8-67db0f15b669.mp3', 'mp3', 187742, 'soundwave/albums/covers/user-8-album-cover-bf5eae17-996a-4b95-a465-a765438c608b', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793439719/soundwave/albums/covers/user-8-album-cover-bf5eae17-996a-4b95-a465-a765438c608b.png', 0, '2026-10-31 02:43:06.409', '2026-10-31 02:43:06.409', NULL);
INSERT INTO public.tracks VALUES (69, 8, 16, 5, 'MRT', 'mrt-1793439786490-ee33e6', NULL, 3, 'PENDING', NULL, NULL, 'soundwave/tracks/audio/user-8-track-92942881-0a5a-44bc-9e41-60c8942a6e3d', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793439786/soundwave/tracks/audio/user-8-track-92942881-0a5a-44bc-9e41-60c8942a6e3d.mp3', 'mp3', 210862, 'soundwave/albums/covers/user-8-album-cover-bf5eae17-996a-4b95-a465-a765438c608b', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793439719/soundwave/albums/covers/user-8-album-cover-bf5eae17-996a-4b95-a465-a765438c608b.png', 0, '2026-10-31 02:43:06.491', '2026-10-31 02:43:06.491', NULL);
INSERT INTO public.tracks VALUES (10, 10, NULL, 1, 'Nơi Này Có Anh', 'noi-nay-co-anh', 'Bản tình ca Pop ngọt ngào, lãng mạn đình đám của Sơn Tùng M-TP.', NULL, 'PUBLISHED', '2026-10-09 10:03:23.723', NULL, 'soundwave/tracks/audio/project-track-noi-nay-co-anh', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565402/soundwave/tracks/audio/project-track-noi-nay-co-anh.mp3', 'mp3', 278282, 'soundwave/tracks/covers/project-cover-noi-nay-co-anh', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', 45657, '2026-10-09 10:03:23.723', '2026-10-13 12:25:51.556', '[00:29.94] Em là ai từ đâu bước đến nơi đây dịu dàng chân phương (dịu dàng chân phương)
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
[02:03.49] (Yeah)
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
Tình yêu bé nhỏ xin dành tặng riêng em');
INSERT INTO public.tracks VALUES (16, 3, 1, 3, 'MẮT MÔI TAY CHÂN', 'mat-moi-tay-chan-1791644742088', NULL, 3, 'PUBLISHED', '2026-10-10 08:06:11.632', NULL, 'soundwave/tracks/audio/user-3-track-e78439cf-f288-424a-acc9-133ce33016b7', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791644737/soundwave/tracks/audio/user-3-track-e78439cf-f288-424a-acc9-133ce33016b7.mp3', 'mp3', 221797, 'soundwave/tracks/covers/user-3-cover-b563100a-8018-47c2-b60c-a9d79090dec3', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791644740/soundwave/tracks/covers/user-3-cover-b563100a-8018-47c2-b60c-a9d79090dec3.jpg', 9, '2026-10-10 08:05:42.09', '2026-10-11 03:20:00.763', NULL);
INSERT INTO public.tracks VALUES (8, 13, NULL, 2, 'Giữa Đại Lộ Đông Tây', 'giua-dai-lo-dong-tay', 'Ca khúc ballad da diết sáng tác bởi Hứa Kim Tuyền qua giọng hát nội lực của Uyên Linh.', 1, 'PUBLISHED', '2026-10-09 10:02:36.028', NULL, 'soundwave/tracks/audio/project-track-giua-dai-lo-dong-tay', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565353/soundwave/tracks/audio/project-track-giua-dai-lo-dong-tay.mp3', 'mp3', 226691, 'soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565356/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', 19810, '2026-10-09 10:02:36.028', '2026-10-09 10:02:36.028', NULL);
INSERT INTO public.tracks VALUES (20, 8, NULL, 6, 'SECRET', 'secret-1791743674225', 'This is a vibrant song', NULL, 'REJECTED', NULL, 'Audio file corrupted or encoding does not meet platform standards.', 'soundwave/tracks/audio/user-8-track-910a655c-a8f6-4fd1-a53f-e12036ab1608', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791743671/soundwave/tracks/audio/user-8-track-910a655c-a8f6-4fd1-a53f-e12036ab1608.mp3', 'mp3', 280560, 'soundwave/tracks/covers/user-8-cover-c0886b53-1265-4de8-aa17-2fef0df2235e', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791743673/soundwave/tracks/covers/user-8-cover-c0886b53-1265-4de8-aa17-2fef0df2235e.png', 0, '2026-10-11 11:34:34.227', '2026-10-11 12:24:39.545', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...');
INSERT INTO public.tracks VALUES (19, 8, NULL, 2, 'TOP 1', 'top-1-1791743301344', 'relaxing music', NULL, 'REJECTED', NULL, 'Unlicensed sample, beat, or suspected copyright infringement.', 'soundwave/tracks/audio/user-8-track-e7eead3d-6d33-4d66-bbe8-f8d9ae7a7e31', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791743297/soundwave/tracks/audio/user-8-track-e7eead3d-6d33-4d66-bbe8-f8d9ae7a7e31.mp3', 'mp3', 187742, 'soundwave/tracks/covers/user-8-cover-9ce54244-b424-4f33-a536-a04c9332ea41', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791743300/soundwave/tracks/covers/user-8-cover-9ce54244-b424-4f33-a536-a04c9332ea41.png', 0, '2026-10-11 11:28:21.352', '2026-10-11 12:31:14.697', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...');
INSERT INTO public.tracks VALUES (13, 15, NULL, 1, 'Yoru ni Kakeru (夜に駆ける)', 'yoru-ni-kakeru', 'Bản hit đột phá toàn cầu của bộ đôi YOASOBI dựa trên tiểu thuyết Tanatosu no Yūwaku.', 1, 'PUBLISHED', '2026-10-09 10:06:00.496', NULL, 'soundwave/tracks/audio/project-track-yoru-ni-kakeru', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565419/soundwave/tracks/audio/project-track-yoru-ni-kakeru.mp3', 'mp3', 275043, 'soundwave/tracks/covers/project-cover-yoru-ni-kakeru', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565560/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', 38933, '2026-10-09 10:06:00.496', '2026-10-09 10:06:00.496', NULL);
INSERT INTO public.tracks VALUES (46, 8, 11, 2, 'TOP 1', 'top-1-1792319237706-a41201', 'feedling', 2, 'PUBLISHED', '2026-10-18 04:15:40.893', NULL, 'soundwave/tracks/audio/user-8-track-eb95845a-1de0-4329-b65d-bfba7a682e2e', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792319237/soundwave/tracks/audio/user-8-track-eb95845a-1de0-4329-b65d-bfba7a682e2e.mp3', 'mp3', 187742, 'soundwave/albums/covers/user-8-album-cover-cc31450f-a733-4957-932d-a6de9f544701', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792319206/soundwave/albums/covers/user-8-album-cover-cc31450f-a733-4957-932d-a6de9f544701.png', 0, '2026-10-18 03:27:17.708', '2026-10-18 04:15:47.504', '[00:00.00] [Verse 1]
[00:10.00] Anh thường hay thức khuya
[00:11.00] Nghĩ về thứ anh vẫn luôn mong đợi
[00:14.00] Rằng phải làm sao?
[00:15.00] Cũng chẳng biết đến bao giờ?
[00:20.00] Những lời ca dở dang
[00:21.00] Anh ngồi viết mãi vẫn còn chưa xong
[00:24.00] Chạy theo đằng sau ánh sáng
[00:27.00] Cuối nơi chân trời.
[00:29.00] Rồi em đến đây dịu dàng cạnh bên anh
[00:33.00] Cơn mưa rơi trở nên long lanh
[00:35.00] Chẳng còn đợi trông
[00:37.00] Vì giấc mơ có em thêm màu xanh
[00:40.00] Thật lòng chẳng xa xôi
[00:43.00] Ước muốn anh ở ngay đây thôi
[00:45.00] Anh không bận tâm nữa
[00:47.00] Vì anh có em.
[00:50.00] Nếu như ngày mai không diễn ra
[00:52.00] Giống cách mà anh cứ luôn mơ mộng?
[00:55.00] Thì vẫn có một người luôn phía sau
[00:58.00] Nhẹ nắm tay anh
[01:00.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:03.00] Dặn lòng phải xứng đáng hơn
[01:05.00] Để anh trở thành chàng trai
[01:07.00] Top 1 trong mắt em.
[01:13.00] Phải tự thân vượt lên, anh vốn không thích hai chữ đáng thương
[01:15.00] Nhiều người nói là không được đâu nhưng anh vẫn cứ ngang ngược
[01:17.00] Bởi vì sâu ở trong đầu anh toàn chứa những thứ hoang đường
[01:19.00] Và từ hồi bé anh đã mơ ước được hát như chú Đan Trường
[01:21.00] Bầu trời đêm okay cho nên không sao
[01:23.00] Có đứa nhóc ôm đàn ngân nga những câu yêu đời
[01:26.00] Dù cho phải gặp bao nhiêu gian khó
[01:28.00] Vẫn luôn là em dõi theo anh
[01:31.00] Dù anh đi đến đâu...
[01:45.00] Nếu như ngày mai không diễn ra
[01:47.00] Giống cách mà anh cứ luôn mơ mộng?
[01:50.00] Thì vẫn có một người luôn phía sau
[01:53.00] Nhẹ nắm tay anh
[01:55.00] Biết còn nhiều điều lo lắng đang vây quanh
[01:58.00] Dặn lòng phải xứng đáng hơn
[02:00.00] Để anh trở thành chàng trai
[02:02.00] Top 1 trong mắt em.
[02:08.00] Những cơ hội vụt qua đôi tay
[02:11.00] Vậy chắc chưa phải là ngày hôm nay
[02:14.00] Thì cứ tiếp tục để chạy theo tiếng gọi
[02:17.00] Từng câu nói mà anh vẫn luôn tin vào.
[02:20.00] Có những lần đôi mắt anh lạc phương hướng
[02:23.00] Để rồi đêm tối anh không về nhà
[02:26.00] Thì vẫn luôn là em
[02:28.00] Ngọn đèn rực rỡ chiếu soi nơi anh...
[02:30.00] Nếu như ngày mai không diễn ra
[02:32.00] Giống cách mà anh cứ luôn mơ mộng
[02:35.00] Thì vẫn có một người luôn phía sau nhẹ nắm tay anh
[02:40.00] Biết còn nhiều điều lo lắng đang vây quanh
[02:43.00] Dặn lòng phải xứng đáng hơn
[02:45.00] Để anh trở thành chàng trai
[02:48.00] Top 1 trong mắt em...
[02:53.00] Top 1 trong mắt em.
[Chorus]
[Verse 2]
[Chorus]
[Bridge]
[Chorus & Outro]');
INSERT INTO public.tracks VALUES (45, 8, 11, 6, 'LAVIEM', 'laviem-1792319232160-1fad98', 'Music good', 1, 'PUBLISHED', '2026-10-18 03:32:16.177', NULL, 'soundwave/tracks/audio/user-8-track-e1db5848-ac5e-4efc-aee6-cd7f10490d82', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792319231/soundwave/tracks/audio/user-8-track-e1db5848-ac5e-4efc-aee6-cd7f10490d82.mp3', 'mp3', 270620, 'soundwave/albums/covers/user-8-album-cover-cc31450f-a733-4957-932d-a6de9f544701', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792319206/soundwave/albums/covers/user-8-album-cover-cc31450f-a733-4957-932d-a6de9f544701.png', 1, '2026-10-18 03:27:12.163', '2026-10-18 03:32:22.53', '[00:02.00] Còn cần thiết nữa, nói chi đến đây cũng thừa
[00:04.00] Giờ chỉ còn mình với vấn vương (Rượu vang pha với cơn mưa)
[00:07.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:09.00] Biết sao hết cho vừa?
[00:11.00] Lòng nhau mới thấu đây em
[00:13.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[00:17.00] Rượu vang pha với cơn mưa
[00:20.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[00:22.00] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[00:26.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[00:30.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[00:33.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[00:37.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[00:41.00] Ta chia tay, vì sao em ơi?
[00:44.00] Điều này anh muốn hỏi lâu rồi
[00:47.00] Những khung trời kỷ niệm vỡ đôi
[00:50.00] Có phải vì một câu anh đã lỡ lời?
[00:54.00] Sau đêm nay, tự ta cho ta
[00:57.00] Em và anh một đoạn kết mới
[01:00.00] Dù rằng mình còn yêu nhau rất nhiều đấy
[01:04.00] Nhưng để ở lại thì anh nghĩ là không
[01:06.00] Và sau những cảm xúc nhất thời
[01:10.00] Người bên em giờ này chẳng còn là anh
[01:13.00] Gửi lại quá khứ cung đàn đã vỡ
[01:17.00] Vì những vấn vương ấy chưa kịp thành lời
[01:19.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[01:23.00] Rượu vang pha với cơn mưa
[01:26.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[01:28.00] Biết sao hết cho vừa? Lòng nhau mới thấu đây em
[01:33.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[01:36.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[01:39.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[01:43.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[01:46.00] Tất cả là tại vì em, em, em, em, em, e-em
[01:50.00] Người xa lạ anh từng quen
[01:53.00] Tất cả là tại vì em, em, em, em, em, e-em
[01:57.00] Kẻ ngốc đang say tình dưới ngọn đèn
[01:59.00] Tất cả là tại vì em, em, em, em, em, e-em
[02:03.00] Người xa lạ anh từng quen
[02:06.00] Tất cả là tại vì em, em, em, em, em, yeah-eh-eh
[02:10.00] Kẻ ngốc đang say tình dưới ngọn đèn
[02:13.00] Lau đôi mi, đây là nước mắt hay mưa
[02:15.00] Buông đôi tay, anh đâu muốn phải dây dưa
[02:17.00] Quên đi đôi mắt ấy khi xưa, chẳng bên nhau được nữa
[02:20.00] Sau bao lần đau, anh lại cho đi và quên
[02:22.00] Anh ghét nỗi đau, cơn mưa đêm kia và em
[02:24.00] Ta vội quên rồi, những điều sao thật quen
[02:27.00] Để nỗi buồn kia gọi tên mỗi khi bài ca bật lên
[02:28.00] Và sau những cảm xúc nhất thời
[02:30.00] Người bên em giờ này chẳng còn là anh
[02:33.00] Gửi lại quá khứ cung đàn đã vỡ
[02:37.00] Vì những vấn vương ấy chưa kịp thành lời
[02:39.00] Trái tim anh chẳng còn cần thiết nữa, nói chi đến đây cũng thừa
[02:43.00] Rượu vang pha với cơn mưa
[02:45.00] Hàng trăm lý do cũng chẳng thể cứu vãn
[02:48.00] Biết sao hết cho vừa lòng nhau mới thấu đây em?
[02:52.00] Dệt hàng triệu vết thương, tự vùi mình trước gương
[02:56.00] Nhìn một người đã từng thương sao nay xa lạ đến bất thường
[03:03.00] Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
[03:07.00] Chảy ngược tận sâu bên trong nghẹn đắng nơi lồng ngực
[03:11.00] Tất cả là tại vì em...
[03:15.00] Người xa lạ anh từng quen...
[03:19.00] Tất cả là tại vì em...
[Chorus: CAPTAIN BOY & CoolKid]
[Verse 1: Pháp Kiều & CAPTAIN BOY]
[Pre-Chorus: Quang Hùng MasterD]
[Chorus: Quang Hùng MasterD & CAPTAIN BOY]
[Post-Chorus: Quang Hùng MasterD & CoolKid]
[Verse 2: Pháp Kiều]
[Pre-Chorus: CoolKid & Quang Hùng MasterD]
[Chorus: Cả nhóm]
[Outro]');
INSERT INTO public.tracks VALUES (38, 9, NULL, 8, '3017-2', '3017-2-1792101165612', '3017', NULL, 'PUBLISHED', '2026-10-15 14:54:44', NULL, 'soundwave/tracks/audio/user-9-track-b213fcc7-d40e-41ea-b375-5c58ea99e902', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792101166/soundwave/tracks/audio/user-9-track-b213fcc7-d40e-41ea-b375-5c58ea99e902.mp3', 'mp3', 268525, 'soundwave/tracks/covers/user-9-cover-4927c9e2-010d-4169-835d-0787f9b65af7', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792101168/soundwave/tracks/covers/user-9-cover-4927c9e2-010d-4169-835d-0787f9b65af7.jpg', 11, '2026-10-15 14:52:45.612', '2026-10-15 14:54:49.301', NULL);
INSERT INTO public.tracks VALUES (9, 14, NULL, 4, 'Tìm Em', 'tim-em-hngle-bao-anh', 'Giai điệu R&B nhẹ nhàng, lãng mạn qua sự kết hợp ăn ý giữa Hngle và Bảo Anh.', 1, 'PUBLISHED', '2026-10-09 10:03:04.748', NULL, 'soundwave/tracks/audio/project-track-tim-em-hngle-bao-anh', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565382/soundwave/tracks/audio/project-track-tim-em-hngle-bao-anh.mp3', 'mp3', 272170, 'soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565384/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', 12305, '2026-10-09 10:03:04.748', '2026-10-09 10:03:04.748', NULL);
INSERT INTO public.tracks VALUES (26, 18, NULL, 7, 'One more time one more chance', 'one-more-time-one-more-chance-1791896096019', NULL, NULL, 'PUBLISHED', '2026-10-13 06:19:18.747', NULL, 'soundwave/tracks/audio/user-9-track-e468ef72-df02-41ea-9ab3-0fce4f0418ae', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791896094/soundwave/tracks/audio/user-9-track-e468ef72-df02-41ea-9ab3-0fce4f0418ae.mp3', 'mp3', 334367, 'soundwave/tracks/covers/user-9-cover-6be7e3cb-e85a-4557-a8a3-3f30b7c01f78', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791896096/soundwave/tracks/covers/user-9-cover-6be7e3cb-e85a-4557-a8a3-3f30b7c01f78.jpg', 5, '2026-10-13 05:54:56.019', '2026-10-13 06:20:22.293', NULL);
INSERT INTO public.tracks VALUES (56, 9, NULL, 4, 'In Love', 'in-love-1792837675833', 'Love', NULL, 'PUBLISHED', '2026-10-24 03:46:17.124', NULL, 'soundwave/tracks/audio/user-9-track-04b6d5f4-f685-4b6c-b1fa-c5ef58fe7bc9', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792837672/soundwave/tracks/audio/user-9-track-04b6d5f4-f685-4b6c-b1fa-c5ef58fe7bc9.mp3', 'mp3', 200923, 'soundwave/tracks/covers/user-9-cover-633898b2-7968-4a50-ab4b-0fe177690d60', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792837675/soundwave/tracks/covers/user-9-cover-633898b2-7968-4a50-ab4b-0fe177690d60.jpg', 16, '2026-10-18 18:45:19.44', '2026-10-24 03:46:23.253', '[00:21.57] Nơi anh bao năm không có nắng
[00:24.28] Và mưa giăng nơi em đôi khi cũng chưa từng muốn ngừng
[00:27.00] Mà đi bao xa ta vẫn thấy ngắn
[00:29.19] Vì nơi đâu cũng là nhà
[00:32.46] Anh băng qua bao la con sóng trắng
[00:35.13] Niềm tin mong manh cũng chỉ biết giăng buồm thật căng
[00:37.75] Để mà lênh đênh trôi mang theo bao cố gắng
[00:40.10] Dù mưa gió có lỡ xô anh đi xa bến bờ
[00:43.03] Vì ngày đó anh chẳng cần biết điều gì đến
[00:46.95] Cũng chẳng thể viết vội đoạn kết
[00:49.67] Khi còn chưa đi hết những xước chai, những đúng sai
[00:53.96] Và ngoài đó hoang tàn giằng xé
[00:56.64] Thì ở đây vẫn có điều nhỏ bé
[00:59.46] Mà lặng lẽ vun xây những mơ mộng này
[01:02.25] Để hôm nay khi đứng đây, em chính là điều nhỏ bé ở bên bờ
[01:05.62] (<I''m in love, I''m in love, in love with you>) ooh, my love
[01:08.42] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[01:11.15] (<I''m in love, I''m in love, in love with you>) ở bên bờ, ở bên bờ cùng mong nhớ
[01:16.64] (<I''m in love, I''m in love, in love with you>) ooh, my love
[01:19.37] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[01:22.06] (<I''m in love, I''m in love, in love with you>)
[01:24.28] Em vẫn luôn rạng rỡ, gom từng thương nhớ nơi bến bờ
[01:27.51] Yeah, nhiều cô gái không hiểu được anh
[01:29.78] Và có nhiều mối quan hệ ngày xưa cũng tự kết thúc vì nó
[01:32.72] Anh là kiểu người mà nếu muốn đùa cợt thì nhanh
[01:35.28] Nhưng để ngồi xuống nói chuyện mở lòng thực sự thì khó
[01:37.45] Chắc là anh không giỏi chuyện đó, anh vô thức giấu hết đi
[01:40.31] Anh vô thức giấu hết đi vào trong hố đen những luồng suy nghĩ
[01:43.17] Và em là người đầu tiên dạy anh nghĩ gì phải nói ra
[01:45.87] Nhưng nhiều lúc nói tự nhiên cổ họng của anh bị nghẹn và
[01:48.25] Não không nghĩ được gì cả, cảm giác đấy khá kì lạ
[01:51.06] Cảm giác như không sắp xếp được đúng suy nghĩ để cho mình tả
[01:53.75] Lớn lên anh nhận ra mở lòng là kĩ năng
[01:56.15] Anh nghĩ EQ anh chưa cao và anh chưa thực sự chín chắn, ah
[01:59.25] Đôi nào chả có cãi vã khi căng thẳng tăng dần lên
[02:01.92] Sẽ có những chủ đề thực sự nhạy cảm nếu như đề cập đến
[02:04.68] Nhưng cho đến cuối em vẫn bình tĩnh nghe anh (nghe)
[02:07.43] Nói với anh rằng nếu từ đầu anh cho em biết thì mưa giông trong đầu anh sẽ tạnh thôi
[02:11.46] Ngày trôi, đầu anh trở nên thảnh thơi
[02:13.62] Anh thấy hạnh phúc khi ở cùng em nhìn mưa bên ngoài rơi
[02:16.49] Anh chưa bao giờ cảm thấy an toàn và yên tâm như thế
[02:19.12] Và mình có thể nói chuyện hàng giờ về chỉ một chủ đề
[02:22.12] You''re the only girl showing me the way to love
[02:24.62] Only one I trust, ain''t afraid to tell the world
[02:27.50] Many things to learn, anh không cần gì hơn
[02:29.57] Ngoài thấy em ở bên cạnh anh khi anh mở mắt dậy vào sáng sớm, ah
[02:32.06] Ooh, my love (I''m in love, I''m in love, in love with you)
[02:34.62] Ooh, my love (yeah) (I''m in love, I''m in love, in love with you)
[02:37.32] Nơi ấy em chờ (I''m in love, I''m in love, in love with you) (this song''s for you)
[02:40.21] Ở bên bờ, ở bên bờ cùng mong nhớ (ah, ah, ah, ah)
[02:43.81] (<I''m in love, I''m in love, in love with you>) ooh, my love
[02:46.59] (<I''m in love, I''m in love, in love with you>) nơi ấy em chờ
[02:49.21] (<I''m in love, I''m in love, in love with you>) yeah
[02:51.43] Em vẫn luôn rạng rỡ, gom từng thương nhớ nơi bến bờ (yeah, yeah, yeah, yeah)
[02:54.65] (<I''m in love, I''m in love, in love with you>) I''m in love with you
[02:57.65] (<I''m in love, I''m in love>) in love with you, in love (I''m in love, I''m in love, in love with you)
[03:00.21] (<I''m in love, I''m in love, in love with you>) I''m in love with you (hah)
[03:04.52] My love ở bên bờ (Low G) (I''m in love, I''m in love, in love with you)
[03:06.78] Bên bờ có em chờ (and JustaTee) (I''m in love, I''m in love, in love with you)
[03:09.18] Ooh-ooh-ooh (2025) (I''m in love, I''m in love, in love with you)
[03:13.00] I''m in love with you, with you, with you');
INSERT INTO public.tracks VALUES (63, 8, NULL, 5, 'TOP1', 'top1-1793117754617', NULL, NULL, 'PENDING', NULL, NULL, 'soundwave/tracks/audio/user-8-track-2335a90f-155f-439e-b1e4-f8624e39efdd', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1793117751/soundwave/tracks/audio/user-8-track-2335a90f-155f-439e-b1e4-f8624e39efdd.mp3', 'mp3', 187742, 'soundwave/tracks/covers/user-8-cover-406c504b-fb75-4cd4-991a-c6bee79232e4', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1793117755/soundwave/tracks/covers/user-8-cover-406c504b-fb75-4cd4-991a-c6bee79232e4.png', 0, '2026-10-27 09:15:54.625', '2026-10-27 09:16:09.449', '[ti:Top 1 (Trong Mắt Em)]
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
[02:46.00]...');
INSERT INTO public.tracks VALUES (11, 16, NULL, 7, 'Haru (晴る)', 'haru-yorushika', 'Ca khúc chủ đề mở đầu của anime Frieren: Beyond Journey''s End thực hiện bởi nhóm nhạc Yorushika.', 1, 'PUBLISHED', '2026-10-09 10:04:58.459', NULL, 'soundwave/tracks/audio/project-track-haru-yorushika', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565495/soundwave/tracks/audio/project-track-haru-yorushika.mp3', 'mp3', 276715, 'soundwave/tracks/covers/project-cover-haru-yorushika', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565498/soundwave/tracks/covers/project-cover-haru-yorushika.webp', 21752, '2026-10-09 10:04:58.459', '2026-10-09 10:04:58.459', NULL);
INSERT INTO public.tracks VALUES (22, 8, NULL, 5, 'MRT', 'mrt-1791747635924', NULL, NULL, 'REJECTED', NULL, 'Audio file corrupted or encoding does not meet platform standards.', 'soundwave/tracks/audio/user-8-track-42ca5841-799c-4a83-b357-e110c26e1216', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791747633/soundwave/tracks/audio/user-8-track-42ca5841-799c-4a83-b357-e110c26e1216.mp3', 'mp3', 210862, 'soundwave/tracks/covers/user-8-cover-75ad7e3e-37f1-420b-b9f1-00613954e50b', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791747635/soundwave/tracks/covers/user-8-cover-75ad7e3e-37f1-420b-b9f1-00613954e50b.png', 0, '2026-10-11 12:40:35.924', '2026-10-23 05:45:52.741', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...');
INSERT INTO public.tracks VALUES (57, 9, NULL, 4, 'Blue', 'blue-1792752258691', '"Blue" is a song by Canadian singer Yung Kai from his debut studio album Stay with the Ocean, I''ll Find You (2025).', NULL, 'PUBLISHED', '2026-10-23 03:45:59.614', NULL, 'soundwave/tracks/audio/user-9-track-03014564-bfba-48dd-8b4b-6f75836e219c', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1792752256/soundwave/tracks/audio/user-9-track-03014564-bfba-48dd-8b4b-6f75836e219c.mp3', 'mp3', 214357, 'soundwave/tracks/covers/user-9-cover-1a8c84ed-6cf6-4ba6-8615-9506689256e8', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1792752258/soundwave/tracks/covers/user-9-cover-1a8c84ed-6cf6-4ba6-8615-9506689256e8.jpg', 0, '2026-10-23 03:44:18.693', '2026-10-23 03:46:08.526', NULL);
INSERT INTO public.tracks VALUES (12, 17, NULL, 1, 'A Cruel Angel''s Thesis (残酷な天使のテーゼ)', 'a-cruel-angels-thesis', 'Bài hát chủ đề huyền thoại của anime Neon Genesis Evangelion trình bày bởi Yoko Takahashi.', 1, 'PUBLISHED', '2026-10-09 10:05:23.504', NULL, 'soundwave/tracks/audio/project-track-a-cruel-angels-thesis', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791565521/soundwave/tracks/audio/project-track-a-cruel-angels-thesis.mp3', 'mp3', 243905, 'soundwave/tracks/covers/project-cover-a-cruel-angels-thesis', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565523/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', 34520, '2026-10-09 10:05:23.504', '2026-10-09 10:05:23.504', NULL);
INSERT INTO public.tracks VALUES (21, 8, NULL, 5, 'Thế Giới Của Anh', 'the-gioi-cua-anh-1791746960294', 'Funny music', NULL, 'PUBLISHED', '2026-10-23 05:25:58.116', NULL, 'soundwave/tracks/audio/user-8-track-f8dffbae-6ff9-4358-82f9-103d77e889cf', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791746957/soundwave/tracks/audio/user-8-track-f8dffbae-6ff9-4358-82f9-103d77e889cf.mp3', 'mp3', 270620, 'soundwave/tracks/covers/user-8-cover-78b0797c-9da0-4626-a409-b3ee502ccf9b', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791746959/soundwave/tracks/covers/user-8-cover-78b0797c-9da0-4626-a409-b3ee502ccf9b.png', 0, '2026-10-11 12:29:20.299', '2026-10-23 05:26:05.087', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...');
INSERT INTO public.tracks VALUES (23, 8, NULL, 8, 'SAU HÌNH BÓNG ẤY', 'sau-hinh-bong-ay-1791747777052', NULL, NULL, 'REJECTED', NULL, 'Incomplete or placeholder metadata (title, artist or artwork).', 'soundwave/tracks/audio/user-8-track-3b412687-df02-4e86-bab3-51c55b6d97d1', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791747774/soundwave/tracks/audio/user-8-track-3b412687-df02-4e86-bab3-51c55b6d97d1.mp3', 'mp3', 212108, 'soundwave/tracks/covers/user-8-cover-361f1a7c-6c34-4357-b3b4-4557e1ebe7c5', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791747776/soundwave/tracks/covers/user-8-cover-361f1a7c-6c34-4357-b3b4-4557e1ebe7c5.png', 0, '2026-10-11 12:42:57.053', '2026-10-23 05:44:15.242', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...');
INSERT INTO public.tracks VALUES (15, 19, NULL, 2, 'LAVIEM', 'laviem-1791631091415', 'Funny', NULL, 'PUBLISHED', '2026-10-10 04:19:50.896', NULL, 'soundwave/tracks/audio/user-8-track-d21d1a5d-ff3e-4636-9e9a-631192fef731', 'https://res.cloudinary.com/dq0jm9tlt/video/upload/v1791631089/soundwave/tracks/audio/user-8-track-d21d1a5d-ff3e-4636-9e9a-631192fef731.mp3', 'mp3', 187742, 'soundwave/tracks/covers/user-8-cover-dbabcd61-6fbe-45af-b1ea-9e45588da125', 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791631091/soundwave/tracks/covers/user-8-cover-dbabcd61-6fbe-45af-b1ea-9e45588da125.png', 6, '2026-10-10 04:18:11.421', '2026-10-10 04:19:55.926', '[BÀI HÁT: LAVIEM]
Trình bày: Quang Hùng MasterD, CAPTAIN BOY, Pháp Kiều, CoolKid, Danny Chung

---
[INTRO]
(Còn cần thiết nữa, nói chi đến đây cũng thừa
Rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa? Lòng nhau mới thấu đây em)

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[VERSE 1]
Ta chia tay (Ta chia tay), vì sao em ơi? (Vì sao?)
Điều này anh muốn hỏi lâu rồi
Những khung trời kỷ niệm vỡ đôi
Có phải vì một câu anh đã lỡ lời?
(CAPTAIN BOY bay tới đây, yeah)
Sau đêm nay (Sau đêm nay), tự ta cho ta (Tự ta cho ta)
Em và anh một đoạn kết mới
Dù rằng mình còn yêu nhau rất nhiều đấy
Nhưng để ở lại thì anh nghĩ là không

[PRE-CHORUS]
Và sau những cảm xúc nhất thời
Người bên em giờ này chẳng còn là anh
Gửi lại quá khứ, cung đàn đã vỡ
Vì những vấn vương ấy chưa kịp thành lời...

[CHORUS]
Trái tim anh chẳng còn cần thiết nữa
Nói chi đến đây cũng thừa, rượu vang pha với cơn mưa
Hàng trăm lý do cũng chẳng thể cứu vãn
Biết sao hết cho vừa lòng nhau mới thấu đây em?
Dệt hàng triệu vết thương, tự vùi mình trước gương
Nhìn một người đã từng thương sao nay xa lạ đến bất thường?
Cố gắng cũng chỉ bằng không, nước mắt ngược dòng
Chảy ngược tận sâu bên trong, nghẹn đắng nơi lồng ngực

[BRIDGE (Pháp Kiều - Japanese)]
Kono yo ni wa mō imi nante nai
Niji-san, sayonara
Hikari ga areba kake, yami mo aru

[POST-CHORUS / HOOK]
Tất cả là tại vì em, em, em, em, em, e-em
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, e-em
Kẻ ngốc đang say tình dưới ngọn đèn
Tất cả là tại vì em, em, em, em, em, e-em (Baby)
Người xa lạ anh từng quen
Tất cả là tại vì em, em, em, em, em, yeah-eh...

[OUTRO]
Tất cả là tại vì em...');


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_profiles VALUES (10, 'sontungmtp', 'Sơn Tùng M-TP', 'Ca sĩ, nhạc sĩ, nhà sản xuất âm nhạc V-Pop hàng đầu. Founder M-TP Entertainment.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565403/soundwave/tracks/covers/project-cover-noi-nay-co-anh.webp', NULL, 'VN', '2026-11-08 13:10:30.38', '2026-11-08 13:16:56.341');
INSERT INTO public.user_profiles VALUES (11, 'hieuthuhai', 'HIEUTHUHAI', 'Rapper thành viên nhóm nhạc GERDNANG. Chủ nhân album thành công ''Ai Cũng Phải Bắt Đầu Từ Đâu Đó''.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565335/soundwave/tracks/covers/project-cover-exit-sign-hieuthuhai.webp', NULL, 'VN', '2026-11-08 13:10:30.54', '2026-11-08 13:16:56.464');
INSERT INTO public.user_profiles VALUES (12, 'mck99', 'MCK', 'Rapper, ca sĩ, nhạc sĩ thuộc tổ đội RPT. Chủ nhân album đình đám ''99%''.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565314/soundwave/tracks/covers/project-cover-baby-mck.webp', NULL, 'VN', '2026-11-08 13:10:30.638', '2026-11-08 13:16:56.54');
INSERT INTO public.user_profiles VALUES (13, 'uyenlinh', 'Uyên Linh', 'Nữ ca sĩ sở hữu giọng hát nội lực, truyền cảm với các bản hit Ballad da diết.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565356/soundwave/tracks/covers/project-cover-giua-dai-lo-dong-tay.webp', NULL, 'VN', '2026-11-08 13:10:30.756', '2026-11-08 13:16:56.622');
INSERT INTO public.user_profiles VALUES (14, 'hngle', 'Hngle', 'Nghệ sĩ Indie R&B trẻ với màu sắc âm nhạc hiện đại, cảm xúc và bay bổng.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565384/soundwave/tracks/covers/project-cover-tim-em-hngle-bao-anh.webp', NULL, 'VN', '2026-11-08 13:10:30.868', '2026-11-08 13:16:56.707');
INSERT INTO public.user_profiles VALUES (15, 'yoasobi', 'YOASOBI', 'Japanese music superduo composed of producer Ayase and vocalist ikura, turning novels into music.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565560/soundwave/tracks/covers/project-cover-yoru-ni-kakeru.webp', NULL, 'VN', '2026-11-08 13:10:30.977', '2026-11-08 13:16:56.791');
INSERT INTO public.user_profiles VALUES (16, 'yorushika', 'Yorushika', 'Japanese rock duo consisting of producer n-buna and vocalist suis. Creators of nostalgic melodic themes.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565498/soundwave/tracks/covers/project-cover-haru-yorushika.webp', NULL, 'VN', '2026-11-08 13:10:31.106', '2026-11-08 13:16:56.878');
INSERT INTO public.user_profiles VALUES (17, 'yokotakahashi', 'Yoko Takahashi', 'Legendary Japanese singer acclaimed for performing the theme songs of Neon Genesis Evangelion.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565523/soundwave/tracks/covers/project-cover-a-cruel-angels-thesis.webp', NULL, 'VN', '2026-11-08 13:10:31.245', '2026-11-08 13:16:56.955');
INSERT INTO public.user_profiles VALUES (18, 'yamazaki', 'Masayoshi Yamazaki', 'Veteran Japanese singer-songwriter celebrated for the iconic theme ''One more time, One more chance''.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565463/soundwave/tracks/covers/project-cover-one-more-time-one-more-chance.webp', NULL, 'VN', '2026-11-08 13:10:31.412', '2026-11-08 13:16:57.077');
INSERT INTO public.user_profiles VALUES (19, 'lowg', 'Low G', 'Rapper thuộc Rapital, được mệnh danh là ''chủ tọa'' với phong cách flow mượt mà đặc trưng.', NULL, 'https://res.cloudinary.com/dq0jm9tlt/image/upload/v1791565431/soundwave/tracks/covers/project-cover-laviem.webp', NULL, 'VN', '2026-11-08 13:10:31.567', '2026-11-08 13:16:57.19');
INSERT INTO public.user_profiles VALUES (20, 'minhan', 'Minh An', 'Acoustic and Indie pop artist crafting gentle, soulful melodies for quiet contemplation.', NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', NULL, 'VN', '2026-11-08 13:10:31.682', '2026-11-08 13:16:57.301');
INSERT INTO public.user_profiles VALUES (3, 'lehaiduy', 'Lê Hải Duy', 'Creator & Music Producer on MagiSound.', NULL, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', NULL, 'VN', '2026-11-08 13:10:31.772', '2026-11-08 13:16:57.391');
INSERT INTO public.user_profiles VALUES (7, 'thienphuc', 'Thiên Phúc', 'Creator & Music Artist on MagiSound.', NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', NULL, 'VN', '2026-11-08 13:10:31.928', '2026-11-08 13:16:57.474');
INSERT INTO public.user_profiles VALUES (8, 'minhtri', 'Minh Trí', 'Producer & Sound Designer on MagiSound.', NULL, 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80', NULL, 'VN', '2026-11-08 13:10:32.024', '2026-11-08 13:16:57.641');
INSERT INTO public.user_profiles VALUES (9, 'anhtuan', 'Anh Tuấn', 'Indie Beatmaker & Audio Engineer.', NULL, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', NULL, 'VN', '2026-11-08 13:10:32.159', '2026-11-08 13:16:57.811');
INSERT INTO public.user_profiles VALUES (4, 'tuanta', 'Trương Anh Tuấn', NULL, NULL, NULL, NULL, NULL, '2026-11-05 07:58:13.865', '2026-11-05 07:58:13.865');
INSERT INTO public.user_profiles VALUES (5, 'listenertest', 'Test Listener', NULL, NULL, NULL, NULL, NULL, '2026-11-05 07:58:14.179', '2026-11-05 07:58:14.179');
INSERT INTO public.user_profiles VALUES (6, 'haotnt', 'Trần Nguyễn Thái Hào', 'Thành viên nhóm phát triển SoundWave', NULL, NULL, NULL, 'VN', '2026-11-12 16:04:07.257', '2026-11-12 16:04:07.257');
INSERT INTO public.user_profiles VALUES (21, 'lananh', 'Lan Anh', 'Người yêu âm nhạc V-Pop', NULL, NULL, NULL, 'VN', '2026-11-12 16:04:07.257', '2026-11-12 16:04:07.257');
INSERT INTO public.user_profiles VALUES (22, 'quanghuy', 'Quang Huy', 'Đam mê dòng nhạc Rap & Hip-hop', NULL, NULL, NULL, 'VN', '2026-11-12 16:04:07.257', '2026-11-12 16:04:07.257');
INSERT INTO public.user_profiles VALUES (23, 'yuki', 'Yuki Mori', 'Fan Anime OST & J-Pop', NULL, NULL, NULL, 'JP', '2026-11-12 16:04:07.257', '2026-11-12 16:04:07.257');
INSERT INTO public.user_profiles VALUES (24, 'minhduc', 'Minh Đức', 'Giai điệu Acoustic thư giãn', NULL, NULL, NULL, 'VN', '2026-11-12 16:04:07.257', '2026-11-12 16:04:07.257');
INSERT INTO public.user_profiles VALUES (25, 'baotram', 'Bảo Trâm', 'Cập nhật bảng xếp hạng Hot Trends', NULL, NULL, NULL, 'VN', '2026-11-12 16:04:07.257', '2026-11-12 16:04:07.257');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (24, 'minhduc.chill@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (25, 'baotram.music@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (5, 'listener.test@gmail.com', '$2a$10$smPHQrUMX2QksGRg5ypptumAHqwHuneDBoOvY3bC7ZpySe/vI8SXy', 'ACTIVE', NULL, NULL, NULL, '2026-10-09 06:22:11.396', '2026-10-09 06:22:11.396', NULL);
INSERT INTO public.users VALUES (15, 'yoasobi@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', '2026-10-13 08:11:06.281', NULL, '2026-10-13 15:04:04.013', '2026-10-13 08:11:06.281', NULL);
INSERT INTO public.users VALUES (4, 'tuantace201233@gmail.com', '$2a$10$Eew3S4KHhCUotbqC9SgP3OM1rVhQl9VYzAz1Qcf57a2laNm6Uqn3i', 'ACTIVE', '2026-10-09 06:16:20.48', '2026-10-13 05:37:25.81', NULL, '2026-10-09 06:15:51.293', '2026-10-13 05:37:25.81', NULL);
INSERT INTO public.users VALUES (7, 'dotranthienphuc230@gmail.com', '$2a$10$lIb0PDasweSn2jTgy3Afheal1uCZ2SBI4nFzieQsQ8WaZbBq7ZIY6', 'ACTIVE', '2026-10-09 07:13:33.114', '2026-10-27 18:05:27.375', NULL, '2026-10-09 07:13:12.81', '2026-10-27 18:05:27.446', NULL);
INSERT INTO public.users VALUES (10, 'sontungmtp@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', '2026-10-31 02:03:31.404', NULL, '2026-10-13 15:04:04.013', '2026-10-31 02:03:31.693', NULL);
INSERT INTO public.users VALUES (8, 'minhtriojt@gmail.com', '$2a$10$ihGJULMcEGY0iY.Dc/DnO.wCGE.pv5hAeEt2emPrg7BaFSyMSB3pe', 'ACTIVE', '2026-10-09 22:59:05.159', '2026-10-31 02:13:08.971', NULL, '2026-10-09 22:58:12.741', '2026-10-31 02:13:09.081', NULL);
INSERT INTO public.users VALUES (6, 'haotntce200338@gmail.com', '$2a$10$BuvfPsHK7K08MIEDltSnlOaxV9.yxDp9UrJJfk7bMQbrkUAlN6Tkm', 'ACTIVE', '2026-10-09 06:23:12.264', '2026-10-23 04:48:40.826', NULL, '2026-10-09 06:22:54.239', '2026-10-23 04:48:41.06', NULL);
INSERT INTO public.users VALUES (3, 'lehaiduy1900@gmail.com', '$2a$10$0gOv7O05thBZLs/mYHaYB.Tr2DyOKhELyww3kfYBMrQ7G2GnNusSu', 'ACTIVE', '2026-10-09 05:53:40.056', '2026-10-13 11:19:10.244', NULL, '2026-10-09 05:53:10.389', '2026-10-13 11:19:10.244', NULL);
INSERT INTO public.users VALUES (11, 'hieuthuhai@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (12, 'mck@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (13, 'uyenlinh@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (14, 'hngle@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (16, 'yorushika@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (17, 'yokotakahashi@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (18, 'yamazaki@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (19, 'lowg@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (20, 'minhan.creator@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (21, 'lananh.listener@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (22, 'quanghuy.rap@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (23, 'yuki.anime@soundwave.io', '$2a$10$SKikCyl4aWTIoFeG3ZKpHuiSFnvGCLbsxqEhCXXqTzwzc0daPLdM.', 'ACTIVE', '2026-10-13 15:04:04.013', NULL, NULL, '2026-10-13 15:04:04.013', '2026-10-13 15:04:04.013', NULL);
INSERT INTO public.users VALUES (9, 'truonganhtuan04072020@gmail.com', '$2a$10$aNvzQW3jPTFjF./v3GEfu.Eq/ci9c/M7mU2rDOiLPf7rXU3AAF3Jq', 'ACTIVE', '2026-10-13 05:40:41.778', '2026-10-31 02:28:49.32', NULL, '2026-10-13 05:40:15.607', '2026-10-31 02:28:49.858', NULL);


--
-- Name: account_unlock_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.account_unlock_tokens_id_seq', 1, false);


--
-- Name: albums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.albums_id_seq', 16, true);


--
-- Name: app_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_users_id_seq', 25, true);


--
-- Name: content_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_reports_id_seq', 1, true);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 6, true);


--
-- Name: genres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.genres_id_seq', 9, true);


--
-- Name: listening_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.listening_history_id_seq', 186, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 110, true);


--
-- Name: official_lyrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.official_lyrics_id_seq', 18, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, true);


--
-- Name: personal_lyrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_lyrics_id_seq', 18, true);


--
-- Name: playlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.playlists_id_seq', 18, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 1479, true);


--
-- Name: staff_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staff_roles_id_seq', 2, true);


--
-- Name: staffs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.staffs_id_seq', 2, true);


--
-- Name: track_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.track_submissions_id_seq', 70, true);


--
-- Name: tracks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tracks_id_seq', 69, true);


--
-- Name: account_unlock_tokens account_unlock_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_unlock_tokens
    ADD CONSTRAINT account_unlock_tokens_pkey PRIMARY KEY (unlock_token_id);


--
-- Name: albums pk_albums; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT pk_albums PRIMARY KEY (album_id);


--
-- Name: users pk_app_users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_app_users PRIMARY KEY (user_id);


--
-- Name: content_reports pk_content_reports; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT pk_content_reports PRIMARY KEY (report_id);


--
-- Name: email_verification_tokens pk_email_verification_tokens; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT pk_email_verification_tokens PRIMARY KEY (verification_token_id);


--
-- Name: favorites pk_favorites; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT pk_favorites PRIMARY KEY (user_id, track_id);


--
-- Name: genres pk_genres; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT pk_genres PRIMARY KEY (genre_id);


--
-- Name: listening_history pk_listening_history; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history
    ADD CONSTRAINT pk_listening_history PRIMARY KEY (history_id);


--
-- Name: notifications pk_notifications; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT pk_notifications PRIMARY KEY (notification_id);


--
-- Name: official_lyrics pk_official_lyrics; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_lyrics
    ADD CONSTRAINT pk_official_lyrics PRIMARY KEY (official_lyric_id);


--
-- Name: password_reset_tokens pk_password_reset_tokens; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT pk_password_reset_tokens PRIMARY KEY (reset_token_id);


--
-- Name: personal_lyrics pk_personal_lyrics; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lyrics
    ADD CONSTRAINT pk_personal_lyrics PRIMARY KEY (personal_lyric_id);


--
-- Name: playlist_tracks pk_playlist_tracks; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT pk_playlist_tracks PRIMARY KEY (playlist_id, track_id);


--
-- Name: playlists pk_playlists; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT pk_playlists PRIMARY KEY (playlist_id);


--
-- Name: refresh_tokens pk_refresh_tokens; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT pk_refresh_tokens PRIMARY KEY (refresh_token_id);


--
-- Name: track_submissions pk_track_submissions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_submissions
    ADD CONSTRAINT pk_track_submissions PRIMARY KEY (submission_id);


--
-- Name: tracks pk_tracks; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT pk_tracks PRIMARY KEY (track_id);


--
-- Name: user_profiles pk_user_profiles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT pk_user_profiles PRIMARY KEY (user_id);


--
-- Name: staff_roles staff_roles_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_code_key UNIQUE (code);


--
-- Name: staff_roles staff_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_pkey PRIMARY KEY (role_id);


--
-- Name: staffs staffs_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_email_key UNIQUE (email);


--
-- Name: staffs staffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_pkey PRIMARY KEY (staff_id);


--
-- Name: playlists ukbq229u3bbkas0bmcvn265p3b2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT ukbq229u3bbkas0bmcvn265p3b2 UNIQUE (slug);


--
-- Name: albums uq_albums_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT uq_albums_slug UNIQUE (slug);


--
-- Name: users uq_app_users_email; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_app_users_email UNIQUE (email);


--
-- Name: email_verification_tokens uq_email_verification_tokens_hash; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT uq_email_verification_tokens_hash UNIQUE (token_hash);


--
-- Name: genres uq_genres_name; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT uq_genres_name UNIQUE (name);


--
-- Name: genres uq_genres_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT uq_genres_slug UNIQUE (slug);


--
-- Name: official_lyrics uq_official_lyrics_track; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_lyrics
    ADD CONSTRAINT uq_official_lyrics_track UNIQUE (track_id);


--
-- Name: password_reset_tokens uq_password_reset_tokens_hash; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT uq_password_reset_tokens_hash UNIQUE (token_hash);


--
-- Name: personal_lyrics uq_personal_lyrics_user_track_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lyrics
    ADD CONSTRAINT uq_personal_lyrics_user_track_type UNIQUE (user_id, track_id, lyric_type);


--
-- Name: playlist_tracks uq_playlist_tracks_position; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT uq_playlist_tracks_position UNIQUE (playlist_id, "position");


--
-- Name: refresh_tokens uq_refresh_tokens_hash; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash);


--
-- Name: tracks uq_tracks_slug; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT uq_tracks_slug UNIQUE (slug);


--
-- Name: user_profiles uq_user_profiles_username; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT uq_user_profiles_username UNIQUE (username);


--
-- Name: idx_notifications_staff_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_staff_created ON public.notifications USING btree (staff_id, created_at DESC);


--
-- Name: idx_notifications_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_created ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: ix_albums_created_by_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_albums_created_by_user_id ON public.albums USING btree (created_by_user_id, status);


--
-- Name: ix_app_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_app_users_status ON public.users USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: ix_content_reports_moderation_queue; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_content_reports_moderation_queue ON public.content_reports USING btree (status, created_at) INCLUDE (track_id, submitted_by_user_id, category);


--
-- Name: ix_content_reports_submitter; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_content_reports_submitter ON public.content_reports USING btree (submitted_by_user_id, created_at DESC);


--
-- Name: ix_email_verification_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_email_verification_tokens_user_id ON public.email_verification_tokens USING btree (user_id, expires_at);


--
-- Name: ix_favorites_track_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_favorites_track_id ON public.favorites USING btree (track_id);


--
-- Name: ix_listening_history_user_played_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_listening_history_user_played_at ON public.listening_history USING btree (user_id, played_at DESC) INCLUDE (track_id, listened_duration_ms, completed);


--
-- Name: ix_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_notifications_user_unread ON public.notifications USING btree (user_id, read_at, created_at DESC);


--
-- Name: ix_password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id, expires_at);


--
-- Name: ix_personal_lyrics_user_track; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_personal_lyrics_user_track ON public.personal_lyrics USING btree (user_id, track_id);


--
-- Name: ix_playlist_tracks_track_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_playlist_tracks_track_id ON public.playlist_tracks USING btree (track_id);


--
-- Name: ix_playlists_owner_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_playlists_owner_user_id ON public.playlists USING btree (owner_user_id, updated_at DESC);


--
-- Name: ix_playlists_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_playlists_public ON public.playlists USING btree (visibility, updated_at DESC) WHERE ((visibility)::text = 'PUBLIC'::text);


--
-- Name: ix_refresh_tokens_active_by_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_refresh_tokens_active_by_user ON public.refresh_tokens USING btree (user_id, expires_at) WHERE (revoked_at IS NULL);


--
-- Name: ix_track_submissions_moderation_queue; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_track_submissions_moderation_queue ON public.track_submissions USING btree (status, submitted_at) INCLUDE (track_id, submitted_by_user_id, reviewer_user_id);


--
-- Name: ix_tracks_album_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tracks_album_id ON public.tracks USING btree (album_id, track_number);


--
-- Name: ix_tracks_public_catalog; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tracks_public_catalog ON public.tracks USING btree (publication_status, genre_id, created_at DESC) INCLUDE (title, slug, uploader_user_id, album_id, cover_url, duration_ms, play_count_cache);


--
-- Name: ix_tracks_uploader_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_tracks_uploader_user_id ON public.tracks USING btree (uploader_user_id, publication_status, created_at DESC);


--
-- Name: ux_track_submissions_one_pending_per_track; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ux_track_submissions_one_pending_per_track ON public.track_submissions USING btree (track_id) WHERE ((status)::text = 'PENDING'::text);


--
-- Name: account_unlock_tokens account_unlock_tokens_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_unlock_tokens
    ADD CONSTRAINT account_unlock_tokens_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staffs(staff_id);


--
-- Name: albums fk_albums_created_by_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT fk_albums_created_by_app_users FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: content_reports fk_content_reports_handler_staffs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT fk_content_reports_handler_staffs FOREIGN KEY (handled_by_user_id) REFERENCES public.staffs(staff_id);


--
-- Name: content_reports fk_content_reports_submitter_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT fk_content_reports_submitter_app_users FOREIGN KEY (submitted_by_user_id) REFERENCES public.users(user_id);


--
-- Name: content_reports fk_content_reports_tracks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_reports
    ADD CONSTRAINT fk_content_reports_tracks FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: email_verification_tokens fk_email_verification_tokens_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT fk_email_verification_tokens_app_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: favorites fk_favorites_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fk_favorites_app_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: favorites fk_favorites_tracks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT fk_favorites_tracks FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: genres fk_genres_created_by_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT fk_genres_created_by_app_users FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: listening_history fk_listening_history_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history
    ADD CONSTRAINT fk_listening_history_app_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: listening_history fk_listening_history_tracks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listening_history
    ADD CONSTRAINT fk_listening_history_tracks FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: notifications fk_notifications_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_app_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: official_lyrics fk_official_lyrics_tracks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_lyrics
    ADD CONSTRAINT fk_official_lyrics_tracks FOREIGN KEY (track_id) REFERENCES public.tracks(track_id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens fk_password_reset_tokens_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT fk_password_reset_tokens_app_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: personal_lyrics fk_personal_lyrics_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lyrics
    ADD CONSTRAINT fk_personal_lyrics_app_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: personal_lyrics fk_personal_lyrics_tracks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_lyrics
    ADD CONSTRAINT fk_personal_lyrics_tracks FOREIGN KEY (track_id) REFERENCES public.tracks(track_id) ON DELETE CASCADE;


--
-- Name: playlist_tracks fk_playlist_tracks_added_by_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT fk_playlist_tracks_added_by_app_users FOREIGN KEY (added_by_user_id) REFERENCES public.users(user_id);


--
-- Name: playlist_tracks fk_playlist_tracks_playlists; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT fk_playlist_tracks_playlists FOREIGN KEY (playlist_id) REFERENCES public.playlists(playlist_id) ON DELETE CASCADE;


--
-- Name: playlist_tracks fk_playlist_tracks_tracks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlist_tracks
    ADD CONSTRAINT fk_playlist_tracks_tracks FOREIGN KEY (track_id) REFERENCES public.tracks(track_id) ON DELETE CASCADE;


--
-- Name: playlists fk_playlists_owner_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT fk_playlists_owner_app_users FOREIGN KEY (owner_user_id) REFERENCES public.users(user_id);


--
-- Name: refresh_tokens fk_refresh_tokens_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk_refresh_tokens_app_users FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: track_submissions fk_track_submissions_reviewer_staffs; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_submissions
    ADD CONSTRAINT fk_track_submissions_reviewer_staffs FOREIGN KEY (reviewer_user_id) REFERENCES public.staffs(staff_id);


--
-- Name: track_submissions fk_track_submissions_submitter_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_submissions
    ADD CONSTRAINT fk_track_submissions_submitter_app_users FOREIGN KEY (submitted_by_user_id) REFERENCES public.users(user_id);


--
-- Name: track_submissions fk_track_submissions_tracks; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.track_submissions
    ADD CONSTRAINT fk_track_submissions_tracks FOREIGN KEY (track_id) REFERENCES public.tracks(track_id);


--
-- Name: tracks fk_tracks_albums; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT fk_tracks_albums FOREIGN KEY (album_id) REFERENCES public.albums(album_id) ON DELETE SET NULL;


--
-- Name: tracks fk_tracks_genres; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT fk_tracks_genres FOREIGN KEY (genre_id) REFERENCES public.genres(genre_id);


--
-- Name: tracks fk_tracks_uploader_app_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT fk_tracks_uploader_app_users FOREIGN KEY (uploader_user_id) REFERENCES public.users(user_id);


--
-- Name: user_profiles fk_user_profiles_users; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_user_profiles_users FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: account_unlock_tokens fka3fpk5xbjuof254bc5skirifc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account_unlock_tokens
    ADD CONSTRAINT fka3fpk5xbjuof254bc5skirifc FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: official_lyrics fkaapwxgur5skqdrnov9ldxgq9o; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.official_lyrics
    ADD CONSTRAINT fkaapwxgur5skqdrnov9ldxgq9o FOREIGN KEY (created_by_user_id) REFERENCES public.staffs(staff_id);


--
-- Name: notifications notifications_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staffs(staff_id);


--
-- Name: password_reset_tokens password_reset_tokens_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staffs(staff_id);


--
-- Name: refresh_tokens refresh_tokens_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staffs(staff_id);


--
-- Name: staffs staffs_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staffs
    ADD CONSTRAINT staffs_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.staff_roles(role_id);


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

\unrestrict cJOgpX5qaqCh9L5DjwpETnMyPgOmlSc3OsE7X0n6jGq97sxoBgBowAwZNyuotIe

