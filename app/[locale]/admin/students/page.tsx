import { PrismaClient } from "@prisma/client";
import { User, Mail, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">Students Database</h1>
          <p className="text-sm text-[#888] mt-1">Manage registered students and their profiles.</p>
        </div>
      </div>

      <div className="border border-[#222] rounded-xl overflow-hidden bg-[#0A0A0A]">
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
          <div className="text-xs text-[#888]">
            Total: <span className="text-[#EDEDED] font-medium">{students.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#222] bg-[#111]">
                <th className="px-5 py-3 text-xs font-medium text-[#888]">Student</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888]">Contact</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888]">CRM Status</th>
                <th className="px-5 py-3 text-xs font-medium text-[#888] text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[#666] text-sm">
                    No students registered yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#111] transition-colors group">
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0 overflow-hidden">
                          {student.image ? (
                            <img src={student.image} alt={student.name || "User"} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-medium text-[#888]">
                              {student.name?.charAt(0) || "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#EDEDED] text-sm mb-0.5">
                            {student.name ? `${student.name} ${student.surname || ''}` : "Unknown Student"}
                          </div>
                          <div className="text-[10px] text-[#666] font-mono">
                            ID: {student.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-xs text-[#888] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> 
                          {student.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#222] text-[#888] border border-[#333]">
                        {student.crmStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <div className="text-[10px] text-[#666] flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(student.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/${locale}/admin/students/${student.id}`} className="inline-flex items-center gap-1 px-2 py-1 bg-[#111] hover:bg-[#222] text-[#EDEDED] text-[10px] rounded transition-colors border border-[#333]">
                          <ExternalLink className="w-3 h-3" /> Profile
                        </Link>
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
