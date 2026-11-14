import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useIsFocused, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BUSINESSES, getBusiness } from '../../data/businesses';
import { demoReceiptCode, parseReceipt } from '../../lib/receipt';
import { usePerks } from '../../state/PerksContext';
import { colors, radius, spacing } from '../../theme';

type Outcome = { kind: 'success'; points: number; businessName: string } | { kind: 'error'; message: string };

const DEMO_AMOUNTS = [8.5, 24, 60];

export default function ScanScreen() {
  const { b } = useLocalSearchParams<{ b?: string }>();
  const { earn } = usePerks();
  const [permission, requestPermission] = useCameraPermissions();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [demoBusinessId, setDemoBusinessId] = useState(getBusiness(b ?? '')?.id ?? BUSINESSES[0].id);
  // Only run the camera while this tab is visible, to save battery.
  const isFocused = useIsFocused();
  // Cameras fire many scan events per second; this lock handles one at a time.
  const scanLock = useRef(false);

  // The tab stays mounted, so follow the business picked on a detail screen.
  // (Adjusting state during render, per react.dev "You might not need an effect".)
  const [prevB, setPrevB] = useState(b);
  if (b !== prevB) {
    setPrevB(b);
    const picked = getBusiness(b ?? '');
    if (picked) setDemoBusinessId(picked.id);
  }

  const handleCode = useCallback(
    (data: string) => {
      const parsed = parseReceipt(data);
      if (!parsed.ok) {
        setOutcome({ kind: 'error', message: parsed.error });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        return;
      }
      const result = earn(parsed.receipt);
      if (result.ok) {
        setOutcome({ kind: 'success', points: result.points, businessName: parsed.receipt.business.name });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        setOutcome({ kind: 'error', message: result.error });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    },
    [earn],
  );

  const onBarcodeScanned = useCallback(
    ({ data }: BarcodeScanningResult) => {
      if (scanLock.current) return;
      scanLock.current = true;
      handleCode(data);
    },
    [handleCode],
  );

  const scanAgain = () => {
    setOutcome(null);
    scanLock.current = false;
  };

  const cameraSupported = Platform.OS !== 'web';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Scan your checkout code</Text>
      <Text style={styles.subtitle}>
        Participating businesses show a LocalPerks QR code at checkout. Scan it to earn points.
      </Text>

      <View style={styles.cameraFrame}>
        {!cameraSupported ? (
          <Placeholder text="Camera scanning works in the mobile app. Use the demo below on web." />
        ) : !permission ? (
          <Placeholder text="Checking camera access…" />
        ) : !permission.granted ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>LocalPerks needs your camera to scan checkout codes.</Text>
            <PrimaryButton
              label={permission.canAskAgain ? 'Allow camera' : 'Enable camera in Settings'}
              onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
            />
          </View>
        ) : isFocused && !outcome ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onBarcodeScanned}
          />
        ) : (
          <Placeholder text={outcome ? '' : 'Camera paused'} />
        )}

        {outcome ? (
          <View style={[styles.result, outcome.kind === 'success' ? styles.resultSuccess : styles.resultError]}>
            <Text style={styles.resultTitle}>
              {outcome.kind === 'success' ? `+${outcome.points} points` : 'Could not add points'}
            </Text>
            <Text style={styles.resultBody}>
              {outcome.kind === 'success' ? `Thanks for shopping at ${outcome.businessName}!` : outcome.message}
            </Text>
            <PrimaryButton label="Scan another" onPress={scanAgain} light />
          </View>
        ) : null}
      </View>

      <View style={styles.demo}>
        <Text style={styles.demoTitle}>Demo: simulate a purchase</Text>
        <Text style={styles.subtitle}>No checkout code handy? Generate one for a demo purchase.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.demoRow}>
          {BUSINESSES.map((biz) => (
            <Pressable
              key={biz.id}
              onPress={() => setDemoBusinessId(biz.id)}
              style={[styles.demoChip, demoBusinessId === biz.id && styles.demoChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: demoBusinessId === biz.id }}
            >
              <Text style={[styles.demoChipText, demoBusinessId === biz.id && styles.demoChipTextActive]}>
                {biz.emoji} {biz.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.demoRow}>
          {DEMO_AMOUNTS.map((amt) => (
            <PrimaryButton
              key={amt}
              label={`Spend $${amt.toFixed(2)}`}
              onPress={() => {
                scanLock.current = true;
                handleCode(demoReceiptCode(demoBusinessId, amt));
              }}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{text}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, light }: { label: string; onPress: () => void; light?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, light && styles.buttonLight, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
    >
      <Text style={[styles.buttonText, light && styles.buttonTextLight]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  cameraFrame: {
    height: 320,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
  },
  placeholder: { padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  placeholderText: { color: '#CBD5E1', fontSize: 15, textAlign: 'center' },
  result: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  resultSuccess: { backgroundColor: colors.primary },
  resultError: { backgroundColor: colors.danger },
  resultTitle: { color: '#fff', fontSize: 30, fontWeight: '800' },
  resultBody: { color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: spacing.sm },
  demo: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  demoTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  demoChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  demoChipText: { fontSize: 13, color: colors.text },
  demoChipTextActive: { color: colors.primaryDark, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  buttonLight: { backgroundColor: '#fff' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  buttonTextLight: { color: colors.text },
});
