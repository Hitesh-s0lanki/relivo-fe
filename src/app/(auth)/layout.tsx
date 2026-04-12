import Image from "next/image";

import { AuthBrandSwitch } from "./_components/auth-brand-switch";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left: brand panel — hidden on mobile */}
      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        <AuthBrandSwitch />
      </div>

      {/* Right: Clerk form */}
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-12">
        {/* Mobile-only logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Image src="/logo.svg" alt="Relivo" width={28} height={28} />
          <span className="text-base font-bold tracking-tight text-black">
            Relivo
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
