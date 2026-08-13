export type DiscountType = 'combined' | 'brand' | 'store';

export const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  {
    value: 'brand',
    label: 'Brand Discount — % off full price, then split by commission',
  },
  {
    value: 'store',
    label: 'Store Discount — % off full price taken from store commission',
  },
  {
    value: 'combined',
    label: 'Combined — Brand Discount + Store Discount',
  },
];

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  brand: 'bd',
  store: 'sd',
  combined: 'cd',
};

export const DISCOUNT_LEGEND =
  'bd = brand discount · sd = store discount · cd = combined discount';

const round2 = (value: number) => Math.round(value * 100) / 100;

export const normalizeDiscountType = (value?: string | null): DiscountType => {
  if (value === 'brand' || value === 'store' || value === 'combined') return value;
  return 'combined';
};

export const getDiscountTypeLabel = (value?: string | null) =>
  DISCOUNT_TYPE_LABELS[normalizeDiscountType(value)];

export const calculateItemDiscountAmount = ({
  lineGross,
  offPercentage,
  discountType,
  commissionPercent,
}: {
  lineGross: number;
  offPercentage: number;
  discountType?: string | null;
  commissionPercent?: number;
}) => {
  const off = Number(offPercentage) || 0;
  if (off <= 0) return 0;

  const gross = Number(lineGross) || 0;
  const type = normalizeDiscountType(discountType);
  const requested = round2((gross * off) / 100);

  if (type === 'store') {
    const shopPct = Math.min(100, Math.max(0, Number(commissionPercent) || 0));
    const shopPortion = round2((gross * shopPct) / 100);
    return round2(Math.min(requested, shopPortion));
  }
  return requested;
};

export const formatDiscountTag = (
  discountType: string | null | undefined,
  amount: number,
  billShare = 0
) => {
  const itemAmount = round2(Number(amount) || 0);
  const billAmount = round2(Number(billShare) || 0);
  const parts: string[] = [];

  if (itemAmount > 0) {
    const key = getDiscountTypeLabel(discountType);
    parts.push(`${key}-${itemAmount}`);
  }
  if (billAmount > 0) {
    parts.push(`bill-${billAmount}`);
  }

  return parts.length ? parts.join(' / ') : '-';
};
