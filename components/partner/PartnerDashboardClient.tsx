'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Loader2, CheckCircle2, XCircle, FileText, User, GraduationCap, Download, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Application = {
  id: string;
  status: string;
  motivationLetter: string | null;
  cvUrl: string | null;
  transcriptUrl: string | null;
  passportUrl: string | null;
  submittedAt: string | null;
  user: {
    name: string | null;
    email: string | null;
    isVerified?: boolean;
  };
  program: {
    id: string;
    title: string;
    titleRu: string | null;
    titleTj: string | null;
  };
};

export default function PartnerDashboardClient() {
  const locale = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await fetch(`/api/partner/applications`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/partner/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, message: feedbackMsg }),
      });
      const data = await res.json();
      
      if (data.success) {
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status } : app
        ));
        setSelectedApp(null);
        setFeedbackMsg('');
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('An error occurred while updating.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
        <XCircle className="w-6 h-6" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  const getProgramTitle = (program: any) => {
    if (locale === 'tj' && program.titleTj) return program.titleTj;
    if (locale === 'ru' && program.titleRu) return program.titleRu;
    return program.title;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">New / Submitted</span>;
      case 'ACCEPTED':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">Accepted</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">Rejected</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">Under Review</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">{status}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List */}
      <div className="lg:col-span-1 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 flex flex-col h-[calc(100vh-250px)] shadow-sm">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No applications found for your programs yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {applications.map((app) => (
                <li key={app.id}>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedApp?.id === app.id ? 'bg-brand-gold/5 border-l-4 border-brand-gold' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white line-clamp-1 flex items-center gap-1">
                        {app.user.name || 'Unknown User'}
                        {app.user.isVerified && <span title="Verified Student"><CheckCircle2 className="w-4 h-4 text-blue-500 drop-shadow-sm" /></span>}
                      </p>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                      <GraduationCap className="inline w-3 h-3 mr-1" />
                      {getProgramTitle(app.program)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Details View */}
      <div className="lg:col-span-2 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden h-[calc(100vh-250px)] flex flex-col">
        {selectedApp ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    {selectedApp.user.name}
                    {selectedApp.user.isVerified && (
                      <span className="flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-200">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <User className="w-4 h-4" /> {selectedApp.user.email}
                  </p>
                </div>
                {getStatusBadge(selectedApp.status)}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-8">
                <p className="text-sm font-semibold text-gray-500 mb-1">Applying For Program</p>
                <h3 className="text-lg font-bold text-brand-navy dark:text-white flex items-center gap-2">
                  <GraduationCap className="text-brand-gold" />
                  {getProgramTitle(selectedApp.program)}
                </h3>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 font-heading border-b pb-2 dark:border-gray-800">Motivation Letter</h3>
                {selectedApp.motivationLetter ? (
                  <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl text-sm leading-relaxed border border-gray-100 dark:border-gray-800">
                    {selectedApp.motivationLetter.split('\n').map((line, i) => (
                      <p key={i} className={line.trim() ? "mb-2" : "mb-0"}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No motivation letter provided.</p>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 font-heading border-b pb-2 dark:border-gray-800">Attached Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'CV / Resume', url: selectedApp.cvUrl },
                    { label: 'Academic Transcript', url: selectedApp.transcriptUrl },
                    { label: 'Passport', url: selectedApp.passportUrl }
                  ].map((doc, idx) => (
                    doc.url ? (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-gold dark:hover:border-brand-gold transition-colors group bg-white dark:bg-gray-800"
                      >
                        <div className="bg-brand-gold/10 p-2 rounded-lg group-hover:bg-brand-gold group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5 text-brand-gold group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{doc.label}</p>
                          <p className="text-xs text-brand-gold flex items-center gap-1 mt-0.5">
                            <Download className="w-3 h-3" /> View Document
                          </p>
                        </div>
                      </a>
                    ) : null
                  ))}
                </div>
              </div>
            </div>

            {/* Decision Footer */}
            {selectedApp.status === 'SUBMITTED' || selectedApp.status === 'UNDER_REVIEW' ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <h3 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">University Decision</h3>
                
                <textarea
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  placeholder="Optional feedback or instructions for the student..."
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm mb-4 focus:ring-2 focus:ring-brand-gold resize-none"
                  rows={2}
                />

                <div className="flex gap-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'ACCEPTED')}
                    disabled={updating}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Accept Student
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'REJECTED')}
                    disabled={updating}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                    Reject Application
                  </button>
                </div>
              </div>
            ) : (
             <div className="bg-gray-50 dark:bg-gray-800 p-6 border-t border-gray-200 dark:border-gray-700 mt-auto text-center">
               <p className="text-gray-500 font-medium">This application has already been {selectedApp.status.toLowerCase()}.</p>
             </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Application Selected</h2>
            <p className="text-gray-500 max-w-sm">
              Select an application from the list on the left to view their profile, motivation letter, and documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
