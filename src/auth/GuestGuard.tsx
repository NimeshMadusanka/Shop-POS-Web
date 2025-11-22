import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// routes
import { PATH_AUTH } from '../routes/paths';
// components
import LoadingScreen from '../components/loading-screen';
//
import { useAuthContext } from './useAuthContext';

// ----------------------------------------------------------------------
// new
type GuestGuardProps = {
  children: React.ReactNode;
};

export default function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isInitialized } = useAuthContext();
  const [userData, setUserData] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userDetailsString = await localStorage.getItem('userdetails');
      if (userDetailsString) {
        const user = JSON.parse(userDetailsString);
        setUserData(user.role);
      }
    };
    fetchUser();
  }, []);
console.log(userData === 'Company');
  if (isAuthenticated) {
    if (userData === 'Company') {
      return <Navigate to={PATH_AUTH.companycreation} />;
    } else {
      return <Navigate to={PATH_AUTH.root} />;
    }
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return <> {children} </>;
}
