"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStatus } from "@prisma/client";
import { updateApplicationStatus } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

import { useTranslations } from "next-intl";

export default function ApplicationStatusUpdater({ 
  applicationId, 
  currentStatus,
  paymentStatus 
}: { 
  applicationId: string;
  currentStatus: ApplicationStatus;
  paymentStatus: string;
}) {
  const router = useRouter();
  const tDetails = useTranslations("admin.details");
  const tCommon = useTranslations("admin.common");
  const [isUpdating, setIsUpdating] = useState(false);
  const [appStatus, setAppStatus] = useState<ApplicationStatus>(currentStatus);
  const [payStatus, setPayStatus] = useState<string>(paymentStatus);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApplicationStatus(applicationId, appStatus, payStatus);
      router.refresh();
      alert("Application status updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">{tDetails("applicationStatus")}</label>
        <select 
          value={appStatus}
          onChange={(e) => setAppStatus(e.target.value as ApplicationStatus)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="DRAFT">Сиёҳнавис (Draft)</option>
          <option value="SUBMITTED">Супорида шуд (Submitted)</option>
          <option value="UNDER_REVIEW">Дар ҳоли баррасӣ (Review)</option>
          <option value="ACCEPTED">Қабул шуд (Accepted)</option>
          <option value="REJECTED">Рад шуд (Rejected)</option>
          <option value="WAITLISTED">Дар навбат (Waitlisted)</option>
          <option value="WITHDRAWN">Бозпас гирифта шуд (Withdrawn)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">Ҳолати Пардохт</label>
        <select 
          value={payStatus}
          onChange={(e) => setPayStatus(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="PENDING">Дар интизор (Pending)</option>
          <option value="VERIFIED">Тасдиқ шуд (Verified)</option>
          <option value="REJECTED">Рад шуд (Расид хатост)</option>
          <option value="WAIVED">Озод карда шуд (Стипендия)</option>
        </select>
      </div>

      <button 
        onClick={handleUpdate}
        disabled={isUpdating || (appStatus === currentStatus && payStatus === paymentStatus)}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
        {isUpdating ? tCommon("saving") : tDetails("updateStatus")}
      </button>
    </div>
  );
}
