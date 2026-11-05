# Consolidated Test Strategy

Testing must verify both the original customer behavior and the Architecture B
consistency/security design. Tests are traceable to `CR-*` requirements in
[requirements.md](../requirements.md) and the matrix in
[traceability-matrix.md](../traceability-matrix.md).

## Unit tests

JUnit 5 tests run through Maven for backend domain/application modules:

- Account verification, password-reset token expiry, access/refresh lifecycle.
- Membership uniqueness and organizer/reviewer authorization.
- Positive USD amount/date validation and exact `BigDecimal` scale.
- Equal and percentage allocation, exact 100% validation, and participant-order
  remainder cents.
- Expense state transitions and approval authorization.
- Pairwise balance derivation from approved expenses and payments.
- Partial payment acceptance and payment correction/reversal rules once approved.
- Overpayment checks, idempotency-key behavior, and stale-version rejection.
- Report date filtering, inverted-range rejection, and empty results.
- Notification event keys, retry state transitions, and audit event construction.

## Integration tests

Run Spring Boot integration tests against disposable PostgreSQL containers or an
equivalent isolated PostgreSQL environment. Verify foreign keys, unique constraints,
indexes/query plans, migrations, transaction rollback, receipt metadata, outbox
atomicity, and refresh-token revocation.

## API tests

- Contract-test every `/api/v1` endpoint against its request/response schema.
- Verify authentication requirements, role checks, pagination cursors, filters, ETags,
  `If-Match`, idempotency replay, error codes, and API version behavior.
- Test that a failed expense/payment request has no balance, audit-success, or outbox
  side effect.
- Test request examples in [rest-api.md](../contracts/rest-api.md) and generate/check
  OpenAPI documentation during CI.

## Security tests

- Passwords and tokens never appear in logs or API responses.
- Access-token expiry, refresh rotation, reuse detection, logout revocation, and
  password-reset token single-use behavior.
- Cross-group and non-member access denial for records, reports, and receipts.
- Reviewer designation and unauthorized approval denial.
- Signed receipt URL expiry, object-key non-disclosure, and content authorization.
- SQL injection/request validation, rate limiting, CSRF posture for browser sessions,
  secure headers, dependency scanning, and secret scanning.
- Audit attribution and tamper-evidence export behavior.

## Cross-platform tests

Use a shared API scenario suite against web, Android, and iOS clients:

1. Register/sign in and open an authorized group.
2. Submit the same expense flow and verify pending state/notification.
3. Approve/reject using the authorized reviewer and verify consistent balance state.
4. Record a partial payment and verify the same remaining debt on all clients.
5. Exercise offline/read-cache and stale-write behavior without treating cached data
   as committed.
6. Verify accessibility semantics, keyboard navigation on web, screen readers, text
   scaling, touch target behavior, and non-color status cues.

## Financial calculation tests

Use table-driven cases for amounts from one cent through large valid USD values,
participant counts, exact/fractional percentage splits, and remainder distributions.
Assert `sum(allocation shares) == expense amount` at scale 2, and assert balances equal
approved allocations minus named payments exactly. Include concurrent payment tests
where two requests attempt to consume the same remaining debt.

## Performance and reliability tests

- Seed 5,000 expenses in a group and measure date-bounded reports and balance summaries;
  at least 95% must complete within 3 seconds under agreed conditions.
- Submit notification-generating expenses at representative load and measure 95%
  availability within 60 seconds.
- Exercise worker retries, duplicate queue delivery, dead-letter review, database
  failover behavior, and restore procedures.
- Run load tests through the API gateway and observe p95 latency, error rate, queue
  age, database saturation, and lock contention.

## CI quality gates

Maven compile/test, migration validation, JUnit coverage for financial/authorization
branches, API contract checks, dependency/security scans, client unit/UI tests,
PlantUML validation when available, and human review of AI-generated output are
required before acceptance.
