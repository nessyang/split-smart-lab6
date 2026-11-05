# Quickstart Validation: SplitSmart Shared Expense Management

This guide validates the approved Java Swing MVP. It does not validate the full
web-first, Android, or iOS product target.

## Prerequisites

- Java 21 JDK on `PATH`
- Maven 3.9 or newer on `PATH`
- A clean local H2 database path configured for the test run

## Build and automated verification

From the repository root:

```text
mvn test
```

Expected result: all JUnit 5 tests pass, including allocation rounding, percentage
validation, approval authorization, balance exclusion, partial payment, overpayment,
notification, authorization, and report date filtering cases.

## Manual end-to-end scenario

1. Register two verified accounts and sign in as the first account.
2. Create a USD group and add the second existing account.
3. Designate the second account as reviewer.
4. Submit a `$10.00` expense with the first account as payer and both accounts as
   equal participants.
5. Confirm the expense is pending, the second account receives an in-app pending
   notification, and no balance changes yet.
6. Sign in as the reviewer and approve the expense. Confirm the allocation is `$5.00`
   per participant and the pairwise balance reflects the approved expense exactly once.
7. Record a `$2.00` payment from the owing participant to the payer. Confirm the debt
   decreases by exactly `$2.00`.
8. Attempt a payment greater than the remaining debt. Confirm an explanation appears,
   no payment is committed, and the balance is unchanged.
9. Request a report for a date range with no matching records. Confirm an empty result
   and no fabricated totals.

## Boundary scenarios

- Submit a percentage expense whose shares total 99.99% or 100.01%; expect rejection.
- Split an amount that leaves a cent remainder; verify cents are assigned in saved
  participant order and the shares reconcile exactly.
- Try to approve as an ordinary member; expect authorization failure.
- Reject an expense; verify it never affects balances or approved totals.
- Enter a future expense date; expect acceptance. Enter a malformed date or a report
  range whose start is after its end; expect an explained validation error.
- Try to access a group as a non-member; expect denial without record disclosure.

## Performance validation

Seed a group with 5,000 expenses and run date-bounded balance/report queries under the
agreed test environment. Record latency for each request and verify that at least 95%
of complete results return within 3 seconds.

## Review gate

Before accepting the implementation, a human reviewer must inspect requirement
traceability, exact monetary arithmetic, Swing/business separation, JUnit evidence,
and the PlantUML architecture diagram.
