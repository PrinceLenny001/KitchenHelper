"use client";

import React, { ReactNode } from 'react';

interface VerticalLayoutProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function VerticalLayout({ header, children, footer }: VerticalLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {header && <div className="sticky top-0 z-10">{header}</div>}
      <main className="flex-grow">{children}</main>
      {footer && <div className="sticky bottom-0 z-10">{footer}</div>}
    </div>
  );
} 