import { useMemo, useState } from 'react';
import {
  Upload,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Download,
  User,
  BarChart2,
  Mail,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  CheckCircle2,
  X,
  PlayCircle
} from 'lucide-react';
import {
  Batch,
  Employee,
  EmployeeProgress,
  TrainingModule,
  useData
} from '../context/DataContext';
import { SessionReviewModal } from './SessionReviewModal';

interface EmployeeWithProgress extends Employee {
  sessions_completed: number;
}

interface EmployeeFormProps {
  employee: Employee | null;
  onClose: () => void;
}

interface TrainingProfileProps {
  employee: EmployeeWithProgress;
  onClose: () => void;
  modules: TrainingModule[];
  batches: Batch[];
  allProgress: EmployeeProgress[];
}

export const EmployeeManagement = () => {
  const {
    employees,
    employeeProgress,
    batches,
    modules,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithProgress | null>(null);

  const employeesWithProgress = useMemo<EmployeeWithProgress[]>(() => {
    return employees.map((employee) => {
      const progressRecords = employeeProgress.filter(
        (record) => record.employee_id === employee.id && record.status === 'completed'
      );
      return {
        ...employee,
        sessions_completed: progressRecords.length,
      };
    });
  }, [employees, employeeProgress]);

  const filteredEmployees = useMemo(() => {
    return employeesWithProgress.filter((employee) => {
      const term = searchTerm.toLowerCase();
      return (
        !term ||
        employee.name.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        employee.employee_id.toLowerCase().includes(term)
      );
    });
  }, [employeesWithProgress, searchTerm]);

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || '');
      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
      const records = lines.slice(1).map((line) => {
        const values = line.split(',').map((value) => value.trim());
        return {
          employee_id: values[0] || '',
          name: values[1] || '',
          phone_number: values[2] || '',
          email: values[3] || '',
          designation: values[4] || '',
          department: values[5] || '',
          date_of_joining: values[6] || '',
          location: values[7] || '',
          is_active: true,
        };
      });

      importEmployees(records);
      alert('Employees imported successfully!');
    };

    reader.readAsText(file);
  };

  const handleToggleActive = (employee: Employee) => {
    updateEmployee(employee.id, { is_active: !employee.is_active });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    deleteEmployee(id);
  };

  const downloadTemplate = () => {
    const template =
      'Employee ID,Employee Name,Phone Number,Email Id,Designation,Department,DOJ,Location\n' +
      'EMP001,John Doe,1234567890,john@example.com,Manager,Sales,2024-01-01,New York';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <label className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer font-medium transition-colors">
            <Upload className="w-4 h-4" />
            Upload CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
          <button
            onClick={() => {
              setEditingEmployee(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Sessions Done
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {employee.employee_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.designation}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.location}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold text-slate-900 bg-slate-100 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {employee.sessions_completed}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowProfileModal(true);
                        }}
                        className="p-2 hover:bg-slate-200 rounded"
                        title="View Training Profile"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingEmployee(employee);
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-slate-200 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(employee)}
                        className="p-2 hover:bg-slate-200 rounded"
                      >
                        {employee.is_active ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12 text-slate-500">No employees found</div>
        )}
      </div>

      {showModal && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSubmit={(payload) => {
            if (editingEmployee) {
              updateEmployee(editingEmployee.id, payload);
            } else {
              addEmployee(payload);
            }
            setShowModal(false);
            setEditingEmployee(null);
          }}
        />
      )}

      {showProfileModal && selectedEmployee && (
        <TrainingProfileModal
          employee={selectedEmployee}
          modules={modules}
          batches={batches}
          allProgress={employeeProgress}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
};

const EmployeeFormModal = ({ employee, onClose, onSubmit }: EmployeeFormProps & { onSubmit: (payload: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => void }) => {
  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>(
    employee || {
      employee_id: '',
      name: '',
      phone_number: '',
      email: '',
      designation: '',
      department: '',
      date_of_joining: '',
      location: '',
      is_active: true,
    }
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            {employee ? 'Edit Employee' : 'Add Employee'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Employee Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Joining</label>
              <input
                type="date"
                value={formData.date_of_joining}
                onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is-active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-500 rounded"
            />
            <label htmlFor="is-active" className="text-sm font-medium text-slate-700">
              Active
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {employee ? 'Update Employee' : 'Add Employee'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TrainingProfileModal = ({ employee, onClose, modules, batches, allProgress }: TrainingProfileProps) => {
  const moduleMap = useMemo(() => {
    return modules.reduce<Record<string, TrainingModule>>((acc, module) => {
      acc[module.id] = module;
      return acc;
    }, {});
  }, [modules]);

  const [selectedSession, setSelectedSession] = useState<{
    moduleTitle: string;
    moduleCategory?: string;
    employeeName: string;
    teamName: string;
    completedAt?: string | null;
    testScore?: number | null;
    progressPercentage: number;
  } | null>(null);

  const progressByBatch = useMemo(() => {
    const relevantBatchIds = new Set(
      allProgress.filter((progress) => progress.employee_id === employee.id).map((progress) => progress.batch_id)
    );

    return Array.from(relevantBatchIds).map((batchId) => {
      const batch = batches.find((item) => item.id === batchId);
      const employeeProgressRecords = allProgress.filter(
        (progress) => progress.batch_id === batchId && progress.employee_id === employee.id
      );

      const completed = employeeProgressRecords.filter((record) => record.status === 'completed');
      const inProgress = employeeProgressRecords.filter((record) => record.status === 'in_progress');
      const notStarted = employeeProgressRecords.filter((record) => record.status === 'not_started');

      const averageProgress =
        employeeProgressRecords.length > 0
          ? Math.round(
              employeeProgressRecords.reduce((sum, record) => sum + record.progress_percentage, 0) /
                employeeProgressRecords.length
            )
          : 0;

      return {
        batchTitle: batch?.title || 'Unassigned Batch',
        batchDescription: batch?.description || '',
        completedCount: completed.length,
        inProgressCount: inProgress.length,
        notStartedCount: notStarted.length,
        averageProgress,
        records: employeeProgressRecords.map((record) => ({
          ...record,
          module: moduleMap[record.module_id],
        })),
      };
    });
  }, [allProgress, batches, employee.id, moduleMap]);

  const aggregateProgress = useMemo(() => {
    const records = allProgress.filter((progress) => progress.employee_id === employee.id);
    const total = records.length || 1;
    const completed = records.filter((record) => record.status === 'completed').length;
    const average =
      records.length > 0
        ? Math.round(records.reduce((sum, record) => sum + record.progress_percentage, 0) / records.length)
        : 0;

    return { completed, total, average };
  }, [allProgress, employee.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Training Profile</h3>
            <p className="text-slate-500 mt-1">{employee.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <User className="w-10 h-10 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">{employee.designation}</p>
                  <p className="text-sm text-slate-500">{employee.department}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {employee.date_of_joining || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Sessions Completed: {employee.sessions_completed}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-4">Progress Overview</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Average Progress</p>
                  <p className="text-2xl font-bold text-slate-900">{aggregateProgress.average}%</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Modules Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {aggregateProgress.completed}/{aggregateProgress.total}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Last touched: {employee.updated_at.split('T')[0]}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {progressByBatch.map((batch) => (
              <div key={batch.batchTitle} className="border border-slate-200 rounded-lg">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900">{batch.batchTitle}</h4>
                    <p className="text-sm text-slate-500">{batch.batchDescription}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      <TrendingUp className="w-4 h-4" />
                      {batch.averageProgress}%
                    </span>
                    <span className="text-sm text-slate-500">
                      Completed {batch.completedCount} / {batch.records.length}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {batch.records.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-slate-200 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {record.module?.sub_module_title || 'Module'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.module?.module_name} • Status: {record.status.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                          Progress {record.progress_percentage}%
                        </span>
                        {record.test_status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                            Score {record.test_score ?? 0}%
                          </span>
                        )}
                        {record.progress_percentage >= 100 && (
                          <button
                            onClick={() =>
                              setSelectedSession({
                                moduleTitle: record.module?.sub_module_title || 'Module Session',
                                moduleCategory: record.module?.module_name,
                                employeeName: employee.name,
                                teamName: batch.batchTitle,
                                completedAt: record.completed_at,
                                testScore: record.test_score,
                                progressPercentage: record.progress_percentage,
                              })
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                          >
                            <PlayCircle className="w-4 h-4" />
                            View Session Recording
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
