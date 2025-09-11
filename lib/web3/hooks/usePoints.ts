"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { POINTS_CONTRACT_ADDRESS } from "../config/contracts";

const pointsAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function claimDailyPoints() returns (uint256)",
  "function transferPoints(address to, uint256 amount) returns (bool)",
  "event PointsClaimed(address indexed user, uint256 amount)",
  "event PointsTransferred(address indexed from, address indexed to, uint256 amount)",
]);

export function usePoints() {
  const { address } = useAccount();

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: POINTS_CONTRACT_ADDRESS,
    abi: pointsAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  });

  const claimDailyPoints = async () => {
    await writeContract({
      address: POINTS_CONTRACT_ADDRESS,
      abi: pointsAbi,
      functionName: "claimDailyPoints",
    });
    // refresh after short delay
    setTimeout(() => refetchBalance(), 1500);
  };

  return {
    balance: balance ? Number(balance) : 0,
    claimDailyPoints,
    isClaiming: isPending || isConfirming,
    refetchBalance,
  };
}

