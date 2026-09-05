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
  Activity,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import AdminLanguageSwitcher from "@/components/admin/AdminLanguageSwitcher";
import NextImage from "next/image";

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
    { name: t("overview"), href: `/${locale}/admin`, icon: LayoutDashboard, section: "main" },
    { name: t("liveAnalytics"), href: `/${locale}/admin/analytics`, icon: Activity, section: "main" },
    { name: t("programs"), href: `/${locale}/admin/programs`, icon: GraduationCap, section: "content" },
    { name: t("applications"), href: `/${locale}/admin/applications`, icon: FileText, section: "content" },
    { name: t("students"), href: `/${locale}/admin/students`, icon: Users, section: "content" },
    { name: t("consultations"), href: `/${locale}/admin/consultations`, icon: MessageSquare, section: "content" },
    { name: t("successStories"), href: `/${locale}/admin/success-stories`, icon: MessageSquareQuote, section: "content" },
    { name: t("heroBanner"), href: `/${locale}/admin/hero-slider`, icon: ImageIcon, section: "design" },
    { name: t("settings"), href: `/${locale}/admin/settings`, icon: Settings, section: "design" },
  ];

  const mainItems = menuItems.filter(i => i.section === "main");
  const contentItems = menuItems.filter(i => i.section === "content");
  const designItems = menuItems.filter(i => i.section === "design");

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link key={item.name} href={item.href} onClick={onClose}>
        <div className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
          isActive 
            ? "bg-white/10 text-white" 
            : "text-white/40 hover:bg-white/5 hover:text-white/80"
        }`}>
          <Icon className={`w-[15px] h-[15px] flex-shrink-0 transition-colors ${
            isActive ? "text-brand-gold" : "text-white/30 group-hover:text-white/60"
          }`} />
          <span className="truncate">{item.name}</span>
          {isActive && (
            <ChevronRight className="w-3 h-3 ml-auto text-white/30 flex-shrink-0" />
          )}
        </div>
      </Link>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-white/20">{label}</span>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`w-[220px] h-screen flex flex-col shrink-0 z-50 fixed md:sticky top-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0D0D0D 0%, #080808 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* ─── Logo Header ─── */}
        <div className="h-[58px] flex items-center px-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href={`/${locale}/admin`} className="flex items-center gap-2.5 group">
            {/* Logo Image */}
            <div className="relative flex-shrink-0">
              <NextImage
                src="/logo/salamscholarships-logo-transparent.png"
                alt="Salam Scholarships"
                width={28}
                height={28}
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            {/* Brand Text */}
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-bold text-white/90 tracking-tight">Salam</span>
              <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-brand-gold/70">Admin Panel</span>
            </div>
          </Link>

          {/* Language Switcher pushed to right */}
          <div className="ml-auto">
            <AdminLanguageSwitcher />
          </div>
        </div>

        {/* ─── Navigation ─── */}
        <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
          {/* Main Section */}
          <SectionLabel label="Overview" />
          <div className="space-y-0.5">
            {mainItems.map(item => <NavItem key={item.href} item={item} />)}
          </div>

          {/* Content Section */}
          <SectionLabel label="Content" />
          <div className="space-y-0.5">
            {contentItems.map(item => <NavItem key={item.href} item={item} />)}
          </div>

          {/* Design Section */}
          <SectionLabel label="Design" />
          <div className="space-y-0.5">
            {designItems.map(item => <NavItem key={item.href} item={item} />)}
          </div>
        </div>

        {/* ─── Bottom Actions ─── */}
        <div className="p-3 flex-shrink-0 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* View Site */}
          <Link 
            href={`/${locale}`}
            target="_blank"
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-white/35 hover:bg-white/5 hover:text-white/70 transition-all duration-150"
          >
            <ExternalLink className="w-[15px] h-[15px] text-white/25 group-hover:text-white/50 transition-colors" />
            <span>{t("goToWebsite")}</span>
          </Link>

          {/* Sign Out */}
          <button 
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-red-400/50 hover:bg-red-500/8 hover:text-red-400/90 transition-all duration-150"
          >
            <LogOut className="w-[15px] h-[15px] text-red-400/30 group-hover:text-red-400/70 transition-colors" />
            <span>{t("signOut")}</span>
          </button>

          {/* Brand Badge */}
          <div className="mt-3 px-3 py-2.5 rounded-lg bg-gradient-to-br from-brand-gold/8 to-transparent border border-brand-gold/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-brand-gold/60 flex-shrink-0" />
              <span className="text-[10px] text-white/25 font-medium">Salam Scholarships v1.0</span>
            </div>
            <p className="text-[9px] text-white/15 mt-0.5 leading-relaxed">
              Educational Opportunities Platform
            </p>
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }
        `}</style>
      </aside>
    </>
  );
}
