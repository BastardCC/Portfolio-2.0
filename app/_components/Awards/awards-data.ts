import type { StaticImageData } from "next/image";
import FrontendAwards2022 from "./assets/fa-award.webp";
import InteruniversityHackathon2023 from "./assets/hiu.webp";
import WCCFrontend2022 from "./assets/wcc.webp";
import Hackit from "./assets/hackit.webp";

export type AwardPlace = "first" | "choice";

export type AwardItem = {
  title: string;
  hoverTitle: string;
  place: AwardPlace;
  image: StaticImageData;
  url: string;
};

export const AWARDS_DESCRIPTION =
  "A handful of competitions, a few sleepless nights, and the recognition that came with them.";

export const AWARDS: AwardItem[] = [
  {
    title: "Frontend Awards 2022",
    hoverTitle: "First Place",
    place: "first",
    image: FrontendAwards2022,
    url: "https://fa-2022-yasai.netlify.app/",
  },
  {
    title: "WCC Frontend 2022",
    hoverTitle: "First Place",
    place: "first",
    image: WCCFrontend2022,
    url: "https://www.facebook.com/Techzara/posts/pfbid02gRo5MbgQHEjA31TXf9wvvniPCN1NwEa14KWLKWssBRLJkMMDPPmM1FQkhStY5KdCl",
  },
  {
    title: "Hack-it",
    hoverTitle: "First Place",
    place: "first",
    image: Hackit,
    url: "https://www.facebook.com/permalink.php?story_fbid=pfbid0H9rFyeJQ8ju2VtCZV24JHHceBbrGvSCzfc6rzk18FAYnhaB6jjYcaJJ3XYoMZiASl&id=100093402235827"
  },
  {
    title: "Interuniversity Hackathon 2023",
    hoverTitle: "Judge's Choice",
    place: "choice",
    image: InteruniversityHackathon2023,
    url: "https://www.facebook.com/photo/?fbid=529076589341334&set=a.493988452850148",
  },
];
