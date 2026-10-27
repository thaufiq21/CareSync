import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assistanceApi, staffApi, extractError } from '@/services/api';
import { Card, Button, Textarea, Select, Spinner, StatusBadge, Badge, Alert } from '@/components/ui';
import { ArrowLeft, Clock, MessageSquare, Shield, CheckCircle, Send, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function StaffRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const requestId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();

  const [responseMsg, setResponseMsg] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const { data: request, isLoading, isError } = useQuery({
    queryKey: ['staff-request-detail', requestId],
    queryFn: () => assistanceApi.get(requestId),
    enabled: requestId > 0,
  });

  const { data: staffMembers } = useQuery({
    queryKey: ['staff-members'],
    queryFn: staffApi.members,
  });

  const addResponseMutation = useMutation({
    mutationFn: (data: { message: string; is_internal_note: boolean }) =>
      assistanceApi.addResponse(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-request-detail', requestId] });
      toast.success(isInternal ? 'Internal note added' : 'Patient response posted');
      setResponseMsg('');
    },
    onError: (err) => toast.error(extractError(err)),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => assistanceApi.updateStatus(requestId, { status }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff-request-detail', requestId] });
      toast.success(`Status updated to ${data.status}`);
    },
    onError: (err) => toast.error(extractError(err)),
  });

  const assignMutation = useMutation({
    mutationFn: (staffId: number) => assistanceApi.assign(requestId, staffId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff-request-detail', requestId] });
      toast.success(data.message);
    },
    onError: (err) => toast.error(extractError(err)),
  });

  if (isLoading) return <div className="p-12"><Spinner size="lg" /></div>;
  if (isError || !request) {
    return (
      <Card className="text-center py-8">
        <p className="text-red-600 font-semibold mb-4">Request record could not be loaded.</p>
        <Link to="/staff/requests"><Button variant="outline">Back to Requests</Button></Link>
      </Card>
    );
  }

  const handlePostResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseMsg.trim()) return;
    addResponseMutation.mutate({
      message: responseMsg.trim(),
      is_internal_note: isInternal,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/staff/requests" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Requests List
      </Link>

      {/* Top Banner Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                {request.reference_code}
              </span>
              <StatusBadge status={request.status} />
              <Badge label={request.priority.toUpperCase()} color={request.priority === 'high' ? 'red' : 'blue'} />
              {request.is_demo && <Badge label="Demo" color="yellow" />}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Submitted: {format(new Date(request.created_at), 'PPPP, p')}
            </p>
          </div>

          {/* Quick status actions */}
          <div className="flex items-center gap-2">
            {request.status === 'submitted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatusMutation.mutate('acknowledged')}
                isLoading={updateStatusMutation.isPending}
              >
                Acknowledge Request
              </Button>
            )}

            {['submitted', 'acknowledged'].includes(request.status) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => updateStatusMutation.mutate('in_progress')}
                isLoading={updateStatusMutation.isPending}
              >
                Set In Progress
              </Button>
            )}

            {request.status === 'in_progress' && (
              <Button
                variant="primary"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => updateStatusMutation.mutate('resolved')}
                isLoading={updateStatusMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Mark Resolved
              </Button>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
          <div>
            <span className="text-text-secondary block">Category:</span>
            <span className="font-semibold text-text-primary text-sm">{request.category.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="text-text-secondary block">Patient Language:</span>
            <span className="font-semibold text-text-primary text-sm">{request.preferred_language === 'ta' ? 'Tamil' : 'English'}</span>
          </div>
          <div>
            <span className="text-text-secondary block">Assigned Staff:</span>
            <span className="font-semibold text-text-primary text-sm">
              {staffMembers?.find(s => s.id === request.assigned_staff_id)?.name || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Patient Description */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
            Patient Concern / Statement
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-text-primary leading-relaxed border border-gray-200">
            {request.description}
          </div>
        </div>
      </Card>

      {/* Assignment & Operational Control */}
      <Card>
        <h3 className="font-bold text-sm text-text-primary mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-teal-600" /> Staff Delegation & Manual Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-2 items-center">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="text-xs rounded-xl border border-gray-300 p-2.5 flex-1 bg-white"
            >
              <option value="">-- Assign Staff Member --</option>
              {staffMembers?.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={!selectedStaffId || assignMutation.isPending}
              onClick={() => assignMutation.mutate(parseInt(selectedStaffId, 10))}
            >
              Assign
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="text-xs rounded-xl border border-gray-300 p-2.5 flex-1 bg-white"
            >
              <option value="">-- Change Status --</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_patient">Awaiting Patient</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={!newStatus || updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate(newStatus)}
            >
              Update
            </Button>
          </div>
        </div>
      </Card>

      {/* Responses Timeline & Post Form */}
      <Card>
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-600" /> Conversation & Notes History
        </h3>

        <div className="space-y-4 mb-6">
          {request.responses.length === 0 ? (
            <p className="text-xs text-text-secondary italic">No updates or responses posted yet.</p>
          ) : (
            request.responses.map((resp) => (
              <div
                key={resp.id}
                className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                  resp.is_internal_note
                    ? 'bg-yellow-50/70 border-yellow-200 text-yellow-950'
                    : 'bg-teal-50/40 border-teal-100 text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>{resp.author_name || 'Staff Member'}</span>
                    {resp.is_internal_note ? (
                      <Badge label="INTERNAL STAFF NOTE" color="yellow" />
                    ) : (
                      <Badge label="PATIENT VISIBLE" color="teal" />
                    )}
                  </div>
                  <span className="text-text-secondary">{format(new Date(resp.created_at), 'PPP, p')}</span>
                </div>
                <p>{resp.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Response Form */}
        <form onSubmit={handlePostResponse} className="pt-4 border-t border-gray-100 space-y-3">
          <Textarea
            label="Post New Communication"
            required
            value={responseMsg}
            onChange={(e) => setResponseMsg(e.target.value)}
            placeholder="Type your response to the patient or internal coordination note..."
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded text-teal-500 focus:ring-teal-500 h-4 w-4"
              />
              <span className={isInternal ? 'text-yellow-700 font-bold' : 'text-text-secondary'}>
                🔒 Internal Note Only (Hidden from Patient)
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={addResponseMutation.isPending}
            >
              <Send className="w-4 h-4 mr-1.5" />
              {isInternal ? 'Save Internal Note' : 'Send Patient Response'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
