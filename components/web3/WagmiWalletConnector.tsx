"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, ExternalLink, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance, useChainId } from "wagmi";

export default function WagmiWalletConnector() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { chains, switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: bal } = useBalance({ address });

  const bscMainnet = chains.find((c) => c.id === 56);
  const onBsc = chainId === 56;

  const openInExplorer = () => {
    if (address) window.open(`https://bscscan.com/address/${address}`, "_blank");
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">Connect Your Wallet</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {connectors.map((c) => (
              <Button key={c.id} onClick={() => connect({ connector: c })} disabled={isPending} variant="outline">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : c.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Wallet Connected
          </span>
          {onBsc ? (
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" /> BSC Mainnet
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" /> Wrong Network
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Address:</span>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{formatAddress(address!)}</code>
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={openInExplorer}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Balance:</span>
          <span className="font-medium">{bal?.formatted ?? "0"} {bal?.symbol ?? "BNB"}</span>
        </div>

        {!onBsc && bscMainnet && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 mb-2">Please switch to BSC Mainnet to use Web3 features.</p>
            <Button variant="outline" size="sm" onClick={() => switchChain({ chainId: bscMainnet.id })} disabled={isSwitching} className="w-full">
              {isSwitching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Switch to BSC Mainnet"}
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => disconnect()}>
            Disconnect
          </Button>
          {onBsc && (
            <Button onClick={() => window.open(`https://pancakeswap.finance/swap`, "_blank")} variant="outline" className="flex-1">
              Get BNB
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

