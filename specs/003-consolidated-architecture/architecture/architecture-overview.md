# Consolidated Architecture Overview

## Architecture

SplitSmart is a web-first product built as a Java 21 Spring Boot modular monolith.
Clients communicate through a versioned REST API. The backend owns authentication,
authorization, validation, allocation, approval, balances, payments, reports,
notifications, receipt authorization, and audit history. PostgreSQL is the shared
transactional system of record. Receipt bytes live in private object storage; the
database stores metadata and object keys.

The modular monolith is deployed as multiple stateless instances of one backend
artifact. Modules share a transaction boundary but have explicit ownership of tables
and domain rules. A durable transactional outbox feeds an asynchronous notification
worker. Central logs, metrics, traces, and security events support operations.

## Technology stack

| Concern | Consolidated target | Status |
|---|---|---|
| Backend | Java 21, Spring Boot 3.x, Maven | Proposed technical default |
| API | HTTPS REST `/api/v1`, JSON, OpenAPI generated/checked during implementation | Proposed technical default |
| Web | React + TypeScript | Proposed technical default |
| Android | Kotlin + Jetpack Compose | Proposed technical default |
| iOS | Swift + SwiftUI | Proposed technical default |
| Database | PostgreSQL | Selected Architecture B foundation |
| Receipts | Private cloud object storage | Selected Architecture B foundation |
| Notifications | Outbox, durable queue, worker, in-app notification store | Consolidated design |
| Authentication | Central identity module; OIDC-compatible token boundary | Proposed technical default |
| Monitoring | Centralized structured logs, metrics, traces, alerting | Required operational capability |
| Tests | JUnit 5 through Maven plus client/API test suites | Constitution-aligned |

Exact library versions, cloud vendor, and client framework versions are implementation
decisions to be pinned during delivery; they are not customer requirements.

## Module responsibilities

- **Identity and account**: registration, email verification, password reset, login,
  access/refresh token lifecycle, account privacy.
- **Group and membership**: groups, direct member addition, organizer role, explicit
  reviewer designation, membership authorization.
- **Expense and allocation**: expense validation, participant order, USD `BigDecimal`
  allocation, receipts, pending state, and submission outbox event.
- **Approval**: reviewer authorization, approval/rejection transitions, immutable
  decisions, and balance-change event.
- **Balance and payment**: pairwise debt derivation, partial payments, atomic
  overpayment prevention, correction/reversal proposal boundary.
- **Reporting**: authorized summaries, date filters, pagination, and performance
  query paths.
- **Notification**: outbox consumption, in-app notification records, retry,
  idempotency, and delivery status.
- **Audit**: append-only attributable history and security/business event retention.

## Major design decisions

1. A modular monolith is preferred over microservices because these workflows need
   atomic expense/approval/payment/balance transactions and the product scale does
   not require independent service deployment yet.
2. PostgreSQL is the source of truth; derived balances are recalculated from approved
   allocations and payments rather than treated as an untraceable mutable total.
3. All monetary calculations use `BigDecimal` with explicit scale 2 and deterministic
   remainder allocation.
4. Overpayment is protected by a transaction that locks or serializes the relevant
   payer-payee debt calculation and records the payment only after rechecking it.
5. Notifications use an outbox in the same transaction as the business action, then
   a worker retries delivery with idempotent keys.
6. Clients never implement authorization or financial calculations; they render
   server-authoritative results.

## Trade-offs and assumptions

- A modular monolith reduces operational complexity and cross-service consistency
  failures, at the cost of less independent scaling and deployment isolation than
  microservices.
- PostgreSQL and object storage require cloud operations but provide shared
  multi-client state and durable recovery.
- Proposed React, Kotlin, and Swift choices optimize platform fit; the product owner
  has not separately approved framework selection.
- Proposed token lifetimes, retention, RPO/RTO, and correction workflow are defaults,
  not silently finalized product decisions.
- Multi-stage approval remains a full-product open decision even though the module
  boundary supports it.

## Consistency boundary

The request path is: client → gateway/API → authenticated module → PostgreSQL
transaction. The transaction commits the business record, audit event, and outbox
event together. Workers may deliver notifications later, but never invent a committed
expense or balance. API responses include the committed version so clients can detect
stale updates.
