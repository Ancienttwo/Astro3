"use client";

import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivitySummary } from "@/components/dashboard/ActivitySummary";
import { useAuth } from "@/contexts/PrivyContext";
import { trackDashboardLoad } from "@/lib/performance";
import {
    MetricsOverviewSkeleton,
    ActivitySummarySkeleton,
    QuickActionsSkeleton,
} from "@/components/dashboard/DashboardSkeleton";

// Code-split Web3 components (only loaded for wallet users)
const Web3StatusBanner = dynamic(
  () => import("@/components/dashboard/Web3StatusBanner").then((mod) => ({ default: mod.Web3StatusBanner })),
  { ssr: false }
);

const Web3MetricsCard = dynamic(
  () => import("@/components/dashboard/Web3MetricsCard").then((mod) => ({ default: mod.Web3MetricsCard })),
  { ssr: false }
);

const NFTShowcase = dynamic(
  () => import("@/components/dashboard/NFTShowcase").then((mod) => ({ default: mod.NFTShowcase })),
  { ssr: false }
);

// Lazy-load educational content below fold
const EducationalSection = dynamic(
  () => import("@/components/dashboard/EducationalSection").then((mod) => ({ default: mod.EducationalSection })),
  { ssr: false, loading: () => <div className="h-96 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" /> }
);

export default function DashboardPage() {
    const { isWalletConnected, login } = useAuth();

    // Track dashboard load performance
    useEffect(() => {
        trackDashboardLoad();
    }, []);

    const handleConnectWallet = async () => {
        try {
            await login();
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    };

    return (
        <div className="flex h-screen flex-col">
            <DashboardHeader
                title="Dashboard"
                subtitle="Welcome back to AstroZi"
            />
            <div className="flex-1 overflow-auto p-3 md:p-4 lg:p-6 pb-20 md:pb-6">
                <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                    {/* Welcome Section */}
                    <WelcomeSection />

                    {/* Web3 Status Banner (only if not connected) */}
                    {!isWalletConnected && (
                        <Web3StatusBanner
                            isConnected={isWalletConnected}
                            onConnect={handleConnectWallet}
                        />
                    )}

                    {/* Metrics Overview */}
                    <Suspense fallback={<MetricsOverviewSkeleton />}>
                        <MetricsOverview />
                    </Suspense>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Quick Actions + Educational Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Actions */}
                            <Suspense fallback={<QuickActionsSkeleton />}>
                                <QuickActions />
                            </Suspense>

                            {/* Educational Content Section */}
                            <EducationalSection />
                        </div>

                        {/* Right Column - Activity Summary + Web3 Features */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Activity Summary */}
                            <Suspense fallback={<ActivitySummarySkeleton />}>
                                <ActivitySummary />
                            </Suspense>

                            {/* Web3 Metrics Card */}
                            <Web3MetricsCard
                                isConnected={isWalletConnected}
                                onConnect={handleConnectWallet}
                            />

                            {/* NFT Showcase */}
                            <NFTShowcase isConnected={isWalletConnected} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
