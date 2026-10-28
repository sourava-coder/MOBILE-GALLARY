"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function WelcomeSplash() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => setClosing(true), 1700);
    const removeTimer = window.setTimeout(() => setVisible(false), 2150);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`welcome-splash ${closing ? "is-closing" : ""}`} aria-label="Welcome to Mobile Gallary">
      <div className="welcome-orbit welcome-orbit-one" />
      <div className="welcome-orbit welcome-orbit-two" />
      <div className="welcome-glow" />
      <div className="welcome-content">
        <div className="welcome-logo-frame">
          <Image src="/logo.png" alt="" width={116} height={116} priority />
        </div>
        <p className="welcome-kicker">MOBILE · REPAIR · CARE</p>
        <h1>Welcome to <span>Mobile Gallary</span></h1>
        <div className="welcome-loader"><span /></div>
      </div>
    </div>
  );
}
