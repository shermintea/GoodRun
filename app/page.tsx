/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      “Filename”
* Author:    It Project - medical pantry - group 17
* Date:      11-09-2025
* Version:   1.0
* Purpose:   Handles volunteer registration, login authentication,
*            assignment of delivery requests to volunteers,
*            real-time checking of the delivery status,
*            (extend description if more functionalities are added).
* Revisions:
* v1.0 - Date - Initial implementation
* …
*******************************************************/


import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top banner / header */}
      <header className="bg-[#171e3a] text-white">
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </div>

          {/* Right: calls-to-action */}
          <div className="flex flex-col items-start">
            <div>
              <h3 className="font-semibold">Join Us Today</h3>
              <a
                href="/signup"
                className="mt-3 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40"
              >
                Volunteer
              </a>
            </div>

            <div className="mt-12">
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
  );
}
