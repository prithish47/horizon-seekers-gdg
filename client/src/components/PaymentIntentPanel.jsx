import React, { useState } from 'react';
import { CreditCard, Zap, AlertTriangle, CheckCircle, WifiOff, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentIntentPanel({ onInitiate, onRetry, isProcessing, canRetry, currentKey }) {
    const [amount, setAmount] = useState(100);
    const [outcome, setOutcome] = useState('SUCCESS');

    return (
        <div className="border-4 border-black p-10 space-y-10 bg-white">
            <div className="flex items-center justify-between border-b-2 border-black pb-8">
                <div className="space-y-1">
                    <h2 className="text-black text-2xl font-black tracking-tight uppercase text-high-contrast">Configuration</h2>
                    <p className="text-black text-[10px] font-black uppercase tracking-[0.3em]">Parameters</p>
                </div>
                <CreditCard className="w-8 h-8 text-black" strokeWidth={3} />
            </div>

            <div className="space-y-10 relative z-10">
                <div className="space-y-4">
                    <label className="text-xs font-black text-black uppercase tracking-[0.3em] block underline decoration-4">Authorize Amount</label>
                    <div className="relative group/input">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-black font-black text-3xl">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-white border-b-4 border-black py-4 pl-10 pr-4 outline-none transition-all font-mono text-4xl text-black font-black"
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-black text-black uppercase tracking-[0.3em] block underline decoration-4">Simulation Strategy</label>
                    <div className="grid grid-cols-1 gap-2">
                        <Option
                            active={outcome === 'SUCCESS'}
                            onClick={() => setOutcome('SUCCESS')}
                            label="Normal Execution"
                        />
                        <Option
                            active={outcome === 'BANK_FAILURE'}
                            onClick={() => setOutcome('BANK_FAILURE')}
                            label="Bank Failure (502)"
                        />
                        <Option
                            active={outcome === 'NETWORK_ERROR'}
                            onClick={() => setOutcome('NETWORK_ERROR')}
                            label="Network Error (504)"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    {!canRetry ? (
                        <button
                            onClick={() => onInitiate(amount, outcome)}
                            disabled={isProcessing}
                            className="w-full h-20 bg-black text-white font-black text-sm uppercase tracking-[0.3em] hover:bg-slate-800 disabled:bg-slate-200 transition-all flex items-center justify-center gap-4"
                        >
                            {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : (
                                <>
                                    Authorize Payment
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => onRetry(amount, outcome)}
                            disabled={isProcessing}
                            className="w-full h-20 bg-white border-4 border-black text-black font-black text-sm uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-4"
                        >
                            {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : (
                                <>
                                    Retry Execution
                                    <Zap className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {currentKey && (
                    <div className="pt-6 border-t-2 border-black">
                        <span className="text-[10px] font-black font-mono text-black uppercase tracking-tighter break-all">IDEM_KEY: {currentKey}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function Option({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 w-full p-6 border-2 transition-all duration-200 ${active ? 'bg-black text-white border-black' : 'bg-white text-black border-slate-200 hover:border-black'
                }`}
        >
            <span className="text-xs font-black uppercase tracking-[0.2em]">
                {label}
            </span>
            {active && <div className="ml-auto w-3 h-3 bg-white" />}
        </button>
    )
}
