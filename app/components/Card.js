export default function Card({ children, title, className = '' }) {
    return (
        <div className={`bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-2xl shadow-indigo-500/5 ${className}`}>
            {title && (
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        {title}
                    </h3>
                </div>
            )}
            {children}
        </div>
    );
}
