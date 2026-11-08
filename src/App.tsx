import React, { useState } from 'react';
import {
  MachineConfig,
  ClawPhase,
  Prize,
  MachineTheme
} from './types';
import {
  loadConfig,
  saveConfig,
  THEMES,
  addHistoryRecord
} from './services/storage';
import { sounds } from './services/sound';
import { ClawMachineCanvas } from './components/ClawMachineCanvas';
import { ArcadeControls } from './components/ArcadeControls';
import { SettingsModal } from './components/SettingsModal';
import { ResultModal } from './components/ResultModal';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import startPosterSrc from './assets/images/poster_clean_ground_1794128843864.jpg';
import goldCoinSrc from './assets/images/gold_star_coin_transparent.png';

export default function App() {
  const [config, setConfig] = useState<MachineConfig>(() => loadConfig());
  const [screen, setScreen] = useState<'START' | 'GAME'>('START');
  const [phase, setPhase] = useState<ClawPhase>('IDLE');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals & Dispensed Prize State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [resultPrize, setResultPrize] = useState<Prize | null | 'missed'>(null);

  const currentTheme: MachineTheme = THEMES[config.theme] || THEMES.pastel;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Insert Coin button on start screen
  const handleInsertCoin = () => {
    sounds.playCoin();
    setScreen('GAME');
    setPhase('IDLE');
  };

  // 3D Arcade Push Button pressed on game screen
  const handleDraw = () => {
    if (phase !== 'IDLE') return;
    sounds.playCoin();
    setPhase('MOVING_AUTO');
  };

  // Prize dispensed from claw machine canvas
  const handlePrizeDispensed = (wonPrize: Prize | null) => {
    if (wonPrize && wonPrize.count > 0) {
      const updatedPrizes = config.prizes.map(p =>
        p.id === wonPrize.id ? { ...p, count: Math.max(0, p.count - 1) } : p
      );
      const updatedConfig = { ...config, prizes: updatedPrizes };
      setConfig(updatedConfig);
      saveConfig(updatedConfig);

      setResultPrize({ ...wonPrize, count: Math.max(0, wonPrize.count - 1) });
    } else {
      setResultPrize('missed');
    }
  };

  // Confirm prize result modal -> smoothly return to Start Screen for next student
  const handleResultConfirm = (playerName?: string) => {
    if (resultPrize && resultPrize !== 'missed') {
      addHistoryRecord({
        prizeName: resultPrize.name,
        prizeEmoji: resultPrize.emoji,
        playerName
      });
    }
    setResultPrize(null);
    setPhase('IDLE');
    setScreen('START');
  };

  const handleSaveConfig = (newConfig: MachineConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden select-none flex flex-col justify-center items-center"
      style={{
        background: 'linear-gradient(135deg, #ffd3b6 0%, #ffaaa5 40%, #d4a5edd6 100%)'
      }}
    >
      {/* SCREEN 1: START SCREEN (User's Illustration Poster) */}
      {screen === 'START' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#ffd5e4]">
          {/* Main Poster Image - Fills the entire screen */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={startPosterSrc}
              alt="평택초등학교 학생자치회 폰프리스쿨 행사 랜덤 뽑기"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover md:object-fill select-none"
            />

            {/* Real 3D Tactile Animated '동전 넣기' Button with attached 3D Star Coin */}
            <button
              type="button"
              onClick={handleInsertCoin}
              className="absolute bottom-[8.5%] sm:bottom-[9%] left-1/2 -translate-x-1/2 px-8 sm:px-12 py-3.5 sm:py-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-jua text-2xl sm:text-4xl border-4 border-[#24334a] shadow-[0_8px_0_#1c2638,0_18px_28px_rgba(0,0,0,0.4)] hover:brightness-105 active:translate-y-2 active:shadow-[0_2px_0_#1c2638,0_6px_12px_rgba(0,0,0,0.25)] transition-all duration-100 flex items-center gap-3 sm:gap-4 cursor-pointer select-none group"
              title="동전 넣고 뽑기 시작!"
            >
              <img
                src={goldCoinSrc}
                alt="3D Gold Star Coin"
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.35)] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-150 animate-bounce"
              />
              <span className="tracking-wide drop-shadow-sm font-bold">동전 넣기</span>
            </button>
          </div>

          {/* Top Sound & Admin Settings buttons in corner */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              className="p-3 rounded-full bg-white/70 hover:bg-white text-pink-900 shadow-md backdrop-blur-md transition-all cursor-pointer border-2 border-pink-300"
              title={soundEnabled ? '소리 끄기' : '소리 켜기'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-pink-600" /> : <VolumeX className="w-5 h-5 text-pink-400" />}
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-full bg-white/70 hover:bg-white text-pink-900 shadow-md backdrop-blur-md transition-all cursor-pointer border-2 border-pink-300"
              title="관리자 설정"
            >
              <Settings className="w-5 h-5 text-pink-600" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: GAME SCREEN */}
      {screen === 'GAME' && (
        <div className="relative w-full h-full max-w-7xl flex flex-col items-center justify-between p-1.5 sm:p-3 animate-fadeIn">
          {/* Floating Top corner utilities - takes 0 vertical space so machine has full height */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-4 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSound}
              className="p-2 sm:p-2.5 rounded-full bg-white/70 hover:bg-white text-pink-900 shadow-md backdrop-blur-md transition-all cursor-pointer border border-pink-300"
              title={soundEnabled ? '소리 끄기' : '소리 켜기'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-600" /> : <VolumeX className="w-4 h-4 text-pink-400" />}
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 sm:p-2.5 rounded-full bg-white/70 hover:bg-white text-pink-900 shadow-md backdrop-blur-md transition-all cursor-pointer border border-pink-300"
              title="관리자 설정"
            >
              <Settings className="w-4 h-4 text-pink-600" />
            </button>
          </div>

          {/* Claw Machine Showcase widened across screen */}
          <div className="w-full flex-1 flex items-center justify-center overflow-hidden my-1">
            <div className="w-full h-full max-h-[79vh] rounded-3xl arcade-frame-candy overflow-hidden relative shadow-2xl">
              <ClawMachineCanvas
                config={config}
                theme={currentTheme}
                phase={phase}
                setPhase={setPhase}
                onPrizeDispensed={handlePrizeDispensed}
              />
            </div>
          </div>

          {/* Lower Control Deck: Left Prize Dispenser Hatch, Center Marquee & Right 3D Push Button */}
          <div className="w-full flex justify-center shrink-0">
            <ArcadeControls
              phase={phase}
              onDraw={handleDraw}
              dispensedPrize={resultPrize}
            />
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultPrize && (
        <ResultModal
          prize={resultPrize === 'missed' ? null : resultPrize}
          onConfirm={handleResultConfirm}
        />
      )}

      {/* Settings Studio Modal */}
      {isSettingsOpen && (
        <SettingsModal
          config={config}
          onSaveConfig={handleSaveConfig}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
