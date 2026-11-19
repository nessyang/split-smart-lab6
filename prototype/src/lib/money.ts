/** Largest accepted expense: $1,000,000.00 (keeps values well inside 32-bit Int). */
export const MAX_AMOUNT_CENTS = 100_000_000;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Convert a user-entered dollar amount ("60", "60.5", "60.50", or a number)
 * into integer cents without floating-point arithmetic.
 */
export function parseAmountToCents(input: unknown): number {
  const raw = typeof input === "number" ? String(input) : input;
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new ValidationError("Amount is required.");
  }
  const text = raw.trim();
  const match = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) {
    if (/^-?\d*\.\d{3,}$/.test(text)) {
      throw new ValidationError("Amount can have at most two decimal places.");
    }
    throw new ValidationError("Amount must be a number, for example 12.50.");
  }
  const [, minus, whole, frac = ""] = match;
  const cents = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  if (minus || cents <= 0) {
    throw new ValidationError("Amount must be greater than $0.00.");
  }
  if (cents > MAX_AMOUNT_CENTS) {
    throw new ValidationError("Amount cannot exceed $1,000,000.00.");
  }
  return cents;
}

/** Format integer cents as a dollar string, e.g. -2000 -> "-$20.00". */
export function formatCents(cents: number, { signed = false } = {}): string {
  const abs = Math.abs(cents);
  const text = `$${Math.floor(abs / 100).toLocaleString("en-US")}.${String(abs % 100).padStart(2, "0")}`;
  if (cents < 0) return `-${text}`;
  if (signed && cents > 0) return `+${text}`;
  return text;
}

/**
 * Split `totalCents` equally among participants. Remainder cents are given,
 * one each, to participants in ascending member-ID order, so the result is
 * deterministic regardless of the order the IDs were submitted in.
 */
export function splitEvenly(totalCents: number, memberIds: number[]): Map<number, number> {
  if (!Number.isInteger(totalCents) || totalCents <= 0) {
    throw new ValidationError("Amount must be a positive number of cents.");
  }
  if (memberIds.length === 0) {
    throw new ValidationError("Select at least one participant.");
  }
  const ordered = [...memberIds].sort((a, b) => a - b);
  const base = Math.floor(totalCents / ordered.length);
  const remainder = totalCents % ordered.length;
  const shares = new Map<number, number>();
  ordered.forEach((id, index) => shares.set(id, base + (index < remainder ? 1 : 0)));
  return shares;
}
