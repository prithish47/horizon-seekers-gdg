import React, { useState } from 'react';
import { CreditCard, Zap, AlertTriangle, CheckCircle, WifiOff, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentIntentPanel({ onInitiate, onRetry, isProcessing, canRetry, currentKey }) {
    const [amount, setAmount] = useState(100);
    const [outcome, setOutcome] = useState('SUCCESS');

    return (
        <div className="card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Payment Configuration</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Set parameters and simulate</p>
                </div>
                <CreditCard className="w-6 h-6 text-blue-600" />
            </div>

            <div className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">
                        Payment Amount (in Rupees)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        placeholder="Enter amount in rupees"
                        className="input-field text-lg font-semibold"
                        disabled={isProcessing}
                        min="1"
                    />
                </div>

                {/* Outcome Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block">
                        Simulation Mode
                    </label>
                    <div className="space-y-2">
                        <Option
                            active={outcome === 'SUCCESS'}
                            onClick={() => setOutcome('SUCCESS')}
                            icon={<CheckCircle className="w-5 h-5" />}
                            label="Normal Success"
                            description="Payment completes successfully"
                        />
                        <Option
                            active={outcome === 'BANK_FAILURE'}
                            onClick={() => setOutcome('BANK_FAILURE')}
                            icon={<AlertTriangle className="w-5 h-5" />}
                            label="Bank Failure"
                            description="Simulates 502 error from bank"
                        />
                        <Option
                            active={outcome === 'NETWORK_ERROR'}
                            onClick={() => setOutcome('NETWORK_ERROR')}
                            icon={<WifiOff className="w-5 h-5" />}
                            label="Network Timeout"
                            description="Response lost (504 timeout)"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                    {!canRetry ? (
                        <button
                            onClick={() => onInitiate(amount, outcome)}
                            disabled={isProcessing}
                            className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Initiate Payment
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => onRetry(amount, outcome)}
                            disabled={isProcessing}
                            className="btn-secondary w-full h-12 flex items-center justify-center gap-2 border-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    Retrying...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Retry with Same Key
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Current Key Display */}
                {currentKey && (
                    <div className="pt-4 border-t border-slate-200">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <span className="text-xs font-semibold text-slate-500 block mb-1">Idempotency Key</span>
                            <code className="text-xs font-mono text-slate-700 break-all">{currentKey}</code>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Option({ active, onClick, icon, label, description }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-start gap-3 w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${active
                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            <div className={`mt-0.5 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${active ? 'text-blue-900' : 'text-slate-700'}`}>
                    {label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                    {description}
                </div>
            </div>
            {active && (
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
            )}
        </button>
    );
}