import { useMemo, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  BookOpen,
  Send,
  Filter,
  X,
  BarChart3
} from 'lucide-react';
import { Batch, Employee, TrainingModule, useData } from '../context/DataContext';
import { BatchInsights } from './BatchInsights';

interface BatchWithCounts extends Batch {
  employee_count: number;
  module_count: number;
}

export const TeamManagement = () => {
  const {
    batches,
    employees,
    modules,
    batchEmployees,
    batchModules,
    addBatch,
    updateBatch,
    deleteBatch,
    updateBatchEmployees,
    updateBatchModules,
  } = useData();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [manageBatchId, setManageBatchId] = useState<string | null>(null);
  const [showInsightsBatchId, setShowInsightsBatchId] = useState<string | null>(null);

  const enrichedBatches = useMemo<BatchWithCounts[]>(() => {
    return batches.map((batch: Batch) => {
      const employee_count = batchEmployees.filter((entry: { batch_id: string }) => entry.batch_id === batch.id).length;
      const module_count = batchModules.filter((entry: { batch_id: string }) => entry.batch_id === batch.id).length;
      return { ...batch, employee_count, module_count };
    });
  }, [batches, batchEmployees, batchModules]);

  const activeEmployees = useMemo(() => employees.filter((employee: Employee) => employee.is_active), [employees]);
  const activeModules = useMemo(() => modules.filter((module: TrainingModule) => module.is_active), [modules]);

  const handleTogglePublish = (batch: Batch) => {
    updateBatch(batch.id, {
      is_published: !batch.is_published,
    });
  };

  const handleToggleActive = (batch: Batch) => {
    updateBatch(batch.id, { is_active: !batch.is_active });
  };

  const handleDeleteBatch = (batch: Batch) => {
    if (!confirm(`Delete team "${batch.title}"? This will remove assignments.`)) return;
    deleteBatch(batch.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            setEditingBatch(null);
            setShowFormModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichedBatches.map((batch) => (
          <div
            key={batch.id}
            className="h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col"
          >
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{batch.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{batch.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      batch.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {batch.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      batch.is_active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {batch.is_active ? 'Active' : 'Archived'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{batch.employee_count} Team Members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{batch.module_count} Modules</span>
                </div>
                {batch.published_at && (
                  <div className="text-xs text-slate-500">
                    Published on {new Date(batch.published_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setManageBatchId(batch.id)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Manage Team
                </button>
                <button
                  onClick={() => setShowInsightsBatchId(batch.id)}
                  className="p-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-blue-600"
                  title="View Insights"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 text-sm text-slate-500">
                <button
                  onClick={() => handleTogglePublish(batch)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                >
                  <Send className="w-4 h-4" />
                  {batch.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleToggleActive(batch)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                >
                  <Filter className="w-4 h-4" />
                  {batch.is_active ? 'Archive' : 'Activate'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBatch(batch);
                    setShowFormModal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBatch(batch)}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {enrichedBatches.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500">
            No teams created yet. Start by creating a team and assign modules plus learners.
          </div>
        )}
      </div>

      {showFormModal && (
        <BatchFormModal
          batch={editingBatch}
          onClose={() => {
            setShowFormModal(false);
            setEditingBatch(null);
          }}
          onSubmit={(payload) => {
            if (editingBatch) {
              updateBatch(editingBatch.id, payload);
            } else {
              addBatch(payload);
            }
            setShowFormModal(false);
            setEditingBatch(null);
          }}
        />
      )}

      {manageBatchId && (
        <BatchManageModal
          batch={batches.find((item) => item.id === manageBatchId)!}
          employees={activeEmployees}
          modules={activeModules}
          assignedEmployees={batchEmployees.filter((entry) => entry.batch_id === manageBatchId)}
          assignedModules={batchModules.filter((entry) => entry.batch_id === manageBatchId)}
          onUpdateEmployees={(employeeIds) => updateBatchEmployees(manageBatchId, employeeIds)}
          onUpdateModules={(moduleIds) => updateBatchModules(manageBatchId, moduleIds)}
          onClose={() => setManageBatchId(null)}
        />
      )}

      {showInsightsBatchId && (
        <BatchInsights
          batchId={showInsightsBatchId}
          onClose={() => setShowInsightsBatchId(null)}
        />
      )}
    </div>
  );
};

const BatchFormModal = ({
  batch,
  onClose,
  onSubmit,
}: {
  batch: Batch | null;
  onClose: () => void;
  onSubmit: (payload: Omit<Batch, 'id' | 'created_at' | 'updated_at' | 'published_at'>) => void;
}) => {
  const [formData, setFormData] = useState<Omit<Batch, 'id' | 'created_at' | 'updated_at' | 'published_at'>>(
    batch || {
      title: '',
      description: '',
      is_published: false,
      is_active: true,
    }
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-slate-900">
            {batch ? 'Update Team' : 'Create Team'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Publish immediately
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {batch ? 'Save Changes' : 'Create Team'}
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

const BatchManageModal = ({
  batch,
  employees,
  modules,
  assignedEmployees,
  assignedModules,
  onUpdateEmployees,
  onUpdateModules,
  onClose,
}: {
  batch: Batch;
  employees: Employee[];
  modules: TrainingModule[];
  assignedEmployees: { employee_id: string }[];
  assignedModules: { module_id: string }[];
  onUpdateEmployees: (employeeIds: string[]) => void;
  onUpdateModules: (moduleIds: string[]) => void;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'modules'>('employees');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    assignedEmployees.map((entry) => entry.employee_id)
  );
  const [selectedModules, setSelectedModules] = useState<string[]>(
    assignedModules.map((entry) => entry.module_id)
  );

  const toggleSelection = (id: string, type: 'employee' | 'module') => {
    if (type === 'employee') {
      setSelectedEmployees((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setSelectedModules((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const handleSave = () => {
    onUpdateEmployees(selectedEmployees);
    onUpdateModules(selectedModules);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Manage Team</h3>
            <p className="text-sm text-slate-500 mt-1">{batch.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 flex gap-2">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'employees' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'modules' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Modules
          </button>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === 'employees' ? (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">
                Assign Team Members ({selectedEmployees.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employees.map((employee) => {
                  const isSelected = selectedEmployees.includes(employee.id);
                  return (
                    <button
                      key={employee.id}
                      onClick={() => toggleSelection(employee.id, 'employee')}
                      className={`text-left border rounded-lg p-4 transition ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-medium text-slate-900">{employee.name}</p>
                      <p className="text-xs text-slate-500">
                        {employee.designation} • {employee.department}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">
                Assign Modules ({selectedModules.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map((module) => {
                  const isSelected = selectedModules.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      onClick={() => toggleSelection(module.id, 'module')}
                      className={`text-left border rounded-lg p-4 transition ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-medium text-slate-900">{module.sub_module_title}</p>
                      <p className="text-xs text-slate-500">{module.module_name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
