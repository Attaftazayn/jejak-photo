import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import PhotoPreviewModal from "@/components/gallery/PhotoPreviewModal";
import DisableActions from "@/components/DisableActions";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Jejak Moments",
  description: "Professional Tennis Photography Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body>
        <DisableActions />

        {children}

        <PhotoPreviewModal />

      </body>
    </html>
  );
}