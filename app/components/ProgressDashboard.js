'use client';

import Card from './Card';

export default function ProgressDashboard({ plan, progressUpdates = [] }) {
    if (!plan || !plan.milestones) return null;

    const totalHours = plan.total_estimated_hours || plan.milestones.reduce((acc, m) => acc + (m.estimate_hours || 0), 0);

    const completedHours = progressUpdates
        .filter(p => p.status === 'done' || p.percent_complete === 1.0)
        .reduce((sum, p) => {
            // Find the task estimate
            let estimate = 0;
            for (const m of plan.milestones) {
                const task = m.tasks.find(t => t.id === p.task_id);
                if (task) {
                    estimate = task.estimate_hours || 0;
                    break;
                }
            }
            return sum + estimate;
        }, 0);

    const completionPercentage = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;
    const remainingHours = Math.max(0, totalHours - completedHours);

    // Simple deadline health calculation
    const isDeadlineApproaching = (deadline) => {
        if (!deadline) return false;
        const today = new Date();
        const target = new Date(deadline);
        const diffTime = target - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    const deadlineWarning = isDeadlineApproaching(plan.deadline);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Main Progress Ring */}
            <Card className="md:col-span-2 flex items-center justify-between bg-slate-900/50 overflow-hidden relative group border-slate-800 shadow-2xl shadow-indigo-500/5">
                <div className="relative z-10">
                    <h3 className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">Overall Progress</h3>
                    <div className="text-4xl font-semibold text-slate-100 tracking-tight">{completionPercentage}%</div>
                    <p className="text-slate-400 text-xs mt-1 font-semibold italic">
                        {completedHours}h of {totalHours}h completed
                    </p>
                </div>

                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-800"
                        />
                        <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100}
                            className="text-indigo-500 transition-all duration-1000 ease-out shadow-lg"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-indigo-500/40 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500" />
            </Card>

            {/* Stats Cards */}
            <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-center">
                <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">Remaining</div>
                <div className="text-2xl font-semibold text-slate-100">{remainingHours}h</div>
                <div className="w-full bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 shadow-lg shadow-amber-500/20"
                        style={{ width: `${100 - completionPercentage}%` }}
                    />
                </div>
            </Card>

            <Card className={`bg-slate-900/50 border-slate-800 flex flex-col justify-center ${deadlineWarning ? 'ring-2 ring-rose-500 ring-offset-2 animate-pulse bg-rose-500/5' : ''}`}>
                <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">Deadline</div>
                <div className={`text-xl font-semibold ${deadlineWarning ? 'text-rose-400' : 'text-slate-100'}`}>
                    {plan.deadline || 'No Date'}
                </div>
                {deadlineWarning && (
                    <div className="text-[10px] text-rose-500 font-semibold mt-1 uppercase tracking-widest animate-pulse">Critical!</div>
                )}
            </Card>
        </div>
    );
}
