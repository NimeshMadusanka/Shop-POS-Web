import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../auth/useAuthContext';
import { PATH_DASHBOARD } from '../../routes/paths';

export default function RoleBasedRedirect() {
  const { user } = useAuthContext();
  
  // Redirect cashiers to cashier page, admins to dashboard
  if (user?.role === 'cashier') {
    return <Navigate to={PATH_DASHBOARD.cashier.root} replace />;
  }
  
  return <Navigate to={PATH_DASHBOARD.general.dachboard} replace />;
}

