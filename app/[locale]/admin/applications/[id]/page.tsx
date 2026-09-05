import { PrismaClient, ApplicationStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { User, FileText, Globe, Mail, Phone, Calendar, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import ApplicationStatusUpdater from "@/components/admin/ApplicationStatusUpdater";
import { getTranslations } from "next-intl/server";

const prisma = new PrismaClient();

export default async function ApplicationDetailPage({ 
  params: { id, locale } 
}: { 
  params: { id: string; locale: string } 
}) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: true,
      program: true,
    }
  });

  if (!application) notFound();

  const t = await getTranslations("admin.applications");
  const tDetails = await getTranslations("admin.details");
  const tCommon = await getTranslations("admin.common");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href={`/${locale}/admin/applications`}
          className="p-2 bg-[#111] border border-[#222] rounded-lg hover:bg-[#222] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#EDEDED]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Application Details</h1>
          <p className="text-sm text-[#888] mt-1">Review and update application status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant Info & Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-gold" />
              {tDetails("applicantInfo")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#888] mb-1">ФИО</p>
                <p className="text-sm text-[#EDEDED] font-medium">{application.user.name} {application.user.surname}</p>
              </div>
              <div>
                <p className="text-xs text-[#888] mb-1">Почта</p>
                <p className="text-sm text-[#EDEDED] font-medium">{application.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#888] mb-1">Телефон</p>
                <p className="text-sm text-[#EDEDED] font-medium">{application.user.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs text-[#888] mb-1">Сана</p>
                <p className="text-sm text-[#EDEDED] font-medium">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-gold" />
              Documents & Motivation
            </h2>
            
            <div className="space-y-4">
              {application.motivationLetter && (
                <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
                  <p className="text-xs text-[#888] mb-2 font-medium">Motivation Letter</p>
                  <p className="text-sm text-[#EDEDED] whitespace-pre-wrap">{application.motivationLetter}</p>
                  
                  {application.motivationScore !== null && (
                    <div className="mt-4 pt-4 border-t border-[#333] flex items-center gap-2">
                      <span className="text-xs text-[#888]">AI Score:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        application.motivationScore >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
                        application.motivationScore >= 60 ? 'bg-amber-500/20 text-amber-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {application.motivationScore}/100
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {application.cvUrl && (
                  <a href={application.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#111] hover:bg-[#222] border border-[#222] rounded-lg transition-colors">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-[#EDEDED]">Resume / CV</span>
                  </a>
                )}
                {application.transcriptUrl && (
                  <a href={application.transcriptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#111] hover:bg-[#222] border border-[#222] rounded-lg transition-colors">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-[#EDEDED]">Transcript</span>
                  </a>
                )}
                {application.passportUrl && (
                  <a href={application.passportUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#111] hover:bg-[#222] border border-[#222] rounded-lg transition-colors">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-[#EDEDED]">Passport</span>
                  </a>
                )}
                {application.receiptUrl && (
                  <a href={application.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#111] hover:bg-[#222] border border-[#222] rounded-lg transition-colors">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium text-[#EDEDED]">Payment Receipt</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Program */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4">{tDetails("applicationStatus")}</h2>
            
            <div className="mb-6 flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                application.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                application.status === 'REJECTED' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                'bg-amber-500/20 text-amber-500 border border-amber-500/30'
              }`}>
                {application.status}
              </span>
            </div>

            <ApplicationStatusUpdater 
              applicationId={application.id} 
              currentStatus={application.status} 
              paymentStatus={application.paymentStatus}
            />
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-gold" />
              Target Program
            </h2>
            <div className="space-y-3">
              <div className="font-medium text-[#EDEDED]">{application.program.title}</div>
              <div className="flex justify-between text-xs text-[#888] border-b border-[#222] pb-2">
                <span>Кишвар</span>
                <span className="text-[#EDEDED]">{application.program.country}</span>
              </div>
              <div className="flex justify-between text-xs text-[#888] border-b border-[#222] pb-2">
                <span>Категория</span>
                <span className="text-[#EDEDED]">{application.program.category}</span>
              </div>
              <div className="flex justify-between text-xs text-[#888]">
                <span>Маблағгузорӣ</span>
                <span className="text-[#EDEDED]">{application.program.fundingType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
