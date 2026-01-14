import React from 'react';
import { Database, TrendingUp, History, Copy } from 'lucide-react';

export default function SummaryTable({ transactions }) {
    return (
        <div className="overflow-hidden bg-white">
            <div className="px-10 py-8 border-b-4 border-black bg-white flex items-center justify-between">
                <h2 className="text-sm font-black text-black uppercase tracking-[0.4em] flex items-center gap-4">
                    <History className="w-6 h-6" strokeWidth={3} />
                    Transaction Ledger
                </h2>
                <div className="flex items-center gap-6 text-[11px] text-black font-black uppercase tracking-[0.2em] font-mono">
                    <Database className="w-5 h-5" strokeWidth={3} />
                    READ_ONLY_ACCESS
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-black">
                    <thead className="bg-black text-white font-black text-[11px] uppercase tracking-[0.3em] border-b-4 border-black">
                        <tr>
                            <th className="px-10 py-6">State</th>
                            <th className="px-10 py-6">Authorization</th>
                            <th className="px-10 py-6">Cycles</th>
                            <th className="px-10 py-6">Checksum</th>
                            <th className="px-10 py-6 text-right">Idem_Key</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-10 py-32 text-center text-slate-200 font-black font-mono tracking-[0.6em] italic uppercase">
                                    Ledger Is Empty.
                                </td>
                            </tr>
                        )}
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-all duration-200">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-4 h-4 rounded-none ${tx.state === 'COMPLETED' ? 'bg-green-600' :
                                            tx.state === 'FAILED' ? 'bg-red-600' :
                                                tx.state === 'PROCESSING' ? 'bg-black' :
                                                    'bg-slate-200'
                                            }`} />
                                        <span className={`font-black tracking-[0.2em] uppercase text-[12px] ${tx.state === 'COMPLETED' ? 'text-green-700' :
                                            tx.state === 'FAILED' ? 'text-red-700' :
                                                'text-black'
                                            }`}>
                                            {tx.state}
                                        </span>
                                        {tx.cached && (
                                            <span className="text-[10px] bg-black text-white px-3 py-1 font-black tracking-widest uppercase ml-4">CACHED</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-10 py-8 font-black text-black tracking-tight text-lg">
                                    {tx.intent.replace(/\$/g, '₹')}
                                </td>
                                <td className="px-10 py-8 font-black font-mono text-[12px] text-black">
                                    [{tx.attempts.toString().padStart(2, '0')}]
                                </td>
                                <td className="px-10 py-8 font-mono text-[12px] text-black uppercase tracking-widest">
                                    {tx.transactionId ? tx.transactionId.split('-')[0] : '——'}
                                </td>
                                <td className="px-10 py-8 font-mono text-[12px] text-black text-right">
                                    <div className="flex items-center justify-end gap-4 group/key">
                                        <span className="font-black select-all">
                                            {tx.key.slice(0, 8)}...
                                        </span>
                                        <Copy className="w-4 h-4 cursor-pointer hover:text-black transition-colors" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
