"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsultationStatus } from "@prisma/client";
import { updateConsultationStatus } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

export default function ConsultationUpdater({ 
  consultationId, 
  currentStatus,
  initialNotes 
}: { 
  consultationId: string;
  currentStatus: ConsultationStatus;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<ConsultationStatus>(currentStatus);
  const [notes, setNotes] = useState(initialNotes || "");

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateConsultationStatus(consultationId, status, notes);
      router.refresh();
      alert("Consultation updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update consultation.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-[#222]">
      <div>
        <label className="block text-xs font-medium text-[#888] mb-1">CRM Status</label>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value as ConsultationStatus)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-brand-gold"
        >
          <option value="NEW">New Lead</option>
          <option value="CONTACTED">Contacted</option>
          <option value="SUCCESS">Success (Converted)</option>
          <option value="REJECTED">Rejected (Lost)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#888] mb-1">Internal Notes (Not visible to user)</label>
        <textarea 
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this lead..."
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-brand-gold"
        />
      </div>

      <button 
        onClick={handleUpdate}
        disabled={isUpdating || (status === currentStatus && notes === (initialNotes || ""))}
        className="w-full py-2 bg-brand-gold text-navy font-bold rounded-lg hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Updates
      </button>
    </div>
  );
}
