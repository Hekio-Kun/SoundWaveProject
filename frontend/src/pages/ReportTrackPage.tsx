import React, { useEffect, useState, useRef } from "react";
import { catalogApi } from "../api/catalog";
import { reportsApi, type ReportCategoryType } from "../api/reports";
import type { CurrentUser, LandingTrack } from "../types";
import {
  AlertIcon,
  CheckIcon,
  ChevronLeftIcon,
  CloseIcon,
  DiscIcon,
  FileTextIcon,
  FlagIcon,
  ShieldIcon,
  TrashIcon,
  UploadIcon,
} from "../icons";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";

type Props = {
  trackId: number;
  currentUser: CurrentUser | null;
  onNavigate: (path: string) => void;
};

type ReasonOption = {
  value: ReportCategoryType;
  title: string;
  description: string;
};

const PREDEFINED_REASONS: ReasonOption[] = [
  {
    value: "COPYRIGHT",
    title: "Copyright Infringement",
    description:
      "Unauthorized music distribution, sampled without permission, or intellectual property violation. Requires ownership proof document.",
  },
  {
    value: "INAPPROPRIATE_CONTENT",
    title: "Inappropriate Content",
    description: "Contains hate speech, violence, harassment, or sexually explicit material.",
  },
  {
    value: "INCORRECT_METADATA",
    title: "Misleading Metadata",
    description: "Inaccurate song title, false artist tags, or impersonating an official creator or label.",
  },
  {
    value: "OTHER",
    title: "Spam or Damaged Audio",
    description: "Audio stream is distorted, broken, repetitive commercial spam, or silent.",
  },
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ReportTrackPage({ trackId, currentUser, onNavigate }: Props) {
  const [track, setTrack] = useState<LandingTrack | null>(null);
  const [loadingTrack, setLoadingTrack] = useState<boolean>(true);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Category filter state - Default to COPYRIGHT or first option
  const [selectedReason, setSelectedReason] = useState<ReportCategoryType>("COPYRIGHT");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isAffirmed, setIsAffirmed] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({ open: false, type: "success", message: "" });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch track information
  useEffect(() => {
    let active = true;
    setLoadingTrack(true);
    setTrackError(null);

    catalogApi
      .getTrackById(trackId)
      .then((data) => {
        if (active) setTrack(data);
      })
      .catch((err) => {
        if (active) {
          setTrackError(err?.message || "Unable to load track details. It may have been removed.");
        }
      })
      .finally(() => {
        if (active) setLoadingTrack(false);
      });

    return () => {
      active = false;
    };
  }, [trackId]);

  const isAuthor = Boolean(
    currentUser &&
      track?.creator &&
      (track.creator.userId === currentUser.id || String(track.creator.userId) === String(currentUser.id))
  );

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setEvidenceFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormError(`Evidence file exceeds the 15MB limit (${formatFileSize(file.size)}). Please choose a smaller file.`);
      return;
    }

    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setFormError(`Unsupported file format. Please upload PDF, Word document (.doc, .docx), or image (.png, .jpg, .jpeg).`);
      return;
    }

    setFormError(null);
    setEvidenceFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (isAuthor) {
      setFormError("You are the author of this track and cannot report your own content.");
      return;
    }

    if (!selectedReason) {
      setFormError("Please select a violation category to proceed.");
      return;
    }

    // Only COPYRIGHT requires evidence file and affirmation
    if (selectedReason === "COPYRIGHT") {
      if (!evidenceFile) {
        setFormError("Please attach a document proving copyright ownership.");
        return;
      }
      if (!isAffirmed) {
        setFormError("Please check the confirmation box to certify that you own or represent the copyright.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const selectedOption = PREDEFINED_REASONS.find((r) => r.value === selectedReason);
      const reportDescription = selectedOption
        ? `${selectedOption.title} - ${selectedOption.description}`
        : selectedReason;

      await reportsApi.reportTrack({
        trackId,
        category: selectedReason,
        description: reportDescription,
        evidenceFile: selectedReason === "COPYRIGHT" ? evidenceFile : undefined,
      });

      setNotification({
        open: true,
        type: "success",
        message: "Content report submitted successfully. Our moderation team will investigate this track.",
      });

      setTimeout(() => {
        onNavigate(`/track/${trackId}`);
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Failed to submit report. Please try again.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOption = PREDEFINED_REASONS.find((r) => r.value === selectedReason);

  return (
    <div className="studio-page" style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 24px 80px" }}>
      {/* Studio Header (Identical to Content Studio) */}
      <div className="studio-header">
        <div>
          <h1
            className="page-heading"
            style={{
              fontSize: "28px",
              fontWeight: 800,
              margin: "0 0 6px",
              color: "var(--color-primary-600, #0284C7)",
            }}
          >
            Report Track Content
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--sw-muted, #64748B)" }}>
            Submit a policy violation or intellectual property report for staff investigation
          </p>
        </div>

        <button
          type="button"
          className="button button-secondary"
          onClick={() => onNavigate(`/track/${trackId}`)}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <ChevronLeftIcon width={16} height={16} />
          <span>Back to track</span>
        </button>
      </div>

      {/* Target Track Preview Row (Studio Table Card Style) */}
      <div
        className="studio-table-container"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          background: "#ffffff",
          border: "1px solid #ede3d2",
          borderRadius: "14px",
          boxShadow: "0 2px 10px rgba(180, 140, 90, 0.04)",
        }}
      >
        {loadingTrack ? (
          <div style={{ fontSize: "14px", color: "var(--sw-muted, #64748B)" }}>Loading track information...</div>
        ) : trackError ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#DC2626", fontSize: "14px" }}>
            <AlertIcon width={18} height={18} />
            <span>{trackError}</span>
          </div>
        ) : track ? (
          <>
            <img
              src={track.coverUrl || "/pics/album.png"}
              alt={track.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/pics/album.png";
              }}
              style={{
                width: "48px",
                height: "48px",
                objectFit: "cover",
                borderRadius: "10px",
                flexShrink: 0,
                display: "block",
                background: "#F1F5F9",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <strong
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "var(--sw-text, #0F172A)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {track.title}
                </strong>
                <span className="status-pill status-pill--approved">
                  {track.publicationStatus || "Published"}
                </span>
              </div>
              <span style={{ fontSize: "13px", color: "var(--sw-muted, #64748B)" }}>
                Artist: <b>{track.creator?.displayName || "Unknown Creator"}</b>
                {track.album && <span> • Album: {track.album.title}</span>}
                <span> • ID: #{track.id}</span>
              </span>
            </div>
          </>
        ) : null}
      </div>

      {/* Author Restriction Alert */}
      {isAuthor && (
        <div className="auth-v2-error" role="alert" style={{ marginBottom: "8px" }}>
          <span>
            <AlertIcon width={18} height={18} />
          </span>
          <div>
            <b>You cannot report your own track</b>
            <small>
              You are the author of this track. If you want to modify or delete this content, please manage it in your{" "}
              <button
                type="button"
                onClick={() => onNavigate(`/track/submission/${trackId}`)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  fontWeight: 700,
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Creator Studio
              </button>
              .
            </small>
          </div>
        </div>
      )}

      {/* Error Message */}
      {formError && (
        <div className="auth-v2-error" role="alert" style={{ marginBottom: "8px" }}>
          <span>
            <AlertIcon width={18} height={18} />
          </span>
          <div>
            <b>Validation error</b>
            <small>{formError}</small>
          </div>
          <button
            className="icon-button"
            onClick={() => setFormError(null)}
            style={{ marginLeft: "auto" }}
            aria-label="Dismiss error"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      )}

      {/* Reason Selection Filter Pills (Identical to Content Studio's filter pills bar) */}
      <div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--sw-text, #0F172A)" }}>
            Select Violation Category: <span style={{ color: "#DC2626" }}>*</span>
          </label>
        </div>

        <div className="studio-tabs-bar" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          {PREDEFINED_REASONS.map((opt) => {
            const isSelected = selectedReason === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`filter-pill ${isSelected ? "filter-pill--active" : ""}`}
                disabled={isAuthor || submitting}
                onClick={() => {
                  setSelectedReason(opt.value);
                  setFormError(null);
                }}
                style={{
                  cursor: isAuthor ? "not-allowed" : "pointer",
                  padding: "6px 16px",
                  fontSize: "13px",
                }}
              >
                {opt.title}
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "var(--sw-muted, #64748B)", lineHeight: 1.5 }}>
            {selectedOption.description}
          </p>
        )}
      </div>

      {/* Main Content Area Card (Style identical to Content Studio My Album table/card) */}
      <form onSubmit={handleSubmit}>
        <div
          className="studio-table-container"
          style={{
            background: "#ffffff",
            border: "1px solid #ede3d2",
            borderRadius: "16px",
            padding: "28px",
            boxShadow: "0 4px 16px rgba(180, 140, 90, 0.04)",
          }}
        >
          {/* Case 1: ONLY Copyright Infringement has the file upload area */}
          {selectedReason === "COPYRIGHT" ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-sand-light, #F5EFE6)",
                    color: "var(--color-ocean-primary, #0284C7)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <ShieldIcon width={20} height={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--sw-text, #0F172A)" }}>
                    Copyright Ownership Proof Document <span style={{ color: "#DC2626" }}>*</span>
                  </h3>
                  <span style={{ fontSize: "13px", color: "var(--sw-muted, #64748B)" }}>
                    Upload an official document proving your copyright ownership or distribution rights to this music.
                  </span>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                style={{ display: "none" }}
                disabled={isAuthor || submitting}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {/* Upload Dropzone (Style matching My Album dashed card) */}
              {!evidenceFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isAuthor && !submitting) {
                      fileInputRef.current?.click();
                    }
                  }}
                  style={{
                    marginTop: "16px",
                    border: dragOver ? "2px dashed #0284c7" : "1px dashed var(--color-sand-primary, #D4B996)",
                    backgroundColor: dragOver ? "#f0f9ff" : "#fdfaf4",
                    borderRadius: "14px",
                    padding: "36px 20px",
                    textAlign: "center",
                    cursor: isAuthor ? "not-allowed" : "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-sand-light, #F5EFE6)",
                      color: "var(--color-ocean-primary, #0284C7)",
                      display: "grid",
                      placeItems: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <UploadIcon width={24} height={24} />
                  </div>
                  <strong style={{ display: "block", fontSize: "15px", color: "var(--sw-text, #0F172A)", marginBottom: "4px" }}>
                    Click to choose file or drag & drop document here
                  </strong>
                  <span style={{ fontSize: "13px", color: "var(--sw-muted, #64748B)" }}>
                    Supported formats: PDF, Word (.doc, .docx), PNG, JPG, JPEG (Max 15MB)
                  </span>
                </div>
              ) : (
                /* Selected File Card */
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "12px",
                    border: "1px solid #bae6fd",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: "#e0f2fe",
                        color: "#0284c7",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileTextIcon width={22} height={22} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "14.5px",
                          color: "#0369a1",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {evidenceFile.name}
                      </strong>
                      <span style={{ fontSize: "12.5px", color: "#0284c7" }}>
                        {formatFileSize(evidenceFile.size)} • Ready to upload
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => setEvidenceFile(null)}
                      disabled={submitting}
                      title="Remove file"
                      style={{ color: "#dc2626" }}
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Legal Confirmation Checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginTop: "18px",
                  cursor: isAuthor ? "not-allowed" : "pointer",
                  fontSize: "13.5px",
                  color: "#334155",
                  lineHeight: 1.5,
                }}
              >
                <input
                  type="checkbox"
                  checked={isAffirmed}
                  disabled={isAuthor || submitting}
                  onChange={(e) => setIsAffirmed(e.target.checked)}
                  style={{ marginTop: "3px", accentColor: "#0284C7" }}
                />
                <span>
                  I declare under penalty of perjury that I am the genuine copyright owner or legally authorized representative of this audio work, and the provided document is authentic.
                </span>
              </label>
            </div>
          ) : (
            /* Case 2: Other reports (Inappropriate, Metadata, Spam/Damaged) do NOT have ANY extra fields or upload */
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  color: "var(--color-ocean-primary, #0284C7)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 14px",
                }}
              >
                <FlagIcon width={24} height={24} />
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 6px", color: "var(--sw-text, #0F172A)" }}>
                {selectedOption?.title}
              </h3>
              <p style={{ margin: "0 auto 16px", maxWidth: "480px", fontSize: "14px", color: "var(--sw-muted, #64748B)", lineHeight: 1.5 }}>
                {selectedOption?.description}
              </p>
              <span style={{ fontSize: "13px", color: "#64748B", display: "inline-block" }}>
                Click <b>Submit Report</b> below to lodge this report with SoundWave moderation staff.
              </span>
            </div>
          )}

          {/* Action Buttons Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid #ede3d2",
            }}
          >
            <button
              type="button"
              className="button button-secondary"
              disabled={submitting}
              onClick={() => onNavigate(`/track/${trackId}`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={
                submitting ||
                isAuthor ||
                !selectedReason ||
                (selectedReason === "COPYRIGHT" && (!evidenceFile || !isAffirmed))
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor:
                  submitting || isAuthor || (selectedReason === "COPYRIGHT" && (!evidenceFile || !isAffirmed))
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "16px",
                      height: "16px",
                      border: "2px solid #FFFFFF",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FlagIcon width={16} height={16} />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Central Feedback Toast Popup */}
      <CenterNotificationPopup
        open={notification.open}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
