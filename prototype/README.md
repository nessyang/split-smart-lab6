# SplitSmart Prototype (CIS 285 Lab 9)

A web app for managing shared expenses in a group: create groups, add members,
record expenses split equally among selected participants, view the expense
history, and see each member's balance.

## Running

```bash
cd prototype
# One-time setup (only needed if .env or the database tables are missing)
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma db push        # creates tables in prisma/dev.db and generates the client

npm run dev               # http://localhost:3000
npm test                  # unit tests (Vitest)
```

## How it works

- **Money** is stored as integer cents (`Expense.amountCents`,
  `ExpenseParticipant.shareCents`). User input is parsed from a string without
  floating-point math; amounts must be > $0.00, at most 2 decimal places, and ≤ $1,000,000.
- **Equal split**: `floor(amount / n)` each; the leftover cents go one at a time to
  participants in ascending member-ID order (deterministic). E.g. $10.00 / 3 →
  $3.34, $3.33, $3.33. Shares are saved with the expense.
- **Balance** = total paid − total owed. Because shares always sum to the expense
  amount, the balances in a group always sum to $0.00.
- **Validation**: the payer and every participant must be members of the selected
  group; invalid input returns HTTP 400 with a readable message shown in the UI.

## Code layout

| Path | Purpose |
|---|---|
| `prisma/schema.prisma` | `Group`, `Member`, `Expense`, `ExpenseParticipant` models (SQLite) |
| `src/lib/money.ts` | Amount parsing, formatting, equal-split with remainder |
| `src/lib/balances.ts` | Balance calculation |
| `src/lib/splitsmart.ts` | Data access + business-rule validation |
| `src/app/api/groups/**` | REST route handlers |
| `src/components/SplitSmartApp.tsx` | The single-page UI |

## API

| Method | Path | Body |
|---|---|---|
| GET/POST | `/api/groups` | `{ "name": "Trip" }` |
| GET/POST | `/api/groups/:groupId/members` | `{ "name": "Alice" }` |
| GET/POST | `/api/groups/:groupId/expenses` | `{ "description", "amount": "60.00", "payerId", "participantIds": [] }` |
| GET | `/api/groups/:groupId/balances` | — |
