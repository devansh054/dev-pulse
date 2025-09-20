import { Roboto_Mono } from "next/font/google";
import { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from '@/components/ui/toast';
import { V0Provider } from '@/lib/v0-context';

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dev-pulse.netlify.app'),
  title: {
    template: "%s – DevPulse",
    default: "DevPulse - Developer Intelligence Dashboard",
  },
  description:
    "AI-powered developer productivity and wellbeing insights",
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/favicon-32x32.png',
  },
  openGraph: {
    title: "DevPulse - Developer Intelligence Dashboard",
    description: "AI-powered developer productivity and wellbeing insights",
    url: "https://devpulse.app",
    siteName: "DevPulse",
    images: [
      {
        url: "https://devpulse.app/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "DevPulse Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevPulse - Developer Intelligence Dashboard",
    description: "AI-powered developer productivity and wellbeing insights",
    images: ["https://devpulse.app/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/Rebels-Fett.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`}
      >
        <V0Provider isV0={false}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </V0Provider>
      </body>
    </html>
  );
}
