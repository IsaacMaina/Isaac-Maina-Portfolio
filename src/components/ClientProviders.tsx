'use client';

import { ReactNode } from 'react';
import NetworkStatus from './NetworkStatus';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      <NetworkStatus />
      {children}
    </>
  );
}