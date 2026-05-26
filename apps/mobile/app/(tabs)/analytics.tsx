// app/(tabs)/analytics.tsx - Analytics tab
import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { colors } from '../../lib/theme/colors';
import { fontFamily } from '../../lib/theme/typography';
import { spacing } from '../../lib/theme/spacing';
import { SegmentControl } from '../../components/ui/SegmentControl';
import { PeriodPicker } from '../../components/analytics/PeriodPicker';
import { CategoryGrid } from '../../components/analytics/CategoryGrid';
import { useTransactionStore } from '../../lib/store/useTransactionStore';
import { formatAmount } from '../../lib/utils/currency';
import { getDayLabels, type Period } from '../../lib/utils/date';

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<Period>('week');
  const [segment, setSegment] = useState('Expenses');

  const getCategoryTotals = useTransactionStore((s) => s.getCategoryTotals);
  const getTotalExpenses = useTransactionStore((s) => s.getTotalExpenses);
  const getTotalIncome = useTransactionStore((s) => s.getTotalIncome);
  const getByPeriod = useTransactionStore((s) => s.getByPeriod);

  const type = segment === 'Expenses' ? 'debit' : 'credit';
  const total = segment === 'Expenses' ? getTotalExpenses(period) : getTotalIncome(period);
  const catTotals = getCategoryTotals(period, type as 'debit' | 'credit');

  const categoryData = useMemo(
    () =>
      Object.entries(catTotals)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount),
    [catTotals]
  );

  // Build bar chart data
  const labels = getDayLabels(period);
  const periodTxs = getByPeriod(period);

  const barData = useMemo(() => {
    // Group transactions by label bucket
    const buckets: Record<string, number> = {};
    labels.forEach((l) => (buckets[l] = 0));

    periodTxs
      .filter((t) => t.type === type)
      .forEach((tx) => {
        const d = new Date(tx.date);
        let key: string;
        if (period === 'week') {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          key = dayNames[d.getDay()];
        } else if (period === 'month') {
          const weekNum = Math.min(Math.ceil(d.getDate() / 7), 4);
          key = `W${weekNum}`;
        } else {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          key = months[d.getMonth()];
        }
        if (key in buckets) {
          buckets[key] += tx.amount;
        }
      });

    const maxVal = Math.max(...Object.values(buckets), 1);
    return labels.map((label, i) => {
      const val = buckets[label] || 0;
      const isHighest = val === maxVal && val > 0;
      return {
        value: val,
        label,
        frontColor: isHighest ? colors.purple : colors.overlay,
        labelTextStyle: {
          color: colors.textSec,
          fontFamily: fontFamily.regular,
          fontSize: 11,
        },
      };
    });
  }, [labels, periodTxs, type, period]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <PeriodPicker value={period} onChange={setPeriod} />
        </View>

        {/* Segment toggle */}
        <View style={styles.segmentContainer}>
          <SegmentControl
            options={['Expenses', 'Income']}
            value={segment}
            onChange={setSegment}
          />
        </View>

        {/* Total amount */}
        <View style={styles.totalSection}>
          <Text style={styles.totalAmount}>₹{formatAmount(total)}</Text>
          <View style={styles.deltaRow}>
            <Feather
              name={segment === 'Expenses' ? 'trending-up' : 'trending-down'}
              size={14}
              color={segment === 'Expenses' ? colors.negative : colors.positive}
            />
            <Text style={styles.deltaText}>
              vs last {period}
            </Text>
          </View>
        </View>

        {/* Bar chart */}
        <View style={styles.chartContainer}>
          <BarChart
            data={barData}
            barWidth={period === 'year' ? 16 : 24}
            spacing={period === 'year' ? 8 : 14}
            roundedTop
            roundedBottom={false}
            barBorderRadius={8}
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={{
              color: colors.textSec,
              fontFamily: fontFamily.regular,
              fontSize: 11,
            }}
            noOfSections={4}
            hideRules={false}
            rulesColor={colors.surfaceAlt}
            rulesType="dashed"
            dashWidth={4}
            dashGap={4}
            hideYAxisText
            height={180}
            backgroundColor="transparent"
            isAnimated
            animationDuration={600}
          />
        </View>

        {/* Category grid */}
        {categoryData.length > 0 && <CategoryGrid data={categoryData} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  segmentContainer: {
    paddingHorizontal: spacing.base,
  },
  totalSection: {
    alignItems: 'center',
    gap: 4,
  },
  totalAmount: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSec,
  },
  chartContainer: {
    paddingHorizontal: spacing.base,
    alignItems: 'center',
  },
});
