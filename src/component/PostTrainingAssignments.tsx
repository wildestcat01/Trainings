import { useMemo, useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  NotebookPen,
  CalendarClock,
  Sparkles,
  UserCheck
} from 'lucide-react';
import {
  PostSessionStatus,
  TestStatus,
  useData
} from '../contexts/DataContext';

type CombinedStatusFilter = 'all' | PostSessionStatus;
type CombinedTestFilter = 'all' | TestStatus;

const TEST_STATUS_LABEL: Record<TestStatus, string> = {
  not_taken: 'Not Taken',
  scheduled: 'Scheduled',
  completed: 'Completed',
};

const SESSION_STATUS_LABEL: Record<PostSessionStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  reviewed: 'Reviewed',
};

const TEST_STATUS_OPTIONS: Array<{ value: CombinedTestFilter; label: string }> = [
  { value: 'all', label: 'All Test Statuses' },
  { value: 'not_taken', label: 'Not Taken' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
];

const SESSION_STATUS_OPTIONS: Array<{ value: CombinedStatusFilter; label: string }> = [
  { value: 'all', label: 'All Assignment States' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'reviewed', label: 'Reviewed' },
];

const getStatusBadgeStyles = (status: PostSessionStatus) => {
  switch (status) {
    case 'reviewed':
      return 'bg-green-100 text-green-700 border border-green-200';
    case 'submitted':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    default:
      return 'bg-amber-100 text-amber-700 border border-amber-200';
  }
};

const getTestBadgeStyles = (status: TestStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'scheduled':
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const formatRelative = (value: string | null) => {
  if (!value) return 'Not submitted';
  const date = new Date(value);
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const PostTrainingAssignments = () => {
  const {
    batches,
    employees,
    modules,
    postSessionAssignments,
    updatePostSessionAssignment,
  } = useData();

  const [testStatusFilter, setTestStatusFilter] = useState<CombinedTestFilter>('all');
  const [sessionStatusFilter, setSessionStatusFilter] = useState<CombinedStatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const enrichedAssignments = useMemo(() => {
    return postSessionAssignments.map((assignment) => {
      const batch = batches.find((item) => item.id === assignment.batch_id);
      const employee = employees.find((item) => item.id === assignment.employee_id);
      const module = modules.find((item) => item.id === assignment.module_id);

      return {
        ...assignment,
        batchTitle: batch?.title ?? 'Unknown Batch',
        employeeName: employee?.name ?? 'Unknown Employee',
        employeeDesignation: employee?.designation ?? '',
        moduleTitle: module?.sub_module_title ?? 'Module',
        moduleCategory: module?.module_name ?? '',
      };
    });
  }, [postSessionAssignments, batches, employees, modules]);

  const filteredAssignments = useMemo(() => {
    return enrichedAssignments.filter((assignment) => {
      const matchesTestStatus =
        testStatusFilter === 'all' || assignment.test_status === testStatusFilter;
      const matchesSessionStatus =
        sessionStatusFilter === 'all' || assignment.status === sessionStatusFilter;
      const matchesSearch =
        !searchTerm ||
        assignment.batchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTestStatus && matchesSessionStatus && matchesSearch;
    });
  }, [enrichedAssignments, sessionStatusFilter, testStatusFilter, searchTerm]);

  const summary = useMemo(() => {
    const total = postSessionAssignments.length;
    const submitted = postSessionAssignments.filter((item) => item.status !== 'pending').length;
    const reviewed = postSessionAssignments.filter((item) => item.status === 'reviewed').length;
    const pendingTests = postSessionAssignments.filter((item) => item.test_status !== 'completed').length;
    return { total, submitted, reviewed, pendingTests };
  }, [postSessionAssignments]);

  const handleTestStatusChange = (id: string, nextStatus: TestStatus) => {
    updatePostSessionAssignment(id, { test_status: nextStatus });
  };

  const handleSessionStatusChange = (id: string, nextStatus: PostSessionStatus) => {
    const updates: Partial<typeof postSessionAssignments[number]> = { status: nextStatus };
    if (nextStatus !== 'pending' && !postSessionAssignments.find((item) => item.id === id)?.submitted_at) {
      updates.submitted_at = new Date().toISOString();
    }
    updatePostSessionAssignment(id, updates);
  };

  const markReviewed = (id: string) => {
    updatePostSessionAssignment(id, {
      status: 'reviewed',
      submitted_at: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">Post Training Assignments</h3>
          <p className="text-slate-500">
            Track post-session deliverables along with test progress for each learner and module.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryTile
          title="Total Assignments"
          value={summary.total}
          icon={ClipboardList}
          accent="bg-slate-900 text-white"
        />
        <SummaryTile
          title="Submitted"
          value={summary.submitted}
          icon={UserCheck}
          accent="bg-blue-100 text-blue-700"
        />
        <SummaryTile
          title="Reviewed"
          value={summary.reviewed}
          icon={Sparkles}
          accent="bg-emerald-100 text-emerald-700"
        />
        <SummaryTile
          title="Tests Pending"
          value={summary.pendingTests}
          icon={Clock}
          accent="bg-amber-100 text-amber-700"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Filters</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by employee, batch, or module..."
              className="w-full sm:w-56 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <select
              value={testStatusFilter}
              onChange={(event) => setTestStatusFilter(event.target.value as CombinedTestFilter)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {TEST_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={sessionStatusFilter}
              onChange={(event) => setSessionStatusFilter(event.target.value as CombinedStatusFilter)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {SESSION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignment Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Test Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{assignment.batchTitle}</div>
                    <div className="text-xs text-slate-500">Assigned {formatDate(assignment.assigned_at)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{assignment.employeeName}</div>
                    <div className="text-xs text-slate-500">{assignment.employeeDesignation}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{assignment.moduleTitle}</div>
                    <div className="text-xs text-slate-500">{assignment.moduleCategory}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarClock className="w-4 h-4" />
                      Due {formatDate(assignment.due_date)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <ArrowRight className="w-4 h-4" />
                      {formatRelative(assignment.submitted_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeStyles(assignment.status)}`}>
                      <NotebookPen className="w-3 h-3" />
                      {SESSION_STATUS_LABEL[assignment.status]}
                    </span>
                    <select
                      value={assignment.status}
                      onChange={(event) => handleSessionStatusChange(assignment.id, event.target.value as PostSessionStatus)}
                      className="mt-2 w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {(['pending', 'submitted', 'reviewed'] as PostSessionStatus[]).map((status) => (
                        <option key={status} value={status}>
                          {SESSION_STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getTestBadgeStyles(assignment.test_status)}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {TEST_STATUS_LABEL[assignment.test_status]}
                    </span>
                    <select
                      value={assignment.test_status}
                      onChange={(event) => handleTestStatusChange(assignment.id, event.target.value as TestStatus)}
                      className="mt-2 w-full text-xs px-2 py-1 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      {(['not_taken', 'scheduled', 'completed'] as TestStatus[]).map((status) => (
                        <option key={status} value={status}>
                          {TEST_STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSessionStatusChange(assignment.id, 'submitted')}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs rounded-md border border-slate-200 hover:bg-slate-100 transition"
                      >
                        <Clock className="w-4 h-4" />
                        Mark Submitted
                      </button>
                      <button
                        onClick={() => markReviewed(assignment.id)}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Reviewed
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No assignments match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryTile = ({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) => (
  <div className={`rounded-xl border border-slate-200 p-5 flex items-center gap-4 bg-white`}>
    <div className={`p-3 rounded-full ${accent}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);
