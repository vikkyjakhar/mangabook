'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export default function CapacitorHardwareBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = App.addListener('backButton', () => {
        // If we are on the home page, exit the app
        if (pathname === '/') {
          App.exitApp();
        } else {
          // Otherwise, navigate back
          router.back();
        }
      });

      return () => {
        listener.then(l => l.remove());
      };
    }
  }, [router, pathname]);

  return null;
}
