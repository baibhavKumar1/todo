'use client';

export default function MilestoneTimeline({ milestones, activeMilestoneIndex = 0, onMilestoneClick }) {
    if (!milestones || milestones.length === 0) return null;

    return (
        <div className="relative w-full py-8">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 transition-all duration-700 ease-out"
                    style={{ width: `${(activeMilestoneIndex / (milestones.length - 1)) * 100}%` }}
                />
            </div>

            {/* Milestones Container */}
            <div className="relative flex justify-between items-center w-full">
                {milestones.map((milestone, idx) => {
                    const isActive = idx === activeMilestoneIndex;
                    const isCompleted = idx < activeMilestoneIndex;

                    return (
                        <div
                            key={milestone.id || idx}
                            className="flex flex-col items-center gap-4 group cursor-pointer"
                            style={{ width: `${100 / milestones.length}%` }}
                            onClick={() => onMilestoneClick?.(idx)}
                        >
                            <div className="relative z-10 flex items-center justify-center">
                                {/* Node Circle */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive
                                        ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-200 scale-125'
                                        : isCompleted
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-slate-200 hover:border-indigo-300'
                                    }`}>
                                    {isCompleted ? (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span className={`text-xs font-semibold ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                                            {idx + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Pulse for Active Node */}
                                {isActive && (
                                    <div className="absolute top-0 left-0 w-10 h-10 bg-indigo-400 rounded-full animate-ping opacity-20" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="text-center px-2">
                                <div className={`text-xs font-semibold whitespace-nowrap mb-1 transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-500'
                                    }`}>
                                    {milestone.title}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                    {milestone.estimate_hours}h total
                                </div>
                            </div>

                            {/* Tooltip on Hover */}
                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl pointer-events-none max-w-[150px] text-center">
                                {milestone.description}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-slate-800" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
