"use client";

import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const supabase = createClientComponentClient();

  const authenticateWithSupabase = useCallback(async () => {
    if (!address) throw new Error("No wallet connected");

    const { data: nonceData, error: nonceError } = await supabase
      .from("web3_nonces")
      .insert({ address: address.toLowerCase() })
      .select("nonce")
      .single();

    if (nonceError || !nonceData?.nonce) {
      throw new Error("Failed to get nonce for signing");
    }

    const message = `Sign in to AstroZi\nNonce: ${nonceData.nonce}`;
    const signature = await signMessageAsync({ message });

    // Example: a simple credential flow. Real implementation likely uses a custom endpoint.
    const { data: session, error } = await supabase.auth.signInWithPassword({
      email: `${address.toLowerCase()}@wallet.local`,
      password: signature,
    } as any);

    if (error) throw error;
    return session;
  }, [address, signMessageAsync, supabase]);

  return {
    address,
    isConnected,
    chain,
    connect,
    disconnect,
    connectors,
    isConnecting: isPending,
    authenticateWithSupabase,
  };
}

