import { signInAnonymously } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { ScoreLogRecord, StudentRecord } from '../types/game';

export const CLASS_PASSCODE = '2026';

export function toStudentId(nickname: string): string {
  const clean = nickname.trim().slice(0, 20);
  const bytes = new TextEncoder().encode(clean);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `stu_${hex}`.slice(0, 128);
}

function toMillis(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'toMillis' in val && typeof (val as { toMillis: () => number }).toMillis === 'function') {
    return (val as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

function clampInt(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(val)));
}

export async function loginStudent(
  rawNickname: string,
  rawPasscode: string
): Promise<StudentRecord> {
  const nickname = rawNickname.trim().slice(0, 20);
  const passcode = rawPasscode.trim();

  if (!nickname) {
    throw new Error('별명을 입력해 주세요.');
  }
  if (passcode !== CLASS_PASSCODE) {
    throw new Error('비밀번호가 달라요. 2026을 입력해 주세요!');
  }

  // Attempt optional anonymous auth if enabled in Firebase Console
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch {
      // Proceed cleanly with classroom passcode validation when anonymous provider is off
    }
  }

  const studentId = toStudentId(nickname);
  const path = `students/${studentId}`;
  const studentRef = doc(db, 'students', studentId);

  let snap;
  try {
    snap = await getDoc(studentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (snap.exists()) {
    const data = snap.data();
    return {
      id: snap.id,
      nickname: String(data.nickname ?? nickname),
      classCode: String(data.classCode ?? CLASS_PASSCODE),
      totalScore: Number(data.totalScore ?? 0),
      bestSpeedScore: Number(data.bestSpeedScore ?? 0),
      bestLineWaveCleared: Number(data.bestLineWaveCleared ?? 0),
      totalStars: Number(data.totalStars ?? 0),
      unlockedCount: Number(data.unlockedCount ?? 0),
      gamesPlayed: Number(data.gamesPlayed ?? 0),
      lastMode: String(data.lastMode ?? 'ready'),
      createdAtMs: toMillis(data.createdAt),
      updatedAtMs: toMillis(data.updatedAt),
    };
  }

  const initialPayload = {
    nickname,
    classCode: CLASS_PASSCODE,
    totalScore: 0,
    bestSpeedScore: 0,
    bestLineWaveCleared: 0,
    totalStars: 0,
    unlockedCount: 3,
    gamesPlayed: 0,
    lastMode: 'ready',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(studentRef, initialPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return {
    id: studentId,
    nickname,
    classCode: CLASS_PASSCODE,
    totalScore: 0,
    bestSpeedScore: 0,
    bestLineWaveCleared: 0,
    totalStars: 0,
    unlockedCount: 3,
    gamesPlayed: 0,
    lastMode: 'ready',
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
  };
}

export async function recordGameResult(params: {
  studentId: string;
  nickname: string;
  mode: 'memory' | 'line' | 'speed';
  gainedScore: number;
  stageId: number;
  totalStars: number;
  unlockedCount: number;
  bestSpeedScore: number;
  bestLineWaveCleared: number;
}): Promise<StudentRecord | null> {
  const { studentId, nickname, mode, gainedScore, stageId } = params;
  const safeNickname = nickname.trim().slice(0, 20);
  const safeScore = clampInt(gainedScore, 0, 100000);
  const safeStageId = clampInt(stageId, 0, 5);
  const path = `students/${studentId}`;
  const studentRef = doc(db, 'students', studentId);

  let snap;
  try {
    snap = await getDoc(studentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!snap.exists()) {
    const newRecord = {
      nickname: safeNickname,
      classCode: CLASS_PASSCODE,
      totalScore: clampInt(safeScore, 0, 10000000),
      bestSpeedScore: clampInt(params.bestSpeedScore, 0, 1000000),
      bestLineWaveCleared: clampInt(params.bestLineWaveCleared, 0, 10),
      totalStars: clampInt(params.totalStars, 0, 15),
      unlockedCount: clampInt(params.unlockedCount, 0, 30),
      gamesPlayed: 1,
      lastMode: mode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(studentRef, newRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    const existing = snap.data();
    const nextTotalScore = clampInt(
      Number(existing.totalScore ?? 0) + safeScore,
      0,
      10000000
    );
    const nextBestSpeed = clampInt(
      Math.max(Number(existing.bestSpeedScore ?? 0), params.bestSpeedScore),
      0,
      1000000
    );
    const nextBestLine = clampInt(
      Math.max(Number(existing.bestLineWaveCleared ?? 0), params.bestLineWaveCleared),
      0,
      10
    );
    const nextStars = clampInt(
      Math.max(Number(existing.totalStars ?? 0), params.totalStars),
      0,
      15
    );
    const nextUnlocked = clampInt(
      Math.max(Number(existing.unlockedCount ?? 0), params.unlockedCount),
      0,
      30
    );
    const nextGamesPlayed = clampInt(Number(existing.gamesPlayed ?? 0) + 1, 1, 100000);

    try {
      await updateDoc(studentRef, {
        totalScore: nextTotalScore,
        bestSpeedScore: nextBestSpeed,
        bestLineWaveCleared: nextBestLine,
        totalStars: nextStars,
        unlockedCount: nextUnlocked,
        gamesPlayed: nextGamesPlayed,
        lastMode: mode,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  // Also record score log
  try {
    await addDoc(collection(db, 'scoreLogs'), {
      studentId,
      nickname: safeNickname,
      classCode: CLASS_PASSCODE,
      mode,
      score: safeScore,
      stageId: safeStageId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'scoreLogs');
  }

  let updatedSnap;
  try {
    updatedSnap = await getDoc(studentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (!updatedSnap.exists()) return null;
  const d = updatedSnap.data();
  return {
    id: updatedSnap.id,
    nickname: String(d.nickname ?? safeNickname),
    classCode: String(d.classCode ?? CLASS_PASSCODE),
    totalScore: Number(d.totalScore ?? 0),
    bestSpeedScore: Number(d.bestSpeedScore ?? 0),
    bestLineWaveCleared: Number(d.bestLineWaveCleared ?? 0),
    totalStars: Number(d.totalStars ?? 0),
    unlockedCount: Number(d.unlockedCount ?? 0),
    gamesPlayed: Number(d.gamesPlayed ?? 0),
    lastMode: String(d.lastMode ?? mode),
    createdAtMs: toMillis(d.createdAt),
    updatedAtMs: toMillis(d.updatedAt),
  };
}

export function subscribeLeaderboard(
  onData: (students: StudentRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'students';
  const q = query(
    collection(db, path),
    where('classCode', '==', CLASS_PASSCODE),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: StudentRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          nickname: String(data.nickname ?? ''),
          classCode: String(data.classCode ?? CLASS_PASSCODE),
          totalScore: Number(data.totalScore ?? 0),
          bestSpeedScore: Number(data.bestSpeedScore ?? 0),
          bestLineWaveCleared: Number(data.bestLineWaveCleared ?? 0),
          totalStars: Number(data.totalStars ?? 0),
          unlockedCount: Number(data.unlockedCount ?? 0),
          gamesPlayed: Number(data.gamesPlayed ?? 0),
          lastMode: String(data.lastMode ?? 'ready'),
          createdAtMs: toMillis(data.createdAt),
          updatedAtMs: toMillis(data.updatedAt),
        };
      });

      rows.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
        return a.createdAtMs - b.createdAtMs;
      });

      onData(rows);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function subscribeScoreLogs(
  onData: (logs: ScoreLogRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'scoreLogs';
  const q = query(
    collection(db, path),
    where('classCode', '==', CLASS_PASSCODE),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const rows: ScoreLogRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        const rawMode = String(data.mode ?? 'memory');
        const mode: 'memory' | 'line' | 'speed' =
          rawMode === 'line' || rawMode === 'speed' ? rawMode : 'memory';

        return {
          id: d.id,
          studentId: String(data.studentId ?? ''),
          nickname: String(data.nickname ?? ''),
          mode,
          score: Number(data.score ?? 0),
          stageId: Number(data.stageId ?? 0),
          createdAtMs: toMillis(data.createdAt),
        };
      });

      rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
      onData(rows);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}
