// Wagmi configuration for AstroZi Web3
// Follows docs/architecture/web3-viem-wagmi-migration.md
"use client";

import { createConfig, http } from "wagmi";
import { bsc, bscTestnet, mainnet, polygon } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const resolveAppUrl = () =>
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://astrozi.com";

export const createWagmiConfig = () => {
  const appUrl = resolveAppUrl();

  // Clear corrupted WalletConnect storage on initialization
  if (typeof window !== 'undefined') {
    try {
      const wcKeys = Object.keys(localStorage).filter(key =>
        key.startsWith('wc@2') || key.startsWith('@walletconnect')
      );
      wcKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value === '{}' || value === 'null' || value === '') {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Ignore individual key errors
        }
      });
    } catch (e) {
      // Ignore storage errors
    }
  }

  return createConfig({
    chains: [bsc, bscTestnet, mainnet, polygon],
    connectors: [
      // Only use injected connector - Privy handles WalletConnect
      injected(),
    ],
    transports: {
      [bsc.id]: http("https://bsc-dataseed.binance.org/"),
      [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545/"),
      [mainnet.id]: http(),
      [polygon.id]: http(),
    },
  });
};

export const wagmiConfig = createWagmiConfig();
