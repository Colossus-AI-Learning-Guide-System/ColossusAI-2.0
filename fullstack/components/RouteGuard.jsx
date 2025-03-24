import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';

const RouteGuard = ({ children }) => {
    const router = useRouter();
    const user = useUser();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        authCheck(router.asPath);
        
        const hideContent = () => setAuthorized(false);
        router.events.on('routeChangeStart', hideContent);
        router.events.on('routeChangeComplete', authCheck);
        
        return () => {
            router.events.off('routeChangeStart', hideContent);
            router.events.off('routeChangeComplete', authCheck);
        };
    }, [router, user]);
    
    function authCheck(url) {
        const publicPaths = ['/signin', '/signup', '/'];
        const path = url.split('?')[0];
        
        if (!user && !publicPaths.includes(path)) {
            setAuthorized(false);
            router.push({
                pathname: '/signin',
                query: { returnUrl: router.asPath }
            });
        } else {
            setAuthorized(true);
        }
    }
    
    return authorized && children;
};

export default RouteGuard;
