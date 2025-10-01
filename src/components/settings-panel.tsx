'use client';

import type { Settings } from '@/lib/definitions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertCircle, ArrowLeft, HelpCircle, Sparkles, RotateCcw, Languages, Calculator, PenSquare, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import * as React from 'react';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { getAiRecommendation } from '@/app/actions';
import { useLanguage } from '@/hooks/use-language';
import { DEFAULT_IDR_TO_TON_FORMAT, DEFAULT_TON_TO_IDR_FORMAT } from '@/lib/constants';
import { Switch } from './ui/switch';

type SettingsPanelProps = {
  settings: Settings;
  setSettings: (settings: Settings | ((prev: Settings) => Settings)) => void;
};

type Panel = 'main' | 'profit' | 'format';

const placeholders = [
    { name: '{input_amount_str}', descKey: 'placeholder_input_amount_str' },
    { name: '{input_currency}', descKey: 'placeholder_input_currency' },
    { name: '{output_currency}', descKey: 'placeholder_output_currency' },
    { name: '{harga_dasar_str}', descKey: 'placeholder_harga_dasar_str' },
    { name: '{laba_str}', descKey: 'placeholder_laba_str' },
    { name: '{total_laba_str}', descKey: 'placeholder_total_laba_str' },
    { name: '{harga_jual_per_ton_str}', descKey: 'placeholder_harga_jual_per_ton_str' },
    { name: '{harga_beli_per_ton_str}', descKey: 'placeholder_harga_beli_per_ton_str' },
    { name: '{harga_jual_str}', descKey: 'placeholder_harga_jual_str' },
    { name: '{harga_beli_str}', descKey: 'placeholder_harga_beli_str' },
];

function AiRecommendationDialog({ onSelect, children }: { onSelect: (template: string) => void, children: React.ReactNode }) {
    const { t, lang } = useLanguage();
    const [isOpen, setIsOpen] = React.useState(false);
    const [description, setDescription] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!description) {
            toast({
                variant: 'destructive',
                title: t('ai_error_empty_title'),
                description: t('ai_error_empty_desc'),
            });
            return;
        }
        setIsLoading(true);
        try {
            const template = await getAiRecommendation(description, lang);
            if (template.startsWith('Sorry') || template.startsWith('Maaf')) {
                throw new Error(template);
            }
            onSelect(template);
            toast({
                title: t('ai_success_title'),
                className: 'bg-primary text-primary-foreground',
            });
            setIsOpen(false);
            setDescription('');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('ai_error_generic_title'),
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('ai_title')}</DialogTitle>
                    <DialogDescription>
                        {t('ai_desc')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Textarea
                        placeholder={t('ai_placeholder')}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? t('ai_loading_button') : t('ai_generate_button')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MainPanel({ setPanel }: { setPanel: (panel: Panel) => void }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
        <div className="bg-card rounded-lg divide-y">
             <button className="w-full text-left p-3 flex items-center gap-4" onClick={() => setPanel('profit')}>
                <Calculator className="h-5 w-5 text-muted-foreground" />
                <span className="flex-grow font-medium">{t('settings_profit_button')}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="w-full text-left p-3 flex items-center gap-4" onClick={() => setPanel('format')}>
                <PenSquare className="h-5 w-5 text-muted-foreground" />
                <span className="flex-grow font-medium">{t('settings_format_button')}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
        </div>
    </div>
  );
}

function ProfitPanel({ settings, setSettings }: SettingsPanelProps) {
  const { t } = useLanguage();
  const isProfitHigh =
    settings.profitMode === 'percentage' && settings.profitValue > 50;

   const handleProfitValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSettings((prev) => ({ ...prev, profitValue: isNaN(value) ? 0 : value }));
  };

  return (
    <div className="space-y-6">
        <div className='p-3 rounded-lg bg-card space-y-4'>
            <div className='flex justify-between items-center'>
                <Label htmlFor='profit-mode-toggle' className='font-medium'>
                    {settings.profitMode === 'percentage' ? t('profit_mode_percent') : t('profit_mode_fixed')}
                </Label>
                <Switch 
                    id='profit-mode-toggle'
                    checked={settings.profitMode === 'percentage'}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, profitMode: checked ? 'percentage' : 'fixed' }))}
                />
            </div>
        </div>

      <div className='p-3 rounded-lg bg-card space-y-4'>
        <Label htmlFor="profit-value" className='font-medium'>{t('profit_value_label')}</Label>
        <Input
          id="profit-value"
          type="number"
          value={settings.profitValue}
          onChange={handleProfitValueChange}
          placeholder={settings.profitMode === 'percentage' ? t('profit_placeholder_percent') : t('profit_placeholder_fixed')}
          className="bg-input border-0 text-right"
        />
      </div>
      {isProfitHigh && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('profit_warning_title')}</AlertTitle>
          <AlertDescription>
            {t('profit_warning_desc')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function FormatPanel({ settings, setSettings }: SettingsPanelProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const handlePlaceholderCopy = (placeholder: string) => {
        navigator.clipboard.writeText(placeholder);
        toast({
        title: t('placeholder_copied_title'),
        description: t('placeholder_copied_desc', { placeholder }),
        className: 'bg-primary text-primary-foreground'
        });
    };
    
    const handleResetFormat = (type: 'tonToIdr' | 'idrToTon') => {
        if (type === 'tonToIdr') {
            setSettings((prev) => ({ ...prev, tonToIdrFormat: DEFAULT_TON_TO_IDR_FORMAT }));
        } else {
            setSettings((prev) => ({ ...prev, idrToTonFormat: DEFAULT_IDR_TO_TON_FORMAT }));
        }
        toast({
            title: t('format_reset_toast_title'),
            className: 'bg-primary text-primary-foreground'
        });
    }

  return (
    <div className="space-y-4">
      <div className='p-3 rounded-lg bg-card space-y-2'>
        <div className="flex justify-between items-center mb-1">
            <Label htmlFor="ton-to-idr-format" className='font-medium'>{t('format_ton_to_idr_label')}</Label>
            <div className='flex items-center gap-2'>
                <AiRecommendationDialog onSelect={(template) => setSettings((prev) => ({ ...prev, tonToIdrFormat: template }))}>
                     <Button variant="ghost" size="sm" className="text-xs text-primary h-auto py-0 px-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t('ai_recommendation_button')}
                    </Button>
                </AiRecommendationDialog>
                <Button variant="ghost" size="icon" className="text-xs text-muted-foreground h-5 w-5" onClick={() => handleResetFormat('tonToIdr')}>
                    <RotateCcw className="h-3 w-3" />
                </Button>
            </div>
        </div>
        <Textarea
          id="ton-to-idr-format"
          value={settings.tonToIdrFormat}
          onChange={(e) => setSettings((prev) => ({ ...prev, tonToIdrFormat: e.target.value }))}
          rows={4}
          className="font-mono text-xs bg-input border-0"
        />
      </div>
      <div className='p-3 rounded-lg bg-card space-y-2'>
         <div className="flex justify-between items-center mb-1">
            <Label htmlFor="idr-to-ton-format" className='font-medium'>{t('format_idr_to_ton_label')}</Label>
            <div className='flex items-center gap-2'>
                <AiRecommendationDialog onSelect={(template) => setSettings((prev) => ({...prev, idrToTonFormat: template}))}>
                     <Button variant="ghost" size="sm" className="text-xs text-primary h-auto py-0 px-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t('ai_recommendation_button')}
                    </Button>
                </AiRecommendationDialog>
                 <Button variant="ghost" size="icon" className="text-xs text-muted-foreground h-5 w-5" onClick={() => handleResetFormat('idrToTon')}>
                    <RotateCcw className="h-3 w-3" />
                </Button>
            </div>
        </div>
        <Textarea
          id="idr-to-ton-format"
          value={settings.idrToTonFormat}
          onChange={(e) => setSettings((prev) => ({ ...prev, idrToTonFormat: e.target.value }))}
          rows={4}
          className="font-mono text-xs bg-input border-0"
        />
      </div>

       <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
            <div className="space-y-2">
                <p className="text-sm text-foreground/80">
                {t('placeholder_help_text')}
                </p>
                <div className="flex flex-wrap gap-1">
                {placeholders.map((p) => (
                    <TooltipProvider key={p.name}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge
                                variant="outline"
                                className="font-mono text-primary border-primary/50 cursor-pointer hover:bg-primary/10"
                                onClick={() => handlePlaceholderCopy(p.name)}
                                title={t('copy_placeholder_title', { placeholder: p.name })}
                                >
                                {p.name}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                               <p>{t(p.descKey as any)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
                </div>
            </div>
          </div>
           
        </CardContent>
      </Card>
    </div>
  );
}


export function SettingsPanel({ settings, setSettings }: SettingsPanelProps) {
  const [panel, setPanel] = React.useState<Panel>('main');
  const { t } = useLanguage();

  const panelTitles: Record<Panel, string> = {
    main: t('settings_title'),
    profit: t('settings_profit_title'),
    format: t('settings_format_title'),
  };

  const renderPanel = () => {
    switch (panel) {
      case 'profit':
        return <ProfitPanel settings={settings} setSettings={setSettings} />;
      case 'format':
        return <FormatPanel settings={settings} setSettings={setSettings} />;
      default:
        return <MainPanel setPanel={setPanel} />;
    }
  };

  return (
    <div className="p-1 space-y-4">
      <div className="flex items-center relative justify-center h-8 mb-4">
          {panel !== 'main' && (
            <Button variant="ghost" onClick={() => setPanel('main')} className="absolute left-0 top-1/2 -translate-y-1/2 text-primary">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('settings_title')}
            </Button>
          )}
          <h3 className="text-lg font-medium text-center">{panelTitles[panel]}</h3>
      </div>

      <ScrollArea className="h-[400px] px-2">
        {renderPanel()}
      </ScrollArea>

    </div>
  );
}
