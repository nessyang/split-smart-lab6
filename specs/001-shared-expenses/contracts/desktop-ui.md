# Desktop UI Contract

This contract describes the approved Java Swing MVP boundary. Views must call
application services and render returned state; they must not calculate allocations,
approval authorization, balances, or payment limits in event handlers.

## Screens and service operations

| Screen | User action | Application operation | Required result |
|---|---|---|---|
| Account | Register/sign in/reset password | `AccountService` | Verified account session or explained validation error |
| Groups | Create group/add account/designate reviewer | `GroupService` | Updated membership visible only to authorized users |
| Expense entry | Enter details, choose participants/allocation, attach receipt | `ExpenseService.submit` | Pending expense, saved allocations, recipient notifications |
| Review | Approve or reject pending expense | `ExpenseReviewService.decide` | Attributable decision; only approval changes balances |
| Balances | View pairwise debts/due amounts | `BalanceService.summary` | Totals derived from approved expenses minus payments |
| Payments | Record a payer-payee settlement | `PaymentService.record` | Accepted partial payment or explained rejection with no mutation |
| Reports | Select inclusive date range and report type | `ReportService.query` | Authorized matching records, totals, or an empty result |

## Common UI behavior

- All primary actions expose meaningful labels, keyboard focus order, and status text.
- Validation errors identify the rejected field or rule and leave saved state unchanged.
- Pending, approved, rejected, delivered, and failed states are shown with text, not
  color alone.
- Non-members cannot navigate to or receive group details and receipt images.
- A date range with start after end is rejected before query execution.
- The UI displays USD amounts to two decimal places and never uses binary floating
  point formatting for business decisions.

## Authorization contract

The current account is supplied to every application operation. Services enforce
authorization independently of the UI. Organizers manage membership and reviewer
designation; organizers and designated reviewers decide expenses; ordinary members
may submit expenses and view records allowed by group membership.

## Error and persistence contract

An operation either returns a committed result or a typed, user-displayable error.
The UI must not show an expense or payment as completed until the service confirms a
successful commit. Failed notification delivery remains visibly pending or failed and
is never shown as delivered.
