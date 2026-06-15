import Link from "next/link";
import PillButton from "./_components/PillButton";
import Hero from "./_components/Hero";

export default function Home() {
  return (
    <div>
      <header className="container relative z-10 py-2">
        <nav className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">Logo</Link>
          <PillButton
            href={encodeURI(
              "/CV - RAKOTOSON Aina Nirina - Développeur Fullstack.pdf"
            )}
            download
          >
            Download CV
          </PillButton>
        </nav>
      </header>
      <section className="relative z-0">
        <Hero />
      </section>
    </div>
  );
}
