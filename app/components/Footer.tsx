export default function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
        © {new Date().getFullYear()} GoodRun · All rights reserved
      </div>
    </footer>
  );
}
