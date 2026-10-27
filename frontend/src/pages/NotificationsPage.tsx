import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, extractError } from '@/services/api';
import { Card, Button, Spinner, EmptyState, Badge } from '@/components/ui';
import { Bell, CheckCheck, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(false),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      toast.success('All notifications marked as read');
    },
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-secondary mt-1">Review live assistance request updates and care alerts.</p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        {isLoading ? (
          <Spinner size="lg" />
        ) : notifications?.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-12 h-12" />}
            title="No notifications yet"
            description="You'll be alerted whenever staff respond to your assistance requests."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications?.map((notif) => (
              <div
                key={notif.id}
                className={`py-4 px-3 rounded-xl transition-colors flex items-start justify-between gap-4 ${
                  notif.is_read ? 'opacity-70 bg-white' : 'bg-teal-50/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text-primary">{notif.title}</span>
                    {!notif.is_read && <Badge label="New" color="teal" />}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-gray-400">
                    {format(new Date(notif.created_at), 'PPP, p')}
                  </p>
                </div>

                {!notif.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReadMutation.mutate(notif.id)}
                    className="text-xs text-teal-700 hover:bg-teal-100/50"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
