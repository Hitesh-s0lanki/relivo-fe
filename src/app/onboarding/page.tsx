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
