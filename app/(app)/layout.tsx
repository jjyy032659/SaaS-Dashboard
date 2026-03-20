import { SignedIn } from '@clerk/nextjs';
import HeaderAuth from '../ui/HeaderAuth';
import Sidebar from '../ui/Sidebar';
import GoalChecker from '../ui/GoalChecker';
import { getGoalStatus } from '@/lib/actions';
import SubscriptionBadge from '../ui/SubscriptionBadge';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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

        <GoalChecker getGoalStatus={getGoalStatus}>
          <main className="flex-1 p-6 md:p-12 bg-gray-50">
            {children}
          </main>
        </GoalChecker>
      </div>
    </div>
  );
}
