import React from 'react';
import { Circle, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

export default function StateTimelinePanel({ state }) {
    const steps = [
        { id: 'RECEIVED', label: 'RECEIVED' },
        { id: 'PROCESSING', label: 'PROCESSING' },
        { id: 'FAILED', label: 'FAILED' },
        { id: 'RETRY', label: 'RETRY' },
        { id: 'COMPLETED', label: 'COMPLETED' }
    ];

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between border-b-2 border-black pb-6">
                <h2 className="text-black text-2xl font-black tracking-tight uppercase">Lifecycle</h2>
                <div className="text-xs font-black font-mono text-white bg-black px-4 py-2 uppercase tracking-[0.2em]">
                    {state}
                </div>
            </div>

            <div className="space-y-8 relative">
                <div className="absolute left-[20px] top-4 bottom-4 w-1 bg-black" />

                {steps.map((step, idx) => {
                    const isActive = state === step.id;
                    const isPast = steps.findIndex(s => s.id === state) > idx;

                    return (
                        <div key={step.id} className="relative flex items-center gap-10">
                            <div className={`relative z-10 w-11 h-11 border-4 flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-white border-black scale-110' :
                                    isPast ? 'bg-black border-black' :
                                        'bg-white border-slate-200'
                                }`}>
                                {isPast && <div className="w-3 h-3 bg-white" />}
                                {isActive && <div className="w-4 h-4 bg-black" />}
                            </div>

                            <div className={`text-sm font-black uppercase tracking-[0.3em] transition-all ${isActive ? 'text-black translate-x-2' : isPast ? 'text-slate-400' : 'text-slate-200'}`}>
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
