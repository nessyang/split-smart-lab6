# Consolidated Deployment Guide

This is a deployment design for Architecture B, not an execution procedure and not
application code.

## Environments

- **Local/CI**: Java 21, Maven, Spring Boot, disposable PostgreSQL, local object
  storage emulator, and test queue.
- **Staging**: production-like managed PostgreSQL, private object storage, queue,
  identity configuration, observability, and synthetic test data.
- **Production**: multi-zone stateless backend instances behind WAF/API gateway,
  managed PostgreSQL with high availability, durable queue, private object storage,
  centralized monitoring, and managed secrets.

## Environment configuration

Configuration is externalized and injected through a secret/configuration service:

- Database URL, credentials, TLS mode, pool limits, migration policy.
- Token issuer/audience, signing-key reference, access/refresh lifetimes, reset-token
  policy, and email provider credentials.
- Object-storage bucket, region, encryption key, signed-URL lifetime, upload limits.
- Queue endpoint, consumer concurrency, retry/backoff, dead-letter destination.
- Logging/metrics/tracing endpoints and sampling/redaction rules.
- Feature flags for multi-stage approval, payment reversal, and future currencies.

Secrets must not be committed, baked into client bundles, or printed in logs.

## Cloud deployment architecture

Clients reach a CDN/WAF and API gateway over HTTPS. The gateway routes to multiple
stateless Spring Boot instances. PostgreSQL, queue, object storage, and monitoring
are managed durable services. Notification workers scale independently from API
instances but use the same release artifact and database migrations.

## Database migrations

1. Version migrations in source control and run them forward-only through a migration
   tool selected during implementation.
2. Validate migrations against an empty schema and a production-like populated copy.
3. Use expand/contract changes for zero-downtime releases: add compatible fields,
   deploy code, backfill, switch reads/writes, then remove obsolete fields later.
4. Take a verified backup before destructive or high-risk migrations. Never silently
   alter money, approval, payment, or audit history.

## Backups and recovery

- Enable encrypted PostgreSQL point-in-time recovery and scheduled full backups.
- Back up object metadata and receipt objects with versioning/retention; ensure
  database references and objects can be reconciled.
- Proposed operational default: RPO 15 minutes and RTO 1 hour. Product/operations
  owners must approve these targets.
- Perform quarterly restore drills, record recovery duration, verify balances/audit
  entries, and test queue/outbox replay after restore.
- Define region failure, credential compromise, accidental deletion, and legal-hold
  recovery runbooks before production acceptance.

## Monitoring and logging

Collect structured, redacted logs and metrics for:

- Request rate, latency, status/error codes, pagination, authorization failures, and
  correlation/request IDs.
- Database pool usage, query latency, lock waits, deadlocks, replication/backup
  health, migration status, and transaction rollback rate.
- Queue depth/age, outbox lag, retry count, dead-letter count, and notification
  delivery latency.
- Token failures/reuse, password-reset abuse, receipt access denials, and suspicious
  cross-group access patterns.
- Business reconciliation checks: approved allocation sums, payment/debt invariants,
  and audit/outbox consistency.

Alerts should be actionable and avoid email addresses, tokens, passwords, receipt
contents, and unnecessary personal data.

## CI/CD recommendations

1. Pull request: compile Java 21, run Maven/JUnit 5, migration checks, API contract
   tests, client tests, security/dependency scans, and PlantUML validation when the
   tool is available.
2. Build immutable backend/container and signed client artifacts after review.
3. Deploy to staging, run smoke, integration, performance, and cross-platform tests.
4. Promote with approval, expand/contract migrations, canary traffic, and rollback
   gates based on error rate, latency, queue lag, and database health.
5. Human reviewers verify requirement traceability, security, financial calculations,
   and architecture diagrams before release.
