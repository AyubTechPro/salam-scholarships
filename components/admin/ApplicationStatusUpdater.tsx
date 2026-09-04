"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStatus } from "@prisma/client";
import { updateApplicationStatus } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

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
    <div className="space-y-4 pt-4 border-t border-[#222]">
      <div>
        <label className="block text-xs font-medium text-[#888] mb-1">Application Status</label>
        <select 
          value={appStatus}
          onChange={(e) => setAppStatus(e.target.value as ApplicationStatus)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-brand-gold"
        >
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#888] mb-1">Payment Status</label>
        <select 
          value={payStatus}
          onChange={(e) => setPayStatus(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-brand-gold"
        >
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected (Invalid Receipt)</option>
          <option value="WAIVED">Waived (Scholarship)</option>
        </select>
      </div>

      <button 
        onClick={handleUpdate}
        disabled={isUpdating || (appStatus === currentStatus && payStatus === paymentStatus)}
        className="w-full py-2 bg-brand-gold text-navy font-bold rounded-lg hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
        Update Status
      </button>
    </div>
  );
}
