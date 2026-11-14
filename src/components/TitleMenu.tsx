import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  KeyRound,
  Layers,
  Link2,
  LogIn,
  LogOut,
  Star,
  User,
  Zap,
} from 'lucide-react';
import mascotImg from '../assets/images/title_mascot_cards_1794635167863.jpg';
import { STAGES } from '../data/words';
import {
  AppScreen,
  PlayerProgress,
  ScoreLogRecord,
  StudentRecord,
} from '../types/game';
import { soundEngine } from '../utils/sound';
import { LeaderboardPanel } from './LeaderboardPanel';
import { WordIllustration } from './WordIllustration';

interface TitleMenuProps {
  progress: PlayerProgress;
  currentStudent: StudentRecord | null;
  leaderboardStudents: StudentRecord[];
  scoreLogs: ScoreLogRecord[];
  leaderboardLoading: boolean;
  leaderboardError: string | null;
  onLoginStudent: (nickname: string, passcode: string) => Promise<void>;
  onLogoutStudent: () => void;
  onStartMemoryStage: (stageId: number) => void;
  onNavigate: (screen: AppScreen) => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  progress,
  currentStudent,
  leaderboardStudents,
  scoreLogs,
  leaderboardLoading,
  leaderboardError,
  onLoginStudent,
  onLogoutStudent,
  onStartMemoryStage,
  onNavigate,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [shakeForm, setShakeForm] = useState(false);

  const totalStars = Object.values(progress.stageStars).reduce((sum, s) => sum + s, 0);
  const maxStars = STAGES.length * 3;
  const unlockedCount = progress.unlockedWordIds.length;

  const myRankIndex = currentStudent
    ? leaderboardStudents.findIndex((s) => s.id === currentStudent.id)
    : -1;
  const myLiveRecord =
    myRankIndex >= 0 ? leaderboardStudents[myRankIndex] : currentStudent;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginBusy) return;

    const trimmedNick = nicknameInput.trim();
    const trimmedCode = passcodeInput.trim();

    if (!trimmedNick) {
      soundEngine.playMismatch();
      setLoginError('내 별명을 먼저 입력해 주세요!');
      setShakeForm(true);
      window.setTimeout(() => setShakeForm(false), 400);
      return;
    }

    if (trimmedCode !== '2026') {
      soundEngine.playMismatch();
      setLoginError('비밀번호가 달라요! 2026을 입력해 보세요.');
      setShakeForm(true);
      window.setTimeout(() => setShakeForm(false), 400);
      return;
    }

    setLoginBusy(true);
    setLoginError(null);
    try {
      await onLoginStudent(trimmedNick, trimmedCode);
      soundEngine.playStageClear();
      setNicknameInput('');
      setPasscodeInput('');
    } catch (err) {
      soundEngine.playMismatch();
      setLoginError(
        err instanceof Error ? err.message : '로그인 중 문제가 생겼어요. 다시 눌러주세요.'
      );
    } finally {
      setLoginBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero 2-column split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="text-sm font-medium text-sky-700">
              초등학교 1학년 한글 놀이 · 그림과 글자 짝맞추기
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-slate-900 leading-tight text-balance">
              그림과 글자가 만나면 <span className="text-sky-600">통과!</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              별명과 비밀번호 <strong>2026</strong>으로 로그인하면 내 게임 점수가 우리 반 실시간 순위표에 바로 기록돼요.
            </p>
          </div>

          {!currentStudent ? (
            <form
              onSubmit={handleLoginSubmit}
              className={`mt-6 bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-4 ${
                shakeForm ? 'animate-shake' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-xl text-slate-900">
                  학생 로그인
                </span>
                <span className="text-xs font-bold text-sky-700">
                  비밀번호: 2026
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700">내 별명</span>
                  <div className="relative">
                    <User
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => {
                        setNicknameInput(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="예: 김민준"
                      maxLength={20}
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-white focus:border-sky-600 focus:outline-none text-base font-bold text-slate-900"
                    />
                  </div>
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700">비밀번호</span>
                  <div className="relative">
                    <KeyRound
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      value={passcodeInput}
                      onChange={(e) => {
                        setPasscodeInput(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="2026"
                      maxLength={10}
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 bg-white focus:border-sky-600 focus:outline-none text-base font-bold text-slate-900"
                    />
                  </div>
                </label>
              </div>

              {loginError && (
                <div className="text-sm font-bold text-rose-700" role="alert">
                  {loginError}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loginBusy}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 active:translate-y-0.5 text-white font-display text-xl border-b-4 border-sky-800 transition-all whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-5 h-5" aria-hidden="true" />
                  <span>{loginBusy ? '들어가는 중...' : '로그인하고 시작하기'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onStartMemoryStage(1)}
                  className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 whitespace-nowrap shrink-0 transition-colors"
                >
                  로그인 없이 연습하기
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-sky-700">
                    로그인 완료 · 실시간 점수 저장 중
                  </div>
                  <div className="font-display text-2xl text-slate-900">
                    반가워요, {currentStudent.nickname} 친구!
                  </div>
                  <div className="text-sm text-slate-600 tabular-nums">
                    {myRankIndex >= 0 ? `현재 ${myRankIndex + 1}위 · ` : ''}
                    총 점수 {(myLiveRecord?.totalScore ?? progress.totalScore).toLocaleString()}점 · 완료 {myLiveRecord?.gamesPlayed ?? 0}판
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onLogoutStudent();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>다른 친구로 바꾸기</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onStartMemoryStage(1)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:translate-y-0.5 text-white font-display text-xl border-b-4 border-sky-800 transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  <span>1단계부터 시작하기</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('COLLECTION')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-base border border-amber-200 border-b-4 border-b-amber-300 transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                >
                  <BookOpen className="w-5 h-5 text-amber-600" aria-hidden="true" />
                  <span>내 스티커 도감</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 tabular-nums">
                <span>누적 점수 {progress.totalScore.toLocaleString()}점</span>
                <span aria-hidden="true">·</span>
                <span>모은 별 {totalStars} / {maxStars}개</span>
                <span aria-hidden="true">·</span>
                <span>모은 스티커 {unlockedCount} / 30장</span>
              </div>
            </div>
          )}
        </div>

        {/* Mascot Illustration Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {!heroImgFailed ? (
            <div className="relative w-full h-full min-h-[260px]">
              <img
                src={mascotImg}
                alt="책상 위에서 사과와 강아지 그림 카드로 낱말 놀이를 하는 귀여운 아기 곰"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-sky-50 via-amber-50 to-emerald-50 p-8 flex flex-col items-center justify-center gap-4">
              <div className="grid grid-cols-2 gap-4 w-48">
                <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-center aspect-square">
                  <WordIllustration wordId="apple" className="w-16 h-16" />
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 shadow-sm flex items-center justify-center aspect-square font-display text-2xl text-slate-800">
                  사과
                </div>
              </div>
              <p className="font-display text-lg text-slate-700">그림과 글자가 짝꿍이에요!</p>
            </div>
          )}
        </div>
      </section>

      {/* Real-time Leaderboard Right on the First Screen */}
      <LeaderboardPanel
        students={leaderboardStudents}
        scoreLogs={scoreLogs}
        currentStudentId={currentStudent?.id ?? null}
        loading={leaderboardLoading}
        errorMessage={leaderboardError}
      />

      {/* 3 Playable Game Modes */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl sm:text-3xl text-slate-900">
            놀이 고르기
          </h2>
          <span className="text-sm text-slate-500">
            원하는 게임 방법을 눌러 바로 시작해 보세요
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => onStartMemoryStage(1)}
            className="text-left group bg-white hover:bg-sky-50/40 border border-slate-200 hover:border-sky-300 border-b-4 border-b-slate-300 hover:border-b-sky-400 rounded-2xl p-6 transition-all flex flex-col justify-between gap-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Layers className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-sky-700">1단계 ~ 5단계 모험</div>
                <h3 className="font-display text-2xl text-slate-900">카드 뒤집기 모험</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  파란 그림 카드 1장과 노란 글자 카드 1장을 뒤집어 짝을 맞춰요. 돋보기와 황금 카드 아이템을 쓸 수 있어요!
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm font-bold text-sky-700">
              <span>모험 떠나기</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('PLAYING_LINE')}
            className="text-left group bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 border-b-4 border-b-slate-300 hover:border-b-emerald-400 rounded-2xl p-6 transition-all flex flex-col justify-between gap-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Link2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-700">최고 {progress.bestLineWaveCleared}판 통과</div>
                <h3 className="font-display text-2xl text-slate-900">그림·글자 선 잇기</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  왼쪽의 그림과 오른쪽의 알맞은 글자를 차례로 눌러 무지개 선으로 연결하면 통과! 3단계를 모두 이어 보세요.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm font-bold text-emerald-700">
              <span>선 잇기 시작</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('PLAYING_SPEED')}
            className="text-left group bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-amber-300 border-b-4 border-b-slate-300 hover:border-b-amber-400 rounded-2xl p-6 transition-all flex flex-col justify-between gap-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Zap className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-amber-700">최고 점수 {progress.bestSpeedScore.toLocaleString()}점</div>
                <h3 className="font-display text-2xl text-slate-900">반짝반짝 스피드 퀴즈</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  60초 동안 나타나는 문제 카드에 딱 맞는 짝꿍 카드를 재빠르게 골라요. 연속 정답 시 피버 타임이 열려요!
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm font-bold text-amber-700">
              <span>도전 시작</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </button>
        </div>
      </section>

      {/* Adventure Stage Selector Strip */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl sm:text-3xl text-slate-900">
            카드 뒤집기 단계별 도전
          </h2>
          <span className="text-sm text-slate-500">
            원하는 주제를 바로 골라 연습할 수 있어요
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map((stage) => {
            const stars = progress.stageStars[stage.id] ?? 0;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onStartMemoryStage(stage.id)}
                className="text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-300 border-b-4 border-b-slate-300 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <div className="space-y-1.5">
                  <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${stage.accentBg} ${stage.accentText}`}>
                    {stage.pairCount}쌍 · 카드 {stage.pairCount * 2}장
                  </div>
                  <div className="font-display text-lg text-slate-900">{stage.title}</div>
                  <p className="text-xs text-slate-500 leading-snug">{stage.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-0.5" aria-label={`별 ${stars}개`}>
                    {[1, 2, 3].map((idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx <= stars
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-sky-700 whitespace-nowrap">도전하기</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Encouraging Footer Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-xl text-slate-900">칭찬 스티커 30장을 모두 모아 보세요!</h3>
            <p className="text-sm text-slate-600">
              어떤 게임에서든 낱말 짝꿍을 맞추면 도감에 예쁜 그림 스티커가 자동으로 저장돼요.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('COLLECTION')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold whitespace-nowrap shrink-0 transition-colors"
        >
          스티커 도감 열기
        </button>
      </section>
    </div>
  );
};
