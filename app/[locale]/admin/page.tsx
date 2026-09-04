import { PrismaClient } from "@prisma/client";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ImageWithFallback from "@/components/common/ImageWithFallback";

const prisma = new PrismaClient();

async function getDashboardStats() {
  const [
    totalStudents,
    newConsultations,
    totalApplications,
    activePrograms,
    recentApplications
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.consultationRequest.count({ where: { status: "NEW" } }),
    prisma.application.count(),
    prisma.program.count({ where: { isActive: true } }),
    prisma.application.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, surname: true, email: true, image: true } },
        program: { select: { title: true } }
      }
    })
  ]);

  return {
    totalStudents,
    newConsultations,
    totalApplications,
    activePrograms,
    recentApplications
  };
}

export default async function AdminDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Overview</h1>
        <p className="text-sm text-[#888] mt-1">Metrics and recent activity across your platform.</p>
      </div>

      {/* KPI Strips - Linear Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Students" 
          value={stats.totalStudents} 
          icon={<Users className="w-4 h-4 text-[#888]" />} 
          trend="+12%"
        />
        <StatCard 
          title="New Consultations" 
          value={stats.newConsultations} 
          icon={<MessageSquare className="w-4 h-4 text-[#888]" />} 
          trend="Requires action"
          urgent={stats.newConsultations > 0}
        />
        <StatCard 
          title="Total Applications" 
          value={stats.totalApplications} 
          icon={<FileText className="w-4 h-4 text-[#888]" />} 
          trend="+5%"
        />
        <StatCard 
          title="Active Programs" 
          value={stats.activePrograms} 
          icon={<GraduationCap className="w-4 h-4 text-[#888]" />} 
          trend="Stable"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Data Table */}
        <div className="lg:col-span-2 border border-[#222] rounded-xl overflow-hidden bg-[#0A0A0A]">
          <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
            <h2 className="text-sm font-medium text-[#EDEDED]">Recent Applications</h2>
            <Link href={`/${locale}/admin/applications`} className="text-xs text-[#888] hover:text-[#EDEDED] transition-colors">
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#222]">
                  <th className="px-5 py-3 text-xs font-medium text-[#888]">Applicant</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#888]">Program</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#888]">Status</th>
                  <th className="px-5 py-3 text-xs font-medium text-[#888] text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {stats.recentApplications.length > 0 ? (
                  stats.recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-[#111] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center overflow-hidden border border-[#333] relative">
                            {app.user.image ? (
                              <ImageWithFallback src={app.user.image} alt={app.user.name || "User"} fill className="object-cover" />
                            ) : (
                              <span className="text-[10px] font-medium text-[#888]">
                                {app.user.name?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#EDEDED]">{app.user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#888] truncate max-w-[200px]">
                        {app.program.title}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#222] text-[#888] border border-[#333]">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-[#666]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-[#666]">
                      No recent applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions (Keyboard-first feel) */}
        <div className="border border-[#222] rounded-xl overflow-hidden bg-[#0A0A0A] h-max">
          <div className="px-5 py-4 border-b border-[#222] bg-[#111]">
            <h2 className="text-sm font-medium text-[#EDEDED]">Quick Actions</h2>
          </div>
          <div className="p-2 space-y-1">
            <QuickActionButton 
              title="Add New Program" 
              shortcut="⌘ P"
              icon={<GraduationCap className="w-4 h-4 text-[#888]" />} 
              href={`/${locale}/admin/programs/new`}
            />
            <QuickActionButton 
              title="Review Consultations" 
              shortcut="⌘ C"
              icon={<MessageSquare className="w-4 h-4 text-[#888]" />} 
              href={`/${locale}/admin/consultations`}
            />
            <QuickActionButton 
              title="Success Stories" 
              shortcut="⌘ S"
              icon={<TrendingUp className="w-4 h-4 text-[#888]" />} 
              href={`/${locale}/admin/success-stories`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, urgent = false }: { title: string, value: number, icon: React.ReactNode, trend: string, urgent?: boolean }) {
  return (
    <div className="border border-[#222] rounded-xl p-5 bg-[#0A0A0A] relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-[#888]">{title}</p>
        <div className="p-1.5 bg-[#111] rounded-md border border-[#222]">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <h3 className="text-2xl font-bold tracking-tight text-[#EDEDED]">{value}</h3>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${urgent ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-[#222] text-[#888] border border-[#333]'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function QuickActionButton({ title, shortcut, icon, href }: { title: string, shortcut: string, icon: React.ReactNode, href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#111] transition-colors group">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-[#EDEDED] group-hover:text-white">{title}</span>
      </div>
      <div className="text-[10px] font-mono text-[#666] bg-[#111] px-1.5 py-0.5 rounded border border-[#222] group-hover:border-[#444]">
        {shortcut}
      </div>
    </Link>
  );
}
