'use server';

import { RateCard } from '@/components/rate-card';
import { fetchTonPrice } from '@/app/actions';
import { useSettings } from '@/hooks/use-settings-server';
import { LanguageProvider } from '@/hooks/use-language';

// This is a server-only hook to get settings
function useSettingsServer() {
  // For this page, we just need default settings.
  // The API for the card takes GET params if customization is needed.
  // This is a placeholder for a more robust server-side settings implementation if needed.
  const defaultSettings = {
    profitMode: 'percentage',
    profitValue: 2.5,
    idrToTonFormat: '',
    tonToIdrFormat: '',
  };
  return { settings: defaultSettings };
}

export default async function RateCardPage() {
  // Fetch data on the server
  const price = await fetchTonPrice();
  
  // This is a simplified, server-side way to get settings.
  // In a real app, this might fetch user-specific settings from a DB.
  // For the public rate card, we'll use defaults.
  const settings = {
    profitMode: 'percentage',
    profitValue: 2.5,
    idrToTonFormat: '',
    tonToIdrFormat: '',
  };

  // If fetching price fails, we should show an error.
  if (price.source === 'Error') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="rounded-lg border border-destructive p-4 text-center">
          <h1 className="text-lg font-bold text-destructive">Error</h1>
          <p className="text-destructive/80">Could not load price data.</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <main className="flex h-screen w-screen items-center justify-center bg-transparent p-4">
        <RateCard price={price} settings={settings} />
      </main>
    </LanguageProvider>
  );
}
