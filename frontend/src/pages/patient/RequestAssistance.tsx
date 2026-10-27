import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { assistanceApi, departmentsApi, extractError } from '@/services/api';
import { Card, Input, Textarea, Select, Button, Alert, Checkbox } from '@/components/ui';
import { MessageSquare, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  { value: 'hospital_navigation', label: 'Hospital Navigation' },
  { value: 'language_assistance', label: 'Language Assistance' },
  { value: 'understanding_procedures', label: 'Understanding Hospital Procedures' },
  { value: 'wheelchair_mobility_assistance', label: 'Wheelchair / Mobility Assistance' },
  { value: 'appointment_related_support', label: 'Appointment-Related Support' },
  { value: 'communication_assistance', label: 'Communication Assistance' },
  { value: 'general_patient_service', label: 'General Patient Service' },
  { value: 'other_non_emergency', label: 'Other Non-Emergency Support' },
];

export default function RequestAssistance() {
  const { t, language } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState('hospital_navigation');
  const [description, setDescription] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(language);
  const [departmentId, setDepartmentId] = useState('');
  const [contactPreference, setContactPreference] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState('');
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => assistanceApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['assistance-requests'] });
      toast.success(`${t('requestSubmitted')} Ref: ${res.reference_code}`);
      navigate(`/my-requests/${res.id}`);
    },
    onError: (err) => {
      setFormError(extractError(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      setFormError('Please provide a descriptive request of at least 10 characters.');
      return;
    }
    if (!consent) {
      setFormError('You must acknowledge the non-emergency notice.');
      return;
    }

    createMutation.mutate({
      category,
      description: description.trim(),
      preferred_language: preferredLanguage,
      department_id: departmentId ? parseInt(departmentId, 10) : null,
      contact_preference: contactPreference.trim() || null,
      accessibility_needs: accessibilityNeeds.trim() || null,
      consent,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{t('requestAssistance')}</h1>
        <p className="text-text-secondary mt-1">
          Submit your non-emergency inquiry or support need. Authorized hospital staff will review and respond.
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-800 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-red-900 mb-0.5">Emergency Notice</p>
          <p>{t('emergencyWarning')}</p>
        </div>
      </div>

      <Card>
        {formError && <Alert type="error" className="mb-4"><span>{formError}</span></Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label={t('requestCategory')}
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map(c => ({ value: c.value, label: t(c.value as any) || c.label }))}
          />

          <Select
            label="Department Involved (Optional)"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={departments?.map(d => ({ value: d.id.toString(), label: d.name })) || []}
            placeholder="-- Select Department If Known --"
          />

          <Textarea
            label={t('requestDescription')}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain where you are, what you need assistance with, or what is unclear..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('preferredLanguage')}
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as any)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'ta', label: 'தமிழ் (Tamil)' },
              ]}
            />

            <Input
              label={t('contactPreference')}
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value)}
              placeholder="e.g. Phone, in-person at lobby"
            />
          </div>

          <Input
            label={t('accessibilityNeeds')}
            value={accessibilityNeeds}
            onChange={(e) => setAccessibilityNeeds(e.target.value)}
            placeholder="e.g. Need wheelchair escort, sign assistance"
          />

          <div className="pt-2 border-t border-gray-100">
            <Checkbox
              label={t('privacyNotice')}
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={createMutation.isPending}
          >
            <MessageSquare className="w-5 h-5 mr-1" /> Submit Assistance Request
          </Button>
        </form>
      </Card>
    </div>
  );
}
