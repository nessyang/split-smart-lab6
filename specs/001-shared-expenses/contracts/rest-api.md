# REST API Contracts (Full-Product Target)

The approved Java Swing MVP does not expose a REST API. This document defines the
future service contract needed for web, Android, and iOS clients; it does not expand
the MVP scope or require application-code implementation in this planning step.

## Conventions

- Base path: `/api/v1`
- JSON request and response bodies; timestamps use ISO 8601 UTC.
- Money is represented as a decimal string with exactly two places, for example
  `"10.00"`; currency is currently `USD`.
- Authenticated requests use `Authorization: Bearer <access-token>`.
- Errors use `{ "code": "...", "message": "...", "field": "..." }` where `field`
  is optional.
- Mutating requests accept an `Idempotency-Key` to prevent duplicate submissions.

## Authentication

| Method | Path | Purpose | Success |
|---|---|---|---|
| POST | `/auth/register` | Create account | `201 Account` |
| POST | `/auth/verify-email` | Verify email token | `204` |
| POST | `/auth/login` | Start session | `200 Session` |
| POST | `/auth/password-reset` | Request/reset password | `202` or `204` |

## Groups and membership

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/groups` | List authorized groups | `200 Group[]` |
| POST | `/groups` | Create group | `201 Group` |
| POST | `/groups/{groupId}/members` | Add existing account | `201 Membership` |
| PUT | `/groups/{groupId}/reviewers/{accountId}` | Designate reviewer | `204` |

## Expenses and review

| Method | Path | Purpose | Success |
|---|---|---|---|
| POST | `/groups/{groupId}/expenses` | Submit expense and allocations | `201 Expense` with `PENDING` status |
| GET | `/groups/{groupId}/expenses` | List authorized expenses | `200 Expense[]` |
| POST | `/expenses/{expenseId}/decision` | Approve or reject | `200 Expense` |
| GET | `/expenses/{expenseId}/receipt` | Get authorized receipt | `200` image/metadata |

An expense request contains `amount`, `expenseDate`, `description`, `payerId`,
`participantIds` in saved order, allocation method, allocation values, and an optional
receipt. Percentages must total exactly `100.00`; amounts must reconcile exactly.
Only the organizer or designated reviewer may decide. Approval changes balances;
rejection does not.

## Balances, payments, reports, and notifications

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/groups/{groupId}/balances` | Get pairwise balances | `200 Balance[]` |
| POST | `/groups/{groupId}/payments` | Record specified payer-payee payment | `201 Payment` |
| GET | `/groups/{groupId}/reports` | Query authorized date-bounded report | `200 Report` |
| GET | `/notifications` | List current-user notifications | `200 Notification[]` |

Each payment applies only to its specified payer-payee debt. An overpayment returns
`422 PAYMENT_EXCEEDS_OUTSTANDING_DEBT` and does not mutate the balance. A report with
no matches returns `200` with an empty result.

## Common error mapping

| HTTP | Codes |
|---|---|
| 400 | `INVALID_DATE`, `INVALID_ALLOCATION`, `INVALID_REQUEST` |
| 401 | `AUTHENTICATION_REQUIRED`, `INVALID_CREDENTIALS` |
| 403 | `NOT_A_GROUP_MEMBER`, `INSUFFICIENT_ROLE` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `DUPLICATE_MEMBERSHIP`, `INVALID_STATE_TRANSITION` |
| 422 | `NON_POSITIVE_AMOUNT`, `PERCENTAGES_NOT_100`, `PAYMENT_EXCEEDS_OUTSTANDING_DEBT` |
| 500 | `SAVE_FAILED`, with no successful transaction reported |
