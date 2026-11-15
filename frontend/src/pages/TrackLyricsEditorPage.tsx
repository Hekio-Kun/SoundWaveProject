import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { catalogApi } from "../api/catalog";
import { lyricsApi } from "../api/lyrics";
import { studioApi, type PendingLyricSubmission } from "../api/track";
import { LyricSyncTab } from "../components/common/LyricSyncTab";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { formatDateTime } from "../utils/dateUtils";
import {
  AlertIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ClockIcon,
  FileTextIcon,
  SparklesIcon,
  TrashIcon,
} from "../icons";
import type { LandingTrack, TrackLyricsBundle } from "../types";

type Props = {
  trackId: number;
  initialMode?: "official" | "personal";
  onNavigate: (route: string) => void;
};

export function TrackLyricsEditorPage({ trackId, initialMode = "official", onNavigate }: Props) {
  const { user } = useAuth();
  const [track, setTrack] = useState<LandingTrack | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(true);
  const [trackError, setTrackError] = useState<string | null>(null);

  const [lyricsBundle, setLyricsBundle] = useState<TrackLyricsBundle | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<PendingLyricSubmission | null>(null);

  const [mode, setMode] = useState<"official" | "personal">(initialMode);
  const [personalType, setPersonalType] = useState<"CUSTOM" | "TRANSLATION">("CUSTOM");
  const [submitterNote, setSubmitterNote] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [toastNotice, setToastNotice] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const isAuthor = Boolean(
    user && track && (user.id === track.creator?.userId || (user as any).userId === track.creator?.userId)
  );
  const hasOfficialLyrics = Boolean(lyricsBundle?.officialLyric?.lyricContent?.trim() || track?.lyrics?.trim());

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!loadingTrack && track && !isAuthor && mode === "official") {
      setMode("personal");
    }
  }, [loadingTrack, track, isAuthor, mode]);

  const loadTrackData = useCallback(async () => {
    setLoadingTrack(true);
    setTrackError(null);
    try {
      const [tData, bData] = await Promise.all([
        catalogApi.getTrackById(trackId),
        lyricsApi.getTrackLyrics(trackId).catch(() => null),
      ]);
      setTrack(tData);
      setLyricsBundle(bData);

      const authorMatch =
        user && tData && (user.id === tData.creator?.userId || (user as any).userId === tData.creator?.userId);
      if (authorMatch && tData.publicationStatus === "APPROVED") {
        try {
          const pending = await studioApi.getPendingLyricsSubmission(trackId);
          if (pending) {
            setPendingSubmission(pending);
            if (pending.submitterNote) {
              setSubmitterNote(pending.submitterNote);
            }
          }
        } catch {
          // No pending submission
        }
      }
    } catch (err: unknown) {
      setTrackError(err instanceof Error ? err.message : "Failed to load track information.");
    } finally {
      setLoadingTrack(false);
    }
  }, [trackId, user]);

  useEffect(() => {
    void loadTrackData();
  }, [loadTrackData]);

  const handleWithdrawSubmission = async () => {
    if (!track) return;
    setIsWithdrawing(true);
    try {
      await studioApi.withdrawLyricsSubmission(track.id);
      setPendingSubmission(null);
      setToastNotice("Lyric submission withdrawn. You can edit and submit again.");
      setToastType("success");
    } catch (err: unknown) {
      setToastNotice(err instanceof Error ? err.message : "Failed to withdraw submission.");
      setToastType("error");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleApplyLyrics = async (lrcContent: string) => {
    if (!track) return;

    try {
      if (mode === "official") {
        if (hasOfficialLyrics) {
          setToastNotice("This track already has official lyrics. Official lyrics cannot be modified once published.");
          setToastType("info");
          return;
        }
        await studioApi.submitLyricsForReview(track.id, lrcContent.trim(), submitterNote.trim() || "Submitted via Lyric Editor");
        setToastNotice("Official lyrics submitted for Staff moderation! Once approved, they will go live on the track.");
        setToastType("success");
        setTimeout(() => {
          onNavigate(`/track/${track.id}`);
        }, 1400);
      } else {
        await lyricsApi.savePersonalLyric(track.id, lrcContent.trim(), personalType);
        setToastNotice(`${personalType === "TRANSLATION" ? "Translation" : "Personal lyrics"} saved to your library!`);
        setToastType("success");
        setTimeout(() => {
          onNavigate(`/track/${track.id}?tab=personal`);
        }, 1200);
      }
    } catch (err: unknown) {
      setToastNotice(err instanceof Error ? err.message : "Failed to save lyrics. Please try again.");
      setToastType("error");
    }
  };

  if (loadingTrack) {
    return (
      <div className="lyric-studio-page">
        <div className="lyric-studio-container" style={{ textAlign: "center", paddingTop: "80px" }}>
          <div className="track-details-spinner" style={{ margin: "0 auto 16px" }} />
          <h3>Opening Lyric Studio...</h3>
          <p style={{ color: "#64748B" }}>Loading track audio and existing lyrics data.</p>
        </div>
      </div>
    );
  }

  if (trackError || !track) {
    return (
      <div className="lyric-studio-page">
        <div className="lyric-studio-container" style={{ textAlign: "center", paddingTop: "80px" }}>
          <AlertIcon width={48} height={48} style={{ color: "#EF4444", margin: "0 auto 16px" }} />
          <h2>Unable to Load Track</h2>
          <p style={{ color: "#64748B", maxWidth: "480px", margin: "0 auto 24px" }}>
            {trackError || "The requested track could not be found."}
          </p>
          <button type="button" className="button button-primary" onClick={() => onNavigate(`/track/${trackId}`)}>
            <ChevronLeftIcon width={16} height={16} />
            <span>Return to Track Details</span>
          </button>
        </div>
      </div>
    );
  }

  const initialLyrics =
    mode === "official"
      ? (pendingSubmission?.proposedLyrics || lyricsBundle?.officialLyric?.lyricContent || track.lyrics || "")
      : (lyricsBundle?.userPersonalLyric?.lyricContent || lyricsBundle?.officialLyric?.lyricContent || track.lyrics || "");

  return (
    <div className="lyric-studio-page">
      <div className="lyric-studio-container">
        {/* Header Navigation & Scope Ribbon */}
        <header className="lyric-studio-header">
          <div className="lyric-studio-header-left">
            <button
              type="button"
              className="lyric-studio-back-btn"
              onClick={() => onNavigate(`/track/${track.id}`)}
              title="Return to Track Details"
            >
              <ChevronLeftIcon width={15} height={15} />
              <span>Back to Track</span>
            </button>

            <div className="lyric-studio-track-card">
              <img
                src={track.coverUrl || "/default-cover.jpg"}
                alt={track.title}
                className="lyric-studio-cover"
              />
              <div className="lyric-studio-meta">
                <h1 className="lyric-studio-title">{track.title}</h1>
                <span className="lyric-studio-subtitle">
                  {track.creator?.displayName || "Independent Creator"} · {track.genreName || "Music"}
                </span>
              </div>
            </div>
          </div>

          {/* Scope Mode Switcher */}
          <div className="lyric-studio-scope-switch" role="tablist">
            {isAuthor && (
              <button
                type="button"
                role="tab"
                aria-selected={mode === "official"}
                className={`lyric-studio-scope-btn ${mode === "official" ? "is-active" : ""}`}
                onClick={() => setMode("official")}
                title="Propose official lyrics to be published on the song (Staff reviewed)"
              >
                <CheckCircleIcon width={14} height={14} />
                <span>Official Lyrics</span>
              </button>
            )}

            <button
              type="button"
              role="tab"
              aria-selected={mode === "personal"}
              className={`lyric-studio-scope-btn ${mode === "personal" ? "is-active" : ""}`}
              onClick={() => setMode("personal")}
              title="Private lyrics or translations for your personal library"
            >
              <FileTextIcon width={14} height={14} />
              <span>Personal Lyrics</span>
            </button>
          </div>
        </header>

        {/* Informative Scope Banners */}
        {mode === "official" ? (
          hasOfficialLyrics ? (
            <div className="lyric-studio-banner" style={{ borderLeftColor: "#0284C7", background: "rgba(2, 132, 199, 0.08)" }} role="alert">
              <CheckCircleIcon width={20} height={20} style={{ color: "#0284C7", flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#0369A1" }}>Official Lyrics Published & Locked:</strong>
                <p style={{ margin: "4px 0 0", color: "#0C4A6E" }}>
                  This track already has official published lyrics. Under SoundWave policy, official lyrics cannot be edited once published. You can switch to "Personal Lyrics" to create or edit your own custom lyrics.
                </p>
              </div>
            </div>
          ) : pendingSubmission ? (
            <div className="lyric-studio-banner is-pending" role="alert">
              <ClockIcon width={20} height={20} style={{ color: "#D97706", flexShrink: 0 }} />
              <div>
                <strong>Official lyrics proposal is currently pending Staff review:</strong>
                <p style={{ margin: "4px 0 0" }}>
                  Submitted on {formatDateTime(pendingSubmission.submittedAt)}. Staff will review and publish your lyrics soon.
                </p>
              </div>
              <div className="lyric-studio-banner-actions">
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={handleWithdrawSubmission}
                  disabled={isWithdrawing}
                >
                  <TrashIcon width={13} height={13} />
                  <span>{isWithdrawing ? "Withdrawing..." : "Withdraw Submission"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="lyric-studio-banner" style={{ borderLeftColor: "#0284C7", background: "rgba(2, 132, 199, 0.06)" }}>
              <CheckCircleIcon width={20} height={20} style={{ color: "#0284C7", flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#0369A1" }}>Add Official Lyrics (One-time submission):</strong>
                <p style={{ margin: "4px 0 0", color: "#0C4A6E" }}>
                  This track was originally released without official lyrics. You can provide lyrics now, which will be sent to Staff for moderation before being published.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="lyric-studio-banner is-personal">
            <FileTextIcon width={20} height={20} style={{ color: "#A855F7", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <span>
                <strong>Personal Lyrics Studio:</strong> Create custom lyrics or translations private to your account.
              </span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className={`button button-small ${personalType === "CUSTOM" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPersonalType("CUSTOM")}
                >
                  🎵 Custom Lyrics
                </button>
                <button
                  type="button"
                  className={`button button-small ${personalType === "TRANSLATION" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPersonalType("TRANSLATION")}
                >
                  🌐 Translation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The Exact LyricSyncTab from Upload Track Page */}
        <LyricSyncTab
          key={`${mode}-${personalType}`}
          audioUrl={track.audioUrl}
          initialLyrics={initialLyrics}
          trackTitle={track.title}
          onApplyLyrics={(lrcString) => void handleApplyLyrics(lrcString)}
          onClearLyrics={() => {
            setToastNotice("Lyrics cleared in editor.");
            setToastType("info");
          }}
          onSwitchToUpload={() => onNavigate(`/track/${track.id}`)}
        />
      </div>

      <CenterNotificationPopup
        open={Boolean(toastNotice)}
        type={toastType}
        message={toastNotice}
        onClose={() => setToastNotice("")}
      />
    </div>
  );
}
