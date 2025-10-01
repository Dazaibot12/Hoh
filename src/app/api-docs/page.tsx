'use client';

import { AppHeader } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";


function ApiDocsContent() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const domain = typeof window !== 'undefined' ? window.location.origin : '';

    const getCode = (lang: 'py' | 'js' | 'curl') => {
        const url = `${domain}/api/rate`;
        const params = `?profitMode=percentage&profitValue=2.5`;
        switch (lang) {
            case 'py':
                return `import requests

# URL untuk mengambil data harga
# Parameter: ?profitMode=percentage&profitValue=2.5
url = "${url}${params}"

try:
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    print("Harga Jual (IDR -> TON):", data['hargaJual']['formatted'])
    print("Harga Beli (TON -> IDR):", data['hargaBeli']['formatted'])
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
`;
            case 'js':
                return `const url = '${url}${params}';

fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Harga Jual (IDR -> TON):', data.hargaJual.formatted);
        console.log('Harga Beli (TON -> IDR):', data.hargaBeli.formatted);
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
`;
            case 'curl':
                return `curl -X GET "${url}${params}"`;
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: t('copy_success_title'),
            className: 'bg-primary text-primary-foreground',
        });
    };

    return (
        <div className="space-y-8">
            <Link href="/#home" className="inline-flex items-center text-primary mb-4 text-sm font-medium">
                <ChevronLeft className="h-5 w-5 mr-1" />
                Kembali ke Beranda
            </Link>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('api_docs_title')}</h1>
                <p className="text-muted-foreground mt-2">
                    {t('api_docs_desc')}
                </p>
            </div>
            
            {/* JSON API Group */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">JSON API</h2>
                 <div className="bg-card rounded-lg divide-y border">
                    <div className="p-4 space-y-2">
                        <div className='flex items-center gap-2'>
                          <Badge variant="secondary">GET</Badge>
                          <p className="text-sm font-mono bg-muted px-2 py-1 rounded-md overflow-x-auto">/api/rate</p>
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">{t('api_docs_endpoint_desc')}</p>
                    </div>
                     <div className="p-4 space-y-2">
                        <p className="font-medium text-sm">{t('api_docs_params_title')}</p>
                        <p className="text-xs text-muted-foreground">
                            <code className='font-mono bg-muted px-1.5 py-0.5 rounded'>profitMode</code>: 'percentage' | 'fixed'
                        </p>
                        <p className="text-xs text-muted-foreground">
                             <code className='font-mono bg-muted px-1.5 py-0.5 rounded'>profitValue</code>: number
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="py">
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value="py">Python</TabsTrigger>
                    <TabsTrigger value="js">JavaScript</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="py">
                    <div className="relative rounded-lg bg-card font-mono text-xs p-4 border max-h-60 overflow-auto mt-2">
                        <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-auto px-2 py-1" onClick={() => handleCopy(getCode('py'))}>{t('copy_button')}</Button>
                        <pre><code className='language-python'>{getCode('py')}</code></pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="js">
                     <div className="relative rounded-lg bg-card font-mono text-xs p-4 border max-h-60 overflow-auto mt-2">
                        <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-auto px-2 py-1" onClick={() => handleCopy(getCode('js'))}>{t('copy_button')}</Button>
                        <pre><code className='language-javascript'>{getCode('js')}</code></pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="curl">
                    <div className="relative rounded-lg bg-card font-mono text-xs p-4 border max-h-60 overflow-auto mt-2">
                        <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-auto px-2 py-1" onClick={() => handleCopy(getCode('curl'))}>{t('copy_button')}</Button>
                        <pre><code className='language-bash'>{getCode('curl')}</code></pre>
                    </div>
                  </TabsContent>
                </Tabs>
            </div>

            {/* Rate Card Image API Group */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">{t('rate_card_image_api_title')}</h2>
                <p className='text-sm text-muted-foreground -mt-2'>{t('rate_card_image_api_desc')}</p>
                 <div className="bg-card rounded-lg border">
                     <Link href="/rate-card" target="_blank" rel="noopener noreferrer" className="block p-4 w-full text-left">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">/rate-card</p>
                                <p className="text-xs text-muted-foreground mt-1">{t('rate_card_image_api_endpoint_desc')}</p>
                            </div>
                            <ExternalLink className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function ApiDocsPage() {
    return (
      <LanguageProvider>
        <div className="flex min-h-screen w-full flex-col">
            <AppHeader />
            <main className="container mx-auto flex w-full flex-1 flex-col p-4 md:p-6 lg:p-8">
                <div className="w-full max-w-2xl mx-auto space-y-8">
                    <ApiDocsContent />
                </div>
            </main>
        </div>
      </LanguageProvider>
    )
}
