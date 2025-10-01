export type ProfitMode = 'percentage' | 'fixed';

export type TransactionMode = 'sell' | 'buy';

export interface Settings {
  profitMode: ProfitMode;
  profitValue: number;
  idrToTonFormat: string;
  tonToIdrFormat: string;
}

export interface TonPrice {
  idr: number;
  usd: number;
  source: 'CoinGecko' | 'TonAPI' | 'Error';
  error?: string;
}

export type ChartPoint = {
  time: string;
  price: number;
};

export type PriceHistoryData = {
  points: ChartPoint[];
  changePercent: number;
};

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};
