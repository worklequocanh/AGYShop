import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QuickViewModal } from "@/components/QuickViewModal";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AGYShop | Mua sắm trực tuyến chuyên nghiệp",
  description: "Nền tảng thương mại điện tử hiện đại — hàng chính hãng, giao nhanh 2h, thanh toán an toàn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-surface text-primary min-h-screen flex flex-col`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Navigation Header */}
            <Header />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>

          {/* Global Quick View Overlay Modal */}
          <QuickViewModal />
        </Providers>
      </body>
    </html>
  );
}
