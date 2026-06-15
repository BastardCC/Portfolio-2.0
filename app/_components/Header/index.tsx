import Link from "next/link";
import PillButton from "../PillButton";

const CV_PATH = encodeURI(
  "/CV - RAKOTOSON Aina Nirina - Développeur Fullstack.pdf"
);

const Header = () => {
  return (
    <header className="container relative z-10 py-2">
      <nav className="flex items-center justify-between py-4">
        <Link href="/" className="text-2xl font-bold">
          Logo
        </Link>
        <PillButton href={CV_PATH} download>
          Download CV
        </PillButton>
      </nav>
    </header>
  );
};

export default Header;
