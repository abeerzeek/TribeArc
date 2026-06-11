import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ArrowDownUp, RefreshCw, AlertCircle, CheckCircle2, Sliders, ExternalLink, PiggyBank, Coins } from 'lucide-react';
import { CONTRACT_ADDRESSES, erc20ABI, tribeArcDexABI } from '../constants';
const TOKEN_DETAILS = {
  USDC: {
    symbol: 'USDC' as const,
    name: 'USD Coin',
    address: '0x3600000000000000000000000000000000000000',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  },
  EURC: {
    symbol: 'EURC' as const,
    name: 'Euro Coin',
    address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
    logo: 'https://assets.coingecko.com/coins/images/26045/small/euro-coin.png',
  },
};

function TokenIcon({ symbol, size = 24 }: { symbol: 'USDC' | 'EURC'; size?: number }) {
  const [error, setError] = useState(false);
  const details = TOKEN_DETAILS[symbol];
  
  if (error) {
    return (
      <span 
        className="flex items-center justify-center bg-purple-500/20 text-purple-300 font-bold rounded-full font-sans shrink-0 border border-purple-500/30 shadow-[0_0_10px_rgba(147,51,234,0.15)]"
        style={{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.max(10, size * 0.55)}px` }}
      >
        {symbol === 'USDC' ? '$' : '€'}
      </span>
    );
  }

  return (
    <img 
      src={details.logo} 
      alt={symbol} 
      className="rounded-full object-contain shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
      onError={() => {
        console.warn(`TokenIcon: failed to load logo for ${symbol}, rendering fallback emoji.`);
        setError(true);
      }}
      referrerPolicy="no-referrer"
    />
  );
}

export default function Swap() {
  const { address: userAddress, isConnected } = useAccount();

  // Selected tab: 'swap' or 'liquidity'
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap');

  // SWAP STATES
  const [sellToken, setSellToken] = useState<'USDC' | 'EURC'>('USDC');
  const [sellDropdownOpen, setSellDropdownOpen] = useState(false);
  const [buyDropdownOpen, setBuyDropdownOpen] = useState(false);
  const [sellAmount, setSellAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5); // Slippage in %
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [customSlippage, setCustomSlippage] = useState<string>('');

  // LIQUIDITY STATES
  const [liqUsdcAmount, setLiqUsdcAmount] = useState<string>('');
  const [liqEurcAmount, setLiqEurcAmount] = useState<string>('');

  // TRANSACTION STATUS STATES
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [txAction, setTxAction] = useState<string | null>(null);

  const buyToken = sellToken === 'USDC' ? 'EURC' : 'USDC';
  const sellTokenAddress = CONTRACT_ADDRESSES[sellToken.toLowerCase() as 'usdc' | 'eurc'];
  const buyTokenAddress = CONTRACT_ADDRESSES[buyToken.toLowerCase() as 'usdc' | 'eurc'];

  // Current token precision (both are 6 decimals)
  const tokenDecimals = 6;

  // Parsed input amount
  let parsedSellAmount = 0n;
  try {
    if (sellAmount && !isNaN(Number(sellAmount))) {
      parsedSellAmount = parseUnits(sellAmount, tokenDecimals);
    }
  } catch (e) {
    parsedSellAmount = 0n;
  }

  // Contract Read: Rate Calculation using getAmountOut
  const { 
    data: amountOutRaw, 
    isPending: isRateLoading, 
    refetch: refetchQuote 
  } = useReadContract({
    address: CONTRACT_ADDRESSES.dex,
    abi: tribeArcDexABI,
    functionName: 'getAmountOut',
    args: parsedSellAmount > 0n ? [parsedSellAmount, sellTokenAddress] : undefined,
    query: {
      enabled: parsedSellAmount > 0n && isConnected,
      refetchInterval: 15000,
    }
  });

  const expectedBuyAmount = amountOutRaw ? formatUnits(amountOutRaw, tokenDecimals) : '0';

  // Math for minimum buy amount out based on slippage
  let minAmountOut = 0n;
  if (amountOutRaw) {
    const slipBasisPoints = BigInt(Math.floor(slippage * 100)); // 0.5% = 50 basis points
    minAmountOut = amountOutRaw - (amountOutRaw * slipBasisPoints / 10000n);
  }

  // Contract Reads: User Token Balances
  const { data: userUsdcBalance, refetch: refetchUserUsdc } = useReadContract({
    address: CONTRACT_ADDRESSES.usdc,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: isConnected && !!userAddress }
  });

  const { data: userEurcBalance, refetch: refetchUserEurc } = useReadContract({
    address: CONTRACT_ADDRESSES.eurc,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: isConnected && !!userAddress }
  });

  const formattedUserUsdc = userUsdcBalance ? formatUnits(userUsdcBalance, tokenDecimals) : '0';
  const formattedUserEurc = userEurcBalance ? formatUnits(userEurcBalance, tokenDecimals) : '0';
  const currentSellTokenBalance = sellToken === 'USDC' ? userUsdcBalance : userEurcBalance;
  const currentFormattedSellTokenBalance = sellToken === 'USDC' ? formattedUserUsdc : formattedUserEurc;

  // Contract Reads: Pool Reserves (Token Balance Of DEX Contract)
  const { data: poolUsdcReserve, refetch: refetchPoolUsdc } = useReadContract({
    address: CONTRACT_ADDRESSES.usdc,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESSES.dex],
  });

  const { data: poolEurcReserve, refetch: refetchPoolEurc } = useReadContract({
    address: CONTRACT_ADDRESSES.eurc,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: [CONTRACT_ADDRESSES.dex],
  });

  const formattedPoolUsdc = poolUsdcReserve ? formatUnits(poolUsdcReserve, tokenDecimals) : '0';
  const formattedPoolEurc = poolEurcReserve ? formatUnits(poolEurcReserve, tokenDecimals) : '0';

  // Query 1 USDC price in terms of EURC
  const { data: priceUsdcToEurcRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.dex,
    abi: tribeArcDexABI,
    functionName: 'getAmountOut',
    args: [1000000n, CONTRACT_ADDRESSES.usdc],
    query: {
      refetchInterval: 12000,
    }
  });

  // Query 1 EURC price in terms of USDC
  const { data: priceEurcToUsdcRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.dex,
    abi: tribeArcDexABI,
    functionName: 'getAmountOut',
    args: [1000000n, CONTRACT_ADDRESSES.eurc],
    query: {
      refetchInterval: 12000,
    }
  });

  const parsedUsdcToReferencePrice = priceUsdcToEurcRaw ? parseFloat(formatUnits(priceUsdcToEurcRaw, 6)) : 0;
  const parsedEurcToReferencePrice = priceEurcToUsdcRaw ? parseFloat(formatUnits(priceEurcToUsdcRaw, 6)) : 0;

  // Contract Reads: Token Allowance of User to DEX spender
  const { data: userAllowance, refetch: refetchAllowance } = useReadContract({
    address: sellTokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, CONTRACT_ADDRESSES.dex] : undefined,
    query: { enabled: isConnected && !!userAddress }
  });

  // Check allowances for liquidity provision
  const { data: liqUsdcAllowance, refetch: refetchLiqUsdcAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.usdc,
    abi: erc20ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, CONTRACT_ADDRESSES.dex] : undefined,
    query: { enabled: isConnected && !!userAddress }
  });

  const { data: liqEurcAllowance, refetch: refetchLiqEurcAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.eurc,
    abi: erc20ABI,
    functionName: 'allowance',
    args: userAddress ? [userAddress, CONTRACT_ADDRESSES.dex] : undefined,
    query: { enabled: isConnected && !!userAddress }
  });

  // Write Contract Setup
  const { writeContractAsync, data: txHash, isPending: isTxSigning, error: writeError } = useWriteContract();

  // Wait receipt setup
  const { isLoading: isTxProcessing, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Helpers to refresh all queries
  const refetchAll = () => {
    refetchUserUsdc();
    refetchUserEurc();
    refetchPoolUsdc();
    refetchPoolEurc();
    refetchAllowance();
    refetchQuote();
    refetchLiqUsdcAllowance();
    refetchLiqEurcAllowance();
  };

  useEffect(() => {
    if (isTxConfirmed) {
      setTxAction((prev) => `${prev} Confirmed!`);
      refetchAll();
      setTimeout(() => {
        setTxAction(null);
        setSellAmount('');
        setLiqUsdcAmount('');
        setLiqEurcAmount('');
      }, 5000);
    }
  }, [isTxConfirmed]);

  useEffect(() => {
    if (writeError) {
      setErrorStatus(writeError.message || 'Signature of transaction was rejected.');
      setTxAction(null);
    }
  }, [writeError]);

  // Handle Token Flip
  const flipTokens = () => {
    setSellToken(buyToken);
    setSellAmount('');
    setErrorStatus(null);
  };

  const selectSellToken = (token: 'USDC' | 'EURC') => {
    setSellToken(token);
    setSellAmount('');
    setErrorStatus(null);
    setSellDropdownOpen(false);
  };

  const selectBuyToken = (token: 'USDC' | 'EURC') => {
    if (token === sellToken) {
      flipTokens();
    }
    setBuyDropdownOpen(false);
  };

  // Trigger max handler
  const setMaxAmount = () => {
    setSellAmount(currentFormattedSellTokenBalance);
  };

  // SWAP ACTION HANDLER
  const handleSwapAction = async () => {
    setErrorStatus(null);
    if (!isConnected || !userAddress) return;

    if (parsedSellAmount === 0n) {
      setErrorStatus('Please provide a valid trade amount.');
      return;
    }

    if (currentSellTokenBalance && parsedSellAmount > currentSellTokenBalance) {
      setErrorStatus(`Insufficient ${sellToken} balance for this transaction.`);
      return;
    }

    try {
      const needsApproval = !userAllowance || userAllowance < parsedSellAmount;

      if (needsApproval) {
        setTxAction(`Permitting spender space for ${sellToken}`);
        await writeContractAsync({
          address: sellTokenAddress,
          abi: erc20ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.dex, parseUnits('5000000', tokenDecimals)], // Approve large boundary
        });
      } else {
        setTxAction(`Routing swap of ${sellAmount} ${sellToken}`);
        await writeContractAsync({
          address: CONTRACT_ADDRESSES.dex,
          abi: tribeArcDexABI,
          functionName: 'swap',
          args: [sellTokenAddress, parsedSellAmount, minAmountOut],
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || 'Swap flow was abruptly closed.');
      setTxAction(null);
    }
  };

  // LIQUIDITY PROVISION HANDLER
  const handleAddLiquidity = async () => {
    setErrorStatus(null);
    if (!isConnected || !userAddress) return;

    let parsedUsdc = 0n;
    let parsedEurc = 0n;

    try {
      parsedUsdc = parseUnits(liqUsdcAmount, tokenDecimals);
      parsedEurc = parseUnits(liqEurcAmount, tokenDecimals);
    } catch (e) {
      setErrorStatus('Please clarify correct numerical amounts.');
      return;
    }

    if (parsedUsdc === 0n || parsedEurc === 0n) {
      setErrorStatus('You must insert non-zero values for both assets.');
      return;
    }

    if (userUsdcBalance && parsedUsdc > userUsdcBalance) {
      setErrorStatus('Insufficient USDC balance to supply liquidity.');
      return;
    }

    if (userEurcBalance && parsedEurc > userEurcBalance) {
      setErrorStatus('Insufficient EURC balance to supply liquidity.');
      return;
    }

    try {
      // 1. Check USDC approval
      const usdcNeedsApprove = !liqUsdcAllowance || liqUsdcAllowance < parsedUsdc;
      if (usdcNeedsApprove) {
        setTxAction('Approve USDC spender allowance...');
        await writeContractAsync({
          address: CONTRACT_ADDRESSES.usdc,
          abi: erc20ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.dex, parseUnits('5000000', tokenDecimals)],
        });
        return;
      }

      // 2. Check EURC approval
      const eurcNeedsApprove = !liqEurcAllowance || liqEurcAllowance < parsedEurc;
      if (eurcNeedsApprove) {
        setTxAction('Approve EURC spender allowance...');
        await writeContractAsync({
          address: CONTRACT_ADDRESSES.eurc,
          abi: erc20ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.dex, parseUnits('5000000', tokenDecimals)],
        });
        return;
      }

      // 3. Trigger Add Liquidity
      setTxAction('Providing liquidity into TribeArc pool...');
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.dex,
        abi: tribeArcDexABI,
        functionName: 'addLiquidity',
        args: [parsedUsdc, parsedEurc],
      });

    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || 'Failed to complete liquidity actions.');
      setTxAction(null);
    }
  };

  // Custom slippage input handler
  const selectSlippage = (val: number) => {
    setSlippage(val);
    setCustomSlippage('');
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center">
      {/* Glow backgrounds */}
      <div className="absolute top-[30%] -z-10 h-[380px] w-[380px] rounded-full bg-purple-600/10 blur-[130px]" />
      <div className="absolute bottom-[20%] -z-10 h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[130px]" />

      <div className="w-full max-w-md mx-auto relative z-10">
        
        {/* Terminal Header Tabs Selector */}
        <div className="flex bg-neutral-900/60 p-1 rounded-2xl border border-white/5 mb-6 backdrop-blur-md">
          <button
            onClick={() => { setActiveTab('swap'); setErrorStatus(null); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'swap'
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            <span>Market Swap</span>
          </button>

          <button
            onClick={() => { setActiveTab('liquidity'); setErrorStatus(null); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === 'liquidity'
                ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PiggyBank className="h-3.5 w-3.5" />
            <span>Pool Liquidity</span>
          </button>
        </div>

        {/* SWAP TAB LAYOUT */}
        {activeTab === 'swap' && (
          <div className="rounded-3xl border border-white/10 glass-panel p-6 sm:p-8 shadow-2xl relative">
            
            {/* Title / Action Headers */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                <Coins className="h-5 w-5 text-purple-400" />
                <span>Swap Tokens</span>
              </h3>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={refetchAll}
                  className="p-2 rounded-xl bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white transition-all active:scale-90"
                  title="Force Refresh Data"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl border transition-all ${
                    showSettings 
                      ? 'bg-purple-950/40 text-purple-300 border-purple-500/30' 
                      : 'bg-neutral-900 border-white/5 text-neutral-400 hover:text-white'
                  }`}
                  title="Configure Slippage Settings"
                >
                  <Sliders className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* SLIPPAGE SETTINGS PANEL */}
            {showSettings && (
              <div className="bg-neutral-950/80 rounded-2xl p-4 border border-white/5 mb-6">
                <span className="text-xs font-bold text-neutral-400 block mb-3 uppercase tracking-wider">
                  Select Max Slippage (%):
                </span>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[0.1, 0.5, 1.0].map((val) => (
                    <button
                      key={val}
                      onClick={() => selectSlippage(val)}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        slippage === val && !customSlippage
                          ? 'bg-purple-600 text-white'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Custom"
                    value={customSlippage}
                    onChange={(e) => {
                      setCustomSlippage(e.target.value);
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) setSlippage(val);
                    }}
                    className="bg-neutral-900 border border-white/5 rounded-lg text-center font-bold px-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <p className="text-[10px] text-neutral-500">
                  Your transaction will revert if the price slips below this set threshold percentage.
                </p>
              </div>
            )}

            {/* Input Token Panel (Sell) */}
            <div className="bg-neutral-950/60 border border-white/5 p-4 rounded-2xl relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pay From</span>
                <span className="text-xs text-neutral-400 font-medium">
                  Bal: {parseFloat(currentFormattedSellTokenBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={sellAmount}
                  disabled={!isConnected}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-white max-w-[120px] sm:max-w-[200px] focus:outline-none placeholder-neutral-700 font-mono disabled:opacity-50"
                />
                <div className="flex items-center space-x-2 shrink-0">
                  {isConnected && (
                    <button
                      onClick={setMaxAmount}
                      className="px-2.5 py-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 rounded-md hover:bg-purple-500/20 uppercase tracking-widest border border-purple-500/20 active:scale-95 transition-all"
                    >
                      MAX
                    </button>
                  )}
                  
                  {/* Interactive Token Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setSellDropdownOpen(!sellDropdownOpen);
                        setBuyDropdownOpen(false);
                      }}
                      className="text-sm font-bold text-white font-sans bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-xl border border-white/5 flex items-center space-x-2 transition-all active:scale-95 duration-150"
                      id="sell-token-selector-btn"
                    >
                      <TokenIcon symbol={sellToken} size={24} />
                      <span>{sellToken}</span>
                      <span className="text-neutral-500 text-[10px]">▼</span>
                    </button>

                    {sellDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl z-50 backdrop-blur-md">
                        {(['USDC', 'EURC'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => selectSellToken(t)}
                            className={`w-full text-left flex items-start space-x-3 p-2.5 rounded-xl border border-transparent transition-all ${
                              sellToken === t 
                                ? 'bg-purple-600/10 border-purple-500/20 text-purple-200' 
                                : 'hover:bg-white/5 text-neutral-300'
                            }`}
                          >
                            <TokenIcon symbol={t} size={24} />
                            <div className="flex flex-col text-left justify-center overflow-hidden">
                              <span className="text-xs font-bold text-white">
                                {TOKEN_DETAILS[t].name} <span className="text-purple-400">({t})</span>
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mid Flip Button */}
            <div className="flex justify-center -my-3.5 relative z-10">
              <button
                onClick={flipTokens}
                className="p-3 bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white rounded-xl shadow-2xl hover:scale-110 active:scale-90 transition-all bg-gradient-to-b hover:border-purple-500/40"
              >
                <ArrowDownUp className="h-4 w-4" />
              </button>
            </div>

            {/* Output Token Panel (Buy) */}
            <div className="bg-neutral-950/60 border border-white/5 p-4 rounded-2xl mt-1 relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Receive</span>
                <span className="text-xs text-neutral-400 font-medium">
                  Bal: {sellToken === 'USDC' ? parseFloat(formattedUserEurc).toLocaleString(undefined, { maximumFractionDigits: 4 }) : parseFloat(formattedUserUsdc).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-white font-mono placeholder-neutral-700 min-h-[36px] flex items-center">
                  {isRateLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                  ) : sellAmount ? (
                    parseFloat(expectedBuyAmount).toLocaleString(undefined, { maximumFractionDigits: 4 })
                  ) : (
                    <span className="text-neutral-700">0.0</span>
                  )}
                </div>
                <div className="shrink-0">
                  
                  {/* Interactive Token Dropdown (Buy side) */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setBuyDropdownOpen(!buyDropdownOpen);
                        setSellDropdownOpen(false);
                      }}
                      className="text-sm font-bold text-white font-sans bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 rounded-xl border border-white/5 flex items-center space-x-2 transition-all active:scale-95 duration-150"
                      id="buy-token-selector-btn"
                    >
                      <TokenIcon symbol={buyToken} size={24} />
                      <span>{buyToken}</span>
                      <span className="text-neutral-500 text-[10px]">▼</span>
                    </button>

                    {buyDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl z-50 backdrop-blur-md">
                        {(['USDC', 'EURC'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => selectBuyToken(t)}
                            className={`w-full text-left flex items-start space-x-3 p-2.5 rounded-xl border border-transparent transition-all ${
                              buyToken === t 
                                ? 'bg-purple-600/10 border-purple-500/20 text-purple-200' 
                                : 'hover:bg-white/5 text-neutral-300'
                            }`}
                          >
                            <TokenIcon symbol={t} size={24} />
                            <div className="flex flex-col text-left justify-center overflow-hidden">
                              <span className="text-xs font-bold text-white">
                                {TOKEN_DETAILS[t].name} <span className="text-purple-400">({t})</span>
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Quote info */}
            {sellAmount && parseFloat(sellAmount) > 0 && amountOutRaw && (
              <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Exchange Rate Quote:</span>
                  <span className="font-mono text-neutral-300">
                    1 {sellToken} ≈ {(parseFloat(expectedBuyAmount) / parseFloat(sellAmount)).toFixed(4)} {buyToken}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Slippage Tolerance:</span>
                  <span className="font-mono text-neutral-300">{slippage}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Guaranteed Minimum Out:</span>
                  <span className="font-mono text-purple-300 font-bold">
                    {parseFloat(formatUnits(minAmountOut, tokenDecimals)).toLocaleString(undefined, { maximumFractionDigits: 4 })} {buyToken}
                  </span>
                </div>
              </div>
            )}

            {/* Button Actions */}
            <div className="mt-8">
              {!isConnected ? (
                <div className="p-4 rounded-2xl bg-neutral-900 border border-white/5 text-center">
                  <p className="text-sm font-semibold text-neutral-400 mb-2">Connect your web3 wallet to trade</p>
                  <p className="text-xs text-neutral-500">TribeArc requires transaction signing parameters from the connected provider.</p>
                </div>
              ) : (
                <button
                  onClick={handleSwapAction}
                  disabled={isTxSigning || isTxProcessing}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] text-white font-bold rounded-2xl text-base tracking-widest uppercase transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isTxSigning ? (
                    <span className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Confirm in Wallet...</span>
                    </span>
                  ) : isTxProcessing ? (
                    <span className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Mining Tx on Arc...</span>
                    </span>
                  ) : !userAllowance || userAllowance < parsedSellAmount ? (
                    `Approve ${sellToken}`
                  ) : (
                    'Execute Swap'
                  )}
                </button>
              )}
            </div>

            {/* TRANSACTION FEEDBACK */}
            {txAction && (
              <div className="mt-6 p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-center space-x-3 text-xs text-blue-300 font-medium">
                <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-blue-400" />
                <div className="flex-1">
                  <div>{txAction}</div>
                  {txHash && (
                    <a
                      href={`https://testnet.arcscan.app/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 font-bold underline mt-1 text-blue-400 hover:text-blue-300"
                    >
                      <span>Track ArcScan</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {isTxConfirmed && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start space-x-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <div className="font-bold">Transaction Confirmed!</div>
                  <p className="text-[11px] text-emerald-400/80 mt-1">
                    Your stablecoin token swap has been compiled and secured into block registers successfully.
                  </p>
                  {txHash && (
                    <a
                      href={`https://testnet.arcscan.app/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 font-bold underline mt-1"
                    >
                      <span>View in Explorer</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/25 flex items-start space-x-3 text-xs text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="break-all">{errorStatus}</div>
              </div>
            )}

          </div>
        )}

        {/* LIQUIDITY TAB LAYOUT */}
        {activeTab === 'liquidity' && (
          <div className="rounded-3xl border border-white/10 glass-panel p-6 sm:p-8 shadow-2xl relative">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                <PiggyBank className="h-5 w-5 text-purple-400" />
                <span>Provide Liquidity</span>
              </h3>
              <button
                onClick={refetchAll}
                className="p-2 rounded-xl bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white transition-all active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-normal">
              Contribute capital to the USDC/EURC trading pair on TribeArc. Liquidity provider actions earn protocol pool depth, supporting market efficiency.
            </p>

            {/* Input USDC section */}
            <div className="bg-neutral-950/60 border border-white/5 p-4 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-sans">Settle USDC</span>
                <span className="text-xs text-neutral-400 font-medium">
                  Bal: {parseFloat(formattedUserUsdc).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={liqUsdcAmount}
                  disabled={!isConnected}
                  onChange={(e) => setLiqUsdcAmount(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-white max-w-[200px] focus:outline-none placeholder-neutral-700 font-mono"
                />
                <span className="text-sm font-bold text-white font-sans bg-neutral-900 px-3 py-1.5 rounded-xl border border-white/5 shrink-0 flex items-center space-x-2">
                  <TokenIcon symbol="USDC" size={20} />
                  <span>USDC</span>
                </span>
              </div>
            </div>

            {/* Input EURC section */}
            <div className="bg-neutral-950/60 border border-white/5 p-4 rounded-2xl mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-sans">Settle EURC</span>
                <span className="text-xs text-neutral-400 font-medium">
                  Bal: {parseFloat(formattedUserEurc).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <input
                  type="number"
                  placeholder="0.0"
                  value={liqEurcAmount}
                  disabled={!isConnected}
                  onChange={(e) => setLiqEurcAmount(e.target.value)}
                  className="bg-transparent text-2xl font-bold text-white max-w-[200px] focus:outline-none placeholder-neutral-700 font-mono"
                />
                <span className="text-sm font-bold text-white font-sans bg-neutral-900 px-3 py-1.5 rounded-xl border border-white/5 shrink-0 flex items-center space-x-2">
                  <TokenIcon symbol="EURC" size={20} />
                  <span>EURC</span>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            {!isConnected ? (
              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/5 text-center">
                <p className="text-sm font-semibold text-neutral-400">Connect wallet to add capital</p>
              </div>
            ) : (
              <button
                onClick={handleAddLiquidity}
                disabled={isTxSigning || isTxProcessing}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] text-white font-bold rounded-2xl text-base tracking-widest uppercase transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                {isTxSigning ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Signing Confirmation...</span>
                  </span>
                ) : isTxProcessing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Adding Liquidity...</span>
                  </span>
                ) : !liqUsdcAllowance || liqUsdcAllowance < parseUnits(liqUsdcAmount || '0', tokenDecimals) ? (
                  'Approve USDC Spender'
                ) : !liqEurcAllowance || liqEurcAllowance < parseUnits(liqEurcAmount || '0', tokenDecimals) ? (
                  'Approve EURC Spender'
                ) : (
                  'Provide Liquidity'
                )}
              </button>
            )}

            {/* ERROR / TX NOTIFICATIONS */}
            {txAction && (
              <div className="mt-6 p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-center space-x-3 text-xs text-blue-300 font-medium font-sans">
                <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-blue-400" />
                <div className="flex-1">
                  <div>{txAction}</div>
                  {txHash && (
                    <a
                      href={`https://testnet.arcscan.app/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 font-bold underline mt-1"
                    >
                      <span>Track ArcScan</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {isTxConfirmed && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start space-x-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <div className="font-bold">Liquidity Added!</div>
                  <p className="text-[11px] text-emerald-400/80 mt-1">
                    Your assets have been deposited into the pool block, bolstering trade capacities.
                  </p>
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/25 flex items-start space-x-3 text-xs text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                <div className="break-all">{errorStatus}</div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
