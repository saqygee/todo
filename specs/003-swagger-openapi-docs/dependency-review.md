# Dependency Review: Swagger/OpenAPI Documentation

**Date**: 2026-11-09
**Status**: APPROVED by the user’s “yes” on 2026-11-09. T003/T004 complete. Current installed scope, after the subsequent no-tests direction: swagger-ui-dist@5.34.1 and openapi-types@12.1.3 only; lifecycle scripts disabled. The three-package review below is historical and superseded by the scope-reduction note.

## Proposed Direct Dependencies

| Package | Use | Purpose / existing limitation | Alternatives | License |
|---|---|---|---|---|
| swagger-ui-dist@5.34.1 | Runtime | Local Swagger UI bundle/CSS; Express cannot supply vendor UI assets. | CDN rejected by local/offline preference; custom UI would not be Swagger UI; Express adapter unnecessary. | Apache-2.0 |
| openapi-types@12.1.3 | Development, type-only imports | OpenAPI document types; existing Todo types describe domain records only. | Duplicating OpenAPI interfaces increases maintenance and weakens validation. | MIT |
| @apidevtools/swagger-parser@11.0.0 | Development, tests only | OpenAPI 3.0 document and reference validation; Vitest alone provides assertions rather than a specification validator. | Manual review or handwritten assertions are less comprehensive; remote validation contradicts local delivery. | MIT |

Zod already supplies schema conversion; no conversion package or Swagger Express adapter is proposed. Existing types/schemas remain unchanged. OpenAPI 3.0.3 is chosen for the built-in conversion target and validator compatibility.

## Registry and Runtime Checks

Read npm registry metadata via `npm view` for each exact direct version on 2026-11-09. All three versions exist. Existing runtime is Node 24.4.1 / npm 11.4.2. No direct package declares a conflicting Node engine in the returned metadata. Ref-parser 13.0.1 requires Node >=16 and openapi-schemas 2.1.0 requires >=10. Validator peer requirement openapi-types >=7 is satisfied by 12.1.3. These are metadata checks, not runtime acceptance results.

Direct tarball integrity metadata:

- swagger-ui-dist: `sha512-VSr8fXfI93obYaQicLJbLUKGRxDojj/SfRJDDLCioGTUBj4BK/Nj4eE9jCeCAnJxVLi7iS+08PbiZLyrQKBkJQ==`
- openapi-types: `sha512-N4YtSYJqghVu4iek2ZUvcN/0aqH1kRDuNqzcycDxhOUpg7GdvLa2F3DgS6yBNhInhv2r/6I0Flkn7CqL8+nIcw==`
- swagger-parser: `sha512-eNegfUv6BI0TeqEpwnvWyVaTp70cU7OYxnyw+gICTryMEYCMJF0mnPg+aDiUXKoMkHpxHSiKaNWDs484txyKaA==`

## Transitive Dependencies and Installation Scripts

Registry review identified:

- swagger-ui-dist depends on @scarf/scarf =1.4.0 (Apache-2.0). Scarf has `postinstall: node ./report.js`, an installation-reporting hook. The direct UI package metadata reports no install lifecycle script.
- openapi-types has no runtime dependencies in returned metadata. Its `prepare` script is a development compilation command; registry installation uses its published distribution.
- swagger-parser depends on ajv ^8.17.1, ajv-draft-04 ^1.0.0, call-me-maybe ^1.0.2, @apidevtools/openapi-schemas ^2.1.0, @apidevtools/swagger-methods ^3.0.2 and @apidevtools/json-schema-ref-parser 13.0.1. No install/postinstall hook appears in its registry scripts.
- Metadata inspected for all six immediate validator dependencies. Ref-parser introduces js-yaml and @types/json-schema. Ajv introduces fast-uri, fast-deep-equal, require-from-string and json-schema-traverse. These are test-tool transitive dependencies, not new application integration surfaces. Immediate validator dependencies report MIT licenses. Listed build/test/prepublish/prepare commands are not justification to execute arbitrary lifecycle scripts.

**Installation policy proposed for approval**: use exact direct pins with `npm install --save-exact --ignore-scripts` (and `--save-dev` for test/type tools), with npm audit/funding network calls disabled during install. This suppresses Scarf and all other lifecycle scripts for these additions. Inspect the resulting lockfile, resolved transitive manifests and any engine/audit findings before acceptance; do not run an automatic audit fix or replace approved packages silently. Do not change global npm settings or disable existing Prisma generation commands. Subsequent development checks/build explicitly use the project's existing commands.

Registry ranges are not a complete resolved lockfile review. Full resolved-tree review and installation verification occur after approval; any unexpected install requirement or incompatible version stops for review. No vulnerability-free claim is made from metadata inspection alone.

## Approved Constitutional Amendment

Approved narrow technology-boundary expansion adopted as constitution v1.3.0:

Add under Technology and Scope Constraints:

> API documentation: OpenAPI 3.0.3 and locally served Swagger UI using swagger-ui-dist. Documentation typing and test validation may use openapi-types and @apidevtools/swagger-parser. Reuse existing Zod schemas and TypeScript types; preserve the existing backend layers and application behavior.

Update version, last-amended date and Sync Impact Report on adoption, preserving ratification date. Purpose: permit only the requested documentation surface and supporting type/test tools. No migration or existing task behavior changes. Preserve the v1.2.0 Swagger-only WCAG/Orca exemption and all dependency approval rules. Do not treat this proposal as adopted before the user approves it.

## Approval Scope

Approval will cover the three exact packages and their locked transitive dependencies, script-disabled installation policy, and the narrow v1.3.0 constitutional addition above. It will not approve other packages, architecture changes, authentication, database changes or Swagger accessibility audits. On approval, record the user instruction and complete T003; adoption/installation are T004. Dependency review is ready for approval, not a completed feature.

## User-directed scope reduction — 2026-11-09

The user excluded all Swagger tests and requested removal of already-authored tests. Removed @apidevtools/swagger-parser and its test-only transitive packages using lifecycle-script-disabled uninstall. Remaining approved packages are swagger-ui-dist@5.34.1 and type-only openapi-types@12.1.3. No alternative test dependency is introduced. Constitution v1.4.0 records the narrow testing exception and updated technology boundary. Original review above is historical; it does not authorize creating Swagger tests after this instruction.
