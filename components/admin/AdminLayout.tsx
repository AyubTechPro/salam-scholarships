"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import { Suspense } from "react";
import { Loader2, Menu } from "lucide-react";
import { Toaster } from "sonner";
import AdminLanguageSwitcher from "./AdminLanguageSwitcher";

export default function AdminLayout({
  children,
  locale
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Generate simple breadcrumbs from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  // Remove locale and 'admin' from breadcrumbs
  const breadcrumbParts = pathParts.slice(2);
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans selection:bg-[#EDEDED] selection:text-[#0A0A0A] flex">
      <AdminSidebar locale={locale} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header - Vercel Style */}
        <header className="h-14 border-b border-[#222] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center text-sm font-medium text-[#888]">
            <button 
              className="mr-3 p-1.5 rounded-md hover:bg-[#222] md:hidden transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-[#EDEDED]" />
            </button>
            <span className="text-[#EDEDED] hidden sm:inline">Salam</span>
            <span className="mx-2 text-[#444] hidden sm:inline">/</span>
            <span className="capitalize">{breadcrumbParts[0] || 'Dashboard'}</span>
            {breadcrumbParts.length > 1 && (
              <>
                <span className="mx-2 text-[#444]">/</span>
                <span className="text-[#EDEDED] capitalize">{breadcrumbParts[1]}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <AdminLanguageSwitcher />
          </div>
        </header>

        {/* Content Area with Suspense for Lightning Fast Perceived Performance */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-6xl mx-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-[#888]" />
              </div>
            }>
              {children}
            </Suspense>
          </div>
        </div>
      </main>
      <Toaster theme="dark" position="bottom-right" richColors />
    </div>
  );
}
