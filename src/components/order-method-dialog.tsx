'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Copy, Send, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type Service = {
  id: string;
  name: string;
};

type OrderMethodDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  service: Service | null;
};

const BOT_USERNAME = 'kiosrbot';

const FormSection = ({ formText, onCopy, onChat }: { formText: string; onCopy: () => void; onChat: () => void }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-3 pt-2">
            <div className="space-y-2">
                <Textarea id="order-form" readOnly value={formText} rows={8} className="font-mono text-sm font-medium bg-input"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={onCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t('copy_button')}
                </Button>
                <Button onClick={onChat}>
                    <Send className="mr-2 h-4 w-4" />
                    {t('order_via_bot')}
                </Button>
            </div>
        </div>
    );
};


export function OrderMethodDialog({ isOpen, onOpenChange, service }: OrderMethodDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  if (!service) return null;

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('copy_success_title'),
      description: t('order_form_copied_desc'),
      className: 'bg-primary text-primary-foreground',
    });
  };

  const handleChatWithBot = () => {
    const botUrl = `https://t.me/${BOT_USERNAME}`;
    window.open(botUrl, '_blank');
  };

  const generalFormText = t('order_form_general', { serviceName: service.name });
  const tgLoginFormat = t('tg_premium_login_form');
  const tgGiftFormat = t('tg_premium_gift_form');
  const starsTopUpFormat = t('tg_stars_topup_form');
  const starsGiftFormat = t('tg_stars_gift_form');
  const convertIdrToTonFormat = t('convert_idr_to_ton_form');
  const convertTonToIdrFormat = t('convert_ton_to_idr_form');


  const renderContent = () => {
    if (service.id === 'telegram-premium') {
        return (
             <Tabs defaultValue="via-login" className="w-full pt-2">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="via-login">{t('via_login_title')}</TabsTrigger>
                    <TabsTrigger value="via-gift">{t('via_gift_title')}</TabsTrigger>
                </TabsList>
                <TabsContent value="via-login">
                    <FormSection 
                        formText={tgLoginFormat} 
                        onCopy={() => handleCopyToClipboard(tgLoginFormat)} 
                        onChat={handleChatWithBot}
                    />
                </TabsContent>
                <TabsContent value="via-gift">
                    <FormSection 
                        formText={tgGiftFormat} 
                        onCopy={() => handleCopyToClipboard(tgGiftFormat)} 
                        onChat={handleChatWithBot}
                    />
                </TabsContent>
            </Tabs>
        )
    }
    
    if (service.id === 'telegram-stars') {
         return (
             <Tabs defaultValue="via-topup" className="w-full pt-2">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="via-topup">{t('via_topup_title')}</TabsTrigger>
                    <TabsTrigger value="via-gift">{t('via_gift_title')}</TabsTrigger>
                </TabsList>
                <TabsContent value="via-topup">
                    <FormSection 
                        formText={starsTopUpFormat} 
                        onCopy={() => handleCopyToClipboard(starsTopUpFormat)} 
                        onChat={handleChatWithBot}
                    />
                </TabsContent>
                <TabsContent value="via-gift">
                    <FormSection 
                        formText={starsGiftFormat} 
                        onCopy={() => handleCopyToClipboard(starsGiftFormat)} 
                        onChat={handleChatWithBot}
                    />
                </TabsContent>
            </Tabs>
        )
    }

    if (service.id === 'convert') {
        return (
             <Tabs defaultValue="idr-to-ton" className="w-full pt-2">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="idr-to-ton">{t('convert_idr_to_ton_title')}</TabsTrigger>
                    <TabsTrigger value="ton-to-idr">{t('convert_ton_to_idr_title')}</TabsTrigger>
                </TabsList>
                <TabsContent value="idr-to-ton">
                    <FormSection 
                        formText={convertIdrToTonFormat} 
                        onCopy={() => handleCopyToClipboard(convertIdrToTonFormat)} 
                        onChat={handleChatWithBot}
                    />
                </TabsContent>
                <TabsContent value="ton-to-idr">
                    <FormSection 
                        formText={convertTonToIdrFormat} 
                        onCopy={() => handleCopyToClipboard(convertTonToIdrFormat)} 
                        onChat={handleChatWithBot}
                    />
                </TabsContent>
            </Tabs>
        )
    }

    return (
        <FormSection 
            formText={generalFormText}
            onCopy={() => handleCopyToClipboard(generalFormText)}
            onChat={handleChatWithBot}
        />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('purchase_title', { serviceName: service.name })}</DialogTitle>
          <DialogDescription>
            {t('order_method_desc')}
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
        
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {t('order_bot_info')}
          </AlertDescription>
        </Alert>

      </DialogContent>
    </Dialog>
  );
}
