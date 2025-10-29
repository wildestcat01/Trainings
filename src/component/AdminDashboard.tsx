import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Users,
  Layers,
  BarChart3,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { Dashboard } from './Dashboard';
import { TrainingModules } from './TrainingModules';
import { EmployeeManagement } from './EmployeeManagement';
import { TeamManagement } from './BatchManagement';
import { Reports } from './Reports';
import { PostTrainingAssignments } from './PostTrainingAssignments';

type TabType = 'overview' | 'modules' | 'employees' | 'teams' | 'reports' | 'post-training';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { signOut, user } = useAuth();

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'modules' as TabType, label: 'Training Modules', icon: BookOpen },
    { id: 'employees' as TabType, label: 'Employee Mgt', icon: Users },
    { id: 'teams' as TabType, label: 'Team Management', icon: Layers },
    { id: 'reports' as TabType, label: 'Reports', icon: BarChart3 },
    { id: 'post-training' as TabType, label: 'Post Assignments', icon: ClipboardList },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Training Portal</h1>
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-2xl font-bold text-slate-900">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <Dashboard />}
          {activeTab === 'modules' && <TrainingModules />}
          {activeTab === 'employees' && <EmployeeManagement />}
          {activeTab === 'teams' && <TeamManagement />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'post-training' && <PostTrainingAssignments />}
        </main>
      </div>
    </div>
  );
};
