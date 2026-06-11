import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, ExternalLink, HelpCircle, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { ARC_TESTNET_INFO, CONTRACT_ADDRESSES } from '../constants';

export default function Network() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [addingNetwork, setAddingNetwork] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error: boolean } | null>(null);

  const addArcNetwork = async () => {
    setAddingNetwork(true);
    setStatusMessage(null);

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x4CE986', // 5042002 in hex
              chainName: 'Arc Testnet',
              nativeCurrency: {
                name: 'USDC',
                symbol: 'USDC',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.testnet.arc.network'],
              blockExplorerUrls: ['https://testnet.arcscan.app'],
            },
          ],
        });
        setStatusMessage({ text: 'Arc Testnet was successfully added to your wallet!', error: false });
      } catch (err: any) {
        console.error(err);
        setStatusMessage({ text: err.message || 'Failed to configure Arc Testnet in wallet.', error: true });
      } finally {
        setAddingNetwork(false);
      }
    } else {
      setStatusMessage({ text: 'Web3 Wallet provider not identified. Please integrate MetaMask first.', error: true });
      setAddingNetwork(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const networkDetails = [
    { label: 'Network Name', value: ARC_TESTNET_INFO.name, key: 'name', copy: false },
    { label: 'Chain ID', value: String(ARC_TESTNET_INFO.chainId), key: 'chain', copy: true },
    { label: 'RPC Endpoint URL', value: ARC_TESTNET_INFO.rpcUrl, key: 'rpc', copy: true },
    { label: 'Block Explorer URL', value: ARC_TESTNET_INFO.explorer, key: 'explorer', copy: true },
    { label: 'Native Gas Asset', value: ARC_TESTNET_INFO.nativeToken, key: 'gas', copy: false },
  ];

  const contracts = [
    { label: 'TribeArc Contract', value: CONTRACT_ADDRESSES.dex, key: 'dex_contract' },
    { label: 'USDC Token Address', value: CONTRACT_ADDRESSES.usdc, key: 'usdc_token' },
    { label: 'EURC Token Address', value: CONTRACT_ADDRESSES.eurc, key: 'eurc_token' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Lights */}
      <div className="absolute top-[20%] right-[20%] -z-10 h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[130px]" />
      <div className="absolute bottom-[10%] left-[10%] -z-10 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[130px]" />

      <div className="max-w-4xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Network Specifications
          </h2>
          <p className="mt-4 text-base text-neutral-400">
            Full connection metadata and verified stablecoin smart contract addresses on Arc Testnet protocol.
          </p>
        </div>

        {/* Network details card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Main Info Box */}
          <div className="lg:col-span-2 rounded-3xl glass-panel p-8 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Arc Testnet Parameters</h3>
            
            <div className="space-y-4">
              {networkDetails.map((detail, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm font-semibold text-neutral-400 mb-1 sm:mb-0">
                    {detail.label}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-white max-w-[280px] sm:max-w-none truncate bg-neutral-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                      {detail.value}
                    </span>

                    {detail.copy && (
                      <button
                        onClick={() => copyToClipboard(detail.value, detail.key)}
                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all active:scale-95 border border-white/5"
                        title="Copy to clipboard"
                      >
                        {copiedKey === detail.key ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links & Guides sidebar */}
          <div className="flex flex-col space-y-6 font-sans">
            <div className="rounded-3xl glass-panel p-8 border border-white/5 flex-1">
              <h4 className="font-bold text-white mb-3">Circle Official Faucet</h4>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                Get free USDC on Arc Testnet from Circle's official faucet
              </p>

              <div className="space-y-3">
                <a
                  href="https://faucet.circle.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 rounded-xl bg-purple-600/20 border border-purple-500/30 text-xs font-bold text-purple-100 hover:bg-purple-600/30 transition-all active:scale-95"
                >
                  <span>Get Testnet USDC</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Smart Contracts list card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl glass-panel p-8 border border-white/5 mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-6">Verified Protocol Smart Contracts</h3>
          
          <div className="space-y-5">
            {contracts.map((contract, i) => (
              <div 
                key={i} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-neutral-900/40 border border-white/5"
              >
                <div className="flex flex-col mb-2 sm:mb-0">
                  <span className="text-sm font-bold text-white">{contract.label}</span>
                  <span className="text-[11px] font-mono text-purple-400 mt-0.5">Verified Balance Pool Provider</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-neutral-300 truncate max-w-[240px] md:max-w-none">
                    {contract.value}
                  </span>

                  <button
                    onClick={() => copyToClipboard(contract.value, contract.key)}
                    className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all active:scale-95 border border-white/5 shrink-0"
                    title="Copy contract"
                  >
                    {copiedKey === contract.key ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <a
                    href={`${ARC_TESTNET_INFO.explorer}/address/${contract.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all border border-white/5 shrink-0"
                    title="View on ArcScan"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Help Info Box */}
        <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex space-x-4 items-start">
          <HelpCircle className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-purple-200">How to add these custom tokens to MetaMask</h4>
            <p className="text-xs text-purple-300/80 leading-relaxed mt-1">
              To see your USDC and EURC balances in MetaMask, open MetaMask, scroll to the bottom of the "Tokens" tab, click "Import Tokens", paste the USDC and EURC contract addresses listed above into the Custom Token contract field, and click "Add Custom Token".
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
