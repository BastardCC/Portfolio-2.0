import Link from "next/link";

export default function Home() {
  return (
    <div>
      <header className="container">
        <nav className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">Logo</Link>
          <button>Download CV</button>
        </nav>
      </header>
    </div>
  );
}
