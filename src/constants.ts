export const ARC_TESTNET_INFO = {
  chainId: 5042002,
  name: 'Arc Testnet',
  rpcUrl: 'https://rpc.testnet.arc.network',
  explorer: 'https://testnet.arcscan.app',
  nativeToken: 'USDC',
};

export const CONTRACT_ADDRESSES = {
  dex: '0x56735b1e16C3393aFc57EBB1c0bF9Cc09a34b893' as `0x${string}`,
  usdc: '0x3600000000000000000000000000000000000000' as `0x${string}`,
  eurc: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a' as `0x${string}`,
};

export const erc20ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: 'remaining', type: 'uint256' }],
  },
] as const;

export const tribeArcDexABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { name: 'usdcAmount', type: 'uint256' },
      { name: 'eurcAmount', type: 'uint256' },
    ],
    name: 'addLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'tokenIn', type: 'address' },
    ],
    name: 'getAmountOut',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
    ],
    name: 'swap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feePercent',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
