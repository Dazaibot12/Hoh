'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from './ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Gift, Star, Repeat, AtSign, Bot, ChevronRight } from 'lucide-react';
import { OrderMethodDialog } from './order-method-dialog';
import { cn } from '@/lib/utils';
import { ConvertRateDisplay } from './convert-rate-display';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


type Service = {
  id: string;
  name: string;
  icon: React.ElementType;
  iconClassName: string;
  category: 'service' | 'gift';
};

const PriceListItem = ({ duration, price }: { duration: string, price: string }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{duration}</span>
        <span className="font-mono font-semibold">{price}</span>
    </div>
);

function TelegramPremiumContent({ onBuy }: { onBuy: () => void }) {
    const { t } = useLanguage();
    return (
        <div className="px-4 pb-4 space-y-6">
            <div className='text-center text-xs text-muted-foreground italic'>
                <p>Harga sudah terkunci – negosiasi adalah tanda kelemahan.</p>
            </div>
            <div className="space-y-4">
                {/* VIA GIFT */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-primary">VIA GIFT</h3>
                    <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                        <PriceListItem duration="3 BULAN" price="Rp 210.000" />
                        <PriceListItem duration="6 BULAN" price="Rp 275.000" />
                        <PriceListItem duration="1 TAHUN" price="Rp 495.000" />
                    </div>
                </div>

                {/* VIA LOGIN */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-primary">VIA LOGIN</h3>
                     <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                        <PriceListItem duration="1 BULAN" price="Rp 58.000" />
                        <PriceListItem duration="1 TAHUN" price="Rp 375.000" />
                    </div>
                </div>

                {/* NOTES */}
                <div className="space-y-2 text-xs text-muted-foreground">
                    <h3 className="font-semibold text-foreground">★ NOTES</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Kirim format ke @kiosrBOT</li>
                        <li>Kami hanya menjual telegram full warranty</li>
                        <li>Untuk harga reseller bisa kontak @pDazai</li>
                        <li>Harga menyesuaikan dengan @KESEPAKATANTGPREMIUM</li>
                    </ul>
                </div>
            </div>
             <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={onBuy}>
                {t('buy_button')}
            </Button>
        </div>
    );
}

function TelegramStarsContent({ onBuy }: { onBuy: () => void }) {
    const { t } = useLanguage();
    return (
        <div className="px-4 pb-4 space-y-6">
            <div className='text-center text-xs text-muted-foreground italic'>
                <p>Harga sudah terkunci – negosiasi adalah tanda kelemahan.</p>
            </div>
            <div className="space-y-4">
                {/* VIA GIFT */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-primary">VIA GIFT</h3>
                    <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                        <PriceListItem duration="15s" price="Rp 4.500" />
                        <PriceListItem duration="25s" price="Rp 7.500" />
                        <PriceListItem duration="50s" price="Rp 15.000" />
                        <PriceListItem duration="75s" price="Rp 23.000" />
                        <PriceListItem duration="100s" price="Rp 30.000" />
                    </div>
                </div>

                {/* VIA TOP-UP */}
                <div className="space-y-2">
                    <h3 className="font-semibold text-primary">VIA TOP-UP</h3>
                     <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                        <PriceListItem duration="50s" price="Rp 15.000" />
                        <PriceListItem duration="75s" price="Rp 23.000" />
                        <PriceListItem duration="100s" price="Rp 30.000" />
                        <PriceListItem duration="150s" price="Rp 45.000" />
                        <PriceListItem duration="250s" price="Rp 70.000" />
                        <PriceListItem duration="350s" price="Rp 95.000" />
                        <PriceListItem duration="500s" price="Rp 135.000" />
                        <PriceListItem duration="750s" price="Rp 202.000" />
                        <PriceListItem duration="1.000s" price="Rp 270.000" />
                    </div>
                </div>

                {/* NOTES */}
                <div className="space-y-2 text-xs text-muted-foreground">
                    <h3 className="font-semibold text-foreground">★ NOTES</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Kirim format ke @kiosrBOT</li>
                        <li>Untuk jumlah custom, ajukan ke admin</li>
                        <li>Harga menyesuaikan dengan @fixpricestars</li>
                        <li>Minimal top-up: 50 stars</li>
                    </ul>
                </div>
            </div>
             <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={onBuy}>
                {t('buy_button')}
            </Button>
        </div>
    );
}

export function HomePage() {
  const { t } = useLanguage();
  const [isOrderMethodDialogOpen, setIsOrderMethodDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleBuyClick = (service: Service) => {
    setSelectedService(service);
    setIsOrderMethodDialogOpen(true);
  };

  const renderComingSoon = (service: Service) => (
    <div className="px-4 pb-4 space-y-4">
      <div className="space-y-2 text-sm text-center text-muted-foreground">
        <p>{t('under_development_title')}</p>
        <p className="text-xs">{t('coming_soon_desc')}</p>
      </div>
      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleBuyClick(service)}>
        {t('buy_button')}
      </Button>
    </div>
  );


  const allServices: Service[] = [
    {
      id: 'telegram-premium',
      name: t('telegram_premium_title'),
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-blue-500"
        >
          <path d="m22 2-7 20-4-9-9-4Z"></path>
          <path d="m22 2-11 11"></path>
        </svg>
      ),
      iconClassName: 'text-blue-500',
      category: 'service',
    },
    {
      id: 'telegram-stars',
      name: 'Telegram Stars',
      icon: Star,
      iconClassName: 'text-yellow-500',
      category: 'service',
    },
    {
      id: 'convert',
      name: 'CONVERT TON ⇆ IDR',
      icon: Repeat,
      iconClassName: 'text-green-500',
      category: 'service',
    },
    {
      id: 'nft-username',
      name: 'NFT Username',
      icon: AtSign,
      iconClassName: 'text-purple-500',
      category: 'service',
    },
    {
      id: 'robux',
      name: 'Robux',
      icon: () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24"
            fill="currentColor"
            className="h-6 w-6 text-yellow-600"
        >
            <path d="M12 2.5L5.5 6v12l6.5 3.5l6.5-3.5V6L12 2.5zM11 11H8v2h3v3h2v-3h3v-2h-3V8h-2v3z"/>
        </svg>
      ),
      iconClassName: 'text-yellow-600',
      category: 'service',
    },
     {
      id: 'gift-upgrade',
      name: 'Gift Upgrade (NFT)',
      icon: Gift,
      iconClassName: 'text-pink-500',
      category: 'gift',
    },
    {
      id: 'userbot',
      name: 'Userbot',
      icon: Bot,
      iconClassName: 'text-red-500',
      category: 'service',
    },
  ];

  const renderServiceAccordion = (service: Service) => (
    <Accordion
      key={service.id}
      type="single"
      collapsible
      className="w-full bg-card rounded-lg border"
    >
      <AccordionItem value={service.id} className="border-b-0">
        <AccordionTrigger className="p-3 font-medium hover:no-underline [&[data-state=open]>svg.lucide-chevron-right]:rotate-90">
            <div className="flex items-center gap-4 flex-1">
                <service.icon className={cn('h-6 w-6', service.iconClassName)} />
                <span className="flex-grow text-left">{service.name}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
        </AccordionTrigger>
        <AccordionContent>
          {service.id === 'telegram-premium' ? (
              <TelegramPremiumContent onBuy={() => handleBuyClick(service)} />
          ) : service.id === 'telegram-stars' ? (
              <TelegramStarsContent onBuy={() => handleBuyClick(service)} />
          ) : service.id === 'convert' ? (
              <ConvertRateDisplay />
          ) : (
            renderComingSoon(service)
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <>
      <div className="w-full max-w-md mx-auto space-y-4">
        <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services">Layanan</TabsTrigger>
                <TabsTrigger value="gifts">Gifts</TabsTrigger>
            </TabsList>
            <TabsContent value="services" className="space-y-2 mt-4">
                {allServices.filter(s => s.category === 'service').map(renderServiceAccordion)}
            </TabsContent>
            <TabsContent value="gifts" className="space-y-2 mt-4">
                {allServices.filter(s => s.category === 'gift').map(renderServiceAccordion)}
            </TabsContent>
        </Tabs>
      </div>
      
      <OrderMethodDialog
        isOpen={isOrderMethodDialogOpen}
        onOpenChange={setIsOrderMethodDialogOpen}
        service={selectedService}
      />
    </>
  );
}
