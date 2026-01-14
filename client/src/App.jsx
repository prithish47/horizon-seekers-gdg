import React, { useState, useEffect } from 'react';
import { initiatePayment } from './services/api';
import PaymentIntentPanel from './components/PaymentIntentPanel';
import StateTimelinePanel from './components/StateTimelinePanel';
import LogConsolePanel from './components/LogConsolePanel';
import SummaryTable from './components/SummaryTable';
import { RefreshCw, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentKey, setCurrentKey] = useState('');
  const [currentStatus, setCurrentStatus] = useState('RECEIVED');
  const [isProcessing, setIsProcessing] = useState(false);
  const [canRetry, setCanRetry] = useState(false);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const handleNewTransaction = () => {
    setCurrentKey('');
    setCurrentStatus('RECEIVED');
    setCanRetry(false);
    setIsProcessing(false);
    addLog('System reset. Ready for new transaction.', 'info');
  };

  const updateTransactionHistory = (key, data, amount, statusOverride) => {
    setTransactions(prev => {
      const existingIndex = prev.findIndex(t => t.key === key);
      const newState = statusOverride || data?.state || 'UNKNOWN';
      const isCached = data?.message?.includes("already performed") || false;

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          state: newState,
          attempts: updated[existingIndex].attempts + 1,
          transactionId: data?.transaction_id || updated[existingIndex].transactionId,
          cached: isCached || updated[existingIndex].cached
        };
        return updated;
      } else {
        return [{
          id: crypto.randomUUID(),
          intent: `Payment $${amount}`,
          state: newState,
          attempts: 1,
          transactionId: data?.transaction_id || '',
          key: key,
          cached: false,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev];
      }
    });
  };

  const processPayment = async (key, amount, outcome) => {
    setIsProcessing(true);
    setCurrentStatus('PROCESSING');

    addLog(`Initiating request: ${key.slice(0, 8)}...`, 'info');

    setTransactions(prev => {
      if (!prev.find(t => t.key === key)) {
        return [{
          id: crypto.randomUUID(),
          intent: `Payment $${amount}`,
          state: 'PROCESSING',
          attempts: 0,
          transactionId: '',
          key: key,
          cached: false,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev];
      }
      return prev;
    });

    const result = await initiatePayment({
      idempotency_key: key,
      amount,
      simulate_outcome: outcome
    });

    setIsProcessing(false);

    if (result.status === 504) {
      addLog('Network drop simulated. Response lost.', 'warning');
      setCanRetry(true);
      updateTransactionHistory(key, null, amount, 'NETWORK_ERROR');
      setCurrentStatus('RETRY');
      return;
    }

    if (result.data) {
      const data = result.data;

      if (data.state === 'FAILED') {
        addLog(`Transaction failed: ${data.message}`, 'error');
        setCurrentStatus('FAILED');
      } else {
        addLog(`Transaction successful. ${data.message}`, 'success');
        setCurrentStatus('COMPLETED');
      }

      if (data.message && data.message.includes("already performed")) {
        addLog('Idempotency check: duplicate request prevented.', 'success');
      }

      setCanRetry(true);
      updateTransactionHistory(key, data, amount);
    } else {
      addLog(`Error: ${result.error}`, 'error');
      setCurrentStatus('FAILED');
      setCanRetry(true);
      updateTransactionHistory(key, null, amount, 'FAILED');
    }
  };

  const handleInitiate = (amount, outcome) => {
    const newKey = crypto.randomUUID();
    setCurrentKey(newKey);
    setCanRetry(false);
    processPayment(newKey, amount, outcome);
  };

  const handleRetry = (amount, outcome) => {
    if (currentKey) {
      addLog(`Retrying request: ${currentKey.slice(0, 8)}...`, 'info');
      processPayment(currentKey, amount, outcome);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen p-8 md:p-12 lg:p-20 bg-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20 border-b-4 border-black pb-12">
        <div className="flex items-center gap-6">
          <ShieldCheck className="w-10 h-10 text-black" strokeWidth={3} />
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight uppercase">
              Idempotent Engine Simulator
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleNewTransaction}
            className="minimal-btn flex items-center gap-3 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            New Transaction
          </button>
          <div className="px-6 py-3 border-4 border-black bg-black text-white flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">System Live</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4 space-y-12">
          <PaymentIntentPanel
            onInitiate={handleInitiate}
            onRetry={handleRetry}
            isProcessing={isProcessing}
            canRetry={canRetry}
            currentKey={currentKey}
          />
          <div className="border-4 border-black p-10">
            <StateTimelinePanel state={currentStatus} />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <div className="h-[500px] border-4 border-black">
            <LogConsolePanel logs={logs} />
          </div>
          <div className="border-4 border-black overflow-hidden">
            <SummaryTable transactions={transactions} />
          </div>
        </div>
      </main>

      <footer className="mt-20 pt-12 border-t border-black flex flex-col md:flex-row justify-between items-center gap-4 text-black text-[12px] uppercase font-black tracking-[0.4em]">
        <span>Secure Idempotent Processing</span>
        <span>Idempotent Engine Simulator Lab</span>
      </footer>
    </div>
  );
}
