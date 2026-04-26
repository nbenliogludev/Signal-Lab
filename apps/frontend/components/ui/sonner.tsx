'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster(): React.ReactElement {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'border border-border bg-card text-card-foreground shadow-sm',
        },
      }}
    />
  );
}
