'use client';
import Card from '../components/Card';
import GanttChart from '../components/GanttChart';

export default function ScheduleView({ data, progressUpdates, handleReplan }) {
    return (
        <div className="space-y-8 animate-fade-in max-w-8xl mx-auto">
            {data.scheduled_tasks ? (
                <>
                    <div className="flex justify-between items-center px-1">
                        <div>
                            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-widest">Execution Timeline</h3>
                            <p className="text-xs text-slate-500 mt-1">Staggered task view with stacking logic</p>
                        </div>
                        <button onClick={() => handleReplan('Optimize schedule')} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold hover:bg-amber-500 hover:text-white transition-all">Optimize Flow</button>
                    </div>

                    <GanttChart
                        scheduledTasks={data.scheduled_tasks}
                        milestones={data.milestones}
                        progressUpdates={progressUpdates}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2" title="Daily Agenda">
                            <p className="text-[10px] text-slate-500 font-semibold uppercase mb-4 -mt-2">Your chronological path to goal completion</p>
                            <div className="divide-y divide-slate-800">
                                {data.scheduled_tasks.map((task) => (
                                    <div key={task.task_id} className="py-3 flex justify-between items-center group">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{task.task_id}</span>
                                            <span className="text-[10px] text-slate-500">{task.date}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${progressUpdates.some(p => p.task_id === task.task_id && p.status === 'done') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                            {progressUpdates.some(p => p.task_id === task.task_id && p.status === 'done') ? 'DONE' : 'PLANNED'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="text-center py-24 bg-slate-900/50 border border-dashed border-slate-800 rounded-[40px]">
                    <h3 className="text-xl font-semibold text-slate-100 mb-2">No Schedule Yet</h3>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto text-xs">Build your plan first, then generate the blueprint.</p>
                </div>
            )}
        </div>
    );
}
