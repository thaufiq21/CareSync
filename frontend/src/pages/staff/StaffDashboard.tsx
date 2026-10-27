import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assistanceApi, analyticsApi } from '@/services/api';
import { Card, Button, Spinner, StatusBadge, Badge } from '@/components/ui';
import { MessageSquare, Users, CheckCircle, Clock, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

export default function StaffDashboard() {
  const { user, t } = useAuth();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['staff-analytics'],
    queryFn: () => analyticsApi.get(30),
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['assistance-requests', 'staff-recent'],
    queryFn: () => assistanceApi.list({ page: 1, page_size: 10 }),
  });

  const openRequests = requests?.filter(r => !['resolved', 'closed'].includes(r.status)) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{t('staffDashboard')}</h1>
        <p className="text-text-secondary mt-1">
          Welcome back, {user?.name}. Monitor patient concerns, respond to active requests, and track experience trends.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{analytics?.total_requests ?? '—'}</p>
            <p className="text-xs text-text-secondary">{t('totalRequests')}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{analytics?.open_requests ?? '—'}</p>
            <p className="text-xs text-text-secondary">{t('pendingRequests')}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{analytics?.resolved_requests ?? '—'}</p>
            <p className="text-xs text-text-secondary">{t('resolvedRequests')}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">
              {analytics?.feedback.avg_overall ? `${analytics.feedback.avg_overall} / 5` : 'N/A'}
            </p>
            <p className="text-xs text-text-secondary">Avg Experience Score</p>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Active Requests Requiring Follow-Up
              </h2>
              <Link to="/staff/requests">
                <Button variant="ghost" size="sm">
                  View All Requests <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {requestsLoading ? (
              <Spinner size="md" />
            ) : openRequests.length === 0 ? (
              <p className="text-sm text-text-secondary py-6 text-center">No active requests awaiting response.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {openRequests.map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-700">{req.reference_code}</span>
                        <StatusBadge status={req.status} />
                        <Badge label={req.category.replace(/_/g, ' ')} color="gray" />
                      </div>
                      <p className="text-sm text-text-primary line-clamp-1">{req.description}</p>
                      <p className="text-[10px] text-text-secondary">{format(new Date(req.created_at), 'PPP, p')}</p>
                    </div>

                    <Link to={`/staff/requests/${req.id}`}>
                      <Button variant="outline" size="sm">
                        Respond
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Staff Tools */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-text-primary mb-3">Staff Navigation</h3>
            <div className="space-y-2">
              <Link to="/staff/requests" className="block">
                <Button variant="outline" size="md" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2 text-teal-600" />
                  Manage All Assistance Requests
                </Button>
              </Link>
              <Link to="/staff/analytics" className="block">
                <Button variant="outline" size="md" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2 text-navy-500" />
                  Experience Analytics & Ratings
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="bg-yellow-50/50 border-yellow-200">
            <h4 className="text-xs font-bold text-yellow-900 uppercase tracking-wider mb-1">
              Operational Guideline
            </h4>
            <p className="text-xs text-yellow-800 leading-relaxed">
              Staff priorities and status updates represent service workflows. Internal notes are private and strictly concealed from patient views.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
