# Architecture B Security Architecture

## Trust boundaries

1. User devices contain browser, Android, and iOS clients.
2. The public edge terminates TLS, filters traffic, and forwards authenticated API
   requests.
3. The modular backend enforces identity, group membership, reviewer permissions, and
   transaction rules.
4. PostgreSQL, private receipt storage, audit events, and the notification queue are
   protected service resources.

## Controls

- Use verified email accounts, strong password hashing, short-lived access tokens,
  refresh-token rotation, and expiring password-reset tokens.
- Apply default-deny authorization in the backend, not only in client screens.
- Require active group membership for group records and separately authorize receipt
  retrieval.
- Restrict approval to the organizer or explicitly designated reviewers.
- Store receipts privately and issue short-lived signed URLs only after authorization.
- Use parameterized database access, encrypted service connections, and encrypted
  backups.
- Record attributable audit events for account, membership, expense, approval,
  payment, notification, and report actions.
- Use idempotency keys and database transactions for expense and payment writes.

## Threat controls

| Threat | Architecture B control |
|---|---|
| Credential theft | Hashing, token expiry/rotation, reset-token expiry, TLS |
| Cross-group disclosure | Backend membership and role policy on every resource request |
| Unauthorized approval | Reviewer policy enforced in the approval module |
| Receipt leakage | Private object storage and signed URLs |
| Duplicate payment | Idempotency key plus transactional unique request record |
| Balance tampering | Derived balances, transactional writes, audit history |
| Service abuse | WAF, gateway rate limits, request validation, monitoring |

## Verification

Security tests must cover non-member denial, unauthorized approval, receipt access,
token expiry, reset-token reuse, duplicate writes, failed transaction rollback, and
audit attribution. This alternative architecture is documentation only and does not
implement these controls.
