import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { assistanceApi } from '@/services/api';
import { Card, Button, Spinner, StatusBadge, Badge, EmptyState } from '@/components/ui';
import { MessageSquare, Filter, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

export default function StaffRequests() {
  const { t } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['staff-requests', statusFilter, categoryFilter],
    queryFn: () => assistanceApi.list({
      status_filter: statusFilter || undefined,
      category_filter: categoryFilter || undefined,
    }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Assistance Request Management</h1>
        <p className="text-text-secondary mt-1">
          Review, assign, reply to, and resolve patient concerns across departments.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
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

      <Card>
        {isLoading ? (
          <Spinner size="lg" />
        ) : requests?.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="No matching requests"
            description="No assistance requests match the selected filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-text-secondary uppercase">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests?.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">
                      {req.reference_code}
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={req.category.replace(/_/g, ' ')} color="navy" />
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-text-primary">
                      {req.description}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge label={req.priority} color={req.priority === 'high' ? 'red' : 'blue'} />
                    </td>
                    <td className="py-3 px-4 text-xs text-text-secondary">
                      {format(new Date(req.created_at), 'dd MMM yyyy, p')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/staff/requests/${req.id}`}>
                        <Button variant="outline" size="sm">
                          Manage <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
