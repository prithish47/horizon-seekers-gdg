import React, { useRef, useEffect } from 'react';
import { Terminal, Cpu, Shield, Activity } from 'lucide-react';

export default function LogConsolePanel({ logs }) {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-white group overflow-hidden">
            <div className="bg-white px-8 py-6 border-b-4 border-black flex justify-between items-center relative overflow-hidden">
                {/* Simple moving scan bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-black/5 animate-[scan_4s_linear_infinite] pointer-events-none" />

                <h3 className="text-black font-black text-sm uppercase tracking-[0.4em] flex items-center gap-4 relative z-10">
                    <Terminal className="w-6 h-6" strokeWidth={3} />
                    System.Logs
                </h3>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em]">
                        {logs.length} EVT
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 font-mono text-[12px] space-y-6 bg-white">
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-200 space-y-8">
                        <Activity className="w-16 h-16 opacity-20" strokeWidth={3} />
                        <div className="uppercase tracking-[0.5em] text-[12px] font-black italic text-slate-300">Awaiting Data Stream...</div>
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-10">
                        <div className={`absolute left-0 top-1.5 bottom-1.5 w-1.5 ${log.type === 'error' ? 'bg-red-600' :
                            log.type === 'success' ? 'bg-green-600' :
                                log.type === 'warning' ? 'bg-amber-500' :
                                    'bg-black'
                            }`} />

                        <div className="flex justify-between items-baseline mb-2">
                            <span className="text-slate-300 text-[10px] font-black uppercase tracking-tighter">{log.timestamp}</span>
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] font-mono ${log.type === 'error' ? 'text-red-600' :
                                log.type === 'success' ? 'text-green-600' :
                                    log.type === 'warning' ? 'text-amber-600' :
                                        'text-black'
                                }`}>
                                [{log.type.toUpperCase()}]
                            </div>
                        </div>

                        <div className={`leading-relaxed font-black uppercase tracking-tight text-sm ${log.type === 'error' ? 'text-red-900' :
                            log.type === 'success' ? 'text-green-900' :
                                log.type === 'warning' ? 'text-amber-900' :
                                    'text-black'
                            }`}>
                            {log.message}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
