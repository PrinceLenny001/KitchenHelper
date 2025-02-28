import React from "react";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Metadata } from "next";
import ClientProvider from "@/components/ClientProvider";
import { ThemeAwareToast } from "@/components/theme/ThemeAwareToast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Family Calendar",
  description: "A family calendar application for a 32\" touchscreen display",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <ThemeAwareToast />
        </ClientProvider>
      </body>
    </html>
  );
}
