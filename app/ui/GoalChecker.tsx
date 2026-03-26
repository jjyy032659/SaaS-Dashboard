'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface GoalCheckerProps {
    getGoalStatus: () => Promise<{ hasProfile: boolean }>;
}

// skip the profile check on these pages — dashboard handles its own empty state,
// and settings is where the user goes to fix the missing profile
const ALLOWED_PATHS = ['/dashboard', '/settings'];

export default function GoalChecker({ getGoalStatus, children }: React.PropsWithChildren<GoalCheckerProps>) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // If the user is on an allowed path or not logged in (handled by Clerk/parent), skip the check
        if (ALLOWED_PATHS.includes(pathname)) {
            setIsLoading(false);
            return;
        }

        async function checkGoals() {
            try {
                const { hasProfile } = await getGoalStatus();
                
                if (!hasProfile) {
                    console.warn("User profile missing. Redirecting to settings.");
                    // Redirect to settings if no profile exists
                    router.push('/settings?onboarding=true');
                }
            } catch (error) {
                // If the check fails (e.g., user is signed out, which can happen if the path is not protected), 
                // we still want to proceed, but log the error.
                console.error("Error checking goal status:", error);
            } finally {
                setIsLoading(false);
            }
        }
        
        checkGoals();
    }, [pathname, router, getGoalStatus]);
    
    // Show a small loader while checking status on the client-side
    if (isLoading) {
        return (
            <div className="flex-1 p-12 text-center text-gray-500">
                Checking user profile...
            </div>
        );
    }

    return <>{children}</>;
}