import Link from "next/link";
import PillButton from "../PillButton";

const CV_PATH = encodeURI(
  "/CV - RAKOTOSON Aina Nirina - Développeur Fullstack.pdf"
);

const Header = () => {
  return (
    <header className="container relative z-10 py-2">
      <nav className="flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center" aria-label="Aina Nirina">
          <img
            src="/logo.svg"
            alt=""
            className="h-8 w-auto md:h-10"
          />
        </Link>
        <PillButton href={CV_PATH} download>
          Download CV
        </PillButton>
      </nav>
    </header>
  );
};

export default Header;
