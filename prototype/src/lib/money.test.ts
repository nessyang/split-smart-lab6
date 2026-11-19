import { describe, expect, it } from "vitest";
import { formatCents, parseAmountToCents, splitEvenly, ValidationError } from "./money";
import { computeBalances } from "./balances";

describe("parseAmountToCents", () => {
  it("parses valid amounts to integer cents", () => {
    expect(parseAmountToCents("60")).toBe(6000);
    expect(parseAmountToCents("10.5")).toBe(1050);
    expect(parseAmountToCents("0.01")).toBe(1);
    expect(parseAmountToCents(19.99)).toBe(1999);
  });
  it.each(["0", "0.00", "-5", "abc", "", "1.234", "1e3", "$5", "1000000.01"])("rejects %j", (v) => {
    expect(() => parseAmountToCents(v)).toThrow(ValidationError);
  });
  it("rejects non-string input", () => {
    expect(() => parseAmountToCents(null)).toThrow(ValidationError);
  });
});

describe("splitEvenly", () => {
  it("splits $60 three ways", () => {
    expect([...splitEvenly(6000, [1, 2, 3]).values()]).toEqual([2000, 2000, 2000]);
  });
  it("allocates $10 three ways to the cent, remainder to lowest ID", () => {
    const shares = splitEvenly(1000, [3, 1, 2]);
    expect(shares.get(1)).toBe(334);
    expect(shares.get(2)).toBe(333);
    expect(shares.get(3)).toBe(333);
    expect([...shares.values()].reduce((a, b) => a + b, 0)).toBe(1000);
  });
});

describe("computeBalances", () => {
  it("matches the Alice/Bob/Charlie example and sums to zero", () => {
    const shares = splitEvenly(6000, [1, 2, 3]);
    const balances = computeBalances([1, 2, 3], [
      { payerId: 1, amountCents: 6000, participants: [...shares].map(([memberId, shareCents]) => ({ memberId, shareCents })) },
    ]);
    expect(Object.fromEntries(balances)).toEqual({ 1: 4000, 2: -2000, 3: -2000 });
    expect([...balances.values()].reduce((a, b) => a + b, 0)).toBe(0);
  });
});

describe("formatCents", () => {
  it("formats signed values", () => {
    expect(formatCents(4000, { signed: true })).toBe("+$40.00");
    expect(formatCents(-2000)).toBe("-$20.00");
    expect(formatCents(-333)).toBe("-$3.33");
  });
});
