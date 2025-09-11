"use client";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/web3/hooks/useWallet";
import { formatAddress } from "@/lib/web3/utils/address";
import { Loader2, Wallet } from "lucide-react";

export function WalletButton() {
  const { address, isConnected, connect, disconnect, connectors, isConnecting } = useWallet();

  if (isConnected && address) {
    return (
      <Button variant="outline" onClick={() => disconnect()} className="gap-2">
        <Wallet className="h-4 w-4" />
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isConnecting}
          variant="outline"
        >
          {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : connector.name}
        </Button>
      ))}
    </div>
  );
}

