import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import {
  Heart, Menu, X, Bell, Globe, User,
  LayoutDashboard, MessageSquare, Building2, ClipboardList,
  Star, HelpCircle, ChevronDown, LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationsApi } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

const CARESYNC_LOGO = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
      <Heart className="w-5 h-5 text-white fill-white" />
    </div>
    <span className="text-xl font-bold text-navy-500">Care<span className="text-teal-500">Sync</span></span>
  </div>
);

export default function Navbar() {
  const { user, logout, language, setLanguage, t, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.list(true),
    enabled: isAuthenticated,
    refetchInterval: 30000, // poll every 30s
    retry: false,
  });

  const unreadCount = notifications?.length ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const publicLinks = [
    { to: '/', label: t('home') },
    { to: '/hospital-directory', label: t('hospitalDirectory') },
    { to: '/faqs', label: t('faqs') },
  ];

  const patientLinks = [
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/visit-planner', label: t('visitPlanner'), icon: ClipboardList },
    { to: '/hospital-directory', label: t('hospitalDirectory'), icon: Building2 },
    { to: '/request-assistance', label: t('requestAssistance'), icon: MessageSquare },
    { to: '/my-requests', label: t('myRequests'), icon: ClipboardList },
    { to: '/feedback', label: t('patientFeedback'), icon: Star },
    { to: '/faq-assistant', label: t('faqAssistant'), icon: HelpCircle },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: t('staffDashboard'), icon: LayoutDashboard },
    { to: '/staff/requests', label: t('assistanceRequests'), icon: MessageSquare },
    { to: '/staff/analytics', label: t('analytics'), icon: Star },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: t('adminDashboard'), icon: LayoutDashboard },
    { to: '/admin/staff', label: t('staffManagement'), icon: User },
    { to: '/admin/departments', label: t('departments'), icon: Building2 },
    { to: '/admin/faqs', label: t('faqManagement'), icon: HelpCircle },
    { to: '/admin/audit', label: t('auditEvents'), icon: ClipboardList },
  ];

  const navLinks = user?.role === 'admin' ? adminLinks :
    user?.role === 'staff' ? staffLinks :
    user ? patientLinks : publicLinks;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" aria-label="CareSync Home">
            <CARESYNC_LOGO />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={`Switch to ${language === 'en' ? 'Tamil' : 'English'}`}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language === 'en' ? 'EN' : 'தமிழ்'}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-text-secondary hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-teal-700" />
                    </div>
                    <span className="text-sm font-medium text-text-primary hidden sm:block max-w-[120px] truncate">
                      {user?.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                        <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50">
                        <User className="w-4 h-4" /> {t('profile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('login')}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">{t('register')}</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
                  location.pathname === link.to
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-text-secondary hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
