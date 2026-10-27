import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assistanceApi } from '@/services/api';
import { Card, Button, Spinner, StatusBadge, Badge, EmptyState } from '@/components/ui';
import { ArrowLeft, Clock, MessageSquare, UserCheck, Shield, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useAuth();
  const requestId = parseInt(id || '0', 10);

  const { data: request, isLoading, isError } = useQuery({
    queryKey: ['assistance-request', requestId],
    queryFn: () => assistanceApi.get(requestId),
    enabled: requestId > 0,
    refetchInterval: 10000, // Poll for live staff responses
  });

  if (isLoading) return <div className="p-12"><Spinner size="lg" /></div>;
  if (isError || !request) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <Card className="text-center py-8">
          <p className="text-red-600 font-semibold mb-4">Request not found or access denied.</p>
          <Link to="/my-requests"><Button variant="outline">Back to Requests</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/my-requests" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to My Requests
      </Link>

      {/* Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                {request.reference_code}
              </span>
              <StatusBadge status={request.status} />
              {request.is_demo && <Badge label="Demo" color="yellow" />}
            </div>
            <p className="text-xs text-text-secondary mt-1.5">
              Submitted on {format(new Date(request.created_at), 'PPPP, p')}
            </p>
          </div>

          <div className="text-right sm:text-left">
            <span className="text-xs text-text-secondary block">Operational Priority</span>
            <Badge label={request.priority.toUpperCase()} color={request.priority === 'high' ? 'red' : 'blue'} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-sm">
          <div>
            <p className="text-xs text-text-secondary">Category</p>
            <p className="font-semibold text-text-primary">{request.category.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Language Preference</p>
            <p className="font-semibold text-text-primary">{request.preferred_language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}</p>
          </div>
          {request.contact_preference && (
            <div>
              <p className="text-xs text-text-secondary">Contact Preference</p>
              <p className="font-semibold text-text-primary">{request.contact_preference}</p>
            </div>
          )}
          {request.accessibility_needs && (
            <div>
              <p className="text-xs text-text-secondary">Accessibility Needs</p>
              <p className="font-semibold text-text-primary">{request.accessibility_needs}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-text-secondary mb-1 font-semibold uppercase tracking-wider">Request Details</p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-text-primary leading-relaxed border border-gray-100">
            {request.description}
          </div>
        </div>
      </Card>

      {/* Responses Timeline */}
      <Card>
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          Staff Responses & Updates
        </h2>

        {request.responses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-primary">No responses yet</p>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
              Authorized hospital staff have received your request and will post an update here shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {request.responses.map((resp) => (
              <div
                key={resp.id}
                className="bg-teal-50/40 border border-teal-100 rounded-2xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <div className="flex items-center gap-1.5 font-semibold text-teal-800">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>{resp.author_name || 'Hospital Care Team'}</span>
                  </div>
                  <span>{format(new Date(resp.created_at), 'PPP, p')}</span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed">
                  {resp.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
