'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function HeaderAuth() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const prevSignedIn = useRef(isSignedIn);

  useEffect(() => {
    // When transitioning from signed-out to signed-in, refresh server components
    if (isSignedIn && !prevSignedIn.current) {
      router.refresh();
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn, router]);

  return (
    <>
      <SignedOut>
        <SignInButton>
          <button className="text-sm font-medium px-4 py-2 border rounded-md hover:bg-gray-50 cursor-pointer">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton>
          <button className="bg-blue-600 text-white rounded-md font-medium px-4 py-2 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}
