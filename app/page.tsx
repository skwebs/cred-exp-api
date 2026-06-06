import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
            />
            <span className="text-xl font-bold tracking-tight text-zinc-400">/</span>
            <span className="text-xl font-bold tracking-tight text-black dark:text-white">API</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50">
            Credit Expense Tracker API
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A comprehensive backend service for managing credit card billing cycles, accounts, categories, and real-time transaction tracking.
          </p>
          
          <div className="grid grid-cols-1 gap-2 text-sm text-zinc-500 dark:text-zinc-500 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Drizzle ORM & PostgreSQL
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              JWT Authentication
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Billing Cycle Engine
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              OpenAPI Documentation
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 md:w-39.5"
            href="/docs"
          >
            Explore Docs
          </Link>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/8 px-5 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/14.5 dark:hover:bg-white/5 md:w-39.5 text-black dark:text-white"
            href="https://github.com/google/gemini-cli"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </a>
        </div>
      </main>
    </div>
  );
}
