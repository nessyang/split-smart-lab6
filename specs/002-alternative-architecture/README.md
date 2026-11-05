# Architecture B: Web-First Modular Service

Architecture B is an alternative to the Java Swing/local-storage Architecture A. It
is a web-first modular monolith with a versioned REST API, browser/Android/iOS
clients, shared PostgreSQL persistence, receipt object storage, and asynchronous
in-app notification delivery. This is documentation only; no application code is
introduced here.

| Deliverable | File |
|---|---|
| System context | [system-context.puml](./architecture/system-context.puml) |
| Component architecture | [component-architecture.puml](./architecture/component-architecture.puml) |
| Database ERD | [database-erd.puml](./architecture/database-erd.puml) |
| Deployment architecture | [deployment-architecture.puml](./architecture/deployment-architecture.puml) |
| REST API contracts | [rest-api.md](./contracts/rest-api.md) |
| Security architecture | [security-architecture.puml](./architecture/security-architecture.puml) and [security-architecture.md](./architecture/security-architecture.md) |

Architecture B favors one deployable modular backend over microservices. It keeps
expense, approval, payment, and balance transactions simple while allowing all
supported clients to share one authorization and consistency model. It does not
change the existing requirements or Architecture A.
