import React, { useRef, useEffect } from 'react';
import { Terminal, Activity, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function LogConsolePanel({ logs }) {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const getLogIcon = (type) => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'error': return XCircle;
            case 'warning': return AlertTriangle;
            default: return Info;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Terminal className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">System Logs</h3>
                        <p className="text-xs text-slate-500">Real-time activity monitor</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="badge badge-info">
                        {logs.length} events
                    </div>
                </div>
            </div>

            {/* Log content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50">
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                        <Activity className="w-12 h-12 opacity-20" />
                        <div className="text-sm font-medium">No activity yet</div>
                        <div className="text-xs text-slate-400">Logs will appear here when you initiate a payment</div>
                    </div>
                )}
                {logs.map((log) => {
                    const Icon = getLogIcon(log.type);

                    return (
                        <div
                            key={log.id}
                            className={`animate-slide-in bg-white rounded-lg p-4 border-l-4 shadow-sm ${log.type === 'error' ? 'border-red-500' :
                                    log.type === 'success' ? 'border-green-500' :
                                        log.type === 'warning' ? 'border-amber-500' :
                                            'border-blue-500'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 ${log.type === 'error' ? 'text-red-600' :
                                        log.type === 'success' ? 'text-green-600' :
                                            log.type === 'warning' ? 'text-amber-600' :
                                                'text-blue-600'
                                    }`}>
                                    <Icon className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-xs font-mono text-slate-400">
                                            {log.timestamp}
                                        </span>
                                        <span className={`text-xs font-semibold uppercase ${log.type === 'error' ? 'text-red-600' :
                                                log.type === 'success' ? 'text-green-600' :
                                                    log.type === 'warning' ? 'text-amber-600' :
                                                        'text-blue-600'
                                            }`}>
                                            {log.type}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-700 leading-relaxed">
                                        {log.message}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>
        </div>
    );
}