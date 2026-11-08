# User-Supplied Planning Constraints

These are explicit structural requirements from the feature request, preserved separately from
behavioural acceptance criteria. Apply them during planning without changing the constitution.

## Required Directory Structure

`todo-app/` denotes the application root; assume the existing repository is that root rather than
creating a second nested project. Preserve these paths:

```text
todo-app/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── shared/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── constants/
│   ├── server/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── app.ts
│   │   └── index.ts
│   └── client/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       ├── layouts/
│       ├── utils/
│       ├── types/
│       ├── styles/
│       ├── App.tsx
│       └── main.tsx
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Planning Checks

- Preserve controller, service and repository separation and the shared validation boundary.
- Reconcile the supplied layer directories with constitutional feature-based organisation by
  grouping ToDo-specific modules within the required layers; avoid unnecessary abstractions.
- Respect the approved stack, TDD, version-controlled migrations and dependency approval rules.
- Backend assignment must allocate ordinals safely across overlapping requests and include
  soft-deleted records. Do not add a reordering endpoint or interface.
- Plan UTC ISO 8601 timestamp persistence and frontend local-time presentation explicitly.
- The e2e directory does not authorise installation of any additional test framework.
