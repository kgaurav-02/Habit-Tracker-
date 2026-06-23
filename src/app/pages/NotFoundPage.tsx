import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="text-center">
        <h1 className="text-8xl mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Page not found
        </p>
        <Button onClick={() => navigate('/')} size="lg">
          <Home className="w-5 h-5 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
