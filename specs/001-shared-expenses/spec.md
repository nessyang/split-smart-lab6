# Feature Specification: SplitSmart Shared Expense Management

**Feature Branch**: `001-shared-expenses`

**Created**: 2026-10-28

**Status**: Draft

**Input**: Authoritative customer request in `UserRequirement.md`; preserve all requested features and identify the Java Swing MVP subset separately.

## Clarifications

### Session 2026-10-28

- Q: Can an expense have multiple payers, and must its payer be one of the people sharing the cost? → A: One payer per expense; the payer may be outside the participants.
- Q: How should people sign in to their SplitSmart accounts? → A: Email and password, with email verification and password reset.
- Q: How should a person become a member of a group? → A: A group organizer can add an existing account directly.
- Q: How should any leftover cents be assigned when an expense split does not divide evenly? → A: Assign leftover cents one at a time in a fixed participant order.
- Q: What should determine the fixed order used to assign leftover cents? → A: Use the participant order shown on the expense.
- Q: Can members record partial payments, and what should happen if a payment exceeds the amount owed? → A: Allow partial payments up to the amount owed; reject any excess with an explanation.
- Q: When should group members be notified about an expense? → A: Notify other group members when an expense is submitted only.
- Q: Must percentage shares total exactly 100%, or should SplitSmart adjust totals that are slightly above or below 100%? → A: Percentage shares must total exactly 100%; reject other totals with an explanation.
- Q: Should expenses accept only positive amounts, with zero and negative amounts rejected, or should negative amounts be allowed for refunds or corrections? → A: Positive expense amounts only; refunds or corrections must be recorded separately.
- Q: What maximum should apply to a positive expense amount? → A: No product-specific maximum beyond the selected currency's valid amount limits.
- Q: Which notification channels should SplitSmart use to alert group members about submitted expenses? → A: In-app notifications only.

### Session 2026-11-05

- Q: Who may approve submitted expenses, and how are those reviewers selected? → A: Only group organizers and explicitly designated reviewers may approve; the organizer selects reviewers per group.
- Q: Which currencies should SplitSmart support in the initial scope? → A: Support USD only initially; design the data model to allow future currencies.
- Q: What date range should be accepted for expense dates? → A: Any valid calendar date, with future dates allowed.
- Q: Is the proposed Java Swing MVP approved as a desktop-only subset that does not satisfy the full web, Android, and iOS product target? → A: Approve the Java Swing MVP as a separate, desktop-only validation subset.
- Q: When multiple debts exist between group members, how should a payment be allocated? → A: Apply each payment only to the specified payer-payee debt.

## User Scenarios & Testing *(mandatory)*

### Actors

- **Account holder**: A person who signs in to view their own expenses and balances.
- **Group organizer**: An account holder who creates a group and manages its membership.
- **Expense submitter**: A group member who records an expense and identifies its payer.
- **Expense payer**: The person recorded as paying for an expense; they need not be one of its cost-sharing participants.
- **Reviewer**: A member authorized by the group to review submitted expenses.
- **Participant**: A member included in an expense allocation or payment.
- **Report viewer**: An authorized account holder who reviews their own or a group's expense information.
- **Notification recipient**: A group member who is notified about another member's submitted expense.

### User Story 1 - Set up an account and shared group (Priority: P1)

As a person sharing costs with friends, roommates, family, or coworkers, I want my own
account and a group with the relevant people so that shared activity and balances are
available to the right members.

**Why this priority**: Accounts and groups establish the ownership and access boundaries
needed for every later expense-sharing flow.

**Independent Test**: Create two accounts, sign in separately, create a group with one
account, and verify that members can access the group while an unrelated account cannot.

**Acceptance Scenarios**:

1. **Given** a person has no account, **When** they create an account and sign in,
   **Then** they can access their own expense and balance information.
2. **Given** a signed-in group organizer, **When** they create a group and manage its
   membership, **Then** the selected members can access that group's shared information
   and a non-member cannot.

### User Story 2 - Submit and review a shared expense (Priority: P1)

As a group member who paid for a shared item, I want to record its details, identify
participants, and submit it for review so that a group can confirm expenses before
they change anyone's balance.

**Why this priority**: Correctly recording and approving expenses is the core source of
shared balance changes.

**Independent Test**: Submit an expense with a date, description, amount, payer,
participants, and allocation; verify its approval state, review outcome, and resulting
balances.

**Acceptance Scenarios**:

1. **Given** an active group, **When** a member submits an expense with valid details
   and an equal allocation, **Then** the expense is pending review and is not yet
   included in balances.
2. **Given** a submitted expense, **When** an authorized reviewer approves it,
   **Then** the expense is recorded as approved and its allocations affect the
   appropriate member-to-member balances.
3. **Given** a submitted expense, **When** an authorized reviewer rejects it,
   **Then** it remains excluded from balances and the submitter can see its rejected
   status.
4. **Given** an expense using percentage allocation, **When** its participant shares
   total 100%, **Then** each participant's share is calculated from the expense amount;
   when the percentages are invalid, the system rejects the submission with an
   explanation.

### User Story 3 - Notify members and settle balances (Priority: P2)

As a group member, I want to learn when another member submits an expense and record
payments between members so that I can keep track of changes and settlements.

**Why this priority**: Timely awareness and payment records make balances useful for
ongoing group coordination.

**Independent Test**: Submit an expense in a group with another member, verify that
member receives a notification, record a payment between members, and verify the
remaining balance.

**Acceptance Scenarios**:

1. **Given** another member of my group submits an expense, **When** the submission is
   accepted for review, **Then** I receive a notification identifying the expense and
   its pending status; approval or rejection does not trigger another notification.
2. **Given** one member owes another, **When** the payer records a payment with an
   amount and date, **Then** the payment appears in payment history and the outstanding
   balance is reduced by that amount.
3. **Given** a member owes another member, **When** the payer records a partial
   payment no greater than the outstanding amount, **Then** the payment is accepted and
   the remaining pairwise debt is reduced by the payment amount.
4. **Given** a payment exceeds the outstanding pairwise debt, **When** it is submitted,
   **Then** the system rejects it, leaves the balance unchanged, and explains that the
   payment cannot exceed the amount owed.

### User Story 4 - Review expenses, balances, and payments (Priority: P2)

As an account holder or group member, I want summaries and reports for a selected
period so that I can understand spending, amounts owed, and payments made.

**Why this priority**: Summaries and reports make accumulated expense and payment
records useful for reconciliation.

**Independent Test**: Create approved and rejected expenses and payments across
multiple dates, request a report for a date range, and compare the results with the
underlying records.

**Acceptance Scenarios**:

1. **Given** expense, balance, and payment records, **When** an authorized user opens
   a summary, **Then** it shows the records and totals they are entitled to view.
2. **Given** a user specifies a date range and report parameters, **When** they request
   a custom report, **Then** the report includes only matching records and identifies
   the selected range and parameters.
3. **Given** a report range whose start date is after its end date, **When** the user
   requests the report, **Then** the system explains the invalid range and produces no
   misleading results.

### User Story 5 - Use SplitSmart across supported platforms (Priority: P3)

As a group member, I want to use SplitSmart on the web and on Android and iOS so that
I can access the expense-sharing service on my supported device.

**Why this priority**: Cross-platform access is an explicit customer requirement, but
depends on the account, group, expense, and balance workflows being defined.

**Independent Test**: Sign in to the same account on the web and on Android and iOS,
then verify access to the account's authorized groups and current records.

**Acceptance Scenarios**:

1. **Given** an account holder with an active account, **When** they access SplitSmart
   on the web, Android, or iOS, **Then** they can sign in and view their authorized
   information.
2. **Given** a member changes an expense or payment using one supported platform,
   **When** another supported platform displays that record, **Then** it shows the
   same saved status and balance information.

### Edge Cases

- Reject an expense with a missing description, malformed or otherwise invalid date,
  non-positive amount,
  amount invalid for the selected currency, no participants, participants outside the
  group, or an allocation that does not match the amount under the group's currency
  rules.
- Accept only positive expense amounts. Record refunds or corrections as separate
  transactions rather than as zero or negative expenses.
- Reject negative percentage shares and any total other than exactly 100%, explaining
  that percentages are not silently normalized.
- Do not include pending or rejected expenses in balances or approved-expense totals.
- Preserve the original amount and allocation when a reviewer rejects an expense;
  never treat rejection as approval.
- Reject a payment with a non-positive amount, an unrelated payer/payee, or an amount
  greater than the outstanding pairwise debt; explain the error and leave the balance
  unchanged. Accept partial payments up to the debt.
- Ensure that equal or percentage splits that produce fractional minor units assign
  leftover units one at a time in the participant order shown on the expense and still
  reconcile exactly to the expense total.
- Do not deliver group expense details to a non-member or expose one account holder's
  private information to another account.
- If an expense or payment cannot be saved, show an error and do not display it as a
  successful balance change.
- A report with no matching records returns an empty result, not fabricated totals.
- If a notification cannot be delivered immediately, retain its status for retry or
  report that delivery failed; do not report an undelivered notification as delivered.

## Requirements *(mandatory)*

### Functional Requirements

The following inventory preserves the customer-requested capabilities. The platform
requirements are part of the full product target, not claims about the Swing MVP.

- **FR-001**: The system MUST let each person create an individual account using an
  email address and password, verify the email address, reset a forgotten password,
  sign in, and access their own expense and balance information.
- **FR-002**: The system MUST let an authorized member create and manage groups,
  including adding existing accounts directly to the group's membership.
- **FR-003**: The system MUST let a group member record an expense's amount, date,
  description, one payer, group, and involved participants; the payer need not be one
  of the involved participants. The expense amount MUST be positive and valid for the
  selected currency; there is no additional product-specific maximum amount.
- **FR-004**: The system MUST support equal and percentage-based expense allocations,
  require percentage shares to total exactly 100% and reject other totals with an
  explanation, and reconcile participant shares to the full expense amount under the
  applicable currency rules. When a split leaves minor currency units, the system
  MUST assign them one at a time in the participant order shown on the expense.
- **FR-005**: The system MUST allow an expense submitter to attach an optional receipt
  image and authorized group members to view it.
- **FR-006**: The system MUST require an expense to pass the group's configured review
  and approval workflow before including it in balances or approved-expense reports.
- **FR-007**: The system MUST support a group-configured approval workflow with at
  least one review and the option to require multiple approval levels. Only the group
  organizer and explicitly designated group reviewers may approve an expense; the
  organizer selects reviewers for each group.
- **FR-008**: The system MUST let authorized reviewers review submitted expenses and
  record approval or rejection; submitters and group members with access MUST be able
  to see the outcome.
- **FR-009**: The system MUST notify other members of a group when a member submits a
  new expense using in-app notifications only; expense approval or rejection MUST NOT
  trigger another notification.
- **FR-010**: The system MUST calculate and display each user's amount owed to or due
  from every other relevant user based on approved expenses and recorded payments.
- **FR-011**: The system MUST let users record payments that settle amounts owed,
  including the payer, payee, amount, and date, and MUST update the remaining balance.
  Each payment MUST apply only to the specified payer-payee debt.
  It MUST accept partial payments up to the payer's outstanding debt to that payee and
  reject any amount above that debt with an explanation, without changing the balance.
- **FR-012**: The system MUST provide authorized users with expense reports and
  summaries, including the ability to select date ranges and other report parameters.
- **FR-013**: The system MUST provide authorized users with balance and payment
  summaries that reconcile to the underlying approved expenses and recorded payments.
- **FR-014**: The full product MUST be primarily web-based and MUST also be available
  as applications that run on Android and iOS.
- **FR-015**: Core account, group, expense, approval, balance, payment, notification,
  and reporting records MUST remain consistent when accessed from supported platforms.

### Non-Functional Requirements

- **NFR-001**: Only the account holder may access private account information; group
  information and receipt images MUST be available only to authorized group members
  and reviewers.
- **NFR-002**: Every approved expense allocation and payment MUST reconcile exactly to
  its recorded amount under the selected currency and rounding rules; pending and
  rejected expenses MUST NOT affect balances.
- **NFR-003**: For a group with up to 5,000 expense records, at least 95% of requests
  to view a balance summary or date-bounded report MUST return a complete result within
  3 seconds under the agreed test conditions.
- **NFR-004**: A validation or save failure MUST be communicated to the user, and the
  system MUST NOT present an unsaved expense or payment as a completed transaction.
- **NFR-005**: At least 95% of in-app group expense notifications MUST be available to
  recipients within 60 seconds of expense submission under the agreed test conditions.
- **NFR-006**: The account's saved records and approval states MUST be consistent
  across supported platforms; a user MUST NOT see conflicting saved totals for the
  same account and group.
- **NFR-007**: Account, expense, payment, approval, and membership actions MUST leave
  an attributable history sufficient for authorized users to understand who changed
  a record and when.
- **NFR-008**: The core account, group, expense, payment, and report flows MUST be
  operable using keyboard navigation and expose meaningful labels and status
  information to assistive technologies.

### Acceptance Criteria by Requirement

- **AC-001 (FR-001, NFR-001)**: A person can create an account using an email address
  and password, verify the email address, reset a forgotten password, sign in, and view
  their own records; another account cannot view them without authorization.
- **AC-002 (FR-002, NFR-001)**: A group organizer can create a group and directly add
  an existing account to its membership; only current authorized members can view that
  group's records.
- **AC-003 (FR-003)**: A submitted expense displays its required positive amount,
  date, description, payer, group, and participants; amounts invalid for the selected
  currency are rejected, with no additional product-specific maximum.
- **AC-004 (FR-004, NFR-002)**: Equal shares and percentage shares reconcile to the
  recorded amount; percentage totals other than exactly 100% are rejected with an
  explanation; leftover minor units are assigned in the order participants appear on
  the expense; other invalid or incomplete allocations are rejected with an
  explanation.
- **AC-005 (FR-005, NFR-001)**: An expense can be saved without a receipt; when one is
  attached, authorized members can view it and non-members cannot.
- **AC-006 (FR-006, FR-007, FR-008, NFR-002, NFR-007)**: Pending expenses do not
  change balances; configured reviewers can approve or reject them; only approved
  expenses change balances, and the decision is visible in the history.
- **AC-007 (FR-009, NFR-005)**: Other group members receive an in-app notification
  when an expense is submitted, identifying its pending status; approval and rejection
  do not trigger another notification. Delivery timing is measured against NFR-005.
- **AC-008 (FR-010, FR-011, FR-013, NFR-002)**: Approving an expense changes the
  appropriate pairwise balances; a partial payment up to the debt reduces the amount
  owed by exactly the payment amount; an overpayment is rejected without changing the
  balance; displayed totals reconcile with the source records.
- **AC-009 (FR-012, FR-013, NFR-003)**: A user can request expense, balance, and
  payment summaries for selected dates and parameters; returned records match those
  filters and meet the response-time target.
- **AC-010 (FR-014, FR-015, NFR-006, NFR-008)**: Users can complete the core account
  and expense-sharing flows on the web, Android, and iOS; saved statuses and balances
  agree across platforms, and core controls meet the accessibility requirement.
- **AC-011 (NFR-004, NFR-007)**: When saving an expense or payment fails, the user
  receives an explanation, no balance is changed, and the record history does not
  show the failed action as completed.

## Implementation Decision — Java Swing MVP Subset

This section records an implementation decision, not a customer requirement. The
candidate MVP uses a Java Swing desktop interface to validate the core expense-sharing
journey. The candidate subset includes individual account access, group and membership
management, expense entry with equal or percentage allocation and optional receipt,
single-stage approval, in-app group notifications, pairwise balances, payment
recording, and basic expense, balance, and payment summaries with date filtering.

The candidate MVP does not deliver the customer's web-first product or Android and
iOS applications, multi-stage approval, or configurable custom reporting. It MUST NOT
be represented as satisfying the full customer request. The product owner has approved
the MVP boundary as a desktop-only validation subset; the platform delivery plan
remains separate.

## Key Entities *(include if feature involves data)*

- **Account**: A person's identity and private expense and balance access.
- **Group**: A collection of accounts sharing expenses, membership, and group rules.
- **Membership**: The association between an account and a group, including its access
  and review permissions.
- **Expense**: A proposed or approved shared charge, including amount, date,
  description, payer, participants, allocation, optional receipt, and review status.
- **Allocation**: Each participant's share of an expense, represented as an equal or
  percentage-based amount.
- **Approval**: A review decision for an expense, including reviewer, decision, and
  time; a multi-stage workflow may have more than one decision.
- **Notification**: A message about a submitted group expense and its current status,
  addressed to another group member.
- **Balance**: The net amount one account owes another based on approved expenses and
  payments.
- **Payment**: A recorded settlement from one account to another, including amount,
  date, and associated balance.
- **Report**: A summary or filtered view of authorized expense, balance, or payment
  records for a selected period and parameters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a usability test, at least 9 of 10 first-time participants can create
  an account and join or create a group within 5 minutes without assistance.
- **SC-002**: In all defined expense-allocation test cases, equal and percentage
  allocations sum exactly to the expense amount at the currency's smallest unit.
- **SC-003**: In all approval test cases, 100% of pending and rejected expenses are
  excluded from balances, and 100% of approved expenses are reflected exactly once.
- **SC-004**: In all payment test cases, recorded payments reconcile with pairwise
  balances and do not silently create an invalid overpayment.
- **SC-005**: At least 95% of in-app expense notifications arrive within 60 seconds
  of submission under the agreed test conditions.
- **SC-006**: For a group with up to 5,000 expense records, at least 95% of
  date-bounded reports and balance summaries are available to the user within
  3 seconds under the agreed test conditions.
- **SC-007**: The full product's core workflows are usable on the web, Android, and
  iOS, and all three platforms show consistent saved balances and approval states.
- **SC-008**: At least 9 of 10 usability-test participants can review an expense,
  record a payment, and find the resulting balance without assistance.

## Assumptions

- A person must have an account and be a member of a group to view that group's
  expenses, receipts, and balances.
- A group organizer can add an existing account to a group directly; invitation
  acceptance is not required.
- Accounts use email-and-password sign-in, email verification, and password reset.
- A group expense has exactly one recorded payer, who may be outside the cost-sharing
  participants.
- USD is the only supported currency in the initial scope. The data model must allow
  future currencies, but currency changes and cross-currency expenses are out of scope.
- Expense dates may be any valid calendar date, including future dates; malformed or
  otherwise invalid dates are rejected.
- Equal and percentage splits must reconcile to the currency's smallest unit.
  Leftover minor units are assigned one at a time in the participant order shown on
  the expense.
- An expense submission triggers an in-app notification to other group members;
  approval and rejection do not trigger another notification. Notification
  preferences require a product decision.
- Groups can select a single-stage or multi-stage approval process for the full
  product; only single-stage approval is included in the candidate MVP. The group
  organizer selects the explicitly designated reviewers, and only the organizer or
  those reviewers may approve expenses.
- A rejected expense is excluded from balances and approved-expense totals.
- Payments may partially settle one payer's debt to one payee, but cannot exceed the
  outstanding pairwise debt. Each payment applies only to the specified payer-payee
  debt and does not automatically affect other debts.
- Expense amounts must be positive; refunds and corrections require separate
  transactions.
- Positive expense amounts have no product-specific maximum beyond the selected
  currency's valid amount limits.
- MVP summaries are limited to basic expense, balance, and payment views with date
  filtering; custom report fields and output formats are not assumed.
- The target users are people sharing costs in informal or organized groups; the
  customer's full platform requirement remains web-first with Android and iOS apps.

## Open Questions

1. Which custom report parameters, export formats, and data-retention policies are
   required?
2. What is the approved release sequence and feature parity target for the web,
   Android, and iOS versions relative to the Java Swing MVP?

Notification preferences remain open. Resolve this alongside the other open product
questions before treating the corresponding behavior as final.
