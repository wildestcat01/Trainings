import { useMemo, useState } from 'react';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Target,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText,
  Download
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  accent: string;
}

export const Dashboard = () => {
  const { employees, modules, employeeProgress } = useData();
  const [timeFilter, setTimeFilter] = useState<'This Week' | 'This Month' | 'This Quarter'>('This Week');

  const {
    stats,
    topPerformers,
    quickStats,
    needsAttention,
    recentActivity,
  } = useMemo(() => {
    const activeEmployees = employees.filter((employee) => employee.is_active);
    const totalEmployees = activeEmployees.length;

    const progressEntries = employeeProgress;
    const activeSessions = progressEntries.filter((entry) => entry.status === 'in_progress').length;
    const completedSessions = progressEntries.filter((entry) => entry.status === 'completed').length;

    const completionRate =
      progressEntries.length > 0 ? Math.round((completedSessions / progressEntries.length) * 100) : 0;

    const scoredEntries = progressEntries.filter(
      (entry) => entry.test_status === 'completed' && typeof entry.test_score === 'number'
    );
    const averageScore =
      scoredEntries.length > 0
        ? Math.round(
            scoredEntries.reduce((total, entry) => total + (entry.test_score ?? 0), 0) / scoredEntries.length
          )
        : 0;

    const dailyCompleted = progressEntries.filter((entry) => {
      if (!entry.completed_at) return false;
      const completedDate = new Date(entry.completed_at).toDateString();
      return completedDate === new Date().toDateString();
    }).length;

    const scheduledThisWeek = progressEntries.filter((entry) => entry.status === 'not_started').length;
    const overdue = progressEntries.filter((entry) => entry.status !== 'completed').length;

    const performerScores = new Map<
      string,
      {
        name: string;
        designation: string;
        scores: number[];
      }
    >();

    scoredEntries.forEach((entry) => {
      const employee = employees.find((item) => item.id === entry.employee_id);
      if (!employee || !entry.test_score) return;

      if (!performerScores.has(employee.id)) {
        performerScores.set(employee.id, {
          name: employee.name,
          designation: employee.designation,
          scores: [],
        });
      }

      performerScores.get(employee.id)?.scores.push(entry.test_score);
    });

    const topPerformers = Array.from(performerScores.entries())
      .map(([id, value]) => ({
        id,
        name: value.name,
        designation: value.designation,
        score: Math.round(value.scores.reduce((sum, score) => sum + score, 0) / value.scores.length),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const stagnatingEmployees = employees
      .filter((employee) => {
        const records = progressEntries.filter((entry) => entry.employee_id === employee.id);
        if (records.length === 0) return true;
        const inProgress = records.filter((entry) => entry.status === 'in_progress').length;
        const lastTouched = records
          .map((entry) => entry.last_accessed_at)
          .filter(Boolean)
          .map((timestamp) => new Date(timestamp as string))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        if (!lastTouched) return true;
        const hoursSinceLastAccess = (Date.now() - lastTouched.getTime()) / (1000 * 60 * 60);
        return inProgress === 0 || hoursSinceLastAccess > 72;
      })
      .slice(0, 3)
      .map((employee, index) => ({
        employee_id: employee.id,
        name: employee.name,
        issue: index === 0 ? 'No recent activity in assigned modules' : 'Pending assessments due soon',
        severity: index === 0 ? 'URGENT' : index === 1 ? 'HIGH' : 'MEDIUM' as const,
      }));

    const recentActivity = progressEntries
      .filter((entry) => entry.last_accessed_at)
      .sort(
        (a, b) =>
          new Date(b.last_accessed_at ?? 0).getTime() - new Date(a.last_accessed_at ?? 0).getTime()
      )
      .slice(0, 6)
      .map((entry) => {
        const employee = employees.find((item) => item.id === entry.employee_id);
        const module = modules.find((item) => item.id === entry.module_id);
        const statusLabel =
          entry.status === 'completed'
            ? 'completed'
            : entry.status === 'in_progress'
            ? 'continued'
            : 'viewed';

        return {
          employee_name: employee?.name ?? 'Employee',
          action: statusLabel,
          module_name: module?.sub_module_title ?? 'Module',
          timestamp: entry.last_accessed_at ?? entry.completed_at ?? entry.started_at ?? new Date().toISOString(),
        };
      });

    return {
      stats: {
        totalEmployees,
        activeSessions,
        completionRate,
        averageScore,
      },
      topPerformers,
      quickStats: {
        completedToday: dailyCompleted,
        scheduledThisWeek,
        overdue,
      },
      needsAttention: stagnatingEmployees,
      recentActivity,
    };
  }, [employees, modules, employeeProgress]);

  const statCards: StatCard[] = [
    {
      title: 'Active Employees',
      value: stats.totalEmployees.toString(),
      change: '+5.1%',
      icon: Users,
      accent: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'In Progress Sessions',
      value: stats.activeSessions.toString(),
      change: '+2.4%',
      icon: BookOpen,
      accent: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      change: '+6.7%',
      icon: CheckCircle2,
      accent: 'bg-green-100 text-green-600',
    },
    {
      title: 'Avg Assessment Score',
      value: `${stats.averageScore}%`,
      change: '+1.9%',
      icon: Target,
      accent: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3rem font-semibold text-slate-900 text-2xl">Admin Dashboard</h2>
          <p className="text-slate-500 mt-1">
            Training overview with progress, engagement, and recent activity snapshots.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(['This Week', 'This Month', 'This Quarter'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-green-600">{card.change} vs last period</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Training Performance</h3>
              <p className="text-sm text-slate-500">Batch-wide completion and assessment averages</p>
            </div>
            <button className="text-sm text-slate-500 hover:text-slate-900">View full report →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500 mb-2">Completed Today</p>
              <p className="text-2xl font-semibold text-slate-900">{quickStats.completedToday}</p>
              <p className="text-xs text-slate-500 mt-1">Modules finished in the last 24 hours</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500 mb-2">Scheduled This Week</p>
              <p className="text-2xl font-semibold text-slate-900">{quickStats.scheduledThisWeek}</p>
              <p className="text-xs text-slate-500 mt-1">Not started yet but assigned</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-500 mb-2">Needs Attention</p>
              <p className="text-2xl font-semibold text-amber-600">{quickStats.overdue}</p>
              <p className="text-xs text-slate-500 mt-1">Sessions pending review</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Export Reports</h3>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-lg border border-slate-200 text-sm flex items-center gap-2 hover:bg-slate-50">
                <FileText className="w-4 h-4" />
                Summary
              </button>
              <button className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm flex items-center gap-2 hover:bg-slate-800">
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>• Detailed completion report by batch</li>
            <li>• Assessment performance snapshots</li>
            <li>• Engagement metrics for leadership reviews</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Top Performers</h3>
            <span className="text-sm text-slate-500">{topPerformers.length} assessed</span>
          </div>
          <div className="space-y-3">
            {topPerformers.length === 0 && (
              <p className="text-sm text-slate-500">No assessment data recorded yet.</p>
            )}
            {topPerformers.map((performer) => (
              <div
                key={performer.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">{performer.name}</p>
                  <p className="text-xs text-slate-500">{performer.designation}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {performer.score}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Needs Attention</h3>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-3">
            {needsAttention.length === 0 && (
              <p className="text-sm text-slate-500">No employees require follow-up right now.</p>
            )}
            {needsAttention.map((item) => (
              <div key={item.employee_id} className="border border-amber-200 rounded-lg p-4">
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500 mt-1">{item.issue}</p>
                <span
                  className={`inline-flex mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
                    item.severity === 'URGENT'
                      ? 'bg-red-100 text-red-700'
                      : item.severity === 'HIGH'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Learning Activity</h3>
          <Calendar className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-3">
          {recentActivity.length === 0 && (
            <p className="text-sm text-slate-500">No recent activity logged.</p>
          )}
          {recentActivity.map((activity, index) => (
            <div
              key={`${activity.employee_name}-${index}`}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-slate-200 rounded-lg p-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {activity.employee_name} {activity.action} <span className="text-slate-600">{activity.module_name}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50">
                View details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
