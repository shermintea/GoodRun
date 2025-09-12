<<<<<<< HEAD
/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      page.tsx
* Author:    It Project - medical pantry - group 17
* Date:      11-09-2025
* Version:   1.1
* Purpose:   Handles volunteer registration, login authentication,
*            assignment of delivery requests to volunteers,
*            real-time checking of the delivery status,
*            (extend description if more functionalities are added).
* Revisions:
* v1.0 - 11-09-2025 - Initial implementation of the initial page
* v1.1 - 18-09-2029 - Made changes to the GoodRun description 
*******************************************************/


=======
>>>>>>> 1612cd6 (Initial commit from Create Next App)
import Image from "next/image";

export default function Home() {
  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-gray-50">
      {/* Top banner / header */}
      <header className="bg-[#171e3a] text-white">
<<<<<<< HEAD
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            {/* Logo */}
            <Image
              src="/mpLogo.png"
              alt="Medical Pantry logo"
              width={85}
              height={85}
              className="rounded-md"
            />
            <span className="text-3xl font-semibold tracking-tight">
              Medical Pantry
            </span>
          </a>
        </div>
      </header>
=======
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-3">
        <a href="/" className="flex items-center gap-2">
          {/* Logo */}
          <Image
            src="/mpLogo.png"         
            alt="Medical Pantry logo"
            width={65}
            height={65}
            className="rounded-md" 
          />
          <span className="text-2xl font-semibold tracking-tight">
            Medical Pantry
          </span>
        </a>
      </div>
    </header>
>>>>>>> 5ae33a5 (MFLP-23 Implement volunteer login page UI)

      {/* Body */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Outer card spacing to mimic the grey canvas margins */}
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left: info card */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-gray-100 px-8 py-10 shadow-sm text-center">
              <h2 className="text-2xl font-semibold">What is GoodRun?</h2>

              <p className="mt-6 text-sm leading-6 text-gray-700">
                GoodRun is Medical Pantry’s initiative to support donation deliveries. Our volunteers
                pick up supplies from generous donors and deliver it straight to our warehouse.
              </p>

              <p className="mt-6 text-sm leading-6 text-gray-700">
                By connecting communities and reducing waste, GoodRun ensures that vital
                resources are redirected to people who need them most. Every delivery
                helps strengthen healthcare access, protect the environment, and support
                vulnerable communities across Victoria.
              </p>
            </div>
          </div>

          {/* Right: calls-to-action */}
          <div className="flex flex-col items-start">
            <div className="mt-6">
              <h3 className="font-semibold">Existing Volunteers</h3>
              <a
                href="/login"
                className="mt-3 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40"
              >
                Log In
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
=======
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
>>>>>>> 1612cd6 (Initial commit from Create Next App)
  );
}
