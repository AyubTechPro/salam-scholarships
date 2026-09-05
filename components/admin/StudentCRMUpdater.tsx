"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudentCRMStatus } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

import { useTranslations } from "next-intl";

export default function StudentCRMUpdater({ 
  studentId, 
  currentStatus,
  initialNotes 
}: { 
  studentId: string;
  currentStatus: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const t = useTranslations("admin.details");
  const tCommon = useTranslations("admin.common");
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(initialNotes || "");

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateStudentCRMStatus(studentId, status, notes);
      router.refresh();
      alert("Student CRM updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update student CRM.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">CRM Ҳолат</label>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="REGISTERED">Ба қайд гирифта шудааст</option>
          <option value="ACTIVE_APPLICANT">Дархосткунандаи Фаъол</option>
          <option value="ALUMNI">Хатмкарда</option>
          <option value="INACTIVE">Ғайрифаъол</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{t("internalNotes")}</label>
        <textarea 
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <button 
        onClick={handleUpdate}
        disabled={isUpdating || (status === currentStatus && notes === (initialNotes || ""))}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
        {isUpdating ? tCommon("saving") : t("saveUpdates")}
      </button>
    </div>
  );
}
