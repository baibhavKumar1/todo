'use client';

import Header from './components/Header';
import FooterChat from './components/FooterChat';
import Toast from './components/Toast';
import AIGuidanceModal from './components/AIGuidanceModal';
import FocusView from './views/FocusView';
import PlanView from './views/PlanView';
import ScheduleView from './views/ScheduleView';
import StatsView from './views/StatsView';
import useProject from './hooks/useProject';

export default function Home() {
  const project = useProject();

  const currentTask = (() => {
    if (!project.data.scheduled_tasks) return null;
    const today = new Date().toISOString().split('T')[0];
    const task = project.data.scheduled_tasks.find(t => t.date === today && !project.progressUpdates.some(pu => pu.task_id === t.task_id && pu.status === 'done'));
    if (task && project.data.milestones) {
      for (const m of project.data.milestones) {
        const found = m.tasks.find(t => t.id === task.task_id);
        if (found) return { ...task, title: found.title, description: found.description };
      }
    }
    return task;
  })();

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-900/30 selection:text-indigo-200 pb-24">
      <Header
        projectId={project.projectId}
        projects={project.projects}
        handleSwitchProject={project.handleSwitchProject}
        activeTab={project.activeTab}
        setActiveTab={project.setActiveTab}
      />

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">


        {project.activeTab === 'focus' && <FocusView currentTask={currentTask} progressUpdates={project.progressUpdates} onTaskAction={project.handleTaskAction} scheduledTasks={project.data.scheduled_tasks} />}
        {project.activeTab === 'plan' && <PlanView {...project} />}
        {project.activeTab === 'schedule' && <ScheduleView data={project.data} progressUpdates={project.progressUpdates} handleReplan={project.handleReplan} />}

        {project.activeTab === 'stats' && <StatsView plan={project.data} progressUpdates={project.progressUpdates} />}

        {project.activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <Card title="Availability" className="bg-slate-900/50 border-slate-800">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3">Daily Capacity (Hours)</label>
                  <input type="number" value={project.userProfile.avg_hours_per_day} onChange={(e) => project.setUserProfile({ ...project.userProfile, avg_hours_per_day: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3">Active Workdays</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <button key={day} onClick={() => project.toggleWorkday(day)} className={`px-4 py-2 rounded-lg text-[10px] font-semibold transition-all ${project.userProfile.workdays.includes(day) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950 text-slate-600 border border-slate-900'}`}>{day.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <FooterChat {...project} />

      <AIGuidanceModal isOpen={project.isGuidanceModalOpen} onClose={() => project.setIsGuidanceModalOpen(false)} task={project.selectedTaskForGuidance} projectId={project.projectId} />

      <div className="fixed bottom-24 right-6 flex flex-col gap-3 pointer-events-none z-50">
        {project.toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto animate-slide-up">
            <Toast message={toast.message} type={toast.type} onClose={() => project.removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
