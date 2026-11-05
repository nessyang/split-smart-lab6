# SplitSmart Architecture Artifacts

This directory contains the six requested architecture deliverables. These documents
describe the approved Java Swing MVP and the target service boundary needed for the
full web, Android, and iOS product. They do not change the feature requirements or
implement application code.

| Requested artifact | Status | Deliverable |
|---|---|---|
| System context diagram | Added | [system-context.puml](./system-context.puml) |
| Component architecture diagram | Added | [component-architecture.puml](./component-architecture.puml) |
| Database ERD | Added | [database-erd.puml](./database-erd.puml) |
| Deployment architecture diagram | Added | [deployment-architecture.puml](./deployment-architecture.puml) |
| REST API contracts | Added as target contract | [rest-api.md](../contracts/rest-api.md) |
| Security architecture | Added | [security-architecture.puml](./security-architecture.puml) and [security-architecture.md](./security-architecture.md) |

The MVP deployment is local Swing plus a file-backed H2 database. The REST and
multi-client deployment views document the future shared-service boundary; they are
not claims that the MVP delivers web, Android, or iOS clients.
