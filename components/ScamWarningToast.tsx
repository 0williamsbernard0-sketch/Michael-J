"use client";

import { useEffect, useState } from "react";

const AUTO_DISMISS_MS = 20000;
const SESSION_KEY = "mbj_scam_warning_seen";

export default function ScamWarningToast() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Show once per browser session, not on every single page navigation.
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const showTimer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const dismissTimer = setTimeout(() => handleClose(), AUTO_DISMISS_MS);
    return () => clearTimeout(dismissTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[150] w-[calc(100%-2rem)] max-w-sm transition-all duration-300 ${
        closing ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="rounded-lg border border-[#E0716B]/50 bg-[#161A20] shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-3 pt-2">
          <span className="text-[10px] uppercase tracking-wider text-[#E0716B] font-semibold pt-1">
            Scam Warning
          </span>
          <button
            onClick={handleClose}
            aria-label="Dismiss"
            className="text-[#B8B2A2] hover:text-white text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/scam-warning.jpeg"
          alt="Scam warning: there is no such thing as a Fan card. MBJ or his club would never ask for money."
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
