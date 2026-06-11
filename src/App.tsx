import { useState } from 'react';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';

// Styles
import '@rainbow-me/rainbowkit/styles.css';

// Config
import { config } from './wagmiConfig';

// Layout & Sections
import Navbar from './components/Navbar';
import Home from './components/Home';
import Swap from './components/Swap';
import Faucet from './components/Faucet';
import Network from './components/Network';
import Footer from './components/Footer';

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type Page = 'home' | 'swap' | 'faucet' | 'network';

function NetworkBanner() {
  const { isConnected, chainId } = useAccount();

  if (!isConnected || chainId === 5042002) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x4CE672',
            chainName: 'Arc Testnet',
            nativeCurrency: {
              name: 'USDC',
              symbol: 'USDC',
              decimals: 18
            },
            rpcUrls: ['https://rpc.testnet.arc.network'],
            blockExplorerUrls: ['https://testnet.arcscan.app']
          }]
        });
      } catch (err) {
        console.error("Failed to add/switch network:", err);
      }
    }
  };

  return (
    <div className="bg-rose-950/85 border-b border-rose-500/30 text-rose-200 py-3 px-4 text-center text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-3 relative z-50 backdrop-blur-md">
      <div className="flex items-center space-x-2">
        <span className="text-rose-400 animate-pulse text-base">⚠️</span>
        <span>Wrong Network! Please switch to Arc Testnet</span>
      </div>
      <button
        onClick={handleSwitchNetwork}
        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 duration-150 shadow-[0_0_15px_rgba(244,63,94,0.3)] border border-rose-400/20 cursor-pointer"
      >
        Switch to Arc Testnet
      </button>
    </div>
  );
}

function TribeArcApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div className="min-h-screen bg-[#050508] relative text-neutral-200 selection:bg-purple-500/30 selection:text-white flex flex-col justify-between">
      {/* Ambient background accent glow */}
      <div className="absolute top-0 left-[15%] -z-20 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-purple-900/10 to-transparent blur-[160px]" />
      <div className="absolute top-[30%] right-[10%] -z-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-900/10 to-transparent blur-[160px]" />

      <div className="flex-grow flex flex-col justify-start">
        {/* Sticky network banner shown if connected on the wrong network */}
        <NetworkBanner />

        {/* Sticky interactive Navbar */}
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {/* Dynamic Sections Content switcher */}
        <main className="w-full flex-grow">
          {currentPage === 'home' && <Home setCurrentPage={setCurrentPage} />}
          {currentPage === 'swap' && <Swap />}
          {currentPage === 'faucet' && <Faucet />}
          {currentPage === 'network' && <Network />}
        </main>
      </div>

      {/* Application developer and credential credits footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#9333ea', // Indigo / Purple Accents matching brand
            accentColorForeground: '#ffffff',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'large',
          })}
        >
          <TribeArcApp />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
