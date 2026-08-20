import * as Haptics from 'expo-haptics';

// Haptics can reject on devices/simulators without a haptics engine; never let that surface.
export const impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
  Haptics.impactAsync(style).catch(() => {});
};

export const notify = (type: Haptics.NotificationFeedbackType) => {
  Haptics.notificationAsync(type).catch(() => {});
};

export const selection = () => {
  Haptics.selectionAsync().catch(() => {});
};
