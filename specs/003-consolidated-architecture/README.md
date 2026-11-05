# SplitSmart Consolidated Architecture

## Architecture decision

The selected solution is **Architecture B — Web-First Modular Monolith**. It better
supports the complete web, Android, and iOS product requirements than the Java
Swing/local-storage MVP architecture.

The production target is a Java 21 Spring Boot modular monolith behind a versioned
REST API, backed by PostgreSQL and private receipt object storage. Web, Android, and
iOS clients use the same centralized authentication, authorization, business rules,
and persistence boundary. Asynchronous in-app notifications use a transactional
outbox and worker. Cloud deployment provides horizontal application scaling,
centralized monitoring, backups, and audit visibility.

## Scope and objectives

- Preserve all customer capabilities from `UserRequirement.md`: accounts, groups,
  expenses, notifications, approval, balances, payments, reporting, and supported
  web/Android/iOS platforms.
- Preserve clarified business rules from Architecture A: exact USD monetary
  reconciliation, deterministic remainder allocation, approval-before-balance,
  reviewer authorization, pairwise debts, partial payments, overpayment rejection,
  audit history, transactional writes, date filtering, and in-app notifications.
- Adapt those rules to one centralized backend and shared database.
- Keep technical defaults distinct from approved customer requirements and identify
  unresolved product decisions.

## Source architecture references

- Authoritative requirements: [UserRequirement.md](../../UserRequirement.md)
- Project principles: [constitution.md](../../.specify/memory/constitution.md)
- Architecture A specification: [spec.md](../001-shared-expenses/spec.md)
- Architecture A plan and design: [plan.md](../001-shared-expenses/plan.md),
  [research.md](../001-shared-expenses/research.md),
  [data-model.md](../001-shared-expenses/data-model.md),
  [quickstart.md](../001-shared-expenses/quickstart.md), and
  [desktop-ui.md](../001-shared-expenses/contracts/desktop-ui.md)
- Architecture B alternative: [README.md](../002-alternative-architecture/README.md),
  its architecture diagrams, security design, and [REST contract](../002-alternative-architecture/contracts/rest-api.md)

## Consolidated deliverables

- Requirements: [requirements.md](./requirements.md)
- Architecture: [architecture-overview.md](./architecture/architecture-overview.md)
- API: [rest-api.md](./contracts/rest-api.md)
- Data model: [data-model.md](./design/data-model.md)
- UI design: [ui-design.md](./design/ui-design.md)
- Testing: [test-strategy.md](./testing/test-strategy.md)
- Deployment: [deployment-guide.md](./deployment/deployment-guide.md)
- Traceability: [traceability-matrix.md](./traceability-matrix.md)

## Explicit exclusions from the production target

Java Swing and local H2 remain evidence for the separately approved MVP only. They
are not production technologies in this consolidated Architecture B.
