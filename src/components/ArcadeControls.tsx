import React from 'react';
import { ClawPhase, Prize } from '../types';

interface ArcadeControlsProps {
  phase: ClawPhase;
  onDraw: () => void;
  dispensedPrize: Prize | null | 'missed';
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  phase,
  onDraw,
  dispensedPrize
}) => {
  const isOperating = phase !== 'IDLE';
  const isDispensing = phase === 'DISPENSING';

  return (
    <div className="w-full bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 p-2.5 sm:p-4 rounded-3xl border-4 border-white/90 shadow-[0_12px_28px_rgba(0,0,0,0.22)] flex items-center justify-between gap-2 sm:gap-6 select-none relative overflow-hidden">
      
      {/* Subtle glass reflection highlight across deck */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />

      {/* 1. LEFT: Sleek Physical Prize Dispenser Hatch (선물 배출구) */}
      <div className="w-36 sm:w-56 md:w-64 h-28 sm:h-34 prize-hatch-frame rounded-2xl relative overflow-hidden flex flex-col justify-between p-2 sm:p-2.5 shadow-2xl shrink-0">
        {/* Inner Chamber with Acrylic Flap Door */}
        <div className="relative flex-1 rounded-xl prize-hatch-door flex items-center justify-center text-center overflow-hidden">
          {/* Internal Chamber Light that flashes when prize is dispensed */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
              isDispensing || dispensedPrize
                ? 'bg-amber-300/50 animate-pulse'
                : 'bg-black/25'
            }`}
          />

          {/* Gloss diagonal reflection */}
          <div className="absolute -top-12 -left-12 w-36 h-24 bg-white/20 rotate-45 pointer-events-none blur-[1px]" />

          {/* Clean bold arcade PUSH flap label */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="font-jua text-2xl sm:text-3xl md:text-4xl text-white font-extrabold tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              PUSH
            </span>
            {isDispensing ? (
              <span className="text-xl sm:text-2xl animate-bounce filter drop-shadow">🎁</span>
            ) : (
              <span className="text-[10px] sm:text-xs text-pink-100/90 font-bold tracking-wider -mt-0.5 drop-shadow">
                선물 배출구
              </span>
            )}
          </div>
        </div>

        {/* Bottom metal tray lip */}
        <div className="h-2 w-full bg-slate-600 rounded-full mt-1.5 shadow-inner" />
      </div>

      {/* 2. MIDDLE: Sleek Arcade Marquee Banner ("🎮 행운의 버튼을 눌러주세요!") */}
      <div className="flex-1 flex flex-col items-center justify-center px-1 sm:px-3 text-center z-10">
        <div className="px-3 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-white/25 backdrop-blur-md border-2 border-white/70 shadow-lg flex items-center justify-center gap-2 animate-bounce-subtle">
          <span className="font-jua text-sm sm:text-xl md:text-2xl text-white font-extrabold tracking-wide drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)] whitespace-nowrap">
            🎮 행운의 버튼을 눌러주세요!
          </span>
        </div>
        <div className="mt-1 hidden sm:flex items-center gap-1.5 opacity-90">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-ping" />
          <span className="text-xs text-yellow-100 font-bold drop-shadow">터치하면 집게가 자동으로 선물을 뽑습니다!</span>
        </div>
      </div>

      {/* 3. RIGHT: Sleek 3D Arcade Push Button */}
      <div className="shrink-0 flex items-center justify-center">
        <div className="arcade-button-3d-housing rounded-full p-2 sm:p-3 flex items-center justify-center shadow-2xl">
          <button
            type="button"
            disabled={isOperating}
            onClick={onDraw}
            className={`arcade-button-3d w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full font-jua flex flex-col items-center justify-center select-none cursor-pointer ${
              isOperating ? '' : 'animate-pulse hover:scale-105 active:scale-95'
            }`}
            title="터치하여 뽑기"
          >
            <span className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-wider drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)]">
              {isOperating ? '뽑는 중' : '뽑기'}
            </span>
            {!isOperating && (
              <span className="text-[10px] sm:text-xs text-pink-100 font-bold tracking-wider -mt-0.5 opacity-90 drop-shadow">
                TOUCH
              </span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
