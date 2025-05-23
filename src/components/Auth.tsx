'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | ''; text: string }>({ type: '', text: '' });
  const { signIn, signInWithGoogle } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await signIn(email);
      setMessage({ type: 'success', text: 'Check your email for the login link!' });
    } catch (error) {
      console.error('Error signing in:', error);
      setMessage({ type: 'error', text: 'Error signing in. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      setMessage({ type: 'error', text: 'Google Sign-In failed. Try again.' });
    }
  };

  return (
  
    <div className="flex flex-col gap-6 w-full max-w-sm">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enter your email to sign in or create an account
      </p>
    </div>

    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {message.text && (
        <div
          className={`p-3 rounded-md ${
            message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
            message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending link...' : 'Send magic link'}
      </button>
    </form>

    <div className="relative flex items-center justify-center">
      <hr className="w-full border-t border-gray-300 dark:border-gray-700" />
      <span className="absolute bg-white dark:bg-gray-900 px-2 text-sm text-gray-500">
        Or continue with
      </span>
    </div>

    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 border border-gray-300 rounded-md transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
    >
      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
      </svg>
      Google
    </button>
  </div>
  );
}
