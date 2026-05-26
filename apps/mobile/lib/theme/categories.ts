// categories.ts - transaction category definitions with icons and colors
export interface CategoryDef {
  name: string;
  icon: string; // Feather icon name
  color: string;
}

export const categories: CategoryDef[] = [
  { name: 'Shopping',       icon: 'shopping-bag', color: '#EC4899' },
  { name: 'Food & Drinks',  icon: 'coffee',       color: '#F59E0B' },
  { name: 'Transport',      icon: 'navigation',   color: '#3B82F6' },
  { name: 'Subscription',   icon: 'tv',           color: '#7C3AED' },
  { name: 'Health',         icon: 'heart',        color: '#10B981' },
  { name: 'Entertainment',  icon: 'film',         color: '#F97316' },
  { name: 'Other',          icon: 'more-horizontal', color: '#6B7280' },
];

export const categoryColors: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.name, c.color])
);

export const categoryIcons: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.name, c.icon])
);

export const categoryNames = categories.map((c) => c.name);

export function getCategoryDef(name: string): CategoryDef {
  return categories.find((c) => c.name === name) ?? categories[categories.length - 1];
}
