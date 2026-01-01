'use client';

export default function Header({ projectId, projects, handleSwitchProject }) {
    return (
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-indigo-500/20 shadow-lg">
                        AI
                    </div>

                    <div className="relative group">
                        <select
                            value={projectId || ''}
                            onChange={(e) => handleSwitchProject(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none hover:bg-slate-700 transition-colors cursor-pointer appearance-none pr-8"
                        >
                            <option value="" disabled>Select Project</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.goal || p.projectName || 'Untitled Project'}</option>
                            ))}
                            <option value="new">+ New Project</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="w-8" /> {/* Spacer */}
            </div>
        </header>
    );
}
