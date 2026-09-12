import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mangabook.app',
  appName: 'MangaBook',
  webDir: 'public',
  server: {
    url: 'http://10.0.2.2:3000', // 10.0.2.2 is localhost for Android Emulator
    cleartext: true
  }
};

export default config;
