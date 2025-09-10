"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Shuffle, Search, Sparkles, BookOpen, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import TempleSystemSelector from '@/components/fortune/TempleSystemSelector';
import { useFortuneI18n, useLocalizedField } from '@/lib/modules/fortune/i18n/useFortuneI18n';
import { useUserContext } from '@/hooks/useUserContext';
import Web3Layout from '@/components/Web3Layout';

interface TempleSystem {
  id: string;
  temple_name: string;
  temple_name_en?: string;
  temple_name_ja?: string;
  temple_code: string;
  location: string;
  deity: string;
  specialization: string[];
  total_slips: number;
  description: string;
  description_en?: string;
  description_ja?: string;
  cultural_context: string;
  cultural_context_en?: string;
  cultural_context_ja?: string;
  primary_color: string;
  secondary_color: string;
  established_year: number;
  partnership_tier: string;
  display_name: string;
  display_description: string;
  display_cultural_context: string;
}

interface FortuneSlip {
  id: string;
  temple_system_id: string;
  slip_number: number;
  title: string;
  content: string;
  basic_interpretation: string;
  categories: string[];
  fortune_level: 'excellent' | 'good' | 'average' | 'caution' | 'warning';
  historical_context?: string;
  symbolism?: string;
  temple_name?: string;
  temple_code?: string;
  temple_primary_color?: string;
  temple_secondary_color?: string;
  display_title: string;
  display_basic_interpretation: string;
  display_content?: string;
  access_level: string;
  requires_auth_for_details: boolean;
}

export default function FortunePageEN() {
  const [selectedTemple, setSelectedTemple] = useState<TempleSystem | null>(null);
  const [slipNumber, setSlipNumber] = useState<string>('');
  const [fortuneSlip, setFortuneSlip] = useState<FortuneSlip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIInterpretation, setShowAIInterpretation] = useState(false);

  // Unified user context with Web3 detection and language management
  const { isWeb3User, user, shouldUseWeb3Layout, isLoading: userLoading } = useUserContext();

  // Force English locale
  const locale = 'en-US';
  const getLocalizedField = useLocalizedField();

  const handleRandomSlip = async () => {
    if (!selectedTemple) {
      setError('Please select a temple first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fortune/random', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          temple_code: selectedTemple.temple_code,
          language: 'en'
        })
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setSlipNumber(data.data.slip_number.toString());
        await fetchFortuneSlip(selectedTemple.temple_code, data.data.slip_number);
      } else {
        setError(data.error || 'Failed to get random slip');
      }
    } catch (err) {
      setError('Network error, please try again');
      console.error('Random slip error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFortuneSlip = async (templeCode: string, slipNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/fortune/slips/${templeCode}/${slipNum}?language=en`);
      const data = await response.json();
      
      if (data.success) {
        setFortuneSlip(data.data);
      } else {
        setError(data.error || 'Failed to fetch fortune slip');
      }
    } catch (err) {
      setError('Network error, please try again');
      console.error('Fetch slip error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSlip = async () => {
    if (!selectedTemple || !slipNumber) {
      setError('Please select a temple and enter slip number');
      return;
    }

    const slipNum = parseInt(slipNumber);
    if (isNaN(slipNum) || slipNum < 1 || slipNum > selectedTemple.total_slips) {
      setError(`Slip number must be between 1-${selectedTemple.total_slips}`);
      return;
    }

    await fetchFortuneSlip(selectedTemple.temple_code, slipNum);
  };

  const getFortuneLevel = (level: string) => {
    const levels = {
      excellent: { label: 'Excellent Fortune', color: 'bg-green-100 text-green-800 border-green-200' },
      good: { label: 'Good Fortune', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      average: { label: 'Average Fortune', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      caution: { label: 'Caution', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      warning: { label: 'Warning', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    return levels[level as keyof typeof levels] || levels.average;
  };

  // Main content component
  const FortuneContent = () => (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3D0B5B] to-[#420868] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FBCB0A] mb-4">
              Fortune Divination · Temple Oracle
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Connect with Hong Kong's three most sacred temples for authentic fortune readings and spiritual guidance
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Temple Selection */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#3D0B5B]/5 to-[#FBCB0A]/5">
                <CardTitle className="flex items-center text-[#3D0B5B]">
                  <Building2 className="w-5 h-5 mr-2 text-[#FBCB0A]" />
                  Choose Temple
                </CardTitle>
                <CardDescription>
                  Select the temple system for your fortune reading
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <TempleSystemSelector
                  selectedTempleCode={selectedTemple?.temple_code}
                  onTempleSelect={setSelectedTemple}
                  className="border-2 border-[#FBCB0A]/20 hover:border-[#FBCB0A]/40"
                />
                
                {selectedTemple && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[#3D0B5B]">
                        {selectedTemple.temple_name_en || selectedTemple.temple_name}
                      </span>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: selectedTemple.primary_color,
                          color: selectedTemple.primary_color 
                        }}
                      >
                        {selectedTemple.total_slips} Slips
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedTemple.location} · {selectedTemple.deity}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Slip Number Input */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#3D0B5B]/5 to-[#FBCB0A]/5">
                <CardTitle className="flex items-center text-[#3D0B5B]">
                  <Search className="w-5 h-5 mr-2 text-[#FBCB0A]" />
                  Divination Method
                </CardTitle>
                <CardDescription>
                  Enter slip number manually or draw randomly
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3D0B5B] mb-2">
                    Slip Number {selectedTemple && `(1-${selectedTemple.total_slips})`}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter slip number"
                      value={slipNumber}
                      onChange={(e) => setSlipNumber(e.target.value)}
                      min="1"
                      max={selectedTemple?.total_slips || 100}
                      className="border-2 border-gray-200 focus:border-[#FBCB0A]"
                    />
                    <Button
                      onClick={handleManualSlip}
                      disabled={!selectedTemple || !slipNumber || loading}
                      className="bg-[#3D0B5B] hover:bg-[#420868] text-white px-6"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">or</span>
                  </div>
                </div>

                <Button
                  onClick={handleRandomSlip}
                  disabled={!selectedTemple || loading}
                  className="w-full bg-[#FBCB0A] hover:bg-[#FBCB0A]/90 text-[#3D0B5B] font-bold py-3"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {loading ? 'Drawing...' : 'Random Draw'}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-700 text-center">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Fortune Display */}
          <div className="lg:col-span-2 space-y-6">
            {fortuneSlip ? (
              <>
                {/* Fortune Slip Display */}
                <Card className="border-2 shadow-xl" style={{ borderColor: fortuneSlip.temple_primary_color }}>
                  <CardHeader 
                    className="text-white"
                    style={{ 
                      background: `linear-gradient(135deg, ${fortuneSlip.temple_primary_color}, ${fortuneSlip.temple_secondary_color})` 
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">
                          {fortuneSlip.temple_name} Slip #{fortuneSlip.slip_number}
                        </CardTitle>
                        <CardDescription className="text-white/80 text-lg">
                          {fortuneSlip.display_title}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getFortuneLevel(fortuneSlip.fortune_level).color} font-bold text-lg px-4 py-2`}
                      >
                        {getFortuneLevel(fortuneSlip.fortune_level).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-6 space-y-6">
                    {/* Categories */}
                    {fortuneSlip.categories.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-[#3D0B5B] mb-2">Applicable Areas:</h4>
                        <div className="flex flex-wrap gap-2">
                          {fortuneSlip.categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="border-[#FBCB0A] text-[#3D0B5B]">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    {fortuneSlip.display_content && (
                      <div>
                        <h4 className="font-semibold text-[#3D0B5B] mb-2 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Fortune Text:
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#FBCB0A]">
                          <p className="text-lg leading-relaxed text-gray-800 font-medium">
                            {fortuneSlip.display_content}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Basic Interpretation */}
                    <div>
                      <h4 className="font-semibold text-[#3D0B5B] mb-2">Basic Interpretation:</h4>
                      <div className="bg-gradient-to-r from-[#3D0B5B]/5 to-[#FBCB0A]/5 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">
                          {fortuneSlip.display_basic_interpretation}
                        </p>
                      </div>
                    </div>

                    {/* Auth Prompt for Detailed Analysis */}
                    {fortuneSlip.requires_auth_for_details && (
                      <Card className="border-2 border-[#FBCB0A] bg-gradient-to-r from-[#FBCB0A]/10 to-[#3D0B5B]/5">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Sparkles className="w-8 h-8 mx-auto text-[#FBCB0A] mb-2" />
                            <h4 className="font-bold text-[#3D0B5B] mb-2">Unlock Detailed AI Analysis</h4>
                            <p className="text-gray-600 mb-4">
                              Sign in to get personalized detailed interpretations, reading history, and premium features
                            </p>
                            <div className="flex gap-2 justify-center">
                              <Button 
                                className="bg-[#3D0B5B] hover:bg-[#420868] text-white"
                                onClick={() => window.location.href = '/en/auth'}
                              >
                                Sign In
                              </Button>
                              <Button 
                                variant="outline" 
                                className="border-[#FBCB0A] text-[#3D0B5B]"
                                onClick={() => window.location.href = '/en/auth'}
                              >
                                Register
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Begin Your Fortune Reading Journey
                    </h3>
                    <p className="text-gray-500">
                      Please select a temple first, then enter a slip number or draw randomly
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading while checking user status
  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D0B5B] mx-auto mb-4"></div>
          <p className="text-[#3D0B5B]">Loading...</p>
        </div>
      </div>
    );
  }

  // Use unified layout decision logic
  if (shouldUseWeb3Layout && user) {
    return (
      <Web3Layout user={user} showNavigation={true}>
        <FortuneContent />
      </Web3Layout>
    );
  }

  // Regular users get the standalone layout
  return <FortuneContent />;
}