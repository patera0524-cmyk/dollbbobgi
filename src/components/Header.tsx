import React from 'react';
import { Settings, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { sounds } from '../services/sound';

interface HeaderProps {
  title: string;
  totalRemainingPrizes: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  totalRemainingPrizes,
  soundEnabled,
  onToggleSound,
  onOpenSettings
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="flex items-center justify-between gap-6 px-4 sm:px-6 py-3.5 bg-[#120624]/90 backdrop-blur-md border-b border-white/10 shrink-0">
      {/* Zone 1: Single Brand wordmark */}
      <div className="flex items-center gap-2 text-lg sm:text-xl font-display font-extrabold text-[#ff2a85] tracking-tight whitespace-nowrap shrink-0">
        <span>{title}</span>
      </div>

      {/* Zone 2: Clean unboxed status and tools */}
      <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-white/70">
        <div className="flex items-center gap-2">
          <span>남은 선물 총</span>
          <span className="font-mono text-cyan-300 font-bold tabular-nums">
            {totalRemainingPrizes}
          </span>
          <span>개</span>
        </div>

        <span aria-hidden="true" className="text-white/20">·</span>

        <button
          type="button"
          onClick={() => {
            onToggleSound();
            sounds.playClick();
          }}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
          title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-white/40" />
          )}
          <span>{soundEnabled ? '효과음 ON' : '음소거'}</span>
        </button>

        <span aria-hidden="true" className="text-white/20">·</span>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors cursor-pointer"
          title="전체화면"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          <span>{isFullscreen ? '창모드' : '전체화면'}</span>
        </button>
      </div>

      {/* Zone 3: 1 Primary Action (Settings & Customizer) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            onToggleSound();
            sounds.playClick();
          }}
          className="sm:hidden p-2 rounded-xl bg-white/10 text-white/80"
          title="소리 설정"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-sm hover:border-[#ff2a85]/50"
        >
          <Settings className="w-4 h-4 text-[#ff2a85] animate-spin-slow" />
          <span>⚙️ 관리자 설정</span>
        </button>
      </div>
    </header>
  );
};
