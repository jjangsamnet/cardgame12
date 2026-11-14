import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { WORDS } from '../data/words';
import { RoundStatus, WordItem } from '../types/game';
import { soundEngine } from '../utils/sound';
import { ConfettiBurst } from './ConfettiBurst';
import { WordIllustration } from './WordIllustration';

interface LineMatchGameProps {
  onBack: () => void;
  onCompleteRound: (result: {
    score: number;
    wavesCleared: number;
    unlockedIds: string[];
  }) => void;
}

interface LineCoord {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const WAVE_COUNTS = [4, 5, 6];
const LINE_COLORS = ['#0284C7', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const LineMatchGame: React.FC<LineMatchGameProps> = ({
  onBack,
  onCompleteRound,
}) => {
  const [waveIndex, setWaveIndex] = useState(0);
  const [leftItems, setLeftItems] = useState<WordItem[]>([]);
  const [rightItems, setRightItems] = useState<WordItem[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [hintId, setHintId] = useState<string | null>(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hintUses, setHintUses] = useState(2);
  const [status, setStatus] = useState<RoundStatus>('PLAYING');
  const [confettiKey, setConfettiKey] = useState(0);
  const [unlockedThisRun, setUnlockedThisRun] = useState<string[]>([]);
  const [bannerText, setBannerText] = useState('왼쪽 그림과 오른쪽 글자를 차례로 눌러 선을 이어 보세요!');

  const boardRef = useRef<HTMLDivElement | null>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [lines, setLines] = useState<LineCoord[]>([]);

  const setupWave = useCallback((wIdx: number) => {
    const pairCount = WAVE_COUNTS[wIdx] ?? 4;
    const chosen = shuffleArray(WORDS).slice(0, pairCount);
    setLeftItems(chosen);
    setRightItems(shuffleArray(chosen));
    setMatchedIds([]);
    setSelectedLeftId(null);
    setSelectedRightId(null);
    setWrongPair(null);
    setHintId(null);
    setLines([]);
    setBannerText(`${wIdx + 1}단계! 그림과 알맞은 글자를 연결해 보세요.`);
  }, []);

  const resetGame = useCallback(() => {
    setWaveIndex(0);
    setScore(0);
    setCombo(0);
    setHintUses(2);
    setStatus('PLAYING');
    setUnlockedThisRun([]);
    setupWave(0);
  }, [setupWave]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const recomputeLines = useCallback(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();

    const nextLines: LineCoord[] = [];
    matchedIds.forEach((id, idx) => {
      const lEl = leftRefs.current[id];
      const rEl = rightRefs.current[id];
      if (!lEl || !rEl) return;

      const lRect = lEl.getBoundingClientRect();
      const rRect = rEl.getBoundingClientRect();

      nextLines.push({
        id,
        x1: lRect.right - boardRect.left,
        y1: lRect.top + lRect.height / 2 - boardRect.top,
        x2: rRect.left - boardRect.left,
        y2: rRect.top + rRect.height / 2 - boardRect.top,
        color: LINE_COLORS[idx % LINE_COLORS.length],
      });
    });

    setLines(nextLines);
  }, [matchedIds]);

  useLayoutEffect(() => {
    recomputeLines();
    window.addEventListener('resize', recomputeLines);
    return () => window.removeEventListener('resize', recomputeLines);
  }, [recomputeLines, leftItems, rightItems]);

  const tryMatch = useCallback(
    (leftId: string, rightId: string) => {
      if (leftId === rightId) {
        const matchedWord = leftItems.find((w) => w.id === leftId);
        const nextMatched = [...matchedIds, leftId];
        const nextCombo = combo + 1;
        const gained = 100 + (nextCombo - 1) * 25;
        const nextScore = score + gained;
        const nextUnlocked = Array.from(new Set([...unlockedThisRun, leftId]));

        setMatchedIds(nextMatched);
        setSelectedLeftId(null);
        setSelectedRightId(null);
        setHintId(null);
        setCombo(nextCombo);
        setScore(nextScore);
        setUnlockedThisRun(nextUnlocked);
        setConfettiKey((k) => k + 1);

        soundEngine.playMatch(nextCombo);
        if (matchedWord) {
          soundEngine.speakKorean(matchedWord.word);
          setBannerText(`통과! "${matchedWord.word}" 선 잇기 성공! +${gained}점`);
        }

        if (nextMatched.length === leftItems.length) {
          if (waveIndex + 1 < WAVE_COUNTS.length) {
            window.setTimeout(() => {
              const nextWave = waveIndex + 1;
              setWaveIndex(nextWave);
              setupWave(nextWave);
              soundEngine.playPowerup();
            }, 850);
          } else {
            window.setTimeout(() => {
              setStatus('STAGE_CLEAR');
              soundEngine.playStageClear();
              onCompleteRound({
                score: nextScore,
                wavesCleared: WAVE_COUNTS.length,
                unlockedIds: nextUnlocked,
              });
            }, 700);
          }
        }
      } else {
        soundEngine.playMismatch();
        setCombo(0);
        setWrongPair({ left: leftId, right: rightId });
        setBannerText('앗, 서로 다른 낱말이에요! 다시 이어 볼까요?');
        window.setTimeout(() => {
          setWrongPair(null);
          setSelectedLeftId(null);
          setSelectedRightId(null);
        }, 550);
      }
    },
    [combo, leftItems, matchedIds, onCompleteRound, score, setupWave, unlockedThisRun, waveIndex]
  );

  const handleSelectLeft = (id: string) => {
    if (status !== 'PLAYING' || matchedIds.includes(id) || wrongPair) return;
    soundEngine.playSelect();
    if (selectedRightId) {
      tryMatch(id, selectedRightId);
    } else {
      setSelectedLeftId((prev) => (prev === id ? null : id));
    }
  };

  const handleSelectRight = (item: WordItem) => {
    if (status !== 'PLAYING' || matchedIds.includes(item.id) || wrongPair) return;
    soundEngine.playSelect();
    soundEngine.speakKorean(item.word);
    if (selectedLeftId) {
      tryMatch(selectedLeftId, item.id);
    } else {
      setSelectedRightId((prev) => (prev === item.id ? null : item.id));
    }
  };

  const handleUseHint = () => {
    if (hintUses <= 0 || status !== 'PLAYING') return;
    const remaining = leftItems.find((w) => !matchedIds.includes(w.id));
    if (!remaining) return;
    soundEngine.playPowerup();
    setHintUses((u) => u - 1);
    setHintId(remaining.id);
    setBannerText(`반짝이는 "${remaining.word}" 그림과 글자를 연결해 보세요!`);
  };

  return (
    <div className="space-y-5 relative">
      <ConfettiBurst triggerKey={confettiKey} />

      {/* Top HUD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>홈으로</span>
          </button>

          <div>
            <h1 className="font-display text-xl sm:text-2xl text-slate-900">
              그림·글자 선 잇기
            </h1>
            <div className="text-xs sm:text-sm text-slate-500 tabular-nums">
              {waveIndex + 1} / {WAVE_COUNTS.length}단계 · 점수 {score.toLocaleString()}점
              {combo >= 2 ? ` · ${combo}연속 콤보` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseHint}
            disabled={hintUses <= 0 || status !== 'PLAYING'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 disabled:opacity-45 text-amber-900 border border-amber-200 text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
          >
            <Lightbulb className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <span>힌트 ({hintUses})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              resetGame();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>처음부터</span>
          </button>
        </div>
      </div>

      {/* Prompt Bar */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-900 text-center">
        {bannerText}
      </div>

      {/* Line-Connect Playboard */}
      <div
        ref={boardRef}
        className="relative bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-sm"
      >
        {/* SVG Connection Layer */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full z-10"
          aria-hidden="true"
        >
          {lines.map((line) => {
            const dx = (line.x2 - line.x1) * 0.5;
            const path = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${line.x2 - dx} ${line.y2}, ${line.x2} ${line.y2}`;
            return (
              <g key={line.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <circle cx={line.x1} cy={line.y1} r="6" fill={line.color} />
                <circle cx={line.x2} cy={line.y2} r="6" fill={line.color} />
              </g>
            );
          })}
        </svg>

        <div className="relative z-20 grid grid-cols-2 gap-10 sm:gap-24 md:gap-36">
          {/* Left Column: Picture Cards */}
          <div className="space-y-3">
            <div className="text-center font-display text-lg text-sky-700">그림 카드</div>
            {leftItems.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedLeftId === item.id;
              const isWrong = wrongPair?.left === item.id;
              const isHinted = hintId === item.id && !isMatched;

              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    leftRefs.current[item.id] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectLeft(item.id)}
                  className={`w-full rounded-2xl p-3 sm:p-4 border-2 border-b-4 transition-all flex items-center justify-center gap-3 min-h-[84px] sm:min-h-[96px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                    isWrong ? 'animate-shake bg-rose-50 border-rose-400' : ''
                  } ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400'
                      : isSelected
                      ? 'bg-sky-50 border-sky-500 ring-4 ring-sky-200'
                      : isHinted
                      ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-200'
                      : 'bg-white border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center p-1.5 shrink-0"
                    style={{ backgroundColor: item.bgTint }}
                  >
                    <WordIllustration wordId={item.id} className="w-12 h-12 sm:w-14 sm:h-14" />
                  </div>
                  {isMatched && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" aria-label="연결 완료" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Word Cards */}
          <div className="space-y-3">
            <div className="text-center font-display text-lg text-amber-700">글자 카드</div>
            {rightItems.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedRightId === item.id;
              const isWrong = wrongPair?.right === item.id;
              const isHinted = hintId === item.id && !isMatched;

              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    rightRefs.current[item.id] = el;
                  }}
                  type="button"
                  onClick={() => handleSelectRight(item)}
                  className={`w-full rounded-2xl p-3 sm:p-4 border-2 border-b-4 transition-all flex items-center justify-center gap-2.5 min-h-[84px] sm:min-h-[96px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                    isWrong ? 'animate-shake bg-rose-50 border-rose-400' : ''
                  } ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-400'
                      : isSelected
                      ? 'bg-amber-50 border-amber-500 ring-4 ring-amber-200'
                      : isHinted
                      ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-200'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <span className="font-display text-2xl sm:text-3xl text-slate-900">
                    {item.word}
                  </span>
                  <Volume2 className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      {status === 'STAGE_CLEAR' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-7 text-center space-y-6 shadow-xl">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Award className="w-9 h-9" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-bold text-emerald-700">3단계 모두 연결 성공!</div>
              <h2 className="font-display text-3xl text-slate-900">선 잇기 대장!</h2>
              <p className="text-sm text-slate-600">
                모든 그림과 글자를 정확하게 찾아 연결했어요.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 gap-3 tabular-nums">
              <div>
                <div className="text-xs text-slate-500">총 점수</div>
                <div className="font-display text-2xl text-slate-900">
                  {score.toLocaleString()}점
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">모은 스티커</div>
                <div className="font-display text-2xl text-emerald-600">
                  {unlockedThisRun.length}장
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onBack();
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm whitespace-nowrap"
              >
                홈으로
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  resetGame();
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display text-lg border-b-4 border-emerald-800 whitespace-nowrap"
              >
                다시 선 잇기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
