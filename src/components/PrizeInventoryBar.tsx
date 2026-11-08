import React from 'react';
import { Prize } from '../types';

interface PrizeInventoryBarProps {
  prizes: Prize[];
}

export const PrizeInventoryBar: React.FC<PrizeInventoryBarProps> = ({ prizes }) => {
  return (
    <div className="w-full bg-[#18092b]/80 border-t border-white/10 px-4 py-2.5 flex items-center gap-3 overflow-x-auto">
      <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider shrink-0">
        선물 현황:
      </span>
      <div className="flex items-center gap-2">
        {prizes.map(p => {
          const isSoldOut = p.count <= 0;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition-all ${
                isSoldOut
                  ? 'bg-black/30 border-white/5 text-white/30 line-through'
                  : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
              }`}
            >
              <span>{p.emoji}</span>
              <span className="font-medium">{p.name}</span>
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded font-bold tabular-nums ${
                  isSoldOut
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-amber-300 bg-amber-500/15'
                }`}
              >
                {p.count}개
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
