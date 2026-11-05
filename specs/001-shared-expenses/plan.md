# Implementation Plan: SplitSmart Shared Expense Management

**Branch**: `001-shared-expenses` | **Date**: 2026-11-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-shared-expenses/spec.md`

## Summary

Implement the approved Java Swing MVP as a layered desktop application for account
access, group membership, expense allocation, single-stage review, in-app
notifications, pairwise balances, payments, and basic date-filtered summaries. The
MVP is a validation subset and does not satisfy the full web, Android, or iOS product
target. Domain rules will be isolated from Swing and persistence, use `BigDecimal`
for USD amounts, and be verified with JUnit 5 through Maven## Technical Context

**Language/Version**: Java 21

**Primary Dependencies**: Maven; Java Swing; JUnit 5; H2 embedded database for the
desktop MVP; PlantUML for architecture documentation

**Storage**: File-backed H2 database for MVP persistence; repository interfaces keep
the domain independent of the storage implementation

**Testing**: JUnit 5 executed through Maven, with unit tests for domain rules and
integration tests for repository and application-service flows

**Target Platform**: Java 21 desktop runtime for the approved Swing MVP; the full
product target remains web-first with Android and iOS and is outside this plan

**Project Type**: Layered desktop application with presentation, application
services, domain model, and persistence adapters

**Performance Goals**: Balance summaries and date-bounded reports for up to 5,000
expense records return within 3 seconds for at least 95% of measured requests in the
defined test environment

**Constraints**: USD only initially; exact minor-unit reconciliation; `BigDecimal`
for monetary calculations; keyboard-accessible Swing controls; pending and rejected
expenses never affect balances; failed saves never appear as completed transactions

**Scale/Scope**: One local MVP database, groups of up to 5,000 expenses for report
performance validation, single-stage approval in the MVP, and no external network
notification channel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Customer traceability**: PASS. Each MVP behavior maps to FR-001 through FR-013,
  NFR-001 through NFR-008, or the approved Java Swing MVP implementation decision.
- **Java 21 and Maven**: PASS. The plan targets Java 21 and Maven-managed builds and
  tests.
- **Object-oriented design**: PASS. Cohesive domain entities and application
  services own state transitions and business operations.
- **GUI/business separation**: PASS. Swing event handlers call application services;
  allocation, approval, payment, and balance logic remain UI-independent.
- **Exact monetary arithmetic**: PASS. USD values use `BigDecimal` with explicit
  two-decimal minor-unit validation and deterministic remainder allocation.
- **JUnit 5 verification**: PASS. Business rules and boundary cases are covered by
  Maven-run JUnit 5 tests tied to requirements.
- **PlantUML architecture**: PASS. The plan includes a layered architecture diagram
  documenting the presentation/domain boundary.
- **Human review**: REQUIRED before acceptance. AI-generated design and code must be
  reviewed by a human for traceability and correctness.

## Project Structure

### Documentation (this feature)

```text
specs/001-shared-expenses/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── desktop-ui.md
└── tasks.md              # created by $speckit-tasks
```

### Source Code (repository root)

```text
pom.xml
src/
├── main/java/com/splitsmart/
│   ├── domain/
│   │   ├── account/
│   │   ├── group/
│   │   ├── expense/
│   │   ├── payment/
│   │   └── reporting/
│   ├── application/
│   │   ├── account/
│   │   ├── group/
│   │   ├── expense/
│   │   ├── payment/
│   │   └── reporting/
│   ├── persistence/
│   │   ├── h2/
│   │   └── repository/
│   └── presentation/swing/
│       ├── account/
│       ├── group/
│       ├── expense/
│       ├── payment/
│       └── reporting/
├── main/resources/
│   ├── db/migration/
│   └── ui/
└── test/java/com/splitsmart/
    ├── domain/
    ├── application/
    └── persistence/
```

**Structure Decision**: Use one Maven project with four explicit layers. Domain
objects contain business invariants, application services coordinate use cases,
persistence adapters implement repository ports, and Swing views/controllers handle
presentation and user input only. This supports the constitution’s separation rule
and leaves a future shared-service boundary possible without making the MVP claim to
deliver web or mobile clients.

## Phase 0: Research Decisions

Research is recorded in [research.md](./research.md). The decisions resolve the
technical unknowns needed to design the MVP: persistence, monetary representation,
approval transitions, notification delivery, and report performance validation.

## Phase 1: Design Artifacts

- [data-model.md](./data-model.md) defines entities, relationships, invariants, and
  state transitions.
- [contracts/desktop-ui.md](./contracts/desktop-ui.md) defines the user-facing Swing
  screen and application-service interaction contract.
- [quickstart.md](./quickstart.md) defines reproducible build, test, and end-to-end
  validation scenarios.

## Complexity Tracking

No constitution violations require justification. The H2 adapter is an MVP storage
choice behind repository ports; it does not change customer scope or the full-product
platform requirement.

## Post-Design Constitution Check

- **Traceability**: PASS — design artifacts identify requirement mappings for core
  flows and preserve the Swing-only MVP boundary.
- **Separation and testability**: PASS — Swing is limited to presentation and calls
  application services; domain tests require no Swing components.
- **Money correctness**: PASS — USD scale, rounding, and participant-order remainder
  allocation are explicit in the data model and quickstart scenarios.
- **Verification and architecture**: PASS — Maven/JUnit 5 checks and a PlantUML
  architecture deliverable are part of the planned structure.
- **Human review**: REQUIRED before implementation acceptance.
