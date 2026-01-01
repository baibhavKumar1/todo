'use client';

export default function FooterChat({ chatMessages, chatMessagesRef, agentTrace, chatInput, setChatInput, handleChatSubmit, loading }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-4 shadow-2xl z-40">
            <div className="max-w-3xl mx-auto">
                {chatMessages.length > 0 && (
                    <div ref={chatMessagesRef} className="mb-4 max-h-48 overflow-y-auto no-scrollbar space-y-3 p-2">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'}`}>
                                    {msg.content}
                                    {msg.role === 'assistant' && loading && i === chatMessages.length - 1 && (
                                        <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse ml-2" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {agentTrace.length > 0 && (
                    <div className="mx-8 mb-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Agent Trace Log</span>
                        </div>
                        <div className="space-y-1">
                            {agentTrace.slice(-3).map((trace, i) => (
                                <div key={i} className="text-[10px] text-slate-500 font-semibold flex items-center gap-2">
                                    <span className="text-slate-700 opacity-50">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                    <span>{trace}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleChatSubmit} className="relative">
                    <input
                        type="text"
                        placeholder="Talk to your agent..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium placeholder-slate-500 shadow-inner"
                    />
                    <button type="submit" disabled={loading || !chatInput.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
