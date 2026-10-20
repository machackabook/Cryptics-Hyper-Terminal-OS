import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Lock, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Terminal, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  Zap 
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

interface FinancialAccount {
  id: string;
  provider: 'stripe' | 'cashapp';
  name: string;
  accountNumber: string;
  status: string;
  balance: number;
  currency: string;
  payoutSchedule: string;
  riskLevel: string;
  lastSynced: string;
}

interface Transaction {
  id: string;
  provider: 'stripe' | 'cashapp';
  type: string;
  amount: number;
  currency: string;
  status: string;
  customer: string;
  timestamp: string;
}

export const PaymentGatewayModule: React.FC = () => {
  const { addLedger, addTerminalLine } = useCryptic();
  
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [providerStatus, setProviderStatus] = useState('UNVERIFIED');
  
  // Form states for secure proxy test
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [recipientInput, setRecipientInput] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    try {
      setSyncing(true);
      const [accRes, txRes] = await Promise.all([
        fetch('/api/payment/accounts'),
        fetch('/api/payment/transactions')
      ]);

      const accData = await accRes.json();
      const txData = await txRes.json();

      const ready = accRes.ok && txRes.ok && accData.success === true && txData.success === true;
      setProviderStatus(ready ? 'VERIFIED_BACKEND_RESPONSE' : 'NOT_CONFIGURED');
      setAccounts(ready && Array.isArray(accData.accounts) ? accData.accounts : []);
      setTransactions(ready && Array.isArray(txData.transactions) ? txData.transactions : []);
      if (ready && accData.accounts?.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accData.accounts[0].id);
      } else if (!ready) {
        setSelectedAccountId('');
      }
    } catch (err) {
      setProviderStatus('UNREACHABLE');
      setAccounts([]);
      setTransactions([]);
      console.error('Failed to fetch payment gateway telemetry', err);
      addTerminalLine('Failed to retrieve financial accounts from backend proxy.', 'bad');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
    addLedger('PAYMENT_GATEWAY_INITIALIZED', { status: 'AWAITING_PROVIDER_VERIFICATION' });
    addTerminalLine('PaymentGateway module loaded. Provider connectivity is not verified until a real authenticated backend confirms it.', 'system');
  }, []);

  const handleExecuteSecureProxyAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const account = accounts.find(a => a.id === selectedAccountId);
    if (!account) {
      setActionMessage({ text: 'Select a valid financial account.', type: 'error' });
      return;
    }

    const numericAmount = parseFloat(amountInput);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setActionMessage({ text: 'Enter a valid numeric amount.', type: 'error' });
      return;
    }

    setProcessing(true);
    setActionMessage(null);

    const endpoint = account.provider === 'stripe' 
      ? '/api/payment/stripe/charge' 
      : '/api/payment/cashapp/transfer';

    const payload = account.provider === 'stripe'
      ? { amount: numericAmount, currency: account.currency, customerId: recipientInput, sourceAccountId: account.id }
      : { amount: numericAmount, currency: account.currency, recipientCashtag: recipientInput, sourceAccountId: account.id };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        setActionMessage({ text: result.message, type: 'success' });
        addTerminalLine(`[SECURE PROXY] ${account.provider.toUpperCase()} transaction ${result.transaction.id} processed successfully. Amount: $${numericAmount}`, 'good');
        addLedger('PAYMENT_PROXIED_SUCCESS', { provider: account.provider, amount: numericAmount, txId: result.transaction.id });
        
        // Refresh data
        fetchData();
      } else {
        setActionMessage({ text: result.error || 'Transaction failed via proxy.', type: 'error' });
        addTerminalLine(`[SECURE PROXY ERROR] ${result.error}`, 'bad');
      }
    } catch (err) {
      console.error('Backend proxy error:', err);
      setActionMessage({ text: 'Network connection error with backend proxy.', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 font-mono text-xs overflow-y-auto p-4 space-y-4">
      {/* Top Security Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3 flex items-center justify-between shadow-inner">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-md border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-emerald-300 tracking-wide flex items-center space-x-2">
              <span>PAYMENT GATEWAY // CAPABILITY STATUS</span>
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px]">{providerStatus}</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Account balances, provider connection, and transactions remain unavailable until verified by an authenticated backend.
            </p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          disabled={syncing}
          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>Sync Gateway</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">Total Consolidated Liquidity</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {providerStatus === 'VERIFIED_BACKEND_RESPONSE' ? '
            </div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">Connected Payment Bridges</div>
            <div className="text-lg font-bold text-sky-400 mt-0.5">
              {accounts.length} Active Channels
            </div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">Proxy Security Shield</div>
            <div className="text-lg font-bold text-purple-400 mt-0.5 flex items-center space-x-1">
              <Lock className="w-4 h-4 inline text-purple-400" />
              <span>{providerStatus === 'VERIFIED_BACKEND_RESPONSE' ? 'BACKEND RESPONSE' : 'UNVERIFIED'}</span>
            </div>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Server className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Connected Financial Accounts Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-neutral-300 font-semibold tracking-wide flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>CONNECTED FINANCIAL ACCOUNTS (STRIPE & CASH APP)</span>
          </h3>
          <span className="text-[10px] text-neutral-400">Proxied via Node.js Express Backend</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loading ? (
            <div className="col-span-2 py-8 text-center text-neutral-500">Loading connected accounts...</div>
          ) : accounts.map((acc) => (
            <div 
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`bg-neutral-900/60 border rounded-lg p-3.5 cursor-pointer transition-all ${
                selectedAccountId === acc.id 
                  ? 'border-emerald-500/60 bg-emerald-950/10 shadow-lg shadow-emerald-950/20' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    acc.provider === 'stripe' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {acc.provider}
                  </span>
                  <span className="font-medium text-neutral-200">{acc.name}</span>
                </div>
                <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{acc.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 text-[11px]">
                <div className="bg-neutral-950/50 p-2 rounded border border-neutral-800/80">
                  <div className="text-neutral-400 text-[10px]">Account / Identifier</div>
                  <div className="font-mono text-neutral-300 mt-0.5">{acc.accountNumber}</div>
                </div>
                <div className="bg-neutral-950/50 p-2 rounded border border-neutral-800/80">
                  <div className="text-neutral-400 text-[10px]">Available Balance</div>
                  <div className="font-mono text-emerald-400 font-bold mt-0.5">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800">
                <span>Payout: {acc.payoutSchedule}</span>
                <span className="text-emerald-400">Risk: {acc.riskLevel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secure Backend Proxy Execution Panel */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-neutral-300 font-semibold tracking-wide flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>SECURE PROXY TRANSACTION EXECUTION</span>
          </h3>
          <span className="text-[10px] text-neutral-400">{providerStatus === 'VERIFIED_BACKEND_RESPONSE' ? 'BACKEND VERIFIED' : 'NOT CONFIGURED'}</span>
        </div>

        <form onSubmit={handleExecuteSecureProxyAction} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Target Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.provider.toUpperCase()} - ${acc.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Amount ({accounts.find(a => a.id === selectedAccountId)?.currency || 'USD'})</label>
            <input
              type="number"
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Customer / Recipient ID</label>
            <input
              type="text"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={processing || providerStatus !== 'VERIFIED_BACKEND_RESPONSE' || !selectedAccountId}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded flex items-center justify-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${processing ? 'animate-pulse' : ''}`} />
              <span>{processing ? 'Processing...' : providerStatus === 'VERIFIED_BACKEND_RESPONSE' ? 'Submit to Backend' : 'Provider Not Connected'}</span>
            </button>
          </div>
        </form>

        {actionMessage && (
          <div className={`p-2.5 rounded text-xs flex items-center space-x-2 ${
            actionMessage.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'bg-red-950/60 text-red-300 border border-red-500/40'
          }`}>
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-neutral-300 font-semibold tracking-wide flex items-center space-x-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>SECURE GATEWAY TRANSACTION LEDGER</span>
          </h3>
          <span className="text-[10px] text-neutral-400">{transactions.length} Recorded Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[10px]">
                <th className="py-2 px-2">TX ID</th>
                <th className="py-2 px-2">Provider</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Amount</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Customer / Recipient</th>
                <th className="py-2 px-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-neutral-800/30">
                  <td className="py-2 px-2 font-mono text-neutral-300">{tx.id}</td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      tx.provider === 'stripe' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {tx.provider}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-neutral-300 capitalize">{tx.type}</td>
                  <td className="py-2 px-2 font-bold text-emerald-400">${tx.amount.toFixed(2)}</td>
                  <td className="py-2 px-2">
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>{tx.status}</span>
                    </span>
                  </td>
                  <td className="py-2 px-2 text-neutral-300">{tx.customer}</td>
                  <td className="py-2 px-2 text-neutral-400">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
 + totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'UNAVAILABLE'}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">Connected Payment Bridges</div>
            <div className="text-lg font-bold text-sky-400 mt-0.5">
              {accounts.length} Active Channels
            </div>
          </div>
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">Proxy Security Shield</div>
            <div className="text-lg font-bold text-purple-400 mt-0.5 flex items-center space-x-1">
              <Lock className="w-4 h-4 inline text-purple-400" />
              <span>AES-256 / TLS</span>
            </div>
          </div>
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Server className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Connected Financial Accounts Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-neutral-300 font-semibold tracking-wide flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>CONNECTED FINANCIAL ACCOUNTS (STRIPE & CASH APP)</span>
          </h3>
          <span className="text-[10px] text-neutral-400">Proxied via Node.js Express Backend</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loading ? (
            <div className="col-span-2 py-8 text-center text-neutral-500">Loading connected accounts...</div>
          ) : accounts.map((acc) => (
            <div 
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`bg-neutral-900/60 border rounded-lg p-3.5 cursor-pointer transition-all ${
                selectedAccountId === acc.id 
                  ? 'border-emerald-500/60 bg-emerald-950/10 shadow-lg shadow-emerald-950/20' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    acc.provider === 'stripe' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {acc.provider}
                  </span>
                  <span className="font-medium text-neutral-200">{acc.name}</span>
                </div>
                <span className="flex items-center space-x-1 text-emerald-400 text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{acc.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 text-[11px]">
                <div className="bg-neutral-950/50 p-2 rounded border border-neutral-800/80">
                  <div className="text-neutral-400 text-[10px]">Account / Identifier</div>
                  <div className="font-mono text-neutral-300 mt-0.5">{acc.accountNumber}</div>
                </div>
                <div className="bg-neutral-950/50 p-2 rounded border border-neutral-800/80">
                  <div className="text-neutral-400 text-[10px]">Available Balance</div>
                  <div className="font-mono text-emerald-400 font-bold mt-0.5">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800">
                <span>Payout: {acc.payoutSchedule}</span>
                <span className="text-emerald-400">Risk: {acc.riskLevel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Secure Backend Proxy Execution Panel */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-neutral-300 font-semibold tracking-wide flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>SECURE PROXY TRANSACTION EXECUTION</span>
          </h3>
          <span className="text-[10px] text-neutral-400">Backend Proxy Endpoint Active</span>
        </div>

        <form onSubmit={handleExecuteSecureProxyAction} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Target Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.provider.toUpperCase()} - ${acc.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Amount ({accounts.find(a => a.id === selectedAccountId)?.currency || 'USD'})</label>
            <input
              type="number"
              step="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 mb-1">Customer / Recipient ID</label>
            <input
              type="text"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={processing}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded flex items-center justify-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${processing ? 'animate-pulse' : ''}`} />
              <span>{processing ? 'Proxying...' : 'Execute Secure Proxy'}</span>
            </button>
          </div>
        </form>

        {actionMessage && (
          <div className={`p-2.5 rounded text-xs flex items-center space-x-2 ${
            actionMessage.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'bg-red-950/60 text-red-300 border border-red-500/40'
          }`}>
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-neutral-300 font-semibold tracking-wide flex items-center space-x-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>SECURE GATEWAY TRANSACTION LEDGER</span>
          </h3>
          <span className="text-[10px] text-neutral-400">{transactions.length} Recorded Transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[10px]">
                <th className="py-2 px-2">TX ID</th>
                <th className="py-2 px-2">Provider</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Amount</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Customer / Recipient</th>
                <th className="py-2 px-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-neutral-800/30">
                  <td className="py-2 px-2 font-mono text-neutral-300">{tx.id}</td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      tx.provider === 'stripe' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {tx.provider}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-neutral-300 capitalize">{tx.type}</td>
                  <td className="py-2 px-2 font-bold text-emerald-400">${tx.amount.toFixed(2)}</td>
                  <td className="py-2 px-2">
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>{tx.status}</span>
                    </span>
                  </td>
                  <td className="py-2 px-2 text-neutral-300">{tx.customer}</td>
                  <td className="py-2 px-2 text-neutral-400">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
