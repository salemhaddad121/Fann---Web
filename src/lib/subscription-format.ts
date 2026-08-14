/**
 * How long is left on a subscription, in words.
 *
 * Days alone is wrong here because of the day pass: something with four
 * hours left would read "0 days left", which looks broken at exactly the
 * moment the number matters most. Under a day this switches to hours, and
 * under an hour to minutes.
 */
export function formatRemaining(expiresAt: string | null, now: number = Date.now()): string {
  if (!expiresAt) return "";

  const ms = new Date(expiresAt).getTime() - now;
  if (Number.isNaN(ms)) return "";
  if (ms <= 0) return "expired";

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) {
    // Round up rather than down, so the last 59 seconds read "1 minute
    // left" instead of "0 minutes left" on something still running. The
    // plural has to agree with the number actually shown, not the raw one.
    const shown = Math.max(1, minutes);
    return `${shown} minute${shown === 1 ? "" : "s"} left`;
  }

  const hours = Math.floor(ms / 3_600_000);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} left`;
  }

  const days = Math.floor(ms / 86_400_000);
  return `${days} day${days === 1 ? "" : "s"} left`;
}

/** Human label for a plan code, for use in running prose. */
export function planLabel(planCode: string): string {
  if (planCode === "day") return "day pass";
  if (planCode === "month") return "monthly plan";
  if (planCode === "year") return "yearly plan";
  return planCode;
}
