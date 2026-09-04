import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { User, Globe, Mail, Phone, ArrowLeft, MessageSquare, BookOpen } from "lucide-react";
import Link from "next/link";
import ConsultationUpdater from "@/components/admin/ConsultationUpdater";

const prisma = new PrismaClient();

export default async function ConsultationDetailPage({ 
  params: { id, locale } 
}: { 
  params: { id: string; locale: string } 
}) {
  const consultation = await prisma.consultationRequest.findUnique({
    where: { id },
  });

  if (!consultation) notFound();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href={`/${locale}/admin/consultations`}
          className="p-2 bg-[#111] border border-[#222] rounded-lg hover:bg-[#222] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#EDEDED]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Lead Details</h1>
          <p className="text-sm text-[#888] mt-1">Review inquiry and manage CRM status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-gold" />
              Lead Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#888] mb-1">Full Name</p>
                <p className="text-sm text-[#EDEDED] font-medium">{consultation.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#888] mb-1">Email</p>
                <a href={`mailto:${consultation.email}`} className="text-sm text-brand-gold hover:underline font-medium">{consultation.email}</a>
              </div>
              <div>
                <p className="text-xs text-[#888] mb-1">Phone</p>
                {consultation.phone ? (
                  <a href={`tel:${consultation.phone}`} className="text-sm text-brand-gold hover:underline font-medium">{consultation.phone}</a>
                ) : (
                  <p className="text-sm text-[#888]">Not provided</p>
                )}
              </div>
              <div>
                <p className="text-xs text-[#888] mb-1">Submitted</p>
                <p className="text-sm text-[#EDEDED] font-medium">
                  {new Date(consultation.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-gold" />
              Inquiry Message
            </h2>
            
            <div className="bg-[#111] p-5 rounded-lg border border-[#222]">
              <p className="text-sm text-[#EDEDED] whitespace-pre-wrap">{consultation.message}</p>
            </div>
          </div>

          {(consultation.targetCountry || consultation.targetLevel || consultation.englishLevel) && (
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#EDEDED] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-gold" />
                Academic Interests
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {consultation.targetCountry && (
                  <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
                    <p className="text-xs text-[#888] mb-1">Target Country</p>
                    <p className="text-sm text-[#EDEDED] font-medium">{consultation.targetCountry}</p>
                  </div>
                )}
                {consultation.targetLevel && (
                  <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
                    <p className="text-xs text-[#888] mb-1">Target Level</p>
                    <p className="text-sm text-[#EDEDED] font-medium">{consultation.targetLevel}</p>
                  </div>
                )}
                {consultation.englishLevel && (
                  <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
                    <p className="text-xs text-[#888] mb-1">English Level</p>
                    <p className="text-sm text-[#EDEDED] font-medium">{consultation.englishLevel}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
            <h2 className="text-lg font-bold text-[#EDEDED] mb-4">CRM Management</h2>
            
            <div className="mb-6 flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                consultation.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                consultation.status === 'REJECTED' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                consultation.status === 'CONTACTED' ? 'bg-[#222] text-[#888] border border-[#333]' :
                'bg-blue-500/20 text-blue-500 border border-blue-500/30'
              }`}>
                {consultation.status}
              </span>
            </div>

            <ConsultationUpdater 
              consultationId={consultation.id} 
              currentStatus={consultation.status} 
              initialNotes={consultation.internalNotes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
