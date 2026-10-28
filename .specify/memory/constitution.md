<!--
Sync Impact Report
Version change: Uninitialized template -> 1.0.0
Modified principles: Template placeholders -> Customer Requirement Traceability;
Java 21 and Maven; Object-Oriented Design; GUI and Business Logic Separation;
Exact Monetary Arithmetic; JUnit 5 Verification; PlantUML Architecture;
Human Review of AI Output
Added sections: Implementation Constraints; Verification and Review Workflow
Removed sections: None
Follow-up TODOs: Confirm the original ratification date.
-->
# SplitSmart Constitution

## Core Principles

### I. Customer Requirement Traceability
The original customer request in `UserRequirement.md` is the authoritative source for
customer needs. Every implemented customer-facing behavior MUST trace to a stated
requirement or to a separately recorded, human-approved clarification. Keep customer
requirements distinct from implementation decisions; do not describe a technical choice
as a customer requirement. Preserve `UserRequirement.md` unless the customer explicitly
authorizes an update.

### II. Java 21 and Maven
Production code MUST target Java 21 and use Maven for dependency management, builds, and
test execution. The Maven compiler configuration MUST declare Java release 21 so that
local and automated builds use the same language and platform baseline.

### III. Object-Oriented Design
Code MUST assign state and behavior to cohesive objects with explicit responsibilities.
Keep modules focused and minimize unnecessary coupling; use abstractions where they
clarify boundaries or enable testing, not as an end in themselves.

### IV. GUI and Business Logic Separation
Java Swing presentation code MUST remain separate from business rules and domain state.
Event handlers MUST delegate to business-facing operations rather than implement
expense allocation, approval, or balance calculations themselves. Business logic MUST
be testable without constructing Swing components.

### V. Exact Monetary Arithmetic
All monetary amounts and calculations that affect balances MUST use `BigDecimal`, not
binary floating-point types. Scale, rounding, and remainder-allocation rules MUST be
explicitly documented and tested before they are relied on for expense splits or
payments.

### VI. JUnit 5 Verification
Automated tests MUST use JUnit 5 and run through Maven. Tests MUST cover business rules
and important boundary cases, including expense allocation and balance changes, and
MUST be traceable to their requirements or approved implementation decisions.

### VII. PlantUML Architecture
PlantUML diagrams MUST document the system's significant architecture and the
separation between presentation and business logic. Update affected diagrams when a
material architecture or domain-model decision changes, so diagrams do not contradict
the implementation.

### VIII. Human Review of AI Output
AI-generated requirements, design, code, tests, and diagrams MUST receive human review
before acceptance. The reviewer MUST check correctness, requirement traceability, and
consistency with this constitution; AI output MUST NOT be its own approval.

## Implementation Constraints

The Java 21, Maven, Swing, JUnit 5, PlantUML, and `BigDecimal` provisions in this
constitution are implementation decisions. They do not amend or replace customer
requirements. In particular, `UserRequirement.md` requests a primarily web-based
product and Android and iOS apps; using Swing alone does not satisfy those platform
requirements. Any platform gap or change in delivery scope MUST be recorded as an
implementation decision and receive human approval before the product is represented
as meeting the original request.

## Verification and Review Workflow

For each change, identify applicable customer requirements and implementation
decisions, then verify the change with relevant JUnit 5 tests run through Maven.
Reviewers MUST check that money-related behavior follows documented `BigDecimal`
scale and rounding rules, GUI changes preserve the presentation/business boundary,
and material architecture changes are reflected in PlantUML. AI-assisted work MUST
also receive the independent human review required by Principle VIII.

## Governance

This constitution governs project decisions and supersedes conflicting local
conventions. Amendments MUST be proposed in writing, explain their rationale and
impact on requirements and implementation decisions, and receive human approval.
Update the version and amendment date with every approved change.

Use semantic versioning for the constitution: MAJOR for incompatible changes to
principles or governance, MINOR for added principles or materially expanded
requirements, and PATCH for clarifications and non-semantic edits.

Before accepting a change or release, reviewers MUST check compliance with the
applicable principles, requirement traceability, test evidence, and any documented
platform gaps. Record exceptions and their human approval; an exception does not
silently amend the customer request or this constitution.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown; confirm with project owner | **Last Amended**: 2026-10-28
