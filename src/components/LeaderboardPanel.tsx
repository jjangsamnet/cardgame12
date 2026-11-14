import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Crown, Medal, Search, Star, Trophy } from 'lucide-react';
import { ScoreLogRecord, StudentRecord } from '../types/game';
import { soundEngine } from '../utils/sound';

interface LeaderboardPanelProps {
  students: StudentRecord[];
  scoreLogs: ScoreLogRecord[];
  currentStudentId: string | null;
  loading: boolean;
  errorMessage: string | null;
}

const MODE_LABELS: Record<ScoreLogRecord['mode'], string> = {
  memory: '카드 뒤집기',
  line: '선 잇기',
  speed: '스피드 퀴즈',
};

function formatRelativeTime(ms: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  students,
  scoreLogs,
  currentStudentId,
  loading,
  errorMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.nickname.toLowerCase().includes(q));
  }, [searchQuery, students]);

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    students.forEach((s, index) => {
      map.set(s.id, index + 1);
    });
    return map;
  }, [students]);

  const handleToggleStudent = (studentId: string) => {
    soundEngine.playClick();
    setExpandedStudentId((prev) => (prev === studentId ? null : studentId));
  };

  return (
    <section
      className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5"
      aria-labelledby="leaderboard-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500 shrink-0" aria-hidden="true" />
            <h2 id="leaderboard-heading" className="font-display text-2xl sm:text-3xl text-slate-900">
              우리 반 실시간 순위표
            </h2>
          </div>
          <p className="text-sm text-slate-600 tabular-nums">
            참여 학생 {students.length}명 · 게임이 끝나면 점수가 바로 올라가요 · 이름을 누르면 상세 점수를 볼 수 있어요
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 별명 검색"
            maxLength={20}
            aria-label="학생 별명 검색"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none text-sm text-slate-900"
          />
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : loading ? (
        <div className="py-10 text-center text-sm text-slate-500">
          실시간 순위표를 불러오는 중이에요...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center space-y-2">
          <div className="font-display text-xl text-slate-800">
            아직 등록된 친구가 없어요!
          </div>
          <p className="text-sm text-slate-600">
            위에서 별명과 비밀번호 <strong>2026</strong>을 입력하고 첫 번째 1등 주인공이 되어 보세요.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          "{searchQuery}" 별명을 가진 친구를 찾지 못했어요.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
          {filteredStudents.map((student) => {
            const rank = rankMap.get(student.id) ?? 0;
            const isMe = student.id === currentStudentId;
            const isExpanded = expandedStudentId === student.id;
            const studentLogs = scoreLogs
              .filter((l) => l.studentId === student.id)
              .slice(0, 5);

            return (
              <div
                key={student.id}
                className={isMe ? 'bg-sky-50/60' : 'bg-white'}
              >
                <button
                  type="button"
                  onClick={() => handleToggleStudent(student.id)}
                  aria-expanded={isExpanded}
                  className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-display text-lg shrink-0 tabular-nums ${
                        rank === 1
                          ? 'bg-amber-400 text-amber-950'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : rank === 3
                          ? 'bg-orange-300 text-orange-950'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rank === 1 ? (
                        <Crown className="w-5 h-5" aria-label="1등" />
                      ) : rank === 2 || rank === 3 ? (
                        <Medal className="w-5 h-5" aria-label={`${rank}등`} />
                      ) : (
                        rank
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg sm:text-xl text-slate-900 truncate">
                          {student.nickname}
                        </span>
                        {isMe && (
                          <span className="text-xs font-bold text-sky-700 whitespace-nowrap shrink-0">
                            · 나
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{rank}위</span>
                        <span aria-hidden="true">·</span>
                        <span>게임 {student.gamesPlayed}판</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" aria-hidden="true" />
                          {student.totalStars}개
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>스티커 {student.unlockedCount}/30</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right tabular-nums">
                      <div className="font-display text-xl sm:text-2xl text-slate-900">
                        {student.totalScore.toLocaleString()}점
                      </div>
                      <div className="text-xs text-slate-500">
                        스피드 최고 {student.bestSpeedScore.toLocaleString()}점
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-4 pt-1 bg-slate-50/70 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-600 mb-2">
                      {student.nickname} 친구의 최근 게임 기록
                    </div>
                    {studentLogs.length === 0 ? (
                      <div className="text-xs text-slate-500 py-1">
                        아직 완료한 게임 기록이 없어요. 첫 판을 완료해 보세요!
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {studentLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 tabular-nums"
                          >
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="font-bold">{MODE_LABELS[log.mode]}</span>
                              {log.stageId > 0 && (
                                <span className="text-slate-500">· {log.stageId}단계</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sky-700">
                                +{log.score.toLocaleString()}점
                              </span>
                              <span className="text-slate-400">
                                {formatRelativeTime(log.createdAtMs)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
