'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function HeaderAuth() {
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
