import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, Lock, Volume2 } from 'lucide-react';
import { CATEGORY_LABELS, WORDS } from '../data/words';
import { WordCategory } from '../types/game';
import { soundEngine } from '../utils/sound';
import { WordIllustration } from './WordIllustration';

interface StickerAlbumProps {
  unlockedWordIds: string[];
  onBack: () => void;
}

const CATEGORIES: WordCategory[] = ['fruit', 'animal', 'nature', 'vehicle', 'school'];

export const StickerAlbum: React.FC<StickerAlbumProps> = ({
  unlockedWordIds,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | WordCategory>('all');
  const [previewAll, setPreviewAll] = useState(false);

  const visibleWords =
    selectedCategory === 'all'
      ? WORDS
      : WORDS.filter((w) => w.category === selectedCategory);

  const handleCardTap = (wordText: string, unlocked: boolean) => {
    if (!unlocked && !previewAll) {
      soundEngine.playMismatch();
      return;
    }
    soundEngine.playClick();
    soundEngine.speakKorean(wordText);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onBack();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>홈으로</span>
            </button>
            <h1 className="font-display text-2xl sm:text-3xl text-slate-900">
              내 칭찬 스티커 도감
            </h1>
          </div>
          <p className="text-sm text-slate-600 tabular-nums">
            모은 스티커 {unlockedWordIds.length} / {WORDS.length}장 · 카드를 누르면 낱말 소리를 들을 수 있어요
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setPreviewAll((prev) => !prev);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors whitespace-nowrap shrink-0 ${
            previewAll
              ? 'bg-sky-600 text-white border-sky-700'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
          <span>{previewAll ? '모은 스티커만 보기' : '모든 낱말 미리보기'}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 w-fit">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setSelectedCategory('all');
          }}
          className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-sky-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          전체 30장
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setSelectedCategory(cat);
            }}
            className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Sticker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {visibleWords.map((item) => {
          const isUnlocked = unlockedWordIds.includes(item.id);
          const isVisible = isUnlocked || previewAll;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCardTap(item.word, isUnlocked)}
              className={`rounded-2xl p-4 border transition-all flex flex-col items-center justify-between gap-2.5 text-center min-h-[175px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                isVisible
                  ? 'bg-white border-slate-200 hover:border-sky-300 border-b-4 border-b-slate-300 shadow-sm active:translate-y-0.5'
                  : 'bg-slate-100/80 border-slate-200 text-slate-400'
              }`}
            >
              <div className="w-full flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium truncate">
                  {CATEGORY_LABELS[item.category]}
                </span>
                {isUnlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-label="모은 스티커" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-label="잠김" />
                )}
              </div>

              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center p-2"
                style={{ backgroundColor: isVisible ? item.bgTint : '#E2E8F0' }}
              >
                {isVisible ? (
                  <WordIllustration wordId={item.id} className="w-16 h-16" />
                ) : (
                  <span className="font-display text-3xl text-slate-400">?</span>
                )}
              </div>

              <div className="w-full flex items-center justify-center gap-1.5">
                <span className="font-display text-xl text-slate-900">
                  {isVisible ? item.word : '???'}
                </span>
                {isVisible && (
                  <Volume2 className="w-4 h-4 text-sky-600 shrink-0" aria-hidden="true" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
