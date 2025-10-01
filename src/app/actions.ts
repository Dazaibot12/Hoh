'use server';

// Perbaikan 1: Impor ChartPoint secara eksplisit
import type { TonPrice, PriceHistoryData, ChartPoint } from '@/lib/definitions'; 
import { conversionFormatRecommendation } from '@/ai/flows/conversion-format-recommendation';
import type { Language } from '@/hooks/use-language';
import { z } from 'zod';


const timeZone = 'Asia/Jakarta';

// --- Admin Check ---
export async function isAdmin(userId: number): Promise<boolean> {
  // TODO: Move this to a .env.local file for better security.
  const adminIds = (process.env.TELEGRAM_ADMIN_IDS || '1845233794').split(',');
  return adminIds.includes(String(userId));
}

// --- Price Fetching Actions ---

export async function fetchTonPrice(): Promise<TonPrice> {
  // 1. Try fetching from TonAPI first
  try {
    const response = await fetch(
      'https://tonapi.io/v2/rates?tokens=ton&currencies=usd,idr',
      {
        next: { revalidate: 60 },
      }
    );
    if (!response.ok) {
      throw new Error(`TonAPI error: ${response.statusText}`);
    }
    const data = await response.json();
    const rates = data.rates.TON.prices;
    if (rates && rates.IDR && rates.USD) {
      return { idr: rates.IDR, usd: rates.USD, source: 'TonAPI' };
    }
    throw new Error('Invalid data from TonAPI');
  } catch (error) {
    console.warn('TonAPI fetch failed, falling back to CoinGecko:', error);
    
    // 2. Fallback to Coingecko
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=idr,usd',
        {
          next: { revalidate: 60 }, // Revalidate every 60 seconds
        }
      );
      if (!response.ok) {
        throw new Error(`Coingecko API error: ${response.statusText}`);
      }
      const data = await response.json();
      const price = data['the-open-network'];
      if (price && price.idr && price.usd) {
        return { idr: price.idr, usd: price.usd, source: 'CoinGecko' };
      }
      throw new Error('Invalid data from Coingecko');
    } catch (fallbackError) {
      console.error('All price fetch attempts failed:', fallbackError);
      return {
        idr: 0,
        usd: 0,
        source: 'Error',
        error: 'Failed to fetch price data.',
      };
    }
  }
}

async function fetchAndProcessHistory(
  url: string,
  timeFormatter: (date: Date) => string,
  points: number = 24
): Promise<PriceHistoryData> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!response.ok) {
      throw new Error(`Coingecko API error: ${response.statusText}`);
    }
    const data = await response.json();
    const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
      time: timeFormatter(new Date(timestamp)),
      price: price,
    }));

    let changePercent = 0;
    if (prices.length > 1) {
        const startPrice = prices[0].price;
        const endPrice = prices[prices.length - 1].price;
        if (startPrice > 0) {
            changePercent = ((endPrice - startPrice) / startPrice) * 100;
        }
    }

    // Return every Nth item to reduce the number of points on the chart for clarity
    let chartPoints = prices;
    if (prices.length > points) {
       const every = Math.ceil(prices.length / points);
       // Perbaikan 2: Terapkan anotasi tipe eksplisit
       chartPoints = prices.filter((_e: ChartPoint, i) => i % every === 0); 
    }
    
    return {
        points: chartPoints,
        changePercent: changePercent,
    }

  } catch (error) {
    console.error('Failed to fetch price history:', error);
    return { points: [], changePercent: 0 };
  }
}

export async function fetchTonPriceHistory(
  days: number = 1,
  lang: Language = 'en'
): Promise<PriceHistoryData> {
  const url = `https://api.coingecko.com/api/v3/coins/the-open-network/market_chart?vs_currency=idr&days=${days}`;

  let timeFormat: Intl.DateTimeFormat;
  let points: number;

  if (days > 365) {
    timeFormat = new Intl.DateTimeFormat(lang, {
      month: 'short',
      year: '2-digit',
      timeZone,
    });
    points = 100;
  } else if (days > 30) {
     timeFormat = new Intl.DateTimeFormat(lang, {
      month: 'short',
      day: 'numeric',
      timeZone,
    });
    points = 30;
  } else if (days > 1) {
    timeFormat = new Intl.DateTimeFormat(lang, {
      month: 'short',
      day: 'numeric',
      timeZone,
    });
    points = days * 2;
  } else {
    timeFormat = new Intl.DateTimeFormat(lang, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    });
    points = 24;
  }

  return fetchAndProcessHistory(url, (date) => timeFormat.format(date), points);
}

export async function fetchTonPriceHistoryHourly(lang: Language = 'en'): Promise<PriceHistoryData> {
  const url = `https://api.coingecko.com/api/v3/coins/the-open-network/market_chart?vs_currency=idr&days=1`;
  // Fetch last 1 days of data, but we'll filter it to the last hour
  const oneHourAgo = Date.now() - 3600 * 1000;
  try {
    const response = await fetch(url, {
      next: { revalidate: 600 }, // Revalidate every 10 minutes
    });
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();

    const timeFormat = new Intl.DateTimeFormat(lang, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone,
    });

    const prices = data.prices
      .filter(([timestamp]: [number, number]) => timestamp >= oneHourAgo)
      .map(([timestamp, price]: [number, number]) => ({
        time: timeFormat.format(new Date(timestamp)),
        price: price,
      }));

    // Ensure we don't have too many points
    const points = 12; // a point every 5 mins
    let chartPoints = prices;
    if (prices.length > points) {
       const every = Math.ceil(prices.length / points);
       // Perbaikan 3: Terapkan anotasi tipe eksplisit
       chartPoints = prices.filter((_e: ChartPoint, i) => i % every === 0); 
    }

    let changePercent = 0;
    if (prices.length > 1) {
        const startPrice = prices[0].price;
        const endPrice = prices[prices.length - 1].price;
        if (startPrice > 0) {
            changePercent = ((endPrice - startPrice) / startPrice) * 100;
        }
    }
     return {
        points: chartPoints,
        changePercent: changePercent,
    }
  } catch (e) {
    console.error(e);
    return { points: [], changePercent: 0 };
  }
}

// --- AI Actions ---

export async function getAiRecommendation(description: string, lang: Language): Promise<string> {
  try {
    const result = await conversionFormatRecommendation({ description, lang });
    return result.template;
  } catch (error) {
    console.error('AI recommendation failed:', error);
    if (lang === 'id') {
      return 'Maaf, terjadi kesalahan saat membuat rekomendasi.';
    }
    return 'Sorry, an error occurred while creating the recommendation.';
  }
}
