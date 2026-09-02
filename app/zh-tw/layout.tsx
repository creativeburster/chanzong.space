import React from 'react';
import { LangProvider } from '@/context/LangContext';

export default function TradLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LangProvider initialTraditional={true}>
      {children}
    </LangProvider>
  );
}
