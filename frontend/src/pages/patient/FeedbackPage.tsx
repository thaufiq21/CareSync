import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi, empathyApi, extractError } from '@/services/api';
import { Card, Button, Textarea, Select, Alert, EmptyState, StarRating, Badge, Spinner } from '@/components/ui';
import { Star, Smile, Heart, MessageSquare, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const FEELINGS = [
  { key: 'comfortable', label: 'Comfortable', icon: '😊' },
  { key: 'confused', label: 'Confused', icon: '🤔' },
  { key: 'worried', label: 'Worried', icon: '😟' },
  { key: 'frustrated', label: 'Frustrated', icon: '😤' },
  { key: 'need_assistance', label: 'Need Assistance', icon: '🙋' },
  { key: 'prefer_not_to_answer', label: 'Prefer Not to Answer', icon: '🤐' },
];

export default function FeedbackPage() {
  const { t, language } = useAuth();
  const queryClient = useQueryClient();

  // Ratings 1 to 5
  const [commRating, setCommRating] = useState(5);
  const [infoRating, setInfoRating] = useState(5);
  const [assistRating, setAssistRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [category, setCategory] = useState('Outpatient Services');
  const [comments, setComments] = useState('');
  const [formError, setFormError] = useState('');

  // Empathy check-in state
  const [selectedFeeling, setSelectedFeeling] = useState<string>('');
  const [feelingComment, setFeelingComment] = useState('');

  const { data: myFeedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ['feedback', 'mine'],
    queryFn: feedbackApi.mine,
  });

  const feedbackMutation = useMutation({
    mutationFn: (data: object) => feedbackApi.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'mine'] });
      toast.success(t('feedbackSubmitted'));
      setComments('');
      setFormError('');
    },
    onError: (err) => setFormError(extractError(err)),
  });

  const checkInMutation = useMutation({
    mutationFn: (data: object) => empathyApi.submit(data),
    onSuccess: () => {
      toast.success('Thank you for checking in with us today!');
      setSelectedFeeling('');
      setFeelingComment('');
    },
    onError: (err) => toast.error(extractError(err)),
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedbackMutation.mutate({
      communication_rating: commRating,
      information_rating: infoRating,
      assistance_rating: assistRating,
      overall_rating: overallRating,
      category,
      comments: comments.trim() || null,
      preferred_language: language,
    });
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeling) {
      toast.error('Please select how you are feeling');
      return;
    }
    checkInMutation.mutate({
      selected_feeling: selectedFeeling,
      optional_comment: feelingComment.trim() || null,
    });
  };

  const renderRatingSelector = (label: string, value: number, onChange: (v: number) => void) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
              star <= value
                ? 'bg-yellow-400 text-yellow-900 shadow-sm'
                : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-100'
            }`}
          >
            {star}★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">{t('patientFeedback')}</h1>
        <p className="text-text-secondary mt-1">
          Your authentic feedback drives continuous communication and patient support enhancements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feedback & Empathy Check-In Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Empathy Check-in */}
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50/40 to-white">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-teal-600 fill-teal-100" />
              <h2 className="text-lg font-bold text-text-primary">{t('checkInTitle')}</h2>
            </div>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              {t('checkInSubtitle')} This information is entirely non-diagnostic and helps volunteers offer better assistance.
            </p>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FEELINGS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedFeeling(f.key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                      selectedFeeling === f.key
                        ? 'border-teal-500 bg-teal-50 text-teal-800 ring-2 ring-teal-500/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-text-primary'
                    }`}
                  >
                    <span className="text-lg">{f.icon}</span>
                    <span>{t(f.key as any) || f.label}</span>
                  </button>
                ))}
              </div>

              {selectedFeeling && (
                <div className="space-y-3 pt-2">
                  <Textarea
                    placeholder={t('checkInComment')}
                    value={feelingComment}
                    onChange={(e) => setFeelingComment(e.target.value)}
                    className="min-h-[70px] text-xs"
                  />
                  <Button type="submit" variant="primary" size="sm" isLoading={checkInMutation.isPending}>
                    Save Check-In
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Feedback Form */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              <h2 className="text-xl font-bold text-text-primary">{t('feedbackTitle')}</h2>
            </div>

            {formError && <Alert type="error" className="mb-4"><span>{formError}</span></Alert>}

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              {renderRatingSelector(t('communicationRating'), commRating, setCommRating)}
              {renderRatingSelector(t('informationRating'), infoRating, setInfoRating)}
              {renderRatingSelector(t('assistanceRating'), assistRating, setAssistRating)}
              {renderRatingSelector(t('overallRating'), overallRating, setOverallRating)}

              <Select
                label="Department or Area Experienced"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Registration & Admissions', label: 'Registration & Admissions' },
                  { value: 'Outpatient Consultation', label: 'Outpatient Consultation' },
                  { value: 'Laboratory & Diagnostics', label: 'Laboratory & Diagnostics' },
                  { value: 'Pharmacy', label: 'Pharmacy' },
                  { value: 'Radiology & Imaging', label: 'Radiology & Imaging' },
                  { value: 'Billing & Accounts', label: 'Billing & Accounts' },
                  { value: 'Patient Assistance Desk', label: 'Patient Assistance Desk' },
                  { value: 'General Hospital Navigation', label: 'General Hospital Navigation' },
                ]}
              />

              <Textarea
                label={t('comments')}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What went well? Where could staff or signage be clearer?"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={feedbackMutation.isPending}
              >
                Submit Hospital Experience Feedback
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Submission History */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-bold text-text-primary mb-3">Your Submitted Feedback</h3>
            {feedbackLoading ? (
              <Spinner size="md" />
            ) : myFeedback?.length === 0 ? (
              <p className="text-xs text-text-secondary py-4 text-center">No feedback submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {myFeedback?.map((fb) => (
                  <div key={fb.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <StarRating value={fb.overall_rating} />
                      <span className="text-[10px] text-text-secondary">
                        {format(new Date(fb.created_at), 'dd MMM yyyy')}
                      </span>
                    </div>
                    {fb.category && <p className="text-xs font-semibold text-teal-800">{fb.category}</p>}
                    {fb.comments && <p className="text-xs text-text-secondary italic">"{fb.comments}"</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
