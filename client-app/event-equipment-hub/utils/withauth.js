'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          router.push('/login');
        } else {
          setIsCheckingAuth(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isCheckingAuth) {
      return <div>Loading...</div>; // or your own spinner
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
