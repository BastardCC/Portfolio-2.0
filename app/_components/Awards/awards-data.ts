import type { StaticImageData } from "next/image";
import BigCircle from "../Hero/assets/big-circle.png";
import SmallCircle from "../Hero/assets/small-circle.png";
import Doonation from "../Projects/assets/doonation.png";

export type AwardItem = {
  title: string;
  description: string;
  image: StaticImageData;
};

export const AWARDS_DESCRIPTION =
  "Texte de description des récompenses et distinctions obtenues au fil des projets.";

export const AWARDS: AwardItem[] = [
  {
    title: "Award 1",
    description: "Award Description",
    image: Doonation,
  },
  {
    title: "Award 2",
    description: "Award Description",
    image: BigCircle,
  },
  {
    title: "Award 3",
    description: "Award Description",
    image: SmallCircle,
  },
  {
    title: "Award 4",
    description: "Award Description",
    image: Doonation,
  },
];
