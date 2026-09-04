"use client";

import { useState, useRef } from "react";
import { createHeroSlide, updateHeroSlide } from "@/app/actions/admin";
import { uploadImageAction } from "@/app/actions/upload";
import { Save, ArrowLeft, Loader2, Image as ImageIcon, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageWithFallback from "@/components/common/ImageWithFallback";

export default function HeroSlideForm({ locale, initialData }: { locale: string, initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const result = await uploadImageAction(formData);
      if (result.success) {
        setImageUrl(result.url);
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("imageUrl", imageUrl); // Use the state URL

      if (initialData) {
        await updateHeroSlide(initialData.id, formData, locale);
      } else {
        await createHeroSlide(formData, locale);
      }
    } catch (error) {
      console.error(error);
      alert(initialData ? "Failed to update slide" : "Failed to create slide");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/${locale}/admin/hero-slider`}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">{initialData ? "Edit Slide" : "Add New Slide"}</h1>
          <p className="text-gray-400 mt-1">{initialData ? "Update existing homepage banner." : "Create a new banner for the homepage slider."}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Content</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-300">Title *</label>
              <input required name="title" defaultValue={initialData?.title} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Study in Europe" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-300">Subtitle *</label>
              <textarea required name="subtitle" defaultValue={initialData?.subtitle} rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Short description..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Button Text *</label>
              <input required name="buttonText" defaultValue={initialData?.buttonText} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Explore Opportunities" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Button Link *</label>
              <input required name="buttonLink" defaultValue={initialData?.buttonLink} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. /en/opportunities" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Media</h2>
          
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-300">Slide Background Image</label>
            
            {imageUrl ? (
              <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 group">
                <ImageWithFallback src={imageUrl} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl bg-black/20 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-sm">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <UploadCloud className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs opacity-60">PNG, JPG up to 5MB</span>
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
            
            <div className="text-xs text-gray-500 mt-2">
              Alternatively, you can paste an external URL below:
            </div>
            <input 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              type="url" 
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" 
              placeholder="https://..." 
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <input type="checkbox" name="isActive" id="isActive" className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500" defaultChecked={initialData ? initialData.isActive : true} />
            <label htmlFor="isActive" className="text-gray-300">Active (Show on homepage)</label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSubmitting ? "Saving..." : (initialData ? "Update Slide" : "Publish Slide")}
          </button>
        </div>
      </form>
    </div>
  );
}
