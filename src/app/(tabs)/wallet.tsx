import { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { REWARDS, type Reward } from '../../data/rewards';
import { usePerks, type Activity } from '../../state/PerksContext';
import { colors, radius, spacing } from '../../theme';

export default function WalletScreen() {
  const { balance, activity, lifetimePoints, redeem } = usePerks();
  const [lastCode, setLastCode] = useState<{ title: string; code: string } | null>(null);

  const doRedeem = (reward: Reward) => {
    const result = redeem(reward);
    if (result.ok) {
      setLastCode({ title: reward.title, code: result.code });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const confirmRedeem = (reward: Reward) => {
    const message = `Spend ${reward.cost} points on "${reward.title}"?`;
    if (Platform.OS === 'web') {
      // Alert buttons are not supported on web.
      if (window.confirm(message)) doRedeem(reward);
      return;
    }
    Alert.alert('Redeem reward', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Redeem', onPress: () => doRedeem(reward) },
    ]);
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.summary}>
        <Stat label="Available" value={balance} />
        <View style={styles.divider} />
        <Stat label="Lifetime earned" value={lifetimePoints} />
      </View>

      {lastCode ? (
        <View style={styles.codeCard} accessibilityLiveRegion="polite">
          <Text style={styles.codeLabel}>Show this code at checkout</Text>
          <Text style={styles.codeValue}>{lastCode.code}</Text>
          <Text style={styles.codeTitle}>{lastCode.title}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Rewards</Text>
      {REWARDS.map((reward) => {
        const affordable = balance >= reward.cost;
        const progress = Math.min(1, balance / reward.cost);
        return (
          <View key={reward.id} style={styles.reward}>
            <View style={styles.rewardBody}>
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <Text style={styles.rewardCost}>{reward.cost} pts</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
            <Pressable
              onPress={() => confirmRedeem(reward)}
              disabled={!affordable}
              style={[styles.redeem, !affordable && styles.redeemDisabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: !affordable }}
              accessibilityLabel={
                affordable ? `Redeem ${reward.title}` : `${reward.cost - balance} more points needed for ${reward.title}`
              }
            >
              <Text style={[styles.redeemText, !affordable && styles.redeemTextDisabled]}>
                {affordable ? 'Redeem' : `${reward.cost - balance} to go`}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <Text style={[styles.sectionTitle, { marginTop: spacing.md }]}>Activity</Text>
    </View>
  );

  return (
    <FlatList
      data={activity}
      keyExtractor={(a) => a.id}
      renderItem={({ item }) => <ActivityRow item={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <Text style={styles.empty}>No activity yet. Scan a checkout code to earn your first points.</Text>
      }
      ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
      contentContainerStyle={styles.container}
    />
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityRow({ item }: { item: Activity }) {
  const date = new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const isEarn = item.kind === 'earn';
  return (
    <View style={styles.row}>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{isEarn ? item.businessName : item.title}</Text>
        <Text style={styles.rowMeta}>
          {date} · {isEarn ? `$${item.amount.toFixed(2)} purchase` : `Code ${item.code}`}
        </Text>
      </View>
      <Text style={[styles.rowPoints, { color: isEarn ? colors.success : colors.danger }]}>
        {isEarn ? '+' : '−'}
        {item.points}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { gap: spacing.md, marginBottom: spacing.sm },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 28, fontWeight: '800' },
  statLabel: { color: colors.primarySoft, fontSize: 13 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  codeCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  codeLabel: { fontSize: 13, color: '#92400E', fontWeight: '600' },
  codeValue: { fontSize: 32, fontWeight: '800', letterSpacing: 4, color: colors.text, marginVertical: spacing.xs },
  codeTitle: { fontSize: 14, color: colors.text },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  rewardBody: { flex: 1, gap: 4 },
  rewardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rewardCost: { fontSize: 13, color: colors.textMuted },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: radius.pill, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.primary },
  redeem: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    minWidth: 88,
    alignItems: 'center',
  },
  redeemDisabled: { backgroundColor: colors.border },
  redeemText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  redeemTextDisabled: { color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowMeta: { fontSize: 13, color: colors.textMuted },
  rowPoints: { fontSize: 16, fontWeight: '700' },
  rowDivider: { height: spacing.sm },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
