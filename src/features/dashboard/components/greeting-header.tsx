"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { fadeInUp } from "@/animations/variants";

import {
  getGreeting,
  getFullDate,
  getTime,
} from "@/lib/greeting";

import { getDailyPhrase } from "@/lib/daily-phrase";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function formatDisplayName(
  nome: string | null | undefined
) {
  if (!nome) {
    return "";
  }

  const parts = nome
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean);

  if (parts.length <= 2) {
    return parts.join(" ");
  }

  return `${parts[0]} ${parts[1]}`;
}

export function GreetingHeader() {
  const [now, setNow] =
    useState<Date | null>(null);

  const [displayName, setDisplayName] =
    useState("");

  useEffect(() => {
    setNow(new Date());

    const interval = setInterval(
      () => setNow(new Date()),
      30_000
    );

    return () =>
      clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadUserName() {
      if (!isSupabaseConfigured) {
        setDisplayName("");
        return;
      }

      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const nome =
          user?.user_metadata?.nome ??
          user?.user_metadata?.name ??
          "";

        setDisplayName(
          formatDisplayName(nome)
        );
      } catch (error) {
        console.error(
          "Erro ao carregar nome do usuário:",
          error
        );

        setDisplayName("");
      }
    }

    loadUserName();

    const supabase = isSupabaseConfigured
      ? createClient()
      : null;

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const nome =
          session?.user?.user_metadata
            ?.nome ??
          session?.user?.user_metadata
            ?.name ??
          "";

        setDisplayName(
          formatDisplayName(nome)
        );
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const phrase = getDailyPhrase(
    now ?? new Date()
  );

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {now
            ? getGreeting(now)
            : "Bom dia"}
          {displayName
            ? `, ${displayName}.`
            : "."}
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          {now
            ? getFullDate(now)
            : ""}{" "}
          {now && `· ${getTime(now)}`}
        </p>
      </div>

      <div className="mt-4 rounded-[var(--radius-card)] border border-primary/20 bg-gradient-to-r from-primary/[0.07] to-transparent px-5 py-3.5">
        <p className="text-sm italic text-text-secondary">
          &ldquo;{phrase.texto}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}
