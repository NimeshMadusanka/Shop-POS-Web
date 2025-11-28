import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from '../auth/useAuthContext';

type AdminUnlockContextType = {
  isAdminUnlocked: boolean;
  unlockAdmin: () => void;
  lockAdmin: () => void;
};

const AdminUnlockContext = createContext<AdminUnlockContextType | undefined>(undefined);

const ADMIN_UNLOCK_KEY = 'pos_admin_unlocked';

export function AdminUnlockProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    // Check localStorage on mount
    const stored = localStorage.getItem(ADMIN_UNLOCK_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    // Sync with localStorage
    if (isAdminUnlocked) {
      localStorage.setItem(ADMIN_UNLOCK_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_UNLOCK_KEY);
    }
  }, [isAdminUnlocked]);

  // Clear admin unlock when user logs out or changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsAdminUnlocked(false);
    }
  }, [isAuthenticated, user]);

  const unlockAdmin = () => {
    setIsAdminUnlocked(true);
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
  };

  return (
    <AdminUnlockContext.Provider value={{ isAdminUnlocked, unlockAdmin, lockAdmin }}>
      {children}
    </AdminUnlockContext.Provider>
  );
}

export function useAdminUnlock() {
  const context = useContext(AdminUnlockContext);
  if (context === undefined) {
    throw new Error('useAdminUnlock must be used within an AdminUnlockProvider');
  }
  return context;
}

