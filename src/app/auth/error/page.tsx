'use client';

import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Authentication Error</h1>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          There was a problem authenticating your account. This could be due to:
        </p>
        <ul className="list-disc pl-5 mb-6 text-gray-700 dark:text-gray-300">
          <li>An expired or invalid session</li>
          <li>Authentication was canceled</li>
          <li>OAuth provider configuration issues</li>
        </ul>
        <Link 
          href="/"
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}