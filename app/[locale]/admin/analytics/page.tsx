import { PrismaClient } from '@prisma/client';
import { Activity, Users, Globe, Smartphone, Monitor } from 'lucide-react';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsDashboard() {
  // Get live analytics data
  const totalViews = await prisma.userActivity.count({
    where: { activityType: 'VIEW' }
  });

  const recentActivities = await prisma.userActivity.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  // Calculate top countries (rough grouping using DB if possible, or in memory for small datasets)
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-brand-gold animate-pulse" />
          Live Analytics Engine
        </h1>
        <p className="text-gray-500 mt-2">Silicon Valley Intelligence: Real-time tracking of platform usage.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 text-brand-gold mb-2">
            <Users className="w-6 h-6" />
            <h3 className="text-lg font-semibold text-navy dark:text-white">Unique Visitors</h3>
          </div>
          <p className="text-4xl font-black text-navy dark:text-white">{uniqueIPs.size}</p>
          <p className="text-sm text-gray-500 mt-2">Based on recent 1,000 events</p>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 text-brand-gold mb-2">
            <Activity className="w-6 h-6" />
            <h3 className="text-lg font-semibold text-navy dark:text-white">Total Interactions</h3>
          </div>
          <p className="text-4xl font-black text-navy dark:text-white">{totalViews}</p>
          <p className="text-sm text-gray-500 mt-2">All time platform events</p>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 text-brand-gold mb-2">
            <Smartphone className="w-6 h-6" />
            <h3 className="text-lg font-semibold text-navy dark:text-white">Mobile Usage</h3>
          </div>
          <p className="text-4xl font-black text-navy dark:text-white">
            {Math.round((deviceCount['Mobile'] / (Object.values(deviceCount).reduce((a, b) => a + b, 0) || 1)) * 100)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">Of recent traffic is from phones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Countries */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] p-6 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-gold" />
            Global Reach (Top Countries)
          </h3>
          <div className="space-y-4">
            {topCountries.length > 0 ? topCountries.map(([country, count], index) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {index + 1}. {country === 'Unknown' ? 'Local/Development' : country}
                </span>
                <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-sm font-bold">
                  {count} views
                </span>
              </div>
            )) : <p className="text-gray-500">No geographic data yet.</p>}
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] p-6 rounded-2xl shadow-sm overflow-hidden">
          <h3 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-brand-gold" />
            Live Activity Stream
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="border-b border-gray-100 dark:border-[#222] pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-navy dark:text-white">
                    {activity.activityType} on {activity.entityType}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 pl-4 flex gap-3">
                  <span>{(activity.metadata as any)?.country || 'Unknown'}</span>
                  <span>•</span>
                  <span>{(activity.metadata as any)?.device || 'Desktop'}</span>
                  <span>•</span>
                  <span>{new Date(activity.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
