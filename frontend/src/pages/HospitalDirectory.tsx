import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '@/services/api';
import { Card, Input, Spinner, EmptyState, Badge } from '@/components/ui';
import { Building2, Search, MapPin, Clock, Phone, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HospitalDirectory() {
  const { t } = useAuth();
  const [search, setSearch] = useState('');

  const { data: departments, isLoading, isError } = useQuery({
    queryKey: ['departments', search],
    queryFn: () => departmentsApi.list(search || undefined),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-lg text-xs font-medium mb-3">
          <Info className="w-3.5 h-3.5" />
          {t('demoDataNotice')}
        </div>
        <h1 className="text-3xl font-bold text-text-primary">{t('departmentDirectory')}</h1>
        <p className="text-text-secondary mt-1">
          Explore hospital departments, service locations, operating hours, and navigation instructions.
        </p>
      </div>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <Input
            placeholder={t('searchDepartments')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <Spinner size="lg" />
      ) : isError ? (
        <Card className="text-center py-8 text-red-600">
          Failed to load departments. Please make sure the backend is running.
        </Card>
      ) : departments?.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-12 h-12" />}
          title="No departments found"
          description="Try searching with a different keyword."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments?.map((dept) => (
            <Card key={dept.id} className="flex flex-col justify-between hover:shadow-card-hover transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-navy-500">{dept.name}</h3>
                  {dept.is_demo && <Badge label="Demo" color="yellow" />}
                </div>

                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {dept.description}
                </p>

                <div className="space-y-2 text-xs text-text-secondary border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span><strong>Location:</strong> {dept.location}</span>
                  </div>

                  {dept.floor && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold w-4 text-center">F:</span>
                      <span><strong>Floor / Building:</strong> {dept.floor} {dept.building ? `(${dept.building})` : ''}</span>
                    </div>
                  )}

                  {dept.opening_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span><strong>Hours:</strong> {dept.opening_hours}</span>
                    </div>
                  )}

                  {dept.contact_information && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span><strong>Contact:</strong> {dept.contact_information}</span>
                    </div>
                  )}
                </div>
              </div>

              {dept.directions && (
                <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <p className="text-xs font-semibold text-text-primary mb-1">Directions:</p>
                  <p className="text-xs text-text-secondary">{dept.directions}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
