"use client";
import { useRef } from "react";
import { LanyardData, getAvatarUrl } from "./useLanyard";
import { aboutSectionOptions as o } from "./options";
import styles from "./AboutCard.module.css";

const STACK = [
  { name: "JavaScript",      icon: "/icons/javascript.svg" },
  { name: "TypeScript",      icon: "/icons/typescript.svg" },
  { name: "React",           icon: "/icons/react.svg" },
  { name: "Next.js",         icon: "/icons/nextjs.svg" },
  { name: "Python",          icon: "/icons/python.svg" },
  { name: "Blender",         icon: "/icons/blender.svg" },
  { name: "Adobe Photoshop", icon: "/icons/photoshop.svg" },
  { name: "Cloudflare",      icon: "/icons/cloudflare.svg" },
  { name: "AWS",             icon: "/icons/aws.svg" },
];

interface Props {
  lanyardData: LanyardData | null;
  inView: boolean;
}

export default function AboutCard({ lanyardData, inView }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = -my * o.aboutHoverMouseRange;
    const ry = o.aboutHoverTiltY + mx * o.aboutHoverMouseRange;
    card.style.transition = "transform 0.15s ease";
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 0.7s cubic-bezier(0.23,1,0.32,1)";
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
  };

  const avatarUrl = getAvatarUrl(lanyardData?.discord_user);

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${inView ? styles.inView : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Label: rule line + text */}
      <div className={styles.label} style={{ opacity: o.labelOpacity }}>
        <span className={styles.labelRule} style={{ width: o.labelRuleWidth }} />
        <span className={styles.labelText}>about me</span>
      </div>

      <div className={styles.profile} style={{ marginTop: o.profileMarginTop }}>
        <div
          className={styles.avatarWrap}
          style={{ width: o.avatarSize, height: o.avatarSize }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="avatar"
              className={styles.avatar}
              style={{ width: o.avatarSize, height: o.avatarSize }}
            />
          ) : (
            <div
              className={styles.avatarPlaceholder}
              style={{ width: o.avatarSize, height: o.avatarSize }}
            />
          )}
        </div>

        <div className={styles.nameWrap} style={{ marginTop: o.heyImMarginTop }}>
          <span className={styles.heyIm} style={{ fontSize: o.heyImFontSize }}>hey, i&apos;m</span>
          <span
            className={styles.name}
            style={{
              fontSize: `clamp(${o.nameSizeMin}px, ${o.nameSizeVw}vw, ${o.nameSizeMax}px)`,
              letterSpacing: `${o.nameLetterSpacing}em`,
              marginTop: o.nameTopMargin,
            }}
          >
            luca.
          </span>
        </div>
      </div>

      <p
        className={styles.bio}
        style={{ fontSize: o.bioFontSize, maxWidth: o.bioMaxWidth }}
      >
        full stack dev, self-taught. i build things that live
        on the internet, usually between midnight and sunrise.
      </p>

      <div className={styles.stack}>
        {STACK.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={t.name}
            src={t.icon}
            alt={t.name}
            className={styles.stackIcon}
            style={{ width: o.iconSize, height: o.iconSize }}
          />
        ))}
      </div>
    </div>
  );
}
