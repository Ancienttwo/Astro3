"use client";

import { ReactNode, useEffect, useState } from "react";

/**
 * Web3Provider（健壮版）
 * - 延迟加载 wagmi 及其依赖，避免构建期/加载期不兼容导致的崩溃
 * - 失败时降级为直通 Provider，保证应用可用
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  const [WagmiProviderComp, setWagmiProviderComp] = useState<((props: any) => JSX.Element) | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const wagmi = await import("wagmi");
        const chainsMod = await import("wagmi/chains");
        const connectorsMod = await import("wagmi/connectors");

        const { createConfig, http, WagmiProvider } = wagmi as any;
        const { bsc, bscTestnet, mainnet, polygon } = chainsMod as any;
        const { walletConnect, injected, coinbaseWallet } = connectorsMod as any;

        const projectId = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string) || "demo";
        const appUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL as string) || "https://astrozi.com";

        const cfg = createConfig({
          chains: [bsc, bscTestnet, mainnet, polygon],
          connectors: [
            injected?.(),
            walletConnect?.({
              projectId,
              metadata: {
                name: "AstroZi",
                description: "AI Life Engineering Platform",
                url: appUrl,
                icons: [
                  typeof window !== "undefined" ? `${appUrl}/icon-192.svg` : `${appUrl}/icon-192.svg`,
                ],
              },
            }),
            coinbaseWallet?.({ appName: "AstroZi" }),
          ].filter(Boolean),
          transports: {
            [bsc.id]: http?.("https://bsc-dataseed.binance.org/"),
            [bscTestnet.id]: http?.("https://data-seed-prebsc-1-s1.binance.org:8545/"),
            [mainnet.id]: http?.(),
            [polygon.id]: http?.(),
          },
        });

        if (!cancelled) {
          setWagmiProviderComp(() => WagmiProvider);
          setConfig(cfg);
        }
      } catch (err) {
        console.warn("[Web3] 加载 wagmi 失败，已降级直通:", err);
        if (!cancelled) {
          setWagmiProviderComp(null);
          setConfig(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (WagmiProviderComp && config) {
    const Comp = WagmiProviderComp as any;
    return <Comp config={config}>{children}</Comp>;
  }

  // 降级：不启用 Web3 Provider，直接渲染子节点
  return <>{children}</>;
}
