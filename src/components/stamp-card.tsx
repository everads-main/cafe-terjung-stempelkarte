import { STAMPS_FOR_REWARD } from "@/lib/config";
import type { CardState } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CupIcon } from "@/components/cup-icon";

export function StampCard({
  card,
  className,
  compact = false,
  pulse = false,
}: {
  card: CardState;
  className?: string;
  compact?: boolean;
  pulse?: boolean;
}) {
  const filled = Math.min(card.current, STAMPS_FOR_REWARD);

  return (
    <section
      className={cn(
        "paper-card rounded-[1.4rem] p-5 transition",
        pulse && "stamp-flash",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-terjung uppercase">
            Stempelkarte
          </p>
          {!compact ? (
            <h2 className="mt-1 text-xl font-semibold text-ink">{card.firstName}</h2>
          ) : null}
        </div>
        <p className="rounded-full bg-terjung px-3 py-1 text-sm font-semibold text-ink">
          {filled}/{STAMPS_FOR_REWARD}
        </p>
      </div>

      <div className={cn("grid grid-cols-5 gap-2.5", compact ? "mt-3" : "mt-5")}>
        {Array.from({ length: STAMPS_FOR_REWARD }, (_, index) => (
          <CupIcon key={index} filled={index < filled} index={index} />
        ))}
      </div>

      {!compact ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {card.freeCoffeeReady
            ? "Voll – unter Einlösen den QR zeigen."
            : card.current === 0
              ? "Noch leer. QR an der Theke zeigen."
              : `Noch ${card.stampsUntilFree} bis zum freien Kaffee.`}
        </p>
      ) : null}
    </section>
  );
}
