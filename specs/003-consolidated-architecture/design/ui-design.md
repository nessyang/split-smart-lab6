# Consolidated UI Design

All clients use the same server-authoritative API, authorization semantics, status
labels, and monetary formatting. Client technology choices are proposed defaults:
React/TypeScript for web, Kotlin/Jetpack Compose for Android, and Swift/SwiftUI for
iOS.

## Web client

Primary navigation: Dashboard, Groups, Expenses, Balances, Payments, Reports, and
Account/Security. A group workspace contains members/reviewer management for
organizers, expense list/detail, review queue for authorized reviewers, balances,
payments, notifications, and reports.

The web client uses cursor pagination, filter state reflected in URLs where useful,
optimistic display only for non-financial UI state, and server confirmation before
showing expense/payment completion. Stale `ETag`/version responses explain that the
record changed and offer reload/retry.

## Android and iOS clients

Both mobile clients mirror the web information architecture with platform-native
navigation: bottom/tab navigation for Dashboard, Groups, Balances, Notifications, and
Account; group detail uses stacked expense, review, payment, and report flows.

Mobile clients cache authorized read data for resilience but never treat cached
balances as authoritative. Mutations require network confirmation, use idempotency
keys, and surface pending/retry states for notification and save operations.

## Principal workflows

1. **Account**: register → verify email → sign in → recover/reset password.
2. **Group**: create group → add existing account → designate reviewer.
3. **Expense**: enter positive USD amount/date/description → select payer and ordered
   participants → choose equal/percentage allocation → attach optional receipt →
   submit → see pending status and notification result.
4. **Review**: reviewer opens queue → validates detail/receipt → approve or reject →
   sees attributable decision; only approval changes balances.
5. **Settlement**: view pairwise debt → record partial payer-payee payment → see
   remaining debt; overpayment is rejected without mutation.
6. **Reporting**: choose inclusive dates/type → receive authorized paginated results
   or a truthful empty result.

## Accessibility and validation

- Meet WCAG 2.2 AA as the proposed web/mobile accessibility target, subject to
  product approval.
- Provide semantic labels, screen-reader descriptions, keyboard/focus support,
  minimum touch targets, dynamic text sizing, and non-color status indicators.
- Validate fields inline and in a summary; identify the exact rule for invalid date,
  amount, percentage, participant, receipt, or payment input.
- Use two-decimal USD presentation and plain-language pending/approved/rejected,
  delivered/retrying/failed states.
- Never expose group records, receipt URLs, or private account data before the API
  authorization response permits them.
