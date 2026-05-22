import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Header({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-neutral-900 transition-opacity hover:opacity-80 dark:text-white"
        >
          Dashboard
        </Link>
        <div className="flex items-center gap-4">
          {userName ? (
            <>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {userName}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/authenticate"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
