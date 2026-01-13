import { motadataRum } from '@motadata365/browser-rum';

motadataRum.init({
  applicationId: '6',
  clientToken: 'pub21da12006b0871dc2c634c9b790f9a40',
  site: 'https://172.16.14.100:8083',
  service: 'sandbox_angular@1.0.6:dev',
  env: 'dev',
  version: '1.0.6',
  sessionSampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
  trackBfcacheViews: true
});