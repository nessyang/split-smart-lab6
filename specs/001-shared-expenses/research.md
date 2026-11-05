# Research: SplitSmart Shared Expense Management

## Decision: Use Java 21, Maven, and Swing for the approved MVP

**Rationale:** The constitution requires Java 21, Maven, and Swing for the candidate
MVP. Keeping the implementation in one Maven project makes JUnit 5 execution and
desktop packaging straightforward while preserving a clear path to later service and
client work.

**Alternatives considered:** A web stack or cross-platform mobile toolkit would align
with the full customer target but would violate the approved MVP boundary and the
repository constitution for this implementation phase.

## Decision: Use a file-backed H2 database behind repository ports

**Rationale:** The desktop MVP needs records to survive application restarts, while a
local embedded database avoids requiring an external server. Repository interfaces
keep domain and application code independent of H2 and allow a future shared backend
adapter without changing business rules.

**Alternatives considered:** In-memory storage would lose accounts and expenses on
restart. Direct Swing-owned file serialization would couple persistence to the UI and
make transactional save/error behavior harder to verify.

## Decision: Represent USD with `BigDecimal` at scale 2

**Rationale:** The constitution prohibits binary floating point for monetary logic.
Amounts are validated as positive USD values with exactly two minor-unit places for
storage and calculations. Equal and percentage allocations round deterministically,
then distribute leftover cents one at a time in the participant order saved on the
expense.

**Alternatives considered:** `double` is unsuitable for exact reconciliation. Integer
cents would be exact but would not follow the constitution’s explicit `BigDecimal`
requirement; it may still be used only as a derived minor-unit comparison value in
tests.

## Decision: Model approval as an explicit expense state machine

**Rationale:** An expense starts as pending, is approved or rejected by the group
organizer or designated reviewer, and only approved expenses affect balances. An
explicit transition service prevents unauthorized decisions and makes rejection,
history, and balance exclusion testable.

**Alternatives considered:** A boolean approved flag cannot represent pending versus
rejected safely and makes invalid transitions ambiguous.

## Decision: Store in-app notifications transactionally with submission

**Rationale:** The MVP has no external notification channel. Submitting an expense
creates recipient notification records for other group members, with delivery status
and retry/error representation. Approval and rejection create no new notification.

**Alternatives considered:** Email or push delivery is outside the clarified scope.
Treating notification creation as an untracked UI side effect would make delivery
failure and audit behavior unverifiable.

## Decision: Calculate pairwise balances from approved expenses and specified payments

**Rationale:** Each payment names one payer and one payee and applies only to that
pairwise debt. The balance service derives owed/due totals from approved allocations,
the expense payer, and recorded payments, preventing a payment from silently affecting
other debts.

**Alternatives considered:** Automatic netting or oldest-debt allocation would conflict
with the clarified payment contract and make the resulting history less explicit.

## Decision: Validate report performance at the documented MVP scale

**Rationale:** The spec sets a measurable target for groups with up to 5,000 expense
records: 95% of balance summaries and date-bounded reports complete within 3 seconds.
The quickstart includes a seeded performance scenario so the target is testable.

**Alternatives considered:** An unbounded scale target would be impossible to verify
for a local desktop MVP; a purely qualitative “fast” requirement is not testable.
