# Consolidated Traceability Matrix

This matrix maps the original customer themes and clarified rules to consolidated
requirements, Architecture B modules, and verification evidence. No original theme is
removed; implementation details are identified as technical defaults.

| Source requirement/theme | Consolidated requirement | Architecture B module(s) | Verification |
|---|---|---|---|
| User accounts and private access | CR-FR-001, CR-NFR-001 | Identity, security | CR-AC-001; auth/API/security tests |
| Group creation and management | CR-FR-002 | Groups and membership | CR-AC-002; membership integration tests |
| Expense amount/date/description/payer/participants | CR-FR-003 | Expenses and allocation | CR-AC-003; API/domain tests |
| Equal or percentage sharing | CR-FR-004, CR-NFR-002 | Expenses and allocation | Allocation financial test suite |
| Optional receipt image | CR-FR-003, CR-NFR-001 | Receipt storage/access policy | Receipt integration/security tests |
| Expense approval before balances | CR-FR-005, CR-FR-007 | Approval, balances | CR-AC-004; state/authorization tests |
| Single or multiple approval levels | CR-FR-005 | Approval | Single-stage tests; multi-stage open decision |
| Group member notifications | CR-FR-006, CR-NFR-005 | Outbox, notification worker | CR-AC-005; retry/load tests |
| Pairwise balance tracking | CR-FR-007 | Balance and payment | CR-AC-004/006; reconciliation tests |
| Payment tracking and partial payments | CR-FR-008 | Balance and payment | CR-AC-006; API/concurrency tests |
| Overpayment rejection | CR-FR-008, CR-NFR-004 | Payment transaction policy | Concurrent overpayment test |
| Expense/balance/payment reporting | CR-FR-009, CR-NFR-003 | Reporting | CR-AC-007; filter/performance tests |
| Web, Android, iOS support | CR-FR-010, CR-NFR-006 | API plus three clients | CR-AC-008; cross-platform suite |
| Audit/history | CR-FR-011, CR-NFR-008 | Audit | CR-AC-009; audit integrity tests |
| Access control/privacy | CR-NFR-001 | Identity, policy, all modules | Security test suite |
| Exact currency reconciliation | CR-NFR-002 | Allocation, payment, database | Financial calculation tests |
| Save failure behavior | CR-NFR-004 | Transaction boundary, outbox | Rollback/integration tests |
| Accessibility | CR-NFR-007 | Web/Android/iOS UI | Accessibility audits and UI tests |
| Performance target | CR-NFR-003 | Reporting, PostgreSQL indexes | 5,000-record load test |
| Audit/notification observability | CR-NFR-008 | Audit, outbox, monitoring | Operational telemetry tests |

## Source and architecture provenance

- `UserRequirement.md` supplies the customer capability and platform themes.
- Architecture A supplies the clarified business rules, acceptance scenarios,
  `BigDecimal`/JUnit/traceability principles, and validation cases.
- Architecture B supplies the web-first modular backend, PostgreSQL, client targets,
  object storage, cloud deployment, REST boundary, and security direction.
- This consolidation adds only explicitly labeled technical defaults and design
  proposals needed to make the selected architecture operationally coherent.
