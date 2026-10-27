import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Building2, Star, HelpCircle, ChevronRight, Shield, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

const DEMO_BANNER = () => (
  <div className="demo-banner" role="banner">
    ⚠️ DEMONSTRATION PROJECT — Sri Eshwar College of Engineering Design Thinking Project — Not a real hospital system
  </div>
);

const FEATURES = [
  { icon: MessageSquare, title: 'Request Assistance', desc: 'Submit non-emergency assistance requests and track their status in real time.' },
  { icon: Building2, title: 'Hospital Directory', desc: 'Find any department with clear directions, floor information, and opening hours.' },
  { icon: HelpCircle, title: 'FAQ Assistant', desc: 'Get answers to common hospital questions in English or Tamil, instantly.' },
  { icon: Star, title: 'Share Feedback', desc: 'Rate your experience and help the hospital understand patient needs.' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your data is protected. Only you and authorized staff can see your requests.' },
  { icon: Users, title: 'Tamil & English', desc: 'Full bilingual support so every patient can communicate comfortably.' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Create Your Account', desc: 'Register in seconds with your name and email.' },
  { step: '2', title: 'Submit a Request', desc: 'Describe what you need. We\'ll route it to the right staff member.' },
  { step: '3', title: 'Get a Response', desc: 'Track your request status and receive staff responses in your dashboard.' },
  { step: '4', title: 'Share Feedback', desc: 'Help us improve by sharing your experience after your visit.' },
];

export default function LandingPage() {
  const { isAuthenticated, user, t } = useAuth();

  return (
    <div>
      <DEMO_BANNER />

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-500 to-navy-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/40 rounded-full px-4 py-1.5 text-teal-300 text-sm font-medium mb-8">
            <Heart className="w-4 h-4 fill-current" />
            Design Thinking Project — Patient Support Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-balance">
            Healthcare communication that
            <span className="text-teal-400"> puts patients first.</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Find hospital information, request assistance, share your concerns, and stay informed throughout your hospital visit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to={user?.role === 'staff' ? '/staff/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                <Button size="lg" variant="primary" className="bg-teal-500 hover:bg-teal-400 text-white w-full sm:w-auto">
                  Go to Dashboard <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" variant="primary" className="bg-teal-500 hover:bg-teal-400 text-white w-full sm:w-auto">
                    Get Started Free <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/hospital-directory">
                  <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto">
                    Find a Department
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">The Problem We're Solving</h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            Patients often feel <strong>confused, anxious, or unheard</strong> during hospital visits because they may not receive clear
            information or sufficient support. CareSync provides a website through which patients can find information,
            express concerns, request assistance, and receive timely responses from authorized hospital staff.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-sm font-medium">
            <Heart className="w-4 h-4" />
            <em>How might we help patients feel heard, informed, and supported throughout their hospital journey?</em>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">Everything You Need</h2>
            <p className="text-text-secondary">A complete patient support toolkit for your hospital visit.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">How It Works</h2>
            <p className="text-text-secondary">Simple steps to get the support you need.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-navy-500 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-teal-100 mb-8">Create your free patient account and access all features instantly.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 w-full sm:w-auto">
                Create Patient Account
              </Button>
            </Link>
            <Link to="/hospital-directory">
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 w-full sm:w-auto">
                Browse Hospital Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Medical disclaimer */}
      <section className="py-6 px-4 bg-yellow-50 border-t border-yellow-200">
        <div className="max-w-3xl mx-auto text-center text-xs text-yellow-800">
          <strong>Important:</strong> CareSync is a student design prototype and is not a real hospital system.
          It does not provide medical advice, diagnose illnesses, prescribe treatments, or handle medical emergencies.
          For medical emergencies, please call your local emergency service immediately.
          This application uses demonstration data only.
        </div>
      </section>
    </div>
  );
}
