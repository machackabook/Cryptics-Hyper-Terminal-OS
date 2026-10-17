import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  ArrowRightLeft, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Zap, 
  Lock, 
  ExternalLink,
  QrCode,
  Sliders,
  Activity,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';
import { ArbitragePair, ArbitrageTradeLog } from '../../types';
import { ArbitrageMonitor } from './ArbitrageMonitor';

export const FinancialArbitrageModule: React.FC = () => {
  const { addTerminalLine, addLedger, syncActive } = useCryptic();
  const [activeTab, setActiveTab] = useState<'arbitrage' | 'monitor' | 'stripe' | 'cashapp' | 'trades'>('arbitrage');
  const [autoExecute, setAutoExecute] = useState<boolean>(false);
  const [minSpreadThreshold, setMinSpreadThreshold] = useState<number>(0.75); // %
  const [accountBalanceUsd, setAccountBalanceUsd] = useState<number>(54820.50);
  const [totalProfitEarned, setTotalProfitEarned] = useState<number>(1842.30);
  const [tradeStatusMsg, setTradeStatusMsg] = useState<string | null>(null);

  // Stripe State
  const [stripeApiKey, setStripeApiKey] = useState('pk_test_51MzSovereignCrypticStripeKey001');
  const [stripeAmount, setStripeAmount] = useState('250.00');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeSuccess, setStripeSuccess] = useState<string | null>(null);

  // Cash App State
  const [cashtag, setCashtag] = useState('$TheArchitect7');
  const [cashAppLoggedIn, setCashAppLoggedIn] = useState(true);
  const [cashAmount, setCashAmount] = useState('100.00');
  const [cashStatus, setCashStatus] = useState<string | null>(null);

  // Live pairs
  const [pairs, setPairs] = useState<ArbitragePair[]>([
    {
      id: 'pair-1',
      symbol: 'BTC/USD',
      exchangeA: { name: 'Kraken Global', bid: 68420.00, ask: 68440.00 },
      exchangeB: { name: 'Binance US', bid: 69120.00, ask: 69150.00 },
      spreadPercent: 1.02,
      potentialProfitUsd: 700.00,
      status: 'OPTIMAL',
      lastUpdated: 'Just now'
    },
    {
      id: 'pair-2',
      symbol: 'ETH/USDT',
      exchangeA: { name: 'Coinbase Pro', bid: 3480.50, ask: 3482.00 },
      exchangeB: { name: 'OKX Liquidity', bid: 3518.00, ask: 3520.00 },
      spreadPercent: 1.08,
      potentialProfitUsd: 375.50,
      status: 'OPTIMAL',
      lastUpdated: '1s ago'
    },
    {
      id: 'pair-3',
      symbol: 'SOL/USDC',
      exchangeA: { name: 'Raydium DEX', bid: 178.20, ask: 178.50 },
      exchangeB: { name: 'Kraken Global', bid: 180.40, ask: 180.80 },
      spreadPercent: 1.23,
      potentialProfitUsd: 220.00,
      status: 'OPTIMAL',
      lastUpdated: 'Just now'
    },
    {
      id: 'pair-4',
      symbol: 'EUR/USD (Forex)',
      exchangeA: { name: 'Interactive Brokers', bid: 1.0820, ask: 1.0822 },
      exchangeB: { name: 'LMAX Sovereign', bid: 1.0885, ask: 1.0888 },
      spreadPercent: 0.60,
      potentialProfitUsd: 650.00,
      status: 'MONITORING',
      lastUpdated: '2s ago'
    }
  ]);

  // Trade Execution Logs
  const [tradeLogs, setTradeLogs] = useState<ArbitrageTradeLog[]>([
    {
      id: 'tx-01',
      timestamp: '10:48:12',
      pair: 'BTC/USD',
      buyExchange: 'Kraken Global',
      sellExchange: 'Binance US',
      amount: 1.5,
      profitUsd: 480.20,
      feeUsd: 14.50,
      settlementMethod: 'STRIPE_API',
      txHash: '0x8f2a...e9b1'
    },
    {
      id: 'tx-02',
      timestamp: '10:42:05',
      pair: 'ETH/USDT',
      buyExchange: 'Coinbase Pro',
      sellExchange: 'OKX Liquidity',
      amount: 10.0,
      profitUsd: 320.40,
      feeUsd: 8.20,
      settlementMethod: 'CASH_APP_PAY',
      txHash: '0x1c4d...3e7a'
    }
  ]);

  // Periodic price fluctuations
  useEffect(() => {
    if (!syncActive) return;

    const interval = setInterval(() => {
      setPairs(prev => prev.map(p => {
        const delta = (Math.random() * 0.4 - 0.2);
        const newSpread = Math.max(0.2, Number((p.spreadPercent + delta).toFixed(2)));
        const newProfit = Math.round(newSpread * 500);
        return {
          ...p,
          spreadPercent: newSpread,
          potentialProfitUsd: newProfit,
          status: newSpread >= minSpreadThreshold ? 'OPTIMAL' : 'MONITORING',
          lastUpdated: 'Just now'
        };
      }));

      // If auto-execute is enabled, execute optimal spread trades
      if (autoExecute) {
        const optimal = pairs.find(p => p.spreadPercent >= minSpreadThreshold);
        if (optimal && Math.random() > 0.6) {
          executeArbitrageTrade(optimal);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [autoExecute, minSpreadThreshold, pairs, syncActive]);

  const executeArbitrageTrade = (pair: ArbitragePair) => {
    const profit = pair.potentialProfitUsd;
    setAccountBalanceUsd(prev => prev + profit);
    setTotalProfitEarned(prev => prev + profit);

    const newLog: ArbitrageTradeLog = {
      id: `tx-${Date.now().toString(36)}`,
      timestamp: new Date().toLocaleTimeString(),
      pair: pair.symbol,
      buyExchange: pair.exchangeA.name,
      sellExchange: pair.exchangeB.name,
      amount: 1.0,
      profitUsd: profit,
      feeUsd: 6.50,
      settlementMethod: 'INTERNAL_LEDGER',
      txHash: '0x' + Math.random().toString(16).substring(2, 10)
    };

    setTradeLogs(prev => [newLog, ...prev.slice(0, 19)]);
    setTradeStatusMsg(`Executed ${pair.symbol} Arbitrage: +$${profit.toFixed(2)} USD profit secured.`);
    addTerminalLine(`[FINANCIAL ARBITRAGE]: Settled ${pair.symbol} spread (+${pair.spreadPercent}%) across ${pair.exchangeA.name} -> ${pair.exchangeB.name}. Profit: +$${profit.toFixed(2)}`, 'good');
    addLedger('arbitrage.trade_executed', { pair: pair.symbol, profitUsd: profit, hash: newLog.txHash });
    setTimeout(() => setTradeStatusMsg(null), 3500);
  };

  const handleStripeCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setStripeLoading(true);
    setStripeSuccess(null);
    addTerminalLine(`[STRIPE API]: Creating payment intent for $${stripeAmount} USD via ${stripeApiKey.substring(0, 15)}...`, 'system');

    setTimeout(() => {
      setStripeLoading(false);
      setStripeSuccess(`Stripe Payment Intent pi_${Math.random().toString(36).substring(2, 12)} confirmed! $${stripeAmount} USD added to arbitrage liquidity pool.`);
      setAccountBalanceUsd(prev => prev + parseFloat(stripeAmount || '0'));
      addTerminalLine(`[STRIPE API]: Payment confirmed. Arbitrage balance updated.`, 'good');
      addLedger('stripe.payment_intent.succeeded', { amount: stripeAmount, currency: 'usd' });
    }, 1200);
  };

  const handleCashAppPay = (e: React.FormEvent) => {
    e.preventDefault();
    setCashStatus(`Dispatched Cash App Pay request of $${cashAmount} to ${cashtag}.`);
    setAccountBalanceUsd(prev => prev + parseFloat(cashAmount || '0'));
    addTerminalLine(`[CASH APP PAY]: Logged in as ${cashtag}. Transferred $${cashAmount} USD into settlement escrow.`, 'good');
    addLedger('cashapp.payment.settled', { cashtag, amountUsd: cashAmount });
    setTimeout(() => setCashStatus(null), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-mono text-xs select-none p-4 space-y-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-cyan-500/30 gap-2 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <DollarSign className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-amber-300 text-sm tracking-wider flex items-center space-x-2">
              <span>FINANCIAL ARBITRAGE &amp; PAYMENT API GATEWAY</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Pool: ${accountBalanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Cross-exchange spread execution, Stripe API payment processing, and Cash App Pay authentication.
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {[
            { id: 'arbitrage', label: 'Arbitrage Scanner', icon: ArrowRightLeft },
            { id: 'monitor', label: 'Volatility Chart', icon: Activity },
            { id: 'stripe', label: 'Stripe API', icon: CreditCard },
            { id: 'cashapp', label: 'Cash App Pay', icon: DollarSign },
            { id: 'trades', label: 'Settlement Log', icon: Layers }
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 font-bold transition ${
                  active ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tradeStatusMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{tradeStatusMsg}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {activeTab === 'arbitrage' && (
          <div className="space-y-3">
            {/* Auto Execute Controls */}
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-white text-xs flex items-center space-x-2">
                  <span>Algorithmic Auto-Execution Daemon</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${autoExecute ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {autoExecute ? 'ACTIVE' : 'STANDBY'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Automatically executes orders when spread exceeds threshold. Total Profit: <strong className="text-emerald-400">+${totalProfitEarned.toFixed(2)} USD</strong>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-[11px] text-slate-300">
                  <span>Min Spread:</span>
                  <select
                    value={minSpreadThreshold}
                    onChange={e => setMinSpreadThreshold(parseFloat(e.target.value))}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-400 font-bold"
                  >
                    <option value={0.5}>0.50%</option>
                    <option value={0.75}>0.75%</option>
                    <option value={1.0}>1.00%</option>
                    <option value={1.5}>1.50%</option>
                  </select>
                </div>
                <button
                  onClick={() => setAutoExecute(!autoExecute)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                    autoExecute ? 'bg-emerald-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {autoExecute ? 'Pause Daemon' : 'Engage Auto-Bot'}
                </button>
              </div>
            </div>

            {/* Pairs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pairs.map(pair => (
                <div key={pair.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-sm">{pair.symbol}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pair.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      Spread: +{pair.spreadPercent}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Buy Exchange</div>
                      <div className="font-bold text-slate-200 mt-0.5">{pair.exchangeA.name}</div>
                      <div className="text-cyan-400 font-mono mt-0.5">${pair.exchangeA.ask.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <div className="text-slate-400 text-[10px]">Sell Exchange</div>
                      <div className="font-bold text-slate-200 mt-0.5">{pair.exchangeB.name}</div>
                      <div className="text-emerald-400 font-mono mt-0.5">${pair.exchangeB.bid.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400">Potential Net: <strong className="text-emerald-400">+${pair.potentialProfitUsd.toFixed(2)}</strong></span>
                    <button
                      onClick={() => executeArbitrageTrade(pair)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 transition shadow"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Execute Arbitrage</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'monitor' && (
          <div className="h-[460px]">
            <ArbitrageMonitor />
          </div>
        )}

        {activeTab === 'stripe' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Stripe Payments API &amp; Test Checkout Session</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-mono">Stripe SDK v14 / Elements Connected</span>
            </div>

            {stripeSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs">
                {stripeSuccess}
              </div>
            )}

            <form onSubmit={handleStripeCheckout} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Stripe Public Test Key:</label>
                <input
                  type="text"
                  value={stripeApiKey}
                  onChange={e => setStripeApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Deposit Amount (USD):</label>
                  <input
                    type="number"
                    value={stripeAmount}
                    onChange={e => setStripeAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Test Card Number (Stripe 4242):</label>
                  <input
                    type="text"
                    disabled
                    value="4242 •••• •••• 4242 (04/28 CVC 123)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-400 font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={stripeLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow disabled:opacity-50"
              >
                {stripeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                <span>{stripeLoading ? 'Processing Stripe Checkout...' : `Confirm Stripe Payment of $${stripeAmount} USD`}</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'cashapp' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <DollarSign className="w-4 h-4" />
                <span>Cash App Pay Authentication &amp; Transfer</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Authenticated: {cashtag}
              </span>
            </div>

            {cashStatus && (
              <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs">
                {cashStatus}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleCashAppPay} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Cash App $Cashtag:</label>
                  <input
                    type="text"
                    value={cashtag}
                    onChange={e => setCashtag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Quick Settlement Amount (USD):</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Cash App Settlement (${cashAmount})</span>
                </button>
              </form>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <QrCode className="w-20 h-20 text-emerald-400" />
                <div className="font-bold text-white text-xs">Instant Cash App QR Pay</div>
                <div className="text-[10px] text-slate-400 font-mono">Scan on iOS or Android to deposit arbitrage funds</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="p-3">Time</th>
                  <th className="p-3">Pair</th>
                  <th className="p-3">Route Path</th>
                  <th className="p-3">Profit (USD)</th>
                  <th className="p-3">Settlement</th>
                  <th className="p-3">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {tradeLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-cyan-400">{log.timestamp}</td>
                    <td className="p-3 font-bold text-white">{log.pair}</td>
                    <td className="p-3 text-slate-300">{log.buyExchange} &rarr; {log.sellExchange}</td>
                    <td className="p-3 text-emerald-400 font-bold">+${log.profitUsd.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[9px]">
                        {log.settlementMethod}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{log.txHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
