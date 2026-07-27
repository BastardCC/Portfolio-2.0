"use client";

import { useEffect, useRef, useState } from "react";
import textContactMark from "./assets/text-contact.svg";
import { CONTACT } from "./contact-data";

const ContactStatement = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.25, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={[
        "contact__bottom",
        visible ? "contact__bottom--visible" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="contact__statement-line" aria-hidden />
      <p className="contact__statement">
        <img
          className="contact__statement-mark"
          src={
            typeof textContactMark === "string"
              ? textContactMark
              : textContactMark.src
          }
          alt={CONTACT.statement}
          width={1490}
          height={186}
          decoding="async"
        />
      </p>
    </div>
  );
};

export default ContactStatement;
