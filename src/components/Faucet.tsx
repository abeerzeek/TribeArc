import { useState } from 'react';
import { motion } from 'motion/react';
import { Coins, Droplet, ArrowUpRight, HelpCircle } from 'lucide-react';

export default function Faucet() {
  const faucetCards = [
    {
      title: 'Circle USDC Faucet',
      desc: 'USDC is the gas token and core trading token of the Arc Testnet. Request test USDC on Ethereum Sepolia or Avalanche Fuji, or bridge them natively to get gas funds on Arc Testnet.',
      url: 'https://faucet.circle.com/',
      icon: Coins,
      badge: 'Gas & Trade',
      cta: 'Go to Circle Faucet',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Glow ambient backgrounds */}
      <div className="absolute top-[10%] left-[20%] -z-10 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[130px]" />
      <div className="absolute bottom-[20%] right-[10%] -z-10 h-[300px] w-[300px] rounded-full bg-cyan-600/10 blur-[130px]" />

      <div className="max-w-4xl mx-auto w-full">
        {/* Title Panel */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Get Testnet Tokens
          </h2>
          <p className="mt-4 text-base text-neutral-400">
            TribeArc runs on Arc Testnet where gas fees are settled natively in USDC. Follow the instructions below to fund your wallet.
          </p>
        </div>

        {/* Faucets list grid */}
        <div className="max-w-xl mx-auto mb-12">
          {faucetCards.map((faucet, idx) => {
            const Icon = faucet.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                key={idx}
                className="glass-panel rounded-2xl p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 bg-purple-500/10 text-purple-300 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-purple-500/20">
                  {faucet.badge}
                </div>

                <div>
                  <div className="inline-flex p-3 rounded-xl bg-neutral-900/80 text-purple-400 border border-white/5 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{faucet.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6 font-normal">
                    {faucet.desc}
                  </p>
                </div>

                <a
                  href={faucet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-3.5 px-4 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-100 font-bold hover:bg-purple-600/30 transition-all text-sm active:scale-95"
                >
                  <span>{faucet.cta}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Step-by-Step Interactive Guide */}
        <div className="rounded-3xl bg-neutral-900/30 border border-white/5 p-8">
          <h3 className="text-xl font-bold text-neutral-100 mb-6 flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-purple-400" />
            <span>How to bridge and trade on TribeArc</span>
          </h3>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Provision test tokens from USDC Circle Faucet',
                text: 'Visit Circle Faucet and acquire test USDC on secondary networks like Sepolia or Fuji. Alternatively, use native explorer claims.',
              },
              {
                step: '02',
                title: 'Bridge stablecoins to Arc Network',
                text: 'Bridge your Sepolia USDC or Fuji USDC using Arc Bridges or claim native faucet gas tokens directly to get USDC inside Arc.',
              },
              {
                step: '03',
                title: 'Conduct Swaps or Provide Pool Liquidity',
                text: 'Visit the TribeArc Swap page to seamlessly execute swaps between USDC and EURC using the liquidity pool.',
              },
            ].map((step, sIdx) => (
              <div key={sIdx} className="flex space-x-4">
                <div className="font-mono text-xs font-bold text-purple-400 bg-purple-500/5 h-8 w-8 rounded-lg flex items-center justify-center border border-purple-500/10 shrink-0">
                  {step.step}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">{step.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
