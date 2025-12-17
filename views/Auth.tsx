import React, { useState } from 'react';
import { Button, Input, Card, Select } from '../components/UI';
import { login, register, resetPassword } from '../services/api';
import { User, UserRole } from '../types';
import { Recycle, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '../components/Logo';

type AuthMode = 'login' | 'signup' | 'forgot';

interface AuthViewProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
  initialMode?: AuthMode;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onBack, initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.OPERATOR);

  const clearState = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        const user = await login(username, password);
        onSuccess(user);
      } else if (mode === 'signup') {
        const user = await register(username, password, role);
        onSuccess(user);
      } else if (mode === 'forgot') {
        await resetPassword(username);
        setSuccessMsg(`If an account exists for "${username}", a reset link has been sent.`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-eco-cream flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute inset-0 bg-denim-texture opacity-5 pointer-events-none"></div>
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-eco-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
       <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-eco-orange/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <Card className="w-full max-w-sm bg-white/95 backdrop-blur shadow-2xl relative z-10 animate-fade-in border-none">
        <button onClick={onBack} className="absolute top-6 left-6 text-gray-400 hover:text-eco-charcoal transition-colors">
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center mb-8 pt-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-eco-charcoal">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
          <p className="text-gray-500 text-sm text-center mt-2">
            {mode === 'login' && 'Enter your credentials to access the dashboard'}
            {mode === 'signup' && 'Join the EcoTrace recycling network'}
            {mode === 'forgot' && 'Enter your username to verify your identity'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 text-center flex items-center justify-center gap-2 font-medium">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {successMsg && mode === 'forgot' ? (
          <Button variant="secondary" onClick={() => clearState('login')}>Back to Login</Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input 
              label="Username" 
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            
            {mode !== 'forgot' && (
              <Input 
                label="Password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            )}

            {mode === 'signup' && (
              <Select label="Role" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                <option value={UserRole.OPERATOR}>Operator (Standard)</option>
                <option value={UserRole.ADMIN}>Admin (Full Access)</option>
              </Select>
            )}

            <div className="pt-2">
              <Button type="submit" isLoading={loading} variant="primary">
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
          {mode === 'login' && (
            <>
              <p className="text-sm text-gray-500">
                New to EcoTrace? <button onClick={() => clearState('signup')} className="text-eco-orange font-bold hover:underline">Sign Up</button>
              </p>
              <button onClick={() => clearState('forgot')} className="text-xs text-gray-400 hover:text-eco-charcoal font-medium">
                Forgot your password?
              </button>
            </>
          )}
          
          {(mode === 'signup' || mode === 'forgot') && !successMsg && (
            <p className="text-sm text-gray-500">
              Already have an account? <button onClick={() => clearState('login')} className="text-eco-orange font-bold hover:underline">Log In</button>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};