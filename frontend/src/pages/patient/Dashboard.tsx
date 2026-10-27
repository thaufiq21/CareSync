import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, Spinner, EmptyState, StatusBadge, Button } from '@/components/ui';
import { assistanceApi, appointmentsApi, feedbackApi } from '@/services/api';
import { MessageSquare, Calendar, Star, Plus, ChevronRight, Bell } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const { user, t } = useAuth();

  const { data: requests, isLoading: reqLoading } = useQuery({
    queryKey: ['assistance-requests'],
    queryFn: () => assistanceApi.list({ page: 1 }),
  });

  const { data: appointments, isLoading: apptLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentsApi.list,
  });

  const { data: feedbackList } = useQuery({
    queryKey: ['feedback', 'mine'],
    queryFn: feedbackApi.mine,
  });

  const openRequests = requests?.filter(r => !['resolved', 'closed'].includes(r.status)) ?? [];
  const upcomingAppts = appointments?.filter(a => a.status !== 'cancelled') ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {t('welcomeBack')}, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-text-secondary mt-1">Here's an overview of your CareSync activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{openRequests.length}</p>
            <p className="text-sm text-text-secondary">{t('openRequests')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{upcomingAppts.length}</p>
            <p className="text-sm text-text-secondary">{t('upcomingAppointments')}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{feedbackList?.length ?? 0}</p>
            <p className="text-sm text-text-secondary">Feedback Submitted</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open requests */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">{t('openRequests')}</h2>
              <Link to="/my-requests">
                <Button variant="ghost" size="sm">View all <ChevronRight className="w-3.5 h-3.5" /></Button>
              </Link>
            </div>
            {reqLoading ? <Spinner /> : openRequests.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-12 h-12" />}
                title={t('noRequests')}
                description="Submit a request for help and track its progress here."
                action={
                  <Link to="/request-assistance">
                    <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> Request Assistance</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {openRequests.slice(0, 5).map(req => (
                  <li key={req.id}>
                    <Link to={`/my-requests/${req.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-sm font-medium text-text-primary truncate">{req.reference_code}</p>
                        <p className="text-xs text-text-secondary truncate">{req.description}</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {format(new Date(req.created_at), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <StatusBadge status={req.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-text-primary mb-4">{t('quickActions')}</h2>
            <div className="space-y-2">
              {[
                { to: '/request-assistance', icon: MessageSquare, label: t('requestAssistance'), color: 'text-teal-600 bg-teal-50' },
                { to: '/hospital-directory', icon: Bell, label: t('hospitalDirectory'), color: 'text-blue-600 bg-blue-50' },
                { to: '/faq-assistant', icon: Bell, label: t('faqAssistant'), color: 'text-purple-600 bg-purple-50' },
                { to: '/feedback', icon: Star, label: t('patientFeedback'), color: 'text-yellow-600 bg-yellow-50' },
              ].map(action => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{action.label}</span>
                  <ChevronRight className="w-4 h-4 text-text-secondary ml-auto" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Upcoming appointments */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-text-primary text-sm">{t('upcomingAppointments')}</h2>
              <Link to="/visit-planner">
                <Button variant="ghost" size="sm">View <ChevronRight className="w-3 h-3" /></Button>
              </Link>
            </div>
            {apptLoading ? <Spinner size="sm" /> : upcomingAppts.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-3">{t('noAppointments')}</p>
            ) : (
              <ul className="space-y-2">
                {upcomingAppts.slice(0, 3).map(appt => (
                  <li key={appt.id} className="text-sm p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="font-medium text-text-primary truncate">{appt.title}</p>
                    <p className="text-xs text-text-secondary">{format(new Date(appt.appointment_date), 'dd MMM yyyy, HH:mm')}</p>
                    {appt.is_demo && <p className="text-xs text-yellow-600 mt-0.5">[Demo appointment]</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
