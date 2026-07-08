import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import PhotoPreviewModal from "@/components/gallery/PhotoPreviewModal";
import DisableActions from "@/components/DisableActions";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const siteUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jejak Photo",
    template: "%s | Jejak Photo"
  },
  icons: {
    icon: [
      { url: "/logo/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/logo/AppleTouch.png", sizes: "180x180", type: "image/png" }
    ],
  },
  openGraph: {
    title: "Jejak Photo",
    images: [
      {
        url: "/logo/OpenGraph.png",
        width: 1200,
        height: 630,
        alt: "Jejak Photo",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jejak Photo",
    images: ["/logo/OpenGraph.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#03412C",
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