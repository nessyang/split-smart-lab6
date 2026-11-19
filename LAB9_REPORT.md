I built the SplitSmart prototype in `prototype/`, and the dev server is running at http://localhost:3000. Every required rule passed when tested through the API and unit tests. I could not click through the UI in a real browser, because this Codespace has none. Nothing has been committed or pushed.

## 1. Features
- **FR1, groups:** create groups and pick one from a sidebar list showing member and expense counts.
- **FR2, members:** add members to a group and see the list; a name can't be added twice to the same group.
- **FR3, expenses:** record a description, amount, payer and participants (with a "Select all" button). The cost is split equally.
- **FR4, history:** a table for the selected group showing date, description, amount, payer and each person's share.
- **FR5, balances:** each member shows as "+$40.00 gets back" or "-$20.00 owes", plus a "sum of balances" line.
- **Business rules:**
  - All amounts are stored as whole cents.
  - Leftover cents go one at a time to participants with the lowest member ID, so $10 split three ways is $3.34 / $3.33 / $3.33.
  - The payer and all participants must belong to the selected group.
  - Invalid input is rejected with a readable message shown in the form.
  - Data is saved in SQLite, and the selected group stays in the URL (`?group=ID`) so a refresh keeps it.

## 2. Files
- **Modified:**
  - `prisma/schema.prisma`: added Group, Member, Expense and ExpenseParticipant tables.
  - `src/app/page.tsx`, `src/app/layout.tsx`: replaced the starter page and set the page title.
  - `package.json`: added an `npm test` script.
  - `README.md`: rewritten.
  - `prisma/dev.db`: this file is tracked in git, and it now holds the new tables and my test data.
- **Created:**
  - `src/lib/money.ts`: reading amounts, formatting, and the equal split.
  - `src/lib/balances.ts`: the balance calculation.
  - `src/lib/splitsmart.ts`: database access and the business-rule checks.
  - `src/lib/http.ts`, `src/lib/prisma.ts`: small helpers.
  - `src/app/api/groups/**`: four API routes.
  - `src/components/SplitSmartApp.tsx`: the page itself.
  - `src/lib/money.test.ts`: unit tests.
- **Local only:** `.env` (git ignores it), with `DATABASE_URL="file:./dev.db"` copied from the Dev Container template.

No new dependencies were added, and the Dev Container and lab docs are untouched.

## 3. Running it
```bash
cd prototype
npx prisma db push   # only if the tables are missing
npm run dev          # http://localhost:3000
npm test
```

## 4. Test results
All of these were actually run:
- **Code checks:** the 15 unit tests pass, and the type check (`tsc --noEmit`), lint and `next build` all came back clean.
- **API tests with curl:**

| Check | Result |
|---|---|
| Create a group, add Alice, Bob and Charlie | Pass |
| $60 paid by Alice, split three ways | Pass: +40.00 / −20.00 / −20.00 |
| Then $30 paid by Bob, split between Bob and Charlie | Pass: +40.00 / −5.00 / −35.00 |
| $10 split three ways | Pass: shares 3.34 / 3.33 / 3.33; balances +6.66 / −3.33 / −3.33 |
| Balances sum to zero | Pass: `totalCents` was 0 in every case |
| Bad amounts rejected (`0`, `-5`, `abc`, `1.234`, empty) | Pass: HTTP 400 with a clear message |
| Bad member IDs rejected (made-up payer or participant, one from another group, a non-number) | Pass: HTTP 400 |
| Empty participant list, empty description or group name, duplicate member | Pass: HTTP 400 |
| Group that doesn't exist | Pass: HTTP 404 |
| Data still there after a full server restart | Pass: groups, expenses and balances were unchanged |

## 5. Known issues
- **UI not tested in a browser:** I checked that the page loads (HTTP 200), but nobody has clicked through the forms. Please try it at localhost:3000, including a page refresh.
- **Test data:** two test groups ("Lab9 Test Trip" and "Ten Dollar Test") are in `dev.db`. You can delete the file and run `npx prisma db push` to start empty.
- **Not supported:** editing or deleting groups, members or expenses, settle-up payments and uneven splits. These weren't required.
- **Build and dev server clash:** running `next build` while the dev server is up breaks it with HTTP 500 errors. If that happens, stop the server, delete `.next`, and restart it.
