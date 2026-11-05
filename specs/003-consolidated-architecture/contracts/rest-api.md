# Consolidated REST API Contract

The API is the single client boundary for the web, Android, and iOS applications.
The Java Swing MVP is not the production client for this consolidated architecture.

## Conventions

- Base path: `/api/v1`; incompatible changes require a new major version.
- JSON bodies and ISO 8601 UTC timestamps.
- Money is a string with exactly two decimal places, for example `"10.00"`; initial
  currency is `USD`.
- Protected calls use `Authorization: Bearer <access-token>`.
- Mutations use `Idempotency-Key`; the server stores a request hash and committed
  response for the key/account combination.
- Successful mutations return a resource `version` and `ETag`. Clients send
  `If-Match` when updating a versioned resource; stale versions receive `412`.
- Collection endpoints use cursor pagination: `limit` (default 50, maximum 200) and
  `cursor`, with stable sort by `(created_at, id)`.

## Authentication endpoints

| Method | Path | Purpose | Success |
|---|---|---|---|
| POST | `/auth/register` | Create an account | `201 Account` |
| POST | `/auth/verify-email` | Consume verification token | `204` |
| POST | `/auth/login` | Issue access/refresh tokens | `200 Session` |
| POST | `/auth/refresh` | Rotate refresh token | `200 Session` |
| POST | `/auth/logout` | Revoke current refresh token | `204` |
| POST | `/auth/password-reset/request` | Request reset | `202` |
| POST | `/auth/password-reset/complete` | Complete reset | `204` |

## Groups, membership, and reviewers

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/groups?limit=&cursor=` | List authorized groups | `200 Page<Group>` |
| POST | `/groups` | Create USD group | `201 Group` |
| GET | `/groups/{groupId}` | Read group | `200 Group` |
| POST | `/groups/{groupId}/members` | Add existing account | `201 Membership` |
| DELETE | `/groups/{groupId}/members/{accountId}` | Deactivate membership | `204` |
| PUT | `/groups/{groupId}/reviewers/{accountId}` | Designate reviewer | `204` |
| DELETE | `/groups/{groupId}/reviewers/{accountId}` | Remove designation | `204` |

## Expenses and approval

| Method | Path | Purpose | Success |
|---|---|---|---|
| POST | `/groups/{groupId}/expenses` | Submit expense | `201 Expense(PENDING)` |
| GET | `/groups/{groupId}/expenses?status=&from=&to=&limit=&cursor=` | Filter expenses | `200 Page<Expense>` |
| GET | `/expenses/{expenseId}` | Read authorized expense | `200 Expense` |
| POST | `/expenses/{expenseId}/decision` | Approve or reject | `200 Expense` |
| GET | `/expenses/{expenseId}/receipt` | Get signed receipt URL | `200 ReceiptUrl` |

### Expense request example

```json
{
  "description": "Household supplies",
  "amount": "10.00",
  "currency": "USD",
  "expenseDate": "2026-11-05",
  "payerId": "account-payer",
  "participants": [
    {"accountId": "account-payer", "order": 1},
    {"accountId": "account-member", "order": 2}
  ],
  "allocation": {"method": "EQUAL"},
  "receipt": {"uploadToken": "upload-token"}
}
```

```json
{
  "id": "expense-123",
  "status": "PENDING",
  "version": 1,
  "allocations": [
    {"accountId": "account-payer", "share": "5.00"},
    {"accountId": "account-member", "share": "5.00"}
  ]
}
```

## Balances, payments, reports, and notifications

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/groups/{groupId}/balances?limit=&cursor=` | Pairwise balances | `200 Page<Balance>` |
| POST | `/groups/{groupId}/payments` | Record payer-payee payment | `201 Payment` |
| GET | `/groups/{groupId}/payments?from=&to=&limit=&cursor=` | Payment history | `200 Page<Payment>` |
| GET | `/groups/{groupId}/reports?from=&to=&type=&limit=&cursor=` | Authorized report | `200 ReportPage` |
| GET | `/notifications?unread=&limit=&cursor=` | Current-user notifications | `200 Page<Notification>` |
| POST | `/notifications/{notificationId}/read` | Mark notification read | `204` |

### Payment request/response example

```json
{
  "payerId": "account-member",
  "payeeId": "account-payer",
  "amount": "2.00",
  "currency": "USD",
  "paymentDate": "2026-11-05"
}
```

```json
{
  "id": "payment-456",
  "amount": "2.00",
  "remainingDebt": "3.00",
  "version": 4,
  "status": "RECORDED"
}
```

## Validation and concurrency

- Dates must be valid calendar dates; report `from` must not be after `to`.
- Amounts must be positive USD values with scale 2. Percentages must total exactly
  `100.00`; allocation shares must sum to the expense amount.
- Participants must be active group members; the payer is singular and may be outside
  the participant list, as established by the approved business rule.
- A payment names one payer/payee pair and cannot exceed its outstanding debt.
- Payment acceptance runs in one transaction, locks the pair's debt inputs (or uses a
  serializable retry), rechecks the remaining debt, and inserts the payment only if
  the amount still fits. Concurrent overpayments therefore cannot both succeed.
- A stale `If-Match` returns `412 PRECONDITION_FAILED`. An idempotency-key reuse with
  a different request hash returns `409 IDEMPOTENCY_KEY_REUSE`.

## Payment correction and reversal boundary

Direct mutation or deletion of a committed payment is prohibited. A proposed
technical default is an append-only reversal referencing the original payment,
including reason and actor; whether a reversal requires reviewer approval and whether
refunds are separate payment types are open product decisions.

## Error format and mapping

```json
{
  "code": "PAYMENT_EXCEEDS_DEBT",
  "message": "The payment cannot exceed the outstanding payer-payee debt.",
  "field": "amount",
  "requestId": "req-789"
}
```

| HTTP | Codes |
|---|---|
| 400 | `INVALID_DATE`, `INVALID_ALLOCATION`, `INVALID_REQUEST` |
| 401 | `AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS`, `TOKEN_EXPIRED` |
| 403 | `NOT_A_GROUP_MEMBER`, `INSUFFICIENT_ROLE`, `RECEIPT_ACCESS_DENIED` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `DUPLICATE_MEMBERSHIP`, `INVALID_STATE_TRANSITION`, `IDEMPOTENCY_KEY_REUSE` |
| 412 | `PRECONDITION_FAILED` |
| 422 | `NON_POSITIVE_AMOUNT`, `PERCENTAGES_NOT_100`, `PAYMENT_EXCEEDS_DEBT` |
| 429 | `RATE_LIMITED` |
| 500 | `SAVE_FAILED`, with no successful transaction reported |

The API contract is a design artifact; implementation must add schema validation,
OpenAPI conformance tests, authorization tests, and backward-compatible versioning
checks.
