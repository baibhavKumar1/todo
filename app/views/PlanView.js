'use client';
import Card from '../components/Card';
import KanbanBoard from '../components/KanbanBoard';

export default function PlanView({ data, handleNewProject, goalText, setGoalText, optionalDeadline, setOptionalDeadline, handleInferGoal, loading, handleTaskAction, progressUpdates, handleDecompose, handleSchedule }) {
    return (
        <div className="space-y-8 animate-fade-in max-w-8xl mx-auto">
            {!data.objective && (
                <Card title="Start Your Journey">
                    <div className="flex gap-5 items-center ">
                        <textarea
                            placeholder="e.g. Define your goal..."
                            value={goalText}
                            onChange={(e) => setGoalText(e.target.value)}
                            className="w-5/6 p-4 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all placeholder-slate-600"
                            rows={3}
                        />
                        <div className="flex flex-col w-1/6 *:p-2 gap-4 ">
                            <input
                                type="date"
                                value={optionalDeadline}
                                onChange={(e) => setOptionalDeadline(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg outline-none text-slate-300 bg-white/50 text-black"
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
                            <h3 className="text-lg font-semibold text-white ">Task Board</h3>
                            <button onClick={() => handleDecompose()} className="px-3 py-1 bg-indigo-500/40 text-indigo-400 border border-indigo-500/20 rounded font-semibold hover:bg-indigo-500 hover:text-white transition-all">Regenerate Blueprint</button>
                        </div>
                        <KanbanBoard
                            milestones={data.milestones}
                            scheduledTasks={data.scheduled_tasks}
                            progressUpdates={progressUpdates}
                            onTaskAction={handleTaskAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
