'use client';

import { useEffect, useState } from 'react';
import { fetchTonPrice } from '@/app/actions';
import { useLanguage } from '@/hooks/use-language';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { ArrowRight, Bot, Info, Star } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import Link from 'next/link';
import { OrderMethodDialog } from './order-method-dialog';

export function ConvertRateDisplay() {
  const [rates, setRates] = useState<{ buy: number; sell: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t, lang } = useLanguage();
  const [isOrderMethodDialogOpen, setIsOrderMethodDialogOpen] = useState(false);


  useEffect(() => {
    async function getRates() {
      setIsLoading(true);
      try {
        const price = await fetchTonPrice();
        if (price.source !== 'Error') {
          // As per user request: sell is price + 1000, buy is price - 1000
          const sellRate = price.idr + 1000;
          const buyRate = price.idr - 1000;
          setRates({ buy: buyRate, sell: sellRate });
        }
      } catch (error) {
        console.error('Failed to fetch TON price for rate display:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getRates();
  }, []);

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', {
      maximumFractionDigits: 0,
    })}`;
  };

  const handleOrder = () => {
    setIsOrderMethodDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="px-4 pb-4 space-y-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!rates) {
    return (
       <div className="px-4 pb-4 text-center text-destructive">
          <p>Gagal memuat kurs saat ini. Silakan coba lagi nanti.</p>
       </div>
    );
  }

  return (
    <>
        <div className="px-4 pb-4 space-y-4">
            <div className='text-center space-y-1'>
                <p className="text-xs text-muted-foreground italic">
                    Kurs kami bergerak dalam senyap — tanpa celah untuk tawar-menawar.
                </p>
            </div>

            <div className='space-y-3 text-sm'>
                {/* TON to IDR */}
                <div className='space-y-1'>
                    <p className='font-semibold'>TON ⇆ IDR <span className='text-muted-foreground'>Rp</span></p>
                    <div className='bg-muted/50 p-2 rounded-lg'>
                        <p className='font-mono'>1 TON // {formatCurrency(rates.buy)}</p>
                    </div>
                </div>

                 {/* IDR to TON */}
                 <div className='space-y-1'>
                    <p className='font-semibold'><span className='text-muted-foreground'>Rp</span> IDR ⇆ TON</p>
                    <div className='bg-muted/50 p-2 rounded-lg'>
                        <p className='font-mono'>1 TON // {formatCurrency(rates.sell)}</p>
                    </div>
                </div>
            </div>
            
            <Alert className="mt-4 text-center border-none p-0">
                <AlertDescription className="text-xs flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Kirim Format ke <a href="https://t.me/kiosrBOT" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">@kiosrBOT</a></span>
                </AlertDescription>
                 <AlertDescription className="text-xs text-muted-foreground">
                    Data kurs diperbarui secara berkala — Harga berubah setiap waktu.
                </AlertDescription>
            </Alert>


            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleOrder}>
                Lakukan Konversi <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

        </div>
        <OrderMethodDialog
            isOpen={isOrderMethodDialogOpen}
            onOpenChange={setIsOrderMethodDialogOpen}
            service={{id: 'convert', name: 'Convert'}}
        />
    </>
  );
}
