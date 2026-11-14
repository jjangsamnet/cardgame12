import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Eye,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Volume2,
  Wand2,
} from 'lucide-react';
import { STAGES, WORDS } from '../data/words';
import { RoundStatus, WordItem } from '../types/game';
import { soundEngine } from '../utils/sound';
import { ConfettiBurst } from './ConfettiBurst';
import { WordIllustration } from './WordIllustration';

interface MemoryCard {
  uid: string;
  wordItem: WordItem;
  kind: 'picture' | 'word';
  isGolden: boolean;
  matched: boolean;
}

interface MemoryGameProps {
  stageId: number;
  onSelectStage: (stageId: number) => void;
  onBack: () => void;
  onCompleteStage: (result: {
    stageId: number;
    score: number;
    stars: number;
    unlockedIds: string[];
  }) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  stageId,
  onSelectStage,
  onBack,
  onCompleteStage,
}) => {
  const stage = useMemo(
    () => STAGES.find((s) => s.id === stageId) ?? STAGES[0],
    [stageId]
  );

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [mismatchUids, setMismatchUids] = useState<string[]>([]);
  const [hintUids, setHintUids] = useState<string[]>([]);
  const [peeking, setPeeking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hearts, setHearts] = useState(stage.maxHearts);
  const [shieldMode, setShieldMode] = useState(false); // 튼튼 모드 (하트 무제한)
  const [mistakes, setMistakes] = useState(0);

  const [peekUses, setPeekUses] = useState(2);
  const [hintUses, setHintUses] = useState(2);
  const [magicUses, setMagicUses] = useState(1);

  const [status, setStatus] = useState<RoundStatus>('PLAYING');
  const [feedbackBanner, setFeedbackBanner] = useState<{
    id: number;
    text: string;
    tone: 'success' | 'info' | 'warn';
  } | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [newlyMatchedIds, setNewlyMatchedIds] = useState<string[]>([]);

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const showBanner = useCallback(
    (text: string, tone: 'success' | 'info' | 'warn') => {
      setFeedbackBanner({ id: Date.now(), text, tone });
    },
    []
  );

  const initRound = useCallback(() => {
    clearAllTimers();
    const stageWords = shuffleArray(
      WORDS.filter((w) => w.category === stage.category)
    ).slice(0, stage.pairCount);

    const goldenWordId = stageWords[Math.floor(Math.random() * stageWords.length)]?.id;

    const deck: MemoryCard[] = [];
    stageWords.forEach((w) => {
      const isGolden = w.id === goldenWordId;
      deck.push({
        uid: `${w.id}-pic`,
        wordItem: w,
        kind: 'picture',
        isGolden,
        matched: false,
      });
      deck.push({
        uid: `${w.id}-word`,
        wordItem: w,
        kind: 'word',
        isGolden,
        matched: false,
      });
    });

    setCards(shuffleArray(deck));
    setSelectedUids([]);
    setMismatchUids([]);
    setHintUids([]);
    setPeeking(false);
    setIsLocked(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHearts(stage.maxHearts);
    setMistakes(0);
    setPeekUses(2);
    setHintUses(2);
    setMagicUses(1);
    setStatus('PLAYING');
    setFeedbackBanner(null);
    setNewlyMatchedIds([]);
  }, [clearAllTimers, stage]);

  useEffect(() => {
    initRound();
    return () => clearAllTimers();
  }, [initRound, clearAllTimers]);

  const matchedPairCount = cards.filter((c) => c.matched).length / 2;
  const totalPairCount = cards.length / 2;

  const finishStage = useCallback(
    (finalScore: number, finalMistakes: number, matchedIds: string[]) => {
      const stars =
        finalMistakes <= 1 ? 3 : finalMistakes <= 4 ? 2 : 1;
      setStatus('STAGE_CLEAR');
      soundEngine.playStageClear();
      setConfettiKey((k) => k + 1);
      onCompleteStage({
        stageId: stage.id,
        score: finalScore,
        stars,
        unlockedIds: matchedIds,
      });
    },
    [onCompleteStage, stage.id]
  );

  const resolveMatch = useCallback(
    (cardA: MemoryCard, cardB: MemoryCard, currentScore: number, currentCombo: number, currentHearts: number, currentMistakes: number) => {
      const nextCombo = currentCombo + 1;
      const basePoints = cardA.isGolden ? 200 : 100;
      const comboBonus = (nextCombo - 1) * 30;
      const gained = basePoints + comboBonus;
      const nextScore = currentScore + gained;

      setScore(nextScore);
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setHintUids([]);

      let nextHearts = currentHearts;
      if (nextCombo > 0 && nextCombo % 3 === 0 && currentHearts < stage.maxHearts) {
        nextHearts = currentHearts + 1;
        setHearts(nextHearts);
      }

      if (cardA.isGolden) {
        soundEngine.playGoldenMatch();
        showBanner(`황금 카드 통과! ${cardA.wordItem.word} +${gained}점`, 'success');
      } else if (nextCombo >= 3) {
        soundEngine.playMatch(nextCombo);
        showBanner(`${nextCombo}연속 콤보! ${cardA.wordItem.word} 통과! +${gained}점`, 'success');
      } else {
        soundEngine.playMatch(nextCombo);
        showBanner(`정답! "${cardA.wordItem.word}" 통과! +${gained}점`, 'success');
      }

      soundEngine.speakKorean(cardA.wordItem.word);
      setConfettiKey((k) => k + 1);

      const updatedMatchedIds = Array.from(
        new Set([...newlyMatchedIds, cardA.wordItem.id])
      );
      setNewlyMatchedIds(updatedMatchedIds);

      setCards((prev) => {
        const nextCards = prev.map((c) =>
          c.uid === cardA.uid || c.uid === cardB.uid ? { ...c, matched: true } : c
        );
        const allCleared = nextCards.length > 0 && nextCards.every((c) => c.matched);
        if (allCleared) {
          scheduleTimer(() => {
            finishStage(nextScore, currentMistakes, updatedMatchedIds);
          }, 550);
        }
        return nextCards;
      });

      setSelectedUids([]);
      setIsLocked(false);
    },
    [finishStage, newlyMatchedIds, scheduleTimer, showBanner, stage.maxHearts]
  );

  const handleCardClick = (card: MemoryCard) => {
    if (status !== 'PLAYING' || isLocked || peeking) return;
    if (card.matched) {
      soundEngine.playClick();
      soundEngine.speakKorean(card.wordItem.word);
      return;
    }

    if (selectedUids.includes(card.uid)) {
      soundEngine.playClick();
      setSelectedUids([]);
      return;
    }

    soundEngine.playFlip();
    if (card.kind === 'word') {
      soundEngine.speakKorean(card.wordItem.word);
    }

    if (selectedUids.length === 0) {
      setSelectedUids([card.uid]);
      showBanner(
        card.kind === 'picture'
          ? '노란 글자 카드에서 짝꿍을 찾아보세요!'
          : '파란 그림 카드에서 짝꿍을 찾아보세요!',
        'info'
      );
      return;
    }

    const firstCard = cards.find((c) => c.uid === selectedUids[0]);
    if (!firstCard) return;

    // If child clicks two of the same kind (picture+picture or word+word), switch gently instead of penalizing
    if (firstCard.kind === card.kind) {
      setSelectedUids([card.uid]);
      showBanner(
        card.kind === 'picture'
          ? '그림과 글자를 짝지어야 해요! 노란 글자 카드를 골라보세요.'
          : '그림과 글자를 짝지어야 해요! 파란 그림 카드를 골라보세요.',
        'info'
      );
      return;
    }

    const pair = [firstCard.uid, card.uid];
    setSelectedUids(pair);
    setIsLocked(true);

    if (firstCard.wordItem.id === card.wordItem.id) {
      scheduleTimer(() => {
        resolveMatch(firstCard, card, score, combo, hearts, mistakes);
      }, 280);
    } else {
      scheduleTimer(() => {
        soundEngine.playMismatch();
        setMismatchUids(pair);
        setCombo(0);
        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);

        if (!shieldMode) {
          const nextHearts = Math.max(0, hearts - 1);
          setHearts(nextHearts);
          showBanner('아쉬워요! 그림과 글자가 달라요.', 'warn');
          if (nextHearts === 0) {
            scheduleTimer(() => {
              setSelectedUids([]);
              setMismatchUids([]);
              setIsLocked(false);
              setStatus('GAME_OVER');
              soundEngine.playGameOver();
            }, 650);
            return;
          }
        } else {
          showBanner('괜찮아요! 다시 짝을 찾아볼까요?', 'warn');
        }

        scheduleTimer(() => {
          setSelectedUids([]);
          setMismatchUids([]);
          setIsLocked(false);
        }, 720);
      }, 360);
    }
  };

  // Power-up 1: Peek all cards
  const handleUsePeek = () => {
    if (peekUses <= 0 || peeking || isLocked || status !== 'PLAYING') return;
    soundEngine.playPowerup();
    setPeekUses((u) => u - 1);
    setPeeking(true);
    setSelectedUids([]);
    showBanner('돋보기 발동! 카드 위치를 기억해 보세요.', 'info');
    scheduleTimer(() => {
      setPeeking(false);
    }, 2200);
  };

  // Power-up 2: Highlight one matching pair
  const handleUseHint = () => {
    if (hintUses <= 0 || isLocked || status !== 'PLAYING') return;
    const unmatched = cards.filter((c) => !c.matched);
    if (unmatched.length < 2) return;
    const targetWordId = unmatched[0].wordItem.id;
    const pairUids = unmatched
      .filter((c) => c.wordItem.id === targetWordId)
      .map((c) => c.uid);

    soundEngine.playPowerup();
    setHintUses((u) => u - 1);
    setHintUids(pairUids);
    showBanner(`반짝이는 두 카드가 "${unmatched[0].wordItem.word}" 짝꿍이에요!`, 'info');
  };

  // Power-up 3: Magic auto-match one pair
  const handleUseMagic = () => {
    if (magicUses <= 0 || isLocked || status !== 'PLAYING') return;
    const unmatched = cards.filter((c) => !c.matched);
    if (unmatched.length < 2) return;
    const targetWordId = unmatched[0].wordItem.id;
    const pair = unmatched.filter((c) => c.wordItem.id === targetWordId);
    if (pair.length !== 2) return;

    soundEngine.playPowerup();
    setMagicUses((u) => u - 1);
    setIsLocked(true);
    setSelectedUids([pair[0].uid, pair[1].uid]);
    scheduleTimer(() => {
      resolveMatch(pair[0], pair[1], score, combo, hearts, mistakes);
    }, 350);
  };

  const firstSelectedKind =
    selectedUids.length === 1
      ? cards.find((c) => c.uid === selectedUids[0])?.kind
      : null;

  const gridColsClass =
    cards.length <= 8
      ? 'grid-cols-2 sm:grid-cols-4'
      : cards.length <= 10
      ? 'grid-cols-2 sm:grid-cols-5'
      : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';

  const earnedStars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;

  return (
    <div className="space-y-5 relative">
      <ConfettiBurst triggerKey={confettiKey} />

      {/* Top Game HUD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
              {stage.title}
            </h1>
            <div className="text-xs sm:text-sm text-slate-500 tabular-nums">
              남은 짝 {totalPairCount - matchedPairCount}쌍 · 점수 {score.toLocaleString()}점
              {combo >= 2 ? ` · ${combo}연속 콤보` : ''}
            </div>
          </div>
        </div>

        {/* Hearts & Shield Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {shieldMode ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 whitespace-nowrap">
                <Shield className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                튼튼 모드 (무제한)
              </span>
            ) : (
              <div className="flex items-center gap-1" aria-label={`남은 하트 ${hearts}개`}>
                {Array.from({ length: stage.maxHearts }).map((_, idx) => (
                  <Heart
                    key={idx}
                    className={`w-5 h-5 transition-transform ${
                      idx < hearts
                        ? 'fill-rose-500 text-rose-600 scale-100'
                        : 'fill-slate-200 text-slate-300 scale-90'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setShieldMode((prev) => !prev);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap shrink-0 ${
              shieldMode
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span>{shieldMode ? '튼튼 모드 켜짐' : '튼튼 모드'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              initRound();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>다시 섞기</span>
          </button>
        </div>
      </div>

      {/* Interactive Power-Up Bar & Helper Message */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUsePeek}
            disabled={peekUses <= 0 || peeking || status !== 'PLAYING'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-sky-50 disabled:opacity-45 border border-slate-200 border-b-3 border-b-slate-300 text-sm font-bold text-slate-800 whitespace-nowrap shrink-0 transition-all"
          >
            <Eye className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span>모두 보기 ({peekUses})</span>
          </button>

          <button
            type="button"
            onClick={handleUseHint}
            disabled={hintUses <= 0 || status !== 'PLAYING'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 disabled:opacity-45 border border-slate-200 border-b-3 border-b-slate-300 text-sm font-bold text-slate-800 whitespace-nowrap shrink-0 transition-all"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>짝꿍 힌트 ({hintUses})</span>
          </button>

          <button
            type="button"
            onClick={handleUseMagic}
            disabled={magicUses <= 0 || status !== 'PLAYING'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 disabled:opacity-45 border border-slate-200 border-b-3 border-b-slate-300 text-sm font-bold text-slate-800 whitespace-nowrap shrink-0 transition-all"
          >
            <Wand2 className="w-4 h-4 text-purple-600" aria-hidden="true" />
            <span>마법 짝꿍 ({magicUses})</span>
          </button>
        </div>

        {/* Live Friendly Prompt */}
        <div
          className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
            feedbackBanner?.tone === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : feedbackBanner?.tone === 'warn'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          {feedbackBanner?.text ??
            '파란 그림 카드 1장과 노란 글자 카드 1장을 골라 짝을 맞춰 보세요!'}
        </div>
      </div>

      {/* Card Table Playfield */}
      <div className="bg-slate-200/60 border border-slate-200 rounded-3xl p-4 sm:p-6">
        <div className={`grid ${gridColsClass} gap-3 sm:gap-4`}>
          {cards.map((card) => {
            const isFlipped =
              card.matched || peeking || selectedUids.includes(card.uid);
            const isMismatched = mismatchUids.includes(card.uid);
            const isHinted = hintUids.includes(card.uid) && !card.matched;
            const isPartnerSuggested =
              firstSelectedKind !== null &&
              card.kind !== firstSelectedKind &&
              !card.matched &&
              !isFlipped;

            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleCardClick(card)}
                aria-label={
                  isFlipped
                    ? card.kind === 'picture'
                      ? `${card.wordItem.word} 그림 카드`
                      : `${card.wordItem.word} 글자 카드`
                    : card.kind === 'picture'
                    ? '뒤집힌 그림 카드'
                    : '뒤집힌 글자 카드'
                }
                className={`card-perspective aspect-[4/4.6] w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                  isMismatched ? 'animate-shake' : ''
                } ${card.matched ? 'animate-match-pop' : ''}`}
              >
                <div className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                  {/* Card Back */}
                  <div
                    className={`card-face rounded-2xl border-2 border-b-[6px] flex flex-col items-center justify-center gap-2 p-3 transition-shadow ${
                      card.kind === 'picture'
                        ? 'bg-sky-500 border-sky-700 text-white'
                        : 'bg-amber-400 border-amber-600 text-amber-950'
                    } ${
                      isHinted
                        ? 'ring-4 ring-emerald-400 shadow-lg'
                        : isPartnerSuggested
                        ? 'ring-4 ring-white/80 shadow-md'
                        : 'shadow-sm hover:brightness-105'
                    }`}
                  >
                    {card.isGolden && (
                      <Sparkles
                        className="w-4 h-4 opacity-90"
                        aria-hidden="true"
                      />
                    )}
                    {card.kind === 'picture' ? (
                      <>
                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6" aria-hidden="true" />
                        </div>
                        <span className="font-display text-lg sm:text-xl">그림</span>
                      </>
                    ) : (
                      <>
                        <div className="w-11 h-11 rounded-xl bg-white/35 flex items-center justify-center font-display text-2xl">
                          가
                        </div>
                        <span className="font-display text-lg sm:text-xl">글자</span>
                      </>
                    )}
                  </div>

                  {/* Card Front */}
                  <div
                    className={`card-face card-face-front rounded-2xl border-2 border-b-[6px] p-3 flex flex-col items-center justify-between transition-colors ${
                      card.matched
                        ? 'bg-emerald-50 border-emerald-500'
                        : isMismatched
                        ? 'bg-rose-50 border-rose-400'
                        : card.isGolden
                        ? 'bg-amber-50 border-amber-400'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] font-bold">
                      <span
                        className={
                          card.kind === 'picture' ? 'text-sky-600' : 'text-amber-600'
                        }
                      >
                        {card.kind === 'picture' ? '그림' : '글자'}
                      </span>
                      {card.matched ? (
                        <span className="text-emerald-700">통과!</span>
                      ) : card.isGolden ? (
                        <span className="text-amber-600">황금×2</span>
                      ) : (
                        <span aria-hidden="true" />
                      )}
                    </div>

                    {card.kind === 'picture' ? (
                      <div
                        className="w-full flex-1 rounded-xl flex items-center justify-center p-2 my-1"
                        style={{ backgroundColor: card.wordItem.bgTint }}
                      >
                        <WordIllustration
                          wordId={card.wordItem.id}
                          className="w-20 h-20 sm:w-24 sm:h-24"
                        />
                      </div>
                    ) : (
                      <div className="w-full flex-1 flex flex-col items-center justify-center gap-2 my-1">
                        <div className="font-display text-3xl sm:text-4xl text-slate-900 tracking-wide">
                          {card.wordItem.word}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Volume2 className="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
                          <span>누르면 소리나요</span>
                        </div>
                      </div>
                    )}

                    <div className="h-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Clear / Game Over Modal Overlay */}
      {status !== 'PLAYING' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-7 text-center space-y-6 shadow-xl">
            {status === 'STAGE_CLEAR' ? (
              <>
                <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Award className="w-9 h-9" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-bold text-emerald-700">
                    {stage.title} 통과!
                  </div>
                  <h2 className="font-display text-3xl text-slate-900">
                    참 잘했어요!
                  </h2>
                  <p className="text-sm text-slate-600">
                    모든 그림과 글자 짝꿍을 멋지게 맞췄어요.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2" aria-label={`별 ${earnedStars}개`}>
                  {[1, 2, 3].map((idx) => (
                    <Star
                      key={idx}
                      className={`w-10 h-10 ${
                        idx <= earnedStars
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-slate-100 text-slate-200'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center tabular-nums">
                  <div>
                    <div className="text-xs text-slate-500">얻은 점수</div>
                    <div className="font-display text-xl text-slate-900">
                      {score.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">최고 콤보</div>
                    <div className="font-display text-xl text-sky-600">
                      {maxCombo}연속
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">새 스티커</div>
                    <div className="font-display text-xl text-emerald-600">
                      {newlyMatchedIds.length}장
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      initRound();
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm whitespace-nowrap"
                  >
                    한 번 더 하기
                  </button>
                  {stage.id < STAGES.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onSelectStage(stage.id + 1);
                      }}
                      className="flex-1 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-display text-lg border-b-4 border-sky-800 whitespace-nowrap"
                    >
                      다음 단계 ({stage.id + 1}단계)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onBack();
                      }}
                      className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display text-lg border-b-4 border-emerald-800 whitespace-nowrap"
                    >
                      홈으로 돌아가기
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Heart className="w-8 h-8" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-3xl text-slate-900">
                    조금만 더 힘내요!
                  </h2>
                  <p className="text-sm text-slate-600">
                    하트를 모두 썼어요. 튼튼 모드를 켜면 하트 걱정 없이 천천히 풀 수 있어요!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setShieldMode(true);
                      initRound();
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm border-b-4 border-emerald-800 whitespace-nowrap"
                  >
                    튼튼 모드로 다시 하기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      initRound();
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm border-b-4 border-sky-800 whitespace-nowrap"
                  >
                    다시 도전하기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
