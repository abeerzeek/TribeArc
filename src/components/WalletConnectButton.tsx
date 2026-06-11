import { useState, useRef, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Copy, Check, ExternalLink, LogOut, ChevronDown, Monitor, Cpu } from 'lucide-react';

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="relative" ref={containerRef} id="wallet-connect-wrapper">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && isConnected && address;

          if (!connected) {
            return (
              <button
                onClick={openConnectModal}
                type="button"
                id="connect-wallet-btn-disconnected"
                className="relative overflow-hidden group/btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                <span className="relative z-10 flex items-center space-x-1.5">
                  <span>Connect Wallet</span>
                </span>
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </button>
            );
          }

          return (
            <div className="flex flex-col items-end">
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="wallet-connect-trigger"
                className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-white/10 hover:border-purple-500/30 text-white hover:text-purple-300 transition-all shadow-md backdrop-blur-md"
              >
                {/* Green Status indicator dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                
                <div className="text-left font-mono">
                  <div className="text-[10px] uppercase font-bold text-purple-400/80 tracking-widest">
                    Arc Testnet
                  </div>
                  <div className="text-xs text-neutral-200 font-semibold leading-none mt-0.5">
                    {truncateAddress(address)}
                  </div>
                </div>

                <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform ${dropdownOpen ? 'rotate-180 text-purple-400' : ''}`} />
              </button>

              {/* Connected details Dropdown */}
              {dropdownOpen && (
                <div 
                  id="wallet-connected-dropdown"
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl glass-panel border border-white/10 bg-neutral-950/95 p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* Account Header */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                      Connected Account
                    </span>
                    <div className="flex items-center justify-between bg-neutral-900/80 px-3 py-2 rounded-xl border border-white/5">
                      <span className="font-mono text-xs text-white break-all">
                        {truncateAddress(address)}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="p-1 px-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all active:scale-95"
                        title="Copy Address"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Network details */}
                  <div className="space-y-2 border-t border-white/5 pt-3 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Network:</span>
                      <span className="font-bold text-purple-400 font-mono tracking-wider flex items-center space-x-1">
                        <Monitor className="h-3 w-3 inline" />
                        <span>Arc Testnet</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Chain ID:</span>
                      <span className="text-neutral-300 font-mono font-medium">5042002</span>
                    </div>
                  </div>

                  {/* Actions & Explorer links */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <a
                      href={`https://testnet.arcscan.app/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between px-3 py-2 border border-white/5 hover:border-purple-500/20 bg-neutral-900/40 text-neutral-300 hover:text-white rounded-xl text-xs transition-all font-semibold"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Cpu className="h-3.5 w-3.5 text-purple-400" />
                        <span>View on Explorer</span>
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        disconnect();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 rounded-xl text-xs transition-all font-bold uppercase tracking-wider active:scale-95"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
