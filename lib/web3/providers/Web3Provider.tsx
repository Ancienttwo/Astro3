"use client";

import { useMemo, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { createWagmiConfig } from "@/lib/web3/config/wagmi";

/**
 * Web3Provider wraps the app with a pre-built wagmi config so hooks like useAccount
 * are always mounted inside a Wagmi context. This avoids runtime flashes where the
 * provider is missing while dynamic imports settle, which previously triggered
 * WagmiProviderNotFoundError.
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  const config = useMemo(() => createWagmiConfig(), []);

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
