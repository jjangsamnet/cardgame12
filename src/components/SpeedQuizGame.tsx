import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Flame,
  HelpCircle,
  RotateCcw,
  Scissors,
  SkipForward,
  Trophy,
  Volume2,
} from 'lucide-react';
import { WORDS } from '../data/words';
import { RoundStatus, WordItem } from '../types/game';
import { soundEngine } from '../utils/sound';
import { ConfettiBurst } from './ConfettiBurst';
import { WordIllustration } from './WordIllustration';

interface SpeedQuizGameProps {
  onBack: () => void;
  onCompleteRound: (result: { score: number; unlockedIds: string[] }) => void;
}

interface QuizQuestion {
  target: WordItem;
  mode: 'pic-to-word' | 'word-to-pic';
  choices: WordItem[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createQuestion(prevTargetId?: string): QuizQuestion {
  const pool = prevTargetId ? WORDS.filter((w) => w.id !== prevTargetId) : WORDS;
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffleArray(WORDS.filter((w) => w.id !== target.id)).slice(0, 3);
  const choices = shuffleArray([target, ...distractors]);
  const mode = Math.random() < 0.5 ? 'pic-to-word' : 'word-to-pic';
  return { target, mode, choices };
}

export const SpeedQuizGame: React.FC<SpeedQuizGameProps> = ({
  onBack,
  onCompleteRound,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [question, setQuestion] = useState<QuizQuestion>(() => createQuestion());
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feverLeft, setFeverLeft] = useState(0);

  const [timeBoostUses, setTimeBoostUses] = useState(2);
  const [splitUses, setSplitUses] = useState(2);
  const [skipUses, setSkipUses] = useState(2);

  const [hiddenChoiceIds, setHiddenChoiceIds] = useState<string[]>([]);
  const [showClue, setShowClue] = useState(false);
  const [wrongChoiceId, setWrongChoiceId] = useState<string | null>(null);
  const [status, setStatus] = useState<RoundStatus>('PLAYING');
  const [confettiKey, setConfettiKey] = useState(0);
  const [unlockedThisRun, setUnlockedThisRun] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('문제를 보고 알맞은 짝꿍 카드를 눌러 통과하세요!');

  const finishQuiz = useCallback(
    (finalScore: number, unlocked: string[]) => {
      setStatus('STAGE_CLEAR');
      soundEngine.playStageClear();
      onCompleteRound({ score: finalScore, unlockedIds: unlocked });
    },
    [onCompleteRound]
  );

  useEffect(() => {
    if (status !== 'PLAYING') return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
      setFeverLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (timeLeft === 0 && status === 'PLAYING') {
      finishQuiz(score, unlockedThisRun);
    }
  }, [finishQuiz, score, status, timeLeft, unlockedThisRun]);

  const resetQuiz = () => {
    setTimeLeft(60);
    setQuestion(createQuestion());
    setScore(0);
    setCorrectCount(0);
    setCombo(0);
    setMaxCombo(0);
    setFeverLeft(0);
    setTimeBoostUses(2);
    setSplitUses(2);
    setSkipUses(2);
    setHiddenChoiceIds([]);
    setShowClue(false);
    setWrongChoiceId(null);
    setStatus('PLAYING');
    setUnlockedThisRun([]);
    setFeedback('문제를 보고 알맞은 짝꿍 카드를 눌러 통과하세요!');
  };

  const handleChoiceTap = (choice: WordItem) => {
    if (status !== 'PLAYING' || hiddenChoiceIds.includes(choice.id)) return;

    if (choice.id === question.target.id) {
      const nextCombo = combo + 1;
      const isFever = feverLeft > 0 || nextCombo >= 4;
      if (nextCombo === 4 && feverLeft === 0) {
        setFeverLeft(8);
        soundEngine.playFever();
      } else {
        soundEngine.playMatch(nextCombo);
      }

      const multiplier = isFever ? 2 : 1;
      const gained = (100 + (nextCombo - 1) * 20) * multiplier;
      const nextScore = score + gained;

      setScore(nextScore);
      setCorrectCount((c) => c + 1);
      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));
      setUnlockedThisRun((prev) => Array.from(new Set([...prev, choice.id])));
      setConfettiKey((k) => k + 1);
      soundEngine.speakKorean(choice.word);

      setFeedback(
        isFever
          ? `피버 2배! "${choice.word}" 통과! +${gained}점`
          : `통과! "${choice.word}" 정답! +${gained}점`
      );

      setHiddenChoiceIds([]);
      setShowClue(false);
      setWrongChoiceId(null);
      setQuestion(createQuestion(question.target.id));
    } else {
      soundEngine.playMismatch();
      setCombo(0);
      setFeverLeft(0);
      setWrongChoiceId(choice.id);
      setFeedback('앗, 다른 낱말이에요! 다시 골라 보세요.');
      window.setTimeout(() => setWrongChoiceId(null), 400);
    }
  };

  const handleAddTime = () => {
    if (timeBoostUses <= 0 || status !== 'PLAYING') return;
    soundEngine.playPowerup();
    setTimeBoostUses((u) => u - 1);
    setTimeLeft((t) => t + 10);
    setFeedback('시간 모래시계! +10초가 늘어났어요.');
  };

  const handleSplitHalf = () => {
    if (splitUses <= 0 || status !== 'PLAYING' || hiddenChoiceIds.length > 0) return;
    soundEngine.playPowerup();
    const wrongChoices = question.choices
      .filter((c) => c.id !== question.target.id)
      .slice(0, 2)
      .map((c) => c.id);
    setSplitUses((u) => u - 1);
    setHiddenChoiceIds(wrongChoices);
    setFeedback('카드 2장을 치웠어요! 남은 카드 중에 정답이 있어요.');
  };

  const handleSkip = () => {
    if (skipUses <= 0 || status !== 'PLAYING') return;
    soundEngine.playFlip();
    setSkipUses((u) => u - 1);
    setHiddenChoiceIds([]);
    setShowClue(false);
    setQuestion(createQuestion(question.target.id));
    setFeedback('새로운 문제로 넘어왔어요!');
  };

  const isFeverActive = feverLeft > 0;

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
              반짝반짝 스피드 퀴즈
            </h1>
            <div className="text-xs sm:text-sm text-slate-500 tabular-nums">
              점수 {score.toLocaleString()}점 · 통과 {correctCount}개 · {combo}연속 콤보
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isFeverActive && (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-sm font-bold tabular-nums whitespace-nowrap">
              <Flame className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>피버 2배 · {feverLeft}초</span>
            </div>
          )}

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-base font-display tabular-nums whitespace-nowrap ${
              timeLeft <= 10
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}
          >
            <Clock className="w-5 h-5" aria-hidden="true" />
            <span>{timeLeft}초</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              resetQuiz();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>다시 시작</span>
          </button>
        </div>
      </div>

      {/* Power-up Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddTime}
            disabled={timeBoostUses <= 0 || status !== 'PLAYING'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-sky-50 disabled:opacity-45 border border-slate-200 border-b-3 border-b-slate-300 text-sm font-bold text-slate-800 whitespace-nowrap shrink-0"
          >
            <Clock className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span>시간 +10초 ({timeBoostUses})</span>
          </button>

          <button
            type="button"
            onClick={handleSplitHalf}
            disabled={splitUses <= 0 || hiddenChoiceIds.length > 0 || status !== 'PLAYING'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-amber-50 disabled:opacity-45 border border-slate-200 border-b-3 border-b-slate-300 text-sm font-bold text-slate-800 whitespace-nowrap shrink-0"
          >
            <Scissors className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <span>반 줄이기 ({splitUses})</span>
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={skipUses <= 0 || status !== 'PLAYING'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 disabled:opacity-45 border border-slate-200 border-b-3 border-b-slate-300 text-sm font-bold text-slate-800 whitespace-nowrap shrink-0"
          >
            <SkipForward className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>문제 바꾸기 ({skipUses})</span>
          </button>
        </div>

        <div className="text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2">
          {feedback}
        </div>
      </div>

      {/* Main Quiz Arena */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition-colors ${
          isFeverActive
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Target Card */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-bold text-slate-500">
              {question.mode === 'pic-to-word'
                ? '이 그림에 알맞은 글자 카드를 고르세요!'
                : '이 글자에 알맞은 그림 카드를 고르세요!'}
            </div>

            <div className="w-56 sm:w-64 rounded-3xl bg-white border-2 border-slate-300 border-b-[6px] p-6 flex flex-col items-center justify-center gap-3 shadow-sm">
              {question.mode === 'pic-to-word' ? (
                <div
                  className="w-36 h-36 rounded-2xl flex items-center justify-center p-3"
                  style={{ backgroundColor: question.target.bgTint }}
                >
                  <WordIllustration wordId={question.target.id} className="w-28 h-28" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => soundEngine.speakKorean(question.target.word)}
                  className="py-8 flex flex-col items-center gap-2 group"
                >
                  <span className="font-display text-5xl text-slate-900">
                    {question.target.word}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600">
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    소리 듣기
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowClue((s) => !s);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-sky-700"
              >
                <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{showClue ? question.target.hint : '설명 힌트 보기'}</span>
              </button>
            </div>
          </div>

          {/* 4 Candidate Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {question.choices.map((choice) => {
              const isHidden = hiddenChoiceIds.includes(choice.id);
              const isWrong = wrongChoiceId === choice.id;

              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={isHidden}
                  onClick={() => handleChoiceTap(choice)}
                  className={`rounded-2xl p-4 border-2 border-b-[6px] min-h-[140px] flex flex-col items-center justify-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                    isHidden
                      ? 'opacity-20 bg-slate-100 border-slate-200 cursor-not-allowed'
                      : isWrong
                      ? 'animate-shake bg-rose-50 border-rose-400'
                      : 'bg-white border-slate-200 hover:border-sky-400 hover:-translate-y-0.5 active:translate-y-0.5 shadow-sm'
                  }`}
                >
                  {question.mode === 'pic-to-word' ? (
                    <span className="font-display text-3xl text-slate-900">
                      {choice.word}
                    </span>
                  ) : (
                    <div
                      className="w-24 h-24 rounded-xl flex items-center justify-center p-2"
                      style={{ backgroundColor: choice.bgTint }}
                    >
                      <WordIllustration wordId={choice.id} className="w-20 h-20" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Up / Summary Modal */}
      {status === 'STAGE_CLEAR' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-7 text-center space-y-6 shadow-xl">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Trophy className="w-9 h-9" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-bold text-amber-700">60초 스피드 퀴즈 끝!</div>
              <h2 className="font-display text-3xl text-slate-900">대단해요!</h2>
              <p className="text-sm text-slate-600">
                제한 시간 동안 빠르게 그림과 글자를 맞혔어요.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-3 gap-2 tabular-nums">
              <div>
                <div className="text-xs text-slate-500">최종 점수</div>
                <div className="font-display text-xl text-slate-900">
                  {score.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">맞힌 카드</div>
                <div className="font-display text-xl text-sky-600">{correctCount}장</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">최고 콤보</div>
                <div className="font-display text-xl text-emerald-600">{maxCombo}연속</div>
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
                  resetQuiz();
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-display text-lg border-b-4 border-amber-700 whitespace-nowrap"
              >
                한 번 더 도전!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
