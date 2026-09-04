"use client";

import { useState } from "react";
import { createProgram, updateProgram } from "@/app/actions/admin";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProgramForm({ locale, initialData }: { locale: string, initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (initialData) {
        await updateProgram(initialData.id, formData, locale);
      } else {
        await createProgram(formData, locale);
      }
    } catch (error) {
      console.error(error);
      alert(initialData ? "Failed to update program" : "Failed to create program");
      setIsSubmitting(false);
    }
  }

  // Helper to format date for datetime-local input
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/${locale}/admin/programs`}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">{initialData ? "Edit Program" : "Add New Program"}</h1>
          <p className="text-gray-400 mt-1">{initialData ? "Update existing opportunity." : "Publish a new opportunity for students."}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Program Title *</label>
              <input required name="title" defaultValue={initialData?.title} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Oxford Clarendon Scholarship" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Institution / University *</label>
              <input required name="institution" defaultValue={initialData?.institution} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. University of Oxford" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Country *</label>
              <input required name="country" defaultValue={initialData?.country} type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. United Kingdom" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Application Deadline *</label>
              <input required name="deadline" defaultValue={formatDateTime(initialData?.deadline)} type="datetime-local" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description *</label>
            <textarea required name="description" defaultValue={initialData?.description} rows={5} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Detailed description of the program..." />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Categorization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Level *</label>
              <select required name="level" defaultValue={initialData?.level || "BACHELOR"} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="BACHELOR">Bachelor</option>
                <option value="MASTER">Master</option>
                <option value="PHD">PhD</option>
                <option value="SCHOOL">School</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Category *</label>
              <select required name="category" defaultValue={initialData?.category || "SCHOLARSHIP"} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="SCHOLARSHIP">Scholarship</option>
                <option value="SUMMER_SCHOOL">Summer School</option>
                <option value="FORUM">Forum</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Funding Type *</label>
              <select required name="fundingType" defaultValue={initialData?.fundingType || "FULL"} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="FULL">Fully Funded</option>
                <option value="PARTIAL">Partially Funded</option>
                <option value="NONE">Self Funded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Media & Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Cover Image URL</label>
              <input name="imageUrl" defaultValue={initialData?.imageUrl || ""} type="url" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="https://..." />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Official Website URL</label>
              <input name="websiteUrl" defaultValue={initialData?.websiteUrl || ""} type="url" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="https://..." />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input type="checkbox" name="requiresEnglishCert" id="requiresEnglishCert" className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500" defaultChecked={initialData ? initialData.requiresEnglishCert : true} />
            <label htmlFor="requiresEnglishCert" className="text-gray-300">Requires English Certificate (IELTS/TOEFL)</label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSubmitting ? "Saving..." : (initialData ? "Update Program" : "Publish Program")}
          </button>
        </div>
      </form>
    </div>
  );
}
