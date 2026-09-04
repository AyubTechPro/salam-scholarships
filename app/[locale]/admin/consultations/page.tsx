import { PrismaClient } from "@prisma/client";
import { Mail, Phone, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function ConsultationsPage() {
  const consultations = await prisma.consultationRequest.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Consultation Requests</h1>
          <p className="text-sm text-[#888] mt-1">Manage leads and incoming student inquiries.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {consultations.length === 0 ? (
          <div className="text-center p-12 bg-[#0A0A0A] rounded-xl border border-[#222]">
            <p className="text-[#666] text-sm">No consultation requests found.</p>
          </div>
        ) : (
          consultations.map((req) => (
            <div key={req.id} className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6 hover:bg-[#111] transition-colors flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{req.name}</h3>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={req.status} />
                    <Link href={`/${locale}/admin/consultations/${req.id}`} className="text-xs text-brand-gold hover:underline">View Details</Link>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-xs text-[#888]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#EDEDED]" />
                    <a href={`mailto:${req.email}`} className="hover:text-[#EDEDED] transition-colors">{req.email}</a>
                  </div>
                  {req.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#EDEDED]" />
                      <a href={`tel:${req.phone}`} className="hover:text-[#EDEDED] transition-colors">{req.phone}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#EDEDED]" />
                    {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#111] p-4 rounded-md border border-[#222]">
                  <p className="text-[#EDEDED] text-sm">&quot;{req.message}&quot;</p>
                  {(req.targetCountry || req.englishLevel) && (
                    <div className="mt-3 pt-3 border-t border-[#222] flex gap-4 text-[10px] text-[#666]">
                      {req.targetCountry && <span>Target Country: <strong className="text-[#EDEDED]">{req.targetCountry}</strong></span>}
                      {req.englishLevel && <span>English Level: <strong className="text-[#EDEDED]">{req.englishLevel}</strong></span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-48 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-[#222] pt-4 md:pt-0 md:pl-6">
                <p className="text-[10px] text-[#666] font-mono mb-1 uppercase tracking-wider">Update Status</p>
                <form action={async () => {
                  "use server"
                  await prisma.consultationRequest.update({ where: { id: req.id }, data: { status: "CONTACTED" } });
                  revalidatePath('/[locale]/admin/consultations', 'page');
                }}>
                  <button className="w-full text-left px-3 py-1.5 text-xs text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded transition-colors border border-transparent hover:border-[#333]">Mark as Contacted</button>
                </form>
                <form action={async () => {
                  "use server"
                  await prisma.consultationRequest.update({ where: { id: req.id }, data: { status: "SUCCESS" } });
                  revalidatePath('/[locale]/admin/consultations', 'page');
                }}>
                  <button className="w-full text-left px-3 py-1.5 text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors border border-transparent hover:border-emerald-500/20">Mark as Success</button>
                </form>
                <form action={async () => {
                  "use server"
                  await prisma.consultationRequest.update({ where: { id: req.id }, data: { status: "REJECTED" } });
                  revalidatePath('/[locale]/admin/consultations', 'page');
                }}>
                  <button className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors border border-transparent hover:border-red-500/20">Mark as Rejected</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "NEW":
      return <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded text-[10px] font-medium flex items-center w-max gap-1"><Clock className="w-3 h-3"/> New</span>;
    case "CONTACTED":
      return <span className="px-2 py-0.5 bg-[#222] text-[#888] border border-[#333] rounded text-[10px] font-medium flex items-center w-max gap-1">Contacted</span>;
    case "SUCCESS":
      return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[10px] font-medium flex items-center w-max gap-1"><CheckCircle2 className="w-3 h-3"/> Success</span>;
    case "REJECTED":
      return <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[10px] font-medium flex items-center w-max gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
    default:
      return <span className="px-2 py-0.5 bg-[#222] text-[#888] border border-[#333] rounded text-[10px] font-medium flex items-center w-max gap-1">{status}</span>;
  }
}
