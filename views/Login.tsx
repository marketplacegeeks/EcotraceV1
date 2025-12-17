import React, { useState } from 'react';
import { Button, Input, Card } from '../components/UI';
import { login } from '../services/api';
import { User } from '../types';
import { Recycle } from 'lucide-react';

export const LoginView: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username);
      if (user) {
        onLogin(user);
      } else {
        alert("Invalid user. Try 'admin' or 'operator'.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white/95 backdrop-blur shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-100 p-3 rounded-full mb-4">
            <Recycle size={40} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EcoTrace</h1>
          <p className="text-gray-500">Recycling Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Username" 
            placeholder="e.g. admin, operator" 
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <Button type="submit" isLoading={loading}>
            Sign In
          </Button>
          <p className="text-xs text-center text-gray-400 mt-4">
            Demo users: 'admin', 'operator'
          </p>
        </form>
      </Card>
    </div>
  );
};