"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent,
} from "react";
import type { AwardPlace } from "./awards-data";

type CurtainState = "above" | "covering" | "below";

type AwardItemProps = {
  award: {
    title: string;
    hoverTitle: string;
    place: AwardPlace;
    url: string;
  };
  index: number;
  lineProgress: number;
  isInteractive: boolean;
};

const AwardArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M7 17L17 7M17 7H9M17 7V15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AwardFirstIcon = () => (
  <svg viewBox="0 0 65 65" fill="none" aria-hidden>
    <path
      d="M30.4687 18.2786H32.5C33.0387 18.2786 33.5554 18.4926 33.9363 18.8735C34.3172 19.2544 34.5312 19.7711 34.5312 20.3098V34.5286M30.4687 34.5286H38.5937M12.7752 35.6146L2.03125 48.75L12.1875 50.7813L16.25 62.9688L27.0562 45.8196M52.2248 35.6146L62.9687 48.75L52.8125 50.7813L48.75 62.9688L37.9437 45.8196"
      stroke="currentColor"
      strokeWidth="4.0625"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M38.7783 6.49997L33.776 2.47809C33.4148 2.18658 32.9646 2.02759 32.5004 2.02759C32.0362 2.02759 31.586 2.18658 31.2248 2.47809L26.2225 6.49997L19.8065 6.18038C19.344 6.15732 18.8875 6.29298 18.5126 6.56487C18.1378 6.83677 17.8671 7.22858 17.7454 7.67538L16.0663 13.8775L10.6875 17.3983C10.2997 17.6521 10.0103 18.0309 9.86746 18.4718C9.7246 18.9127 9.73681 19.3892 9.90209 19.8223L12.1879 25.8266L9.90209 31.8202C9.73681 32.2532 9.7246 32.7297 9.86746 33.1706C10.0103 33.6115 10.2997 33.9903 10.6875 34.2441L16.0663 37.765L17.7454 43.967C17.8666 44.4143 18.137 44.8068 18.5119 45.0792C18.8868 45.3516 19.3436 45.4877 19.8065 45.4648L26.2225 45.1452L31.2248 49.1833C31.586 49.4748 32.0362 49.6338 32.5004 49.6338C32.9646 49.6338 33.4148 49.4748 33.776 49.1833L38.7783 45.1533L45.1944 45.4729C45.6572 45.4958 46.114 45.3598 46.4889 45.0873C46.8638 44.8149 47.1343 44.4225 47.2554 43.9752L48.9346 37.7731L54.3133 34.2523C54.7012 33.9985 54.9905 33.6197 55.1334 33.1787C55.2762 32.7378 55.264 32.2613 55.0988 31.8283L52.8129 25.8266L55.0988 19.8223C55.264 19.3892 55.2762 18.9127 55.1334 18.4718C54.9905 18.0309 54.7012 17.6521 54.3133 17.3983L48.9346 13.8775L47.2554 7.67809C47.1343 7.23079 46.8638 6.83836 46.4889 6.56594C46.114 6.29351 45.6572 6.15747 45.1944 6.18038L38.7783 6.49997Z"
      stroke="currentColor"
      strokeWidth="4.0625"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AwardHeartIcon = () => (
  <svg viewBox="0 0 225 225" fill="currentColor" aria-hidden>
    <path d="M108 85.6575L112.387 90L116.888 85.5787C121.34 81.2291 127.317 78.7926 133.542 78.7896C139.766 78.7866 145.746 81.2173 150.203 85.5627C154.66 89.908 157.241 95.8237 157.396 102.046C157.551 108.269 155.267 114.306 151.031 118.867L116.606 155.689C116.08 156.251 115.444 156.699 114.738 157.005C114.032 157.311 113.27 157.469 112.5 157.469C111.73 157.469 110.968 157.311 110.262 157.005C109.556 156.699 108.92 156.251 108.394 155.689L73.9125 118.811C69.516 114.291 67.0953 108.209 67.1829 101.904C67.2704 95.5992 69.8591 89.5871 74.3794 85.1906C78.8997 80.7942 84.9813 78.3734 91.2864 78.461C97.5915 78.5486 103.604 81.1372 108 85.6575ZM22.5 112.5C22.5 88.6305 31.9821 65.7387 48.8604 48.8604C65.7387 31.9821 88.6305 22.5 112.5 22.5C136.369 22.5 159.261 31.9821 176.14 48.8604C193.018 65.7387 202.5 88.6305 202.5 112.5C202.5 136.369 193.018 159.261 176.14 176.14C159.261 193.018 136.369 202.5 112.5 202.5C88.6305 202.5 65.7387 193.018 48.8604 176.14C31.9821 159.261 22.5 136.369 22.5 112.5ZM112.5 33.75C102.158 33.75 91.9181 35.7869 82.3637 39.7445C72.8093 43.702 64.128 49.5027 56.8153 56.8153C49.5027 64.128 43.702 72.8093 39.7445 82.3637C35.7869 91.9181 33.75 102.158 33.75 112.5C33.75 122.842 35.7869 133.082 39.7445 142.636C43.702 152.191 49.5027 160.872 56.8153 168.185C64.128 175.497 72.8093 181.298 82.3637 185.256C91.9181 189.213 102.158 191.25 112.5 191.25C133.386 191.25 153.416 182.953 168.185 168.185C182.953 153.416 191.25 133.386 191.25 112.5C191.25 91.6142 182.953 71.5838 168.185 56.8153C153.416 42.0469 133.386 33.75 112.5 33.75Z" />
  </svg>
);

const PlaceIcon = ({ place }: { place: AwardPlace }) =>
  place === "first" ? <AwardFirstIcon /> : <AwardHeartIcon />;

const AwardItem = ({ award, index, lineProgress, isInteractive }: AwardItemProps) => {
  const [curtainState, setCurtainState] = useState<CurtainState>("above");
  const [curtainSnap, setCurtainSnap] = useState(false);
  const curtainStateRef = useRef<CurtainState>("above");
  curtainStateRef.current = curtainState;

  const showCurtain = useCallback(() => {
    if (!isInteractive) return;
    setCurtainSnap(false);
    setCurtainState("covering");
  }, [isInteractive]);

  const hideCurtain = useCallback(() => {
    setCurtainState((state) => (state === "covering" ? "below" : state));
  }, []);

  const handleCurtainTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLSpanElement>) => {
      if (event.propertyName !== "transform") return;
      if (curtainStateRef.current !== "below") return;

      setCurtainSnap(true);
      setCurtainState("above");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setCurtainSnap(false));
      });
    },
    [],
  );

  useEffect(() => {
    if (isInteractive) return;

    setCurtainSnap(true);
    setCurtainState("above");

    requestAnimationFrame(() => {
      setCurtainSnap(false);
    });
  }, [isInteractive]);

  const curtainClassName = [
    "awards-item__curtain",
    `awards-item__curtain--${curtainState}`,
    curtainSnap ? "awards-item__curtain--snap" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isHovered = curtainState === "covering";

  return (
    <a
      className={[
        "awards-item",
        isInteractive ? "awards-item--interactive" : "awards-item--inactive",
        isHovered ? "awards-item--hovered" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      href={award.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ "--content-order": index } as CSSProperties}
      onMouseEnter={showCurtain}
      onMouseLeave={hideCurtain}
      onFocus={showCurtain}
      onBlur={hideCurtain}
      tabIndex={isInteractive ? 0 : -1}
      aria-hidden={!isInteractive}
    >
      <div className="awards-item__clip">
        <span
          className={curtainClassName}
          aria-hidden
          onTransitionEnd={handleCurtainTransitionEnd}
        />
        <div className="awards-item__reveal">
          <div className="awards-item__row">
            <span className="awards-item__layer awards-item__layer--out">
              <h3 className="awards-item__title">{award.title}</h3>
              <span className="awards-item__icon" aria-hidden>
                <PlaceIcon place={award.place} />
              </span>
            </span>
            <span
              className="awards-item__layer awards-item__layer--in"
              aria-hidden
            >
              <span className="awards-item__title">{award.hoverTitle}</span>
              <span className="awards-item__icon">
                <AwardArrowIcon />
              </span>
            </span>
          </div>
        </div>
        <div
          className="awards-item__line"
          aria-hidden
          style={{
            transform: `scaleX(${lineProgress})`,
            opacity: lineProgress > 0 ? 1 : 0,
          }}
        />
      </div>
    </a>
  );
};

export default AwardItem;
