# Consolidated Security Architecture

## Identity and token lifecycle

- Registration creates an unverified account; verification tokens are single-use and
  expire. Password reset tokens are single-use, short-lived, and never reveal whether
  an email exists.
- Passwords use Argon2id (proposed technical default) with a current work factor and
  are never logged or stored plaintext.
- Access tokens are proposed to expire after 15 minutes. Refresh tokens are opaque,
  hashed at rest, rotated on use, bound to a session/device, and revoked on logout,
  suspected compromise, password reset, or token reuse detection.
- The exact token provider and expiry values are technical defaults pending security
  review; the requirement is centralized authenticated access.

## Authorization and data protection

- Backend services apply default-deny authorization on every request; client-side
  route guards are not security controls.
- Active group membership gates expenses, balances, reports, notifications, and
  receipts. Organizer and explicit reviewer roles gate membership/reviewer changes
  and expense decisions.
- Receipts are private objects. The API returns a short-lived signed URL only after
  checking the requester against the expense group. Object keys are never public.
- TLS protects clients, service-to-service traffic, database connections, and object
  storage access. Secrets come from a managed secret store, not source control.

## Integrity and audit

- Expense approval, payment acceptance, balance derivation, audit entry, and outbox
  insertion occur in one PostgreSQL transaction where applicable.
- Audit entries are append-only to the application, include actor, action, entity,
  request correlation ID, timestamp, and outcome, and are exported to protected
  centralized storage for tamper evidence.
- Proposed audit retention is seven years; legal, privacy, and deletion policy remain
  open decisions. Legal holds must prevent deletion while active.

## Threat controls

| Threat | Control |
|---|---|
| Credential theft | Argon2id, TLS, token expiry/rotation/revocation, reset-token expiry |
| Cross-group disclosure | Backend membership and role policy per resource |
| Unauthorized approval | Explicit reviewer designation enforced in approval module |
| Receipt leakage | Private storage and short-lived signed URLs |
| Duplicate or replayed writes | Idempotency keys, request hashes, transaction checks |
| Balance tampering | Derived balances, row locks/serializable check, audit history |
| Service abuse | WAF, gateway rate limits, validation, anomaly monitoring |

## Security verification

Tests cover non-member denial, unauthorized approval, receipt access, access-token
expiry, refresh rotation and revocation, reset-token reuse, password non-disclosure,
duplicate writes, failed transaction rollback, audit attribution, and security-event
alerting. Human review is required before acceptance.
