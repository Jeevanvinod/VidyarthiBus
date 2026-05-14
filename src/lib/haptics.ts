import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      // Ignore
    }
  }
};

export const triggerHapticNotification = async (type: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS') => {
    if (Capacitor.isNativePlatform()) {
      try {
        // Map types if needed or use selection
        await Haptics.selectionStart();
        setTimeout(() => Haptics.selectionEnd(), 100);
      } catch (e) {
        // Ignore
      }
    }
};
