'use client';
import * as React from 'react';
import { TonPrice, Settings } from '@/lib/definitions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface RateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  price: TonPrice;
  settings: Settings;
}

export const RateCard = React.forwardRef<HTMLDivElement, RateCardProps>(
  ({ price, settings, className, ...props }, ref) => {
    const { lang, t } = useLanguage();
    const locale = lang === 'id' ? 'id-ID' : 'en-US';

    const { harga_jual_per_ton, harga_beli_per_ton } = React.useMemo(() => {
      if (!price) return { harga_jual_per_ton: 0, harga_beli_per_ton: 0 };
      const harga_dasar_per_ton = price.idr;
      const laba_per_ton_fixed =
        settings.profitMode === 'fixed'
          ? settings.profitValue
          : (settings.profitValue / 100) * harga_dasar_per_ton;

      return {
        harga_jual_per_ton: harga_dasar_per_ton + laba_per_ton_fixed,
        harga_beli_per_ton: harga_dasar_per_ton - laba_per_ton_fixed,
      };
    }, [price, settings]);

    const formatCurrency = (value: number) => {
      return `Rp ${value.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
    };
    
    const [now, setNow] = React.useState(new Date());

    React.useEffect(() => {
      // Update time only on client side to avoid hydration mismatch
      const timer = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div ref={ref} className={cn("bg-card p-0", className)} {...props}>
        <Card className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-primary/20 bg-card">
          <CardHeader className="p-4 space-y-2">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-base font-bold text-foreground leading-none">
                        KIOS DAZAI
                        </h1>
                        <p className="text-xs text-muted-foreground">Ton Converter</p>
                    </div>
                </div>
                 <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground">{now.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jakarta' })}</p>
                    <p className="text-xs font-mono text-muted-foreground">{now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}</p>
                </div>
            </div>
            <div className='text-center text-sm font-semibold text-primary pt-2'>
                <p>{t('rate_card_title')}</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
             <div className="p-3 rounded-lg bg-green-500/10 text-green-800 dark:text-green-300 dark:bg-green-500/20">
                <div className="flex items-center gap-2 text-xs font-medium mb-1">
                    <span>{t('rate_card_sell_price')}</span>
                </div>
                <p className="text-2xl font-bold">
                    {formatCurrency(harga_jual_per_ton)}
                </p>
             </div>
             <div className="p-3 rounded-lg bg-red-500/10 text-red-800 dark:text-red-300 dark:bg-red-500/20">
                <div className="flex items-center gap-2 text-xs font-medium mb-1">
                    <span>{t('rate_card_buy_price')}</span>
                </div>
                <p className="text-2xl font-bold">
                    {formatCurrency(harga_beli_per_ton)}
                </p>
             </div>
             <p className='text-center text-xs text-muted-foreground pt-2'>
                Powered by @pdazai
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
);
RateCard.displayName = 'RateCard';
