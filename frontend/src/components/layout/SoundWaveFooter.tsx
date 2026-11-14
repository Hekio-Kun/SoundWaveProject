import type { MouseEvent } from "react";
import { SoundWaveLogo } from "./SoundWaveHeader";
import { navigateTo } from "../../utils/navigation";

type Props = {
  hasPlayer: boolean;
  isAuthenticated: boolean;
};

export function SoundWaveFooter({ hasPlayer, isAuthenticated }: Props) {
  const handleNav = (e: MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
  };

  return (
    <footer className={`site-footer ${hasPlayer ? "site-footer--player" : ""}`}>
      <div className="container footer-grid">
        <div className="footer-brand">
          <SoundWaveLogo />
          <p className="footer-brand-desc">
            A place for everyone to discover, listen to, and share music.
          </p>
          <div className="footer-brand-badge">
            <span>SWP391</span>
            <span className="footer-badge-dot">•</span>
            <span>SoundWave Team</span>
          </div>
        </div>

        <div className="footer-col">
          <h3>Explore</h3>
          <a href="/" onClick={(e) => handleNav(e, "/")}>
            Explore
          </a>
          <a href="/charts" onClick={(e) => handleNav(e, "/charts")}>
            Top Charts
          </a>
          <a href="/browse" onClick={(e) => handleNav(e, "/browse")}>
            Browse Catalog
          </a>
          <a href="/albums" onClick={(e) => handleNav(e, "/albums")}>
            Albums
          </a>
        </div>

        <div className="footer-col">
          <h3>{isAuthenticated ? "Content Studio" : "Account"}</h3>
          {isAuthenticated ? (
            <>
              <a href="/studio" onClick={(e) => handleNav(e, "/studio")}>
                My Tracks
              </a>
              <a href="/studio?tab=albums" onClick={(e) => handleNav(e, "/studio?tab=albums")}>
                My Albums
              </a>
              <a href="/track" onClick={(e) => handleNav(e, "/track")}>
                Upload Music
              </a>
              <a href="/playlists" onClick={(e) => handleNav(e, "/playlists")}>
                Playlists
              </a>
            </>
          ) : (
            <>
              <a href="/login" onClick={(e) => handleNav(e, "/login")}>
                Login
              </a>
              <a href="/register" onClick={(e) => handleNav(e, "/register")}>
                Register
              </a>
              <a href="/browse" onClick={(e) => handleNav(e, "/browse")}>
                Browse Music
              </a>
            </>
          )}
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 SoundWave. SWP391 course project.</span>
        <span className="footer-bottom-tagline">Crafted for music lovers 🌊</span>
      </div>
    </footer>
  );
}
