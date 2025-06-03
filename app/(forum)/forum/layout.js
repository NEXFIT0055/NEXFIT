import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer_forum";

export default function ForumShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex justify-center pt-16">
        <div className="w-full max-w-[1440px] px-4 flex flex-col justify-between min-h-[calc(100vh-64px-64px)]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
