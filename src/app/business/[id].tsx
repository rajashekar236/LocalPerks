import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getBusiness } from '../../data/businesses';
import { REWARDS } from '../../data/rewards';
import { useUserLocation } from '../../hooks/useUserLocation';
import { distanceMiles, formatDistance } from '../../lib/geo';
import { colors, radius, spacing } from '../../theme';

export default function BusinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const location = useUserLocation();
  const business = getBusiness(id);

  if (!business) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text style={styles.body}>We couldn&apos;t find that business.</Text>
      </View>
    );
  }

  const rewardsHere = REWARDS.filter((r) => !r.businessId || r.businessId === business.id);
  const distance = location.status === 'loading' ? null : distanceMiles(location.coords, business);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: business.name }} />

      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{business.emoji}</Text>
        <Text style={styles.name}>{business.name}</Text>
        <Text style={styles.meta}>
          {business.category} · {business.address}
          {distance !== null ? ` · ${formatDistance(distance)}` : ''}
        </Text>
      </View>

      <View style={styles.rateCard}>
        <Text style={styles.rateValue}>{business.multiplier} pts per $1</Text>
        {business.boost ? <Text style={styles.rateBoost}>{business.boost}</Text> : null}
      </View>

      <Text style={styles.body}>{business.description}</Text>

      <Text style={styles.sectionTitle}>Rewards you can use here</Text>
      {rewardsHere.map((r) => (
        <View key={r.id} style={styles.reward}>
          <Text style={styles.rewardTitle}>{r.title}</Text>
          <Text style={styles.rewardCost}>{r.cost} pts</Text>
        </View>
      ))}

      <Pressable
        onPress={() => router.navigate({ pathname: '/scan', params: { b: business.id } })}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>Earn points here</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  heroEmoji: { fontSize: 56 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  meta: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  rateCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  rateValue: { fontSize: 20, fontWeight: '800', color: colors.primaryDark },
  rateBoost: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  reward: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rewardTitle: { flex: 1, fontSize: 14, color: colors.text, marginRight: spacing.sm },
  rewardCost: { fontSize: 14, fontWeight: '600', color: colors.primary },
  cta: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
