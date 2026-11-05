# Security Architecture

## Trust boundaries

1. The user/device boundary contains Swing or future web/mobile clients.
2. The application boundary contains authentication, authorization, domain services,
   and transaction handling.
3. The persistence boundary contains credentials, expense/group data, receipts, and
   audit history.

The MVP runs these components locally, but the same boundaries apply when the full
product introduces a shared service.

## Identity and authentication

- Accounts use email and password with email verification and password reset.
- Passwords are stored only as strong one-way password hashes.
- Every operation receives the current account identity from the authenticated session.
- Session creation, expiry, and reset-token handling must not expose password material.

## Authorization

- Group membership is required for group expenses, receipts, balances, notifications,
  and reports.
- Organizers manage membership and designate reviewers.
- Only organizers and designated reviewers may approve or reject expenses.
- A non-member receives an authorization failure without group-record disclosure.
- Receipt access is checked independently from expense-list access.

## Data protection and integrity

- Monetary writes use transactional persistence and `BigDecimal` scale 2.
- A failed validation or save produces no successful record, balance change, or
  misleading completion state.
- Receipt paths or object identifiers are authorization-protected; raw storage paths
  are not exposed to unauthorized users.
- Audit entries record actor, action, entity, and timestamp for account, membership,
  expense, approval, payment, and notification actions.

## Threat-oriented controls

| Threat | Control |
|---|---|
| Credential disclosure | Password hashing, reset-token expiry, no plaintext storage |
| Cross-group data access | Membership and role checks in application services |
| Unauthorized approval | Organizer/designated-reviewer policy enforced outside the UI |
| Receipt disclosure | Separate receipt authorization check |
| Balance tampering | Derived balances, transactional writes, audit history |
| Failed-write confusion | Commit confirmation before success UI; no partial mutation |
| Audit repudiation | Attributable immutable decision/history records |

## Security verification

Tests must cover non-member denial, unauthorized approval, receipt access denial,
password non-disclosure, failed-write rollback, and audit attribution. Human review is
required before accepting the security design or implementation.
