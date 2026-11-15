import { useState, useEffect, type ReactNode } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { catalogApi } from "../../api/catalog";
import type { LandingTrack } from "../../types";
import type { AuthSession } from "../../api/auth";
import {
  AlertIcon,
  ChevronLeftIcon,
  HeadphonesIcon,
  LockIcon,
  PauseIcon,
  PlayIcon,
} from "../../icons";

export type AuthProps = {
  onLoginSuccess: (session: AuthSession, rememberMe: boolean) => void;
  onNavigate: (route: string) => void;
};

export type AuthMode = "login" | "register" | "recovery" | "verification";
export type FieldErrors = Record<string, string>;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function focusFirstInvalid(errors: FieldErrors) {
  const firstInvalidId = Object.keys(errors).find((key) => errors[key]);
  if (firstInvalidId) {
    window.requestAnimationFrame(() => document.getElementById(firstInvalidId)?.focus());
  }
}

export function AuthErrorNotice({
  message,
  title = "Incomplete information",
  action,
}: {
  message: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div className="auth-v2-error" role="alert" aria-live="polite">
      <span><AlertIcon width={17} height={17} /></span>
      <div><b>{title}</b><small>{message}</small>{action}</div>
    </div>
  );
}

export function AuthExperience({
  children,
  mode,
  eyebrow,
  title,
  description,
  onNavigate,
}: {
  children: ReactNode;
  mode: AuthMode;
  eyebrow: string;
  title: string;
  description: string;
  onNavigate: (route: string) => void;
}) {
  const { currentTrack, playing, playTrack, togglePlay } = usePlayer();
  const [curatedTracks, setCuratedTracks] = useState<LandingTrack[]>([]);

  useEffect(() => {
    let isMounted = true;
    catalogApi
      .getCuratedRecommendations(10)
      .then((res) => {
        if (isMounted && res && res.length > 0) {
          setCuratedTracks(res);
        }
      })
      .catch((err) => {
        console.warn("Could not sync explore track for auth experience:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronized with explore: use current playing track if available, else explore hero track
  const activeTrack = (playing && currentTrack) ? currentTrack : (currentTrack || curatedTracks[0] || null);
  const isPlayingActive = Boolean(activeTrack && currentTrack?.id === activeTrack.id && playing);

  const handleTogglePlayback = () => {
    if (!activeTrack) return;
    if (currentTrack?.id === activeTrack.id) {
      togglePlay();
    } else {
      playTrack(
        activeTrack,
        curatedTracks.length > 0 ? curatedTracks : [activeTrack],
        "Explore Recommended"
      );
    }
  };

  const trackTitle = activeTrack?.title || "Explore SoundWave";
  const artistName = (activeTrack as { artist?: string })?.artist || activeTrack?.creator?.displayName || "Independent Creator";
  const genreName = activeTrack?.genreName || (activeTrack as { genre?: string })?.genre || activeTrack?.album?.title || "Indie";

  return (
    <main className="auth-v2-experience">
      <section className="auth-v2-story" aria-label="About SoundWave">
        <div className="auth-v2-orbit auth-v2-orbit--one" />
        <div className="auth-v2-orbit auth-v2-orbit--two" />
        <button className="auth-v2-brand" onClick={() => onNavigate("/")} aria-label="Return to SoundWave Explore">
          <img src="/soundwave-logo.png" alt="" />
          <span>SoundWave</span>
        </button>
        <div className="auth-v2-story-content">
          <span className="auth-v2-story-tag"><HeadphonesIcon width={15} height={15} /> MUSIC CONNECTS THE COMMUNITY</span>
          <h2>Every moment<br />has its own <span>soundtrack.</span></h2>

          {/* Synchronized Spotlight Card */}
          <div
            className="auth-v2-now-playing"
            onClick={handleTogglePlayback}
            role="region"
            aria-label="SoundWave spotlight track preview"
            style={{ cursor: "pointer" }}
            title={isPlayingActive ? `Pause ${trackTitle}` : `Play ${trackTitle}`}
          >
            <span
              className={`auth-v2-cover ${!isPlayingActive ? "is-paused" : ""}`}
              style={
                activeTrack?.coverUrl
                  ? {
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.45)), url(${activeTrack.coverUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <i /><i /><i /><i />
            </span>
            <span>
              <small>NOW PLAYING ON SOUNDWAVE</small>
              <strong>{trackTitle}</strong>
              <em>{artistName} · {genreName}</em>
            </span>
            <button
              type="button"
              className="auth-v2-play-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePlayback();
              }}
              aria-label={isPlayingActive ? `Pause ${trackTitle}` : `Play ${trackTitle}`}
            >
              {isPlayingActive ? (
                <PauseIcon width={17} height={17} />
              ) : (
                <PlayIcon width={17} height={17} />
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="auth-v2-workspace">
        <button className="auth-v2-back-home" onClick={() => onNavigate("/")}>
          <ChevronLeftIcon width={16} height={16} />
          Back to Explore
        </button>
        <div className="auth-v2-card">
          {mode === "login" || mode === "register" ? (
            <nav className="auth-v2-tabs" aria-label="Switch between Login and Register">
              <button className={mode === "login" ? "is-active" : ""} onClick={() => onNavigate("/login")} aria-current={mode === "login" ? "page" : undefined}>Login</button>
              <button className={mode === "register" ? "is-active" : ""} onClick={() => onNavigate("/register")} aria-current={mode === "register" ? "page" : undefined}>Register</button>
            </nav>
          ) : null}

          <div className="auth-v2-heading">
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  icon,
  minLength,
  action,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email";
  autoComplete?: string;
  icon: ReactNode;
  minLength?: number;
  action?: ReactNode;
  error?: string;
}) {
  return (
    <div className={`auth-v2-field ${error ? "has-error" : ""}`}>
      {action ? (
        <div className="auth-v2-label-row">
          <label htmlFor={id}>{label}</label>
          {action}
        </div>
      ) : (
        <label htmlFor={id}>{label}</label>
      )}
      <div className={`auth-v2-input ${error ? "is-invalid" : ""}`}>
        <span>{icon}</span>
        <input id={id} type={type} required minLength={minLength} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      </div>
      {error ? <small className="auth-v2-field-error" id={`${id}-error`}><AlertIcon width={12} height={12} />{error}</small> : null}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  action,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  action?: ReactNode;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`auth-v2-field ${error ? "has-error" : ""}`}>
      <div className="auth-v2-label-row"><label htmlFor={id}>{label}</label>{action}</div>
      <div className={`auth-v2-input auth-v2-input--password ${error ? "is-invalid" : ""}`}>
        <span><LockIcon width={17} height={17} /></span>
        <input id={id} type={visible ? "text" : "password"} required minLength={8} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Enter at least 8 characters" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide Password" : "Show Password"}>{visible ? "Hide" : "Show"}</button>
      </div>
      {error ? <small className="auth-v2-field-error" id={`${id}-error`}><AlertIcon width={12} height={12} />{error}</small> : null}
    </div>
  );
}
