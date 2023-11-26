import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'stellar.circle.app',
  appName: 'Circle',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
