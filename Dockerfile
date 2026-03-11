#===============================================================================
# DOCKERFILE FOR NEXT.JS APPLICATION
#===============================================================================
# A Dockerfile is a text file with instructions to build a Docker image.
# Think of it as a recipe that Docker follows to create your container.
#
# WHAT IS A DOCKER IMAGE?
# - A snapshot/template of your application and its environment
# - Includes: OS, Node.js, your code, dependencies, configuration
# - Images are immutable (read-only) - you create new versions, not modify
#
# WHAT IS A DOCKER CONTAINER?
# - A running instance of an image
# - Like a lightweight virtual machine, but shares the host OS kernel
# - Isolated: has its own filesystem, network, processes
#
# MULTI-STAGE BUILDS:
# This Dockerfile uses "multi-stage builds" - a technique where we use
# multiple FROM statements to create intermediate images. Benefits:
# - Smaller final image (don't include build tools)
# - Better security (fewer packages = smaller attack surface)
# - Faster deployments (smaller images transfer faster)
#
# BUILD COMMAND:
#   docker build -t my-saas-dashboard .
#
# RUN COMMAND:
#   docker run -p 3000:3000 --env-file .env my-saas-dashboard
#===============================================================================


#===============================================================================
# STAGE 1: DEPENDENCIES
#===============================================================================
# This stage installs all npm dependencies.
# We separate this to leverage Docker's layer caching.
#
# HOW DOCKER LAYER CACHING WORKS:
# - Each instruction creates a "layer"
# - Docker caches layers and reuses them if nothing changed
# - If package.json hasn't changed, npm install is skipped on rebuild
# - This makes subsequent builds MUCH faster
#===============================================================================

# FROM - Specifies the base image to start from
# node:20-alpine means:
#   - node: Official Node.js image
#   - 20: Node.js version 20 (LTS)
#   - alpine: Lightweight Linux distro (~5MB vs ~900MB for full Linux)
FROM node:20-alpine AS deps

# LABEL - Adds metadata to the image
# Useful for documentation and filtering images
LABEL stage="dependencies"
LABEL description="Install npm dependencies"

# WORKDIR - Sets the working directory inside the container
# All subsequent commands run from this directory
# Similar to: mkdir -p /app && cd /app
WORKDIR /app

# Install libc6-compat
# ---------------------------------------------------------------------------
# Alpine Linux uses musl libc instead of glibc (used by most Linux distros).
# Some npm packages have native bindings compiled for glibc.
# libc6-compat provides compatibility for these packages.
# ---------------------------------------------------------------------------
RUN apk add --no-cache libc6-compat

# COPY - Copies files from your machine into the container
# ---------------------------------------------------------------------------
# We copy ONLY package files first, before copying all source code.
# Why? Docker layer caching!
#
# If we copied everything at once:
#   - ANY file change would invalidate the cache
#   - npm install would run on EVERY build
#
# By copying package files first:
#   - npm install only re-runs if package.json/lock file changes
#   - Code changes don't trigger reinstall
# ---------------------------------------------------------------------------
COPY package.json package-lock.json* ./

# RUN - Executes a command in the container
# ---------------------------------------------------------------------------
# npm ci vs npm install:
#   - npm ci: "Clean Install" - faster, stricter, for CI/CD
#   - Uses exact versions from package-lock.json
#   - Deletes node_modules first (clean slate)
#   - Fails if package.json and lock file are out of sync
#
# This ensures reproducible builds - same dependencies every time.
# ---------------------------------------------------------------------------
RUN npm ci


#===============================================================================
# STAGE 2: BUILDER
#===============================================================================
# This stage builds the Next.js application.
# It compiles TypeScript, bundles JavaScript, optimizes assets.
#===============================================================================

FROM node:20-alpine AS builder

LABEL stage="builder"
LABEL description="Build the Next.js application"

WORKDIR /app

# Copy dependencies from the previous stage
# ---------------------------------------------------------------------------
# --from=deps means "copy from the 'deps' stage we defined above"
# This is the magic of multi-stage builds - we can copy between stages
# ---------------------------------------------------------------------------
COPY --from=deps /app/node_modules ./node_modules

# Now copy ALL source code
# ---------------------------------------------------------------------------
# We copy everything needed to build the app.
# Files in .dockerignore are excluded (node_modules, .git, etc.)
# ---------------------------------------------------------------------------
COPY . .

# Environment variables for build time
# ---------------------------------------------------------------------------
# NEXT_TELEMETRY_DISABLED: Disables Next.js anonymous telemetry
# NODE_ENV: Tells Next.js to create a production build
#
# NOTE: These are BUILD-TIME variables. Runtime variables (API keys, etc.)
# are passed when running the container, not when building.
# ---------------------------------------------------------------------------
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build arguments for public environment variables
# ---------------------------------------------------------------------------
# ARG defines build-time variables that can be passed with --build-arg
# These are needed for Next.js public env vars (NEXT_PUBLIC_*)
#
# Public env vars are embedded into the JavaScript bundle at BUILD time,
# so we need them available during the build.
#
# Usage: docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx .
# ---------------------------------------------------------------------------
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
# Your production URL — used by the app for absolute URLs (e.g. Stripe webhooks)
ARG NEXT_PUBLIC_APP_URL

# Make build args available as environment variables during the build step
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build the application
# ---------------------------------------------------------------------------
# This runs: next build
# Creates an optimized production build in .next/ directory
# ---------------------------------------------------------------------------
RUN npm run build


#===============================================================================
# STAGE 3: RUNNER (Production Image)
#===============================================================================
# This is the final, minimal image that will be deployed.
# It contains ONLY what's needed to run the app - no build tools.
#===============================================================================

FROM node:20-alpine AS runner

LABEL stage="runner"
LABEL description="Production runtime image"
LABEL maintainer="your-email@example.com"

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
# ---------------------------------------------------------------------------
# SECURITY BEST PRACTICE: Never run containers as root!
#
# Why? If an attacker exploits your app:
#   - As root: they have full control of the container
#   - As non-root: limited damage, can't install packages, etc.
#
# addgroup/adduser flags:
#   --system: Create a system group/user (no password, no login shell)
#   --gid: Assign specific group ID
#   --uid: Assign specific user ID
#   1001: Standard non-root ID (avoids conflicts with existing IDs)
# ---------------------------------------------------------------------------
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder (static assets like images, fonts)
COPY --from=builder /app/public ./public

# Copy the standalone build output
# ---------------------------------------------------------------------------
# Next.js "standalone" output mode creates a minimal Node.js server.
# It includes only the files needed to run - much smaller than copying
# the entire .next folder.
#
# Enable this in next.config.js:
#   output: 'standalone'
#
# If you haven't enabled standalone mode, copy the full .next folder instead
# (see commented alternative below)
# ---------------------------------------------------------------------------

# Set correct permissions before copying
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy build output with correct ownership
# --chown sets the owner of copied files (avoids permission issues)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Alternative if NOT using standalone mode:
# COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
# COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
# COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Switch to non-root user
# All subsequent commands and the running container will use this user
USER nextjs

# EXPOSE - Documents which port the container listens on
# ---------------------------------------------------------------------------
# This is mainly documentation - it doesn't actually publish the port.
# You still need -p 3000:3000 when running the container.
# But it tells users/tools which port the app uses.
# ---------------------------------------------------------------------------
EXPOSE 3000

# Set the port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# CMD - The command to run when the container starts
# ---------------------------------------------------------------------------
# This starts the Next.js production server.
#
# For standalone mode: node server.js
# For regular mode: npm start (or node_modules/.bin/next start)
#
# CMD vs ENTRYPOINT:
#   - CMD: Default command, can be overridden with docker run <image> <cmd>
#   - ENTRYPOINT: Always runs, CMD becomes arguments to it
#
# Using array syntax ["node", "server.js"] is preferred over string syntax
# because it runs the command directly without a shell wrapper.
# ---------------------------------------------------------------------------
CMD ["node", "server.js"]

# Alternative CMD if NOT using standalone mode:
# CMD ["npm", "start"]


#===============================================================================
# QUICK REFERENCE
#===============================================================================
#
# BUILD THE IMAGE:
#   docker build -t my-saas-dashboard \
#     --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx \
#     --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx \
#     .
#
# RUN THE CONTAINER:
#   docker run -d \
#     --name my-app \
#     -p 3000:3000 \
#     --env-file .env \
#     my-saas-dashboard
#
# VIEW LOGS:
#   docker logs my-app
#   docker logs -f my-app  # Follow/stream logs
#
# STOP CONTAINER:
#   docker stop my-app
#
# REMOVE CONTAINER:
#   docker rm my-app
#
# SHELL INTO RUNNING CONTAINER:
#   docker exec -it my-app sh
#
#===============================================================================
