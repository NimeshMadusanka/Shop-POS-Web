export type LowStockItemRow = {
  itemName: string;
  brandName?: string;
  itemCategory?: string;
  stockQuantity?: number;
};

export type LowStockBrandGroup = {
  brandName: string;
  items: LowStockItemRow[];
};

export const getLowStockStatus = (stockLevel: number) => {
  if (stockLevel === 0) return 'Out of Stock';
  if (stockLevel <= 10) return 'Critical';
  return 'Low';
};

export function groupLowStockByBrand(items: LowStockItemRow[] = []): LowStockBrandGroup[] {
  const map = new Map<string, LowStockItemRow[]>();

  items.forEach((item) => {
    const brand = (item.brandName || '').trim() || 'No Brand';
    if (!map.has(brand)) map.set(brand, []);
    map.get(brand)!.push(item);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([brandName, brandItems]) => ({
      brandName,
      items: [...brandItems].sort((a, b) => {
        const stockDiff = (a.stockQuantity || 0) - (b.stockQuantity || 0);
        if (stockDiff !== 0) return stockDiff;
        return (a.itemName || '').localeCompare(b.itemName || '');
      }),
    }));
}
