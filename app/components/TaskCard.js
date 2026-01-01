'use client';
import { useState } from 'react';

export default function TaskCard({ task, onAction, isCompleted = false, isEmphasized = false, date = null }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const priorityColors = {
        high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };

    return (
        <div className={`group relative bg-slate-900 border rounded-2xl p-5 transition-all duration-300 ${isCompleted ? 'opacity-50' : ''} ${isEmphasized ? 'border-amber-500/50 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/20' : 'border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5'}`}>
            {isEmphasized && (
                <div className="absolute -top-2.5 -right-2.5 z-20">
                    <div className="bg-amber-500 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20 animate-bounce">
                        EMP
                    </div>
                </div>
            )}
            <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                    <h4 className={`text-base font-semibold text-slate-100 mb-1 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                    </h4>
                    <p className={`text-xs text-slate-400 italic leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {task.description}
                    </p>
                    {task.description?.length > 100 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mt-2 hover:text-indigo-300 transition-colors"
                        >
                            {isExpanded ? 'Collapse' : 'View Full Content'}
                        </button>
                    )}
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${priorityColors[task.priority?.toLowerCase()] || priorityColors.medium}`}>
                    {task.priority || 'Medium'}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {task.tags?.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[10px] font-medium border border-slate-700">
                        #{tag}
                    </span>
                ))}
                {date && (
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-semibold border border-indigo-500/20 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </span>
                )}
                <span className="ml-auto text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {task.estimate_hours}h
                </span>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                <button
                    onClick={() => onAction(task.id, isCompleted ? 'mark-undone' : 'mark-done')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${isCompleted
                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-600 hover:text-white border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20'
                        }`}
                >
                    {isCompleted ? '↩ Mark Undone' : '✅ Mark Done'}
                </button>

                <button
                    onClick={() => onAction(task.id, 'guidance')}
                    className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-600 hover:text-white transition-all group/btn"
                    title="Get AI Guidance"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </button>

                <button
                    onClick={() => onAction(task.id, 'emphasize')}
                    className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
                    title="Emphasize Task"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                </button>

                <button
                    onClick={() => onAction(task.id, 'edit')}
                    className="p-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition-all"
                    title="Edit Task"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            </div>

            {!isCompleted && (
                <div className="absolute top-0 right-0 -tr-2 -rt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Add a subtle highlight or indicator if needed */}
                </div>
            )}
        </div>
    );
}
