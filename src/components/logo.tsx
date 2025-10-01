'use client';

import Image from 'next/image';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement> & {className?: string}) {
  return (
    <div {...props} className={props.className} style={{ position: 'relative' }}>
      <Image
        src="/logo.png"
        alt="KIOS DAZAI Logo"
        fill={true}
        style={{ objectFit: 'contain' }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
