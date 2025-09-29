// Wagmi configuration for AstroZi Web3
// Follows docs/architecture/web3-viem-wagmi-migration.md
"use client";

import { createConfig, http } from "wagmi";
import { bsc, bscTestnet, mainnet, polygon } from "wagmi/chains";
import { walletConnect, injected } from "wagmi/connectors";

const resolveAppUrl = () =>
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "https://astrozi.com";

export const createWagmiConfig = () => {
  const appUrl = resolveAppUrl();

  return createConfig({
    chains: [bsc, bscTestnet, mainnet, polygon],
    connectors: [
      injected(),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo", // ensure defined in env
        metadata: {
          name: "AstroZi",
          description: "AI Life Engineering Platform",
          url: appUrl,
          icons: [
            `${appUrl}/icon-192.svg`,
          ],
        },
      }),
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
