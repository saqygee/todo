#!/usr/bin/env bash
# Install and build the local application using its committed dependency lockfile.
set -euo pipefail

if [[ $# -gt 0 ]]; then
  if [[ $# -eq 1 && ( "$1" == '--help' || "$1" == '-h' ) ]]; then
    printf 'Usage: bash scripts/install.sh\nRequires Node.js 24 and npm. Installs application and Swagger dependencies. Preserves existing .env and database data.\n'
    exit 0
  fi
  printf 'Usage: bash scripts/install.sh\n' >&2
  exit 1
fi

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd -- "$project_dir"

command -v node >/dev/null 2>&1 || { printf 'Install Node.js 24 and npm, then rerun this script.\n' >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { printf 'npm is required. Install it with Node.js 24, then rerun this script.\n' >&2; exit 1; }
if [[ "$(node -p 'process.versions.node.split(".")[0]')" != '24' ]]; then
  printf 'Node.js 24 is required; found %s.\n' "$(node --version)" >&2
  exit 1
fi

printf 'Installing locked dependencies (including Swagger UI, OpenAPI types and build tools)...\n'
# Keep required native dependency installation hooks, but opt out of Swagger's
# transitive Scarf installation reporting.
SCARF_ANALYTICS=false npm ci --include=dev
npm ls --depth=0 swagger-ui-dist openapi-types

if [[ ! -e .env && ! -L .env ]]; then
  # Noclobber also protects a file created while installation was running.
  (umask 077; set -o noclobber; cat .env.example > .env)
  printf 'Created .env from .env.example.\n'
else
  printf 'Keeping existing .env.\n'
fi

printf 'Generating the Prisma client and building the application...\n'
npm run build
printf 'Applying committed database migrations...\n'
npm run db:deploy

printf '\nInstallation complete. Run npm start from %s.\n' "$project_dir"
printf 'Default address: http://127.0.0.1:3000 (or the PORT configured in your environment).\n'
printf 'Swagger: npm run swagger, then open /api/docs/ on the same backend address.\n'
