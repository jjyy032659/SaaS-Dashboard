import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //=============================================================================
  // NEXT.JS CONFIGURATION
  //=============================================================================

  //-----------------------------------------------------------------------------
  // OUTPUT MODE: STANDALONE
  //-----------------------------------------------------------------------------
  // This is REQUIRED for Docker deployments!
  //
  // What "standalone" does:
  // - Creates a minimal, self-contained build in .next/standalone
  // - Includes only the files needed to run the app
  // - Bundles necessary node_modules (no need for full node_modules folder)
  // - Creates a simple server.js file to run the app
  //
  // Without standalone, you'd need to copy:
  // - Full node_modules folder (can be 500MB+)
  // - package.json
  // - .next folder
  //
  // With standalone:
  // - Just .next/standalone folder (~50MB typically)
  // - Run with: node server.js
  //
  // IMPORTANT: After building, you also need to copy:
  // - .next/static -> .next/standalone/.next/static
  // - public -> .next/standalone/public
  //-----------------------------------------------------------------------------
  output: "standalone",

  //-----------------------------------------------------------------------------
  // IMAGE OPTIMIZATION
  //-----------------------------------------------------------------------------
  // Configure how Next.js optimizes images.
  // Add your domain(s) here if you load images from external URLs.
  //-----------------------------------------------------------------------------
  images: {
    // Domains allowed for next/image optimization
    // Add external image domains here if needed
    // Example: remotePatterns: [{ hostname: 'example.com' }]
    unoptimized: false,
  },

  //-----------------------------------------------------------------------------
  // EXPERIMENTAL FEATURES (Optional)
  //-----------------------------------------------------------------------------
  // Enable experimental Next.js features as needed
  // experimental: {
  //   serverActions: true,
  // },
};

export default nextConfig;
