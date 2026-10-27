import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi, extractError } from '@/services/api';
import { Card, Button, Input, Textarea, Spinner, Badge, Alert } from '@/components/ui';
import { Building2, Plus, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDepartments() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [directions, setDirections] = useState('');
  const [formError, setFormError] = useState('');

  const { data: departments, isLoading } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => departmentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      toast.success('Department created!');
      setName('');
      setDescription('');
      setLocation('');
      setBuilding('');
      setFloor('');
      setOpeningHours('');
      setDirections('');
      setFormError('');
    },
    onError: (err) => setFormError(extractError(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Department name is required');
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      building: building.trim() || null,
      floor: floor.trim() || null,
      opening_hours: openingHours.trim() || null,
      directions: directions.trim() || null,
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Department Directory Management</h1>
        <p className="text-text-secondary mt-1">
          Configure physical locations, floor numbers, navigation markers, and patient hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600" /> Add New Department
          </h2>

          {formError && <Alert type="error" className="mb-4"><span>{formError}</span></Alert>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Department Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Location Description" value={location} onChange={(e) => setLocation(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} />
              <Input label="Floor" value={floor} onChange={(e) => setFloor(e.target.value)} />
            </div>
            <Input label="Operating Hours" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} />
            <Textarea label="General Directions" value={directions} onChange={(e) => setDirections(e.target.value)} />
            <Textarea label="Overview Description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <Button type="submit" variant="primary" className="w-full" isLoading={createMutation.isPending}>
              Save Department
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" /> Configured Hospital Departments
          </h2>

          {isLoading ? (
            <Spinner size="md" />
          ) : (
            <div className="divide-y divide-gray-100">
              {departments?.map((dept) => (
                <div key={dept.id} className="py-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-navy-500">{dept.name}</h3>
                    <div className="flex items-center gap-2">
                      {dept.is_demo && <Badge label="Demo" color="yellow" />}
                      <Badge label={dept.is_active ? 'Active' : 'Inactive'} color={dept.is_active ? 'green' : 'red'} />
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary">{dept.description}</p>
                  <p className="text-xs text-teal-700">
                    Location: {dept.location} | Floor: {dept.floor || 'N/A'} | Hours: {dept.opening_hours || 'Standard'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
