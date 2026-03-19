import React, { useState, useEffect } from 'react';
import { initiatePayment } from './services/api';
import PaymentIntentPanel from './components/PaymentIntentPanel';
import StateTimelinePanel from './components/StateTimelinePanel';
import LogConsolePanel from './components/LogConsolePanel';
import SummaryTable from './components/SummaryTable';
import { RefreshCw, ShieldCheck, Zap, Activity } from 'lucide-react';

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
          cached: isCached || updated[existingIndex].cached,
          intent: `Payment ₹${amount}`
        };
        return updated;
      } else {
        return [{
          id: crypto.randomUUID(),
          intent: `Payment ₹${amount}`,
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
    // Validate amount on frontend too
    if (!amount || amount <= 0) {
      addLog('Invalid amount - please enter a valid amount', 'error');
      setCurrentStatus('FAILED');
      return;
    }

    setIsProcessing(true);
    setCurrentStatus('PROCESSING');

    addLog(`Initiating payment request...`, 'info');

    setTransactions(prev => {
      if (!prev.find(t => t.key === key)) {
        return [{
          id: crypto.randomUUID(),
          intent: `Payment ₹${amount}`,
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
      addLog('Network timeout - response lost but payment may have succeeded', 'warning');
      setCanRetry(true);
      updateTransactionHistory(key, null, amount, 'NETWORK_ERROR');
      setCurrentStatus('RETRY');
      return;
    }

    // Handle amount mismatch error (409 conflict)
    if (result.status === 409 && result.data?.state === 'CONFLICT') {
      addLog(`Error: ${result.data.message}`, 'error');
      setCurrentStatus('FAILED');
      setCanRetry(false); // Don't allow retry with different amount
      updateTransactionHistory(key, result.data, amount, 'CONFLICT');
      return;
    }

    // Handle invalid amount error (400)
    if (result.status === 400) {
      addLog(`Error: ${result.data?.message || result.error}`, 'error');
      setCurrentStatus('FAILED');
      setCanRetry(false);
      return;
    }

    if (result.data) {
      const data = result.data;

      if (data.state === 'FAILED') {
        addLog(`Payment failed: ${data.message}`, 'error');
        setCurrentStatus('FAILED');
      } else if (data.state === 'CONFLICT') {
        addLog(`Conflict: ${data.message}`, 'error');
        setCurrentStatus('FAILED');
        setCanRetry(false);
      } else {
        addLog(`Payment successful - Transaction ID: ${data.transaction_id?.slice(0, 8)}...`, 'success');
        setCurrentStatus('COMPLETED');
      }

      if (data.message && data.message.includes("already performed")) {
        addLog('Idempotency check passed - duplicate request prevented', 'success');
      }

      setCanRetry(data.state !== 'CONFLICT');
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
      addLog(`Retrying with same idempotency key...`, 'info');
      processPayment(currentKey, amount, outcome);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Fail-Safe Payment Processor
                </h1>
                <p className="text-sm text-slate-500">Ensuring exactly-once execution and transaction integrity</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleNewTransaction}
                className="btn-secondary flex items-center gap-2 text-sm"
                disabled={isProcessing}
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                New Transaction
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-green-700">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls & State */}
          <div className="lg:col-span-1 space-y-6">
            <PaymentIntentPanel
              onInitiate={handleInitiate}
              onRetry={handleRetry}
              isProcessing={isProcessing}
              canRetry={canRetry}
              currentKey={currentKey}
            />
            <StateTimelinePanel state={currentStatus} />
          </div>

          {/* Right Column - Logs & History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px]">
              <LogConsolePanel logs={logs} />
            </div>
            <SummaryTable transactions={transactions} />
          </div>
        </div>
      </main>

    </div>
  );
}