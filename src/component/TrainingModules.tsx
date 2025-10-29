import { useMemo, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Search,
  FileText,
  X,
  ClipboardList,
  Presentation
} from 'lucide-react';
import {
  TrainingModule,
  Test,
  useData
} from '../contexts/DataContext';

interface ModuleFormState {
  module_name: string;
  designations: string[];
  sub_module_title: string;
  content_url: string;
  content_type: string;
  file_name: string;
  slides_url: string;
  has_test: boolean;
  is_active: boolean;
}

export const TrainingModules = () => {
  const {
    modules,
    tests,
    employees,
    addModule,
    updateModule,
    deleteModule,
  } = useData();

  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [previewModule, setPreviewModule] = useState<TrainingModule | null>(null);
  const [showTestPreview, setShowTestPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');

  const uniqueModules = useMemo(
    () => Array.from(new Set(modules.map((module) => module.module_name))),
    [modules]
  );

  const uniqueDesignations = useMemo(() => {
    const moduleDesignations = modules.flatMap((module) => module.designations ?? []);
    const employeeDesignations = employees
      .filter((employee) => employee.is_active)
      .map((employee) => employee.designation);
    return Array.from(new Set([...moduleDesignations, ...employeeDesignations]));
  }, [modules, employees]);

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch =
        !searchTerm ||
        module.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.sub_module_title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = !filterModule || module.module_name === filterModule;
      const matchesDesignation =
        !filterDesignation || module.designations?.includes(filterDesignation);

      return matchesSearch && matchesModule && matchesDesignation;
    });
  }, [modules, searchTerm, filterModule, filterDesignation]);

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this training module?')) return;
    deleteModule(id);
  };

  const handleModuleSubmit = (formData: ModuleFormState) => {
    const baseData = {
      module_name: formData.module_name,
      designations: formData.designations,
      sub_module_title: formData.sub_module_title,
      content_url: formData.content_url,
      content_type: formData.content_type,
      file_name: formData.file_name,
      slides_url: formData.slides_url,
      has_test: formData.has_test,
      is_active: formData.is_active,
    };

    const testPayload = formData.has_test
      ? {
          title: `${formData.sub_module_title} - Assessment`,
          description: `Test your knowledge of ${formData.sub_module_title}`,
          passing_score: 70,
          duration_minutes: 30,
          questions: [] as Test['questions'],
        }
      : null;

    if (editingModule) {
      updateModule(editingModule.id, baseData, testPayload);
    } else {
      addModule(baseData, testPayload);
    }

    setShowModal(false);
    setEditingModule(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search modules or sub-modules..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Modules</option>
            {uniqueModules.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          <select
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Designations</option>
            {uniqueDesignations.map((designation) => (
              <option key={designation} value={designation}>
                {designation}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setEditingModule(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Module
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Sub-Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModules.map((module) => {
                const test = tests.find((item) => item.module_id === module.id);
                return (
                  <tr key={module.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {module.module_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(module.designations && module.designations.length > 0 ? module.designations : ['Unassigned']).map((designation) => (
                          <span
                            key={`${module.id}-${designation}`}
                            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                              designation === 'Unassigned'
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}
                          >
                            {designation}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                      {module.sub_module_title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="max-w-[150px] truncate">
                          {module.file_name || 'No file'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {module.has_test && test ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-100">
                          <ClipboardList className="w-3 h-3" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {module.slides_url && (
                          <button
                            onClick={() => setPreviewModule(module)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Preview Slides"
                          >
                            <Presentation className="w-4 h-4" />
                            Preview PPT
                          </button>
                        )}
                        {module.has_test && test && (
                          <button
                            onClick={() => {
                              setPreviewModule(module);
                              setShowTestPreview(true);
                            }}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                            title="Preview Test"
                          >
                            <ClipboardList className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingModule(module);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(module.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12 text-slate-500">No training modules found</div>
        )}
      </div>

      {showModal && (
        <ModuleFormModal
          module={editingModule}
          existingModules={uniqueModules}
          designations={uniqueDesignations}
          onClose={() => {
            setShowModal(false);
            setEditingModule(null);
          }}
          onSubmit={handleModuleSubmit}
        />
      )}

      {previewModule && !showTestPreview && (
        <SlidePreviewModal module={previewModule} onClose={() => setPreviewModule(null)} />
      )}

      {previewModule && showTestPreview && (
        <TestPreviewModal
          module={previewModule}
          onClose={() => {
            setPreviewModule(null);
            setShowTestPreview(false);
          }}
        />
      )}
    </div>
  );
};

interface ModuleFormModalProps {
  module: TrainingModule | null;
  existingModules: string[];
  designations: string[];
  onClose: () => void;
  onSubmit: (form: ModuleFormState) => void;
}

const ModuleFormModal = ({
  module,
  existingModules,
  designations,
  onClose,
  onSubmit,
}: ModuleFormModalProps) => {
  const [formData, setFormData] = useState<ModuleFormState>(
    module
      ? {
          module_name: module.module_name,
          designations: [...(module.designations ?? [])],
          sub_module_title: module.sub_module_title,
          content_url: module.content_url,
          content_type: module.content_type,
          file_name: module.file_name,
          slides_url: module.slides_url,
          has_test: module.has_test,
          is_active: module.is_active,
        }
      : {
          module_name: '',
          designations: [],
          sub_module_title: '',
          content_url: '',
          content_type: 'pdf',
          file_name: '',
          slides_url: '',
          has_test: true,
          is_active: true,
        }
  );
  const [isNewModule, setIsNewModule] = useState(!module);
  const [customDesignation, setCustomDesignation] = useState('');
  const availableDesignations = useMemo(
    () => Array.from(new Set([...designations, ...formData.designations])),
    [designations, formData.designations]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.designations.length === 0) {
      alert('Please select at least one designation.');
      return;
    }
    onSubmit(formData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      setFormData((prev) => ({
        ...prev,
        file_name: file.name,
        content_type: fileType,
        content_url: `https://example.com/uploads/${encodeURIComponent(file.name)}`,
      }));
    }
  };

  const handleSlidesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        slides_url: `https://example.com/slides/${encodeURIComponent(file.name)}`,
      }));
    }
  };

  const handleDesignationsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    setFormData((prev) => ({ ...prev, designations: selected }));
  };

  const addCustomDesignation = () => {
    const value = customDesignation.trim();
    if (!value) return;
    setFormData((prev) => ({
      ...prev,
      designations: Array.from(new Set([...prev.designations, value])),
    }));
    setCustomDesignation('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            {module ? 'Edit Training Module' : 'Add Training Module'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Module Name</label>
            {isNewModule && existingModules.length > 0 ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModule(true)}
                    className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                      isNewModule
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    New Module
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewModule(false);
                      setFormData((prev) => ({ ...prev, module_name: '' }));
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                      !isNewModule
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Existing
                  </button>
                </div>
                {isNewModule ? (
                  <input
                    type="text"
                    value={formData.module_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, module_name: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Soft Communications, POSH, CRM"
                    required
                  />
                ) : (
                  <select
                    value={formData.module_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, module_name: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Module</option>
                    {existingModules.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={formData.module_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, module_name: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Soft Communications"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Target Designations
            </label>
            <select
              multiple
              value={formData.designations}
              onChange={handleDesignationsChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
            >
              {availableDesignations.map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customDesignation}
                onChange={(event) => setCustomDesignation(event.target.value)}
                placeholder="Add new designation"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addCustomDesignation}
                className="px-3 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Hold Ctrl/Command to select multiple designations.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Sub-Module Title
            </label>
            <input
              type="text"
              value={formData.sub_module_title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sub_module_title: e.target.value }))
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Executive Presence and Leadership Communication"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">Content File</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {formData.file_name || 'Upload PDF, PPT, or DOC'}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Slides (Optional)
            </label>
            <input
              type="file"
              onChange={handleSlidesChange}
              accept=".ppt,.pptx"
              className="hidden"
              id="slides-upload"
            />
            <label
              htmlFor="slides-upload"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Presentation className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {formData.slides_url ? 'Slides uploaded' : 'Upload Slides'}
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="has_test"
              checked={formData.has_test}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, has_test: e.target.checked }))
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="has_test" className="text-sm font-medium text-slate-700">
              Auto-assign test after module completion
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {module ? 'Update Module' : 'Add Module'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SlidePreviewModal = ({
  module,
  onClose,
}: {
  module: TrainingModule;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Slide Preview: {module.sub_module_title}</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
        <div className="bg-white rounded-lg border border-slate-200 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Presentation className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Slide preview would be displayed here</p>
            <p className="text-sm text-slate-400 mt-2">URL: {module.slides_url}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TestPreviewModal = ({
  module,
  onClose,
}: {
  module: TrainingModule;
  onClose: () => void;
}) => {
  const { tests } = useData();
  const test = tests.find((item) => item.module_id === module.id) || null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Test Preview: {module.sub_module_title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {test ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">{test.title}</h4>
                <p className="text-sm text-blue-700 mb-3">{test.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-600">
                    Duration: <strong>{test.duration_minutes} min</strong>
                  </span>
                  <span className="text-blue-600">
                    Passing Score: <strong>{test.passing_score}%</strong>
                  </span>
                  <span className="text-blue-600">
                    Questions: <strong>{test.questions?.length || 0}</strong>
                  </span>
                </div>
              </div>

              {test.questions && test.questions.length > 0 ? (
                <div className="space-y-4">
                  {test.questions.map((question, index) => (
                    <div key={question.id} className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="font-medium text-slate-900 mb-3">
                        Q{index + 1}. {question.question}
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIdx) => (
                          <div
                            key={optionIdx}
                            className={`p-3 rounded-lg border ${
                              optionIdx === question.answer
                                ? 'bg-green-50 border-green-200 text-green-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {option}
                            {optionIdx === question.answer && ' ✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p>No questions added yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No test found for this module</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
