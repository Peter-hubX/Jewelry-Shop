"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ReloadPrompt() {
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            (window as any).workbox !== undefined
        ) {
            const wb = (window as any).workbox;

            wb.addEventListener("waiting", () => {
                toast("تحديث جديد متوفر", {
                    action: {
                        label: "تحديث",
                        onClick: () => {
                            wb.messageSkipWaiting();
                            window.location.reload();
                        }
                    },
                    duration: Infinity,
                })
            });

            wb.register();
        }
    }, []);

    return null;
}
