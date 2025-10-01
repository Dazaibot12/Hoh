import { Logo } from './logo';
import packageJson from '@/../package.json';

const acknowledgements = [
    { name: 'Next.js', url: 'https://nextjs.org' },
    { name: 'React', url: 'https://react.dev' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
    { name: 'Shadcn UI', url: 'https://ui.shadcn.com' },
    { name: 'Lucide', url: 'https://lucide.dev' },
    { name: 'Genkit', url: 'https://firebase.google.com/docs/genkit' },
];

export function AboutPage() {
    const version = packageJson.version;
    const currentYear = 2025;

    return (
        <div className="text-center p-4">
            <div className="flex flex-col items-center gap-4 mb-6">
                <Logo className="h-16 w-16 text-primary" />
                <div>
                    <h1 className="text-xl font-bold">KIOS DAZAI</h1>
                    <p className="text-sm text-muted-foreground">Ton Converter</p>
                </div>
                <p className="text-xs text-muted-foreground">Version {version}</p>
            </div>

            <div className="text-left mb-6">
                <h2 className="text-sm font-semibold mb-2">Acknowledgements</h2>
                <div className="rounded-lg bg-card border">
                     <ul className="divide-y text-sm">
                        {acknowledgements.map((ack, index) => (
                            <li key={index} className="px-4 py-2">
                                <a href={ack.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {ack.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="text-xs text-muted-foreground">
                <p>Copyright © {currentYear} KIOS DAZAI</p>
                <p>Created by @pdazai</p>
            </div>
        </div>
    );
}
