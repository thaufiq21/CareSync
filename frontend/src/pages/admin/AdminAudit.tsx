import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Card, Spinner, Badge } from '@/components/ui';
import { ShieldCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAudit() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-audit-events'],
    queryFn: () => adminApi.auditEvents(1),
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">System Audit Trail</h1>
        <p className="text-text-secondary mt-1">
          Review secure log events tracking sensitive operations, staff actions, and status updates.
        </p>
      </div>

      <Card>
        {isLoading ? (
          <Spinner size="lg" />
        ) : (events as any[])?.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-8">No audit events recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 uppercase font-semibold text-text-secondary">
                <tr>
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target Entity</th>
                  <th className="py-2.5 px-3">Actor ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {(events as any[])?.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-text-secondary">#{ev.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-teal-800 font-sans">
                      <Badge label={ev.action} color="navy" />
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {ev.entity_type} {ev.entity_id ? `(#${ev.entity_id})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">
                      {ev.actor_id ? `User #${ev.actor_id}` : 'Anonymous / System'}
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary font-sans">
                      {format(new Date(ev.created_at), 'PPP, p')}
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
