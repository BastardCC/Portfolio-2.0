import type { ReactNode } from "react";
import "./pill-button.css";

type PillButtonProps = {
  children: ReactNode;
  href?: string;
  download?: boolean;
  className?: string;
  icon?: ReactNode;
};

const DefaultIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PillButton = ({
  children,
  href,
  download = false,
  className = "",
  icon = <DefaultIcon />,
}: PillButtonProps) => {
  const content = (
    <>
      <span className="pill-button__bg" aria-hidden />
      <span className="pill-button__label">{children}</span>
      <span className="pill-button__icon" aria-hidden>
        <span className="pill-button__dot" aria-hidden />
        <span className="pill-button__icon-reveal" aria-hidden>
          <span className="pill-button__icon-inner">{icon}</span>
        </span>
      </span>
    </>
  );

  const classes = `pill-button ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(download ? { download: true } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes}>
      {content}
    </button>
  );
};

export default PillButton;
