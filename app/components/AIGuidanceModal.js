'use client';

import { useState, useEffect } from 'react';

export default function AIGuidanceModal({ isOpen, onClose, task, projectId }) {
    const [loading, setLoading] = useState(false);
    const [guidance, setGuidance] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && task) {
            if (task.guidance && task.guidance.action_plan) {
                setGuidance(task.guidance);
            } else {
                fetchGuidance();
            }
        } else {
            setGuidance(null);
            setError(null);
        }
    }, [isOpen, task]);

    const fetchGuidance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/explainability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: task.title,
                    change: task.description || 'No specific roadblock mentioned.',
                    audience: 'developer',
                    projectId: projectId,
                    taskId: task.id
                }),
            });
            if (!res.ok) throw new Error('Failed to fetch guidance');
            const data = await res.json();
            setGuidance(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-950 border border-slate-800 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-slate-900 bg-slate-900/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-100 tracking-tight">AI Agent Guidance</h2>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">{task.title}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl transition-colors text-slate-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto no-scrollbar flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-semibold text-xs animate-pulse tracking-widest uppercase">Consulting Agent Intelligence...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-rose-400 text-center">
                            <p className="font-semibold">Error: {error}</p>
                            <button onClick={fetchGuidance} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-xl font-semibold text-xs">Retry Request</button>
                        </div>
                    ) : guidance && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <section>
                                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-[0.2em] mb-4">Strategic Context</h3>
                                <p className="text-lg text-slate-300 leading-relaxed font-medium italic">"{guidance.context}"</p>
                            </section>

                            <section>
                                <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-[0.2em] mb-4">Action Plan</h3>
                                <div className="space-y-3">
                                    {guidance.action_plan?.map((step, i) => (
                                        <div key={i} className="flex gap-4 p-4 bg-slate-900/50 border border-slate-800/50 rounded-2xl hover:border-emerald-500/30 transition-all group">
                                            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex-shrink-0 flex items-center justify-center font-semibold text-xs shadow-lg shadow-emerald-500/5 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                {i + 1}
                                            </div>
                                            <p className="text-slate-300 font-semibold leading-relaxed">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-slate-900 border border-slate-800 p-6 rounded-3xl group transition-all hover:border-indigo-500/30">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-[0.2em]">External Agent Prompt</h3>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(guidance.ai_prompt);
                                            alert('Prompt copied!');
                                        }}
                                        className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                        Copy Directive
                                    </button>
                                </div>
                                <div className="relative">
                                    <pre className="text-xs text-slate-500 leading-loose whitespace-pre-wrap font-mono line-clamp-4 group-hover:line-clamp-none transition-all cursor-help">
                                        {guidance.ai_prompt}
                                    </pre>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-900 bg-slate-900/50">
                    <button onClick={onClose} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-2xl transition-all shadow-xl shadow-black/20 uppercase tracking-widest text-xs">
                        Dismiss Guidance
                    </button>
                </div>
            </div>
        </div>
    );
}
