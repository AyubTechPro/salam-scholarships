import { PrismaClient } from '@prisma/client';
import { Activity, Users, Globe, Smartphone, Monitor, TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsDashboard() {
  const t = await getTranslations("admin.analytics");
  const tDashboard = await getTranslations("admin.dashboard");

  // Get live analytics data
  const totalViews = await prisma.userActivity.count({
    where: { activityType: 'VIEW' }
  });

  const recentActivities = await prisma.userActivity.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  // Calculate top countries
  const allActivities = await prisma.userActivity.findMany({
    where: { activityType: 'VIEW' },
    select: { metadata: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 1000 // Sample size for performance
  });

  const countryCount: Record<string, number> = {};
  const deviceCount: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0, Unknown: 0 };
  let uniqueIPs = new Set();

  allActivities.forEach(activity => {
    const meta = activity.metadata as any;
    if (meta) {
      if (meta.country) countryCount[meta.country] = (countryCount[meta.country] || 0) + 1;
      if (meta.device) deviceCount[meta.device] = (deviceCount[meta.device] || 0) + 1;
      if (meta.ip) uniqueIPs.add(meta.ip);
    }
  });

  const topCountries = Object.entries(countryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const mobilePercentage = Math.round((deviceCount['Mobile'] / (Object.values(deviceCount).reduce((a, b) => a + b, 0) || 1)) * 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Neon Glow */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] border border-[#222] p-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-gold/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#EDEDED] to-[#888] tracking-tight flex items-center gap-3">
              <Activity className="w-8 h-8 text-brand-gold animate-pulse" />
              {t("title")}
            </h1>
            <p className="text-[#888] mt-2 font-medium">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-[#333] px-4 py-2 rounded-full shadow-lg shadow-black/50">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-500">{tDashboard("updatedLive")}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards (Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#222] p-6 rounded-2xl shadow-xl hover:border-[#444] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 text-[#888] mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold tracking-wide uppercase">{t("uniqueVisitors")}</h3>
            </div>
            <p className="text-5xl font-black text-white tracking-tight">{uniqueIPs.size}</p>
            <p className="text-xs text-[#666] mt-3">{t("basedOnEvents")}</p>
          </div>
        </div>

        <div className="group relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#222] p-6 rounded-2xl shadow-xl hover:border-[#444] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 text-[#888] mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold tracking-wide uppercase">{t("totalInteractions")}</h3>
            </div>
            <p className="text-5xl font-black text-white tracking-tight">{totalViews}</p>
            <p className="text-xs text-[#666] mt-3">{t("allTimeEvents")}</p>
          </div>
        </div>

        <div className="group relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#222] p-6 rounded-2xl shadow-xl hover:border-[#444] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 text-[#888] mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold tracking-wide uppercase">{t("mobileUsage")}</h3>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-5xl font-black text-white tracking-tight">{mobilePercentage}%</p>
            </div>
            <p className="text-xs text-[#666] mt-3">{t("mobileTraffic")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries List */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#222] p-6 rounded-2xl shadow-xl flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-400" />
            {t("globalReach")}
          </h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {topCountries.length > 0 ? topCountries.map(([country, count], index) => (
              <div key={country} className="flex items-center justify-between group p-3 hover:bg-[#111] rounded-xl transition-colors border border-transparent hover:border-[#333]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center text-[#888] font-bold text-xs">
                    #{index + 1}
                  </div>
                  <span className="text-[#EDEDED] font-medium group-hover:text-white transition-colors">
                    {country === 'Unknown' ? t("unknown") : country}
                  </span>
                </div>
                <div className="bg-[#111] border border-[#333] px-3 py-1 rounded-full text-xs font-bold text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                  {count} {tDashboard("views")}
                </div>
              </div>
            )) : <p className="text-[#666] text-center mt-10 italic">No geographic data yet.</p>}
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#222] p-6 rounded-2xl shadow-xl flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <Monitor className="w-5 h-5 text-brand-gold" />
            {t("liveActivity")}
          </h3>
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {recentActivities.map((activity, idx) => (
              <div key={activity.id} className="relative pl-6 pb-4 last:pb-0 group">
                {/* Timeline line */}
                {idx !== recentActivities.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-[-16px] w-[2px] bg-[#222] group-hover:bg-[#333] transition-colors" />
                )}
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[#111] border-[3px] border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                
                <div className="bg-[#111] border border-[#222] group-hover:border-[#444] rounded-xl p-4 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider bg-[#222] px-2 py-0.5 rounded">
                      {activity.activityType === 'VIEW' ? t("viewOnPage") : activity.activityType}
                    </span>
                    <span className="text-[10px] text-[#888] font-mono">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour12: false })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-[#666] mt-2">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#888]" />
                      {(activity.metadata as any)?.country || t("unknown")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Monitor className="w-3 h-3 text-[#888]" />
                      {(activity.metadata as any)?.device === 'Mobile' ? t("mobile") : t("desktop")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
