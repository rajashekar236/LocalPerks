import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue } from 'react-native';

import { colors, radius, spacing } from '../theme';

export function SkeletonBlock({ width, height }: { width: DimensionValue; height: number }) {
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, { width, height, opacity }]} />;
}

/** Placeholder shaped like a BusinessCard, shown while location loads. */
export function BusinessCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBlock width={48} height={48} />
      <View style={styles.lines}>
        <SkeletonBlock width="70%" height={16} />
        <SkeletonBlock width="45%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.skeleton, borderRadius: radius.sm },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lines: { flex: 1, gap: spacing.sm, justifyContent: 'center' },
});
