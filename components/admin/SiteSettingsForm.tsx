"use client";

import { useState } from "react";
import { updateSiteSettings } from "@/app/actions/admin";
import { Save, Loader2, Globe, Settings, Paintbrush, Bell } from "lucide-react";
import { toast } from "sonner";

export default function SiteSettingsForm({ initialSettings, locale }: { initialSettings: any, locale: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await updateSiteSettings(formData, locale);
      toast.success("Site settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update site settings");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          General Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Site Name</label>
            <input required name="siteName" defaultValue={initialSettings?.siteName || "Salam Scholarships"} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Support Email</label>
            <input name="supportEmail" defaultValue={initialSettings?.supportEmail || ""} type="email" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          System Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Maintenance Mode</label>
            <div className="flex items-center h-[42px] px-4 bg-black/40 border border-white/10 rounded-lg">
              <input type="checkbox" name="maintenanceMode" id="maintenanceMode" defaultChecked={initialSettings?.maintenanceMode} className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500" />
              <label htmlFor="maintenanceMode" className="ml-3 text-gray-300 cursor-pointer">Enable Maintenance Mode</label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4 flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-pink-400" />
          Branding & UI
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Primary Color (Hex)</label>
            <input name="primaryColor" defaultValue={initialSettings?.primaryColor || "#0a192f"} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Hero Ticker Text (Optional)</label>
            <input name="heroTickerText" defaultValue={initialSettings?.heroTickerText || ""} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 🚨 New Scholarships Available!" />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          Integrations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Telegram Bot Token</label>
            <input name="telegramBotToken" defaultValue={initialSettings?.telegramBotToken || ""} type="password" placeholder="bot token..." className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSubmitting ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
