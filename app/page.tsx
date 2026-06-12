import Link from "next/link";
import Hero from "./_components/Hero";

export default function Home() {
  return (
    <div>
      <header className="container">
        <nav className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">Logo</Link>
          <button>Download CV</button>
        </nav>
      </header>
      <section>
        <Hero />
      </section>
    </div>
  );
}
