import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus, Search, Edit, Globe, Calendar } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProgram } from "@/app/actions/admin";

const prisma = new PrismaClient();

export default async function ProgramsPage({ params: { locale } }: { params: { locale: string } }) {
  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      country: true,
      institution: true,
      level: true,
      fundingType: true,
      deadline: true,
      isActive: true,
      viewCount: true,
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Opportunities Hub</h1>
          <p className="text-sm text-[#888] mt-1">Manage scholarships, universities, and programs.</p>
        </div>
        <Link 
          href={`/${locale}/admin/programs/new`}
          className="flex items-center gap-2 bg-[#EDEDED] hover:bg-white text-[#0A0A0A] px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-5 h-5" />
          Add Program
        </Link>
      </div>

      {/* Programs List */}
      <div className="border border-[#222] rounded-xl overflow-hidden bg-[#0A0A0A]">
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
            <input 
              type="text" 
              placeholder="Search programs..." 
              className="w-full bg-[#0A0A0A] border border-[#333] rounded-md pl-9 pr-4 py-1.5 text-sm text-[#EDEDED] placeholder-[#666] focus:outline-none focus:border-[#666] transition-colors"
            />
          </div>
          <div className="text-xs text-[#888]">
            Total: <span className="text-[#EDEDED] font-medium">{programs.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#222] bg-[#111]">
                <th className="px-5 py-3 text-xs font-medium text-[#888]">Program</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888]">Location & Inst.</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888]">Details</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888]">Status & Deadline</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No programs found. Click &quot;Add Program&quot; to create one.
                  </td>
                </tr>
              ) : (
                programs.map((program) => (
                  <tr key={program.id} className="hover:bg-[#111] transition-colors group">
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-[#EDEDED] text-sm mb-1">{program.title}</div>
                      <div className="text-[10px] text-[#666] flex items-center gap-2">
                        <span className="font-mono">ID: {program.id.slice(-6)}</span>
                        <span>•</span>
                        <span>{program.viewCount} views</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1 text-sm text-[#888] mb-1">
                        <Globe className="w-3 h-3" /> {program.country}
                      </div>
                      <div className="text-xs text-[#666]">{program.institution}</div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#222] text-[#888] border border-[#333] rounded inline-block w-max">
                          {program.level}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#222] text-[#888] border border-[#333] rounded inline-block w-max">
                          {program.fundingType}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        {program.isActive ? (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 text-emerald-500 border border-emerald-500/20 rounded inline-flex items-center w-max">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 text-[#888] border border-[#333] rounded inline-flex items-center w-max">
                            Inactive
                          </span>
                        )}
                        <div className="text-[10px] text-[#666] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(program.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/${locale}/admin/programs/${program.id}/edit`}
                          className="p-1.5 text-[#888] hover:text-[#EDEDED] hover:bg-[#222] rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteButton 
                          id={program.id} 
                          action={async (id) => {
                            "use server";
                            await deleteProgram(id, locale);
                          }} 
                          itemName="Program" 
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
