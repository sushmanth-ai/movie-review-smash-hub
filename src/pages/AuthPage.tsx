import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) navigate('/predictions');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      if (!username.trim()) {
        toast({ title: 'Username required', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username);
      if (error) {
        toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: '🎉 Account created!', description: 'Please check your email to verify your account.' });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
      } else {
        navigate('/predictions');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </button>

        <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(255,215,0,0.15)]">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-2xl font-black text-primary">Prediction Game</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isSignUp ? 'Create your account to start predicting' : 'Login to make your predictions'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Username</label>
                <Input
                  type="text"
                  placeholder="MovieGuru123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-primary/30 text-foreground"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-primary/30 text-foreground"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-primary/30 text-foreground"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary via-yellow-500 to-primary text-primary-foreground font-bold py-3 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)]"
            >
              {loading ? '...' : isSignUp ? (
                <><UserPlus className="w-4 h-4 mr-2" /> Sign Up</>
              ) : (
                <><LogIn className="w-4 h-4 mr-2" /> Login</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary text-sm hover:underline"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
