import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, departmentsApi, extractError } from '@/services/api';
import { Card, Input, Textarea, Select, Button, Spinner, Alert, EmptyState, Badge } from '@/components/ui';
import { Calendar, Plus, CheckSquare, Square, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function VisitPlanner() {
  const { t } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Pre-visit checklist states
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Government photo ID (Aadhaar, Passport, or Driving License)', done: false },
    { id: 2, text: 'Previous medical records, prescriptions, and test reports', done: false },
    { id: 3, text: 'Insurance card or policy details (if applicable)', done: false },
    { id: 4, text: 'List of currently active medicines and allergies', done: false },
    { id: 5, text: 'Arranged preferred transportation or mobility support', done: false },
  ]);

  const toggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const { data: appointments, isLoading: apptLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentsApi.list,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Demonstration appointment planned successfully!');
      setTitle('');
      setDepartmentId('');
      setAppointmentDate('');
      setNotes('');
      setQuestions([]);
      setFormError('');
    },
    onError: (err) => {
      setFormError(extractError(err));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => appointmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled');
    },
    onError: (err) => {
      toast.error(extractError(err));
    },
  });

  const addQuestion = () => {
    if (questionText.trim()) {
      setQuestions([...questions, questionText.trim()]);
      setQuestionText('');
    }
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !appointmentDate) {
      setFormError('Please provide a title and valid appointment date/time.');
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      department_id: departmentId ? parseInt(departmentId, 10) : null,
      appointment_date: new Date(appointmentDate).toISOString(),
      notes: notes.trim() || null,
      questions: questions.length > 0 ? JSON.stringify(questions) : null,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{t('visitPlanner')}</h1>
        <p className="text-text-secondary mt-1">
          Plan upcoming appointments, organize your doctor discussion questions, and track pre-visit checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Checklist */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-text-primary">{t('addAppointment')}</h2>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-700" />
              <span>{t('demoAppointmentNote')}</span>
            </div>

            {formError && <Alert type="error" className="mb-4"><span>{formError}</span></Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('appointmentTitle')}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. General OPD Follow-up"
              />

              <Select
                label={t('selectDepartment')}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                options={departments?.map(d => ({ value: d.id.toString(), label: d.name })) || []}
                placeholder="-- Optional Department --"
              />

              <Input
                label={t('appointmentDate')}
                type="datetime-local"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />

              <Textarea
                label={t('appointmentNotes')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bring previous scan records..."
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Questions for the Doctor
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g. How long should I take this medicine?"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    Add
                  </Button>
                </div>
                {questions.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {questions.map((q, idx) => (
                      <li key={idx} className="flex items-center justify-between text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
                        <span>• {q}</span>
                        <button type="button" onClick={() => removeQuestion(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button type="submit" variant="primary" className="w-full" isLoading={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-1" /> Save Planned Visit
              </Button>
            </form>
          </Card>

          {/* Pre-Visit Checklist */}
          <Card>
            <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-600" />
              {t('preVisitChecklist')}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Check off recommended items before leaving for your hospital visit.
            </p>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  {item.done ? (
                    <CheckSquare className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`text-xs ${item.done ? 'line-through text-gray-400' : 'text-text-primary'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Planned Appointments List */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              {t('myAppointments')}
            </h2>

            {apptLoading ? (
              <Spinner size="lg" />
            ) : appointments?.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-12 h-12" />}
                title={t('noAppointments')}
                description="Use the visit planner form on the left to add upcoming consultations."
              />
            ) : (
              <div className="space-y-4">
                {appointments?.map((appt) => {
                  const parsedQuestions: string[] = appt.questions ? JSON.parse(appt.questions) : [];
                  return (
                    <div
                      key={appt.id}
                      className="border border-gray-200 rounded-2xl p-5 hover:border-teal-200 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-navy-500">{appt.title}</h3>
                            <Badge
                              label={appt.status}
                              color={appt.status === 'cancelled' ? 'red' : 'teal'}
                            />
                            {appt.is_demo && <Badge label="Demo" color="yellow" />}
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Scheduled: <strong>{format(new Date(appt.appointment_date), 'PPP, p')}</strong>
                          </p>
                        </div>

                        {appt.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 self-start"
                            onClick={() => cancelMutation.mutate(appt.id)}
                            isLoading={cancelMutation.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>

                      {appt.notes && (
                        <p className="text-sm text-text-secondary bg-gray-50 p-3 rounded-xl mb-3">
                          <strong>Notes:</strong> {appt.notes}
                        </p>
                      )}

                      {parsedQuestions.length > 0 && (
                        <div className="mt-2 text-xs bg-teal-50/50 border border-teal-100 p-3 rounded-xl">
                          <p className="font-semibold text-teal-800 mb-1">Questions planned for doctor:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-teal-900">
                            {parsedQuestions.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
