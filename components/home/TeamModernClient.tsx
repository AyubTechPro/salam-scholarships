'use client';

import { motion } from 'framer-motion';
import { Instagram, Linkedin, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import Image from '@/components/common/ImageWithFallback';

type TeamMember = {
  id: string;
  name: string;
  nameRu?: string | null;
  nameTj?: string | null;
  role: string;
  roleRu?: string | null;
  roleTj?: string | null;
  photo: string;
  instagram?: string | null;
  linkedin?: string | null;
  telegram?: string | null;
  email?: string | null;
};

interface TeamModernClientProps {
  teamMembers: TeamMember[];
  locale: string;
  translations: {
    badge: string;
    title: string;
    description: string;
  };
}

export default function TeamModernClient({ teamMembers, locale, translations }: TeamModernClientProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getLocalizedContent = (member: TeamMember) => {
    if (locale === 'ru') {
      return { name: member.nameRu || member.name, role: member.roleRu || member.role };
    }
    if (locale === 'tj') {
      return { name: member.nameTj || member.name, role: member.roleTj || member.role };
    }
    return { name: member.name, role: member.role };
  };

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {translations.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-navy mb-4">
            {translations.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {translations.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => {
            const content = getLocalizedContent(member);
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className={`object-cover transition-transform duration-300 ${
                        hoveredIndex === index ? 'scale-110' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className={`absolute inset-0 flex items-center justify-center space-x-4 transition-all duration-300 ${
                      hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      {member.instagram && (
                        <a
                          href={member.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all hover:scale-110"
                        >
                          <Instagram className="w-6 h-6" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all hover:scale-110"
                        >
                          <Linkedin className="w-6 h-6" />
                        </a>
                      )}
                      {member.telegram && (
                        <a
                          href={member.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all hover:scale-110"
                        >
                          <Send className="w-6 h-6" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gold hover:text-navy transition-all hover:scale-110"
                        >
                          <Mail className="w-6 h-6" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-heading font-bold text-navy mb-2">
                      {content.name}
                    </h3>
                    <p className="text-gold font-semibold">
                      {content.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

