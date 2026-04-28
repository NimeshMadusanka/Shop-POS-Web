export type OutletId = 'AHANGAMA' | 'ARUGAM_BAY';
export type OutletScope = OutletId | 'combined';
export const OUTLETS: OutletId[] = ['AHANGAMA', 'ARUGAM_BAY'];

export const DEFAULT_OUTLET: OutletId = 'AHANGAMA';

export const OUTLET_META: Record<OutletId, { code: string; label: string }> = {
  AHANGAMA: { code: 'A', label: 'Ahangama' },
  ARUGAM_BAY: { code: 'B', label: 'Arugam Bay' },
};

export const isOutletId = (value: unknown): value is OutletId =>
  typeof value === 'string' && OUTLETS.includes(value as OutletId);

