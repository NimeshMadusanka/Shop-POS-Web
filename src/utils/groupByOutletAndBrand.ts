import { OUTLET_META, OutletId } from 'src/config/outlets';

export type OutletBrandGroup<T> = {
  outletId: OutletId;
  outletLabel: string;
  brands: { brandName: string; brandId?: string; items: T[] }[];
};

export function groupByOutletAndBrand<
  T extends {
    outletId?: string | null;
    brandName?: string | null;
    brandId?: string | null;
  },
>(
  rows: T[],
  options: {
    outletsToShow: OutletId[];
    brandId?: string | null;
  }
): OutletBrandGroup<T>[] {
  const { outletsToShow, brandId } = options;

  let filtered = rows;
  if (brandId) {
    filtered = filtered.filter(
      (row) => row.brandId && String(row.brandId) === String(brandId)
    );
  }

  return outletsToShow
    .map((outletId) => {
      const outletRows = filtered.filter(
        (row) => (row.outletId || 'AHANGAMA') === outletId
      );
      const brandMap = new Map<string, T[]>();

      outletRows.forEach((row) => {
        const brand = (row.brandName || '').trim() || 'No Brand';
        if (!brandMap.has(brand)) brandMap.set(brand, []);
        brandMap.get(brand)!.push(row);
      });

      const brands = Array.from(brandMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([brandName, items]) => ({
          brandName,
          brandId: items[0]?.brandId ? String(items[0].brandId) : undefined,
          items,
        }));

      return {
        outletId,
        outletLabel: OUTLET_META[outletId].label,
        brands,
      };
    })
    .filter((section) => section.brands.some((b) => b.items.length > 0));
}
