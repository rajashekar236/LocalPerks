import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Business } from '../data/businesses';
import { formatDistance } from '../lib/geo';
import { colors, radius, spacing } from '../theme';

type Props = { business: Business; distance: number; onPress: (id: string) => void };

// Memoized so the list only re-renders cards whose data changed.
export const BusinessCard = memo(function BusinessCard({ business, distance, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(business.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${business.name}, ${business.category}, ${formatDistance(distance)} away, ${business.multiplier} points per dollar`}
    >
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{business.emoji}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {business.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {business.category} · {formatDistance(distance)} · {business.address}
        </Text>
        {business.boost ? (
          <View style={styles.boost}>
            <Text style={styles.boostText}>{business.boost}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.rate}>
        <Text style={styles.rateValue}>{business.multiplier}x</Text>
        <Text style={styles.rateLabel}>pts/$</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted },
  boost: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
  },
  boostText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  rate: { alignItems: 'center' },
  rateValue: { fontSize: 18, fontWeight: '700', color: colors.primary },
  rateLabel: { fontSize: 11, color: colors.textMuted },
});
