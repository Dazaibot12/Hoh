'use client';

import { DazaiConverter } from '@/components/dazai-converter';
import type { TonPrice, PriceHistoryData } from '@/lib/definitions';
import { AppHeader } from './header';
import { NotesPage } from './notes-page';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Home, Notebook, Calculator, Repeat, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { ProfilePage } from './profile-page';
import { AdminPage } from './admin-page';
import Link from 'next/link';
import { HomePage } from './home-page';
import { UserProfileDetailsPage } from './user-profile-details-page';

type ActiveView = 'home' | 'converter' | 'notes' | 'profile' | 'admin' | 'user-profile-details';

type DazaiConverterClientProps = {
  initialPrice: TonPrice;
  initialPriceHistory: PriceHistoryData;
};

export function DazaiConverterClient({
  initialPrice,
  initialPriceHistory,
}: DazaiConverterClientProps) {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const { t } = useLanguage();
  
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validViews: ActiveView[] = ['home', 'converter', 'notes', 'profile', 'admin', 'user-profile-details'];
      if (validViews.includes(hash as ActiveView)) {
        setActiveView(hash as ActiveView);
      } else {
        setActiveView('home');
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (view: ActiveView) => {
    setActiveView(view);
    window.location.hash = view;
  };

  const TabButton = ({ view, icon: Icon, label }: { view: ActiveView, icon: React.ElementType, label: string }) => (
    <Button
        variant="ghost"
        className={cn("flex flex-col h-auto items-center justify-center gap-1 p-1 w-full", activeView === view ? "text-primary" : "text-muted-foreground")}
        onClick={() => navigate(view)}
    >
        <Icon className="h-6 w-6" />
        <span className='text-[10px] font-medium tracking-tight'>{label}</span>
    </Button>
  );


  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 pb-20">
        {activeView === 'home' && (
            <div className="container mx-auto flex h-full flex-1 flex-col p-4 md:p-6 lg:p-8">
              <HomePage />
            </div>
        )}
        {activeView === 'converter' && (
           <div className="container mx-auto flex w-full flex-1 flex-col items-center p-4 md:p-6 lg:p-8">
              <div className="w-full max-w-md space-y-6">
                 <DazaiConverter
                    initialPrice={initialPrice}
                    initialPriceHistory={initialPriceHistory}
                  />
              </div>
           </div>
        )}
        {activeView === 'notes' && (
            <div className="container mx-auto flex w-full flex-1 flex-col p-4 md:p-6 lg:p-8">
              <NotesPage />
            </div>
        )}
        {activeView === 'profile' && (
            <div className="container mx-auto flex w-full flex-1 flex-col p-4 md:p-6 lg:p-8">
              <ProfilePage setView={navigate} />
            </div>
        )}
        {activeView === 'admin' && (
            <div className="container mx-auto flex w-full flex-1 flex-col p-4 md:p-6 lg:p-8">
              <AdminPage />
            </div>
        )}
         {activeView === 'user-profile-details' && (
            <div className="container mx-auto flex w-full flex-1 flex-col p-4 md:p-6 lg:p-8">
              <UserProfileDetailsPage setView={navigate} />
            </div>
        )}
      </main>
      
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto grid h-16 max-w-md grid-cols-5 items-center justify-around">
            <TabButton view="home" icon={Home} label={t('home_tab_title') || "Home"} />
            <TabButton view="converter" icon={Repeat} label={t('converter_tab_title') || "Converter"} />
            
            <Link href="/calculator" passHref className='w-full'>
              <div className={cn("flex flex-col h-auto items-center justify-center gap-1 p-1 text-muted-foreground w-full")} >
                  <Calculator className="h-6 w-6" />
                  <span className='text-[10px] font-medium tracking-tight'>{t('calculator_tab_title') || "Calculator"}</span>
              </div>
            </Link>

            <TabButton view="notes" icon={Notebook} label={t('notes_tab_title') || "Notes"} />
            <TabButton view="profile" icon={User} label={t('profile_tab_title') || "Profile"} />
        </div>
      </div>
    </div>
  );
}
