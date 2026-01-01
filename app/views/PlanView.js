'use client';
import Card from '../components/Card';
import KanbanBoard from '../components/KanbanBoard';

export default function PlanView({ data, handleNewProject, goalText, setGoalText, optionalDeadline, setOptionalDeadline, handleInferGoal, loading, emphasizedTaskIds, handleTaskAction, progressUpdates, handleDecompose, handleSchedule }) {
    return (
        <div className="space-y-8 animate-fade-in max-w-8xl mx-auto">
            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <h2 className="text-lg font-semibold text-slate-100 mb-1">{data.goal || 'Define your goal'}</h2>
                        <p className="text-xs text-slate-500 italic">{data.objective || 'Tell the AI what you want to achieve'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleNewProject} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold hover:bg-indigo-500 hover:text-white transition-all">New Project</button>
                    </div>
                </div>
            </Card>

            {!data.objective && (
                <Card title="Start Your Journey">
                    <div className="space-y-4 text-slate-100">
                        <textarea
                            placeholder="e.g. Master React in 30 days..."
                            value={goalText}
                            onChange={(e) => setGoalText(e.target.value)}
                            className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all placeholder-slate-600"
                        />
                        <div className="flex gap-4">
                            <input
                                type="date"
                                value={optionalDeadline}
                                onChange={(e) => setOptionalDeadline(e.target.value)}
                                className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded-lg outline-none text-slate-300"
                            />
                            <button onClick={handleInferGoal} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50">Generate Plan</button>
                        </div>
                    </div>
                </Card>
            )}

            {data.milestones && (
                <>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-widest">Kanban Board</h3>
                            <button onClick={handleDecompose} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-semibold hover:bg-indigo-500 hover:text-white transition-all">Regenerate Blueprint</button>
                        </div>
                        <KanbanBoard
                            milestones={data.milestones}
                            scheduledTasks={data.scheduled_tasks}
                            progressUpdates={progressUpdates}
                            emphasizedTaskIds={emphasizedTaskIds}
                            onTaskAction={handleTaskAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
