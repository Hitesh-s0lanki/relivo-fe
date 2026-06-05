# Clerk Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Clerk authentication into `relivo-fe-server` — protected routes, auth-aware Navbar, sign-in/sign-up pages via Clerk widgets, onboarding stub, and UserButton in the app header.

**Architecture:** ClerkProvider wraps the root layout; a Clerk middleware guards `/app` and `/onboarding`. The existing `/login` and `/signup` pages become permanent redirects; real auth lives at `/sign-in` and `/sign-up` under a new `(auth)` route group with a clean centered layout. The Navbar conditionally shows "Go to App" + `<UserButton />` for signed-in users and `/sign-in`/`/sign-up` links for guests.

**Tech Stack:** Next.js 16 App Router, `@clerk/nextjs` v6, Tailwind CSS v4, Sonner (already installed at v2.0.7)

---

## File Map

| Action | Path                                             | Responsibility                                                     |
| ------ | ------------------------------------------------ | ------------------------------------------------------------------ |
| Create | `src/middleware.ts`                              | Protect `/app` and `/onboarding` via Clerk                         |
| Modify | `src/app/layout.tsx`                             | Wrap body with `ClerkProvider`, add `<Toaster />`                  |
| Create | `src/app/(auth)/layout.tsx`                      | Centered white layout for auth pages (no Navbar/Footer)            |
| Create | `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Clerk `<SignIn />` widget; redirect to `/app` if already signed in |
| Create | `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Clerk `<SignUp />` widget; redirect to `/app` if already signed in |
| Modify | `src/app/(public)/login/page.tsx`                | `redirect('/sign-in')` — permanent redirect, drop old form         |
| Modify | `src/app/(public)/signup/page.tsx`               | `redirect('/sign-up')` — permanent redirect, drop old form         |
| Create | `src/app/onboarding/page.tsx`                    | Protected post-signup stub, no sidebar                             |
| Modify | `src/app/(public)/_components/Navbar.tsx`        | Auth-aware: show "Go to App" + `<UserButton />` when signed in     |
| Modify | `src/app/app/_components/header/MainHeader.tsx`  | Add `<UserButton afterSignOutUrl="/sign-in" />` to right actions   |
| Create | `.env.local`                                     | Clerk keys + URL env vars (never committed)                        |

---

## Task 1: Install `@clerk/nextjs` and create `.env.local`

**Files:**

- Create: `.env.local`

- [ ] **Step 1: Install Clerk package**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm install @clerk/nextjs
```

Expected: resolves and installs `@clerk/nextjs` (v6.x). No peer-dependency errors.

- [ ] **Step 2: Create `.env.local` with placeholder values**

Create `/Users/Hemant/Desktop/projects/relivo/relivo-fe-server/.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME
CLERK_SECRET_KEY=sk_test_REPLACE_ME
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

> The user must replace `REPLACE_ME` values with real keys from the Clerk dashboard. The `.env.local` file is git-ignored by default in Next.js projects.

- [ ] **Step 3: Verify `.env.local` is git-ignored**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
grep -r "\.env" .gitignore 2>/dev/null || echo "No .gitignore found — confirm .env.local is not tracked"
```

If `.gitignore` does not list `.env.local`, add it before continuing.

---

## Task 2: Create Clerk Middleware

**Files:**

- Create: `src/middleware.ts`

- [ ] **Step 1: Create `src/middleware.ts`**

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)", "/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no errors related to `middleware.ts`. (Env var errors may appear until real keys are set — that's acceptable.)

- [ ] **Step 3: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add src/middleware.ts
git commit -m "feat: add Clerk middleware protecting /app and /onboarding"
```

---

## Task 3: Add ClerkProvider and Toaster to Root Layout

**Files:**

- Modify: `src/app/layout.tsx`

Current file (`src/app/layout.tsx`) imports fonts and wraps everything in `<html>/<body>`. We need to:

1. Import `ClerkProvider` from `@clerk/nextjs`
2. Import `Toaster` from `sonner`
3. Wrap the `<html>` element with `<ClerkProvider>`
4. Add `<Toaster />` inside `<body>`

- [ ] **Step 1: Update `src/app/layout.tsx`**

Replace the entire file with:

```tsx
import "./globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Relivo — AI Task Assistant",
  description:
    "Assign tasks, automate workflows, and get things done with Relivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{ variables: { colorPrimary: "#111827" } }}
    >
      <html
        lang="en"
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">
          {children}
          <Toaster richColors position="bottom-right" visibleToasts={3} />
          {process.env.VERCEL_ENV === "production" && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no new errors from layout.tsx.

- [ ] **Step 3: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add src/app/layout.tsx
git commit -m "feat: wrap root layout with ClerkProvider and add Sonner Toaster"
```

---

## Task 4: Create Auth Route Group Layout

**Files:**

- Create: `src/app/(auth)/layout.tsx`

- [ ] **Step 1: Create `src/app/(auth)/layout.tsx`**

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add src/app/'(auth)'/layout.tsx
git commit -m "feat: add centered auth layout for sign-in/sign-up pages"
```

---

## Task 5: Create Sign-In Page

**Files:**

- Create: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

- [ ] **Step 1: Create the directory and file**

Create `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/app");
  return <SignIn />;
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add "src/app/(auth)/sign-in/[[...sign-in]]/page.tsx"
git commit -m "feat: add /sign-in page with Clerk SignIn widget"
```

---

## Task 6: Create Sign-Up Page

**Files:**

- Create: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: Create the directory and file**

Create `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/app");
  return <SignUp />;
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add "src/app/(auth)/sign-up/[[...sign-up]]/page.tsx"
git commit -m "feat: add /sign-up page with Clerk SignUp widget"
```

---

## Task 7: Replace Legacy Login/Signup Pages with Redirects

**Files:**

- Modify: `src/app/(public)/login/page.tsx`
- Modify: `src/app/(public)/signup/page.tsx`

The existing pages contain full custom form UIs. Replace them entirely with server-component redirects so old links don't 404.

- [ ] **Step 1: Replace `src/app/(public)/login/page.tsx`**

```tsx
import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/sign-in");
}
```

- [ ] **Step 2: Replace `src/app/(public)/signup/page.tsx`**

```tsx
import { redirect } from "next/navigation";

export default function SignupPage() {
  redirect("/sign-up");
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add src/app/'(public)'/login/page.tsx src/app/'(public)'/signup/page.tsx
git commit -m "feat: replace legacy login/signup pages with permanent redirects to /sign-in and /sign-up"
```

---

## Task 8: Create Onboarding Page

**Files:**

- Create: `src/app/onboarding/page.tsx`

This is a protected route (middleware handles auth) with no sidebar or header — standalone layout.

- [ ] **Step 1: Create `src/app/onboarding/page.tsx`**

```tsx
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Relivo</h1>
        <p className="mt-3 text-sm text-gray-500">
          Your account is set up. Let&apos;s get you started.
        </p>
        <Link
          href="/app"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
        >
          Go to App
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add src/app/onboarding/page.tsx
git commit -m "feat: add onboarding stub page (protected by middleware)"
```

---

## Task 9: Update Navbar to Be Auth-Aware

**Files:**

- Modify: `src/app/(public)/_components/Navbar.tsx`

The Navbar is already a `"use client"` component. We need to:

1. Import `useAuth` and `UserButton` from `@clerk/nextjs`
2. Replace the Login/Get Started buttons with conditional auth state
3. Update hrefs from `/login` → `/sign-in` and `/signup` → `/sign-up` in the signed-out state
4. Apply the same logic to the mobile menu

- [ ] **Step 1: Update `src/app/(public)/_components/Navbar.tsx`**

Replace the entire file with:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex cursor-pointer items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="Relivo"
            width={28}
            height={28}
            className="shrink-0"
          />
          <span className="font-mono text-base font-bold tracking-tight text-gray-900">
            relivo
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "cursor-pointer text-sm font-medium transition-colors duration-200",
                pathname === link.href
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {isSignedIn ? (
            <>
              <Link
                href="/app"
                className="cursor-pointer text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900"
              >
                Go to App
              </Link>
              <UserButton afterSignOutUrl="/sign-in" />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="cursor-pointer text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gray-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="cursor-pointer text-gray-500 transition-colors hover:text-gray-900 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-200 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="cursor-pointer text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              {isSignedIn ? (
                <>
                  <Link
                    href="/app"
                    onClick={() => setOpen(false)}
                    className="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                  >
                    Go to App
                  </Link>
                  <div className="flex justify-start">
                    <UserButton afterSignOutUrl="/sign-in" />
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                    className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-700"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add src/app/'(public)'/_components/Navbar.tsx
git commit -m "feat: make Navbar auth-aware with Clerk useAuth and UserButton"
```

---

## Task 10: Add UserButton to App Header

**Files:**

- Modify: `src/app/app/_components/header/MainHeader.tsx`

The `MainHeader` is a server component (no `"use client"` directive). `UserButton` is a client component. We need to add it to the right-side actions alongside the existing Bell and Help buttons.

Since `MainHeader` currently has no client-side state, we can either:

- Add `"use client"` to the file, or
- Import `UserButton` directly (Clerk components work in both RSC and client contexts)

`UserButton` from `@clerk/nextjs` can be used inside server components — Clerk handles hydration internally. We just import and render it.

- [ ] **Step 1: Update `src/app/app/_components/header/MainHeader.tsx`**

```tsx
import { Bell, ChevronDown, HelpCircle } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MainHeader() {
  return (
    <TooltipProvider>
      <header className="flex shrink-0 items-center justify-between bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        {/* Model selector */}
        <button className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800">
          Relivo
          <ChevronDown className="size-4" />
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="cursor-pointer rounded-md p-1.5 text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Help"
              >
                <HelpCircle className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Help</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="relative cursor-pointer rounded-md p-1.5 text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                {/* Notification dot */}
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-violet-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>
    </TooltipProvider>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add src/app/app/_components/header/MainHeader.tsx
git commit -m "feat: add Clerk UserButton to app header"
```

---

## Task 11: Final Lint + Type Check

- [ ] **Step 1: Run full lint**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run lint
```

Fix any errors reported. Common issues: unused imports, missing semicolons (handled by Prettier).

- [ ] **Step 2: Run typecheck**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
npm run typecheck
```

Expected: zero errors.

- [ ] **Step 3: Commit any lint fixes**

```bash
cd /Users/Hemant/Desktop/projects/relivo/relivo-fe-server
git add -p
git commit -m "chore: fix lint issues from Clerk auth integration"
```

---

## Post-Implementation: Manual Verification Checklist

After getting real Clerk keys from the Clerk dashboard and populating `.env.local`:

- [ ] `npm run dev` starts without errors on port 3001
- [ ] `/` public home page loads with Navbar showing Login / Get Started (signed out)
- [ ] `/sign-in` shows Clerk `<SignIn />` widget centered on white background (no Navbar/Footer)
- [ ] `/sign-up` shows Clerk `<SignUp />` widget centered on white background
- [ ] `/login` redirects to `/sign-in`
- [ ] `/signup` redirects to `/sign-up`
- [ ] Signing in redirects to `/app`
- [ ] After sign-up, Clerk redirects to `/onboarding`
- [ ] `/app` when unauthenticated redirects to `/sign-in`
- [ ] `/onboarding` when unauthenticated redirects to `/sign-in`
- [ ] Signed-in Navbar shows "Go to App" link and `<UserButton />`
- [ ] App header shows `<UserButton />` next to Bell and Help icons
- [ ] Signing out from `<UserButton />` redirects to `/sign-in`
- [ ] Signing in when already authenticated (visiting `/sign-in`) redirects to `/app`

---

## Notes

- **Clerk keys:** Obtain from [clerk.com](https://clerk.com) dashboard → Create application → API Keys. The spec says to use prebuilt components with no social provider config (done in Clerk dashboard, not in code).
- **Next.js 16 caveat:** The AGENTS.md warns this Next.js version may have breaking changes. If `auth()` from `@clerk/nextjs/server` fails, check `node_modules/next/dist/docs/01-app/` for App Router conventions in this version. The Clerk middleware pattern used here follows the official Clerk v6 API.
- **No test framework is installed** — verification is via TypeScript (`npm run typecheck`) and manual browser testing.
