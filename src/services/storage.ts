import { MachineConfig, MachineTheme, DrawRecord } from '../types';

export const THEMES: Record<string, MachineTheme> = {
  neon: {
    id: 'neon',
    name: '사이버 네온 (Cyber Neon)',
    cabinetBg: '#130826',
    accentColor: '#ff2a85',
    accentSecondary: '#00f5d4',
    glowColor: 'rgba(255, 42, 133, 0.45)',
    glassTint: 'rgba(18, 6, 36, 0.65)',
    chuteColor: '#3a0ca3'
  },
  pastel: {
    id: 'pastel',
    name: '파스텔 드림 (Pastel Dream)',
    cabinetBg: '#1e1b2e',
    accentColor: '#f472b6',
    accentSecondary: '#38bdf8',
    glowColor: 'rgba(244, 114, 182, 0.4)',
    glassTint: 'rgba(30, 27, 46, 0.65)',
    chuteColor: '#818cf8'
  },
  retro: {
    id: 'retro',
    name: '클래식 카니발 (Classic Arcade)',
    cabinetBg: '#1c1917',
    accentColor: '#f59e0b',
    accentSecondary: '#ef4444',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    glassTint: 'rgba(28, 25, 23, 0.7)',
    chuteColor: '#b45309'
  },
  emerald: {
    id: 'emerald',
    name: '레트로 게임보이 (Mint Emerald)',
    cabinetBg: '#062c26',
    accentColor: '#10b981',
    accentSecondary: '#a7f3d0',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    glassTint: 'rgba(6, 44, 38, 0.7)',
    chuteColor: '#047857'
  }
};

export const DEFAULT_CONFIG: MachineConfig = {
  title: '🎓 학교 퀴즈 인형뽑기',
  subtitle: '정답을 맞히고 행운의 선물 뽑기에 도전해보세요!',
  adminPassword: '1234',
  requirePassword: true,
  theme: 'neon',
  controlMode: 'manual', // 'manual' (joystick/buttons) or 'auto'
  gripStrength: 'guaranteed', // 'guaranteed', 'high', 'thrill'
  enableQuiz: false, // Default direct draw like original, or toggle on for interactive quiz!
  quizCoinsReward: 1,
  prizes: [
    { id: '1', name: '문화상품권 5천원', count: 3, initialCount: 3, emoji: '🎟️', color: '#ffd166', tier: 'grand' },
    { id: '2', name: '고급 캐릭터 인형', count: 6, initialCount: 6, emoji: '🧸', color: '#ff2a85', tier: 'first' },
    { id: '3', name: '스낵 과자 종합세트', count: 10, initialCount: 10, emoji: '🍫', color: '#06d6a0', tier: 'second' },
    { id: '4', name: '시원한 음료수 쿠폰', count: 15, initialCount: 15, emoji: '🥤', color: '#118ab2', tier: 'third' },
    { id: '5', name: '비밀의 행운 캡슐', count: 12, initialCount: 12, emoji: '⭐', color: '#7209b7', tier: 'lucky' },
    { id: '6', name: '꽝 (달콤한 츄파춥스 사탕)', count: 25, initialCount: 25, emoji: '🍭', color: '#ef476f', tier: 'consolation' }
  ],
  questions: [
    {
      id: 'q1',
      question: '우리나라의 수도는 어디일까요?',
      options: ['서울', '부산', '제주', '대전'],
      correctIndex: 0,
      explanation: '대한민국의 수도는 서울특별시입니다.'
    },
    {
      id: 'q2',
      question: '지구에서 가장 넓은 바다는 어느 바다일까요?',
      options: ['대서양', '인도양', '태평양', '북극해'],
      correctIndex: 2,
      explanation: '태평양은 지구 전체 해양 면적의 약 46%를 차지합니다.'
    },
    {
      id: 'q3',
      question: '식물이 햇빛과 물을 이용해 영양분을 만드는 과정을 무엇이라 할까요?',
      options: ['광합성', '호흡', '증산작용', '발효'],
      correctIndex: 0,
      explanation: '빛에너지를 화학에너지로 바꾸는 광합성 작용입니다.'
    }
  ]
};

export const PRESETS: { id: string; name: string; description: string; config: Partial<MachineConfig> }[] = [
  {
    id: 'school_quiz',
    name: '🏫 학교 퀴즈 대회 세트',
    description: '문화상품권, 인형, 간식 등 학교 퀴즈 보상에 최적화된 구성',
    config: {
      title: '🎓 학교 퀴즈 인형뽑기',
      subtitle: '정답을 맞히고 행운의 선물을 뽑아보세요!',
      prizes: [
        { id: '1', name: '문화상품권 5,000원', count: 3, initialCount: 3, emoji: '🎟️', color: '#ffd166', tier: 'grand' },
        { id: '2', name: '포근한 미니 인형', count: 6, initialCount: 6, emoji: '🧸', color: '#ff2a85', tier: 'first' },
        { id: '3', name: '과자 세트 박스', count: 10, initialCount: 10, emoji: '🍫', color: '#06d6a0', tier: 'second' },
        { id: '4', name: '매점 간식 쿠폰', count: 15, initialCount: 15, emoji: '🥤', color: '#118ab2', tier: 'third' },
        { id: '5', name: '예쁜 캐릭터 볼펜', count: 15, initialCount: 15, emoji: '✏️', color: '#7209b7', tier: 'lucky' },
        { id: '6', name: '꽝! 달콤한 사탕 1개', count: 25, initialCount: 25, emoji: '🍬', color: '#ef476f', tier: 'consolation' }
      ]
    }
  },
  {
    id: 'festival_booth',
    name: '🎪 학교 축제 / 부스 세트',
    description: '축제 부스 운영에 맞춘 풍성한 간식과 기념품 뽑기',
    config: {
      title: '🎪 축제 부스 행운 인형뽑기',
      subtitle: '동전을 넣고 짜릿한 손맛을 느껴보세요!',
      theme: 'neon',
      prizes: [
        { id: '1', name: '대형 곰인형 (1등)', count: 2, initialCount: 2, emoji: '👑', color: '#ffd166', tier: 'grand' },
        { id: '2', name: '피자/치킨 교환권', count: 4, initialCount: 4, emoji: '🍕', color: '#ff2a85', tier: 'first' },
        { id: '3', name: '보조배터리 / 키링', count: 8, initialCount: 8, emoji: '⚡', color: '#06d6a0', tier: 'second' },
        { id: '4', name: '아이스크림 교환권', count: 20, initialCount: 20, emoji: '🍦', color: '#118ab2', tier: 'third' },
        { id: '5', name: '귀여운 스티커 팩', count: 25, initialCount: 25, emoji: '✨', color: '#7209b7', tier: 'lucky' },
        { id: '6', name: '추억의 쫀드기', count: 35, initialCount: 35, emoji: '🍿', color: '#ef476f', tier: 'consolation' }
      ]
    }
  },
  {
    id: 'classroom_praise',
    name: '⭐ 우리 반 칭찬 도장 뽑기',
    description: '칭찬 도장/쿠폰으로 자유이용권, 자리선택권 등을 뽑는 학급용',
    config: {
      title: '⭐ 우리 반 칭찬 보상 뽑기',
      subtitle: '열심히 참여한 당신, 멋진 보상을 뽑아보세요!',
      theme: 'pastel',
      prizes: [
        { id: '1', name: '원하는 자리 1일 선택권', count: 3, initialCount: 3, emoji: '🪑', color: '#ffd166', tier: 'grand' },
        { id: '2', name: '숙제 1회 면제 쿠폰', count: 5, initialCount: 5, emoji: '🎫', color: '#f472b6', tier: 'first' },
        { id: '3', name: '선생님과 1:1 보드게임권', count: 6, initialCount: 6, emoji: '🎲', color: '#38bdf8', tier: 'second' },
        { id: '4', name: '급식 1등 출발권', count: 10, initialCount: 10, emoji: '🍱', color: '#10b981', tier: 'third' },
        { id: '5', name: '예쁜 젤펜 선물', count: 15, initialCount: 15, emoji: '🖊️', color: '#a855f7', tier: 'lucky' },
        { id: '6', name: '하이파이브 & 비타민 캔디', count: 25, initialCount: 25, emoji: '🍬', color: '#fb7185', tier: 'consolation' }
      ]
    }
  }
];

const CONFIG_KEY = 'claw_machine_config_v2';
const HISTORY_KEY = 'claw_machine_history_v2';

export function loadConfig(): MachineConfig {
  try {
    // Check old storage key from user's original HTML if available
    const oldPrizes = localStorage.getItem('quiz_prizes');
    const saved = localStorage.getItem(CONFIG_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }

    if (oldPrizes) {
      try {
        const raw = JSON.parse(oldPrizes);
        if (Array.isArray(raw) && raw.length > 0) {
          const colors = ['#ffd166', '#ff2a85', '#06d6a0', '#118ab2', '#7209b7', '#ef476f'];
          const emojis = ['🎁', '🧸', '🍫', '🥤', '⭐', '🍭'];
          const convertedPrizes = raw.map((item, idx) => ({
            id: `imported_${idx}`,
            name: item.name || `상품 ${idx + 1}`,
            count: typeof item.count === 'number' ? item.count : 5,
            initialCount: typeof item.count === 'number' ? item.count : 5,
            emoji: emojis[idx % emojis.length],
            color: colors[idx % colors.length],
            tier: (idx === 0 ? 'grand' : idx === 1 ? 'first' : idx === 2 ? 'second' : idx < 4 ? 'third' : 'consolation') as any
          }));
          return {
            ...DEFAULT_CONFIG,
            prizes: convertedPrizes
          };
        }
      } catch {}
    }
  } catch (e) {
    console.error('Error loading config', e);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: MachineConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    // Also sync to old format key so any external references remain compatible
    const legacy = config.prizes.map(p => ({ name: p.name, count: p.count }));
    localStorage.setItem('quiz_prizes', JSON.stringify(legacy));
  } catch (e) {
    console.error('Error saving config', e);
  }
}

export function loadHistory(): DrawRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryRecord(record: Omit<DrawRecord, 'id' | 'timestamp'>): DrawRecord {
  const fullRecord: DrawRecord = {
    ...record,
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now()
  };
  try {
    const list = loadHistory();
    const updated = [fullRecord, ...list].slice(0, 100); // keep recent 100
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
  return fullRecord;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export function exportConfigAsJSON(config: MachineConfig): void {
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `claw-machine-config-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
