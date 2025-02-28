"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Get more detailed error message based on the error code
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "AccessDenied":
        return "Access denied. You do not have permission to access this resource.";
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support.";
      case "Verification":
        return "The verification link may have expired or already been used. Please request a new one.";
      case "OAuthSignin":
        return "Error in the OAuth sign-in process. Please try again.";
      case "OAuthCallback":
        return "Error in the OAuth callback process. Please try again.";
      case "OAuthCreateAccount":
        return "Could not create an OAuth account. Please try again.";
      case "EmailCreateAccount":
        return "Could not create an email account. Please try again.";
      case "Callback":
        return "Error in the authentication callback. Please try again.";
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account. Please sign in using your original provider.";
      case "EmailSignin":
        return "Error sending the verification email. Please check your email address and try again.";
      case "CredentialsSignin":
        return "The credentials you provided are invalid. Please try again.";
      case "SessionRequired":
        return "You must be signed in to access this page.";
      default:
        return "An error occurred during authentication. Please try again.";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 px-4">
      <Link
        href="/"
        className="group absolute left-4 top-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-500">
            Authentication Error
          </h1>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            {getErrorMessage(error)}
          </p>
          {error && (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Error code: {error}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Link
            href="/auth/signin"
            className="rounded-lg bg-gradient-to-r from-brandBlue-500 to-brandBlue-600 px-6 py-3 text-white shadow-lg shadow-brandBlue-500/20 transition-all hover:from-brandBlue-600 hover:to-brandBlue-700 hover:shadow-xl hover:shadow-brandBlue-500/30"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
