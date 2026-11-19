export interface BalanceExpense {
  payerId: number;
  amountCents: number;
  participants: { memberId: number; shareCents: number }[];
}

/**
 * Net balance per member in cents: positive = should receive, negative = owes.
 * Each expense credits the payer the full amount and debits each participant
 * their share; because shares sum to the amount, balances always sum to zero.
 */
export function computeBalances(memberIds: number[], expenses: BalanceExpense[]): Map<number, number> {
  const balances = new Map<number, number>(memberIds.map((id) => [id, 0]));
  const add = (id: number, delta: number) => balances.set(id, (balances.get(id) ?? 0) + delta);
  for (const expense of expenses) {
    add(expense.payerId, expense.amountCents);
    for (const p of expense.participants) add(p.memberId, -p.shareCents);
  }
  return balances;
}
