"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { updateSiteStats } from "@/app/actions/settings";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SiteStatsForm({ initialStats, locale }: { initialStats: any, locale: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateSiteStats(formData, locale);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
        <h2 className="text-sm font-medium text-[#EDEDED] mb-1">Homepage Stats (Trust Bar)</h2>
        <p className="text-xs text-[#888] mb-6">
          These numbers appear on the homepage. They are added to the real database counts.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#EDEDED]">Extra Opportunities / Programs</label>
            <input 
              name="manualProgramsOffset" 
              type="number" 
              defaultValue={initialStats?.manualProgramsOffset || 0}
              className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-[#666] transition-colors" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#EDEDED]">Extra Countries</label>
            <input 
              name="manualCountriesOffset" 
              type="number" 
              defaultValue={initialStats?.manualCountriesOffset || 0}
              className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-[#666] transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#EDEDED]">Base Consultations Count</label>
            <input 
              name="manualConsultationsBase" 
              type="number" 
              defaultValue={initialStats?.manualConsultationsBase || 2000}
              className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-[#666] transition-colors" 
            />
          </div>

          <div className="space-y-2 flex items-center gap-3 pt-6">
            <input 
              type="checkbox" 
              name="showLiveCounts" 
              id="showLiveCounts" 
              defaultChecked={initialStats?.showLiveCounts ?? true}
              className="w-4 h-4 rounded border-[#333] bg-[#111] text-[#EDEDED]" 
            />
            <label htmlFor="showLiveCounts" className="text-xs font-medium text-[#EDEDED]">Add Live Database Counts</label>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#EDEDED] hover:bg-white text-[#0A0A0A] px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </div>
    </form>
  );
}
