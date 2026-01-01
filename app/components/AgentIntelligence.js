'use client';

import Card from './Card';

export default function AgentIntelligence({ projectData, progressUpdates }) {
    const totalTasks = projectData.milestones?.reduce((acc, m) => acc + (m.tasks?.length || 0), 0) || 0;
    const completedTasks = progressUpdates.filter(p => p.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Determine dynamic message based on project state
    let agentMessage = "Analyzing project topography. I'm looking for bottlenecks in your execution schedule.";
    let statusColor = "text-indigo-600";

    if (projectData.stalled_task_id) {
        agentMessage = "Alert: Stall detected. I've flagged a task that needs immediate scaffolding interventions.";
        statusColor = "text-orange-600";
    } else if (completionRate > 50) {
        agentMessage = "Momentum is high. Your velocity suggests a strong push toward the final milestones.";
        statusColor = "text-emerald-600";
    }

    return (
        <Card className="bg-slate-900 border-none shadow-2xl overflow-hidden relative group">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <div className="relative z-10 flex gap-6 items-center">
                <div className="w-16 h-16 shrink-0 relative">
                    {/* Pulsing AI Core */}
                    <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                    <div className="absolute inset-0 border-2 border-indigo-400/30 rounded-2xl animate-[spin_10s_linear_infinite]"></div>
                    <div className="relative h-full w-full bg-slate-800 rounded-2xl flex items-center justify-center border border-indigo-500/50">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase text-indigo-400 tracking-[0.2em]">Agent Intelligence</span>
                        <div className="h-1 w-1 bg-indigo-400 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed italic">
                        "{agentMessage}"
                    </p>
                    <div className="mt-3 flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Health</span>
                            <span className={`text-xs font-semibold ${statusColor}`}>OPTIMAL</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-800 pl-4">
                            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Velocity</span>
                            <span className="text-xs font-semibold text-white">{Math.round(completionRate)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
