import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Lock, ShieldAlert } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to auth page
        navigate('/auth');
      } else if (isAdmin) {
        // Already admin, go to dashboard
        navigate('/admin/dashboard');
      }
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show access denied if user is logged in but not admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)'
      }}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <ShieldAlert className="w-16 h-16 text-destructive" />
              <h1 className="text-2xl font-bold text-center">Access Denied</h1>
              <p className="text-sm text-muted-foreground text-center">
                You don't have admin privileges to access this area.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)'
    }}>
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <Lock className="w-16 h-16 text-primary" />
            <h1 className="text-2xl font-bold text-center">Admin Access</h1>
            <p className="text-sm text-muted-foreground text-center">
              Redirecting to login...
            </p>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default AdminLogin;
