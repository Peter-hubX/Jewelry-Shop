"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    if (isStandalone) {
        return null;
    }

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    if (isIOS) {
        return (
            <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border bg-background p-4 shadow-lg md:left-auto md:right-4 md:w-96">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold">تثبيت التطبيق</h3>
                        <p className="text-sm text-muted-foreground">
                            لتثبيت التطبيق على جهازك، اضغط على زر المشاركة <span className="text-xl">⎋</span> ثم اختر "إضافة إلى الشاشة الرئيسية" <span className="text-xl">➕</span>
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsIOS(false)}>
                        ✕
                    </Button>
                </div>
            </div>
        );
    }

    if (!deferredPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
            <Button onClick={handleInstallClick} className="shadow-lg gap-2" size="lg">
                <Download className="h-4 w-4" />
                تثبيت التطبيق
            </Button>
        </div>
    );
}
