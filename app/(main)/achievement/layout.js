import Navbar from '@/app/components/Navbar';
import Footer from "@/app/components/Footer_forum";
import toast from "sonner"

export default function FAQLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9FA]">
      <Navbar />
      <main className="flex-1 flex flex-col items-stretch">
        {children}
      </main>
      <Footer />
    </div>
  );
} 