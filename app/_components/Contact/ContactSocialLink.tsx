"use client";

import {
  useCallback,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type SocialIconName = "arrow" | "github" | "linkedin" | "whatsapp";

type ContactSocialLinkProps = {
  label: string;
  hoverLabel: string;
  href: string;
  curtainColor: string;
  hoverIcon: Exclude<SocialIconName, "arrow">;
};

const SocialIcon = ({ name }: { name: SocialIconName }) => {
  if (name === "github") {
    return (
      <svg
        className="contact__social-icon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12 2C6.477 2 2 6.586 2 12.253c0 4.537 2.865 8.374 6.839 9.726.5.094.682-.222.682-.49 0-.242-.009-.883-.014-1.733-2.782.617-3.369-1.37-3.369-1.37-.454-1.18-1.11-1.494-1.11-1.494-.908-.635.069-.622.069-.622 1.003.072 1.532 1.053 1.532 1.053.892 1.564 2.341 1.112 2.91.85.092-.663.35-1.112.636-1.367-2.22-.258-4.555-1.137-4.555-5.06 0-1.118.39-2.032 1.03-2.748-.103-.259-.447-1.3.098-2.71 0 0 .84-.274 2.75 1.048A9.35 9.35 0 0 1 12 6.844c.85.004 1.705.117 2.504.343 1.909-1.322 2.747-1.048 2.747-1.048.546 1.41.202 2.451.1 2.71.64.716 1.028 1.63 1.028 2.748 0 3.934-2.338 4.8-4.566 5.052.36.317.68.943.68 1.902 0 1.372-.012 2.477-.012 2.813 0 .27.18.588.688.488C19.138 20.623 22 16.787 22 12.253 22 6.586 17.523 2 12 2Z" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg
        className="contact__social-icon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M6.94 8.5H3.75V20.5h3.19V8.5ZM5.34 7.1a1.85 1.85 0 1 0 0-3.7 1.85 1.85 0 0 0 0 3.7ZM20.5 20.5h-3.19v-6.4c0-1.53-.55-2.57-1.92-2.57-1.05 0-1.67.7-1.95 1.38-.1.24-.13.58-.13.92v6.67H10.12s.04-10.83 0-11.95h3.19v1.69c.42-.65 1.18-1.58 2.88-1.58 2.1 0 3.68 1.37 3.68 4.32v7.52Z" />
      </svg>
    );
  }

  if (name === "whatsapp") {
    return (
      <svg
        className="contact__social-icon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M12.04 2.5a9.45 9.45 0 0 0-8.16 14.3L2.5 21.5l4.84-1.27A9.45 9.45 0 1 0 12.04 2.5Zm0 17.3c-1.5 0-2.96-.4-4.24-1.15l-.3-.18-2.87.75.77-2.8-.2-.32a7.82 7.82 0 1 1 6.84 3.7Zm4.54-5.86c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.12-.56.12-.17.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.23-.16-.48-.28Z" />
      </svg>
    );
  }

  return (
    <svg
      className="contact__social-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ContentLayer = ({
  className,
  label,
  icon,
}: {
  className: string;
  label: string;
  icon: ReactNode;
}) => (
  <span className={className}>
    <span className="contact__social-label">{label}</span>
    {icon}
  </span>
);

const ContactSocialLink = ({
  label,
  hoverLabel,
  href,
  curtainColor,
  hoverIcon,
}: ContactSocialLinkProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const showCurtain = useCallback(() => setIsHovered(true), []);
  const hideCurtain = useCallback(() => setIsHovered(false), []);

  return (
    <a
      className={[
        "contact__social",
        isHovered ? "contact__social--hovered" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={
        {
          "--contact-social-curtain-color": curtainColor,
        } as CSSProperties
      }
      onMouseEnter={showCurtain}
      onMouseLeave={hideCurtain}
      onFocus={showCurtain}
      onBlur={hideCurtain}
    >
      <span className="contact__social-clip">
        <span className="contact__social-curtain" aria-hidden />
        <span className="contact__social-content">
          <ContentLayer
            className="contact__social-layer contact__social-layer--out"
            label={label}
            icon={<SocialIcon name="arrow" />}
          />
          <ContentLayer
            className="contact__social-layer contact__social-layer--in"
            label={hoverLabel}
            icon={<SocialIcon name={hoverIcon} />}
          />
        </span>
      </span>
    </a>
  );
};

export default ContactSocialLink;
