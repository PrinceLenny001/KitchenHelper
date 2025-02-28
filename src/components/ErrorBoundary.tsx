'use client';

import { useEffect, useState } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Add a global error handler for unhandled promise rejections
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // Check if it's a JSON parsing error
      if (
        event.error instanceof SyntaxError && 
        event.error.message.includes('JSON')
      ) {
        console.error('JSON parsing error detected:', event.error);
        setError(event.error);
        setHasError(true);
        
        // Prevent the error from bubbling up
        event.preventDefault();
      }
    };

    // Add a global handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's a JSON parsing error
      if (
        event.reason instanceof SyntaxError && 
        event.reason.message.includes('JSON')
      ) {
        console.error('JSON parsing error detected in promise:', event.reason);
        setError(new Error(event.reason.message));
        setHasError(true);
        
        // Prevent the error from bubbling up
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-600 dark:text-red-300">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <p className="mt-4 text-sm text-red-600 dark:text-red-300">
          This might be due to a network issue or an empty response from the server.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reload page
        </button>
      </div>
    );
  }

  return <>{children}</>;
} 