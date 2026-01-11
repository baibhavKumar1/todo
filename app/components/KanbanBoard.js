'use client';

import TaskCard from './TaskCard';

export default function KanbanBoard({ milestones, scheduledTasks = [], progressUpdates = [], onTaskAction }) {
    if (!milestones || milestones.length === 0) return null;

    const isTaskCompleted = (taskId) => {
        return progressUpdates.some(p => p.task_id === taskId && (p.status === 'done' || p.percent_complete === 1.0));
    };

    return (
        <div className="space-y-12">
            {milestones.map((milestone, mIdx) => {
                const milestoneTasks = milestone.tasks || [];
                const completedCount = milestoneTasks.filter(t => isTaskCompleted(t.id)).length;
                const progress = milestoneTasks.length > 0 ? (completedCount / milestoneTasks.length) * 100 : 0;

                return (
                    <div key={milestone.id || mIdx} className="flex flex-col md:flex-row gap-6 group animate-in slide-in-from-left duration-500" style={{ animationDelay: `${mIdx * 100}ms` }}>
                        {/* Sidebar: Milestone Metadata */}
                        <div className="md:w-64 flex-shrink-0 flex flex-col pt-2">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-xl font-semibold text-sm shadow-lg transition-colors ${progress === 100 ? 'bg-emerald-600 shadow-emerald-500/20 text-white' : 'bg-indigo-600 shadow-indigo-500/20 text-white'
                                    }`}>
                                    {mIdx + 1}
                                </span>
                                <h3 className="font-semibold text-slate-100 tracking-tight leading-tight  transition-colors">
                                    {milestone.title}
                                </h3>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl shadow-black/20 space-y-3 relative overflow-hidden">
                                {progress === 100 && (
                                    <div className="absolute top-0 right-0 p-1 bg-emerald-600 text-white opacity-20">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    </div>
                                )}

                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Progress</span>
                                    <span className="text-xs font-semibold text-slate-300">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex -space-x-2">
                                        {milestoneTasks.slice(0, 3).map((_, i) => (
                                            <div key={i} className="w-5 h-5 rounded-full border-2 border-slate-900 bg-slate-800"></div>
                                        ))}
                                        {milestoneTasks.length > 3 && (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-900 bg-indigo-900 flex items-center justify-center text-[8px] font-semibold text-indigo-300">
                                                +{milestoneTasks.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{completedCount}/{milestoneTasks.length} Complete</span>
                                </div>
                            </div>
                        </div>

                        {/* Task Area: Horizontal Scroll */}
                        <div className="flex-1 min-w-0">
                            <div className="relative group/scroll">
                                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x scroll-smooth">
                                    {milestoneTasks.map((task) => {
                                        const scheduledTask = scheduledTasks.find(st => st.task_id === task.id);
                                        return (
                                            <div key={task.id} className="min-w-[350px] max-w-[350px] snap-start">
                                                <TaskCard
                                                    task={task}
                                                    onAction={onTaskAction}
                                                    isCompleted={isTaskCompleted(task.id)}
                                                    date={scheduledTask?.date}
                                                />
                                            </div>
                                        );
                                    })}

                                    {milestoneTasks.length === 0 && (
                                        <div className="w-full flex flex-col items-center justify-center py-10 text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                                            <span className="text-xs font-medium italic opacity-60">No tasks defined for this phase</span>
                                        </div>
                                    )}

                                    {/* Spacer for scroll end */}
                                    <div className="min-w-[40px] flex-shrink-0"></div>
                                </div>

                                {/* Scroll Indicators (only visible on hover) */}
                                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
