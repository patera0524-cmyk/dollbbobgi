import React, { useEffect } from 'react';
import { Prize } from '../types';
import { X, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/sound';

interface ResultModalProps {
  prize: Prize | null;
  onConfirm: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ prize, onConfirm }) => {
  useEffect(() => {
    if (prize) {
      sounds.playWin();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#ff7b9c', '#ffc107', '#4ade80', '#60a5fa', '#a855f7']
      });
    }
  }, [prize]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-white to-pink-50 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center border-4 border-pink-400 shadow-2xl relative animate-pop select-none">
        
        {/* Header Ribbon */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-jua text-lg px-6 py-1.5 rounded-full shadow-lg border-2 border-white whitespace-nowrap">
          {prize ? '🎉 당첨을 축하합니다! 🎉' : '💨 아쉬운 꽝!'}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="absolute top-3 right-3 text-pink-400 hover:text-pink-600 p-1 rounded-lg cursor-pointer transition hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prize Icon Container */}
        <div className="my-5 relative inline-block">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-yellow-100 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-inner border-4 border-yellow-300 mx-auto">
            <span className="transform hover:scale-110 transition filter drop-shadow">
              {prize ? prize.emoji : '💨'}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 text-3xl animate-bounce">✨</div>
        </div>

        {/* Prize Name */}
        <h3 className="font-jua text-2xl sm:text-3xl text-pink-600 mb-2">
          {prize ? prize.name : '아쉽지만 다음 기회에!'}
        </h3>

        {/* Prize Badge & Stock info */}
        {prize && (
          <div className="inline-block bg-pink-100 px-3 py-1 rounded-full text-pink-700 text-xs font-bold mb-5 border border-pink-200">
            {prize.tier === 'grand'
              ? '👑 특상 (대박)'
              : prize.tier === 'first'
              ? '🥇 1등 선물'
              : prize.tier === 'second'
              ? '🥈 2등 선물'
              : prize.tier === 'third'
              ? '🥉 3등 선물'
              : prize.tier === 'lucky'
              ? '⭐ 행운상'
              : '🍬 참가상'}
            <span className="mx-1">·</span>
            <span>남은 수량: {prize.count}개</span>
          </div>
        )}

        {/* Single prominent confirm button */}
        <div className="mt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 hover:from-pink-600 hover:to-rose-600 text-white font-jua text-xl py-3.5 rounded-2xl shadow-lg border-2 border-white transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
            <span>확인 (다음 학생 차례)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
