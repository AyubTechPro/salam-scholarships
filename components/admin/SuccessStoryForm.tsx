"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Loader2 } from "lucide-react";
import ImageWithFallback from "@/components/common/ImageWithFallback";
import { uploadImageAction } from "@/app/actions/upload";

export default function SuccessStoryForm({ 
  initialData, 
  locale 
}: { 
  initialData?: any; 
  locale: string; 
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await uploadImageAction(formData);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-[#111] p-6 rounded-xl border border-gray-200 dark:border-[#333]">
      <div className="space-y-2">
        <label className="text-sm font-medium text-navy dark:text-gray-200">Student Name</label>
        <input 
          required
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-lg px-4 py-2 text-navy dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-navy dark:text-gray-200">Achievement (e.g. Fully Funded at Harvard)</label>
        <input 
          required
          type="text" 
          value={formData.achievement}
          onChange={(e) => setFormData(prev => ({ ...prev, achievement: e.target.value }))}
          className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-lg px-4 py-2 text-navy dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-navy dark:text-gray-200">Quote</label>
        <textarea 
          required
          rows={4}
          value={formData.quote}
          onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
          className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-lg px-4 py-2 text-navy dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-navy dark:text-gray-200">Student Photo</label>
        {formData.photoUrl ? (
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-[#333]">
            <ImageWithFallback src={formData.photoUrl} alt="Preview" fill className="object-cover" />
            <button 
              type="button" 
              onClick={() => setFormData(prev => ({ ...prev, photoUrl: "" }))}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 dark:border-[#333] rounded-lg hover:border-brand-gold transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50 dark:bg-[#0A0A0A]">
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 font-medium">Upload Image</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="w-4 h-4 accent-brand-gold"
          />
          <span className="text-sm font-medium text-navy dark:text-gray-200">Visible on Homepage</span>
        </label>
      </div>

      <div className="pt-4 flex gap-4">
        <button 
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222]"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-2 rounded-lg font-medium bg-brand-gold text-navy hover:bg-brand-gold/90 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Story"}
        </button>
      </div>
    </form>
  );
}
