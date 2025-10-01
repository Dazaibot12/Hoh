import { fetchTonPrice, fetchTonPriceHistory } from './actions';
import { DazaiConverterClient } from '@/components/dazai-converter-client';
import { LanguageProvider } from '@/hooks/use-language';

export default async function ConverterPage() {
  const initialPrice = await fetchTonPrice();
  // TODO: Make language dynamic based on user settings or headers
  const initialPriceHistory = await fetchTonPriceHistory(1, 'en');

  return (
    <LanguageProvider>
      <DazaiConverterClient
        initialPrice={initialPrice}
        initialPriceHistory={initialPriceHistory}
      />
    </LanguageProvider>
  );
}
