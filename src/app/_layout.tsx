import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PerksProvider } from '../state/PerksContext';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <PerksProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="business/[id]" options={{ title: '', headerBackTitle: 'Back' }} />
      </Stack>
    </PerksProvider>
  );
}
