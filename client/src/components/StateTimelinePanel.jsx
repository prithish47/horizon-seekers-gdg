import React from 'react';
import { Circle, CheckCircle2, AlertCircle, Clock, Loader2, RotateCcw } from 'lucide-react';

export default function StateTimelinePanel({ state }) {
    const steps = [
        {
            id: 'RECEIVED',
            label: 'Received',
            icon: Circle,
            description: 'Request received'
        },
        {
            id: 'PROCESSING',
            label: 'Processing',
            icon: Loader2,
            description: 'Payment in progress'
        },
        {
            id: 'COMPLETED',
            label: 'Completed',
            icon: CheckCircle2,
            description: 'Successfully processed'
        },
        {
            id: 'FAILED',
            label: 'Failed',
            icon: AlertCircle,
            description: 'Processing failed'
        },
        {
            id: 'RETRY',
            label: 'Retry',
            icon: RotateCcw,
            description: 'Awaiting retry'
        }
    ];

    const getStepStatus = (stepId) => {
        if (state === stepId) return 'active';

        const stateOrder = {
            'RECEIVED': 0,
            'PROCESSING': 1,
            'COMPLETED': 2,
            'FAILED': 2,
            'RETRY': 3,
            'NETWORK_ERROR': 3
        };

        const currentIndex = stateOrder[state] || 0;
        const stepIndex = stateOrder[stepId] || 0;

        if (stepIndex < currentIndex) return 'completed';
        return 'pending';
    };

    return (
        <div className="card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Transaction Lifecycle</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Current state tracking</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${state === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        state === 'FAILED' ? 'bg-red-100 text-red-700' :
                            state === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                state === 'RETRY' || state === 'NETWORK_ERROR' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                    }`}>
                    {state}
                </div>
            </div>

            <div className="space-y-4 relative">
                {/* Connecting line */}
                <div className="absolute left-[21px] top-8 bottom-8 w-0.5 bg-slate-200" />

                {steps.map((step, idx) => {
                    const status = getStepStatus(step.id);
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className={`relative flex items-start gap-4 transition-all duration-300 ${status === 'active' ? 'scale-105' : ''
                                }`}
                        >
                            {/* Step indicator */}
                            <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${status === 'active'
                                    ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200'
                                    : status === 'completed'
                                        ? 'bg-green-600 border-green-600'
                                        : 'bg-white border-slate-300'
                                }`}>
                                <Icon className={`w-5 h-5 ${status === 'active' || status === 'completed'
                                        ? 'text-white'
                                        : 'text-slate-400'
                                    } ${status === 'active' && step.id === 'PROCESSING' ? 'animate-spin' : ''}`}
                                />
                            </div>

                            {/* Step content */}
                            <div className="flex-1 pt-2">
                                <div className={`text-sm font-semibold transition-all ${status === 'active'
                                        ? 'text-blue-900'
                                        : status === 'completed'
                                            ? 'text-slate-700'
                                            : 'text-slate-400'
                                    }`}>
                                    {step.label}
                                </div>
                                <div className={`text-xs mt-0.5 ${status === 'active' || status === 'completed'
                                        ? 'text-slate-500'
                                        : 'text-slate-400'
                                    }`}>
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}