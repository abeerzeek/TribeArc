import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';

// Define Arc Testnet Chain according to wagmi/viem Chain properties
export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
} as const;

const projectId = 'cd9f25b1327b9c51128deb068fb784ed';

const wallets = [
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
];

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets,
    },
  ],
  {
    appName: 'TribeArc',
    projectId,
  }
);

// Configure Wagmi settings with RainbowKit manually to ensure full stability
export const config = createConfig({
  connectors,
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
});
