'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Building2, Globe2, Handshake, TrendingUp, Presentation, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function GlobalPartnersShowcase() {
  const t = useTranslations('common');

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Globe2 className="w-4 h-4" />
            Global Educational Aggregator
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-brand-navy mb-6 leading-tight">
            Connecting You With Top <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-600">
              Universities & Forums Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            We are not just a consulting agency. Salam Scholarships is a premier platform aggregating the best educational opportunities from our trusted international partners.
          </p>
        </motion.div>

        {/* Global Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-gold/30 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all duration-300">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">University Partnerships</h3>
            <p className="text-gray-600">Direct contracts with prestigious universities in South Korea, USA, and Europe to bring you exclusive scholarships and admission priority.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-gold/30 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all duration-300">
              <Presentation className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">Global Forums & Summits</h3>
            <p className="text-gray-600">We aggregate top-tier international forums, model UNs, and leadership summits, making it incredibly easy for you to apply and participate.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-gold/30 transition-all duration-300 group"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-all duration-300">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">Exclusive Exchange Programs</h3>
            <p className="text-gray-600">Through our extensive agency network, we list hundreds of summer schools, cultural exchanges, and language immersion programs globally.</p>
          </motion.div>
        </div>

        {/* B2B Call to Action Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-brand-navy rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl"
        >
          {/* Internal Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-gold/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left flex-1">
              <h3 className="text-3xl font-heading font-bold text-white mb-4">
                Are you an Educational Institution?
              </h3>
              <p className="text-lg text-white/80 max-w-2xl mb-0">
                Partner with Salam Scholarships to list your University programs, Forums, or Language Schools on our marketplace. Reach thousands of highly motivated students across Central Asia seamlessly.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/partners"
                className="inline-flex items-center gap-2 bg-brand-gold text-brand-navy px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-gold/20"
              >
                <Handshake className="w-5 h-5" />
                Become a Partner
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
