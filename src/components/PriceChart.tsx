import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Activity, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface ChartTick {
  time: string;
  price: number;
}

interface PriceChartProps {
  currentDexUsdcPrice: number; // calculated from contract getAmountOut for 1 USDC
  currentDexEurcPrice: number; // calculated from contract getAmountOut for 1 EURC
  liveTxHash: string | null;  // pass in user swap hashes to record real trades
  sellToken: 'USDC' | 'EURC';
}

// Fixed mock historical price points that we will map dynamically to align with real contract rates
const BASE_USDC_EURC_24H: ChartTick[] = [
  { time: '06:00', price: 0.9180 },
  { time: '08:00', price: 0.9195 },
  { time: '10:00', price: 0.9172 },
  { time: '12:00', price: 0.9205 },
  { time: '14:00', price: 0.9213 },
  { time: '16:00', price: 0.9188 },
  { time: '18:00', price: 0.9221 },
  { time: '20:00', price: 0.9234 },
  { time: '22:00', price: 0.9219 },
  { time: '00:00', price: 0.9242 },
  { time: '02:00', price: 0.9228 },
  { time: '04:00', price: 0.9239 },
  { time: '06:00', price: 0.9251 },
];

const BASE_USDC_EURC_1W: ChartTick[] = [
  { time: 'Mon', price: 0.9110 },
  { time: 'Tue', price: 0.9152 },
  { time: 'Wed', price: 0.9125 },
  { time: 'Thu', price: 0.9189 },
  { time: 'Fri', price: 0.9213 },
  { time: 'Sat', price: 0.9230 },
  { time: 'Sun', price: 0.9251 },
];

const BASE_USDC_EURC_1M: ChartTick[] = [
  { time: 'Week 1', price: 0.8980 },
  { time: 'Week 2', price: 0.9052 },
  { time: 'Week 3', price: 0.9175 },
  { time: 'Week 4', price: 0.9251 },
];

export default function PriceChart({ currentDexUsdcPrice, currentDexEurcPrice, liveTxHash, sellToken }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<'24H' | '1W' | '1M'>('24H');
  const [chartSide, setChartSide] = useState<'USDC/EURC' | 'EURC/USDC'>('USDC/EURC');
  const [tickerPriceOffset, setTickerPriceOffset] = useState<number>(0);
  const [txHistory, setTxHistory] = useState<any[]>([]);

  // Toggle orientation automatically when user switches tokens in Swap module
  useEffect(() => {
    if (sellToken === 'USDC') {
      setChartSide('USDC/EURC');
    } else {
      setChartSide('EURC/USDC');
    }
  }, [sellToken]);

  // Read rate offset to introduce micro-oscillations to simulate dynamic order books
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate microscopic price changes (-0.0003 to +0.0003) to show charting activity
      setTickerPriceOffset((prev) => prev + (Math.random() - 0.5) * 0.0005);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Compute the absolute live exchange rate
  // USDC/EURC = how many EURC 1 USDC gets
  // EURC/USDC = how many USDC 1 EURC gets
  const liveExchangeRate = useMemo(() => {
    if (chartSide === 'USDC/EURC') {
      const contractPrice = currentDexUsdcPrice > 0 ? currentDexUsdcPrice : 0.9251;
      return contractPrice + tickerPriceOffset;
    } else {
      const contractPrice = currentDexEurcPrice > 0 ? currentDexEurcPrice : 1.0810;
      return contractPrice + tickerPriceOffset;
    }
  }, [chartSide, currentDexUsdcPrice, currentDexEurcPrice, tickerPriceOffset]);

  // Adjust mock charting data dynamically to center perfectly on the actual live DEX pool price
  const chartData = useMemo(() => {
    const defaultBase = timeframe === '24H' 
      ? BASE_USDC_EURC_24H 
      : timeframe === '1W' 
      ? BASE_USDC_EURC_1W 
      : BASE_USDC_EURC_1M;

    const lastBaseIndex = defaultBase.length - 1;
    const baseTargetPrice = defaultBase[lastBaseIndex].price;
    
    // Scale all points so the final point matches our living exchange rate
    return defaultBase.map((tick, index) => {
      let ratio = tick.price / baseTargetPrice;
      // Invert if looking at EURC/USDC
      if (chartSide === 'EURC/USDC') {
        ratio = (1 / tick.price) / (1 / baseTargetPrice);
      }
      
      // Fine grain smoothing & scale alignment
      const price = parseFloat((liveExchangeRate * ratio).toFixed(5));
      return {
        ...tick,
        price,
      };
    });
  }, [timeframe, chartSide, liveExchangeRate]);

  // Simulated live arbitrage trading events
  useEffect(() => {
    // Generate some initial random transaction history
    const initialTxs = [
      {
        id: 'tx-1',
        time: '2m ago',
        type: 'Buy',
        tokenIn: 'USDC',
        tokenOut: 'EURC',
        amountIn: '14,250.00',
        amountOut: '13,101.90',
        rate: '0.9194',
        txHash: '0x17fa...b28c',
      },
      {
        id: 'tx-2',
        time: '8m ago',
        type: 'Sell',
        tokenIn: 'EURC',
        tokenOut: 'USDC',
        amountIn: '5,000.00',
        amountOut: '5,410.25',
        rate: '1.0820',
        txHash: '0x34ee...67cc',
      },
      {
        id: 'tx-3',
        time: '15m ago',
        type: 'Buy',
        tokenIn: 'USDC',
        tokenOut: 'EURC',
        amountIn: '850.00',
        amountOut: '782.35',
        rate: '0.9204',
        txHash: '0xaac0...4411',
      },
      {
        id: 'tx-4',
        time: '32m ago',
        type: 'Buy',
        tokenIn: 'USDC',
        tokenOut: 'EURC',
        amountIn: '120,000.00',
        amountOut: '110,412.00',
        rate: '0.9201',
        txHash: '0xde02...fa77',
      },
      {
        id: 'tx-5',
        time: '1h ago',
        type: 'Sell',
        tokenIn: 'EURC',
        tokenOut: 'USDC',
        amountIn: '18,400.00',
        amountOut: '19,908.80',
        rate: '1.0825',
        txHash: '0xf77d...dd42',
      },
    ];
    setTxHistory(initialTxs);

    // Insert minor random trades periodically to mimic real-time block activity
    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.4;
      const amtInRandom = (Math.random() * 8500 + 100).toFixed(2);
      const rateVal = isBuy ? (0.9200 + (Math.random() - 0.5) * 0.008) : (1.0810 + (Math.random() - 0.5) * 0.008);
      const amtOutRandom = (parseFloat(amtInRandom) * rateVal).toFixed(2);
      const randHash = '0x' + Math.floor(Math.random() * 1e16).toString(16) + '...' + Math.floor(Math.random() * 1e8).toString(16);

      const newTx = {
        id: `tx-sim-${Date.now()}`,
        time: 'Just now',
        type: isBuy ? 'Buy' : 'Sell',
        tokenIn: isBuy ? 'USDC' : 'EURC',
        tokenOut: isBuy ? 'EURC' : 'USDC',
        amountIn: parseFloat(amtInRandom).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        amountOut: parseFloat(amtOutRandom).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        rate: rateVal.toFixed(4),
        txHash: randHash,
        simulated: true,
      };

      setTxHistory((prev) => {
        // Upgrade previous 'Just now' labels to 1m ago
        const updated = prev.map((tx) => {
          if (tx.time === 'Just now') return { ...tx, time: '1m ago' };
          if (tx.time === '1m ago') return { ...tx, time: '2m ago' };
          return tx;
        });
        return [newTx, ...updated.slice(0, 5)];
      });
    }, 24000);

    return () => clearInterval(interval);
  }, []);

  // Listen to live wallet actions. If a user does a real transaction, capture it immediately!
  useEffect(() => {
    if (liveTxHash) {
      const truncatedHash = liveTxHash.substring(0, 6) + '...' + liveTxHash.substring(liveTxHash.length - 4);
      const isBuy = sellToken === 'USDC';

      const userLedgerTx = {
        id: `tx-live-${Date.now()}`,
        time: 'Just now',
        type: isBuy ? 'Buy' : 'Sell',
        tokenIn: sellToken,
        tokenOut: isBuy ? 'EURC' : 'USDC',
        amountIn: 'Pending',
        amountOut: 'Pending',
        rate: liveExchangeRate.toFixed(4),
        txHash: truncatedHash,
        fullHash: liveTxHash,
        userTx: true,
      };

      setTxHistory((prev) => [userLedgerTx, ...prev.slice(0, 5)]);
    }
  }, [liveTxHash]);

  // High, Low, Change Stats
  const priceChangePercent = useMemo(() => {
    return timeframe === '24H' ? '+0.42%' : timeframe === '1W' ? '+1.55%' : '+3.01%';
  }, [timeframe]);

  const priceTrendIcon = useMemo(() => {
    return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  }, []);

  return (
    <div className="space-y-6 w-full h-full flex flex-col">
      {/* 1. PRICE CHART CARD */}
      <div className="rounded-3xl border border-white/10 glass-panel p-6 shadow-2xl relative flex-1 flex flex-col justify-between">
        <div className="absolute top-[10%] left-[20%] -z-10 h-[100px] w-[100px] rounded-full bg-purple-500/5 blur-[40px]" />
        
        {/* Chart Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-1.5">
                <span className="w-7 h-7 rounded-full bg-zinc-800 border border-purple-500 font-bold flex items-center justify-center text-xs">U</span>
                <span className="w-7 h-7 rounded-full bg-zinc-800 border border-blue-500 font-bold flex items-center justify-center text-xs">E</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white tracking-widest uppercase font-mono">
                    USDC / EURC Pair
                  </h4>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 uppercase tracking-widest">
                    Live Pool Price
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <button 
                    onClick={() => setChartSide('USDC/EURC')}
                    className={`text-[11px] font-bold uppercase transition-all ${chartSide === 'USDC/EURC' ? 'text-purple-400 font-bold underline decoration-2' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    USDC / EURC
                  </button>
                  <span className="text-neutral-600 text-[10px]">|</span>
                  <button 
                    onClick={() => setChartSide('EURC/USDC')}
                    className={`text-[11px] font-bold uppercase transition-all ${chartSide === 'EURC/USDC' ? 'text-blue-400 font-bold underline decoration-2' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    EURC / USDC
                  </button>
                </div>
              </div>
            </div>

            {/* Selector buttons */}
            <div className="flex space-x-1 bg-neutral-950/60 p-1 rounded-lg border border-white/5 self-start sm:self-auto">
              {(['24H', '1W', '1M'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all uppercase ${timeframe === t ? 'bg-zinc-800 text-white shadow' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Core price readout */}
          <div className="mb-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white font-mono tracking-tight leading-none">
                {liveExchangeRate.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })}
              </span>
              <span className="text-sm text-neutral-400 font-mono">
                {chartSide === 'USDC/EURC' ? 'EURC' : 'USDC'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mt-1.5 text-xs">
              <span className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                {priceTrendIcon}
                <span>{priceChangePercent}</span>
              </span>
              <span className="text-neutral-500 text-[10px] font-mono uppercase">
                24H Volume: $421,902 USDC
              </span>
            </div>
          </div>
        </div>

        {/* Recharts responsive render container */}
        <div className="h-[220px] w-full mt-4 font-mono text-[9px] focus:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradientSpec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#52525b" 
                tick={{ fill: '#71717a', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={['auto', 'auto']}
                stroke="#52525b"
                tickFormatter={(val) => val.toFixed(4)}
                tick={{ fill: '#71717a', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '10px'
                }}
                labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: '#c084fc' }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="url(#chartGradientSpec)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#chartGradientSpec)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. RECENT TRANSACTION HISTORY CARD */}
      <div className="rounded-3xl border border-white/10 glass-panel p-6 shadow-2xl relative flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-400 animate-pulse" />
              <span>Block Swap Ledger</span>
            </h4>
            <span className="text-[9px] font-mono text-neutral-500 font-medium">
              Updating Live
            </span>
          </div>

          <div className="space-y-3 max-h-[175px] overflow-y-auto pr-1">
            {txHistory.map((tx) => {
              const buyFlag = tx.type === 'Buy';
              return (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    tx.userTx 
                      ? 'bg-purple-950/20 border-purple-500/30 shadow-[0_0_10px_rgba(147,51,234,0.1)]' 
                      : 'bg-neutral-950/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg border ${
                      buyFlag 
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-950/20 border-rose-500/20 text-rose-400'
                    }`}>
                      {buyFlag ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    </div>
                    <div>
                      <div className="text-xs text-white font-semibold flex items-center space-x-1.5">
                        <span>{buyFlag ? 'Swapped' : 'Token Trade'}</span>
                        {tx.userTx && (
                          <span className="bg-purple-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider scale-95">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {tx.amountIn} {tx.tokenIn} → {tx.amountOut} {tx.tokenOut}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-bold text-neutral-200 font-mono">
                      @ {tx.rate}
                    </div>
                    <div className="text-[9px] text-neutral-500 mt-0.5 font-mono flex items-center justify-end space-x-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{tx.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
          <span>Fee Rate: 0.30%</span>
          <a 
            href="https://testnet.arcscan.app" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-neutral-300 flex items-center space-x-1 underline"
          >
            <span>ArcScan Explorer</span>
            <ArrowUpRight className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
