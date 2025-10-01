'use client';

import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function ToncoinLogo(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn('relative', props.className)}
    >
      <Image
        src="/toncoin_logo.png"
        alt="Toncoin Logo"
        fill={true}
        sizes="(max-width: 768px) 10vw, 5vw"
      />
    </div>
  );
}
