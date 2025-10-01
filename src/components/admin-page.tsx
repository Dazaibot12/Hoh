'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ShieldAlert } from "lucide-react";

export function AdminPage() {
    return (
        <div className="w-full max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-primary" />
                        Halaman Admin
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Fitur ini masih dalam tahap pengembangan.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
