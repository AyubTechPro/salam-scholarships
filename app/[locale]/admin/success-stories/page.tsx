import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus, Edit, Award, Quote } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteSuccessStory } from "@/app/actions/admin";

const prisma = new PrismaClient();

export default async function SuccessStoriesPage({ params: { locale } }: { params: { locale: string } }) {
  const stories = await prisma.successStory.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Success Stories</h1>
          <p className="text-sm text-[#888] mt-1">Manage student testimonials and achievements for the homepage.</p>
        </div>
        <Link 
          href={`/${locale}/admin/success-stories/new`}
          className="flex items-center gap-2 bg-[#EDEDED] hover:bg-white text-[#0A0A0A] px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Story
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-[#0A0A0A] rounded-xl border border-[#222]">
            <p className="text-[#666] mb-4 text-sm">No success stories found. The homepage is currently using dummy data.</p>
            <Link 
              href={`/${locale}/admin/success-stories/new`}
              className="inline-flex items-center gap-2 bg-[#111] hover:bg-[#222] text-[#EDEDED] px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-[#333]"
            >
              <Plus className="w-4 h-4" />
              Create your first success story
            </Link>
          </div>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden group">
              <div className="h-48 relative overflow-hidden bg-[#111]">
                {story.photoUrl ? (
                  <img src={story.photoUrl} alt={story.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-[#EDEDED]">{story.name}</h3>
                  <p className="text-amber-500 text-xs font-medium flex items-center gap-1">
                    <Award className="w-3 h-3" /> {story.achievement}
                  </p>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-start gap-2 mb-4">
                  <Quote className="w-3 h-3 text-[#666] shrink-0 mt-1" />
                  <p className="text-xs text-[#888] italic line-clamp-3">&quot;{story.quote}&quot;</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[#222]">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${story.isActive ? 'text-emerald-500 border border-emerald-500/20' : 'text-[#888] border border-[#333]'}`}>
                    {story.isActive ? 'Active' : 'Hidden'}
                  </span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/${locale}/admin/success-stories/${story.id}/edit`}
                      className="p-1.5 text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteButton 
                      id={story.id} 
                      action={async (id) => {
                        "use server";
                        await deleteSuccessStory(id, locale);
                      }} 
                      itemName="Story" 
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
