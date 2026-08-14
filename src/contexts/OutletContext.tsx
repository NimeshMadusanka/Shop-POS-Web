import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_OUTLET, isOutletId, OutletScope } from '../config/outlets';

type OutletContextValue = {
  outletId: OutletScope;
  setOutletId: (next: OutletScope) => void;
};

const OutletContext = createContext<OutletContextValue | null>(null);

const STORAGE_KEY = 'activeOutletId';

type Props = {
  children: React.ReactNode;
  role?: string;
  assignedOutletId?: string | null;
};

export function OutletProvider({ children, role, assignedOutletId }: Props) {
  const [outletId, setOutletIdState] = useState<OutletScope>('combined');

  useEffect(() => {
    if (role === 'cashier') {
      const locked = isOutletId(assignedOutletId) ? assignedOutletId : DEFAULT_OUTLET;
      setOutletIdState(locked);
      localStorage.setItem(STORAGE_KEY, locked);
      return;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'combined' || isOutletId(saved)) {
      setOutletIdState(saved);
    } else {
      setOutletIdState('combined');
    }
  }, [role, assignedOutletId]);

  const setOutletId = (next: OutletScope) => {
    setOutletIdState(next);
    localStorage.setItem(STORAGE_KEY, next);
    // Lightweight invalidation trigger used by list pages/hooks.
    window.dispatchEvent(new CustomEvent('outlet:changed', { detail: { outletId: next } }));
  };

  const value = useMemo(() => ({ outletId, setOutletId }), [outletId]);
  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

export function useOutlet() {
  const ctx = useContext(OutletContext);
  if (!ctx) {
    throw new Error('useOutlet must be used within OutletProvider');
  }
  return ctx;
}

