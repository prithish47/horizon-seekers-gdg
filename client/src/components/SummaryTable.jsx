import React from 'react';
import { Database, Clock, Copy, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SummaryTable({ transactions }) {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const getStateIcon = (state) => {
        switch (state) {
            case 'COMPLETED': return CheckCircle;
            case 'FAILED': return XCircle;
            case 'PROCESSING': return Loader2;
            default: return Clock;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <Database className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Transaction History</h2>
                            <p className="text-xs text-slate-500">Recent payment attempts</p>
                        </div>
                    </div>
                    <div className="badge badge-neutral">
                        {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Attempts
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Transaction ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Idempotency Key
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                                        <Database className="w-10 h-10 opacity-20" />
                                        <div className="text-sm font-medium">No transactions yet</div>
                                        <div className="text-xs">Initiate a payment to see history</div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {transactions.map((tx) => {
                            const StateIcon = getStateIcon(tx.state);

                            return (
                                <tr
                                    key={tx.id}
                                    className="hover:bg-slate-50 transition-colors duration-150"
                                >
                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg ${tx.state === 'COMPLETED' ? 'bg-green-100' :
                                                    tx.state === 'FAILED' ? 'bg-red-100' :
                                                        tx.state === 'PROCESSING' ? 'bg-blue-100' :
                                                            'bg-slate-100'
                                                }`}>
                                                <StateIcon className={`w-4 h-4 ${tx.state === 'COMPLETED' ? 'text-green-600' :
                                                        tx.state === 'FAILED' ? 'text-red-600' :
                                                            tx.state === 'PROCESSING' ? 'text-blue-600 animate-spin' :
                                                                'text-slate-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <div className={`text-sm font-semibold ${tx.state === 'COMPLETED' ? 'text-green-700' :
                                                        tx.state === 'FAILED' ? 'text-red-700' :
                                                            'text-slate-700'
                                                    }`}>
                                                    {tx.state}
                                                </div>
                                                {tx.cached && (
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        (Cached)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-900">
                                            {tx.intent}
                                        </div>
                                    </td>

                                    {/* Attempts */}
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                                            <span className="text-xs font-mono font-semibold">
                                                {tx.attempts}x
                                            </span>
                                        </div>
                                    </td>

                                    {/* Transaction ID */}
                                    <td className="px-6 py-4">
                                        <code className="text-xs font-mono text-slate-600">
                                            {tx.transactionId ? tx.transactionId.split('-')[0] : '—'}
                                        </code>
                                    </td>

                                    {/* Idempotency Key */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs font-mono text-slate-600">
                                                {tx.key.slice(0, 8)}...
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(tx.key)}
                                                className="p-1 hover:bg-slate-100 rounded transition-colors"
                                                title="Copy full key"
                                            >
                                                <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}