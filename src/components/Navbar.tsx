import WalletConnectButton from './WalletConnectButton';
import { Menu, X, Coins, Activity, Droplet, Network } from 'lucide-react';
import { useState } from 'react';

type Page = 'home' | 'swap' | 'faucet' | 'network';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'faucet' as Page, label: 'Faucet', icon: Droplet },
    { id: 'swap' as Page, label: 'Swap', icon: Coins },
    { id: 'network' as Page, label: 'Network Params', icon: Network },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 shadow-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo & Brand */}
          <div 
            className="flex cursor-pointer items-center space-x-3 transition-opacity duration-200 hover:opacity-90"
            onClick={() => {
              setCurrentPage('home');
              setMobileMenuOpen(false);
            }}
          >
            <img 
              src="https://static.vecteezy.com/system/resources/previews/006/247/448/non_2x/initial-letter-t-slice-style-logo-template-design-vector.jpg" 
              alt="TribeArc Logo" 
              className="h-10 w-10 rounded-xl object-cover border border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
              referrerPolicy="no-referrer"
              id="navbar-brand-logo"
            />

            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                Tribe<span className="text-purple-400">Arc</span>
              </span>
              <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-neutral-500">
                Arc Testnet
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              id="nav-home"
              onClick={() => setCurrentPage('home')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                currentPage === 'home'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200 border border-transparent'
              }`}
            >
              Home
            </button>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  id={`nav-${item.id}`}
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200 border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* RainbowKit Connector */}
          <div className="hidden md:flex items-center">
            <WalletConnectButton />
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center space-x-2 md:hidden">
            <WalletConnectButton />
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl bg-neutral-900/80 p-2.5 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-white/5"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 bg-neutral-950/95 py-4 px-4 space-y-2">
          <button
            onClick={() => {
              setCurrentPage('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left flex items-center space-x-3 rounded-lg px-4 py-3 text-base font-semibold transition-all ${
              currentPage === 'home'
                ? 'bg-white/10 text-white'
                : 'text-neutral-400 hover:bg-white/5'
            }`}
          >
            <span>Home Overview</span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left flex items-center space-x-3 rounded-lg px-4 py-3 text-base font-semibold transition-all ${
                  currentPage === item.id
                    ? 'bg-purple-600/20 text-purple-300 border-l-4 border-purple-500'
                    : 'text-neutral-400 hover:bg-white/5'
                }`}
              >
                <Icon className="h-5 w-5 text-neutral-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
