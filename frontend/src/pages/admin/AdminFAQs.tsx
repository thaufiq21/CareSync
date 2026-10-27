import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { faqsApi, extractError } from '@/services/api';
import { Card, Button, Input, Textarea, Spinner, Badge, Alert } from '@/components/ui';
import { HelpCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFAQs() {
  const queryClient = useQueryClient();
  const [qEn, setQEn] = useState('');
  const [aEn, setAEn] = useState('');
  const [qTa, setQTa] = useState('');
  const [aTa, setATa] = useState('');
  const [category, setCategory] = useState('general');
  const [formError, setFormError] = useState('');

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: () => faqsApi.list(undefined),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => faqsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      toast.success('FAQ entry saved successfully!');
      setQEn('');
      setAEn('');
      setQTa('');
      setATa('');
      setFormError('');
    },
    onError: (err) => setFormError(extractError(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qEn.trim() || !aEn.trim()) {
      setFormError('English question and answer are required.');
      return;
    }
    createMutation.mutate({
      question_en: qEn.trim(),
      answer_en: aEn.trim(),
      question_ta: qTa.trim() || null,
      answer_ta: aTa.trim() || null,
      category,
      is_published: true,
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">FAQ Knowledge Base Management</h1>
        <p className="text-text-secondary mt-1">
          Maintain verified bilingual questions and answers used by the patient automated assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-600" /> Create Approved FAQ
          </h2>

          {formError && <Alert type="error" className="mb-4"><span>{formError}</span></Alert>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Question (English)" required value={qEn} onChange={(e) => setQEn(e.target.value)} />
            <Textarea label="Answer (English)" required value={aEn} onChange={(e) => setAEn(e.target.value)} />
            <Input label="Question (Tamil - விருப்பமான)" value={qTa} onChange={(e) => setQTa(e.target.value)} />
            <Textarea label="Answer (Tamil - விருப்பமான)" value={aTa} onChange={(e) => setATa(e.target.value)} />

            <Button type="submit" variant="primary" className="w-full" isLoading={createMutation.isPending}>
              Save FAQ
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600" /> Published Hospital FAQs
          </h2>

          {isLoading ? (
            <Spinner size="md" />
          ) : (
            <div className="divide-y divide-gray-100">
              {faqs?.map((f) => (
                <div key={f.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-navy-500 text-sm">EN: {f.question_en}</h3>
                    <Badge label={f.is_published ? 'Published' : 'Draft'} color={f.is_published ? 'green' : 'gray'} />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{f.answer_en}</p>

                  {f.question_ta && (
                    <div className="pt-2 text-xs border-t border-gray-100 text-teal-900 bg-teal-50/40 p-2.5 rounded-xl">
                      <p className="font-semibold">TA: {f.question_ta}</p>
                      <p className="text-text-secondary mt-0.5">{f.answer_ta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
