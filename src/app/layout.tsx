import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import "@fontsource/parkinsans/400.css";
import "@fontsource/parkinsans/500.css";
import "@fontsource/parkinsans/600.css";
import "@fontsource/parkinsans/700.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lmaproject1b.com'),
  title: "PT Lancarjaya Mandiri Abadi - Premier General Contractor in Indonesia",
  description:
    "PT Lancarjaya Mandiri Abadi (LMA) is a premier general contractor in Indonesia, renowned for exceptional and timely service. We are a trusted partner for both government and private clients, with core capabilities spanning from earthworks and mining construction to transportation.",
  keywords: ["general contractor", "construction", "earthworks", "mining construction", "transportation", "Indonesia", "PT Lancarjaya Mandiri Abadi", "LMA"],
  openGraph: {
    title: "PT Lancarjaya Mandiri Abadi - Premier General Contractor in Indonesia",
    description: "PT Lancarjaya Mandiri Abadi (LMA) is a premier general contractor in Indonesia, renowned for exceptional and timely service. We are a trusted partner for both government and private clients, with core capabilities spanning from earthworks and mining construction to transportation.",
    images: [
      {
        url: '/landing.jpg',
        width: 1200,
        height: 630,
        alt: 'PT Lancarjaya Mandiri Abadi Construction Site',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PT Lancarjaya Mandiri Abadi - Premier General Contractor in Indonesia",
    description: "PT Lancarjaya Mandiri Abadi (LMA) is a premier general contractor in Indonesia, renowned for exceptional and timely service. We are a trusted partner for both government and private clients, with core capabilities spanning from earthworks and mining construction to transportation.",
    images: ['/landing.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-parkinsans antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
