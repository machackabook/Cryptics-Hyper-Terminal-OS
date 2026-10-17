import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  Play, 
  Pause, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Sliders, 
  ArrowRightLeft, 
  RefreshCw,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

interface FluctuationPoint {
  id: string;
  time: string;
  timestamp: number;
  spread: number;
  bidPrice: number;
  askPrice: number;
  pair: string;
}

export const ArbitrageMonitor: React.FC = () => {
  const { syncActive, toggleSync, addTerminalLine, addLedger } = useCryptic();
  
  const [selectedPair, setSelectedPair] = useState<'BTC/USD' | 'ETH/USDT' | 'SOL/USDC'>('BTC/USD');
  const [volatilityThreshold, setVolatilityThreshold] = useState<number>(0.35); // Standard deviation high-risk limit
  const [dataPoints, setDataPoints] = useState<FluctuationPoint[]>([]);
  const [localPaused, setLocalPaused] = useState<boolean>(false);

  // Base price configs
  const pairConfigs = useMemo(() => ({
    'BTC/USD': { basePrice: 68400, baseSpread: 0.95, volatilityFactor: 0.28 },
    'ETH/USDT': { basePrice: 3480, baseSpread: 1.05, volatilityFactor: 0.32 },
    'SOL/USDC': { basePrice: 178, baseSpread: 1.18, volatilityFactor: 0.40 },
  }), []);

  // Initialize seed data for the last 60 seconds (15 samples at 4s intervals)
  useEffect(() => {
    const seed: FluctuationPoint[] = [];
    const now = Date.now();
    const cfg = pairConfigs[selectedPair];

    for (let i = 15; i >= 0; i--) {
      const ts = now - i * 4000;
      const noise = (Math.random() * 0.4 - 0.2);
      const spread = Math.max(0.15, Number((cfg.baseSpread + noise).toFixed(3)));
      seed.push({
        id: `pt-${ts}`,
        time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: ts,
        spread,
        bidPrice: Number((cfg.basePrice * (1 + spread / 100)).toFixed(2)),
        askPrice: cfg.basePrice,
        pair: selectedPair,
      });
    }
    setDataPoints(seed);
  }, [selectedPair, pairConfigs]);

  // Real-time data ingestion loop (ticks every 2 seconds if syncActive is true and not locally paused)
  useEffect(() => {
    // If global sync is paused or local pause is active, suspend ingestion
    if (!syncActive || localPaused) {
      return;
    }

    const interval = setInterval(() => {
      setDataPoints(prev => {
        const now = Date.now();
        const cfg = pairConfigs[selectedPair];
        const lastSpread = prev[prev.length - 1]?.spread || cfg.baseSpread;
        // Fluctuating random walk with mean reversion
        const drift = (cfg.baseSpread - lastSpread) * 0.15;
        const shock = (Math.random() - 0.5) * (cfg.volatilityFactor * 2);
        const newSpread = Math.max(0.1, Number((lastSpread + drift + shock).toFixed(3)));

        const newPoint: FluctuationPoint = {
          id: `pt-${now}`,
          time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: now,
          spread: newSpread,
          bidPrice: Number((cfg.basePrice * (1 + newSpread / 100)).toFixed(2)),
          askPrice: cfg.basePrice,
          pair: selectedPair,
        };

        // Maintain points within the last 60 seconds (cutoff = now - 60,000ms)
        const cutoff = now - 60000;
        const filtered = prev.filter(p => p.timestamp >= cutoff);
        return [...filtered, newPoint];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [syncActive, localPaused, selectedPair, pairConfigs]);

  // Calculate moving volatility (Standard Deviation) over the last 60 seconds
  const { stdDev, meanSpread, isHighRisk, sampleCount } = useMemo(() => {
    if (dataPoints.length < 2) {
      return { stdDev: 0, meanSpread: 0, isHighRisk: false, sampleCount: dataPoints.length };
    }

    const spreads = dataPoints.map(p => p.spread);
    const mean = spreads.reduce((acc, val) => acc + val, 0) / spreads.length;
    const variance = spreads.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / spreads.length;
    const sd = Math.sqrt(variance);
    const highRisk = sd >= volatilityThreshold;

    return {
      stdDev: Number(sd.toFixed(4)),
      meanSpread: Number(mean.toFixed(3)),
      isHighRisk: highRisk,
      sampleCount: dataPoints.length
    };
  }, [dataPoints, volatilityThreshold]);

  // Manual trigger to simulate a sudden arbitrage price shock/volatility spike
  const injectVolatilitySpike = () => {
    if (!syncActive) {
      toggleSync(true);
    }
    const now = Date.now();
    const cfg = pairConfigs[selectedPair];
    const spikeSpread = Number((cfg.baseSpread + 1.25 + Math.random() * 0.5).toFixed(3));
    
    const spikePoint: FluctuationPoint = {
      id: `pt-spike-${now}`,
      time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: now,
      spread: spikeSpread,
      bidPrice: Number((cfg.basePrice * (1 + spikeSpread / 100)).toFixed(2)),
      askPrice: cfg.basePrice,
      pair: selectedPair,
    };

    setDataPoints(prev => [...prev.slice(-14), spikePoint]);
    addTerminalLine(`[ARBITRAGE VOLATILITY SPIKE] Anomaly spread ${spikeSpread}% triggered on ${selectedPair}. Standard deviation surge.`, 'warn');
    addLedger('arbitrage.volatility_spike', { pair: selectedPair, spread: spikeSpread });
  };

  const isIngesting = syncActive && !localPaused;

  return (
    <div className="h-full flex flex-col bg-[#030914] text-slate-100 font-mono text-xs select-none p-3.5 space-y-3 overflow-hidden">
      {/* Top Header & Ingestion Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2.5 border-b border-[#42f5ff]/25 gap-2 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-lg border transition-all duration-300 ${
            isHighRisk 
              ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse' 
              : 'bg-[#42f5ff]/10 border-[#42f5ff]/30 text-[#42f5ff]'
          }`}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs tracking-wider flex items-center space-x-2">
              <span>ARBITRAGE MONITOR &amp; SPREAD VOLATILITY ENGINE</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                isIngesting
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isIngesting ? 'INGESTION: ACTIVE' : 'INGESTION: PAUSED'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Live moving standard deviation calculated over 60-second window across cross-exchange orderbooks.
            </div>
          </div>
        </div>

        {/* Global / Local Sync Control Buttons */}
        <div className="flex items-center space-x-2">
          {/* Pair selector */}
          <select
            value={selectedPair}
            onChange={e => setSelectedPair(e.target.value as any)}
            className="bg-[#061224] border border-[#42f5ff]/30 rounded px-2 py-1 text-cyan-300 font-bold text-[11px] focus:outline-none"
          >
            <option value="BTC/USD">BTC/USD (Kraken/Binance)</option>
            <option value="ETH/USDT">ETH/USDT (Coinbase/OKX)</option>
            <option value="SOL/USDC">SOL/USDC (Raydium/Kraken)</option>
          </select>

          {/* Toggle Sync Button */}
          <button
            onClick={() => setLocalPaused(!localPaused)}
            title={localPaused ? 'Resume local ingestion' : 'Pause local ingestion'}
            className={`px-2.5 py-1 rounded border text-[11px] font-bold flex items-center space-x-1.5 transition ${
              localPaused 
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60' 
                : 'bg-[#061e3b] border-[#42f5ff]/40 text-[#42f5ff] hover:bg-[#082a52]'
            }`}
          >
            {localPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3 text-cyan-400" />}
            <span>{localPaused ? 'Resume' : 'Hold'}</span>
          </button>
        </div>
      </div>

      {/* Volatility Indicator & Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        <div className="bg-[#051122] border border-[#42f5ff]/20 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400">Current Spread</div>
          <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
            +{dataPoints[dataPoints.length - 1]?.spread || 0}%
          </div>
          <div className="text-[9px] text-slate-500">60s Mean: {meanSpread}%</div>
        </div>

        <div className={`p-2.5 rounded-lg border transition-all duration-300 ${
          isHighRisk 
            ? 'bg-red-950/70 border-red-500/80 shadow-[0_0_18px_rgba(239,68,68,0.35)]' 
            : 'bg-[#051122] border-[#42f5ff]/20'
        }`}>
          <div className="flex items-center justify-between text-[10px]">
            <span className={isHighRisk ? 'text-red-300 font-bold' : 'text-slate-400'}>
              Volatility (StdDev σ)
            </span>
            {isHighRisk && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <div className={`text-sm font-bold font-mono mt-0.5 ${
            isHighRisk ? 'text-red-400 animate-pulse' : 'text-emerald-400'
          }`}>
            &sigma; = {stdDev}
          </div>
          <div className="text-[9px] text-slate-500">Threshold: {volatilityThreshold}</div>
        </div>

        <div className="bg-[#051122] border border-[#42f5ff]/20 rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400">60s Data Samples</div>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {sampleCount} points
          </div>
          <div className="text-[9px] text-emerald-400">Interval: 2.0s pulse</div>
        </div>

        <div className="bg-[#051122] border border-[#42f5ff]/20 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Risk Limit</span>
            <span className="text-cyan-300 font-bold">{volatilityThreshold}</span>
          </div>
          <input
            type="range"
            min={0.15}
            max={0.80}
            step={0.05}
            value={volatilityThreshold}
            onChange={e => setVolatilityThreshold(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded mt-1"
          />
          <div className="text-[9px] text-slate-500">Adjust threshold</div>
        </div>
      </div>

      {/* Animated High-Risk Warning Banner when Standard Deviation exceeds threshold */}
      {isHighRisk && (
        <div className="p-2 rounded-lg bg-red-950/80 border border-red-500 text-red-300 text-xs flex items-center justify-between animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)] shrink-0">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-bold">
              HIGH-RISK VOLATILITY LIMIT EXCEEDED (&sigma; = {stdDev} &ge; {volatilityThreshold})
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-400 font-bold">
            ARBITRAGE SLIPPAGE RISK
          </span>
        </div>
      )}

      {/* Main Chart Container with Animated Red Glow on High Volatility */}
      <div className={`flex-1 rounded-xl p-3 border transition-all duration-500 flex flex-col min-h-[220px] ${
        isHighRisk
          ? 'bg-[#0f0408]/90 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.45)] ring-1 ring-red-500/60 animate-pulse'
          : 'bg-[#040e1d]/90 border-[#42f5ff]/30 shadow-inner'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <span>{selectedPair} Real-Time Spread (% Fluctuation)</span>
            </span>
            <span className="text-[10px] text-slate-400">| Last 60s window</span>
          </div>

          <div className="flex items-center space-x-2 text-[10px]">
            <span className="flex items-center space-x-1 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-[#42f5ff] inline-block" />
              <span>Spread %</span>
            </span>
            <span className="flex items-center space-x-1 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 border-dashed inline-block" />
              <span>Mean ({meanSpread}%)</span>
            </span>
            <button
              onClick={injectVolatilitySpike}
              className="px-2 py-0.5 bg-red-950/60 hover:bg-red-900 border border-red-500/50 rounded text-red-300 font-bold text-[10px] flex items-center space-x-1 transition"
            >
              <Zap className="w-3 h-3" />
              <span>Inject Fluctuation</span>
            </button>
          </div>
        </div>

        {/* Recharts Live Line Chart */}
        <div className="flex-1 w-full h-full min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spreadGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isHighRisk ? '#ef4444' : '#42f5ff'} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={isHighRisk ? '#ef4444' : '#42f5ff'} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#132742" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#476585" 
                tick={{ fontSize: 9, fill: '#7090b0' }}
                tickLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="#476585" 
                tick={{ fontSize: 9, fill: '#7090b0' }}
                tickLine={false}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#051122', 
                  borderColor: isHighRisk ? '#ef4444' : '#42f5ff',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                  boxShadow: isHighRisk ? '0 0 15px rgba(239,68,68,0.5)' : '0 0 10px rgba(66,245,255,0.3)'
                }}
                formatter={(value: any) => [`${value}%`, 'Spread']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <ReferenceLine 
                y={meanSpread} 
                stroke="#f5ce70" 
                strokeDasharray="4 4" 
                label={{ value: 'MEAN', fill: '#f5ce70', fontSize: 9, position: 'right' }} 
              />
              <Line 
                type="monotone" 
                dataKey="spread" 
                stroke={isHighRisk ? '#ef4444' : '#42f5ff'} 
                strokeWidth={2}
                dot={{ r: 2, fill: isHighRisk ? '#ef4444' : '#42f5ff' }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 1 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Global Ingestion Sync Status Notice */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800 shrink-0">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${syncActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span>
            Global Stream: {syncActive ? 'Synchronized with system clock & cluster bridge' : 'Paused globally via footer control'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span>High-Risk Threshold: &sigma; &gt; {volatilityThreshold}</span>
          <button 
            onClick={() => toggleSync()}
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            {syncActive ? 'Pause Global Ingestion' : 'Resume Global Ingestion'}
          </button>
        </div>
      </div>
    </div>
  );
};
