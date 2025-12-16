// app/settings/page.tsx
import { db } from "@/lib/db/db";
import { usersProfile, UserProfile } from "@/lib/db/schema";
import { updateProfileAndGoalsAction } from "@/lib/actions";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Target, LogIn } from "lucide-react";

// Import the new Client Component
import SettingsFormClient from './SettingsFormClient';

// =========================================================================
// DATA FETCHING FUNCTIONS (Server-side)
// =========================================================================

/**
 * Gets the user's current profile data for form pre-filling.
 */
async function getCurrentUserProfile(userId: string): Promise<UserProfile | undefined> {
    const profile = await db.select()
        .from(usersProfile)
        .where(eq(usersProfile.userId, userId));
    return profile[0];
}

// =========================================================================
// MAIN SERVER COMPONENT
// =========================================================================

export default async function SettingsPage() {
    const { userId } = await auth();

    if (!userId) {
        return (
            <div className="p-8 text-center text-red-600">
                Please <LogIn className="inline h-4 w-4 mr-1" /> sign in to set your goals.
            </div>
        );
    }

    // Fetch the current profile data
    const profileData = await getCurrentUserProfile(userId);
    
    // Default values if no profile exists yet
    // NOTE: These values are used to pre-fill the form inputs
    const defaults = {
        age: profileData?.age || 30,
        heightCm: profileData?.heightCm || 175,
        currentWeightKg: profileData?.currentWeightKg || 75,
        activityLevel: profileData?.activityLevel || 'moderate',
        calorieGoal: profileData?.calorieGoal || 2000,
        macroProteinG: profileData?.macroProteinG || 150,
        macroFatG: profileData?.macroFatG || 60,
        macroCarbsG: profileData?.macroCarbsG || 200,
    };


    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Target size={30} /> Goals & Profile Setup
            </h1>
            <p className="text-gray-600 mb-8">
                Set your biometrics and daily macro targets. This data powers your Dashboard analysis.
            </p>

            {/* Pass data and the Server Action to the Client Component */}
            <SettingsFormClient 
                updateProfileAndGoalsAction={updateProfileAndGoalsAction}
                defaults={defaults}
            />
            
        </div>
    );
}