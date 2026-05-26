// reader.ts - SMS reading with platform guard
import { Platform } from 'react-native';

// SMS reading is only available on Android with native builds
// In Expo Go or on iOS, this module provides mock functionality
export const canReadSms = Platform.OS === 'android';

export async function requestSmsPermission(): Promise<boolean> {
  if (!canReadSms) return false;

  try {
    const { PermissionsAndroid } = require('react-native');
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'Trackr needs to read bank SMS to auto-detect transactions.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export async function fetchBankSms(
  _daysBack: number = 30
): Promise<Array<{ body: string; address: string; date: number }>> {
  if (!canReadSms) return [];

  // This requires react-native-get-sms-android which needs a dev client build
  // For now, return empty. The actual implementation would use:
  //
  // import SmsAndroid from 'react-native-get-sms-android';
  // return new Promise((resolve, reject) => {
  //   SmsAndroid.list(
  //     JSON.stringify({
  //       box: 'inbox',
  //       minDate: Date.now() - daysBack * 24 * 60 * 60 * 1000,
  //       indexFrom: 0,
  //       maxCount: 200,
  //     }),
  //     (fail: string) => reject(fail),
  //     (_count: number, smsList: string) => resolve(JSON.parse(smsList))
  //   );
  // });

  console.log('[SMS] Native SMS reading requires expo-dev-client build');
  return [];
}
