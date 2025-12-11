// app/layout.tsx

// 1. IMPORT ALL NECESSARY CLERK COMPONENTS
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

// Import your superior Sidebar component (assuming it's in a folder named 'ui' or 'components' inside 'app')
// Based on your folder structure, let's assume it's under 'ui'
import Sidebar from './ui/Sidebar'; 

// Import Inter font and global CSS
import { Inter } from 'next/font/google'; 
import './globals.css';

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
    // 3. ClerkProvider wraps everything
    <ClerkProvider>
      <html lang="en">
        
        {/* 4. Outer body element, setting the font and full viewport height */}
        <body className={inter.className}> 
          
          {/* Main Layout Container: Two-column structure */}
          {/* h-screen: sets height to 100vh. flex-row: enables side-by-side. md:overflow-hidden: prevents double scrollbars. */}
          <div className="flex h-screen flex-row md:overflow-hidden">
            
            {/* 5. Sidebar component container */}
            {/* w-64: sets the width (256px) for the dark sidebar. flex-none: prevents shrinking. */}
            <div className="w-64 flex-none">
              <Sidebar /> {/* <--- USING YOUR DARK THEME SIDEBAR */}
            </div>

            {/* 6. The Main Content Area (Header on top, Children below) */}
            {/* flex-grow: takes up remaining horizontal space. flex-col: stacks header and main vertically. */}
            <div className="flex-grow flex flex-col h-full overflow-y-auto"> 
              
              {/* 7. Clerk Header: fixed height (h-16), white background, and shadow */}
              <header className="flex justify-end items-center p-4 gap-4 h-16 border-b bg-white flex-none shadow-sm">
                <SignedOut>
                  {/* Styling the Sign Up button to match the app's blue theme */}
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
              
              {/* 8. Your Page Content (Dashboard, Invoices, etc.) */}
              {/* flex-1: allows this section to fill the remaining vertical space */}
              {/* bg-gray-50: provides a subtle gray background for the dashboard content */}
              <main className="flex-1 p-6 md:p-12 bg-gray-50"> 
                {children}
              </main>

            </div>
            
          </div>
          
        </body>
      </html>
    </ClerkProvider>
  );
}