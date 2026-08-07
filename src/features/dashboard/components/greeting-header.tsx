"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/animations/variants";
import { getGreeting, getFullDate, getTime } from "@/lib/greeting";
import { getDailyPhrase } from "@/lib/daily-phrase";

export function GreetingHeader() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const phrase = getDailyPhrase(now ?? new Date());

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-text-primary sm:text-[32px]">
            {now ? getGreeting(now) : "Bom dia"}, Junior e Gabriel.
          </h1>
          <p className="mt-1.5 text-sm capitalize text-text-secondary">
            {now ? getFullDate(now) : ""} {now && `· ${getTime(now)}`}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[var(--radius-card)] border border-primary/20 bg-gradient-to-r from-primary/[0.07] to-transparent px-5 py-3.5">
        <p className="text-sm italic text-text-secondary">&ldquo;{phrase.texto}&rdquo;</p>
      </div>
    </motion.div>
  );
}
