import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Heart, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mx-auto">
          <Heart className="w-8 h-8 fill-teal-100" />
        </div>
        <h1 className="text-4xl font-extrabold text-navy-500">404</h1>
        <h2 className="text-xl font-bold text-text-primary">Page Not Found</h2>
        <p className="text-sm text-text-secondary">
          The requested page could not be located. You may have typed an incorrect URL or the page has moved.
        </p>
        <div>
          <Link to="/">
            <Button variant="primary">
              <Home className="w-4 h-4 mr-1.5" /> Return to CareSync Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
