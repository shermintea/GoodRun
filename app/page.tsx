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
* v1.1 - 18-09-2025 - Made changes to the GoodRun description 
* v1.2 - 10-10-2025 - Replaced header with component
*******************************************************/

import MedicalPantryHeader from "@/components/MedicalPantryHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <MedicalPantryHeader />
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
  );
}
