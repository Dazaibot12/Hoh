'use client';

import { Logo } from '@/components/logo';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';

export function AppHeader() {
  const { t } = useLanguage();

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
        <Link href="/#home" className="flex items-center gap-3 text-primary">
          <Logo className="h-8 w-8" />
          <div>
              <h1 className="text-lg font-bold text-foreground leading-none text-left">
              KIOS DAZAI
              </h1>
              <p className="text-xs text-muted-foreground">{t('app_subtitle')}</p>
          </div>
        </Link>
        <div className="flex-1" />
      </header>
    </>
  );
}
