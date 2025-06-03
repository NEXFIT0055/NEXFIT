"use client";

import Navbar from "../../components/Navbar";
import { FavoritesProvider } from "@/app/contexts/FavoriteContext";
import Footer from "../../components/Footer";
import { CartProvider } from "@/hooks/use-cart";
import { Toaster } from "@/app/components/ui/sonner";
import { AuthProvider } from "@/app/contexts/AuthContext";

export default function MainLayout({ children }) {
  return (
    <>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <Navbar />
            <main className="flex min-h-screen flex-col">{children}</main>
            <Toaster richColors position="top-center" />
            <Footer />
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </>
  );
}
