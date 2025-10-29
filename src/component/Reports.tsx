import { useMemo, useState } from 'react';
import {
  TrendingUp,
  Target,
  BarChart3,
  AlertTriangle,
  Users,
  CheckCircle2,
  Activity,
  Download,
  ChevronRight
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

type ReportView = 'performance' | 'completion' | 'module' | 'skill-gap';

interface DepartmentSummary {
  department: string;
  employeeCount: number;
  completionRate: number;
  avgScore: number;
  topModule: string;
}

interface ModuleSummary {
  moduleId: string;
  moduleName: string;
  subModule: string;
  completionRate: number;
  avgScore: number;
  strugglingCount: number;
  assignments: number;
}

export const Reports = () => {
  const { employees, modules, batches, employeeProgress, batchEmployees, batchModules } = useData();
  const [activeView, setActiveView] = useState<ReportView>('performance');
  const [timeFilter, setTimeFilter] = useState<'Last 30 Days' | 'Quarter' | 'Year-to-date'>('Last 30 Days');

  const { summary, departmentSummaries, moduleSummaries } = useMemo(() => {
    const activeEmployees = employees.filter((employee) => employee.is_active);
    const progressEntries = employeeProgress;

    const completed = progressEntries.filter((entry) => entry.status === 'completed');
    const completionRate =
      progressEntries.length > 0 ? Math.round((completed.length / progressEntries.length) * 100) : 0;

    const assessmentEntries = progressEntries.filter(
      (entry) => entry.test_status === 'completed' && typeof entry.test_score === 'number'
    );
    const averageScore =
      assessmentEntries.length > 0
        ? Math.round(
            assessmentEntries.reduce((total, entry) => total + (entry.test_score ?? 0), 0) /
              assessmentEntries.length
          )
        : 0;

    const atRisk = progressEntries
      .reduce<Record<string, { completed: number; total: number }>>((acc, entry) => {
        if (!acc[entry.employee_id]) {
          acc[entry.employee_id] = { completed: 0, total: 0 };
        }
        acc[entry.employee_id].total += 1;
        if (entry.status === 'completed') acc[entry.employee_id].completed += 1;
        return acc;
      }, {});

    const atRiskCount = Object.values(atRisk).filter(
      (value) => value.total > 0 && value.completed / value.total < 0.3
    ).length;

    const departmentSummaryMap = new Map<
      string,
      {
        employees: string[];
        completionRate: number;
        scores: number[];
        moduleCounts: Map<string, { assigned: number; completed: number }>;
      }
    >();

    activeEmployees.forEach((employee) => {
      const key = employee.department || 'Unassigned';
      if (!departmentSummaryMap.has(key)) {
        departmentSummaryMap.set(key, {
          employees: [],
          completionRate: 0,
          scores: [],
          moduleCounts: new Map(),
        });
      }
      departmentSummaryMap.get(key)?.employees.push(employee.id);
    });

    progressEntries.forEach((entry) => {
      const employee = employees.find((item) => item.id === entry.employee_id);
      if (!employee) return;

      const department = employee.department || 'Unassigned';
      const summary = departmentSummaryMap.get(department);
      if (!summary) return;

      if (entry.status === 'completed') {
        summary.completionRate += 1;
      }

      if (entry.test_status === 'completed' && typeof entry.test_score === 'number') {
        summary.scores.push(entry.test_score);
      }

      const module = modules.find((item) => item.id === entry.module_id);
      if (module) {
        if (!summary.moduleCounts.has(module.module_name)) {
          summary.moduleCounts.set(module.module_name, { assigned: 0, completed: 0 });
        }
        const moduleCount = summary.moduleCounts.get(module.module_name)!;
        moduleCount.assigned += 1;
        if (entry.status === 'completed') {
          moduleCount.completed += 1;
        }
      }
    });

    const departmentSummaries: DepartmentSummary[] = Array.from(departmentSummaryMap.entries()).map(
      ([department, value]) => {
        const totalAssignments = value.employees.reduce((assignmentTotal, employeeId) => {
          return (
            assignmentTotal +
            progressEntries.filter((entry) => entry.employee_id === employeeId).length
          );
        }, 0);

        const completionRate =
          totalAssignments > 0 ? Math.round((value.completionRate / totalAssignments) * 100) : 0;

        let topModule = 'N/A';
        let topCompletion = 0;

        value.moduleCounts.forEach((moduleCount, moduleName) => {
          const rate =
            moduleCount.assigned > 0 ? Math.round((moduleCount.completed / moduleCount.assigned) * 100) : 0;
          if (rate > topCompletion) {
            topCompletion = rate;
            topModule = moduleName;
          }
        });

        const avgScore =
          value.scores.length > 0
            ? Math.round(value.scores.reduce((sum, score) => sum + score, 0) / value.scores.length)
            : 0;

        return {
          department,
          employeeCount: value.employees.length,
          completionRate,
          avgScore,
          topModule,
        };
      }
    );

    departmentSummaries.sort((a, b) => b.completionRate - a.completionRate);

    const moduleMap = modules.reduce<Record<string, ModuleSummary>>((acc, module) => {
      acc[module.id] = {
        moduleId: module.id,
        moduleName: module.module_name,
        subModule: module.sub_module_title,
        completionRate: 0,
        avgScore: 0,
        strugglingCount: 0,
        assignments: 0,
      };
      return acc;
    }, {});

    progressEntries.forEach((entry) => {
      const moduleSummary = moduleMap[entry.module_id];
      if (!moduleSummary) return;

      moduleSummary.assignments += 1;
      if (entry.status === 'completed') {
        moduleSummary.completionRate += 1;
      }

      if (entry.test_status === 'completed' && typeof entry.test_score === 'number') {
        moduleSummary.avgScore += entry.test_score;
        if (entry.test_score < 70) {
          moduleSummary.strugglingCount += 1;
        }
      }
    });

    const moduleSummaries = Object.values(moduleMap).map((summary) => {
      const completionRate =
        summary.assignments > 0 ? Math.round((summary.completionRate / summary.assignments) * 100) : 0;
      const completedAssessments = progressEntries.filter(
        (entry) => entry.module_id === summary.moduleId && entry.test_status === 'completed'
      );
      const avgScore =
        completedAssessments.length > 0
          ? Math.round(
              completedAssessments.reduce((sum, entry) => sum + (entry.test_score ?? 0), 0) /
                completedAssessments.length
            )
          : 0;
      return {
        ...summary,
        completionRate,
        avgScore,
      };
    });

    moduleSummaries.sort((a, b) => b.completionRate - a.completionRate);

    return {
      summary: {
        totalEmployees: activeEmployees.length,
        avgCompletion: completionRate,
        avgScore: averageScore,
        atRisk: atRiskCount,
      },
      departmentSummaries,
      moduleSummaries,
    };
  }, [employees, modules, batches, employeeProgress, batchEmployees, batchModules]);

  const exportCsv = () => {
    const header = 'Department,Employees,Completion Rate,Average Score,Top Module\n';
    const rows = departmentSummaries
      .map(
        (dept) =>
          `${dept.department},${dept.employeeCount},${dept.completionRate}%,${dept.avgScore}%,${dept.topModule}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'department-summary.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Analytics & Reports</h2>
          <p className="text-slate-500 mt-1">
            Consolidated training performance with completion, assessment, and engagement patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['Last 30 Days', 'Quarter', 'Year-to-date'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Active Employees"
          value={summary.totalEmployees.toString()}
          change="+4.5%"
          icon={Users}
          description="Participating in training this period"
        />
        <SummaryCard
          title="Avg Completion"
          value={`${summary.avgCompletion}%`}
          change="+6.1%"
          icon={CheckCircle2}
          description="Overall module completion"
        />
        <SummaryCard
          title="Assessment Score"
          value={`${summary.avgScore}%`}
          change="+2.3%"
          icon={Target}
          description="Average of completed assessments"
        />
        <SummaryCard
          title="At-Risk Employees"
          value={summary.atRisk.toString()}
          change="-1.1%"
          icon={AlertTriangle}
          description="Below 30% completion rate"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {(
          [
            ['performance', 'Performance Overview', Activity],
            ['completion', 'Completion by Department', TrendingUp],
            ['module', 'Module Effectiveness', BarChart3],
            ['skill-gap', 'Skill Gap Signals', Target],
          ] as [ReportView, string, React.ElementType][]
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition ${
              activeView === id ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeView === 'performance' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Department Summary</h3>
              <p className="text-sm text-slate-500">Completion and assessment performance by department</p>
            </div>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="space-y-3">
            {departmentSummaries.map((dept) => (
              <div key={dept.department} className="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{dept.department}</p>
                  <p className="text-xs text-slate-500">{dept.employeeCount} employees</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>Completion: <strong>{dept.completionRate}%</strong></span>
                  <span>Avg Score: <strong>{dept.avgScore}%</strong></span>
                  <span>Top Module: <strong>{dept.topModule}</strong></span>
                </div>
                <button className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                  View details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {departmentSummaries.length === 0 && (
              <p className="text-center text-slate-500 py-8">No departmental data available yet.</p>
            )}
          </div>
        </div>
      )}

      {activeView === 'module' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Module Effectiveness</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignments</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Struggling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {moduleSummaries.map((module) => (
                  <tr key={module.moduleId} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{module.subModule}</p>
                      <p className="text-xs text-slate-500">{module.moduleName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{module.assignments}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{module.completionRate}%</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{module.avgScore}%</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{module.strugglingCount}</td>
                  </tr>
                ))}
                {moduleSummaries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No module performance data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'completion' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Completion Trends</h3>
          <p className="text-sm text-slate-500">
            Detailed trend visualisations can be exported from analytics dashboards. For this offline demo, use the module view above to gauge adoption.
          </p>
        </div>
      )}

      {activeView === 'skill-gap' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Skill Gap Insights</h3>
          <p className="text-sm text-slate-500">
            Track low scoring assessments to identify teams needing reinforcement. Module effectiveness shows where additional coaching may help.
          </p>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  change,
  icon: Icon,
  description,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  description: string;
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 mt-2">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-slate-100 text-slate-600">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="mt-4 text-sm font-medium text-green-600">{change}</p>
    <p className="text-xs text-slate-500 mt-1">{description}</p>
  </div>
);
