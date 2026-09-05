"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X, Loader2, Save } from "lucide-react";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import { uploadImageAction } from "@/app/actions/upload";
import { useTranslations } from "next-intl";

export default function SuccessStoryForm({ 
  initialData, 
  locale 
}: { 
  initialData?: any; 
  locale: string; 
}) {
  const router = useRouter();
  const t = useTranslations("admin.forms");
  const tCommon = useTranslations("admin.common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    achievement: initialData?.achievement || "",
    quote: initialData?.quote || "",
    photoUrl: initialData?.photoUrl || "",
    isActive: initialData ? initialData.isActive : true,
    order: initialData?.order || 0,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const data = new FormData();
      data.append("file", file);
      
      const res = await uploadImageAction(data);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, photoUrl: res.url }));
      } else {
        throw new Error(res.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = initialData 
        ? `/api/admin/success-stories/${initialData.id}` 
        : `/api/admin/success-stories`;
      
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");

      router.push(`/${locale}/admin/success-stories`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">{t("basicInfo")}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("studentName")}</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">{t("achievement")}</label>
            <input 
              required
              type="text" 
              value={formData.achievement}
              onChange={(e) => setFormData(prev => ({ ...prev, achievement: e.target.value }))}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-300">{t("quote")}</label>
            <textarea 
              required
              rows={4}
              value={formData.quote}
              onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
        <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">{t("mediaLinks")}</h2>
        
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-300">{t("storyImage")}</label>
          
          {formData.photoUrl ? (
            <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-white/10 group">
              <ImageWithFallback src={formData.photoUrl} alt="Preview" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  {tCommon("uploadImage")}
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-48 h-48 border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl bg-black/20 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">{tCommon("uploadImage")}</span>
                </div>
              )}
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <input 
            type="checkbox" 
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-gray-300">{t("isActive")}</label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button 
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl font-medium text-gray-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
        >
          {tCommon("cancel")}
        </button>
        <button 
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSubmitting ? tCommon("saving") : (initialData ? t("updateStory") : t("publishStory"))}
        </button>
      </div>
    </form>
  );
}
