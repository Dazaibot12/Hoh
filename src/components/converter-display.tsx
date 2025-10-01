'use client';

import { useMemo } from 'react';
import type { TonPrice, Settings } from '@/lib/definitions';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Repeat, Share2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

type ConverterDisplayProps = {
  tonAmount: string;
  idrAmount: string;
  activeInput: 'ton' | 'idr';
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tonPrice: TonPrice;
  settings: Settings;
  onReset: () => void;
  onSwap: () => void;
  onOpenRateCard: () => void;
  setTonAmount: (amount: string) => void;
  setIdrAmount: (amount: string) => void;
};

export function ConverterDisplay({
  tonAmount,
  idrAmount,
  activeInput,
  handleAmountChange,
  tonPrice,
  settings,
  onReset,
  onSwap,
  onOpenRateCard,
  setTonAmount,
  setIdrAmount,
}: ConverterDisplayProps) {
  const { toast } = useToast();
  const { t, lang } = useLanguage();

  const {
    sellResult,
    buyResult,
    sellLabel,
    buyLabel,
    formattedSellText,
    formattedBuyText,
    inputAmountNum,
    sellResultNum,
    buyResultNum,
  } = useMemo(() => {
    const amountStr = activeInput === 'ton' ? tonAmount : idrAmount;
    const inputAmount = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;

    const harga_dasar_per_ton = tonPrice.idr;
    const laba_per_ton_fixed =
      settings.profitMode === 'fixed'
        ? settings.profitValue
        : (settings.profitValue / 100) * harga_dasar_per_ton;

    const harga_jual_per_ton = harga_dasar_per_ton + laba_per_ton_fixed;
    const harga_beli_per_ton = harga_dasar_per_ton - laba_per_ton_fixed;
    const total_laba = inputAmount * laba_per_ton_fixed;

    let finalSellResult = 0;
    let finalBuyResult = 0;

    if (inputAmount > 0 && tonPrice.idr > 0) {
      if (activeInput === 'ton') {
        finalSellResult = inputAmount * harga_beli_per_ton;
        finalBuyResult = inputAmount * harga_jual_per_ton;
      } else {
        finalSellResult = harga_beli_per_ton > 0 ? inputAmount / harga_beli_per_ton : 0;
        finalBuyResult = harga_jual_per_ton > 0 ? inputAmount / harga_jual_per_ton : 0;
      }
    }

    const outputCurrency = activeInput === 'ton' ? 'idr' : 'ton';

    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    const formatNumber = (num: number, currency: 'idr' | 'ton') => {
      if (num === 0) return '0';
      if (currency === 'idr') {
        return num.toLocaleString(locale, { maximumFractionDigits: 0 });
      }
      return num.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      });
    };

    const templateVars = {
      input_amount_str: formatNumber(inputAmount, activeInput),
      input_currency: activeInput.toUpperCase(),
      output_currency: outputCurrency.toUpperCase(),
      harga_dasar_str: formatNumber(harga_dasar_per_ton, 'idr'),
      laba_str:
        settings.profitMode === 'percentage'
          ? `${settings.profitValue}%`
          : formatNumber(settings.profitValue, 'idr'),
      total_laba_str: formatNumber(total_laba, 'idr'),
      harga_jual_per_ton_str: formatNumber(harga_jual_per_ton, 'idr'),
      harga_beli_per_ton_str: formatNumber(harga_beli_per_ton, 'idr'),
      harga_jual_str: formatNumber(finalBuyResult, outputCurrency),
      harga_beli_str: formatNumber(finalSellResult, outputCurrency),
    };

    const applyTemplate = (template: string) =>
      template.replace(/{(\w+)}/g, (match, key) => {
        const varKey = key as keyof typeof templateVars;
        return templateVars[varKey] !== undefined
          ? String(templateVars[varKey])
          : match;
      });
      
    const WTS_LABEL = t('sell_label_ton_to_idr');
    const WTB_LABEL = t('buy_label_idr_to_ton');

    return {
      sellResult: formatNumber(finalSellResult, outputCurrency),
      buyResult: formatNumber(finalBuyResult, outputCurrency),
      sellLabel: activeInput === 'ton' ? WTS_LABEL : WTB_LABEL,
      buyLabel: activeInput === 'ton' ? WTB_LABEL : WTS_LABEL,
      formattedSellText: applyTemplate(settings.tonToIdrFormat),
      formattedBuyText: applyTemplate(settings.idrToTonFormat),
      inputAmountNum: inputAmount,
      sellResultNum: finalSellResult,
      buyResultNum: finalBuyResult,
    };
  }, [tonAmount, idrAmount, activeInput, tonPrice, settings, lang, t]);

  const handleCopy = (formatType: 'sell' | 'buy') => {
    const textToCopy =
      formatType === 'sell' ? formattedSellText : formattedBuyText;
    const resultValue = formatType === 'sell' ? sellResultNum : buyResultNum;

    if (!textToCopy || inputAmountNum === 0 || resultValue === 0) {
      toast({
        variant: 'destructive',
        title: t('copy_failed_title'),
        description: t('copy_failed_desc'),
      });
      return;
    }
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: t('copy_success_title'),
      className: 'bg-primary text-primary-foreground',
    });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      if (activeInput === 'ton') {
        setTonAmount('');
      } else {
        setIdrAmount('');
      }
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      if (activeInput === 'ton') {
        setTonAmount('0');
      } else {
        setIdrAmount('0');
      }
    }
  };

  const handleDoubleClick = () => {
    const amount = activeInput === 'ton' ? tonAmount : idrAmount;
    if (amount !== '0' && amount !== '') {
      onReset();
      toast({
        title: t('reset_success_title'),
        className: 'bg-primary text-primary-foreground',
      });
    } else {
      toast({
        variant: 'destructive',
        title: t('reset_failed_title'),
      });
    }
  };

  if (tonPrice.source === 'Error') {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('price_error_title')}</AlertTitle>
          <AlertDescription>
            {tonPrice.error || t('price_error_desc')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const idrValue = parseInt(idrAmount.replace(/[^0-9]/g, ''), 10);
  const displayAmount =
    activeInput === 'ton'
      ? tonAmount
      : isNaN(idrValue)
      ? ''
      : idrValue.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US');

  const profitSettingString =
    settings.profitMode === 'percentage'
      ? `${settings.profitValue}%`
      : `Rp ${settings.profitValue.toLocaleString(
          lang === 'id' ? 'id-ID' : 'en-US'
        )}`;

  const getInputFontSize = (text: string) => {
    const length = text.length;
    if (length > 18) return 'text-3xl';
    if (length > 12) return 'text-4xl';
    return 'text-5xl';
  };

  const getResultFontSize = (text: string) => {
    const length = text.length;
    if (length > 18) return 'text-lg';
    if (length > 12) return 'text-xl';
    return 'text-2xl';
  };

  const outputUnit = activeInput === 'ton' ? 'Rp' : 'TON';

  return (
    <Card className='shadow-sm'>
        <CardContent className="space-y-4 text-center p-4">
            <div className="relative">
                <Input
                id="amount-input"
                value={displayAmount}
                onChange={handleAmountChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onDoubleClick={handleDoubleClick}
                placeholder="0"
                className={cn(
                    'font-bold h-24 text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0',
                    getInputFontSize(displayAmount)
                )}
                type="text"
                inputMode="decimal"
                />
                <div className="absolute top-1/2 -translate-y-1/2 right-0 text-lg font-bold text-muted-foreground">
                {activeInput.toUpperCase()}
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                {t('profit_label', { profitSettingString })}
            </p>


            <div className="grid grid-cols-2 gap-4">
                <Card
                className="rounded-lg overflow-hidden cursor-pointer transition-transform transition-colors active:scale-[0.98] active:bg-primary/5 hover:shadow-md"
                onClick={() => handleCopy('sell')}
                >
                <CardContent className="p-4">
                    <p className="text-sm font-medium text-red-500">{sellLabel}</p>
                    <div
                    className={cn(
                        'flex items-baseline justify-center gap-2 text-red-700 dark:text-red-400',
                        getResultFontSize(sellResult)
                    )}
                    >
                    <p className={cn('font-bold truncate')}>
                        {sellResult}
                    </p>
                    <span className='text-sm text-muted-foreground font-medium'>{outputUnit}</span>
                    </div>
                </CardContent>
                </Card>
                <Card
                className="rounded-lg overflow-hidden cursor-pointer transition-transform transition-colors active:scale-[0.98] active:bg-primary/5 hover:shadow-md"
                onClick={() => handleCopy('buy')}
                >
                <CardContent className="p-4">
                    <p className="text-sm font-medium text-green-500">{buyLabel}</p>
                    <div
                    className={cn(
                        'flex items-baseline justify-center gap-2 text-green-600 dark:text-green-400',
                        getResultFontSize(buyResult)
                    )}
                    >
                    <p className={cn('font-bold truncate')}>
                        {buyResult}
                    </p>
                    <span className='text-sm text-muted-foreground font-medium'>{outputUnit}</span>
                    </div>
                </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                size="lg"
                variant="secondary"
                className="h-12 rounded-lg"
                onClick={onSwap}
                >
                <Repeat className="mr-2 h-4 w-4" />
                {t('swap_button')}
                </Button>
                <Button
                size="lg"
                variant="secondary"
                className="h-12 rounded-lg"
                onClick={onOpenRateCard}
                >
                <Share2 className="mr-2 h-4 w-4" />
                {t('rate_card_button_title')}
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
