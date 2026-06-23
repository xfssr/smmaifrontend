import { AlertCircle, Home } from 'lucide-react';
import type React from 'react';

type NotFoundPageProps = {
  path: string;
};

const NotFoundPage: React.FC<NotFoundPageProps> = ({ path }) => (
  <div className="glass-card border-white/10 p-12 text-center space-y-6">
    <AlertCircle className="mx-auto h-16 w-16 text-orange" />
    <div className="space-y-2">
      <h1 className="text-3xl font-black uppercase tracking-tight">Route Not Found</h1>
      <p className="mx-auto max-w-sm text-sm font-bold uppercase tracking-tight text-muted">
        {path ? `No active React route matches "#/${path}".` : 'No active React route matches this address.'}
      </p>
    </div>
    <button
      onClick={() => {
        window.location.hash = '#/';
      }}
      className="btn-orange mx-auto px-10"
    >
      <Home size={18} />
      Return Home
    </button>
  </div>
);

export default NotFoundPage;
