import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, extractError } from '@/services/api';
import { Card, Button, Input, Select, Spinner, Badge, Alert } from '@/components/ui';
import { Users, UserPlus, Shield, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStaff() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [formError, setFormError] = useState('');

  const { data: staffList, isLoading } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: adminApi.listStaff,
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => adminApi.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-list'] });
      toast.success('Staff account created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setFormError('');
    },
    onError: (err) => setFormError(extractError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => adminApi.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-list'] });
      toast.success('Staff account updated!');
    },
    onError: (err) => toast.error(extractError(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setFormError('All fields are required.');
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Staff Account Management</h1>
        <p className="text-text-secondary mt-1">
          Create, update, and toggle active permissions for healthcare staff and administrators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Staff Form */}
        <Card className="lg:col-span-1">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" /> Create Staff Member
          </h2>

          {formError && <Alert type="error" className="mb-4"><span>{formError}</span></Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Staff Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Ramesh Kumar"
            />

            <Input
              label="Hospital Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. staff@caresync.demo"
            />

            <Input
              label="Temporary Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
            />

            <Select
              label="Assigned System Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'staff', label: 'Hospital Staff Member' },
                { value: 'admin', label: 'System Administrator' },
              ]}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={createMutation.isPending}>
              Create Account
            </Button>
          </form>
        </Card>

        {/* Existing Staff Table */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> Active Staff Accounts
          </h2>

          {isLoading ? (
            <Spinner size="md" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 uppercase font-semibold text-text-secondary">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(staffList as any[])?.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 font-semibold text-text-primary">{member.name}</td>
                      <td className="py-3 px-3 text-text-secondary">{member.email}</td>
                      <td className="py-3 px-3">
                        <Badge label={member.role.toUpperCase()} color={member.role === 'admin' ? 'navy' : 'teal'} />
                      </td>
                      <td className="py-3 px-3">
                        <Badge label={member.is_active ? 'Active' : 'Deactivated'} color={member.is_active ? 'green' : 'red'} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateMutation.mutate({
                            id: member.id,
                            data: { is_active: !member.is_active }
                          })}
                        >
                          {member.is_active ? 'Deactivate' : 'Reactivate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
