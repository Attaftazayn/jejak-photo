"use client";

import { useEffect } from "react";

export default function DisableActions() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            if (
                (e.ctrlKey && ["s", "u", "p"].includes(key)) ||
                e.key === "F12"
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return null;
}