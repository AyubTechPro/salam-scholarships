import { getTranslations } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { FileText, CheckCircle, XCircle, AlertCircle, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function PartnerApplicantsPage({ params }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect(`/${params.locale}/login`);
  
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { partnerId: true }
  });

  if (!dbUser?.partnerId) {
    redirect(`/${params.locale}/dashboard`);
  }

  // Fetch all applications linked to this partner's programs
  const partner = await prisma.partner.findUnique({
    where: { id: dbUser.partnerId },
    include: {
      programs: {
        include: {
          applications: {
            include: {
              user: {
                select: { name: true, email: true, phoneNumber: true, country: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!partner) {
    return <div className="p-8 text-center text-red-500">Partner not found.</div>;
  }

  const allApplications = partner.programs.flatMap(p => 
    p.applications.map(app => ({
      ...app,
      programTitle: p.title
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Applicant Management</h1>
        <div className="bg-brand-navy text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md">
          {allApplications.length} Total Applications
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="font-semibold text-lg">No Applications Yet</p>
                      <p className="text-gray-400">When students apply to your programs, they will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                allApplications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{app.user.name}</p>
                      <p className="text-gray-500 text-xs">{app.user.email}</p>
                      <p className="text-gray-400 text-xs flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-normal min-w-[200px]">
                      <p className="font-semibold text-gray-800 line-clamp-2">{app.programTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {app.cvUrl ? (
                          <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded" title="CV/Resume">
                            <FileText className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-gray-300 bg-gray-50 p-1.5 rounded" title="No CV"><FileText className="w-4 h-4" /></span>
                        )}
                        {app.transcriptUrl ? (
                          <a href={app.transcriptUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 bg-purple-50 p-1.5 rounded" title="Transcript">
                            <FileText className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-gray-300 bg-gray-50 p-1.5 rounded" title="No Transcript"><FileText className="w-4 h-4" /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${app.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                          app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-600' :
                          app.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-600' :
                          app.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                          'bg-red-100 text-red-600'
                        }
                      `}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                          <>
                            <form action={`/api/applications/${app.id}/status`} method="POST">
                              <input type="hidden" name="status" value="ACCEPTED" />
                              <button type="submit" className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg flex items-center font-semibold transition-colors text-xs border border-green-200">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </button>
                            </form>
                            <form action={`/api/applications/${app.id}/status`} method="POST">
                              <input type="hidden" name="status" value="REJECTED" />
                              <button type="submit" className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center font-semibold transition-colors text-xs border border-red-200">
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </button>
                            </form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start text-blue-800 text-sm">
        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Note on Data Privacy:</strong> Student documents and personal information are strictly confidential and provided solely for the purpose of university admissions evaluations. Do not share or download these files except for official processing.
        </p>
      </div>
    </div>
  );
}
