# Consolidated Requirements

These requirements consolidate the authoritative customer request, approved
clarifications, and the selected Architecture B design. Technical defaults are
marked as proposed and do not amend customer requirements.

## Functional requirements

- **CR-FR-001 Accounts**: The system MUST provide individual accounts with email and
  password sign-in, email verification, password reset, and access to the account
  holder's authorized expense and balance information.
- **CR-FR-002 Groups**: An authorized organizer MUST be able to create and manage a
  group and add existing accounts directly to its membership.
- **CR-FR-003 Expenses**: A group member MUST be able to submit an expense with a
  positive amount, valid date, description, one payer, group, participants, equal or
  percentage allocation, and optional receipt image. The payer may be outside the
  participants.
- **CR-FR-004 Allocation**: Equal and percentage allocations MUST reconcile exactly to
  the expense amount. Percentage shares MUST total exactly 100%; invalid totals MUST
  be rejected with an explanation. Fractional minor units MUST be assigned one at a
  time in the saved participant order.
- **CR-FR-005 Approval**: An expense MUST remain pending and excluded from balances
  until the configured approval workflow is satisfied. The organizer and explicitly
  designated reviewers may approve or reject. The MVP single-stage rule is retained;
  multi-stage behavior remains a product decision for the full product.
- **CR-FR-006 Notifications**: Submission MUST create in-app notifications for other
  active group members. Approval or rejection MUST NOT create another notification.
  Delivery status, retry, and duplicate suppression MUST be observable.
- **CR-FR-007 Balances**: The system MUST calculate each relevant pairwise amount owed
  or due from approved expenses and recorded payments. Pending and rejected expenses
  MUST have no balance effect.
- **CR-FR-008 Payments**: A user MUST be able to record a payment with payer, payee,
  amount, and date. Partial payments are allowed up to the specified payer-payee
  debt. A payment exceeding that outstanding debt MUST be rejected without changing
  the balance.
- **CR-FR-009 Reporting**: Authorized users MUST be able to view expense, balance,
  and payment summaries and request date-bounded reports. An invalid range is
  rejected; no-match results are empty rather than fabricated.
- **CR-FR-010 Platforms**: The full product MUST be primarily web-based and available
  on Android and iOS with consistent saved records, approval states, and balances.
- **CR-FR-011 Auditability**: Account, membership, expense, approval, payment,
  notification, and authorization-relevant actions MUST leave attributable history.

## Non-functional requirements

- **CR-NFR-001 Security**: Private account information is available only to its
  account holder; group data and receipts are available only to authorized members
  and reviewers. Authorization MUST be enforced by the backend.
- **CR-NFR-002 Monetary integrity**: All balance-affecting calculations MUST use
  `BigDecimal` and explicit USD scale/rounding rules. Approved allocations and
  payments MUST reconcile exactly.
- **CR-NFR-003 Performance**: For groups with up to 5,000 expense records, at least
  95% of balance-summary and date-bounded report requests MUST return complete
  results within 3 seconds under agreed test conditions.
- **CR-NFR-004 Reliability**: Failed validation or persistence MUST be communicated
  and MUST NOT appear as a successful expense, payment, balance, or notification.
- **CR-NFR-005 Notification latency**: At least 95% of in-app expense notifications
  MUST be available within 60 seconds of submission under agreed test conditions.
- **CR-NFR-006 Cross-platform consistency**: Supported clients MUST observe the same
  committed records and totals; stale writes MUST be detected rather than silently
  overwriting newer state.
- **CR-NFR-007 Accessibility**: Core account, group, expense, approval, balance,
  payment, and report workflows MUST expose meaningful labels, keyboard/screen-reader
  semantics, focus order, and non-color status cues.
- **CR-NFR-008 Observability**: API requests, job attempts, errors, authorization
  failures, transaction outcomes, and key business events MUST be centrally logged or
  metered without recording secrets or unnecessary private data.

## Approved business rules

1. USD is the only initially supported currency; the model must allow future
   currencies. Cross-currency expenses are out of scope until approved.
2. Amounts are positive. Refunds and corrections are separate transactions, not
   negative expenses.
3. Equal and percentage allocations reconcile to USD cents. Remainder cents follow
   the saved participant order.
4. A payer is singular and need not be an allocation participant.
5. Only approved expenses affect balances and approved-expense reports.
6. A payment applies only to its specified payer-payee debt and may be partial.
7. Overpayment is rejected atomically with an explanatory error.
8. Expense submission notifies other group members in-app only; approval/rejection
   does not notify again.
9. Any valid calendar date, including future dates, is accepted for expenses;
   malformed dates and invalid report ranges are rejected.
10. Existing accounts are added directly by an organizer; invitation acceptance is
    not required.

## Proposed technical defaults, not new business requirements

- Spring Boot 3.x on Java 21, with the exact minor version pinned during project
  setup; Maven remains the build and test tool.
- React/TypeScript web client, Kotlin/Jetpack Compose Android client, and
  Swift/SwiftUI iOS client.
- PostgreSQL with UUID identifiers, numeric monetary columns, foreign keys, explicit
  unique constraints, and indexes documented in [data-model.md](./design/data-model.md).
- Argon2id password hashing, 15-minute access tokens, rotating refresh tokens, and
  short-lived signed receipt URLs.
- Transactional outbox with a durable queue and exponential retry.
- Seven-year audit retention and a 15-minute/1-hour proposed RPO/RTO pair are
  operational defaults only until product/legal owners approve them.

## Open decisions

- Which additional currencies and minor-unit rules follow USD?
- What custom report parameters, export formats, and retention policy are required?
- What is the release sequence and feature-parity target across web, Android, and iOS?
- What exact multi-stage approval, edit, and resubmission rules are required?
- Who may initiate, approve, and reverse a payment correction or refund?
- What audit retention, privacy deletion, and legal hold policies are required?
- What availability, disaster-recovery, and regional deployment targets are approved?

## Acceptance criteria

- **CR-AC-001**: A verified account can sign in, reset a password, and access only
  authorized records; an unrelated account is denied.
- **CR-AC-002**: An organizer can add an existing account and designate a reviewer;
  only the organizer/designated reviewer can decide an expense.
- **CR-AC-003**: Equal and percentage splits, including fractional-cent cases,
  reconcile exactly; invalid percentage totals are rejected.
- **CR-AC-004**: Pending/rejected expenses do not alter balances; one approved expense
  alters the correct pairwise debts exactly once.
- **CR-AC-005**: Submission creates one in-app notification per other active group
  member, with retry/idempotency behavior and no approval/rejection duplicate.
- **CR-AC-006**: Partial payment reduces only the named debt; overpayment under
  concurrent requests results in at most one accepted amount up to the debt.
- **CR-AC-007**: Reports honor authorization and inclusive date filters, reject an
  inverted range, and return an empty result when no records match.
- **CR-AC-008**: Web, Android, and iOS observe identical committed status and balance
  data through the versioned API.
- **CR-AC-009**: Receipt access, audit events, token lifecycle, and failed writes meet
  the security and reliability rules above.

## Traceability note

Detailed mapping to `UserRequirement.md`, Architecture A clarified requirements, and
verification tests is maintained in [traceability-matrix.md](./traceability-matrix.md).
