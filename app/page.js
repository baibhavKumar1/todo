'use client';

import Header from './components/Header';
import FooterChat from './components/FooterChat';
import Toast from './components/Toast';
import AIGuidanceModal from './components/AIGuidanceModal';
import FocusView from './views/FocusView';
import PlanView from './views/PlanView';
import ScheduleView from './views/ScheduleView';
import ProgressDashboard from './components/ProgressDashboard';
import Card from './components/Card';
import Badge from './components/Badge';
import useProject from './hooks/useProject';

export default function Home() {
  const p = useProject();

  const getEmphasizedTasks = () => {
    if (!p.data.milestones) return [];
    const allTasks = p.data.milestones.flatMap(m => m.tasks || []);
    return allTasks.filter(t => p.emphasizedTaskIds.includes(t.id));
  };

  const currentTask = (() => {
    if (!p.data.scheduled_tasks) return null;
    const today = new Date().toISOString().split('T')[0];
    const task = p.data.scheduled_tasks.find(t => t.date === today && !p.progressUpdates.some(pu => pu.task_id === t.task_id && pu.status === 'done'));
    if (task && p.data.milestones) {
      for (const m of p.data.milestones) {
        const found = m.tasks.find(t => t.id === task.task_id);
        if (found) return { ...task, title: found.title, description: found.description };
      }
    }
    return task;
  })();

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-900/30 selection:text-indigo-200 pb-24">
      <Header
        projectId={p.projectId}
        projects={p.projects}
        handleSwitchProject={p.handleSwitchProject}
      />

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <nav className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {['focus', 'plan', 'schedule', 'stats', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => p.setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${p.activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {p.activeTab === 'focus' && <FocusView currentTask={currentTask} progressUpdates={p.progressUpdates} onTaskAction={p.handleTaskAction} emphasizedTasks={getEmphasizedTasks()} scheduledTasks={p.data.scheduled_tasks} />}
        {p.activeTab === 'plan' && <PlanView {...p} />}
        {p.activeTab === 'schedule' && <ScheduleView data={p.data} progressUpdates={p.progressUpdates} handleReplan={p.handleReplan} />}

        {p.activeTab === 'stats' && (
          <div className="space-y-8 animate-fade-in max-w-8xl mx-auto">
            <ProgressDashboard plan={p.data} progressUpdates={p.progressUpdates} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Risk Factors" className="bg-slate-900/50 border-slate-800">
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Deadline Risk</span><Badge color="green">Low</Badge></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400">Task Complexity</span><Badge color="amber">Medium</Badge></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {p.activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <Card title="Availability" className="bg-slate-900/50 border-slate-800">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3">Daily Capacity (Hours)</label>
                  <input type="number" value={p.userProfile.avg_hours_per_day} onChange={(e) => p.setUserProfile({ ...p.userProfile, avg_hours_per_day: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3">Active Workdays</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <button key={day} onClick={() => p.toggleWorkday(day)} className={`px-4 py-2 rounded-lg text-[10px] font-semibold transition-all ${p.userProfile.workdays.includes(day) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950 text-slate-600 border border-slate-900'}`}>{day.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <FooterChat {...p} />

      <AIGuidanceModal isOpen={p.isGuidanceModalOpen} onClose={() => p.setIsGuidanceModalOpen(false)} task={p.selectedTaskForGuidance} projectId={p.projectId} />

      <div className="fixed bottom-24 right-6 flex flex-col gap-3 pointer-events-none z-50">
        {p.toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto animate-slide-up">
            <Toast message={toast.message} type={toast.type} onClose={() => p.removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
