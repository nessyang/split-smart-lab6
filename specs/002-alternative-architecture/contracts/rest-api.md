# Architecture B REST API Contracts

Architecture B exposes a versioned HTTPS API for web, Android, and iOS clients. The
Java Swing MVP in Architecture A does not expose this API.

## Conventions

- Base path: `/api/v1`
- JSON bodies and ISO 8601 UTC timestamps
- Money as a two-decimal string, such as `"10.00"`; initial currency `USD`
- `Authorization: Bearer <access-token>` for protected operations
- Mutations accept `Idempotency-Key`
- Errors use `{ "code": "...", "message": "...", "field": "..." }`

## Endpoint contracts

| Method | Path | Purpose | Success |
|---|---|---|---|
| POST | `/auth/register` | Create account | `201 Account` |
| POST | `/auth/verify-email` | Verify email token | `204` |
| POST | `/auth/login` | Start session | `200 Session` |
| POST | `/auth/password-reset` | Request or complete reset | `202`/`204` |
| GET | `/groups` | List authorized groups | `200 Group[]` |
| POST | `/groups` | Create group | `201 Group` |
| POST | `/groups/{groupId}/members` | Add existing account | `201 Membership` |
| PUT | `/groups/{groupId}/reviewers/{accountId}` | Designate reviewer | `204` |
| POST | `/groups/{groupId}/expenses` | Submit expense | `201 Expense(PENDING)` |
| GET | `/groups/{groupId}/expenses` | List authorized expenses | `200 Expense[]` |
| POST | `/expenses/{expenseId}/decision` | Approve or reject | `200 Expense` |
| GET | `/expenses/{expenseId}/receipt` | Get authorized receipt | `200` object metadata |
| GET | `/groups/{groupId}/balances` | Get pairwise balances | `200 Balance[]` |
| POST | `/groups/{groupId}/payments` | Record payer-payee payment | `201 Payment` |
| GET | `/groups/{groupId}/reports` | Query date-bounded report | `200 Report` |
| GET | `/notifications` | List current-user notifications | `200 Notification[]` |

## Request invariants

An expense request contains amount, date, description, payer, participants in saved
order, allocation method, allocation values, and optional receipt. Percentages must
total exactly `100.00`; all shares must reconcile exactly to the amount. Only the
organizer or designated reviewer may decide. Approval changes balances; rejection does
not. A payment applies only to its specified payer-payee debt and cannot exceed the
outstanding amount.

## Error mapping

| HTTP | Codes |
|---|---|
| 400 | `INVALID_DATE`, `INVALID_ALLOCATION`, `INVALID_REQUEST` |
| 401 | `AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS` |
| 403 | `NOT_A_GROUP_MEMBER`, `INSUFFICIENT_ROLE` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `DUPLICATE_MEMBERSHIP`, `INVALID_STATE_TRANSITION`, `IDEMPOTENCY_REPLAY` |
| 422 | `NON_POSITIVE_AMOUNT`, `PERCENTAGES_NOT_100`, `PAYMENT_EXCEEDS_DEBT` |
| 500 | `SAVE_FAILED`, with no successful transaction reported |
