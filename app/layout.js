import { Lato } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import "./_styles/globals.css";
import { CartProvider } from "@/hooks/use-cart";
import { Toaster } from "sonner";
import { AuthProvider } from "@/app/contexts/AuthContext";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-notoSans",
  display: "swap",
});

export const metadata = {
  title: "NEXFIT",
  description: "NEXFIT官網",
  icons: "/logo.png",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={`${lato.variable} ${notoSans.variable}`}>
          <CartProvider>{children}</CartProvider>
          <Toaster richColors position="top-center" />
        </body>
      </AuthProvider>
    </html>
  );
}
