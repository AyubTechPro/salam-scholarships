import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus, Edit, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteHeroSlide } from "@/app/actions/admin";
import ImageWithFallback from "@/components/common/ImageWithFallback";

const prisma = new PrismaClient();

export default async function HeroSliderPage({ params: { locale } }: { params: { locale: string } }) {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Hero Banner</h1>
          <p className="text-sm text-[#888] mt-1">Manage the main image sliders and text on the homepage.</p>
        </div>
        <Link 
          href={`/${locale}/admin/hero-slider/new`}
          className="flex items-center gap-2 bg-[#EDEDED] hover:bg-white text-[#0A0A0A] px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-[#0A0A0A] rounded-xl border border-[#222]">
            <p className="text-[#666] mb-4 text-sm">No slides found. The homepage is currently using dummy data.</p>
            <Link 
              href={`/${locale}/admin/hero-slider/new`}
              className="inline-flex items-center gap-2 bg-[#111] hover:bg-[#222] text-[#EDEDED] px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-[#333]"
            >
              <Plus className="w-4 h-4" />
              Create your first slide
            </Link>
          </div>
        ) : (
          slides.map((slide) => (
            <div key={slide.id} className="bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden group">
              <div className="h-48 relative overflow-hidden bg-[#111] flex items-center justify-center">
                {slide.imageUrl ? (
                  <ImageWithFallback src={slide.imageUrl} alt={slide.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-700" />
                )}
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-lg font-bold text-[#EDEDED] mb-1 line-clamp-1">{slide.title}</h3>
                  <p className="text-[#888] text-xs line-clamp-2">{slide.subtitle}</p>
                </div>
              </div>
              
              <div className="p-5">
                {slide.buttonText && (
                  <div className="flex items-center gap-2 mb-4 bg-[#111] p-3 rounded-md border border-[#222]">
                    <LinkIcon className="w-4 h-4 text-[#888]" />
                    <div>
                      <p className="text-[10px] text-[#666] font-medium uppercase tracking-wider">Button Text</p>
                      <p className="text-sm text-[#EDEDED]">{slide.buttonText}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${slide.isActive ? 'text-emerald-500 border border-emerald-500/20' : 'text-[#888] border border-[#333]'}`}>
                    {slide.isActive ? 'Active' : 'Hidden'}
                  </span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/${locale}/admin/hero-slider/${slide.id}/edit`}
                      className="p-1.5 text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <DeleteButton 
                      id={slide.id} 
                      action={async (id) => {
                        "use server";
                        await deleteHeroSlide(id, locale);
                      }} 
                      itemName="Slide" 
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
