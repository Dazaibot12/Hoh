'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { TonPrice, PriceHistoryData, Settings, Note } from '@/lib/definitions';
import { useSettings } from '@/hooks/use-settings';
import { ConverterDisplay } from '@/components/converter-display';
import { Skeleton } from './ui/skeleton';
import { PriceChart, type TimeRange } from './price-chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Download, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchTonPrice, fetchTonPriceHistory, fetchTonPriceHistoryHourly } from '@/app/actions';
import { useLanguage } from '@/hooks/use-language';
import { RateCard } from './rate-card';
import * as htmlToImage from 'html-to-image';
import { useNotes } from '@/hooks/use-notes';
import { NoteForm } from './notes-page';
import { SettingsPanel } from './settings-panel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';


type DazaiConverterProps = {
  initialPrice: TonPrice;
  initialPriceHistory: PriceHistoryData;
};

export function DazaiConverter({
  initialPrice,
  initialPriceHistory,
}: DazaiConverterProps) {
  const { settings, isLoaded: settingsLoaded, setSettings } = useSettings();
  const { isLoaded: notesLoaded } = useNotes();
  const { t, lang } = useLanguage();
  
  const [tonPrice, setTonPrice] = useState<TonPrice>(initialPrice);
  const [chartData, setChartData] = useState<PriceHistoryData['points']>(initialPriceHistory.points);
  const [chartChange, setChartChange] = useState<number>(initialPriceHistory.changePercent);
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>('24h');
  const [isRateCardOpen, setIsRateCardOpen] = useState(false);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const rateCardRef = useRef<HTMLDivElement>(null);
  const prevPriceRef = useRef<number>(initialPrice.idr);
  
  const liveUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  const [tonAmount, setTonAmount] = useState('');
  const [idrAmount, setIdrAmount] = useState('');
  const [activeInput, setActiveInput] = useState<'ton' | 'idr'>('ton');
  const { toast } = useToast();

  const stopLiveUpdates = useCallback(() => {
    if (liveUpdateInterval.current) {
      clearInterval(liveUpdateInterval.current);
      liveUpdateInterval.current = null;
    }
  }, []);

  const startLiveUpdates = useCallback(async () => {
    stopLiveUpdates();
    
    const initialData = await fetchTonPriceHistoryHourly(lang);
    setChartData(initialData.points);
    setChartChange(initialData.changePercent);

    const updatePrice = async () => {
      const newPrice = await fetchTonPrice();
      if(newPrice.source !== 'Error') {
        setTonPrice(newPrice);
        
        if (newPrice.idr !== prevPriceRef.current) {
            prevPriceRef.current = newPrice.idr;
            const now = new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' });
            
            setChartData(prevData => {
                const newData = [...prevData, {
                    time: now,
                    price: newPrice.idr,
                }];
                return newData.slice(-60); 
            });
        }
      }
    };
    updatePrice(); 

    liveUpdateInterval.current = setInterval(updatePrice, 5000); 
  }, [stopLiveUpdates, lang]);

  const handleTimeRangeChange = useCallback(async (range: TimeRange) => {
    setCurrentTimeRange(range);
    stopLiveUpdates();
    setChartData([]);
    setChartChange(0);

    let newData: PriceHistoryData = { points: [], changePercent: 0 };
    if (range === 'live') {
      startLiveUpdates();
      return;
    } else if (range === '1h') {
      newData = await fetchTonPriceHistoryHourly(lang);
    } else {
      let days: number = 1;
      if (range === '7d') days = 7;
      if (range === '1m') days = 30;
      if (range === '1y') days = 365;

      newData = await fetchTonPriceHistory(days, lang);
    }
    setChartData(newData.points);
    setChartChange(newData.changePercent);
  }, [startLiveUpdates, stopLiveUpdates, lang]);
  
  useEffect(() => {
    handleTimeRangeChange(currentTimeRange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    return () => stopLiveUpdates();
  }, [stopLiveUpdates]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (activeInput === 'ton') {
      // Allow only numbers and a single dot for TON
      if (rawValue === "" || /^[0-9]*\.?[0-9]*$/.test(rawValue)) {
        setTonAmount(rawValue);
      }
    } else { // activeInput === 'idr'
      // For IDR, format with separators but store raw value for calculation
      const numericValue = rawValue.replace(/[^0-9]/g, '');
      if (numericValue === "") {
        setIdrAmount("");
        return;
      }
      const parsed = parseInt(numericValue, 10);
      if (!isNaN(parsed)) {
          setIdrAmount(parsed.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US'));
      } else {
          setIdrAmount("");
      }
    }
  };

  useEffect(() => {
    if (!settingsLoaded || !tonPrice.idr) return;

    const value = activeInput === 'ton' ? tonAmount : idrAmount.replace(/[^0-9]/g, '');

    if (value === '' || (activeInput === 'ton' && value.endsWith('.'))) {
        if(activeInput === 'ton') setIdrAmount('');
        else setTonAmount('');
        return;
    }

    const inputAmount = parseFloat(value) || 0;
    if (inputAmount === 0) {
        if(activeInput === 'ton') setIdrAmount('0');
        else setTonAmount('0');
        return;
    };

    const harga_dasar_per_ton = tonPrice.idr;
    const laba_per_ton_fixed =
      settings.profitMode === 'fixed'
        ? settings.profitValue
        : (settings.profitValue / 100) * harga_dasar_per_ton;

    if (activeInput === 'ton') {
      const harga_beli_per_ton = harga_dasar_per_ton - laba_per_ton_fixed;
      const newIdrAmount = inputAmount * harga_beli_per_ton;
      setIdrAmount(newIdrAmount.toLocaleString('en-US', { maximumFractionDigits: 0, useGrouping: false }));
    } else {
      const harga_jual_per_ton = harga_dasar_per_ton + laba_per_ton_fixed;
      const newTonAmount = harga_jual_per_ton > 0 ? inputAmount / harga_jual_per_ton : 0;
      setTonAmount(newTonAmount.toFixed(8).replace(/\.?0+$/, "") || "0");
    }
  }, [tonAmount, idrAmount, activeInput, tonPrice.idr, settings.profitMode, settings.profitValue, settingsLoaded, lang]);


  const handleReset = () => {
    setTonAmount('');
    setIdrAmount('');
  };

  const handleSwap = () => {
    setActiveInput(prev => (prev === 'ton' ? 'idr' : 'ton'));
    setTonAmount('');
    setIdrAmount('');
  };

  const handleOpenRateCard = () => {
    setIsRateCardOpen(true);
  };
  
  const handleDownloadRateCard = useCallback(async () => {
    if (rateCardRef.current === null) {
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(rateCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        skipFonts: true
      });
      const link = document.createElement('a');
      link.download = `rate-card-kios-dazai-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      toast({
        title: t('rate_card_download_success'),
        className: 'bg-primary text-primary-foreground',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('rate_card_download_error_title'),
        description: t('rate_card_download_error_desc')
      });
      console.error('oops, something went wrong!', err);
    }
  }, [t, toast]);


  if (!settingsLoaded || !notesLoaded) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <>
      <ConverterDisplay
        tonAmount={tonAmount}
        idrAmount={idrAmount}
        activeInput={activeInput}
        handleAmountChange={handleAmountChange}
        tonPrice={tonPrice}
        settings={settings}
        onReset={handleReset}
        onSwap={handleSwap}
        onOpenRateCard={handleOpenRateCard}
        setTonAmount={setTonAmount}
        setIdrAmount={setIdrAmount}
      />
      
      <div className="my-4">
        <Accordion type="single" collapsible className="w-full bg-card rounded-lg border">
          <AccordionItem value="settings">
            <AccordionTrigger className="p-3 font-medium hover:no-underline text-sm">
                <div className='flex items-center gap-2'>
                    <SettingsIcon className="h-4 w-4" />
                    <span className="flex-grow text-left">{t('settings_title')}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="p-1">
                 <SettingsPanel settings={settings} setSettings={setSettings} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <PriceChart
        data={chartData}
        onTimeRangeChange={handleTimeRangeChange}
        activeTimeRange={currentTimeRange}
        currentPrice={tonPrice}
        changePercent={chartChange}
      />

      <Dialog open={isRateCardOpen} onOpenChange={setIsRateCardOpen}>
        <DialogContent className="max-w-sm p-0 border-0">
          <DialogHeader>
            <DialogTitle className='sr-only'>{t('rate_card_title')}</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <RateCard ref={rateCardRef} price={tonPrice} settings={settings} />
          </div>
          <div className="grid grid-cols-1 gap-2 p-4 pt-0">
            <Button
              variant="outline"
              onClick={handleDownloadRateCard}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('rate_card_download_button')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <NoteForm
        isOpen={isNoteFormOpen}
        onOpenChange={setIsNoteFormOpen}
        noteToEdit={null}
      />
    </>
  );
}
