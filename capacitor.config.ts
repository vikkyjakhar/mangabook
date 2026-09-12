import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mangabook.app',
  appName: 'MangaBook',
  webDir: 'public',
  server: {
    url: 'https://mangabook-weld.vercel.app/', 
    cleartext: true
  }
};

export default config;
