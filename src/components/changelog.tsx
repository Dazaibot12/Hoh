"use client"

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from './ui/badge';

type ChangeLogItem = {
  version: string;
  date: string;
  changes: {
    type: 'feat' | 'fix' | 'style' | 'refactor';
    description: string;
  }[];
};

const changelogs: ChangeLogItem[] = [
    {
    version: '3.0.0',
    date: '2025-10-03',
    changes: [
      { type: 'style', description: 'Complete UI/UX overhaul to match modern iOS design aesthetics.' },
      { type: 'feat', description: 'Replaced page carousel with a native-style Bottom Tab Bar for navigation.' },
      { type: 'style', description: 'Redesigned Notes page into a clean list view, similar to Apple Notes.' },
      { type: 'feat', description: 'Overhauled the Calculator page to replicate the native iOS calculator\'s look and feel.' },
      { type: 'style', description: 'Redesigned the Home page service list into a clean, iOS-style accordion interface.' },
    ],
  },
    {
    version: '2.1.0',
    date: '2025-10-02',
    changes: [
      { type: 'feat', description: 'Overhauled the Calculator page to replicate the native iOS calculator\'s look and feel.' },
      { type: 'style', description: 'Redesigned the Home page service list into a clean, iOS-style accordion interface.' },
      { type: 'style', description: 'Refined the Home page tab navigation to better align with the modern UI aesthetic.' },
    ],
  },
    {
    version: '2.0.0',
    date: '2025-10-01',
    changes: [
      { type: 'style', description: 'Complete UI/UX overhaul to match modern iOS design aesthetics.' },
      { type: 'feat', description: 'Replaced page carousel with a native-style Bottom Tab Bar for navigation.' },
      { type: 'style', description: 'Redesigned Notes page into a clean list view, similar to Apple Notes.' },
      { type: 'feat', description: 'Centralized the "New Note" action into a single header button for universal access.' },
    ],
  },
  {
    version: '1.3.0',
    date: '2025-09-30',
    changes: [
      { type: 'feat', description: 'Added a powerful, instant-access Notes feature with "tap-to-copy" functionality.' },
      { type: 'refactor', description: 'Overhauled the main menu for a cleaner, more intuitive navigation experience.' },
      { type: 'style', description: 'Refined the UI for the Notes feature, optimizing for mobile with a compact grid layout.' },
    ],
  },
  {
    version: '1.2.0',
    date: '2025-09-29',
    changes: [
      { type: 'feat', description: 'Added a changelog accessible from the main menu.' },
      { type: 'feat', description: 'Improved custom format feature with better placeholders and a reset button.' },
      { type: 'fix', description: 'Corrected the conversion logic to properly function as a sell/buy calculator.' },
    ],
  },
  {
    version: '1.1.0',
    date: '2025-09-28',
    changes: [
      { type: 'style', description: 'Major UI/UX overhaul focusing on a clean, modern, and professional white theme.' },
      { type: 'refactor', description: 'Restructured the main layout to a single-column design for better focus and consistency.' },
      { type: 'style', description: 'Redesigned all major components including the header, converter display, and chart.' },
      { type: 'fix', description: 'Fixed various import path errors and logic bugs in the converter and copy functionality.' },
    ],
  },
  {
    version: '1.0.0',
    date: '2025-09-27',
    changes: [
      { type: 'feat', description: 'Initial release of the KIOS DAZAI Ton Converter application.' },
      { type: 'feat', description: 'Core features include TON/IDR conversion, live price tracking, and customizable profit settings.' },
    ],
  },
];

const badgeVariant: Record<
  'feat' | 'fix' | 'style' | 'refactor',
  'default' | 'destructive' | 'secondary' | 'outline'
> = {
  feat: 'default',
  fix: 'destructive',
  style: 'secondary',
  refactor: 'outline',
};

const badgeText: Record<'feat' | 'fix' | 'style' | 'refactor', string> = {
  feat: 'New',
  fix: 'Fix',
  style: 'Style',
  refactor: 'Refactor',
};

export function Changelog() {
    const [defaultValue, setDefaultValue] = React.useState('');

    React.useEffect(() => {
        if (changelogs.length > 0) {
            setDefaultValue(changelogs[0].version);
        }
    }, []);

  return (
    <Accordion type="single" collapsible className="w-full" value={defaultValue} onValueChange={setDefaultValue}>
      {changelogs.map((log) => (
        <AccordionItem key={log.version} value={log.version}>
          <AccordionTrigger>
            <div className="flex items-center gap-4">
              <h3 className="text-base font-semibold">Version {log.version}</h3>
              <p className="text-sm text-muted-foreground">{log.date}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 pl-4">
              {log.changes.map((change, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Badge
                    variant={badgeVariant[change.type]}
                    className="mt-1 shrink-0"
                  >
                    {badgeText[change.type]}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {change.description}
                  </p>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
