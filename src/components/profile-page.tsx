
'use client';

import { useLanguage } from '@/hooks/use-language';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useEffect, useState } from 'react';
import {
  Code,
  History,
  HelpCircle,
  Info,
  ChevronRight,
  Languages,
  Palette,
  Bot,
  Settings as SettingsIcon,
  Crown,
  Copy,
  Shield
} from 'lucide-react';
import { useTheme } from './theme-provider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { SettingsPanel } from './settings-panel';
import { Changelog } from './changelog';
import { AboutPage } from './about-page';
import { useSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { isAdmin } from '@/app/actions';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TelegramUser } from '@/lib/definitions';


// Extend the Window interface to include the Telegram object
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: TelegramUser;
        };
        ready: () => void;
        sendData: (data: string) => void;
      };
    };
  }
}

function UserProfileSummaryCard({ user, isAdmin, onClick }: { user: TelegramUser | null, isAdmin: boolean, onClick: () => void }) {
    const getInitials = (firstName: string, lastName?: string) => {
        const first = firstName.charAt(0);
        const last = lastName ? lastName.charAt(0) : '';
        return (first + last).toUpperCase();
    }

    return (
        <Card className="overflow-hidden">
            <button className="w-full text-left" onClick={onClick}>
                <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/50">
                        {user ? (
                            <>
                                <AvatarImage src={user.photo_url} alt={user.username || user.first_name} />
                                <AvatarFallback className="text-2xl">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                            </>
                        ) : (
                            <>
                                <AvatarImage src="/logo.png" alt="Guest" />
                                <AvatarFallback className="text-2xl">G</AvatarFallback>
                            </>
                        )}
                    </Avatar>
                    <div className='flex-grow'>
                        <div className="flex items-center gap-2">
                           <h1 className="text-lg font-bold">{user ? `${user.first_name} ${user.last_name || ''}` : "Guest"}</h1>
                            {user && isAdmin && (
                                <Badge variant="destructive" className="gap-1.5 pl-1.5 pr-2 text-xs">
                                    <Crown className="h-3 w-3" />
                                    Admin
                                </Badge>
                            )}
                        </div>
                        {user ? (
                            <p className="text-sm text-muted-foreground">@{user.username || 'Lihat detail'}</p>
                        ) : (
                             <p className="text-sm text-muted-foreground">Login untuk melihat detail</p>
                        )}
                    </div>
                     <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
            </button>
        </Card>
    );
}

function SettingsMenuItem({ icon, label, onClick, children }: { icon: React.ReactNode, label: string, onClick?: () => void, children?: React.ReactNode }) {
    const content = (
        <>
            {icon}
            <span className="flex-grow font-medium">{label}</span>
            {children || <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </>
    );

    if (onClick) {
        return (
            <button className="w-full text-left p-3 flex items-center gap-4" onClick={onClick}>
                {content}
            </button>
        )
    }
    
    return (
         <div className="w-full text-left p-3 flex items-center gap-4">
            {content}
        </div>
    )
}

function ThemeSubMenu() {
    const { theme, setTheme } = useTheme();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <div className="text-sm text-muted-foreground flex items-center gap-2 cursor-pointer">
                    <span className='capitalize'>{theme}</span>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


type ProfilePageProps = {
  setView: (view: 'home' | 'converter' | 'notes' | 'profile' | 'admin' | 'user-profile-details') => void;
};


export function ProfilePage({ setView }: ProfilePageProps) {
    const { t, lang, setLang } = useLanguage();
    const { toast } = useToast();
    const [user, setUser] = useState<TelegramUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUserAdmin, setIsUserAdmin] = useState(false);
    
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);


    useEffect(() => {
        const checkAdminStatus = async (userId: number) => {
            const adminStatus = await isAdmin(userId);
            setIsUserAdmin(adminStatus);
        }

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

    const handleSendData = () => {
        if (window.Telegram?.WebApp && user) {
            const dataToSend = JSON.stringify(user);
            window.Telegram.WebApp.sendData(dataToSend);
        } else {
            toast({
                variant: 'destructive',
                title: "Not in Telegram",
                description: "This feature is only available within Telegram.",
            });
        }
    }
    
    const handleProfileClick = () => {
        setView('user-profile-details');
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-md mx-auto space-y-6 animate-pulse">
                 <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="w-full space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    </CardContent>
                 </Card>
                 <div className='space-y-4'>
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-40 w-full rounded-lg" />
                 </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <UserProfileSummaryCard user={user} isAdmin={isUserAdmin} onClick={handleProfileClick} />

            {isUserAdmin && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground px-3">Admin</p>
                    <div className="bg-card rounded-lg divide-y">
                        <SettingsMenuItem
                            icon={<Shield className="h-5 w-5 text-muted-foreground" />}
                            label="Admin Page"
                            onClick={() => setView('admin')}
                        />
                    </div>
                </div>
            )}

            {/* General Settings */}
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground px-3">General</p>
                <div className="bg-card rounded-lg divide-y">
                     <SettingsMenuItem
                        icon={<Languages className="h-5 w-5 text-muted-foreground" />}
                        label={t('toggle_lang_button')}
                        onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
                    />
                    <SettingsMenuItem
                        icon={<Palette className="h-5 w-5 text-muted-foreground" />}
                        label="Theme"
                    >
                        <ThemeSubMenu />
                    </SettingsMenuItem>
                </div>
            </div>

            {/* App Info */}
             <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground px-3">Application</p>
                <div className="bg-card rounded-lg divide-y">
                     <Link href="/api-docs">
                        <div className="w-full text-left p-3 flex items-center gap-4">
                            <Code className="h-5 w-5 text-muted-foreground" />
                            <span className="flex-grow font-medium">{t('api_docs_title')}</span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </Link>
                     <SettingsMenuItem
                        icon={<History className="h-5 w-5 text-muted-foreground" />}
                        label={t('changelog_title')}
                        onClick={() => setIsChangelogOpen(true)}
                    />
                    <SettingsMenuItem
                        icon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
                        label={t('help_title')}
                        onClick={() => setIsHelpOpen(true)}
                    />
                    <SettingsMenuItem
                        icon={<Info className="h-5 w-5 text-muted-foreground" />}
                        label={t('about_title')}
                        onClick={() => setIsAboutOpen(true)}
                    />
                </div>
            </div>

            <Button onClick={handleSendData} className="w-full" disabled={!user}>
                <Bot className='mr-2 h-4 w-4' />
                Kirim Info ke Bot
            </Button>
            
            {/* All Dialogs */}
            <Dialog open={isChangelogOpen} onOpenChange={setIsChangelogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('changelog_title')}</DialogTitle>
                        <DialogDescription>{t('changelog_desc')}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-4">
                        <Changelog />
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{t('help_title')}</DialogTitle></DialogHeader>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>{t('help_desc_p1')}</p>
                        <p>{t('help_desc_p2')}</p>
                        <p>{t('help_desc_p3')}</p>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle className='sr-only'>{t('about_title')}</DialogTitle></DialogHeader>
                    <AboutPage />
                </DialogContent>
            </Dialog>
        </div>
    );
}
