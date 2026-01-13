"use client";
    
import { motadataRum } from '@motadata365/browser-rum';

motadataRum.init({
  applicationId: '5',
  clientToken: 'pub429dd61aee6c03e4e0dd830974674e31',
  site: 'https://172.16.14.100:8082',
  service: 'sandbox_next-14@1.0.6:dev',
  env: 'dev',
  version: '1.0.6',
  sessionSampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
  trackBfcacheViews: true
});    
    export default function MotadataInit() {
      return null;
    }
