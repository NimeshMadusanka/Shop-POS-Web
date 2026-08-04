export type DiscountType = 'combined' | 'brand' | 'store';

export const DISCOUNT_TYPE_OPTIONS: Array<{ value: DiscountType; label: string }> = [
  { value: 'combined', label: 'Combined (from full price)' },
  { value: 'brand', label: 'Brand discount (from brand share)' },
  { value: 'store', label: 'Store discount (from shop share)' },
];

export const DISCOUNT_LEGEND = 'cd = combined discount · bd = brand discount · sd = store discount';

const DISCOUNT_KEYS: Record<DiscountType, string> = {
  combined: 'cd',
  brand: 'bd',
  store: 'sd',
};

const round2 = (value: number) => Math.round((Number(value) || 0) * 100) / 100;

export const normalizeDiscountType = (type?: string | null): DiscountType => {
  if (type === 'brand' || type === 'store' || type === 'combined') return type;
  return 'combined';
};

const splitGrossByCommission = (lineGross: number, commissionPercent: number) => {
  const comm = Math.min(100, Math.max(0, Number(commissionPercent) || 0));
  const gross = round2(lineGross);
  const shopShare = round2((gross * comm) / 100);
  const brandShare = round2(gross - shopShare);
  return { shopShare, brandShare };
};

const applyPercentDiscount = (
  shopShare: number,
  brandShare: number,
  percent: number,
  discountType: DiscountType
) => {
  const p = Number(percent) || 0;
  if (p <= 0) {
    return { shopShare, brandShare, amount: 0, type: discountType };
  }

  let shop = round2(shopShare);
  let brand = round2(brandShare);
  const total = round2(shop + brand);
  let amount = 0;

  if (discountType === 'brand') {
    amount = round2((brand * p) / 100);
    brand = round2(brand - amount);
  } else if (discountType === 'store') {
    amount = round2((shop * p) / 100);
    shop = round2(shop - amount);
  } else {
    amount = round2((total * p) / 100);
    const shopRatio = total > 0 ? shop / total : 0;
    const shopDeduction = round2(amount * shopRatio);
    const brandDeduction = round2(amount - shopDeduction);
    shop = round2(shop - shopDeduction);
    brand = round2(brand - brandDeduction);
  }

  return { shopShare: shop, brandShare: brand, amount, type: discountType };
};

export const formatDiscountLabel = (
  breakdown: Array<{ type: DiscountType; amount: number }>
) =>
  breakdown
    .filter((entry) => entry.amount > 0)
    .map((entry) => `${DISCOUNT_KEYS[entry.type]}-${Math.round(entry.amount)}`)
    .join(', ');

export const computeLineEconomics = ({
  lineGross,
  itemOffPercent = 0,
  itemDiscountType = 'combined' as DiscountType,
  billDiscountPercent = 0,
  billDiscountType = 'combined' as DiscountType,
  commissionPercent = 100,
}: {
  lineGross: number;
  itemOffPercent?: number;
  itemDiscountType?: DiscountType;
  billDiscountPercent?: number;
  billDiscountType?: DiscountType;
  commissionPercent?: number;
}) => {
  let { shopShare, brandShare } = splitGrossByCommission(lineGross, commissionPercent);
  const discountBreakdown: Array<{ type: DiscountType; amount: number }> = [];

  if (itemOffPercent > 0) {
    const itemResult = applyPercentDiscount(
      shopShare,
      brandShare,
      itemOffPercent,
      normalizeDiscountType(itemDiscountType)
    );
    shopShare = itemResult.shopShare;
    brandShare = itemResult.brandShare;
    discountBreakdown.push({ type: itemResult.type, amount: itemResult.amount });
  }

  if (billDiscountPercent > 0) {
    const billResult = applyPercentDiscount(
      shopShare,
      brandShare,
      billDiscountPercent,
      normalizeDiscountType(billDiscountType)
    );
    shopShare = billResult.shopShare;
    brandShare = billResult.brandShare;
    discountBreakdown.push({ type: billResult.type, amount: billResult.amount });
  }

  const lineNet = round2(shopShare + brandShare);
  const discountAmount = round2(
    discountBreakdown.reduce((sum, entry) => sum + entry.amount, 0)
  );

  return {
    shopShare,
    brandShare,
    lineNet,
    discountAmount,
    discountPercent: lineGross > 0 ? round2((discountAmount / lineGross) * 100) : 0,
    discountBreakdown,
    discountLabel: formatDiscountLabel(discountBreakdown),
  };
};
