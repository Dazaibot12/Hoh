'use server';

import {NextResponse} from 'next/server';
import {fetchTonPrice} from '@/app/actions';
import type {Settings} from '@/lib/definitions';
import {z} from 'zod';

const schema = z.object({
  profitMode: z.enum(['percentage', 'fixed']),
  profitValue: z.preprocess(
    val => (val ? parseFloat(String(val)) : undefined),
    z.number().default(2.5)
  ),
});

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);

  const validation = schema.safeParse({
    profitMode: searchParams.get('profitMode') || 'percentage',
    profitValue: searchParams.get('profitValue'),
  });

  if (!validation.success) {
    return NextResponse.json(
      {error: 'Invalid query parameters', details: validation.error.format()},
      {status: 400}
    );
  }

  const settings: Pick<Settings, 'profitMode' | 'profitValue'> =
    validation.data;

  try {
    const price = await fetchTonPrice();
    if (price.source === 'Error') {
      return NextResponse.json(
        {error: 'Failed to fetch TON price'},
        {status: 503}
      );
    }

    const harga_dasar_per_ton = price.idr;
    const laba_per_ton_fixed =
      settings.profitMode === 'fixed'
        ? settings.profitValue
        : (settings.profitValue / 100) * harga_dasar_per_ton;

    const harga_jual_per_ton = harga_dasar_per_ton + laba_per_ton_fixed; // IDR -> TON
    const harga_beli_per_ton = harga_dasar_per_ton - laba_per_ton_fixed; // TON -> IDR

    const locale = 'id-ID';

    return NextResponse.json({
      hargaJual: {
        raw: harga_jual_per_ton,
        formatted: `Rp ${harga_jual_per_ton.toLocaleString(locale, {
          maximumFractionDigits: 0,
        })}`,
        description: 'Harga jual kami (IDR ke TON)',
      },
      hargaBeli: {
        raw: harga_beli_per_ton,
        formatted: `Rp ${harga_beli_per_ton.toLocaleString(locale, {
          maximumFractionDigits: 0,
        })}`,
        description: 'Harga beli kami (TON ke IDR)',
      },
      lastUpdated: new Date().toISOString(),
      source: price.source,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {error: 'An internal server error occurred'},
      {status: 500}
    );
  }
}
