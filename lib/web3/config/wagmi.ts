// Wagmi configuration for AstroZi Web3
// Follows docs/architecture/web3-viem-wagmi-migration.md
"use client";

import { createConfig, http } from "wagmi";
import { bsc, bscTestnet, mainnet, polygon } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [bsc, bscTestnet, mainnet, polygon],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo", // ensure defined in env
      metadata: {
        name: "AstroZi",
        description: "AI Life Engineering Platform",
        // Avoid dev warning by matching current origin in client; prod falls back to NEXT_PUBLIC_APP_URL
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || "https://astrozi.com",
        icons: [
          typeof window !== "undefined"
            ? `${window.location.origin}/icon-192.svg`
            : (process.env.NEXT_PUBLIC_APP_URL || "https://astrozi.com") + "/icon-192.svg",
        ],
      },
    }),
    coinbaseWallet({
      appName: "AstroZi",
    }),
  ],
  transports: {
    [bsc.id]: http("https://bsc-dataseed.binance.org/"),
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.binance.org:8545/"),
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});
