import { useCallback, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import firebaseConfig from '../firebase-applet-config.json';
import { LineMatchGame } from './components/LineMatchGame';
import { MemoryGame } from './components/MemoryGame';
import { SpeedQuizGame } from './components/SpeedQuizGame';
import { StickerAlbum } from './components/StickerAlbum';
import { TitleMenu } from './components/TitleMenu';
import {
  CLASS_PASSCODE,
  loginStudent,
  recordGameResult,
  subscribeLeaderboard,
  subscribeScoreLogs,
} from './services/leaderboardService';
import {
  AppScreen,
  PlayerProgress,
  ScoreLogRecord,
  StudentRecord,
} from './types/game';
import { soundEngine } from './utils/sound';

const PROGRESS_STORAGE_KEY = 'smart_word_match_progress_v1';
const STUDENT_STORAGE_KEY = 'smart_word_match_student_v1';

const DEFAULT_PROGRESS: PlayerProgress = {
  totalScore: 0,
  stageStars: {},
  unlockedWordIds: ['apple', 'puppy', 'sun'],
  bestSpeedScore: 0,
  bestLineWaveCleared: 0,
};

function loadProgress(): PlayerProgress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : 0,
      stageStars: parsed.stageStars ?? {},
      unlockedWordIds: Array.isArray(parsed.unlockedWordIds)
        ? parsed.unlockedWordIds
        : DEFAULT_PROGRESS.unlockedWordIds,
      bestSpeedScore: typeof parsed.bestSpeedScore === 'number' ? parsed.bestSpeedScore : 0,
      bestLineWaveCleared:
        typeof parsed.bestLineWaveCleared === 'number' ? parsed.bestLineWaveCleared : 0,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function loadSavedStudentSession(): { nickname: string } | null {
  try {
    const raw = window.localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { nickname?: string };
    if (typeof parsed.nickname === 'string' && parsed.nickname.trim()) {
      return { nickname: parsed.nickname.trim() };
    }
    return null;
  } catch {
    return null;
  }
}

function formatFirestoreErrorForUser(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Free daily read units per project')) {
    const upgradeUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;
    return `오늘의 무료 데이터베이스 읽기 한도를 초과했습니다. 내일 초기화되며, 업그레이드하려면 ${upgradeUrl} 을 확인해 주세요.`;
  }
  if (msg.includes('Quota exceeded')) {
    return '데이터베이스 일일 사용 한도를 초과했습니다. 내일 다시 이용해 주세요.';
  }
  return '실시간 순위표 연결을 확인하는 중이에요. 잠시 후 다시 시도해 주세요.';
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('TITLE_MENU');
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress);
  const [soundOn, setSoundOn] = useState(true);

  const [currentStudent, setCurrentStudent] = useState<StudentRecord | null>(null);
  const [leaderboardStudents, setLeaderboardStudents] = useState<StudentRecord[]>([]);
  const [scoreLogs, setScoreLogs] = useState<ScoreLogRecord[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  useEffect(() => {
    soundEngine.sfxEnabled = soundOn;
    soundEngine.voiceEnabled = soundOn;
  }, [soundOn]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota issues
    }
  }, [progress]);

  // Restore saved student session silently on boot
  useEffect(() => {
    const saved = loadSavedStudentSession();
    if (!saved) return;
    loginStudent(saved.nickname, CLASS_PASSCODE)
      .then((student) => {
        setCurrentStudent(student);
        setProgress((prev) => ({
          ...prev,
          totalScore: student.totalScore,
          bestSpeedScore: student.bestSpeedScore,
          bestLineWaveCleared: student.bestLineWaveCleared,
        }));
      })
      .catch(() => {
        window.localStorage.removeItem(STUDENT_STORAGE_KEY);
      });
  }, []);

  // Real-time Firestore leaderboard & score logs listeners
  useEffect(() => {
    const unsubStudents = subscribeLeaderboard(
      (rows) => {
        setLeaderboardStudents(rows);
        setLeaderboardLoading(false);
        setLeaderboardError(null);
      },
      (err) => {
        setLeaderboardLoading(false);
        setLeaderboardError(formatFirestoreErrorForUser(err));
      }
    );

    const unsubLogs = subscribeScoreLogs(
      (rows) => {
        setScoreLogs(rows);
      },
      () => {
        // Ignore non-critical log listener failure when main leaderboard already reports error
      }
    );

    return () => {
      unsubStudents();
      unsubLogs();
    };
  }, []);

  const handleLoginStudent = useCallback(
    async (nickname: string, passcode: string) => {
      const student = await loginStudent(nickname, passcode);
      setCurrentStudent(student);
      try {
        window.localStorage.setItem(
          STUDENT_STORAGE_KEY,
          JSON.stringify({ nickname: student.nickname })
        );
      } catch {
        // Ignore storage error
      }
      setProgress({
        totalScore: student.totalScore,
        stageStars: {},
        unlockedWordIds: DEFAULT_PROGRESS.unlockedWordIds,
        bestSpeedScore: student.bestSpeedScore,
        bestLineWaveCleared: student.bestLineWaveCleared,
      });
    },
    []
  );

  const handleLogoutStudent = useCallback(() => {
    setCurrentStudent(null);
    setProgress(DEFAULT_PROGRESS);
    try {
      window.localStorage.removeItem(STUDENT_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }, []);

  const navigate = useCallback((nextScreen: AppScreen) => {
    soundEngine.playClick();
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStartMemoryStage = useCallback((stageId: number) => {
    soundEngine.playClick();
    setActiveStageId(stageId);
    setScreen('PLAYING_MEMORY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const syncScoreToCloud = useCallback(
    async (params: {
      mode: 'memory' | 'line' | 'speed';
      gainedScore: number;
      stageId: number;
      nextProgress: PlayerProgress;
    }) => {
      if (!currentStudent) return;
      const totalStars = Object.values(params.nextProgress.stageStars).reduce(
        (sum, s) => sum + s,
        0
      );
      try {
        const updated = await recordGameResult({
          studentId: currentStudent.id,
          nickname: currentStudent.nickname,
          mode: params.mode,
          gainedScore: params.gainedScore,
          stageId: params.stageId,
          totalStars,
          unlockedCount: params.nextProgress.unlockedWordIds.length,
          bestSpeedScore: params.nextProgress.bestSpeedScore,
          bestLineWaveCleared: params.nextProgress.bestLineWaveCleared,
        });
        if (updated) {
          setCurrentStudent(updated);
        }
      } catch (err) {
        setLeaderboardError(formatFirestoreErrorForUser(err));
      }
    },
    [currentStudent]
  );

  const handleCompleteMemoryStage = useCallback(
    ({
      stageId,
      score,
      stars,
      unlockedIds,
    }: {
      stageId: number;
      score: number;
      stars: number;
      unlockedIds: string[];
    }) => {
      setProgress((prev) => {
        const nextProgress: PlayerProgress = {
          ...prev,
          totalScore: prev.totalScore + score,
          stageStars: {
            ...prev.stageStars,
            [stageId]: Math.max(prev.stageStars[stageId] ?? 0, stars),
          },
          unlockedWordIds: Array.from(
            new Set([...prev.unlockedWordIds, ...unlockedIds])
          ),
        };
        void syncScoreToCloud({
          mode: 'memory',
          gainedScore: score,
          stageId,
          nextProgress,
        });
        return nextProgress;
      });
    },
    [syncScoreToCloud]
  );

  const handleCompleteLineRound = useCallback(
    ({
      score,
      wavesCleared,
      unlockedIds,
    }: {
      score: number;
      wavesCleared: number;
      unlockedIds: string[];
    }) => {
      setProgress((prev) => {
        const nextProgress: PlayerProgress = {
          ...prev,
          totalScore: prev.totalScore + score,
          bestLineWaveCleared: Math.max(prev.bestLineWaveCleared, wavesCleared),
          unlockedWordIds: Array.from(
            new Set([...prev.unlockedWordIds, ...unlockedIds])
          ),
        };
        void syncScoreToCloud({
          mode: 'line',
          gainedScore: score,
          stageId: wavesCleared,
          nextProgress,
        });
        return nextProgress;
      });
    },
    [syncScoreToCloud]
  );

  const handleCompleteSpeedRound = useCallback(
    ({ score, unlockedIds }: { score: number; unlockedIds: string[] }) => {
      setProgress((prev) => {
        const nextProgress: PlayerProgress = {
          ...prev,
          totalScore: prev.totalScore + score,
          bestSpeedScore: Math.max(prev.bestSpeedScore, score),
          unlockedWordIds: Array.from(
            new Set([...prev.unlockedWordIds, ...unlockedIds])
          ),
        };
        void syncScoreToCloud({
          mode: 'speed',
          gainedScore: score,
          stageId: 0,
          nextProgress,
        });
        return nextProgress;
      });
    },
    [syncScoreToCloud]
  );

  const handleToggleSound = () => {
    const next = !soundOn;
    soundEngine.sfxEnabled = next;
    soundEngine.voiceEnabled = next;
    setSoundOn(next);
    if (next) {
      soundEngine.playClick();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-slate-900">
      {/* Three-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => navigate('TITLE_MENU')}
            className="font-display text-xl sm:text-2xl text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-700 transition-colors"
          >
            똑똑 낱말 짝꿍
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
            <button
              type="button"
              onClick={() => navigate('TITLE_MENU')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                screen === 'TITLE_MENU'
                  ? 'text-sky-700 border-sky-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              홈 · 순위표
            </button>
            <button
              type="button"
              onClick={() => handleStartMemoryStage(activeStageId)}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                screen === 'PLAYING_MEMORY'
                  ? 'text-sky-700 border-sky-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              카드 뒤집기
            </button>
            <button
              type="button"
              onClick={() => navigate('PLAYING_LINE')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                screen === 'PLAYING_LINE'
                  ? 'text-sky-700 border-sky-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              선 잇기
            </button>
            <button
              type="button"
              onClick={() => navigate('PLAYING_SPEED')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                screen === 'PLAYING_SPEED'
                  ? 'text-sky-700 border-sky-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              스피드 퀴즈
            </button>
            <button
              type="button"
              onClick={() => navigate('COLLECTION')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                screen === 'COLLECTION'
                  ? 'text-sky-700 border-sky-600'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              스티커 도감
            </button>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleToggleSound}
              aria-pressed={soundOn}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors whitespace-nowrap shrink-0 ${
                soundOn
                  ? 'bg-sky-600 hover:bg-sky-700 text-white border-sky-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {soundOn ? (
                <>
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  <span>소리 켜짐</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" aria-hidden="true" />
                  <span>소리 꺼짐</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {screen === 'TITLE_MENU' && (
          <TitleMenu
            progress={progress}
            currentStudent={currentStudent}
            leaderboardStudents={leaderboardStudents}
            scoreLogs={scoreLogs}
            leaderboardLoading={leaderboardLoading}
            leaderboardError={leaderboardError}
            onLoginStudent={handleLoginStudent}
            onLogoutStudent={handleLogoutStudent}
            onStartMemoryStage={handleStartMemoryStage}
            onNavigate={navigate}
          />
        )}

        {screen === 'PLAYING_MEMORY' && (
          <MemoryGame
            stageId={activeStageId}
            onSelectStage={(nextId) => setActiveStageId(nextId)}
            onBack={() => navigate('TITLE_MENU')}
            onCompleteStage={handleCompleteMemoryStage}
          />
        )}

        {screen === 'PLAYING_LINE' && (
          <LineMatchGame
            onBack={() => navigate('TITLE_MENU')}
            onCompleteRound={handleCompleteLineRound}
          />
        )}

        {screen === 'PLAYING_SPEED' && (
          <SpeedQuizGame
            onBack={() => navigate('TITLE_MENU')}
            onCompleteRound={handleCompleteSpeedRound}
          />
        )}

        {screen === 'COLLECTION' && (
          <StickerAlbum
            unlockedWordIds={progress.unlockedWordIds}
            onBack={() => navigate('TITLE_MENU')}
          />
        )}
      </main>
    </div>
  );
}
