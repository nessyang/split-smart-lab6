# Data Model: SplitSmart Shared Expense Management

The MVP persists the following entities in USD. Identifiers are stable UUIDs unless
otherwise noted. All timestamps are stored with the local audit timestamp and all
money values use `BigDecimal` scale 2.

## Account

- `id`, `email`, `passwordHash`, `emailVerified`, `createdAt`, `updatedAt`
- Email is unique case-insensitively.
- A password is never stored in plaintext.
- An account can own groups, belong to groups, submit expenses, review expenses when
  designated, and record payments.

## Group

- `id`, `name`, `currencyCode`, `createdBy`, `createdAt`, `active`
- `currencyCode` is `USD` in the MVP and is immutable for a group.
- The creator is the organizer and may manage membership and reviewer designation.

## Membership

- `id`, `groupId`, `accountId`, `role`, `active`, `joinedAt`
- The `(groupId, accountId)` pair is unique.
- Roles include `ORGANIZER`, `MEMBER`, and `REVIEWER`; reviewer is an explicit group
  permission and does not create access to unrelated groups.
- Only an organizer may add an existing account or designate/remove a reviewer.

## Expense

- `id`, `groupId`, `submittedBy`, `payerId`, `description`, `amount`, `expenseDate`,
  `status`, `receiptPath`, `participantOrder`, `createdAt`, `updatedAt`
- `amount` is positive USD with scale 2 and no product-specific maximum beyond valid
  currency limits.
- `expenseDate` is any valid calendar date, including future dates.
- `payerId` is exactly one account and may be outside the allocation participants.
- Participants must be active members of the group; the saved order is significant for
  leftover-cent allocation.
- Status transitions are `PENDING → APPROVED` or `PENDING → REJECTED`. Approved and
  rejected expenses are terminal for the MVP.

## Allocation

- `id`, `expenseId`, `participantId`, `method`, `percentage`, `shareAmount`, `order`
- `method` is `EQUAL` or `PERCENTAGE` for the expense as a whole.
- Equal shares divide the amount across participants. Percentage shares must total
  exactly 100%; negative percentages and incomplete allocations are rejected.
- Rounded shares are adjusted one minor unit at a time in ascending `order` until the
  shares sum exactly to the expense amount.
- Allocation rows are unique per `(expenseId, participantId)` and sum exactly to the
  expense amount.

## Approval

- `id`, `expenseId`, `reviewerId`, `decision`, `decisionAt`, `comment`
- Only the organizer or explicitly designated reviewer for the group may create a
  decision. The decision is attributable and immutable in the audit history.
- The MVP requires one approval decision; multi-stage approval is a full-product
  extension and is not implemented here.

## Payment

- `id`, `groupId`, `payerId`, `payeeId`, `amount`, `paymentDate`, `createdAt`
- The amount is positive USD with scale 2.
- Payer and payee must be relevant group accounts and must differ.
- The amount cannot exceed the current outstanding payer-to-payee debt.
- A payment applies only to its specified payer-payee pair and is never auto-allocated
  to another debt.

## Notification

- `id`, `groupId`, `expenseId`, `recipientId`, `kind`, `status`, `createdAt`,
  `deliveredAt`, `lastError`, `attemptCount`
- Submission creates one `EXPENSE_SUBMITTED` notification for each other active group
  member. Approval and rejection create none.
- Status is `PENDING`, `DELIVERED`, or `FAILED`; a failed delivery is not reported as
  delivered.

## AuditEntry

- `id`, `actorId`, `entityType`, `entityId`, `action`, `occurredAt`, `details`
- Account, membership, expense, approval, payment, and notification actions append an
  attributable history entry.

## Derived Balance

Balances are not authoritative stored transactions. For a payer `P` and participant
`C`, approved allocations create debt from `C` to `P` for the allocation share. Payments
reduce only the directed debt from the payment payer to payee. The balance service
returns the net remaining amount for each ordered account pair and reconciles to the
underlying approved expenses and payments.

## Report

Reports are query results rather than primary entities. A report request contains an
authorized viewer, optional group, start date, end date, and report type. Results
include only authorized records whose relevant dates fall within the inclusive range;
an empty match returns an empty result with no fabricated totals.

## Cross-Entity Rules

1. Only active members can view group records, receipts, balances, and notifications.
2. Only approved expenses contribute to balances and approved-expense totals.
3. Save operations are transactional: a validation or persistence failure leaves no
   successful record or balance change.
4. Every monetary invariant is checked before persistence and rechecked in tests.
