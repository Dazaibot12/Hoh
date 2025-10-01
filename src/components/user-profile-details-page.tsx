'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Copy, Crown, CheckCircle2, ShieldX } from 'lucide-react';
import { Badge } from './ui/badge';
import type { TelegramUser } from '@/lib/definitions';
import { isAdmin } from '@/app/actions';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: TelegramUser & { is_premium?: boolean };
        };
        ready: () => void;
      };
    };
  }
}

function UserProfileDetailCard({ user, isUserAdmin }: { user: (TelegramUser & { is_premium?: boolean }) | null; isUserAdmin: boolean }) {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleCopy = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: t('copy_success_title'),
      className: 'bg-primary text-primary-foreground',
    });
  };

  const getInitials = (firstName: string, lastName?: string) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'G';
  };

  const InfoRow = ({ label, value, onCopy }: { label: string; value: string | undefined; onCopy?: () => void }) => (
    <div className="flex items-center justify-between p-3">
      <p className="font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-mono text-sm text-right truncate max-w-xs">{value || 'N/A'}</p>
        {onCopy && (
          <button onClick={onCopy} className="text-primary/70 hover:text-primary">
            <Copy className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col items-center gap-4 py-4">
        <Avatar className="h-24 w-24 border-4 border-primary/50">
          {user ? (
            <>
              <AvatarImage src={user.photo_url} alt={user.username || user.first_name} />
              <AvatarFallback className="text-4xl">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="/logo.png" alt="Guest" />
              <AvatarFallback className="text-4xl">G</AvatarFallback>
            </>
          )}
        </Avatar>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold truncate max-w-sm">{user ? `${user.first_name} ${user.last_name || ''}` : 'Guest'}</h1>
            {user && isUserAdmin && (
              <Badge variant="destructive" className="gap-1.5 pl-1.5 pr-2 text-xs">
                <Crown className="h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>
          <p className="text-base text-muted-foreground">@{user?.username || 'N/A'}</p>
        </div>
      </div>
      {user && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y text-sm">
                <InfoRow label="Nama Depan" value={user.first_name} onCopy={() => handleCopy(user.first_name)} />
                <InfoRow label="Nama Belakang" value={user.last_name} onCopy={() => handleCopy(user.last_name)} />
                <InfoRow label="Username" value={user.username ? `@${user.username}`: undefined} onCopy={() => handleCopy(user.username)} />
                <InfoRow label="User ID" value={String(user.id)} onCopy={() => handleCopy(String(user.id))} />
                <div className="flex items-center justify-between p-3">
                  <p className="font-medium text-muted-foreground">Premium</p>
                  {user.is_premium ? (
                      <div className="flex items-center gap-1.5 text-sm text-blue-500">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Aktif</span>
                      </div>
                  ) : (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground/80">
                          <ShieldX className="h-4 w-4" />
                          <span>Tidak Aktif</span>
                      </div>
                  )}
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

type UserProfileDetailsPageProps = {
  setView: (view: 'profile') => void;
};

export function UserProfileDetailsPage({ setView }: UserProfileDetailsPageProps) {
  const [user, setUser] = useState<(TelegramUser & { is_premium?: boolean }) | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async (userId: number) => {
      const adminStatus = await isAdmin(userId);
      setIsUserAdmin(adminStatus);
    };

    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      if (telegram.initDataUnsafe.user) {
        const currentUser = telegram.initDataUnsafe.user;
        setUser(currentUser);
        checkAdminStatus(currentUser.id);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto space-y-4 animate-pulse">
        <div className="flex items-center h-8 mb-4">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex flex-col items-center gap-4 py-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="w-full space-y-2 text-center">
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
        <Card>
            <CardContent className="p-0">
                <div className="space-y-4 p-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="flex items-center relative justify-center h-8 mb-4">
        <Button variant="ghost" onClick={() => setView('profile')} className="absolute left-0 top-1/2 -translate-y-1/2 text-primary">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Profil
        </Button>
      </div>
      <UserProfileDetailCard user={user} isUserAdmin={isUserAdmin} />
    </div>
  );
}
