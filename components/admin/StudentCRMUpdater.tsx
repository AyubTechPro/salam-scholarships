"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudentCRMStatus } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

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
    <div className="space-y-4 pt-4 border-t border-[#222]">
      <div>
        <label className="block text-xs font-medium text-[#888] mb-1">CRM Status</label>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-brand-gold"
        >
          <option value="REGISTERED">Registered</option>
          <option value="ACTIVE_APPLICANT">Active Applicant</option>
          <option value="ALUMNI">Alumni</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#888] mb-1">Internal Notes</label>
        <textarea 
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this student..."
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-brand-gold"
        />
      </div>

      <button 
        onClick={handleUpdate}
        disabled={isUpdating || (status === currentStatus && notes === (initialNotes || ""))}
        className="w-full py-2 bg-brand-gold text-navy font-bold rounded-lg hover:bg-brand-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
        Save CRM Profile
      </button>
    </div>
  );
}
