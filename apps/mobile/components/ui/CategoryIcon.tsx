// CategoryIcon.tsx - Circle with category color and Feather icon
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getCategoryDef } from '../../lib/theme/categories';

interface CategoryIconProps {
  category: string;
  size?: number;
}

export function CategoryIcon({ category, size = 40 }: CategoryIconProps) {
  const def = getCategoryDef(category);
  const iconSize = size * 0.45;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: def.color + '20', // 20% opacity
        },
      ]}
    >
      <Feather
        name={def.icon as any}
        size={iconSize}
        color={def.color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
