export default function Badge({ children, color = 'slate' }) {
    const colors = {
        slate: 'bg-slate-800 text-slate-400 border-slate-700',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color] || colors.slate}`}>
            {children}
        </span>
    );
}
