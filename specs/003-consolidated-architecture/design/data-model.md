# Consolidated Data Model

PostgreSQL is the authoritative store. IDs are UUIDs. Timestamps are UTC. Money is
`NUMERIC(19,2)` and is converted to Java `BigDecimal` scale 2 at the domain boundary.

## Entities and relationships

### Account and authentication

- `account(id, email, password_hash, email_verified_at, created_at, updated_at)`.
- Unique index on normalized email; password hashes only.
- `refresh_token(id, account_id, token_hash, expires_at, revoked_at, replaced_by_id,
  created_at)` supports rotation and revocation. Unique token hash.
- `password_reset_token(id, account_id, token_hash, expires_at, consumed_at)` is
  single-use and indexed by token hash.

### Group and membership

- `split_group(id, organizer_id, name, currency_code, active, created_at)`.
- `membership(group_id, account_id, role, active, joined_at, version)` with composite
  primary key `(group_id, account_id)` and foreign keys to group/account.
- Role values are `ORGANIZER`, `MEMBER`, and `REVIEWER`. Reviewer designation is
  represented by membership permission, not a client-only flag.
- Foreign keys and unique constraints prevent duplicate memberships and orphaned
  reviewer designations. Indexes support `(account_id, active)` and `(group_id, role,
  active)`.

### Expense and allocation

- `expense(id, group_id, submitted_by, payer_id, description, amount, currency_code,
  expense_date, status, version, created_at, updated_at)`.
- `allocation(expense_id, participant_id, participant_order, method, percentage,
  share_amount)` with primary key `(expense_id, participant_id)` and unique
  `(expense_id, participant_order)`.
- `receipt(id, expense_id unique, object_key unique, content_hash, media_type,
  size_bytes, created_at)` stores metadata only; bytes stay in private object storage.
- Foreign keys require group, submitter, payer, and participants to be valid accounts
  under the approved group policy. Payer is exactly one account.
- Check constraints enforce positive amount, USD in the initial scope, non-negative
  share/percentage, and valid status values. Application validation enforces exact
  percentage total and allocation reconciliation.
- Indexes: `(group_id, expense_date, id)`, `(group_id, status, expense_date, id)`,
  `(submitted_by, created_at)`, and `(payer_id, status)`.

### Approval and state

- `approval(id, expense_id, reviewer_id, decision, decision_at, comment)`.
- Expense states: `PENDING → APPROVED` or `PENDING → REJECTED`. Terminal states are
  immutable in the initial scope; multi-stage/edit/resubmission behavior is open.
- A unique constraint can enforce one decision per reviewer/expense in single-stage
  mode. Authorization checks reviewer designation inside the transaction.

### Payments, corrections, and balances

- `payment(id, group_id, payer_id, payee_id, amount, currency_code, payment_date,
  status, version, idempotency_key, created_at)`.
- Payer and payee must differ and belong to the relevant group context. Amount is
  positive. Unique `(payer_id, idempotency_key)` prevents duplicate submission.
- Balances are derived from approved allocation rows and recorded payments. A payment
  applies only to its directed payer-payee debt.
- The initial requirement supports separate refunds/corrections but does not specify
  their workflow. Proposed default: append-only `payment_reversal(original_payment_id,
  actor_id, reason, amount, status, created_at)`; approval requirement and user roles
  remain open decisions. No committed payment is updated or deleted in place.
- Concurrent payment checks lock the ordered payer/payee pair or use serializable
  isolation, recalculate outstanding debt, and insert only if the amount fits.

### Notifications and outbox

- `notification(id, recipient_id, group_id, expense_id, event_key unique, kind, status,
  attempt_count, next_attempt_at, delivered_at, last_error, created_at)`.
- `outbox_event(id, event_key unique, aggregate_type, aggregate_id, event_type,
  payload, created_at, published_at, attempts, next_attempt_at)`.
- Expense submission inserts recipient notifications and the outbox event in the same
  transaction as the pending expense. The worker claims events, publishes/reifies
  notifications idempotently, retries with exponential backoff, and moves exhausted
  events to a reviewed dead-letter state. Approval/rejection emits no submission
  notification.
- Unique event keys prevent duplicate notification creation and duplicate processing.

### Audit and idempotency

- `audit_entry(id, actor_id, action, entity_type, entity_id, request_id, before_hash,
  after_hash, occurred_at, metadata)` is append-only to the application.
- `idempotency_key(account_id, key, request_hash, response_status, response_body,
  resource_id, expires_at)` stores committed mutation responses. A reused key with a
  different hash is rejected.
- Proposed audit retention is seven years; legal hold and privacy deletion policy are
  unresolved.

## State transitions

```text
Expense: PENDING -> APPROVED -> balance-visible
                  \\-> REJECTED -> balance-excluded

Payment: REQUESTED -> RECORDED -> balance-reduced
                   \\-> REJECTED (validation/concurrency/overpayment)

Notification: PENDING -> DELIVERED
                      \\-> RETRY_WAIT -> DELIVERED
                      \\-> FAILED_REVIEW

Refresh token: ACTIVE -> ROTATED -> REVOKED/EXPIRED
```

## Transaction boundaries

Expense submission, allocation persistence, audit entry, and notification outbox
creation are atomic. Approval, audit, and balance-visible state are atomic. Payment
validation, debt recheck, payment insert, audit, and outbox creation are atomic. A
failed transaction produces no successful API response or balance change.
