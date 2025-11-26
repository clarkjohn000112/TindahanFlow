import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/database';
import { Loader2, Store, User, Lock, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- VALIDATION ---
    if (!username.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 4) {
        setError("Password must be at least 4 characters long");
        return;
    }

    if (isRegistering && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    // -----------------

    setIsLoading(true);

    try {
      if (isRegistering) {
        await registerUser(username, password);
        onLoginSuccess(username);
      } else {
        await loginUser(username, password);
        onLoginSuccess(username);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Check your internet.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError('');
      setPassword('');
      setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animate-fade-in">
        <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
           <Store className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-indigo-900">TindahanNiPogi</h1>
        <p className="text-gray-500 mt-2">Manage your sari-sari store with ease.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>
        
        {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm p-3 rounded-lg mb-4 text-center font-medium">
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
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required
                />
            </div>

            {isRegistering && (
                <div className="relative animate-fade-in">
                    <CheckCircle className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    <input 
                        type="password" 
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 p-3 border rounded-lg focus:ring-2 outline-none transition-all ${
                            confirmPassword && password !== confirmPassword 
                            ? 'border-rose-300 focus:ring-rose-500 bg-rose-50' 
                            : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        required
                    />
                </div>
            )}

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-lg shadow-md transition-all flex justify-center items-center gap-2 mt-2"
            >
                {isLoading && <Loader2 className="animate-spin w-5 h-5" />}
                {isRegistering ? 'Sign Up' : 'Login'}
            </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                <button 
                    onClick={toggleMode}
                    className="text-indigo-600 font-bold ml-1 hover:underline focus:outline-none"
                >
                    {isRegistering ? "Login" : "Register"}
                </button>
            </p>
        </div>
      </div>
      
      {/* Help Tip for New Users */}
      <div className="mt-8 bg-blue-50 text-blue-800 p-4 rounded-lg text-sm max-w-md text-center border border-blue-100">
          <p className="font-bold mb-1">First time here?</p>
          <p>
              Click <strong>Register</strong> above to create your secure account. 
              Your data will be stored safely in your Google Sheet.
          </p>
      </div>
    </div>
  );
};