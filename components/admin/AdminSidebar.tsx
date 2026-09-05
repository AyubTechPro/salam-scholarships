"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  FileText, 
  MessageSquare,
  MessageSquareQuote,
  Settings,
  LogOut,
  Image as ImageIcon,
  Activity
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";

export default function AdminSidebar({ 
  locale, 
  isOpen, 
  onClose 
}: { 
  locale: string;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("admin.sidebar");

  const menuItems = [
    { name: t("overview"), href: `/${locale}/admin`, icon: LayoutDashboard },
    { name: t("liveAnalytics"), href: `/${locale}/admin/analytics`, icon: Activity },
    { name: t("programs"), href: `/${locale}/admin/programs`, icon: GraduationCap },
    { name: t("applications"), href: `/${locale}/admin/applications`, icon: FileText },
    { name: t("students"), href: `/${locale}/admin/students`, icon: Users },
    { name: t("consultations"), href: `/${locale}/admin/consultations`, icon: MessageSquare },
    { name: t("successStories"), href: `/${locale}/admin/success-stories`, icon: MessageSquareQuote },
    { name: t("heroBanner"), href: `/${locale}/admin/hero-slider`, icon: ImageIcon },
    { name: t("settings"), href: `/${locale}/admin/settings`, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-64 h-screen bg-[#0A0A0A] border-r border-[#222] flex flex-col shrink-0 z-50 fixed md:sticky top-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
      <div className="h-14 flex items-center justify-between px-6 border-b border-[#222]">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-[#EDEDED] rounded-md flex items-center justify-center mr-3">
            <span className="text-[#0A0A0A] font-bold text-sm tracking-tighter">S</span>
          </div>
          <span className="text-[#EDEDED] font-semibold text-sm tracking-tight">Salam Admin</span>
        </div>
        <AdminLanguageSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div 
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                  isActive 
                    ? "bg-[#222] text-[#EDEDED] font-medium" 
                    : "text-[#888] hover:bg-[#1A1A1A] hover:text-[#EDEDED]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#EDEDED]' : 'text-[#888]'}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#222] space-y-1">
        <Link 
          href={`/${locale}`}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#888] hover:bg-[#1A1A1A] hover:text-[#EDEDED] transition-colors duration-150"
        >
          <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
            <div className="w-2 h-2 bg-current rounded-full" />
          </div>
          {t("goToWebsite")}
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors duration-150"
        >
          <LogOut className="w-4 h-4" />
          {t("signOut")}
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #444;
        }
      `}</style>
    </aside>
    </>
  );
}
