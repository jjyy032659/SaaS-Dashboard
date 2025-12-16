// app/layout.tsx (Updated)

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

import Sidebar from './ui/Sidebar'; 
import { Inter } from 'next/font/google'; 
import './globals.css';

// NEW IMPORTS:
import GoalChecker from './ui/GoalChecker'; // <-- NEW
import { getGoalStatus } from '@/lib/actions'; // <-- NEW (The Server Action)

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
                <SignedOut>
                  <SignInButton mode="modal" />
                  <SignUpButton mode="modal">
                    <button className="bg-blue-600 text-white rounded-md font-medium px-4 py-2 cursor-pointer">
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
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