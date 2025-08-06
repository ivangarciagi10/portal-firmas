import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NavBarWrapper from "./components/NavBarWrapper";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Portal Firmas GI",
  description: "Portal Interno de Firmas GI",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`bg-white text-gray-900 ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NavBarWrapper />
          {children}
        </Providers>
      </body>
    </html>
  );
}
