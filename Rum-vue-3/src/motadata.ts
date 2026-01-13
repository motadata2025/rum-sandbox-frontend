import { motadataRum } from '@motadata365/browser-rum';

motadataRum.init({
  applicationId: '4',
  clientToken: 'pub21ba544c5c701875ec025db8a97d15b6',
  site: 'https://172.16.14.100:8081',
  service: 'sandbox_test@1.0.6:dev',
  env: 'dev',
  version: '1.0.6',
  sessionSampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
  trackBfcacheViews: true
});

