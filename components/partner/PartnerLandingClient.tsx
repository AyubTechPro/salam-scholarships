'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Globe, TrendingUp, CheckCircle2, Building2, User, Mail, Link, MessageSquare, Send, Loader2 } from 'lucide-react';

export default function PartnerLandingClient() {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/partners/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setFormData({
          organizationName: '',
          contactName: '',
          email: '',
          phone: '',
          website: '',
          message: '',
        });
      } else {
        setError(data.error || 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-navy pt-20 pb-32">
        <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Network className="w-4 h-4 text-brand-gold" />
              <span>B2B University Network</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Recruit Top Global Talent with <span className="text-brand-gold">Salam Scholarships</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Join our exclusive pipeline of highly vetted, motivated students from Central Asia, Russia, and beyond. Streamline your entire funnel through our digital B2B dashboard.
            </p>
            <button
              onClick={() => document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand-gold text-brand-navy px-8 py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all hover:scale-105"
            >
              Partner With Us
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-brand-navy dark:text-white mb-4">Why Partner with Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'Global Reach, Local Expertise', desc: 'We act as the prime bridge between international universities and untapped student markets.' },
              { icon: TrendingUp, title: 'High-Quality Applicants', desc: 'Our AI-driven eligibility checks and dedicated consulting ensure we only send you the most qualified students.' },
              { icon: Building2, title: 'Unified Partner Dashboard', desc: 'Review motivation letters, CVs, and accept or reject candidates digitally with one click.' },
            ].map((Feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-brand-navy dark:bg-gray-700 rounded-xl flex items-center justify-center mb-6">
                  <Feature.icon className="w-7 h-7 text-brand-gold" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{Feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{Feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="partner-form" className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl"></div>
            
            <div className="text-center mb-10 relative z-10">
              <h2 className="text-3xl font-heading font-bold text-brand-navy dark:text-white mb-4">Request a Partnership</h2>
              <p className="text-gray-600 dark:text-gray-400">Fill out your organization&apos;s details, and our B2B team will contact you within 24 hours.</p>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8 text-center border-2 border-green-200 dark:border-green-800 relative z-10"
              >
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2 dark:text-white">Inquiry Submitted!</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">Thank you for your interest. Our B2B manager will be in touch shortly.</p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-brand-gold font-bold hover:underline"
                >
                  Submit another inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-brand-navy dark:text-gray-300 mb-2">Organization/University Name *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        required
                        type="text"
                        value={formData.organizationName}
                        onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                        className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-gold dark:text-white"
                        placeholder="e.g. Oxford University"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-navy dark:text-gray-300 mb-2">Contact Person *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        required
                        type="text"
                        value={formData.contactName}
                        onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                        className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-gold dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-navy dark:text-gray-300 mb-2">Official Email *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-gold dark:text-white"
                        placeholder="admissions@university.edu"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-navy dark:text-gray-300 mb-2">Website</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Link className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                        className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-gold dark:text-white"
                        placeholder="https://university.edu"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-navy dark:text-gray-300 mb-2">Partnership Goals / Message *</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="pl-10 w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-gold dark:text-white"
                      placeholder="Tell us what kind of candidates you are looking for..."
                      rows={4}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-gold text-brand-navy p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
