import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { ShieldAlert, Users, Building2, HelpCircle, Activity, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['admin-health'],
    queryFn: adminApi.health,
  });

  const { data: staffList, isLoading: staffLoading } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: adminApi.listStaff,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">System Administration</h1>
        <p className="text-text-secondary mt-1">
          Manage staff credentials, department directories, FAQ knowledge base, and security audit logs.
        </p>
      </div>

      {/* System Status Banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-teal-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-text-primary">CareSync Core Services Active</h3>
            <p className="text-xs text-text-secondary">
              Backend API, SQLite database, and session authentication running normally.
            </p>
          </div>
        </div>
        <Badge label="SYSTEM HEALTHY" color="green" />
      </Card>

      {/* Admin Modules Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:border-teal-300 transition-colors">
          <Users className="w-8 h-8 text-teal-600 mb-3" />
          <h3 className="font-bold text-base text-text-primary mb-1">Staff Management</h3>
          <p className="text-xs text-text-secondary mb-4">
            Create and maintain staff member credentials and access permissions.
          </p>
          <Link to="/admin/staff">
            <Button variant="outline" size="sm" className="w-full">
              Manage Staff <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </Card>

        <Card className="hover:border-teal-300 transition-colors">
          <Building2 className="w-8 h-8 text-navy-500 mb-3" />
          <h3 className="font-bold text-base text-text-primary mb-1">Departments</h3>
          <p className="text-xs text-text-secondary mb-4">
            Update hospital locations, opening hours, navigation directions, and accessibility info.
          </p>
          <Link to="/admin/departments">
            <Button variant="outline" size="sm" className="w-full">
              Manage Directory <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </Card>

        <Card className="hover:border-teal-300 transition-colors">
          <HelpCircle className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-bold text-base text-text-primary mb-1">FAQ Content</h3>
          <p className="text-xs text-text-secondary mb-4">
            Curate bilingual English and Tamil approved Q&As for the automated assistant.
          </p>
          <Link to="/admin/faqs">
            <Button variant="outline" size="sm" className="w-full">
              Manage FAQs <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </Card>

        <Card className="hover:border-teal-300 transition-colors">
          <ShieldAlert className="w-8 h-8 text-yellow-600 mb-3" />
          <h3 className="font-bold text-base text-text-primary mb-1">Audit Events</h3>
          <p className="text-xs text-text-secondary mb-4">
            Inspect immutable audit logs for administrative modifications and access events.
          </p>
          <Link to="/admin/audit">
            <Button variant="outline" size="sm" className="w-full">
              Inspect Audit Log <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
