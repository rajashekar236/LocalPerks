import { useRouter } from 'expo-router';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BusinessCard } from '../../components/BusinessCard';
import { BusinessCardSkeleton } from '../../components/Skeleton';
import { BUSINESSES, CATEGORIES, type Category } from '../../data/businesses';
import { useUserLocation } from '../../hooks/useUserLocation';
import { distanceMiles } from '../../lib/geo';
import { usePerks } from '../../state/PerksContext';
import { colors, radius, spacing } from '../../theme';

type SortMode = 'nearest' | 'points';

export default function DiscoverScreen() {
  const router = useRouter();
  const { balance } = usePerks();
  const location = useUserLocation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [sort, setSort] = useState<SortMode>('nearest');
  // Keeps typing responsive: filtering runs on the deferred value.
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return BUSINESSES.filter((b) => (category ? b.category === category : true))
      .filter((b) => (q ? `${b.name} ${b.category} ${b.address}`.toLowerCase().includes(q) : true))
      .map((b) => ({ business: b, distance: distanceMiles(location.coords, b) }))
      .sort((a, b) =>
        sort === 'nearest' ? a.distance - b.distance : b.business.multiplier - a.business.multiplier,
      );
  }, [deferredQuery, category, sort, location.coords]);

  const openBusiness = useCallback((id: string) => router.push(`/business/${id}`), [router]);

  const header = (
    <View style={styles.header}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your points</Text>
        <Text style={styles.balanceValue}>{balance.toLocaleString()}</Text>
        <Text style={styles.balanceHint}>Shop local, scan your receipt, earn city rewards.</Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search businesses"
        placeholderTextColor={colors.textMuted}
        style={styles.search}
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel="Search businesses"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" active={category === null} onPress={() => setCategory(null)} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={category === c} onPress={() => setCategory(category === c ? null : c)} />
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.sectionTitle}>
          {location.status === 'fallback' ? 'Near downtown Frankfort' : 'Near you'}
        </Text>
        <Pressable
          onPress={() => setSort(sort === 'nearest' ? 'points' : 'nearest')}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={styles.sortToggle}>Sort: {sort === 'nearest' ? 'Nearest' : 'Most points'}</Text>
        </Pressable>
      </View>
    </View>
  );

  if (location.status === 'loading') {
    return (
      <View style={styles.list}>
        {header}
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <BusinessCardSkeleton />
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.business.id}
      renderItem={({ item }) => (
        <BusinessCard business={item.business} distance={item.distance} onPress={openBusiness} />
      )}
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text style={styles.empty}>No businesses match your search.</Text>}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    />
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { gap: spacing.md, marginBottom: spacing.md },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg },
  balanceLabel: { color: colors.primarySoft, fontSize: 13, fontWeight: '600' },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginVertical: 2 },
  balanceHint: { color: colors.primarySoft, fontSize: 13 },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  chips: { gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sortToggle: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  separator: { height: spacing.md },
  skeletonRow: { marginBottom: spacing.md },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
