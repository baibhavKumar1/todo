'use client';

export default function GanttChart({ scheduledTasks = [], milestones = [], progressUpdates = [] }) {
    if (!scheduledTasks || scheduledTasks.length === 0) return (
        <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
            <div className="text-slate-400 font-medium italic">No scheduled tasks found to visualize.</div>
        </div>
    );

    // Group tasks by date for "Stacking" logic
    const tasksByDate = (scheduledTasks || []).reduce((acc, st) => {
        if (!acc[st.date]) acc[st.date] = [];
        // Find task details from milestones
        let taskDetails = null;
        for (const m of milestones) {
            const t = m.tasks?.find(task => task.id === st.task_id);
            if (t) {
                taskDetails = t;
                break;
            }
        }
        acc[st.date].push({ ...st, ...taskDetails });
        return acc;
    }, {});

    const dates = Object.keys(tasksByDate).sort();
    const isDone = (taskId) => progressUpdates.some(p => p.task_id === taskId && p.status === 'done');

    return (
        <div className="w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="p-8 border-b border-slate-900 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-100 tracking-tight">Project Timeline</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20" />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Planned</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
                <div className="min-w-max p-8">
                    <div className="flex gap-12 items-start">
                        {dates.map((date, idx) => {
                            const dayTasks = tasksByDate[date];
                            const totalHours = dayTasks.reduce((sum, t) => {
                                const val = parseFloat(t.estimate_hours);
                                return sum + (isNaN(val) ? 0 : val);
                            }, 0);

                            const isToday = date === new Date().toISOString().split('T')[0];

                            return (
                                <div key={date} className={`flex flex-col gap-6 group animate-in slide-in-from-right duration-500`} style={{ animationDelay: `${idx * 100}ms` }}>
                                    {/* Date Header */}
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                                            {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-2xl font-semibold tracking-tighter ${isToday ? 'text-slate-100' : 'text-slate-400'}`}>
                                                {new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                                                {totalHours.toFixed(1)}h
                                            </span>
                                        </div>
                                    </div>

                                    {/* Task Stack */}
                                    <div className="flex flex-col gap-3 min-w-[240px]">
                                        {dayTasks.map((t) => (
                                            <div
                                                key={t.task_id}
                                                className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-default group/task ${isDone(t.task_id)
                                                    ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 shadow-xl shadow-black/20'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start gap-3 mb-2">
                                                    <h4 className={`text-xs font-semibold leading-relaxed ${isDone(t.task_id) ? 'text-emerald-400 line-through' : 'text-slate-200'}`}>
                                                        {t.title || 'Untitled Task'}
                                                    </h4>
                                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${isDone(t.task_id) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                                        {t.estimate_hours}h
                                                    </span>
                                                </div>
                                                {t.priority && !isDone(t.task_id) && (
                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${t.priority.toLowerCase() === 'high' ? 'bg-rose-500' : t.priority.toLowerCase() === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                        <span className="text-[8px] font-semibold uppercase text-slate-500 tracking-widest">{t.priority}</span>
                                                    </div>
                                                )}
                                                {isDone(t.task_id) && (
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                        <span className="text-[8px] font-semibold uppercase text-emerald-500 tracking-widest">Complete</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
