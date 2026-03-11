// app/layout.tsx (Updated)

import { ClerkProvider, SignedIn } from '@clerk/nextjs';
import HeaderAuth from './ui/HeaderAuth';

import Sidebar from './ui/Sidebar';
import { Inter } from 'next/font/google';
import './globals.css';

// NEW IMPORTS:
import GoalChecker from './ui/GoalChecker'; // <-- NEW
import { getGoalStatus } from '@/lib/actions'; // <-- NEW (The Server Action)
import SubscriptionBadge from './ui/SubscriptionBadge'; // <-- Subscription badge

// Define metadata (kept simple for this example)
export const metadata = {
  title: 'Professional SaaS Dashboard',
  description: 'Mid-level Next.js project demonstrating data fetching and authentication.',
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}> 
          <div className="flex h-screen flex-row md:overflow-hidden">
            
            <div className="w-64 flex-none">
              <Sidebar /> 
            </div>

            <div className="flex-grow flex flex-col h-full overflow-y-auto"> 
              
              <header className="flex justify-end items-center p-4 gap-4 h-16 border-b bg-white flex-none shadow-sm">
                <SignedIn>
                  <SubscriptionBadge />
                </SignedIn>
                <HeaderAuth />
              </header>
              
              {/* WRAP THE MAIN CONTENT WITH GoalChecker */}
              <GoalChecker getGoalStatus={getGoalStatus}> 
                <main className="flex-1 p-6 md:p-12 bg-gray-50"> 
                  {children}
                </main>
              </GoalChecker>

            </div>
            
          </div>
          
        </body>
      </html>
    </ClerkProvider>
  );
}