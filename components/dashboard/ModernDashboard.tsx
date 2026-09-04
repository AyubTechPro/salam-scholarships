'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  User,
  FileText,
  Bookmark,
  TrendingUp,
  Calendar,
  Edit2,
  Camera,
  CheckCircle2,
  Award,
  MapPin,
  GraduationCap,
  Globe,
  MessageCircle,
  Send,
  Loader2,
  Sparkles,
  Play,
  ArrowRight,
  X,
} from 'lucide-react';
import Image from 'next/image';
import ProfileEditModal from './ProfileEditModal';
import VerifiedBadge from './VerifiedBadge';
import ModernRoadmap from './ModernRoadmap';
import ApplicationsBoard from './ApplicationsBoard';
import StatsGrid from './StatsGrid';
import LearningHubCard from './LearningHubCard';
import PremiumTelegramConnect from './PremiumTelegramConnect';
import SavedOpportunitiesSection from './SavedOpportunitiesSection';
import UpcomingEventsSection from './UpcomingEventsSection';
import ProfileStrengthMeter from './ProfileStrengthMeter';
import TopMatchesSection from './TopMatchesSection';
import DynamicProgressCircle from './DynamicProgressCircle';
import DocumentVaultCard from './DocumentVaultCard';

type UserProfile = {
  id: string;
  name: string | null;
  surname: string | null;
  email: string;
  image: string | null;
  profession: string | null;
  city: string | null;
  country: string | null;
  educationPlace: string | null;
  languageLevel: string | null;
  telegramOrPhone: string | null;
  bio: string | null;
  emailVerified: string | null;
  profileStatus?: string;
  isVerified?: boolean;
  applicationTokens?: number;
};

type DashboardStats = {
  applicationsCount: number;
  savedOpportunitiesCount: number;
  aiReadinessScore: number;
  upcomingEventsCount: number;
  hasCV?: boolean;
  hasApplication?: boolean;
};

export default function ModernDashboard() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const { update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'settings') {
      setShowEditModal(true);
    } else if (tabParam && ['overview', 'applications', 'opportunities', 'documents'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('overview');
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      router.replace(pathname, { scroll: false });
    } else {
      router.replace(`${pathname}?tab=${tab}`, { scroll: false });
    }
  };

  const fetchData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/dashboard-stats'),
      ]);

      const profileData = await profileRes.json();
      const statsData = await statsRes.json();

      if (profileData.success) {
        setProfile(profileData.data);
      }
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'PROFILE_PICTURE');
    formData.append('folder', 'salam_consulting_profiles');

    try {
      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        const newImageUrl = result.data.url;
        setProfile((prev) => prev ? { ...prev, image: newImageUrl } : null);
        
        // Update NextAuth session to reflect new image in Navbar immediately
        await update({
          image: newImageUrl,
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = () => {
    fetchData();
    setShowEditModal(false);
    // Force roadmap refresh by triggering a custom event
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  const fullName = profile
    ? `${profile.name || ''} ${profile.surname || ''}`.trim() || 'Student'
    : 'Student';

  const isVerified = Boolean(profile?.isVerified);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-dark pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Premium Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-3xl"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-navy-dark" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                  {profile?.image ? (
                    <Image
                      src={profile.image}
                      alt={fullName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 128px, 160px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-gold to-brand-gold/80 flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-110 border-4 border-white"
                  title="Change photo"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-brand-navy animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-brand-navy" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>

              {/* Name & Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">
                    {fullName}
                  </h1>
                  {isVerified && <VerifiedBadge />}
                </div>
                {profile?.profession && (
                  <p className="text-xl text-white/90 font-medium mb-4">{profile.profession}</p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-brand-gold/30 px-4 py-2 rounded-full">
                    <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-400' : 'bg-red-400'} relative`}>
                      <span className={`absolute inset-0 rounded-full ${isVerified ? 'bg-green-400' : 'bg-red-400'} animate-ping opacity-75`}></span>
                    </span>
                    <span className="text-brand-gold font-medium text-sm border-r border-white/20 pr-3">Trust: {isVerified ? 'Verified [V]' : 'Unverified'}</span>
                    <span className="text-white font-semibold text-sm pl-1">{profile?.applicationTokens ?? 3} Connects</span>
                  </div>
                </div>
                {profile?.bio && (
                  <p className="text-white/80 text-lg max-w-2xl">{profile.bio}</p>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-premium-gold px-6 py-3 flex items-center space-x-2"
              >
                <Edit2 className="w-5 h-5" />
                <span>{t('profile.edit') || 'Edit Profile'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {stats && activeTab === 'overview' && <StatsGrid stats={stats} />}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-4 mb-8 pb-4 border-b border-gray-200 hide-scrollbar shrink-0">
          {[
            { id: 'overview', label: locale === 'tj' ? 'Шарҳи умумӣ' : locale === 'ru' ? 'Обзор' : 'Overview', icon: User },
            { id: 'applications', label: locale === 'tj' ? 'Дархостҳо' : locale === 'ru' ? 'Заявки' : 'Applications', icon: Send },
            { id: 'opportunities', label: locale === 'tj' ? 'Имкониятҳо' : locale === 'ru' ? 'Возможности' : 'Opportunities', icon: Bookmark },
            { id: 'documents', label: locale === 'tj' ? 'Ҳуҷҷатҳо' : locale === 'ru' ? 'Документы' : 'Documents', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'btn-premium-gold shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-105 border-transparent'
                    : 'glass dark:glass-dark text-brand-navy dark:text-gray-300 hover:scale-105'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <>
                {/* Profile Info Cards - Clean Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Location */}
                  <div className="glass dark:glass-dark rounded-2xl p-6 transition-all hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-brand-gold" />
                      </div>
                      <h3 className="font-heading font-bold text-brand-navy">
                        {t('location') || 'Location'}
                      </h3>
                    </div>
                    <p className="text-gray-700 text-lg">
                      {profile?.city && profile?.country
                        ? `${profile.city}, ${profile.country}`
                        : profile?.city || profile?.country || 'Not specified'}
                    </p>
                  </div>

                  {/* Education */}
                  <div className="glass dark:glass-dark rounded-2xl p-6 transition-all hover:-translate-y-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-brand-gold" />
                      </div>
                      <h3 className="font-heading font-bold text-brand-navy">
                        {t('education') || 'Education'}
                      </h3>
                    </div>
                    <p className="text-gray-700 text-lg">
                      {profile?.educationPlace || 'Not specified'}
                    </p>
                  </div>

                  {/* Language */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-brand-gold" />
                      </div>
                      <h3 className="font-heading font-bold text-brand-navy">
                        {t('language') || 'Language Level'}
                      </h3>
                    </div>
                    <p className="text-gray-700 text-lg">
                      {profile?.languageLevel || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Roadmap */}
                <div className="mb-8">
                  <ModernRoadmap />
                </div>

                {/* Dynamic Progress Circle */}
                <div className="mb-8">
                  <DynamicProgressCircle
                    emailVerified={!!profile?.emailVerified}
                    hasCV={stats?.hasCV || false}
                    hasApplication={(stats?.applicationsCount || 0) > 0}
                  />
                </div>

                {/* Profile Strength & Daily Tip */}
                <div className="mb-8">
                  <ProfileStrengthMeter profile={profile} />
                </div>

                {/* Learning Hub */}
                <div className="mb-8">
                  <LearningHubCard />
                </div>
              </>
            )}

            {activeTab === 'documents' && (
              <div className="mb-8">
                <DocumentVaultCard profile={profile} onUpdate={fetchData} />
              </div>
            )}

            {activeTab === 'applications' && (
              <>
                {/* Full-width Advanced Application Tracking Board */}
                <div className="mb-12">
                  <ApplicationsBoard />
                </div>

                {/* Upcoming Events */}
                <div className="mb-8">
                  <h2 className="text-2xl font-heading font-bold text-brand-navy mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-brand-gold" />
                    <span>
                      {locale === 'tj' ? 'Чорабинӣҳои оянда' :
                       locale === 'ru' ? 'Предстоящие мероприятия' :
                       'Upcoming Events'}
                    </span>
                  </h2>
                  <UpcomingEventsSection />
                </div>
              </>
            )}

            {activeTab === 'opportunities' && (
              <>
                {/* Top Matches for You */}
                <div className="mb-8">
                  <TopMatchesSection />
                </div>

                {/* Saved Opportunities */}
                <div className="mb-8">
                  <SavedOpportunitiesSection />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Premium Telegram Connect */}
        <PremiumTelegramConnect profile={profile} onUpdate={fetchData} />
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showEditModal && profile && (
          <ProfileEditModal
            profile={profile}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleProfileUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

