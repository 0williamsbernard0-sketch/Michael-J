"use client";

import { useEffect, useState } from "react";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export default function Countdown({ target }: { target: Date }) {
  // Avoid hydration mismatch: render nothing time-dependent until mounted.
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(getTimeLeft(target));

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const blocks = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  if (!mounted) {
    return <div className="h-16" />;
  }

  if (time.done) {
    return (
      <p className="text-center text-[#C9A227] font-display text-lg">
        We&rsquo;re live right now.
      </p>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-5 justify-center">
      {blocks.map((b) => (
        <div key={b.label} className="text-center">
          <div className="font-display text-3xl sm:text-4xl text-[#C9A227] tabular-nums">
            {String(b.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] tracking-widest text-[#B8B2A2] mt-1">
            {b.label.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
}

