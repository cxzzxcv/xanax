"use client";
import { useRef } from "react";
import { LanyardData, STATUS_COLOR, STATUS_LABEL } from "./useLanyard";
import { aboutSectionOptions as o } from "./options";
import styles from "./SocialsCard.module.css";

interface Social {
  name: string;
  username: string;
  href: string;
  icon: React.ReactNode;
}

interface Props {
  lanyardData: LanyardData | null;
  inView: boolean;
}

export default function SocialsCard({ lanyardData, inView }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = -my * o.socialsHoverMouseRange;
    const ry = o.socialsHoverTiltY + mx * o.socialsHoverMouseRange;
    card.style.transition = "transform 0.15s ease";
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 0.7s cubic-bezier(0.23,1,0.32,1)";
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
  };

  const status = lanyardData?.discord_status ?? "offline";
  const dotColor = STATUS_COLOR[status];
  const statusLabel = STATUS_LABEL[status];

  const socials: Social[] = [
    {
      name: "discord",
      username: "y3e",
      href: `https://discord.com/users/${process.env.NEXT_PUBLIC_DISCORD_ID || "1098229551588458527"}`,
      icon: <DiscordIcon />,
    },
    {
      name: "tiktok",
      username: "log",
      href: "https://tiktok.com/@log",
      // eslint-disable-next-line @next/next/no-img-element
      icon: <img src="/icons/tiktok.svg" alt="TikTok" width={16} height={16} style={{ display: "block" }} />,
    },
    {
      name: "telegram",
      username: "ahgjasjaf",
      href: "https://t.me/ahgjasjaf",
      icon: <TelegramIcon />,
    },
    {
      name: "email",
      username: "me@xanax.support",
      href: "mailto:me@xanax.support",
      // eslint-disable-next-line @next/next/no-img-element
      icon: <img src="/icons/email.svg" alt="email" width={16} height={16} style={{ display: "block" }} />,
    },
  ];

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${inView ? styles.inView : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.label} style={{ opacity: o.labelOpacity }}>
        <span className={styles.labelRule} style={{ width: o.labelRuleWidth }} />
        <span className={styles.labelText}>find me at</span>
      </div>

      <div className={styles.statusRow}>
        <span className={styles.statusDot} style={{ background: dotColor }} />
        <span className={styles.statusText}>{statusLabel}</span>
      </div>

      <div className={styles.list}>
        {socials.map((s, i) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.row}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <span className={styles.icon}>{s.icon}</span>
            <span className={styles.platform}>{s.name}</span>
            <span className={styles.sep}>/</span>
            <span className={styles.username}>{s.username}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942.0209-.0407.0083-.0893-.0395-.1091-1.1641-.4415-2.2765-1.0052-3.354-1.6501-.0573-.033-.061-.1167-.0076-.1572.2257-.1692.4514-.3452.6671-.5231a.0752.0752 0 01.0785-.0105c4.0513 1.8495 8.4373 1.8495 12.4427 0a.0752.0752 0 01.0796.0095c.2157.1779.4414.3559.6671.5231.0533.0405.0496.1242-.0077.1572-1.0775.6449-2.1899 1.2086-3.354 1.6501-.0478.0198-.0604.0694-.0394.1091.3534.699.7642 1.3638 1.2255 1.9942a.076.076 0 00.0842.0276c1.961-.6066 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
