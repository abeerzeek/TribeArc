import { motion } from 'motion/react';
import { Coins, Flame, Shield, ArrowRight, Wallet, CheckCircle } from 'lucide-react';

type Page = 'home' | 'swap' | 'faucet' | 'network';

interface HomeProps {
  setCurrentPage: (page: Page) => void;
}

export default function Home({ setCurrentPage }: HomeProps) {
  const features = [
    {
      title: 'Fast Swaps',
      description: 'Immediate 0.3% fee swaps directly powered by native Arc blockchain smart contracts. Real-time sub-second routing.',
      icon: Coins,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'USDC Native Gas',
      description: 'Pay network gas fees directly with USDC. No volatile gas token layer required to initiate stable trading on Arc.',
      icon: Flame,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Stablecoin First',
      description: 'Deep USDC-EURC liquidity designed purposefully for institutional hedging and high-precision on-chain settlements.',
      icon: Shield,
      color: 'from-fuchsia-500 to-pink-500',
    },
  ];

  const stats = [
    { label: 'Network Chain ID', value: '5042002', sub: 'Arc Testnet' },
    { label: 'Native Gas Asset', value: 'USDC', sub: 'Stablecoin Gas' },
    { label: 'Avg Block Finality', value: '< 1s', sub: 'Sub-second confirmation' },
  ];

  const tickerText = '  TRIBEARC · USDC · EURC · ARC TESTNET · STABLECOIN · '.repeat(8);

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[20%] left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full glow-gradient opacity-60"></div>
      <div className="absolute top-[5%] -left-[10%] -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[150px]"></div>
      <div className="absolute bottom-[10%] -right-[15%] -z-10 h-[350px] w-[350px] rounded-full bg-purple-500/10 blur-[150px]"></div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge Alert */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 rounded-full border border-purple-500/30 bg-purple-900/10 px-4 py-1.5 text-xs font-semibold text-purple-300 backdrop-blur-md mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span>Live on Arc Testnet Protocol</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent"
          >
            Stablecoin trading,<br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
              native to Arc.
            </span>
          </motion.h1>

          {/* Tagline / Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 max-w-2xl text-lg font-medium text-neutral-400 leading-relaxed"
          >
            Trade stablecoins instantly with ultra-low slippage and sub-second finality. Pay transactions gracefully in native USDC gas on the Arc Testnet ecosystem.
          </motion.p>

          {/* Launch Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto px-4"
          >
            <button
              onClick={() => setCurrentPage('swap')}
              className="group relative flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]"
            >
              <span>Launch Swap</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setCurrentPage('faucet')}
              className="flex items-center justify-center space-x-2 rounded-2xl bg-neutral-900 border border-white/10 px-8 py-4 text-base font-bold text-neutral-200 transition-all duration-300 hover:bg-neutral-800/80 active:scale-95"
            >
              <span>Get Testnet Tokens</span>
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 w-full max-w-5xl rounded-3xl glass-panel p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center pt-6 md:pt-0 first:pt-0 pb-6 md:pb-0 last:pb-0">
                  <div className="font-mono text-3xl font-extrabold text-white tracking-tight glow-text leading-none">{stat.value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">{stat.label}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">{stat.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feature Grid */}
          <div className="mt-24 w-full">
            <h2 className="text-2xl font-bold text-neutral-200 mb-12">Engineered For Capital Efficiency</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                    key={i}
                    className="glass-panel-interactive rounded-2xl p-8 text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-tr ${feat.color} bg-opacity-10 mb-6 text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                      <p className="text-sm text-neutral-400 leading-relaxed font-normal">{feat.description}</p>
                    </div>
                    <div className="mt-6 flex items-center text-purple-400 text-xs font-bold uppercase tracking-wider group-hover:text-purple-300">
                      <span>Secure Smart Contract</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Infinite Ticker Bar at Hero Bottom */}
      <div className="w-full bg-neutral-950 border-y border-white/5 py-3 overflow-hidden select-none mb-12">
        <div className="flex w-max">
          <div className="animate-ticker font-mono text-xs font-bold uppercase tracking-widest text-purple-300/60 divide-x divide-white/10">
            {tickerText.split('·').map((part, index) => (
              <span key={index} className="px-6 inline-block">
                {part.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
