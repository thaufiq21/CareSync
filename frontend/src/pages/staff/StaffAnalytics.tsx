import { useQuery } from '@tanstack/react-query';
import { analyticsApi, feedbackApi } from '@/services/api';
import { Card, Spinner, StarRating, Badge } from '@/components/ui';
import { Activity, MessageSquare, CheckCircle, Clock, Star, Users, PieChart as PieIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0D9488', '#123047', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

export default function StaffAnalytics() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['staff-analytics-deep'],
    queryFn: () => analyticsApi.get(30),
  });

  const { data: feedbackList, isLoading: feedbackLoading } = useQuery({
    queryKey: ['staff-all-feedback'],
    queryFn: feedbackApi.staffList,
  });

  if (analyticsLoading) return <div className="p-12"><Spinner size="lg" /></div>;

  const categoryData = Object.entries(analytics?.by_category || {}).map(([key, val]) => ({
    name: key.replace(/_/g, ' '),
    count: val,
  }));

  const statusData = Object.entries(analytics?.by_status || {}).map(([key, val]) => ({
    name: key.replace(/_/g, ' '),
    count: val,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Patient Experience Analytics</h1>
        <p className="text-text-secondary mt-1">
          Aggregated, privacy-compliant satisfaction scores, volume metrics, and operational trends.
        </p>
      </div>

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>Overall Patient Rating</span>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
          </div>
          <p className="text-3xl font-extrabold text-navy-500">
            {analytics?.feedback.avg_overall ? `${analytics.feedback.avg_overall} / 5` : 'N/A'}
          </p>
          <p className="text-xs text-text-secondary mt-1">Based on {analytics?.feedback.count} patient reviews</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>Communication Rating</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-extrabold text-teal-700">
            {analytics?.feedback.avg_communication ? `${analytics.feedback.avg_communication} / 5` : 'N/A'}
          </p>
          <p className="text-xs text-text-secondary mt-1">Clarity of guidance & instructions</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>Information Access</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-blue-600">
            {analytics?.feedback.avg_information ? `${analytics.feedback.avg_information} / 5` : 'N/A'}
          </p>
          <p className="text-xs text-text-secondary mt-1">Navigation & wayfinding ease</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
            <span>Resolution Rate</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-green-700">
            {analytics?.total_requests
              ? `${Math.round(((analytics.resolved_requests + analytics.closed_requests) / analytics.total_requests) * 100)}%`
              : '0%'}
          </p>
          <p className="text-xs text-text-secondary mt-1">Assistance requests closed/resolved</p>
        </Card>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <Card className="flex flex-col justify-between">
          <h3 className="font-bold text-text-primary text-base mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" /> Weekly Assistance Requests Volume
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.weekly_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" textAnchor="middle" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Categories Distribution */}
        <Card className="flex flex-col justify-between">
          <h3 className="font-bold text-text-primary text-base mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-navy-500" /> Inquiries by Category
          </h3>
          <div className="h-64 w-full">
            {categoryData.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-20">No category records found.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Patient Reviews Table */}
      <Card>
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-600" /> Patient Feedback Log
        </h3>

        {feedbackLoading ? (
          <Spinner size="md" />
        ) : feedbackList?.length === 0 ? (
          <p className="text-xs text-text-secondary py-6 text-center">No feedback records submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 uppercase font-semibold text-text-secondary">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Area / Dept</th>
                  <th className="py-2.5 px-3">Overall Rating</th>
                  <th className="py-2.5 px-3">Comments</th>
                  <th className="py-2.5 px-3">Language</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbackList?.map((fb) => (
                  <tr key={fb.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-text-secondary">
                      {format(new Date(fb.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-text-primary">
                      {fb.category || 'General'}
                    </td>
                    <td className="py-2.5 px-3">
                      <StarRating value={fb.overall_rating} />
                    </td>
                    <td className="py-2.5 px-3 max-w-sm italic text-text-secondary">
                      {fb.comments ? `"${fb.comments}"` : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge label={fb.preferred_language.toUpperCase()} color="gray" />
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
