"use client";

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { TonPrice, ChartPoint } from '@/lib/definitions';
import { ToncoinLogo } from '@/components/toncoin-logo';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Skeleton } from './ui/skeleton';

type PriceChartProps = {
  data: ChartPoint[];
  onTimeRangeChange: (range: TimeRange) => void;
  activeTimeRange: TimeRange;
  currentPrice: TonPrice;
  changePercent: number;
};

export type TimeRange = 'live' | '1h' | '24h' | '1m' | '1y';

function SegmentedControl({
  timeRanges,
  activeTimeRange,
  onTimeRangeChange,
}: {
  timeRanges: { label: string; range: TimeRange }[];
  activeTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-muted p-1">
      {timeRanges.map(({ label, range }) => (
        <Button
          key={range}
          size="sm"
          variant={activeTimeRange === range ? 'soft' : 'ghost'}
          className={cn(
            "rounded-md px-2 py-1 h-auto text-xs flex-1 transition-all duration-200",
            activeTimeRange === range && 'bg-background shadow-sm'
          )}
          onClick={() => onTimeRangeChange(range)}
        >
          {range === 'live' && (
            <span className="relative flex h-2 w-2 mr-1.5">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75',
                  activeTimeRange !== 'live' && 'hidden'
                )}
              ></span>
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2 w-2',
                  activeTimeRange === 'live'
                    ? 'bg-primary'
                    : 'bg-muted-foreground/50'
                )}
              ></span>
            </span>
          )}
          {label}
        </Button>
      ))}
    </div>
  );
}


export function PriceChart({
  data,
  onTimeRangeChange,
  activeTimeRange,
  currentPrice,
  changePercent,
}: PriceChartProps) {
  const { lang, t } = useLanguage();
  
  const chartConfig = {
    price: {
      label: t('chart_price_label'),
      color: 'hsl(var(--primary))',
    },
  };

  const yDomain = React.useMemo(() => {
    if (!data || data.length === 0) return [0, 0];
    const prices = data.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.2;
    const finalMin = Math.max(0, min - padding);
    const finalMax = max + padding;
    return [finalMin, finalMax];
  }, [data]);

  const chartColor = changePercent >= 0 ? "hsl(142.1 76.2% 41.2%)" : "hsl(359.1 82.2% 57.1%)";
  const chartGradient = changePercent >= 0 ? "chart-gradient-up" : "chart-gradient-down";

  const timeRanges: { label: string; range: TimeRange }[] = [
    { label: t('chart_range_live'), range: 'live' },
    { label: '1H', range: '1h' },
    { label: '24H', range: '24h' },
    { label: '1M', range: '1m' },
    { label: '1Y', range: '1y' },
  ];

  const isUp = changePercent >= 0;
  const locale = lang === 'id' ? 'id-ID' : 'en-US';

  const isLoading = data.length === 0 && activeTimeRange !== 'live';

  return (
    <Card className="rounded-lg w-full overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <ToncoinLogo className="h-6 w-6" />
            <CardTitle className="text-base font-bold text-foreground">
              Toncoin Price
            </CardTitle>
          </div>
          <div className="text-right">
             <p className="text-2xl font-bold">
              Rp {currentPrice.idr.toLocaleString(locale)}
            </p>
             <div className={cn(
                "flex items-center justify-end gap-1 text-xs font-medium",
                isUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
              )}>
                {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>
                    {Math.abs(changePercent).toFixed(2)}% ({activeTimeRange.toUpperCase()})
                </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="h-[180px] w-full relative">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                <Skeleton className="h-full w-full" />
            </div>
        )}
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -10,
              right: 20,
              top: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="chart-gradient-up" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="chart-gradient-down" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={false}
              />
            <YAxis
              domain={yDomain}
              tickLine={false}
              axisLine={false}
              tickMargin={5}
              width={60}
              orientation="right"
              tickFormatter={(value) =>
                `${Number(value).toLocaleString(locale, {
                  maximumFractionDigits: 0,
                })}`
              }
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Tooltip
              cursor={{
                stroke: 'hsl(var(--accent))',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    return (
                      <div className="space-y-1">
                        <p className="font-bold text-foreground">{`Rp ${Number(
                          value
                        ).toLocaleString(locale, {
                          maximumFractionDigits: 2,
                        })}`}</p>
                        <p className="text-xs text-muted-foreground">{props.payload.time}</p>
                      </div>
                    );
                  }}
                  labelFormatter={(label, payload) => {
                     if (payload && payload.length > 0) {
                        return t('chart_price_label');
                     }
                     return label;
                  }}
                  itemStyle={{}}
                  wrapperClassName="!bg-card/80 backdrop-blur-sm !border-border rounded-lg !shadow-lg"
                />
              }
            />
            <Area
              dataKey="price"
              type="monotone"
              fill={`url(#${chartGradient})`}
              stroke={chartColor}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
                fill: chartColor,
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
        </div>
         <div className="mt-2">
            <SegmentedControl 
              timeRanges={timeRanges} 
              activeTimeRange={activeTimeRange}
              onTimeRangeChange={onTimeRangeChange}
            />
        </div>
      </CardContent>
    </Card>
  );
}
