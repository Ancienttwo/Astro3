"use client";

import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Calendar, Users, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFortuneTranslations } from '@/lib/i18n/useFortuneTranslations';

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

interface TempleSystemSelectorProps {
  selectedTempleCode?: string;
  onTempleSelect: (temple: TempleSystem) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export default function TempleSystemSelector({ 
  selectedTempleCode, 
  onTempleSelect, 
  trigger,
  className = '' 
}: TempleSystemSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [temples, setTemples] = useState<TempleSystem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use fortune i18n system with next-intl
  const { t, locale, getLocalizedField } = useFortuneTranslations();

  const selectedTemple = temples.find(temple => temple.temple_code === selectedTempleCode);

  // Fetch temple systems
  useEffect(() => {
    const fetchTemples = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/fortune/systems?language=${locale}`);
        const data = await response.json();
        
        if (data.success) {
          setTemples(data.data);
        } else {
          setError(data.error || 'Failed to load temples');
        }
      } catch (err) {
        setError('Network error');
        console.error('Failed to fetch temples:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchTemples();
    }
  }, [isOpen, locale, t]);

  const handleTempleSelect = (temple: TempleSystem) => {
    onTempleSelect(temple);
    setIsOpen(false);
  };

  const getSpecializationColor = (specialization: string) => {
    const colors: { [key: string]: string } = {
      '学业': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      '功名': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      '考试': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
      '文学': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      '武略': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      '祈福': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      '求财': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      '姻缘': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
      '健康': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
      '事业': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      '驱邪': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      '避凶': 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300',
      '保平安': 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
      '化解灾难': 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
      '转运': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    };
    return colors[specialization] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const defaultTrigger = (
    <Button variant="outline" className={`w-full justify-start p-4 h-auto ${className}`}>
      <Building2 className="w-5 h-5 mr-3 text-amber-600 dark:text-amber-400" />
      <div className="flex flex-col items-start">
        <span className="font-medium dark:text-amber-400">
          {selectedTemple ? getLocalizedField(selectedTemple, 'temple_name') : t('temple.selectTemple')}
        </span>
        <span className="text-xs text-muted-foreground dark:text-slate-300">
          {selectedTemple ?
            `${selectedTemple.total_slips}${t('slip.title')} · ${selectedTemple.location}` :
            t('temple.selectTemple')
          }
        </span>
      </div>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 dark:text-amber-400">
            <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>{t('temple.title')}</span>
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 dark:text-amber-400" />
            <span className="ml-2 text-muted-foreground">{t('temple.loadingTemples')}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-center">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4 mt-4 md:grid-cols-1 lg:grid-cols-2">
            {temples.map((temple) => (
              <Card 
                key={temple.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                  selectedTempleCode === temple.temple_code
                    ? 'border-amber-400 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/10'
                    : 'border-border dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500'
                }`}
                style={{ 
                  borderColor: selectedTempleCode === temple.temple_code ? temple.primary_color : undefined,
                  backgroundColor: selectedTempleCode === temple.temple_code ? `${temple.primary_color}10` : undefined
                }}
                onClick={() => handleTempleSelect(temple)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle 
                        className="text-lg font-bold flex items-center"
                        style={{ color: temple.primary_color }}
                      >
                        {getLocalizedField(temple, 'temple_name')}
                        {selectedTempleCode === temple.temple_code && (
                          <Check className="w-5 h-5 ml-2 text-amber-600 dark:text-amber-400" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {temple.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {temple.total_slips}{t('slip.title')}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {temple.established_year}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {getLocalizedField(temple, 'description')}
                  </p>

                  <div className="mb-3">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">{t('temple.deity')}:</p>
                    <Badge
                      variant="secondary"
                      className="mr-2"
                      style={{
                        backgroundColor: temple.secondary_color + '20',
                        color: temple.primary_color,
                        borderColor: temple.primary_color + '30'
                      }}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {temple.deity}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs font-medium mb-2 text-muted-foreground">{t('temple.specialization')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {temple.specialization.map((spec, index) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className={`text-xs ${getSpecializationColor(spec)}`}
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {getLocalizedField(temple, 'cultural_context') && (
                    <div className="mt-3 p-2 bg-muted/30 dark:bg-slate-800/30 rounded text-xs">
                      <p className="text-muted-foreground leading-relaxed">
                        💡 {getLocalizedField(temple, 'cultural_context')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && temples.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">{t('temple.noTemplesAvailable')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}