import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { User, Mail, Globe, MapPin, GraduationCap, ArrowLeft, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import StudentCRMUpdater from "@/components/admin/StudentCRMUpdater";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import { getTranslations } from "next-intl/server";

const prisma = new PrismaClient();

export default async function StudentDetailPage({ 
  params: { id, locale } 
}: { 
  params: { id: string; locale: string } 
}) {
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      applications: {
        include: { program: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!student) notFound();
  
  const t = await getTranslations("admin.students");
  const tCommon = await getTranslations("admin.common");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href={`/${locale}/admin/students`}
          className="p-2 bg-[#111] border border-[#222] rounded-lg hover:bg-[#222] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#EDEDED]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">{t("studentProfile") || "Student Profile"}</h1>
          <p className="text-sm text-[#888] mt-1">{t("manageDetails") || "Manage CRM details and application history."}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-[#111] border border-[#222] overflow-hidden relative shrink-0">
                {student.image ? (
                  <ImageWithFallback src={student.image} alt={student.name || "Student"} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#333] font-bold">
                    {student.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#EDEDED]">
                  {student.name ? `${student.name} ${student.surname || ''}` : "Unknown Student"}
                </h2>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-[#888]">
                    <Mail className="w-4 h-4 text-brand-gold" />
                    <a href={`mailto:${student.email}`} className="hover:text-[#EDEDED]">{student.email}</a>
                  </div>
                  {(student.city || student.country) && (
                    <div className="flex items-center gap-2 text-sm text-[#888]">
                      <MapPin className="w-4 h-4 text-brand-gold" />
                      {student.city && `${student.city}, `}{student.country}
                    </div>
                  )}
                  {student.educationPlace && (
                    <div className="flex items-center gap-2 text-sm text-[#888]">
                      <GraduationCap className="w-4 h-4 text-brand-gold" />
                      {student.educationPlace}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-gold" />
              {t("appHistory") || "Application History"}
            </h2>
            
            <div className="space-y-4">
              {student.applications.length === 0 ? (
                <div className="text-center p-8 bg-[#111] rounded-lg border border-[#222]">
                  <p className="text-[#888] text-sm">No applications submitted yet.</p>
                </div>
              ) : (
                student.applications.map((app) => (
                  <div key={app.id} className="bg-[#111] border border-[#222] rounded-lg p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#EDEDED]">{app.program.title}</h3>
                      <div className="text-xs text-[#888] flex items-center gap-2 mt-1">
                        <Globe className="w-3 h-3" /> {app.program.country}
                        <span className="text-[#333]">•</span>
                        <Clock className="w-3 h-3" /> {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        app.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-500' :
                        app.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {app.status}
                      </span>
                      <Link href={`/${locale}/admin/applications/${app.id}`} className="text-[10px] text-brand-gold hover:underline">
                        View Application
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4">CRM Management</h2>
            
            <div className="mb-6">
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-[#222] text-[#888] border border-[#333]">
                {student.crmStatus || 'REGISTERED'}
              </span>
            </div>

            <StudentCRMUpdater 
              studentId={student.id} 
              currentStatus={student.crmStatus || 'REGISTERED'} 
              initialNotes={student.internalNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
