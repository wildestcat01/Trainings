import { useMemo, useState } from 'react';
import {
  X,
  Trophy,
  Award,
  Users,
  Target,
  Medal,
  BookOpen,
  PlayCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { SessionReviewModal } from './SessionReviewModal';

interface BatchInsightsProps {
  batchId: string;
  onClose: () => void;
}

interface LeaderboardEntry {
  employee_id: string;
  employee_name: string;
  designation: string;
  completed_count: number;
  total_count: number;
  avg_score: number;
  progress_percentage: number;
  total_time: number;
  rank: number;
  latestSession: {
    moduleTitle: string;
    moduleCategory?: string;
    completedAt: string | null;
    testScore: number | null;
    progressPercentage: number;
  } | null;
}

export const BatchInsights = ({ batchId, onClose }: BatchInsightsProps) => {
  const { batches, employees, batchEmployees, batchModules, employeeProgress, modules } = useData();
  const batch = batches.find((item) => item.id === batchId);
  const [selectedSession, setSelectedSession] = useState<{
    moduleTitle: string;
    moduleCategory?: string;
    employeeName: string;
    teamName: string;
    completedAt?: string | null;
    testScore?: number | null;
    progressPercentage: number;
  } | null>(null);

  const moduleMap = useMemo(() => {
    return modules.reduce<Record<string, { title: string; category: string }>>((acc, module) => {
      acc[module.id] = {
        title: module.sub_module_title,
        category: module.module_name,
      };
      return acc;
    }, {});
  }, [modules]);

  const { leaderboard, stats } = useMemo(() => {
    const assignedEmployees = batchEmployees.filter((entry) => entry.batch_id === batchId);
    const assignedModules = batchModules.filter((entry) => entry.batch_id === batchId);
    const totalModules = assignedModules.length;

    const entries: LeaderboardEntry[] = assignedEmployees.map((assignment) => {
      const employee = employees.find((item) => item.id === assignment.employee_id);
      const progressRecords = employeeProgress.filter(
        (record) => record.batch_id === batchId && record.employee_id === assignment.employee_id
      );

      const completedCount = progressRecords.filter((record) => record.status === 'completed').length;
      const totalCount = progressRecords.length;
      const testsCompleted = progressRecords.filter((record) => record.test_status === 'completed');
      const avgScore =
        testsCompleted.length > 0
          ? Math.round(
              testsCompleted.reduce((sum, record) => sum + (record.test_score ?? 0), 0) /
                testsCompleted.length
            )
          : 0;

      const avgProgress =
        totalCount > 0
          ? Math.round(
              progressRecords.reduce((sum, record) => sum + record.progress_percentage, 0) / totalCount
            )
          : 0;

      const totalTime = completedCount * 45;

      const completedSessions = progressRecords
        .filter((record) => record.status === 'completed')
        .map((record) => ({
          moduleTitle: moduleMap[record.module_id]?.title ?? 'Completed Module',
          moduleCategory: moduleMap[record.module_id]?.category,
          completedAt: record.completed_at ?? null,
          testScore: record.test_score ?? null,
          progressPercentage: record.progress_percentage,
        }))
        .sort((a, b) => {
          if (!a.completedAt) return 1;
          if (!b.completedAt) return -1;
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        });

      return {
        employee_id: employee?.employee_id ?? assignment.employee_id,
        employee_name: employee?.name ?? 'Employee',
        designation: employee?.designation ?? 'Team Member',
        completed_count: completedCount,
        total_count: totalCount,
        avg_score: avgScore,
        progress_percentage: avgProgress,
        total_time: totalTime,
        rank: 0,
        latestSession: completedSessions[0] ?? null,
      };
    });

    entries.sort((a, b) => {
      if (b.completed_count !== a.completed_count) return b.completed_count - a.completed_count;
      if (b.avg_score !== a.avg_score) return b.avg_score - a.avg_score;
      return b.progress_percentage - a.progress_percentage;
    });

    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const averageCompletion =
      entries.length > 0
        ? Math.round(
            entries.reduce((sum, entry) => sum + (entry.progress_percentage || 0), 0) / entries.length
          )
        : 0;

    const averageScore =
      entries.length > 0
        ? Math.round(entries.reduce((sum, entry) => sum + entry.avg_score, 0) / entries.length)
        : 0;

    return {
      leaderboard: entries,
      stats: {
        totalEmployees: entries.length,
        avgCompletion: averageCompletion,
        avgScore: averageScore,
        totalModules,
      },
    };
  }, [batchEmployees, batchModules, employeeProgress, employees, batchId, moduleMap]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    }
    if (rank === 2) {
      return { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' };
    }
    if (rank === 3) {
      return { icon: Medal, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    }
    return { icon: Award, color: 'text-slate-400', bg: 'bg-white', border: 'border-slate-200' };
  };

  const formatTime = (minutes: number) => {
    if (minutes <= 0) return '—';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!batch) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div>
            <h2 className="text-2xl font-bold mb-1">{batch.title}</h2>
            <p className="text-blue-100 text-sm">Team Performance & Leaderboard</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase">Trainees</span>
              </div>
              <div className="text-3xl font-bold text-blue-900">{stats.totalEmployees}</div>
              <div className="text-sm text-blue-700 mt-1">Total Enrolled</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase">Completion</span>
              </div>
              <div className="text-3xl font-bold text-green-900">{stats.avgCompletion}%</div>
              <div className="text-sm text-green-700 mt-1">Average Progress</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase">Score</span>
              </div>
              <div className="text-3xl font-bold text-purple-900">{stats.avgScore}%</div>
              <div className="text-sm text-purple-700 mt-1">Average Assessment</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase">Modules</span>
              </div>
              <div className="text-3xl font-bold text-orange-900">{stats.totalModules}</div>
              <div className="text-sm text-orange-700 mt-1">Assigned</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
              <h3 className="text-lg font-semibold text-slate-900">Leaderboard</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Modules Done
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Time Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Session Review
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((entry) => {
                    const badge = getRankBadge(entry.rank);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={entry.employee_id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 border ${badge.border} ${badge.bg} rounded-full ${badge.color}`}
                          >
                            <BadgeIcon className="w-4 h-4" />
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{entry.employee_name}</p>
                            <p className="text-xs text-slate-500">{entry.designation}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${entry.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {entry.progress_percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{entry.avg_score}%</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {entry.completed_count}/{entry.total_count || stats.totalModules}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{formatTime(entry.total_time)}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {entry.latestSession ? (
                            <button
                              onClick={() =>
                                setSelectedSession({
                                  moduleTitle: entry.latestSession?.moduleTitle ?? 'Module Session',
                                  moduleCategory: entry.latestSession?.moduleCategory,
                                  employeeName: entry.employee_name,
                                  teamName: batch?.title ?? 'Team',
                                  completedAt: entry.latestSession?.completedAt,
                                  testScore: entry.latestSession?.testScore ?? undefined,
                                  progressPercentage: entry.latestSession?.progressPercentage ?? 100,
                                })
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                              <PlayCircle className="w-4 h-4" />
                              View Recording
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">Awaiting completion</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No progress recorded for this team yet.
                    </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <SessionReviewModal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
      />
    </div>
  );
};
