import Link from "next/link";
import PillButton from "./_components/PillButton";
import Hero from "./_components/Hero";

export default function Home() {
  return (
    <div>
      <header className="container py-2">
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
      <section>
        <Hero />
      </section>
    </div>
  );
}
