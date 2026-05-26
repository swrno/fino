// CategoryGrid.tsx - 2-column grid of category spending cards
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { radius, spacing } from '../../lib/theme/spacing';
import { CategoryIcon } from '../ui/CategoryIcon';
import { formatAmount } from '../../lib/utils/currency';

interface CategoryItem {
  name: string;
  amount: number;
}

interface CategoryGridProps {
  data: CategoryItem[];
}

function CategoryCard({ item }: { item: CategoryItem }) {
  return (
    <View style={styles.card}>
      <CategoryIcon category={item.name} size={36} />
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.amount}>₹{formatAmount(item.amount)}</Text>
    </View>
  );
}

export function CategoryGrid({ data }: CategoryGridProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>By Category</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => <CategoryCard item={item} />}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
  },
  grid: {
    paddingHorizontal: spacing.base,
    gap: 10,
  },
  row: {
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    gap: 8,
  },
  categoryName: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textSec,
  },
  amount: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
});
