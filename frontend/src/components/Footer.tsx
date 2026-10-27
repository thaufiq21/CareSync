import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-500 text-white mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold">CareSync</span>
            </div>
            <p className="text-sm text-blue-200 mb-2">Connecting Care. Empowering Patients.</p>
            <p className="text-xs text-blue-300 leading-relaxed">
              A Smart Patient Support and Hospital Communication Platform.
              This is a student Design Thinking project by Sri Eshwar College of Engineering, Coimbatore.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-400/40 rounded-lg text-yellow-300 text-xs">
              ⚠️ Demo prototype — not a real hospital system
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-blue-100">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/hospital-directory', label: 'Hospital Directory' },
                { to: '/request-assistance', label: 'Request Assistance' },
                { to: '/faq-assistant', label: 'FAQ Assistant' },
                { to: '/feedback', label: 'Patient Feedback' },
                { to: '/register', label: 'Create Account' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-blue-300 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Credits */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-blue-100">Project Team</h3>
            <ul className="space-y-1 text-sm text-blue-300">
              <li>THAUFIQ.N.H (Lateral)</li>
              <li>Hari Sudhan S (25CS063)</li>
              <li>Adithiyan (25CS004)</li>
            </ul>
            <p className="mt-3 text-xs text-blue-400">Sri Eshwar College of Engineering</p>
            <p className="text-xs text-blue-400">Coimbatore, Tamil Nadu, India</p>

            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-blue-400">
                ⚕️ Not for medical diagnosis, treatment, or emergencies.
                <br />
                For emergencies, call your local emergency service.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-400">
          <p>© 2024 CareSync. Student Design Thinking Project.</p>
          <p>Built with React, FastAPI, and SQLite</p>
        </div>
      </div>
    </footer>
  );
}
