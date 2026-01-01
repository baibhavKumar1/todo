import Card from './Card';
import Badge from './Badge';

export default function FocusCard({ task, onAction, isStalled }) {
    if (!task) {
        return (
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                <div className="text-center py-8">
                    <h3 className="text-2xl font-semibold mb-2">All Caught Up!</h3>
                    <p className="text-indigo-100">You have no tasks scheduled for today. Enjoy your free time!</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className={`relative overflow-hidden border-none text-white transition-all duration-500 ${isStalled ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-indigo-600 to-purple-700'}`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${isStalled ? 'bg-white text-orange-600' : 'bg-indigo-400 text-white'}`}>
                                {isStalled ? 'Stalled Detection' : 'Current Focus'}
                            </div>
                            {isStalled && <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>}
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight">{task.title}</h3>
                        <p className="text-white/90 mt-2 text-lg font-medium leading-relaxed">{task.description}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shrink-0">
                        <div className="text-[10px] text-white/60 uppercase font-semibold text-center tracking-tighter">Est. Time</div>
                        <div className="text-2xl font-semibold text-center">{task.estimate_hours}h</div>
                    </div>
                </div>

                {isStalled && (
                    <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 animate-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-orange-600 shrink-0 shadow-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <p className="text-xs font-semibold text-white leading-snug">
                                I noticed you haven't touched this in {task.date < new Date().toISOString().split('T')[0] ? 'a few days' : 'a while'}. Are you struggling with technical constraints?
                            </p>
                        </div>
                        <button
                            onClick={() => onAction(task.id, 'guidance')}
                            className="mt-3 w-full bg-white text-orange-600 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-orange-50 transition-all shadow-sm"
                        >
                            Get Execution Scaffolding
                        </button>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={() => onAction(task.id, 'mark-done')}
                        className={`flex-1 ${isStalled ? 'bg-orange-700 hover:bg-orange-800' : 'bg-white text-indigo-600 hover:bg-indigo-50'} py-4 px-6 rounded-2xl font-semibold transition-all shadow-xl flex items-center justify-center gap-2 group`}
                    >
                        <svg className={`w-5 h-5 transition-transform group-hover:scale-125 ${isStalled ? 'text-white' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {isStalled ? 'Mark Fixed & Done' : 'Complete Task'}
                    </button>
                    <button
                        onClick={() => onAction(task.id, 'skipped')}
                        className={`px-8 py-4 ${isStalled ? 'bg-white/10 hover:bg-white/20' : 'bg-indigo-800/50 hover:bg-indigo-800/70'} text-white rounded-2xl font-semibold backdrop-blur-sm transition-all border border-white/10`}
                    >
                        Skip
                    </button>
                </div>
            </div>
        </Card>
    );
}
