import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { AppContextProvider } from "@/components/AppContext";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Attendance Tracker",
  description: "A simple attendance tracker app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppContextProvider>
          <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-sm">
              <div className="container mx-auto px-4 py-3">
                <h1 className="text-2xl font-bold">
                  <a href="/">Attendance Tracker</a>
                </h1>
              </div>
            </header>
            {children}
          </div>
          <footer className="bg-white shadow-sm w-full">
            <div className="container mx-auto px-4 py-3 w-fit">
              <p className="text-sm text-gray-500">© KimNattanan</p>
            </div>
          </footer>
        </AppContextProvider>
      </body>
    </html>
  );
}
