// app/(onboarding)/_layout.tsx - Onboarding stack layout
import { Stack } from 'expo-router';
import { colors } from '../../lib/theme/colors';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
