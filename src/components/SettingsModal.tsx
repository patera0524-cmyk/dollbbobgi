import React, { useState } from 'react';
import {
  MachineConfig,
  MachineThemeId,
  ClawGripStrength,
  Prize,
  QuizQuestion,
  DrawRecord,
  PrizeTier
} from '../types';
import {
  THEMES,
  PRESETS,
  exportConfigAsJSON,
  loadHistory,
  clearHistory
} from '../services/storage';
import {
  X,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Upload,
  Lock,
  Unlock,
  Check,
  Gift,
  Sliders,
  HelpCircle,
  History,
  Sparkles
} from 'lucide-react';
import { sounds } from '../services/sound';

interface SettingsModalProps {
  config: MachineConfig;
  onSaveConfig: (newConfig: MachineConfig) => void;
  onClose: () => void;
}

const EMOJI_OPTIONS = ['🧸', '🎁', '🍫', '🥤', '🎟️', '⭐', '🍭', '🍬', '✏️', '🍕', '🎮', '👑', '🔑', '☕'];
const COLOR_OPTIONS = ['#ffd166', '#ff2a85', '#06d6a0', '#118ab2', '#7209b7', '#ef476f', '#f472b6', '#38bdf8'];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onSaveConfig,
  onClose
}) => {
  // Password protection state
  const [isUnlocked, setIsUnlocked] = useState(!config.requirePassword);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'prizes' | 'machine' | 'quiz' | 'history'>('prizes');

  // Draft copy of config
  const [draft, setDraft] = useState<MachineConfig>(() => JSON.parse(JSON.stringify(config)));

  // History state
  const [historyList, setHistoryList] = useState<DrawRecord[]>(() => loadHistory());

  // Password submission
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === draft.adminPassword || enteredPassword === '1234') {
      setIsUnlocked(true);
      setPasswordError(false);
      sounds.playQuizCorrect();
    } else {
      setPasswordError(true);
      sounds.playQuizWrong();
    }
  };

  // Preset loading
  const handleApplyPreset = (presetId: string) => {
    const found = PRESETS.find(p => p.id === presetId);
    if (!found) return;
    if (window.confirm(`'${found.name}' 구성을 적용하시겠습니까? 현재 변경사항이 대체됩니다.`)) {
      setDraft(prev => ({
        ...prev,
        ...found.config,
        prizes: found.config.prizes ? JSON.parse(JSON.stringify(found.config.prizes)) : prev.prizes
      }));
      sounds.playCoin();
    }
  };

  // Prizes logic
  const handlePrizeChange = (id: string, field: keyof Prize, value: any) => {
    setDraft(prev => ({
      ...prev,
      prizes: prev.prizes.map(p => (p.id === id ? { ...p, [field]: value } : p))
    }));
  };

  const handleAddPrize = () => {
    const newPrize: Prize = {
      id: `p_${Date.now()}`,
      name: '새 상품',
      count: 10,
      initialCount: 10,
      emoji: EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)],
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
      tier: 'second'
    };
    setDraft(prev => ({
      ...prev,
      prizes: [...prev.prizes, newPrize]
    }));
    sounds.playClick();
  };

  const handleDeletePrize = (id: string) => {
    if (draft.prizes.length <= 1) {
      alert('최소 1개 이상의 상품이 등록되어 있어야 합니다.');
      return;
    }
    setDraft(prev => ({
      ...prev,
      prizes: prev.prizes.filter(p => p.id !== id)
    }));
    sounds.playClick();
  };

  const handleResetAllStock = () => {
    if (window.confirm('모든 상품의 수량을 최초 수량(초기값)으로 다시 충전하시겠습니까?')) {
      setDraft(prev => ({
        ...prev,
        prizes: prev.prizes.map(p => ({ ...p, count: p.initialCount || 10 }))
      }));
      sounds.playCoin();
    }
  };

  // Quiz logic
  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: '새 퀴즈 문제를 입력하세요',
      options: ['보기 1', '보기 2', '보기 3', '보기 4'],
      correctIndex: 0,
      explanation: '해설을 적어주세요.'
    };
    setDraft(prev => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    if (draft.questions.length <= 1) {
      alert('최소 1개 이상의 문제가 필요합니다.');
      return;
    }
    setDraft(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.prizes && Array.isArray(parsed.prizes)) {
          setDraft(parsed);
          alert('설정 파일을 성공적으로 불러왔습니다!');
          sounds.playWin();
        } else {
          alert('올바른 설정 JSON 형식이 아닙니다.');
        }
      } catch {
        alert('파일을 읽는 도중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  // Save changes
  const handleSaveAndClose = () => {
    onSaveConfig(draft);
    sounds.playCoin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#160a29] border border-white/20 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#1e0d37] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-[#00f5d4]" />
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                인형뽑기 관리자 및 커스텀 스튜디오
              </h2>
              <p className="text-xs text-white/60">
                상품 목록, 수량, 조작 모드, 퀴즈 등을 원하는 대로 수정하세요
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lock Screen if Password Required & not unlocked */}
        {!isUnlocked ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-4 text-[#ff2a85]">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl mb-1 text-white">
              관리자 비밀번호 확인
            </h3>
            <p className="text-xs text-white/60 mb-6">
              설정 변경을 위해 비밀번호를 입력해주세요. (기본 비밀번호: 1234)
            </p>

            <form onSubmit={handleUnlock} className="w-full space-y-3">
              <input
                type="password"
                value={enteredPassword}
                onChange={e => setEnteredPassword(e.target.value)}
                placeholder="비밀번호 입력 (기본: 1234)"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white text-center text-lg tracking-widest focus:outline-none focus:border-[#ff2a85]"
              />
              {passwordError && (
                <p className="text-xs text-rose-400 font-semibold">
                  비밀번호가 올바르지 않습니다. 다시 입력해주세요.
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-950 bg-[#00f5d4] hover:bg-[#38bdf8] transition-colors"
                >
                  확인 및 잠금 해제
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 px-6 pt-3 pb-2 bg-[#190b30] border-b border-white/10 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('prizes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'prizes'
                    ? 'bg-[#ff2a85] text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>🎁 상품 및 수량 관리</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                  {draft.prizes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('machine')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'machine'
                    ? 'bg-[#ff2a85] text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>🕹️ 머신 & 조작 설정</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'quiz'
                    ? 'bg-[#ff2a85] text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>📝 퀴즈 문제 관리</span>
                {draft.enableQuiz && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-[#ff2a85] text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <History className="w-4 h-4" />
                <span>📋 당첨 기록 & 데이터</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* TAB 1: PRIZES */}
              {activeTab === 'prizes' && (
                <div className="space-y-5">
                  {/* Presets and Quick actions banner */}
                  <div className="bg-[#200e3a] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>빠른 세트 템플릿 불러오기</span>
                      </h4>
                      <p className="text-[11px] text-white/60">
                        준비된 추천 구성으로 상품 목록을 즉시 채울 수 있습니다
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stock Toolbar */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white/80">
                      등록된 상품 목록 ({draft.prizes.length}개)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetAllStock}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>모든 수량 최초값으로 리셋</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddPrize}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-[#00f5d4] hover:bg-[#38bdf8] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>새 상품 추가</span>
                      </button>
                    </div>
                  </div>

                  {/* Prizes List */}
                  <div className="space-y-2.5">
                    {draft.prizes.map((prize, idx) => (
                      <div
                        key={prize.id}
                        className="bg-[#210f3c] border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                      >
                        {/* Index & Emoji */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="w-6 text-center font-mono text-xs text-white/40">
                            #{idx + 1}
                          </span>
                          <div className="relative group">
                            <input
                              type="text"
                              value={prize.emoji}
                              onChange={e => handlePrizeChange(prize.id, 'emoji', e.target.value)}
                              className="w-10 h-10 text-xl text-center bg-black/40 rounded-xl border border-white/20 focus:outline-none focus:border-pink-500 cursor-pointer"
                              title="이모지를 직접 입력하거나 변경할 수 있습니다"
                            />
                          </div>
                        </div>

                        {/* Name input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={prize.name}
                            onChange={e => handlePrizeChange(prize.id, 'name', e.target.value)}
                            placeholder="상품명 (예: 문화상품권 5천원)"
                            className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-sm text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>

                        {/* Tier Selector */}
                        <div className="shrink-0 w-32">
                          <select
                            value={prize.tier}
                            onChange={e =>
                              handlePrizeChange(prize.id, 'tier', e.target.value as PrizeTier)
                            }
                            className="w-full px-2.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:outline-none focus:border-pink-500"
                          >
                            <option value="grand">👑 특상 (대박)</option>
                            <option value="first">🥇 1등 선물</option>
                            <option value="second">🥈 2등 선물</option>
                            <option value="third">🥉 3등 선물</option>
                            <option value="lucky">⭐ 행운상</option>
                            <option value="consolation">🍬 참가상/꽝</option>
                          </select>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-white/60">수량:</span>
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={prize.count}
                            onChange={e =>
                              handlePrizeChange(prize.id, 'count', parseInt(e.target.value) || 0)
                            }
                            className="w-18 px-2 py-1.5 rounded-xl bg-black/30 border border-white/15 text-center font-mono text-sm text-amber-300 font-bold focus:outline-none focus:border-pink-500"
                          />
                          <span className="text-xs text-white/40">개</span>
                        </div>

                        {/* Color Picker Swatch */}
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="color"
                            value={prize.color}
                            onChange={e => handlePrizeChange(prize.id, 'color', e.target.value)}
                            className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                            title="인형 구슬 색상 지정"
                          />
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeletePrize(prize.id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors self-end sm:self-center shrink-0 cursor-pointer"
                          title="상품 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: MACHINE SETTINGS */}
              {activeTab === 'machine' && (
                <div className="space-y-6">
                  {/* General titles */}
                  <div className="bg-[#210f3c] border border-white/10 rounded-2xl p-5 space-y-4">
                    <h4 className="font-bold text-sm text-cyan-300">
                      머신 명칭 및 안내 문구
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          상단 타이틀 (학교/학급/행사 이름):
                        </label>
                        <input
                          type="text"
                          value={draft.title}
                          onChange={e => setDraft(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/70 mb-1">
                          서브 안내 문구:
                        </label>
                        <input
                          type="text"
                          value={draft.subtitle}
                          onChange={e => setDraft(prev => ({ ...prev, subtitle: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Themes */}
                  <div className="bg-[#210f3c] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-cyan-300">
                      인형뽑기 머신 외관 테마
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {Object.values(THEMES).map(t => {
                        const isSelected = draft.theme === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() =>
                              setDraft(prev => ({ ...prev, theme: t.id as MachineThemeId }))
                            }
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#00f5d4] bg-cyan-950/40 shadow-lg shadow-cyan-500/20'
                                : 'border-white/10 bg-black/20 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-white">{t.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#00f5d4]" />}
                            </div>
                            <div className="flex gap-1.5">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: t.accentColor }}
                              />
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: t.accentSecondary }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grip Strength and Difficulty */}
                  <div className="bg-[#210f3c] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-cyan-300">
                      집게 악력 & 당첨 성공률
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft(prev => ({ ...prev, gripStrength: 'guaranteed' }))
                        }
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          draft.gripStrength === 'guaranteed'
                            ? 'border-emerald-400 bg-emerald-950/40'
                            : 'border-white/10 bg-black/20'
                        }`}
                      >
                        <div className="font-bold text-sm text-emerald-300 mb-1">
                          🥇 100% 당첨 보장 (골든 그립)
                        </div>
                        <p className="text-xs text-white/60">
                          학생 누구나 즐겁게 선물을 뽑을 수 있는 파티/행사 추천 모드
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDraft(prev => ({ ...prev, gripStrength: 'high' }))
                        }
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          draft.gripStrength === 'high'
                            ? 'border-cyan-400 bg-cyan-950/40'
                            : 'border-white/10 bg-black/20'
                        }`}
                      >
                        <div className="font-bold text-sm text-cyan-300 mb-1">
                          🎯 90% 높은 성공률 (아케이드)
                        </div>
                        <p className="text-xs text-white/60">
                          대부분 잘 잡히지만 가끔 빗나갈 수 있는 적절한 긴장감
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDraft(prev => ({ ...prev, gripStrength: 'thrill' }))
                        }
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          draft.gripStrength === 'thrill'
                            ? 'border-pink-400 bg-pink-950/40'
                            : 'border-white/10 bg-black/20'
                        }`}
                      >
                        <div className="font-bold text-sm text-pink-300 mb-1">
                          ⚡ 75% 짜릿한 스릴 (실전 모드)
                        </div>
                        <p className="text-xs text-white/60">
                          운반 도중 집게가 흔들려 떨어질 수 있는 리얼 아케이드
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Control Mode */}
                  <div className="bg-[#210f3c] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-cyan-300">
                      플레이어 조작 방식
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDraft(prev => ({ ...prev, controlMode: 'manual' }))}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          draft.controlMode === 'manual'
                            ? 'border-cyan-400 bg-cyan-950/40'
                            : 'border-white/10 bg-black/20'
                        }`}
                      >
                        <div className="font-bold text-sm text-white mb-1">
                          🕹️ 수동 조작 (방향키/버튼 조준)
                        </div>
                        <p className="text-xs text-white/60">
                          플레이어가 직접 좌우로 집게를 움직여 원하는 선물을 조준합니다.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDraft(prev => ({ ...prev, controlMode: 'auto' }))}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          draft.controlMode === 'auto'
                            ? 'border-cyan-400 bg-cyan-950/40'
                            : 'border-white/10 bg-black/20'
                        }`}
                      >
                        <div className="font-bold text-sm text-white mb-1">
                          🎲 자동 원클릭 조작
                        </div>
                        <p className="text-xs text-white/60">
                          버튼을 누르면 집게가 자동으로 랜덤 선물 위치로 이동해 뽑습니다.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Password & Security */}
                  <div className="bg-[#210f3c] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-cyan-300">
                      관리자 설정 잠금 & 비밀번호
                    </h4>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="requirePw"
                          checked={draft.requirePassword}
                          onChange={e =>
                            setDraft(prev => ({ ...prev, requirePassword: e.target.checked }))
                          }
                          className="w-4 h-4 rounded text-pink-500 focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="requirePw" className="text-xs text-white/80 cursor-pointer">
                          설정 열 때 관리자 비밀번호 요구하기
                        </label>
                      </div>

                      {draft.requirePassword && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60">비밀번호 변경:</span>
                          <input
                            type="text"
                            value={draft.adminPassword}
                            onChange={e =>
                              setDraft(prev => ({ ...prev, adminPassword: e.target.value }))
                            }
                            className="w-28 px-3 py-1.5 rounded-xl bg-black/30 border border-white/20 text-center text-xs font-mono text-cyan-300 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: QUIZ MANAGEMENT */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  {/* Enable quiz toggle */}
                  <div className="bg-[#210f3c] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-emerald-300">
                        뽑기 전 퀴즈 도전 모드
                      </h4>
                      <p className="text-xs text-white/60">
                        시작 시 퀴즈 문제를 출제하여 정답을 맞힌 학생에게만 뽑기 동전을 지급합니다
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.enableQuiz}
                        onChange={e =>
                          setDraft(prev => ({ ...prev, enableQuiz: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>

                  {draft.enableQuiz && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white/80">
                          출제 문제 목록 ({draft.questions.length}개)
                        </span>
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>문제 추가</span>
                        </button>
                      </div>

                      {draft.questions.map((q, qIdx) => (
                        <div
                          key={q.id}
                          className="bg-[#210f3c] border border-white/10 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-emerald-300">
                              문제 {qIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-rose-400 hover:text-rose-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={q.question}
                            onChange={e => {
                              const val = e.target.value;
                              setDraft(prev => ({
                                ...prev,
                                questions: prev.questions.map(item =>
                                  item.id === q.id ? { ...item, question: val } : item
                                )
                              }));
                            }}
                            placeholder="문제를 입력하세요"
                            className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-sm text-white"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`flex items-center gap-2 p-2 rounded-xl border ${
                                  q.correctIndex === oIdx
                                    ? 'bg-emerald-950/40 border-emerald-500/50'
                                    : 'bg-black/20 border-white/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct_${q.id}`}
                                  checked={q.correctIndex === oIdx}
                                  onChange={() => {
                                    setDraft(prev => ({
                                      ...prev,
                                      questions: prev.questions.map(item =>
                                        item.id === q.id ? { ...item, correctIndex: oIdx } : item
                                      )
                                    }));
                                  }}
                                  className="w-4 h-4 text-emerald-500 cursor-pointer"
                                  title="정답으로 지정"
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setDraft(prev => ({
                                      ...prev,
                                      questions: prev.questions.map(item => {
                                        if (item.id !== q.id) return item;
                                        const nextOptions = [...item.options];
                                        nextOptions[oIdx] = val;
                                        return { ...item, options: nextOptions };
                                      })
                                    }));
                                  }}
                                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>

                          <input
                            type="text"
                            value={q.explanation || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setDraft(prev => ({
                                ...prev,
                                questions: prev.questions.map(item =>
                                  item.id === q.id ? { ...item, explanation: val } : item
                                )
                              }));
                            }}
                            placeholder="정답 해설 (선택 사항)"
                            className="w-full px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 text-xs text-white/70"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: HISTORY & DATA BACKUP */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Backup / Export / Import */}
                  <div className="bg-[#210f3c] border border-white/10 rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-sm text-cyan-300">
                      설정 데이터 백업 및 복원 (JSON)
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed">
                      현재 세팅한 상품 목록과 퀴즈, 머신 구성을 파일로 저장하거나 다른 컴퓨터로 옮길 수 있습니다.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => exportConfigAsJSON(draft)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span>설정 파일 다운로드 (.json)</span>
                      </button>

                      <label className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-2 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>설정 파일 불러오기</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJSON}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Draw History Log */}
                  <div className="bg-[#210f3c] border border-white/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-cyan-300">
                        당첨 내역 기록 (최근 {historyList.length}건)
                      </h4>
                      {historyList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('당첨 기록을 모두 지우시겠습니까?')) {
                              clearHistory();
                              setHistoryList([]);
                            }
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 underline"
                        >
                          기록 초기화
                        </button>
                      )}
                    </div>

                    {historyList.length === 0 ? (
                      <p className="text-xs text-white/40 py-4 text-center">
                        아직 기록된 당첨 내역이 없습니다.
                      </p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto divide-y divide-white/10 text-xs">
                        {historyList.map(rec => (
                          <div
                            key={rec.id}
                            className="py-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{rec.prizeEmoji}</span>
                              <span className="font-bold text-white">{rec.prizeName}</span>
                              {rec.playerName && (
                                <span className="text-cyan-300 font-medium">
                                  ({rec.playerName})
                                </span>
                              )}
                            </div>
                            <span className="text-white/40 font-mono text-[11px]">
                              {new Date(rec.timestamp).toLocaleTimeString('ko-KR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Save Bar */}
            <div className="px-6 py-4 bg-[#190b30] border-t border-white/10 flex items-center justify-between shrink-0">
              <span className="text-xs text-white/50">
                수정한 내용은 저장하기를 눌러야 머신에 즉시 반영됩니다.
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-[#00f5d4] to-[#38bdf8] hover:brightness-110 active:scale-98 shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>설정 저장하기</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
