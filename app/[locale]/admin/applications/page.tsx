import { PrismaClient } from "@prisma/client";
import { User, Eye, Globe, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const prisma = new PrismaClient();

export default async function ApplicationsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations("admin.applications");
  
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, surname: true, email: true, phone: true }
      },
      program: {
        select: { title: true, country: true }
      }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">{t("title")}</h1>
          <p className="text-sm text-[#888] mt-1">{t("description")}</p>
        </div>
      </div>

      <div className="border border-[#222] rounded-xl overflow-hidden bg-[#0A0A0A]">
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="text-xs text-[#888]">
            <span className="text-[#EDEDED] font-medium">{applications.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#222] bg-[#111]">
                <th className="px-5 py-3 text-xs font-medium text-[#888]">{t("tableApplicant")}</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888]">{t("tableProgram")}</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888]">{t("tableStatus")}</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888] text-right">{t("tableDate")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[#666] text-sm">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-[#111] transition-colors group">
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-[#888]">
                            {app.user.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-[#EDEDED] text-sm mb-0.5">{app.user.name} {app.user.surname}</div>
                          <div className="text-[10px] text-[#666] flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {app.user.email}
                          </div>
                          {app.user.phone && (
                            <div className="text-[10px] text-[#666] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {app.user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-[#EDEDED] text-sm mb-1">{app.program.title}</div>
                      <div className="flex items-center gap-1 text-[10px] text-[#666]">
                        <Globe className="w-3 h-3 text-[#888]" /> {app.program.country}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#222] text-[#888] border border-[#333]">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <div className="text-[10px] text-[#666] flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/${locale}/admin/applications/${app.id}`} className="inline-flex items-center gap-1 px-2 py-1 bg-[#111] hover:bg-[#222] text-[#EDEDED] text-[10px] rounded transition-colors border border-[#333]">
                          <Eye className="w-3 h-3" /> {t("viewDetails")}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
