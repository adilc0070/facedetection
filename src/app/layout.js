import { Sora, Figtree } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Lumina — AI Video Creator Marketplace",
  description:
    "Hire verified AI video creators from our Creative Course community. Pay Lumina — we hold funds in escrow and pay creators on delivery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
