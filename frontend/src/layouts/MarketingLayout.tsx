import type { ReactNode } from "react";
import { SoundWaveFooter } from "../components/layout/SoundWaveFooter";
import { SoundWaveHeader } from "../components/layout/SoundWaveHeader";

type Props = {
  children: ReactNode;
  isAuthenticated: boolean;
  hasPlayer: boolean;
};

export function MarketingLayout({ children, isAuthenticated, hasPlayer }: Props) {
  return (
    <div className={`marketing-layout ${hasPlayer ? "app--with-player" : ""}`}>
      <SoundWaveHeader isAuthenticated={isAuthenticated} hasPlayer={hasPlayer} />
      <div className="marketing-content">
        {children}
      </div>
      <SoundWaveFooter hasPlayer={hasPlayer} isAuthenticated={isAuthenticated} />
    </div>
  );
}
