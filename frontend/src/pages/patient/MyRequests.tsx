import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assistanceApi } from '@/services/api';
import { Card, Select, Button, Spinner, EmptyState, StatusBadge, Badge } from '@/components/ui';
import { MessageSquare, Plus, ChevronRight, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

export default function MyRequests() {
  const { t } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['assistance-requests', statusFilter, categoryFilter],
    queryFn: () => assistanceApi.list({
      status_filter: statusFilter || undefined,
      category_filter: categoryFilter || undefined,
    }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t('myRequests')}</h1>
          <p className="text-text-secondary mt-1">
            Track submitted assistance requests, review staff responses, and verify operational status.
          </p>
        </div>
        <Link to="/request-assistance">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1" /> New Request
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-text-secondary text-sm font-medium">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm rounded-xl border border-gray-300 px-3 py-1.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="awaiting_patient">Awaiting Patient</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm rounded-xl border border-gray-300 px-3 py-1.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Categories</option>
          <option value="hospital_navigation">Navigation</option>
          <option value="language_assistance">Language</option>
          <option value="understanding_procedures">Procedures</option>
          <option value="wheelchair_mobility_assistance">Mobility</option>
          <option value="appointment_related_support">Appointments</option>
          <option value="communication_assistance">Communication</option>
          <option value="general_patient_service">General Service</option>
          <option value="other_non_emergency">Other</option>
        </select>

        {(statusFilter || categoryFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStatusFilter(''); setCategoryFilter(''); }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : requests?.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-12 h-12" />}
          title="No requests found"
          description="You have no assistance requests matching the selected criteria."
          action={
            <Link to="/request-assistance">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Submit a Request
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests?.map((req) => (
            <Card key={req.id} className="hover:border-teal-200 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      {req.reference_code}
                    </span>
                    <StatusBadge status={req.status} />
                    <Badge label={req.category.replace(/_/g, ' ')} color="navy" />
                    {req.is_demo && <Badge label="Demo" color="yellow" />}
                  </div>

                  <p className="text-sm font-medium text-text-primary mt-2">
                    {req.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Created: {format(new Date(req.created_at), 'PPP, p')}
                    </span>
                    <span>Responses: <strong>{req.responses?.length || 0}</strong></span>
                  </div>
                </div>

                <div>
                  <Link to={`/my-requests/${req.id}`}>
                    <Button variant="outline" size="sm">
                      View Details & Responses <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
