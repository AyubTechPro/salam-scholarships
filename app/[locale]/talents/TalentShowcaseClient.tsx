'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, GraduationCap, Code, CheckCircle2, FileText, Send } from 'lucide-react';
import Image from 'next/image';

type Talent = {
  id: string;
  name: string;
  country: string | null;
  profession: string | null;
  educationPlace: string | null;
  languageLevel: string | null;
  bio: string | null;
  cvUrl: string | null;
  image: string | null;
};

export default function TalentShowcaseClient({ locale }: { locale: string }) {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/talents')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTalents(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredTalents = talents.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.profession?.toLowerCase().includes(search.toLowerCase()) ||
    t.educationPlace?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Global Verified Talent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our exclusive registry of strictly verified, high-intent students ready for international placement. 
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            placeholder="Search by name, profession, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-gold focus:border-transparent text-lg text-gray-900 dark:text-white shadow-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTalents.map((talent, index) => (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="bg-gradient-to-r from-brand-navy to-brand-navy/80 p-6 flex flex-col items-center relative">
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Verified</span>
                  </div>
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-md mb-4 font-bold text-brand-navy uppercase overflow-hidden">
                      {talent.image ? (
                        <Image src={talent.image!} alt={talent.name} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
                      ) : (
                        talent.name?.charAt(0) || 'U'
                      )}
                    </div>
                  <h3 className="text-xl font-bold font-heading text-white text-center">
                    {talent.name || 'Anonymous User'}
                  </h3>
                  <div className="flex items-center space-x-2 text-white/80 mt-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{talent.country || 'International'}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Briefcase className="w-5 h-5 mr-3 text-brand-gold" />
                    <span className="font-medium">{talent.profession || 'Student'}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <GraduationCap className="w-5 h-5 mr-3 text-brand-gold" />
                    <span>{talent.educationPlace || 'University Student'}</span>
                  </div>

                  {talent.languageLevel && (
                    <div className="flex items-start text-gray-700 dark:text-gray-300">
                      <Code className="w-5 h-5 mr-3 text-brand-gold mt-1" />
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-xs font-semibold">
                          English: {talent.languageLevel}
                        </span>
                      </div>
                    </div>
                  )}

                  {talent.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 italic line-clamp-3">
                      &quot;{talent.bio}&quot;
                    </p>
                  )}
                </div>

                <div className="p-6 pt-0 mt-auto flex flex-col space-y-3">
                  {talent.cvUrl && (
                    <a
                      href={talent.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Resume</span>
                    </a>
                  )}
                  <button className="w-full justify-center flex items-center space-x-2 bg-brand-gold text-brand-navy py-2.5 rounded-lg hover:bg-yellow-500 transition-colors font-bold shadow-md">
                    <Send className="w-4 h-4" />
                    <span>Invite to Apply</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
