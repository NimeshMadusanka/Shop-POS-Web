import { OutletId } from 'src/config/outlets';
import { groupByOutletAndBrand } from './groupByOutletAndBrand';
import { getLowStockStatus, LowStockItemRow } from './groupLowStockByBrand';

export function groupLowStockByOutletAndBrand(
  items: LowStockItemRow[] = [],
  outletsToShow: OutletId[],
  brandId?: string | null
) {
  const withOutlet = items.map((item) => ({
    ...item,
    outletId: (item as LowStockItemRow & { outletId?: string }).outletId || 'AHANGAMA',
  }));

  return groupByOutletAndBrand(withOutlet, { outletsToShow, brandId }).map((section) => ({
    outletLabel: section.outletLabel,
    brands: section.brands.map((brand) => ({
      brandName: brand.brandName,
      items: [...brand.items].sort((a, b) => {
        const stockDiff = (a.stockQuantity || 0) - (b.stockQuantity || 0);
        if (stockDiff !== 0) return stockDiff;
        return (a.itemName || '').localeCompare(b.itemName || '');
      }),
    })),
  }));
}

export { getLowStockStatus };
