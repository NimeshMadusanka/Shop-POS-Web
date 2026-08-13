export type DiscountType = 'combined' | 'brand' | 'store';

export const DISCOUNT_TYPE_OPTIONS: Array<{ value: DiscountType; label: string }> = [
  { value: 'brand', label: 'Brand Discount' },
  { value: 'store', label: 'Store Discount' },
  { value: 'combined', label: 'Combined (Brand + Store)' },
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

/**
 * Resolve which brand/store percents are active.
 * - brand: only brand %
 * - store: only store %
 * - combined: both explicit BD + SD; legacy single off% acts as brand-style cut
 */
export const resolveDiscountPercents = ({
  discountType,
  offPercentage = 0,
  brandOffPercentage,
  storeOffPercentage,
}: {
  discountType?: string | null;
  offPercentage?: number;
  brandOffPercentage?: number;
  storeOffPercentage?: number;
}) => {
  const type = normalizeDiscountType(discountType);
  const off = Number(offPercentage) || 0;
  const hasExplicit = brandOffPercentage !== undefined || storeOffPercentage !== undefined;
  const brandOff = Number(brandOffPercentage) || 0;
  const storeOff = Number(storeOffPercentage) || 0;

  if (type === 'brand') {
    return {
      brandOffPercent: hasExplicit ? brandOff || off : off,
      storeOffPercent: 0,
      type,
    };
  }
  if (type === 'store') {
    return {
      brandOffPercent: 0,
      storeOffPercent: hasExplicit ? storeOff || off : off,
      type,
    };
  }
  if (hasExplicit) {
    if (brandOff <= 0 && storeOff <= 0 && off > 0) {
      // legacy combined single % stored without brand/store fields
      return { brandOffPercent: off, storeOffPercent: 0, type };
    }
    return { brandOffPercent: brandOff, storeOffPercent: storeOff, type };
  }
  return { brandOffPercent: off, storeOffPercent: 0, type };
};

/**
 * Brand: discount % of remaining gross, then re-split by commission.
 * Store: discount % of remaining gross taken only from store (shop) share (clamped).
 */
const applyPercentDiscount = (
  remainingGross: number,
  shopShare: number,
  brandShare: number,
  percent: number,
  discountType: DiscountType,
  commissionPercent: number
) => {
  const p = Number(percent) || 0;
  const gross = round2(remainingGross);
  let shop = round2(shopShare);
  let brand = round2(brandShare);

  if (p <= 0 || gross <= 0) {
    return { shopShare: shop, brandShare: brand, amount: 0, type: discountType, remainingGross: gross };
  }

  if (discountType === 'store') {
    const requested = round2((gross * p) / 100);
    const amount = round2(Math.min(requested, shop));
    shop = round2(shop - amount);
    return {
      shopShare: shop,
      brandShare: brand,
      amount,
      type: discountType,
      remainingGross: round2(gross - amount),
    };
  }

  const amount = round2((gross * p) / 100);
  const newGross = round2(Math.max(0, gross - amount));
  const split = splitGrossByCommission(newGross, commissionPercent);
  return {
    shopShare: split.shopShare,
    brandShare: split.brandShare,
    amount,
    type: 'brand' as DiscountType,
    remainingGross: newGross,
  };
};

const applyBrandThenStore = (
  remainingGross: number,
  shopShare: number,
  brandShare: number,
  brandOffPercent: number,
  storeOffPercent: number,
  commissionPercent: number,
  breakdown: Array<{ type: DiscountType; amount: number }>
) => {
  let gross = remainingGross;
  let shop = shopShare;
  let brand = brandShare;

  if (Number(brandOffPercent) > 0) {
    const brandResult = applyPercentDiscount(
      gross,
      shop,
      brand,
      brandOffPercent,
      'brand',
      commissionPercent
    );
    shop = brandResult.shopShare;
    brand = brandResult.brandShare;
    gross = brandResult.remainingGross;
    if (brandResult.amount > 0) {
      breakdown.push({ type: 'brand', amount: brandResult.amount });
    }
  }

  if (Number(storeOffPercent) > 0) {
    const storeResult = applyPercentDiscount(
      gross,
      shop,
      brand,
      storeOffPercent,
      'store',
      commissionPercent
    );
    shop = storeResult.shopShare;
    brand = storeResult.brandShare;
    gross = storeResult.remainingGross;
    if (storeResult.amount > 0) {
      breakdown.push({ type: 'store', amount: storeResult.amount });
    }
  }

  return { remainingGross: gross, shopShare: shop, brandShare: brand };
};

export const formatDiscountLabel = (
  breakdown: Array<{ type: DiscountType; amount: number }>
) =>
  breakdown
    .filter((entry) => entry.amount > 0)
    .map((entry) => `${DISCOUNT_KEYS[entry.type]}-${Math.round(entry.amount)}`)
    .join(', ');

const effectiveTypeFromPercents = (
  brandOff: number,
  storeOff: number,
  fallbackType?: string | null
): DiscountType => {
  if (brandOff > 0 && storeOff > 0) return 'combined';
  if (storeOff > 0) return 'store';
  if (brandOff > 0) return 'brand';
  return normalizeDiscountType(fallbackType);
};

export const computeLineEconomics = ({
  lineGross,
  itemOffPercent = 0,
  itemDiscountType = 'combined' as DiscountType,
  itemBrandOffPercent,
  itemStoreOffPercent,
  billDiscountPercent = 0,
  billDiscountType = 'combined' as DiscountType,
  billBrandOffPercent,
  billStoreOffPercent,
  commissionPercent = 100,
}: {
  lineGross: number;
  itemOffPercent?: number;
  itemDiscountType?: DiscountType;
  itemBrandOffPercent?: number;
  itemStoreOffPercent?: number;
  billDiscountPercent?: number;
  billDiscountType?: DiscountType;
  billBrandOffPercent?: number;
  billStoreOffPercent?: number;
  commissionPercent?: number;
}) => {
  const itemBrand = resolveDiscountPercents({
    discountType: itemDiscountType,
    offPercentage: itemOffPercent,
    brandOffPercentage: itemBrandOffPercent,
    storeOffPercentage: itemStoreOffPercent,
  });

  const billResolved = resolveDiscountPercents({
    discountType: billDiscountType,
    offPercentage: billDiscountPercent,
    brandOffPercentage: billBrandOffPercent,
    storeOffPercentage: billStoreOffPercent,
  });

  const gross = round2(Number(lineGross) || 0);
  let remainingGross = gross;
  let { shopShare, brandShare } = splitGrossByCommission(remainingGross, commissionPercent);
  const discountBreakdown: Array<{ type: DiscountType; amount: number }> = [];

  const afterItem = applyBrandThenStore(
    remainingGross,
    shopShare,
    brandShare,
    itemBrand.brandOffPercent,
    itemBrand.storeOffPercent,
    commissionPercent,
    discountBreakdown
  );
  remainingGross = afterItem.remainingGross;
  shopShare = afterItem.shopShare;
  brandShare = afterItem.brandShare;

  const afterBill = applyBrandThenStore(
    remainingGross,
    shopShare,
    brandShare,
    billResolved.brandOffPercent,
    billResolved.storeOffPercent,
    commissionPercent,
    discountBreakdown
  );
  remainingGross = afterBill.remainingGross;
  shopShare = afterBill.shopShare;
  brandShare = afterBill.brandShare;

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
    itemBrandOffPercent: itemBrand.brandOffPercent,
    itemStoreOffPercent: itemBrand.storeOffPercent,
    billBrandOffPercent: billResolved.brandOffPercent,
    billStoreOffPercent: billResolved.storeOffPercent,
    effectiveItemDiscountType: effectiveTypeFromPercents(
      itemBrand.brandOffPercent,
      itemBrand.storeOffPercent,
      itemDiscountType
    ),
  };
};
