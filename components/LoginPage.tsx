import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/database';
import { Loader2, Store, User, Lock } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await registerUser(username, password);
        // Auto login after register, or just success message?
        // Let's just log them in
        onLoginSuccess(username);
      } else {
        await loginUser(username, password);
        onLoginSuccess(username);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
           <Store className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-indigo-900">TindahanFlow</h1>
        <p className="text-gray-500 mt-2">Manage your sari-sari store with ease.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>
        
        {error && (
            <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg mb-4 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex justify-center items-center gap-2"
            >
                {isLoading && <Loader2 className="animate-spin w-5 h-5" />}
                {isRegistering ? 'Sign Up' : 'Login'}
            </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                <button 
                    onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    className="text-indigo-600 font-bold ml-1 hover:underline"
                >
                    {isRegistering ? "Login" : "Register"}
                </button>
            </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-gray-400">
          Powered by Google Sheets & Gemini AI
      </p>
    </div>
  );
};