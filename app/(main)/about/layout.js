import Navbar from '@/app/components/Navbar';
import Footer from "@/app/components/Footer_forum";

export default function AboutLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9FA]">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center items-center">
        {children}
      </main>
      <Footer />
    </div>
  );
} 