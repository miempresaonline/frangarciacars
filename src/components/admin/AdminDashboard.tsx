import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateUserModal } from './CreateUserModal';
import { UsersList } from './UsersList';
import { CreateReviewModal } from './CreateReviewModal';
import { ReviewsList } from './ReviewsList';
import { ProfileSettings } from './ProfileSettings';
import { ChecklistSettings } from './ChecklistSettings';
import { PWASettings } from '../ui/PWASettings';
import { getReviewStats } from '../../lib/reviews';
import {
  getRecentUsers,
  getActivityTimeline,
  getAdvancedStats,
  getReviewersPerformance,
  getTrendsData,
  getMediaStats,
} from '../../lib/dashboardStats';
import { Button } from '../ui/Button';
import { RecentUsers } from './dashboard/RecentUsers';
import { ActivityTimeline } from './dashboard/ActivityTimeline';
import { AdvancedStatsCards } from './dashboard/AdvancedStatsCards';
import { ReviewersPerformance } from './dashboard/ReviewersPerformance';
import { TrendsChart } from './dashboard/TrendsChart';
import { QuickActions } from './dashboard/QuickActions';
import { MediaStats } from './dashboard/MediaStats';

type AdminView = 'dashboard' | 'users' | 'reviews' | 'settings';

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'reviews', label: 'Revisiones', icon: FileText },
    { key: 'users', label: 'Usuarios', icon: Users },
    { key: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-automotive-slate-50 to-automotive-slate-100 overflow-x-hidden">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-automotive-slate-200 z-40 px-4 py-3 flex items-center justify-between shadow-lg"
      >
        <img src="/frangarcia-logo.png" alt="Logo" className="h-8" />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl hover:bg-automotive-slate-100 transition-colors"
          aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={24} className="text-automotive-navy-800" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <Menu size={24} className="text-automotive-navy-800" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ x: -300 }}
        animate={{
          x: sidebarOpen || isLargeScreen ? 0 : -300,
          width: sidebarCollapsed && isLargeScreen ? '5rem' : '16rem',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 bg-white/95 backdrop-blur-xl border-r border-automotive-slate-200 lg:z-50 z-50 shadow-2xl lg:shadow-2xl"
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-automotive-slate-200 flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src="/frangarcia-logo.png"
                alt="Fran Garcia Cars"
                className="h-12 w-auto"
              />
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`hidden lg:block p-2 rounded-lg hover:bg-automotive-slate-100 text-automotive-navy-700 transition-all ${
                sidebarCollapsed ? '' : 'ml-auto'
              }`}
            >
              <motion.div
                animate={{
                  rotate: sidebarCollapsed ? 180 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight
                  size={sidebarCollapsed ? 20 : 28}
                  className="transition-all"
                />
              </motion.div>
            </motion.button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;

              return (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentView(item.key as AdminView);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-automotive-navy-800 to-automotive-navy-700 text-white shadow-lg shadow-automotive-navy-900/30'
                      : 'text-automotive-navy-700 hover:bg-automotive-slate-100'
                  }`}
                >
                  <Icon size={22} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </motion.button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-automotive-slate-200">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 px-4 py-3 bg-gradient-to-br from-automotive-slate-100 to-automotive-slate-50 rounded-xl"
              >
                <p className="text-xs text-automotive-slate-600 mb-1 font-semibold">
                  Admin
                </p>
                <p className="text-sm font-bold text-automotive-navy-900 truncate">
                  {user?.profile?.full_name}
                </p>
                <p className="text-xs text-automotive-slate-600 truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={signOut}
              className={`w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-all ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && <span>Cerrar Sesión</span>}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {sidebarOpen && !isLargeScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`min-h-screen overflow-y-auto transition-all duration-300 ${
          isLargeScreen
            ? sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
            : 'ml-0'
        } ${!isLargeScreen ? 'pt-16' : 'pt-0'}`}
      >
        <div className="p-4 md:p-6 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'dashboard' && <DashboardView />}
              {currentView === 'reviews' && <ReviewsView />}
              {currentView === 'users' && <UsersView />}
              {currentView === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  const [stats, setStats] = useState({
    total: 0,
    in_progress: 0,
    pending_qc: 0,
    sent_to_client: 0,
    avg_completion_time: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [mediaStats, setMediaStats] = useState<any>(null);
  const [reviewerPeriod, setReviewerPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadAllData();
  }, [reviewerPeriod, refreshKey]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        usersData,
        activitiesData,
        advStatsData,
        reviewersData,
        trendsDataResult,
        mediaStatsData,
      ] = await Promise.all([
        getReviewStats(),
        getRecentUsers(7),
        getActivityTimeline(15),
        getAdvancedStats(),
        getReviewersPerformance(reviewerPeriod),
        getTrendsData(30),
        getMediaStats(),
      ]);

      setStats(statsData);
      setRecentUsers(usersData);
      setActivities(activitiesData);
      setAdvancedStats(advStatsData);
      setReviewers(reviewersData);
      setTrendsData(trendsDataResult);
      setMediaStats(mediaStatsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCreated = () => {
    setShowCreateReview(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleUserCreated = () => {
    setShowCreateUser(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-automotive-navy-900 mb-8"
      >
        Dashboard
      </motion.h1>

      {loading && !advancedStats ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-automotive-electric-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <AdvancedStatsCards stats={advancedStats} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <TrendsChart data={trendsData} loading={loading} />
              <ReviewersPerformance
                reviewers={reviewers}
                loading={loading}
                period={reviewerPeriod}
                onPeriodChange={setReviewerPeriod}
              />
            </div>

            <div className="space-y-6">
              <RecentUsers users={recentUsers} loading={loading} />
              <ActivityTimeline activities={activities} loading={loading} />
              <QuickActions
                onCreateReview={() => setShowCreateReview(true)}
                onCreateUser={() => setShowCreateUser(true)}
              />
            </div>
          </div>

          <div className="mb-8">
            <MediaStats stats={mediaStats} loading={loading} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl shadow-automotive-navy-900/10 border border-automotive-slate-200 p-8"
          >
            <h2 className="text-2xl font-bold text-automotive-navy-900 mb-6">
              Revisiones Recientes
            </h2>
            <ReviewsList onRefresh={refreshKey} />
          </motion.div>
        </>
      )}

      <CreateReviewModal
        isOpen={showCreateReview}
        onClose={() => setShowCreateReview(false)}
        onSuccess={handleReviewCreated}
      />

      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSuccess={handleUserCreated}
      />
    </div>
  );
}

function ReviewsView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-automotive-navy-900"
        >
          Revisiones
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            Nueva Revisión
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ReviewsList onRefresh={refreshKey} />
      </motion.div>

      <CreateReviewModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleReviewCreated}
      />
    </div>
  );
}

function UsersView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold text-automotive-navy-900"
        >
          Usuarios
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            Nuevo Usuario
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <UsersList onRefresh={refreshKey} />
      </motion.div>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUserCreated}
      />
    </div>
  );
}

function SettingsView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'checklist' | 'pwa'>('profile');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-4xl font-bold text-automotive-navy-900 mb-8"
      >
        Configuración
      </motion.h1>

      <div className="mb-6">
        <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'profile'
                ? 'bg-[#0029D4] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'checklist'
                ? 'bg-[#0029D4] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === 'pwa'
                ? 'bg-[#0029D4] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Instalar APP
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + refreshKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'profile' && (
            <ProfileSettings user={user} onUpdate={() => setRefreshKey(k => k + 1)} />
          )}
          {activeTab === 'checklist' && <ChecklistSettings />}
          {activeTab === 'pwa' && <PWASettings />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

