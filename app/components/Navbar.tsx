export default function Navbar() {
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-tight">GoodRun</a>
        <nav className="hidden sm:flex gap-6 text-sm">
          <a href="/events" className="hover:underline">Events</a>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <a href="/about" className="hover:underline">About</a>
        </nav>
        <div className="flex gap-2">
          <a href="/login" className="text-sm">Sign in</a>
          <a href="/signup" className="text-sm rounded-lg border px-3 py-1.5">Sign up</a>
        </div>
      </div>
    </header>
  );
}
