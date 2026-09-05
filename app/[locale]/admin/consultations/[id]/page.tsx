import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { User, Globe, Mail, Phone, ArrowLeft, MessageSquare, BookOpen } from "lucide-react";
import Link from "next/link";
import ConsultationUpdater from "@/components/admin/ConsultationUpdater";
import { getTranslations } from "next-intl/server";

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

  const t = await getTranslations("admin.consultations");
  const tDetails = await getTranslations("admin.details");
  const tForms = await getTranslations("admin.forms");
  const tCommon = await getTranslations("admin.common");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href={`/${locale}/admin/consultations`}
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 backdrop-blur-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t("title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
              <User className="w-5 h-5 text-blue-400" />
              {tDetails("applicantInfo")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">ФИО</p>
                <p className="text-sm text-white font-medium">{consultation.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Почта</p>
                <a href={`mailto:${consultation.email}`} className="text-sm text-blue-400 hover:underline font-medium">{consultation.email}</a>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Телефон</p>
                {consultation.phone ? (
                  <a href={`tel:${consultation.phone}`} className="text-sm text-blue-400 hover:underline font-medium">{consultation.phone}</a>
                ) : (
                  <p className="text-sm text-gray-500">{tCommon("noData")}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Сана</p>
                <p className="text-sm text-white font-medium">
                  {new Date(consultation.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Паём / Дархост
            </h2>
            
            <div className="bg-black/40 p-5 rounded-xl border border-white/10 mt-2">
              <p className="text-sm text-white whitespace-pre-wrap">{consultation.message}</p>
            </div>
          </div>

          {(consultation.targetCountry || consultation.targetLevel || consultation.englishLevel) && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                <BookOpen className="w-5 h-5 text-pink-400" />
                Манфиатҳои Академикӣ
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {consultation.targetCountry && (
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Кишвари Интихобшуда</p>
                    <p className="text-sm text-white font-medium">{consultation.targetCountry}</p>
                  </div>
                )}
                {consultation.targetLevel && (
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Сатҳи Интихобшуда</p>
                    <p className="text-sm text-white font-medium">{consultation.targetLevel}</p>
                  </div>
                )}
                {consultation.englishLevel && (
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Сатҳи Забони Англисӣ</p>
                    <p className="text-sm text-white font-medium">{consultation.englishLevel}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-4">CRM Менеҷмент</h2>
            
            <div className="mb-6 flex items-center gap-3 pt-2">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                consultation.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' :
                consultation.status === 'REJECTED' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                consultation.status === 'CONTACTED' ? 'bg-white/10 text-gray-300 border border-white/20' :
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
