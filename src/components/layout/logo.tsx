import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.75" y="0.75" width="28.5" height="28.5" rx="8" stroke="#D4AF37" strokeWidth="1.2" />
        <path
          d="M9 11.5C9 9.567 10.567 8 12.5 8h1.2c.9 0 1.63.71 1.66 1.61.02.6.51 1.08 1.11 1.08h.06c.6 0 1.09-.48 1.11-1.08C17.67 8.71 18.4 8 19.3 8h.2C21.433 8 23 9.567 23 11.5c0 1.3-.4 2.2-1 3.2-.5.85-.6 1.55-.55 2.5l.25 4.3c.05.9-.65 1.5-1.4 1.5-.65 0-1.2-.45-1.35-1.1l-.85-3.7c-.15-.65-.7-1.1-1.35-1.1h-.2c-.65 0-1.2.45-1.35 1.1l-.85 3.7c-.15.65-.7 1.1-1.35 1.1-.75 0-1.45-.6-1.4-1.5l.25-4.3c.05-.95-.05-1.65-.55-2.5-.6-1-1-1.9-1-3.2Z"
          stroke="#D4AF37"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-text-primary">GC OdontoHub</span>
        <span className="text-[10px] font-medium tracking-wide text-text-muted">v1.0 · MVP</span>
      </div>
    </div>
  );
}
