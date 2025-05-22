import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CarritoProvider } from '@/context/CarritoContext'
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dulces Delicias",
  description: "Pastelería artesanal y personalizada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CarritoProvider>
          <Providers>
            <main className="min-h-screen">
              {children}
            </main>
          </Providers>
        </CarritoProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}