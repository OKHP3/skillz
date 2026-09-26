# Technology Inventory

Audited 2026-09-18 America/Chicago (2026-09-19 UTC). Repository baseline:
`957167d7f2e8ad54cba9c6ebd83dd0f08694143c`.

## Scope and evidence

This audit covers all 33 active package manifests, the workspace catalog and overrides,
the complete pnpm lock graph, every requirements file, Python source imports, actual
GitHub Actions, runtime configuration, and the four application artifacts plus shared
libraries. Executable standalone skill utilities are included; archived scaffold manifests
and technology names mentioned only in instructional prose are excluded from application
upgrade decisions. The JSON ledger lists excluded archive paths and internal workspace links.

**Confirmed:** the Windows checkout and GitHub main matched the baseline. Replit's shell
reported the same commit and no uncommitted files. Local and Replit runtime versions were
read independently; neither establishes the versions in an existing deployed container.
**Unknown:** deployed Replit runtime and database server versions, installed standalone
Python packages, and exact hosted runner tool patches without a run-specific image manifest.
The Replit connector required reauthentication, but its existing browser shell was readable.

Declared ranges such as `^7.3.2` are not installed versions. The actual Vite lock resolution
is `7.3.6`. Python requirements are mostly minimums without a lock; their precise installed
versions cannot be reconstructed from those minimums. A package in a devDependencies section
can still be bundled into the frontend, so that label is not used to exclude runtime UI code.

## Main application stack

| Technology | In-place declaration / locked version | Latest stable verified | Decision |
| --- | --- | --- | --- |
| TypeScript | `~5.9.3` / 5.9.3 | 7.0.2 | Compiler migration and typecheck review |
| Vite | catalog `^7.3.2` / 7.3.6 | 8.3.0 | Build-tool migration with plugin and browser validation |
| React and React DOM | catalog exact 19.1.0 / 19.1.0 | 19.3.0 | Update together; investigate retained Expo constraint comment |
| Tailwind CSS and Vite plugin | catalog `^4.1.14` / 4.3.3 | 4.3.3 | Current |
| Vitest | `^3.2.0` / 3.2.7 | 5.0.1 | Coordinate with Vite migration |
| Playwright | `^1.55.0` / 1.62.1 | 1.63.0 | Update library and its browser binaries together |
| Express | `^5.2.1` / 5.2.1 | 5.2.1 | Current |
| Drizzle ORM | catalog `^0.45.2` / 0.45.2 | 0.45.2 | Current; database migrations remain separately reviewed |
| Zod | catalog `^3.25.76` / 3.25.76 | 4.6.5 | Schema/code generation and resolver migration |

These summary values are the initial audit snapshot. The generated tables below are the
refreshable authority, with an official registry/release link for every entry. They also
cover Radix UI, TanStack Query, React Router, Wouter, Framer Motion, Lucide, Recharts,
React Hook Form, date utilities, Pino, PostgreSQL drivers, Orval, esbuild, Rollup, Prettier,
Replit SDK/plugins, Mermaid CLI, SDKs, type packages, and all transitive libraries.

## Runtimes and host-provided technologies

Observed host versions are a dated snapshot, not automatically collected by GitHub Actions.
No workstation, Replit module, database, or deployment was upgraded during this audit.

| Technology | In place / evidence | Latest stable or channel | Maintenance boundary |
| --- | --- | --- | --- |
| Node.js | CI pin 24.19.0; Windows 24.11.1; Replit 24.13.0; `.replit` nodejs-24 | 26.9.0 Current; 24.21.0 LTS ([Node](https://nodejs.org/dist/index.json)) | Track approved LTS major through tested PRs; align each host after acceptance |
| Python | CI pin 3.14.7; Windows launcher 3.14.0rc1; Replit 3.13.11; module python-base-3.13 | 3.14.7; 3.13 line 3.13.15 ([Python](https://www.python.org/downloads/)) | CI patch proposals within minor; replace local prerelease and reconcile Replit separately |
| pnpm | CI formerly floating 10; now pinned 10.26.1 to match observed Replit; Windows 11.19.0 | 12.4.2; tracked 10.x latest 10.34.5 ([npm registry](https://registry.npmjs.org/pnpm)) | Same-major pin proposals; pnpm 11/12 migration requires lock/catalog and Dependabot support review |
| npm | Replit 11.6.2; standalone Mermaid installer; not the workspace manager | 12.0.2 ([npm registry](https://registry.npmjs.org/npm)) | Follow Node distribution or reviewed standalone tooling |
| Bash | Replit 5.2.37(1); shell scripts and Actions; Windows default shell lacks `sh` on PATH | 5.3 release series ([GNU](https://www.gnu.org/software/bash/)) | OS/distribution patch level, not npm; do not replace host shells from CI |
| PowerShell | Windows 7.6.5, local administration only | 7.6.6 ([Microsoft](https://github.com/PowerShell/PowerShell/releases/tag/v7.6.6)) | Workstation update |
| Git | Windows 2.55.0.windows.5; Replit 2.50.1 | upstream 2.55.0 ([Git](https://git-scm.com/)) | Host-specific distribution updates |
| GitHub CLI | Windows 2.96.0; workflow-provided gh for integration tools | 2.101.0 ([GitHub CLI](https://github.com/cli/cli/releases/tag/v2.101.0)) | Host tools; verify before running administrative scripts |
| Go | Runner-provided, no exact runtime pin; installs actionlint | 1.27.1 ([Go](https://go.dev/dl/)) | Pin when tool compatibility requires it; actionlint itself is inventoried below |
| PostgreSQL / SQL | `lib/db` declares PostgreSQL; Replit psql client 16.10; server UNKNOWN | 18.6 latest; 16.15 latest in 16.x ([PostgreSQL](https://www.postgresql.org/support/versioning/)) | Read server version before planning; backup and migration rehearsal before major updates |
| Chromium | Replit Nix package and Playwright test browser; actual browser build UNKNOWN | Linux Stable 153.0.8010.52 ([Chromium release API](https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=1)) | Playwright uses its matching browser revision; Nix Chromium follows host channel |
| Nix package channel | `.replit`: stable-25_05 | NixOS 26.05 upstream ([release](https://nixos.org/blog/announcements/2026/nixos-2605/)) | Upstream availability does not prove a supported Replit module/channel; verify in Replit |
| Ubuntu runner image | GitHub Actions `ubuntu-latest`; exact image patch varies by run | Rolling hosted image ([image manifests](https://github.com/actions/runner-images)) | Record image manifest in run logs; provider-managed |

## Languages, formats, services and contracts

| Technology | In-place evidence | Current specification / version model | Update handling |
| --- | --- | --- | --- |
| JavaScript / ECMAScript | ESM/CJS; TypeScript target and lib ES2022 in tsconfig.base.json | ECMAScript 2026, edition 17 ([Ecma](https://ecma-international.org/publications-and-standards/standards/ecma-262/)) | Language target follows browser/runtime support, not automatic yearly target changes |
| HTML / CSS / SVG | Three frontend entry documents, styles and icons | HTML Living Standard; CSS module-specific; SVG renderer support ([WHATWG](https://html.spec.whatwg.org/), [W3C CSS](https://www.w3.org/Style/CSS/)) | Browser tests, accessibility and visual review |
| Markdown / GFM | SKILL.md, docs, catalog content; no explicit dialect pin | CommonMark 0.31.2 ([spec](https://spec.commonmark.org/)); GitHub extensions vary | Validate rendered documents and links |
| YAML | Workflows, catalogs, fixtures; no repository dialect pin | 1.2.2 ([spec](https://yaml.org/spec/1.2.2/)) | Parser versions in package table; preserve Actions-specific semantics |
| JSON / JSON Schema | Manifests, generated data and schema fixtures; schema dialects declared per file | JSON [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259); JSON Schema [2020-12](https://json-schema.org/specification), with dialect declared per `$schema` | Preserve each declared dialect and validate fixtures |
| TOML | `.replit`; no specification version declared | 1.1.0; interpreted by Replit ([TOML](https://toml.io/en/)) | Replit compatibility review |
| OpenAPI | `lib/api-spec/openapi.yaml` 3.1.0 | 3.2.1 ([OpenAPI](https://spec.openapis.org/oas/v3.2.1.html)) | Review Orval and schema generator support before migration |
| Mermaid | `.mmd`, diagram utilities; CLI exact 11.16.0 | Engine follows Mermaid/CLI releases | Update CLI, then parse/render representative fixtures |
| Agent Skills / SKILL.md | Repository delegation contracts; package versions are not platform versions | Living compatibility contract ([Agent Skills](https://agentskills.io/specification)) | Revalidate host behavior and package structural contracts |
| GitHub Actions / Pages / Dependabot | `.github/workflows`, Pages publication, dependency PRs | Hosted services, no installable service version | Actions themselves use SHA pins and are listed below |
| Replit | Four artifacts, host modules, integrations, autoscale configuration | Hosted service, no repository-controlled product version | Module, build, connector and deployment checks are separate |
| Google Fonts | Frontend HTML loads named font families via CSS API | Provider-managed responses; no pinned font binary versions | Check availability and rendering; self-hosting would be a separate change |
| Google Analytics 4 / gtag | Forge entry document loads gtag.js | Provider-managed script; no exact version exposed | Preserve existing configuration; verify analytics behavior after UI changes |

The SQL Server reconciliation utility also imports **pandas, PyArrow, and mssql-python**
without a requirements file. They appear below as unversioned imports with current upstream
versions. SQL Server itself is a runtime-supplied external target of that portable skill,
not an established Skillz database deployment. No target server was accessed.

## Refreshable package inventory

The script sends only public package names to official npm/PyPI registries, Node/Python
release endpoints, and GitHub release/tag APIs. No repository content is uploaded. A stable
npm `latest` tag is used rather than the highest arbitrary tag; PyPI excludes prereleases
and fully yanked releases. `gensync` currently has no stable release, and is reported as
such rather than inventing one. The JSON records input hashes normalized for line endings.

<!-- technology-latest:start -->
Last successful verification: 2026-09-26 (UTC).

Coverage: **113 direct, catalog, script, CI and tool entries**, **390 additional transitive package names**, **499 lockfile package/version entries**, **33 active package manifests**.

All npm lockfile entries are inventoried, including optional platform packages. Resolution does not prove installation or runtime use. Python requirements and action SHAs are declarations, not installed version claims.

### CI runtime pins

| Technology | In place | Latest stable | Bounded update target | Source |
| --- | --- | --- | --- | --- |
| Node.js | 24.21.0 | 26.10.0; LTS 24.21.0 | 24.21.0 | [official releases](https://nodejs.org/dist/index.json) |
| Python | 3.14.7 | 3.14.7 | 3.14.7 | [official releases](https://www.python.org/downloads/) |

### Direct dependencies, scripts, CI and tools

| Technology | Declared | Locked / referenced | Latest stable | Assessment |
| --- | --- | --- | --- | --- |
| github / OKHP3/skillz-shield | 1a5cb2aa14c46506526e58fccb024772162d0cc9 | SHA (release name unresolved) | [1.0.2](https://github.com/OKHP3/skillz-shield/releases/tag/v1.0.2) | Dependabot SHA update; review release |
| github / actions/cache | 55cc8345863c7cc4c66a329aec7e433d2d1c52a9 | v6, v6.1.0 | [6.1.0](https://github.com/actions/cache/releases/tag/v6.1.0) | current release |
| github / actions/checkout | 3d3c42e5aac5ba805825da76410c181273ba90b1 | v7, v7.0.1 | [7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | current release |
| github / actions/deploy-pages | 368f82528645a54fb793d4d04e342629a3f51346 | v5, v5.0.1 | [5.0.1](https://github.com/actions/deploy-pages/releases/tag/v5.0.1) | current release |
| github / actions/setup-node | 820762786026740c76f36085b0efc47a31fe5020 | v7, v7.0.0 | [7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0) | current release |
| github / actions/setup-python | 5fda3b95a4ea91299a34e894583c3862153e4b97 | v7, v7.0.0 | [7.0.0](https://github.com/actions/setup-python/releases/tag/v7.0.0) | current release |
| github / actions/upload-artifact | ea165f8d65b6e75b540449e92b4886f43607fa02 | v4, v4.6.2 | [7.0.1](https://github.com/actions/upload-artifact/releases/tag/v7.0.1) | Dependabot SHA update; review release |
| github / actions/upload-pages-artifact | fc324d3547104276b827a68afc52ff2a11cc49c9 | v5, v5.0.0 | [5.0.0](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0) | current release |
| github / peter-evans/create-pull-request | 5f6978faf089d4d20b00c7766989d076bb2fc7f1 | v8, v8.1.1 | [8.1.1](https://github.com/peter-evans/create-pull-request/releases/tag/v8.1.1) | current release |
| github / pnpm/action-setup | ea17c68df8912ef543352723c149a84f56e3d413 | v6.1.0 | [6.1.0](https://github.com/pnpm/action-setup/releases/tag/v6.1.0) | current release |
| github / rhysd/actionlint | v1.7.7 | v1.7.7 | [1.7.12](https://github.com/rhysd/actionlint/releases/tag/v1.7.12) | manual tool-pin PR; not managed by Dependabot |
| npm / @hookform/resolvers | ^5.9.1 | 5.9.1 | [5.9.1](https://registry.npmjs.org/%40hookform%2Fresolvers) | current |
| npm / @mermaid-js/mermaid-cli | 11.17.0 | not locked | [12.0.0](https://registry.npmjs.org/%40mermaid-js%2Fmermaid-cli) | declared only; installed version unknown |
| npm / @radix-ui/react-accordion | ^1.2.20; ^1.2.4 | 1.2.20 | [1.2.20](https://registry.npmjs.org/%40radix-ui%2Freact-accordion) | current |
| npm / @radix-ui/react-alert-dialog | ^1.1.23; ^1.1.7 | 1.1.23 | [1.1.23](https://registry.npmjs.org/%40radix-ui%2Freact-alert-dialog) | current |
| npm / @radix-ui/react-aspect-ratio | ^1.1.15; ^1.1.3 | 1.1.15 | [1.1.15](https://registry.npmjs.org/%40radix-ui%2Freact-aspect-ratio) | current |
| npm / @radix-ui/react-avatar | ^1.1.4; ^1.2.6 | 1.2.6 | [1.2.6](https://registry.npmjs.org/%40radix-ui%2Freact-avatar) | current |
| npm / @radix-ui/react-checkbox | ^1.1.5; ^1.3.11 | 1.3.11 | [1.3.11](https://registry.npmjs.org/%40radix-ui%2Freact-checkbox) | current |
| npm / @radix-ui/react-collapsible | ^1.1.20; ^1.1.4 | 1.1.20 | [1.1.20](https://registry.npmjs.org/%40radix-ui%2Freact-collapsible) | current |
| npm / @radix-ui/react-context-menu | ^2.2.7; ^2.3.7 | 2.3.7 | [2.3.7](https://registry.npmjs.org/%40radix-ui%2Freact-context-menu) | current |
| npm / @radix-ui/react-dialog | ^1.1.23; ^1.1.7 | 1.1.23 | [1.1.23](https://registry.npmjs.org/%40radix-ui%2Freact-dialog) | current |
| npm / @radix-ui/react-dropdown-menu | ^2.1.24; ^2.1.7 | 2.1.24 | [2.1.24](https://registry.npmjs.org/%40radix-ui%2Freact-dropdown-menu) | current |
| npm / @radix-ui/react-hover-card | ^1.1.23; ^1.1.7 | 1.1.23 | [1.1.23](https://registry.npmjs.org/%40radix-ui%2Freact-hover-card) | current |
| npm / @radix-ui/react-label | ^2.1.15; ^2.1.3 | 2.1.15 | [2.1.15](https://registry.npmjs.org/%40radix-ui%2Freact-label) | current |
| npm / @radix-ui/react-menubar | ^1.1.24; ^1.1.7 | 1.1.24 | [1.1.24](https://registry.npmjs.org/%40radix-ui%2Freact-menubar) | current |
| npm / @radix-ui/react-navigation-menu | ^1.2.22; ^1.2.6 | 1.2.22 | [1.2.22](https://registry.npmjs.org/%40radix-ui%2Freact-navigation-menu) | current |
| npm / @radix-ui/react-popover | ^1.1.23; ^1.1.7 | 1.1.23 | [1.1.23](https://registry.npmjs.org/%40radix-ui%2Freact-popover) | current |
| npm / @radix-ui/react-progress | ^1.1.16; ^1.1.3 | 1.1.16 | [1.1.16](https://registry.npmjs.org/%40radix-ui%2Freact-progress) | current |
| npm / @radix-ui/react-radio-group | ^1.2.4; ^1.4.7 | 1.4.7 | [1.4.7](https://registry.npmjs.org/%40radix-ui%2Freact-radio-group) | current |
| npm / @radix-ui/react-scroll-area | ^1.2.18; ^1.2.4 | 1.2.18 | [1.2.18](https://registry.npmjs.org/%40radix-ui%2Freact-scroll-area) | current |
| npm / @radix-ui/react-select | ^2.1.7; ^2.3.7 | 2.3.7 | [2.3.7](https://registry.npmjs.org/%40radix-ui%2Freact-select) | current |
| npm / @radix-ui/react-separator | ^1.1.15; ^1.1.3 | 1.1.15 | [1.1.15](https://registry.npmjs.org/%40radix-ui%2Freact-separator) | current |
| npm / @radix-ui/react-slider | ^1.2.4; ^1.4.7 | 1.4.7 | [1.4.7](https://registry.npmjs.org/%40radix-ui%2Freact-slider) | current |
| npm / @radix-ui/react-slot | ^1.2.0; ^1.3.3 | 1.3.3 | [1.3.3](https://registry.npmjs.org/%40radix-ui%2Freact-slot) | current |
| npm / @radix-ui/react-switch | ^1.1.4; ^1.3.7 | 1.3.7 | [1.3.7](https://registry.npmjs.org/%40radix-ui%2Freact-switch) | current |
| npm / @radix-ui/react-tabs | ^1.1.21; ^1.1.4 | 1.1.21 | [1.1.21](https://registry.npmjs.org/%40radix-ui%2Freact-tabs) | current |
| npm / @radix-ui/react-toast | ^1.2.23; ^1.2.7 | 1.2.23 | [1.2.23](https://registry.npmjs.org/%40radix-ui%2Freact-toast) | current |
| npm / @radix-ui/react-toggle | ^1.1.18; ^1.1.3 | 1.1.18 | [1.1.18](https://registry.npmjs.org/%40radix-ui%2Freact-toggle) | current |
| npm / @radix-ui/react-toggle-group | ^1.1.19; ^1.1.3 | 1.1.19 | [1.1.19](https://registry.npmjs.org/%40radix-ui%2Freact-toggle-group) | current |
| npm / @radix-ui/react-tooltip | ^1.2.0; ^1.2.16 | 1.2.16 | [1.2.16](https://registry.npmjs.org/%40radix-ui%2Freact-tooltip) | current |
| npm / @replit/connectors-sdk | ^0.4.3 | 0.4.3 | [0.4.3](https://registry.npmjs.org/%40replit%2Fconnectors-sdk) | current |
| npm / @replit/vite-plugin-cartographer | ^0.6.1 | 0.6.1 | [0.6.1](https://registry.npmjs.org/%40replit%2Fvite-plugin-cartographer) | current |
| npm / @replit/vite-plugin-dev-banner | ^0.1.1 | 0.1.2 | [0.1.2](https://registry.npmjs.org/%40replit%2Fvite-plugin-dev-banner) | current |
| npm / @replit/vite-plugin-runtime-error-modal | ^0.0.6 | 0.0.6 | [0.0.6](https://registry.npmjs.org/%40replit%2Fvite-plugin-runtime-error-modal) | current |
| npm / @tailwindcss/typography | ^0.5.15 | 0.5.20 | [0.5.20](https://registry.npmjs.org/%40tailwindcss%2Ftypography) | current |
| npm / @tailwindcss/vite | ^4.1.14 | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Fvite) | current |
| npm / @tanstack/react-query | ^5.103.2 | 5.103.2 | [5.104.0](https://registry.npmjs.org/%40tanstack%2Freact-query) | update available |
| npm / @types/cookie-parser | ^1.4.10 | 1.4.10 | [1.4.10](https://registry.npmjs.org/%40types%2Fcookie-parser) | current |
| npm / @types/cors | ^2.8.19 | 2.8.19 | [2.8.19](https://registry.npmjs.org/%40types%2Fcors) | current |
| npm / @types/express | ^5.0.6 | 5.0.6 | [5.0.6](https://registry.npmjs.org/%40types%2Fexpress) | current |
| npm / @types/node | ^26.6.1 | 26.6.2 | [26.6.3](https://registry.npmjs.org/%40types%2Fnode) | update available |
| npm / @types/pg | ^8.23.1 | 8.23.1 | [8.23.1](https://registry.npmjs.org/%40types%2Fpg) | current |
| npm / @types/react | ^19.3.0 | 19.3.0 | [19.3.0](https://registry.npmjs.org/%40types%2Freact) | current |
| npm / @types/react-dom | ^19.3.0 | 19.3.0 | [19.3.0](https://registry.npmjs.org/%40types%2Freact-dom) | current |
| npm / @vitejs/plugin-react | ^5.0.4 | 5.2.0 | [6.1.1](https://registry.npmjs.org/%40vitejs%2Fplugin-react) | major upgrade review |
| npm / chokidar | ^5.0.0 | 5.0.0 | [5.0.0](https://registry.npmjs.org/chokidar) | current |
| npm / class-variance-authority | ^0.7.1 | 0.7.1 | [0.7.1](https://registry.npmjs.org/class-variance-authority) | current |
| npm / clsx | ^2.1.1 | 2.1.1 | [2.1.1](https://registry.npmjs.org/clsx) | current |
| npm / cmdk | ^1.1.1 | 1.1.1 | [1.1.1](https://registry.npmjs.org/cmdk) | current |
| npm / cookie-parser | ^1.4.7 | 1.4.7 | [1.4.7](https://registry.npmjs.org/cookie-parser) | current |
| npm / cors | ^2.8.6 | 2.8.6 | [2.8.6](https://registry.npmjs.org/cors) | current |
| npm / date-fns | ^4.4.0 | 4.4.0 | [4.4.0](https://registry.npmjs.org/date-fns) | current |
| npm / drizzle-kit | ^0.31.11 | 0.31.11 | [0.31.11](https://registry.npmjs.org/drizzle-kit) | current |
| npm / drizzle-orm | ^0.45.3 | 0.45.3 | [0.45.3](https://registry.npmjs.org/drizzle-orm) | current |
| npm / drizzle-zod | ^0.8.3 | 0.8.3 | [0.8.3](https://registry.npmjs.org/drizzle-zod) | current |
| npm / embla-carousel-react | ^8.6.0 | 8.6.0 | [8.6.0](https://registry.npmjs.org/embla-carousel-react) | current |
| npm / esbuild | 0.28.2 | 0.28.2 | [0.28.2](https://registry.npmjs.org/esbuild) | current |
| npm / esbuild-plugin-pino | ^2.3.3 | 2.3.3 | [2.3.3](https://registry.npmjs.org/esbuild-plugin-pino) | current |
| npm / express | ^5.2.1 | 5.2.1 | [5.2.1](https://registry.npmjs.org/express) | current |
| npm / fast-glob | ^3.3.3 | 3.3.3 | [3.3.3](https://registry.npmjs.org/fast-glob) | current |
| npm / framer-motion | ^13.4.1 | 13.4.1 | [13.4.4](https://registry.npmjs.org/framer-motion) | update available |
| npm / fuse.js | ^7.5.0 | 7.5.0 | [7.5.0](https://registry.npmjs.org/fuse.js) | current |
| npm / input-otp | ^1.5.0 | 1.5.0 | [1.5.0](https://registry.npmjs.org/input-otp) | current |
| npm / lucide-react | ^1.47.0 | 1.47.0 | [1.48.0](https://registry.npmjs.org/lucide-react) | update available |
| npm / next-themes | ^0.4.6 | 0.4.6 | [0.4.6](https://registry.npmjs.org/next-themes) | current |
| npm / npm | transitive | not locked | [12.1.0](https://registry.npmjs.org/npm) | declared only; installed version unknown |
| npm / orval | ^8.37.0 | 8.37.0 | [8.37.0](https://registry.npmjs.org/orval) | current |
| npm / pg | ^8.23.0 | 8.23.0 | [8.23.0](https://registry.npmjs.org/pg) | current |
| npm / pino | ^9.14.0 | 9.14.0 | [10.3.1](https://registry.npmjs.org/pino) | major upgrade review |
| npm / pino-http | ^10.5.0 | 10.5.0 | [11.0.0](https://registry.npmjs.org/pino-http) | major upgrade review |
| npm / pino-pretty | ^13.1.3 | 13.1.3 | [13.1.3](https://registry.npmjs.org/pino-pretty) | current |
| npm / playwright | ^1.63.0 | 1.63.0 | [1.63.0](https://registry.npmjs.org/playwright) | current |
| npm / pnpm | pnpm@10.26.1 | not locked | [12.6.0](https://registry.npmjs.org/pnpm) | track 10.x (10.34.5); latest major requires migration |
| npm / prettier | ^3.9.9 | 3.9.9 | [3.9.9](https://registry.npmjs.org/prettier) | current |
| npm / react | 19.3.0; >=18 | 19.3.0 | [19.3.0](https://registry.npmjs.org/react) | current |
| npm / react-day-picker | ^10.0.1 | 10.0.1 | [10.0.1](https://registry.npmjs.org/react-day-picker) | current |
| npm / react-dom | 19.3.0 | 19.3.0 | [19.3.0](https://registry.npmjs.org/react-dom) | current |
| npm / react-hook-form | ^7.88.0 | 7.88.0 | [7.89.0](https://registry.npmjs.org/react-hook-form) | update available |
| npm / react-icons | ^5.4.0 | 5.7.0 | [5.7.0](https://registry.npmjs.org/react-icons) | current |
| npm / react-is | 19.3.0 | 19.3.0 | [19.3.0](https://registry.npmjs.org/react-is) | current |
| npm / react-resizable-panels | ^2.1.7; ^2.1.9 | 2.1.9 | [4.13.3](https://registry.npmjs.org/react-resizable-panels) | major upgrade review |
| npm / react-router-dom | ^7.18.4 | 7.18.4 | [7.18.4](https://registry.npmjs.org/react-router-dom) | current |
| npm / recharts | ^3.10.1 | 3.10.1 | [3.10.1](https://registry.npmjs.org/recharts) | current |
| npm / sonner | ^2.0.8 | 2.0.8 | [2.0.8](https://registry.npmjs.org/sonner) | current |
| npm / tailwind-merge | ^3.7.0 | 3.7.0 | [3.7.0](https://registry.npmjs.org/tailwind-merge) | current |
| npm / tailwindcss | ^4.1.14 | 4.3.3 | [4.3.3](https://registry.npmjs.org/tailwindcss) | current |
| npm / tailwindcss-animate | ^1.0.7 | 1.0.7 | [1.0.7](https://registry.npmjs.org/tailwindcss-animate) | current |
| npm / thread-stream | 4.2.0 | 3.1.0, 4.2.0 | [4.2.0](https://registry.npmjs.org/thread-stream) | major upgrade review |
| npm / tsx | ^4.21.0; ^4.23.15 | 4.23.15 | [4.23.15](https://registry.npmjs.org/tsx) | current |
| npm / tw-animate-css | ^1.4.0 | 1.4.0 | [1.4.0](https://registry.npmjs.org/tw-animate-css) | current |
| npm / typescript | ~6.0.3 | 6.0.3 | [7.0.2](https://registry.npmjs.org/typescript) | major upgrade review |
| npm / vaul | ^1.1.2 | 1.1.2 | [1.1.2](https://registry.npmjs.org/vaul) | current |
| npm / vite | ^8.3.0 | 8.3.0 | [8.3.1](https://registry.npmjs.org/vite) | update available |
| npm / vitest | ^5.0.1 | 5.0.1 | [5.0.2](https://registry.npmjs.org/vitest) | update available |
| npm / wouter | ^3.11.0 | 3.11.0 | [3.11.0](https://registry.npmjs.org/wouter) | current |
| npm / zod | ^4.6.5 | 4.6.5 | [4.6.5](https://registry.npmjs.org/zod) | current |
| pypi / PyYAML | ==6.0.3; >=6.0.3; unversioned import | not locked | [6.0.3](https://pypi.org/pypi/PyYAML/json) | declared only; installed version unknown |
| pypi / anthropic | >=1.6.0; unversioned import | not locked | [1.8.0](https://pypi.org/pypi/anthropic/json) | declared only; installed version unknown |
| pypi / mcp | >=2.2.0; unversioned import | not locked | [2.2.0](https://pypi.org/pypi/mcp/json) | declared only; installed version unknown |
| pypi / mssql-python | unversioned import | not locked | [1.15.0](https://pypi.org/pypi/mssql-python/json) | declared only; installed version unknown |
| pypi / packaging | ==26.3; unversioned import | not locked | [26.3](https://pypi.org/pypi/packaging/json) | declared only; installed version unknown |
| pypi / pandas | unversioned import | not locked | [3.0.6](https://pypi.org/pypi/pandas/json) | declared only; installed version unknown |
| pypi / pyarrow | unversioned import | not locked | [25.0.1](https://pypi.org/pypi/pyarrow/json) | declared only; installed version unknown |

### Transitive dependency appendix

| Technology | Declared | Locked / referenced | Latest stable | Assessment |
| --- | --- | --- | --- | --- |
| npm / @babel/code-frame | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Fcode-frame) | major upgrade review |
| npm / @babel/compat-data | transitive | 7.29.7 | [8.0.5](https://registry.npmjs.org/%40babel%2Fcompat-data) | major upgrade review |
| npm / @babel/core | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Fcore) | major upgrade review |
| npm / @babel/generator | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Fgenerator) | major upgrade review |
| npm / @babel/helper-compilation-targets | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Fhelper-compilation-targets) | major upgrade review |
| npm / @babel/helper-globals | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Fhelper-globals) | major upgrade review |
| npm / @babel/helper-module-imports | transitive | 7.29.7 | [8.0.0](https://registry.npmjs.org/%40babel%2Fhelper-module-imports) | major upgrade review |
| npm / @babel/helper-module-transforms | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Fhelper-module-transforms) | major upgrade review |
| npm / @babel/helper-plugin-utils | transitive | 7.29.7 | [8.0.1](https://registry.npmjs.org/%40babel%2Fhelper-plugin-utils) | major upgrade review |
| npm / @babel/helper-string-parser | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Fhelper-string-parser) | major upgrade review |
| npm / @babel/helper-validator-identifier | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Fhelper-validator-identifier) | major upgrade review |
| npm / @babel/helper-validator-option | transitive | 7.29.7 | [8.0.0](https://registry.npmjs.org/%40babel%2Fhelper-validator-option) | major upgrade review |
| npm / @babel/helpers | transitive | 7.29.7 | [8.0.5](https://registry.npmjs.org/%40babel%2Fhelpers) | major upgrade review |
| npm / @babel/parser | transitive | 7.29.7 | [7.29.9](https://registry.npmjs.org/%40babel%2Fparser) | update available |
| npm / @babel/plugin-transform-react-jsx-self | transitive | 7.29.7 | [7.29.7](https://registry.npmjs.org/%40babel%2Fplugin-transform-react-jsx-self) | current |
| npm / @babel/plugin-transform-react-jsx-source | transitive | 7.29.7 | [7.29.7](https://registry.npmjs.org/%40babel%2Fplugin-transform-react-jsx-source) | current |
| npm / @babel/template | transitive | 7.29.7 | [8.0.0](https://registry.npmjs.org/%40babel%2Ftemplate) | major upgrade review |
| npm / @babel/traverse | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Ftraverse) | major upgrade review |
| npm / @babel/types | transitive | 7.29.7 | [8.0.6](https://registry.npmjs.org/%40babel%2Ftypes) | major upgrade review |
| npm / @commander-js/extra-typings | transitive | 15.0.0 | [15.0.0](https://registry.npmjs.org/%40commander-js%2Fextra-typings) | current |
| npm / @date-fns/tz | transitive | 1.5.0 | [1.5.0](https://registry.npmjs.org/%40date-fns%2Ftz) | current |
| npm / @drizzle-team/brocli | transitive | 0.10.2 | [0.12.1](https://registry.npmjs.org/%40drizzle-team%2Fbrocli) | update available |
| npm / @esbuild/linux-x64 | transitive | 0.28.2 | [0.28.2](https://registry.npmjs.org/%40esbuild%2Flinux-x64) | current |
| npm / @floating-ui/core | transitive | 1.8.0 | [1.8.0](https://registry.npmjs.org/%40floating-ui%2Fcore) | current |
| npm / @floating-ui/dom | transitive | 1.8.0 | [1.8.0](https://registry.npmjs.org/%40floating-ui%2Fdom) | current |
| npm / @floating-ui/react-dom | transitive | 2.1.9 | [2.1.9](https://registry.npmjs.org/%40floating-ui%2Freact-dom) | current |
| npm / @floating-ui/utils | transitive | 0.2.12 | [0.2.12](https://registry.npmjs.org/%40floating-ui%2Futils) | current |
| npm / @jridgewell/gen-mapping | transitive | 0.3.13 | [0.3.13](https://registry.npmjs.org/%40jridgewell%2Fgen-mapping) | current |
| npm / @jridgewell/remapping | transitive | 2.3.5 | [2.3.5](https://registry.npmjs.org/%40jridgewell%2Fremapping) | current |
| npm / @jridgewell/resolve-uri | transitive | 3.1.2 | [3.1.2](https://registry.npmjs.org/%40jridgewell%2Fresolve-uri) | current |
| npm / @jridgewell/sourcemap-codec | transitive | 1.5.5, 1.6.0 | [1.6.0](https://registry.npmjs.org/%40jridgewell%2Fsourcemap-codec) | update available |
| npm / @jridgewell/trace-mapping | transitive | 0.3.31 | [0.3.31](https://registry.npmjs.org/%40jridgewell%2Ftrace-mapping) | current |
| npm / @nodelib/fs.scandir | transitive | 2.1.5 | [4.0.1](https://registry.npmjs.org/%40nodelib%2Ffs.scandir) | major upgrade review |
| npm / @nodelib/fs.stat | transitive | 2.0.5 | [4.0.0](https://registry.npmjs.org/%40nodelib%2Ffs.stat) | major upgrade review |
| npm / @nodelib/fs.walk | transitive | 1.2.8 | [3.0.1](https://registry.npmjs.org/%40nodelib%2Ffs.walk) | major upgrade review |
| npm / @orval/angular | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fangular) | current |
| npm / @orval/axios | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Faxios) | current |
| npm / @orval/core | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fcore) | current |
| npm / @orval/effect | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Feffect) | current |
| npm / @orval/fetch | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Ffetch) | current |
| npm / @orval/hono | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fhono) | current |
| npm / @orval/mcp | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fmcp) | current |
| npm / @orval/mock | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fmock) | current |
| npm / @orval/pinia-colada | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fpinia-colada) | current |
| npm / @orval/query | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fquery) | current |
| npm / @orval/solid-start | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fsolid-start) | current |
| npm / @orval/swr | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fswr) | current |
| npm / @orval/zod | transitive | 8.37.0 | [8.37.0](https://registry.npmjs.org/%40orval%2Fzod) | current |
| npm / @oxc-project/types | transitive | 0.150.0 | [0.151.0](https://registry.npmjs.org/%40oxc-project%2Ftypes) | update available |
| npm / @pinojs/redact | transitive | 0.4.0 | [0.4.0](https://registry.npmjs.org/%40pinojs%2Fredact) | current |
| npm / @radix-ui/number | transitive | 1.1.3 | [1.1.3](https://registry.npmjs.org/%40radix-ui%2Fnumber) | current |
| npm / @radix-ui/primitive | transitive | 1.1.7 | [1.1.7](https://registry.npmjs.org/%40radix-ui%2Fprimitive) | current |
| npm / @radix-ui/react-arrow | transitive | 1.1.15 | [1.1.15](https://registry.npmjs.org/%40radix-ui%2Freact-arrow) | current |
| npm / @radix-ui/react-collection | transitive | 1.1.15 | [1.1.15](https://registry.npmjs.org/%40radix-ui%2Freact-collection) | current |
| npm / @radix-ui/react-compose-refs | transitive | 1.1.5 | [1.1.5](https://registry.npmjs.org/%40radix-ui%2Freact-compose-refs) | current |
| npm / @radix-ui/react-context | transitive | 1.2.2 | [1.2.2](https://registry.npmjs.org/%40radix-ui%2Freact-context) | current |
| npm / @radix-ui/react-direction | transitive | 1.1.4 | [1.1.4](https://registry.npmjs.org/%40radix-ui%2Freact-direction) | current |
| npm / @radix-ui/react-dismissable-layer | transitive | 1.1.19 | [1.1.19](https://registry.npmjs.org/%40radix-ui%2Freact-dismissable-layer) | current |
| npm / @radix-ui/react-focus-guards | transitive | 1.1.6 | [1.1.6](https://registry.npmjs.org/%40radix-ui%2Freact-focus-guards) | current |
| npm / @radix-ui/react-focus-scope | transitive | 1.1.16 | [1.1.16](https://registry.npmjs.org/%40radix-ui%2Freact-focus-scope) | current |
| npm / @radix-ui/react-id | transitive | 1.1.4 | [1.1.4](https://registry.npmjs.org/%40radix-ui%2Freact-id) | current |
| npm / @radix-ui/react-menu | transitive | 2.1.24 | [2.1.24](https://registry.npmjs.org/%40radix-ui%2Freact-menu) | current |
| npm / @radix-ui/react-popper | transitive | 1.3.7 | [1.3.7](https://registry.npmjs.org/%40radix-ui%2Freact-popper) | current |
| npm / @radix-ui/react-portal | transitive | 1.1.17 | [1.1.17](https://registry.npmjs.org/%40radix-ui%2Freact-portal) | current |
| npm / @radix-ui/react-presence | transitive | 1.1.10 | [1.1.10](https://registry.npmjs.org/%40radix-ui%2Freact-presence) | current |
| npm / @radix-ui/react-primitive | transitive | 2.1.10 | [2.1.10](https://registry.npmjs.org/%40radix-ui%2Freact-primitive) | current |
| npm / @radix-ui/react-roving-focus | transitive | 1.1.19 | [1.1.19](https://registry.npmjs.org/%40radix-ui%2Freact-roving-focus) | current |
| npm / @radix-ui/react-use-callback-ref | transitive | 1.1.4 | [1.1.4](https://registry.npmjs.org/%40radix-ui%2Freact-use-callback-ref) | current |
| npm / @radix-ui/react-use-controllable-state | transitive | 1.2.6 | [1.2.6](https://registry.npmjs.org/%40radix-ui%2Freact-use-controllable-state) | current |
| npm / @radix-ui/react-use-effect-event | transitive | 0.0.5 | [0.0.5](https://registry.npmjs.org/%40radix-ui%2Freact-use-effect-event) | current |
| npm / @radix-ui/react-use-is-hydrated | transitive | 0.1.3 | [0.1.3](https://registry.npmjs.org/%40radix-ui%2Freact-use-is-hydrated) | current |
| npm / @radix-ui/react-use-layout-effect | transitive | 1.1.4 | [1.1.4](https://registry.npmjs.org/%40radix-ui%2Freact-use-layout-effect) | current |
| npm / @radix-ui/react-use-previous | transitive | 1.1.4 | [1.1.4](https://registry.npmjs.org/%40radix-ui%2Freact-use-previous) | current |
| npm / @radix-ui/react-use-rect | transitive | 1.1.4 | [1.1.4](https://registry.npmjs.org/%40radix-ui%2Freact-use-rect) | current |
| npm / @radix-ui/react-use-size | transitive | 1.1.4 | [1.1.4](https://registry.npmjs.org/%40radix-ui%2Freact-use-size) | current |
| npm / @radix-ui/react-visually-hidden | transitive | 1.2.11 | [1.2.11](https://registry.npmjs.org/%40radix-ui%2Freact-visually-hidden) | current |
| npm / @radix-ui/rect | transitive | 1.1.3 | [1.1.3](https://registry.npmjs.org/%40radix-ui%2Frect) | current |
| npm / @reduxjs/toolkit | transitive | 2.12.0 | [2.12.0](https://registry.npmjs.org/%40reduxjs%2Ftoolkit) | current |
| npm / @rolldown/binding-android-arm-eabi | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-android-arm-eabi) | update available |
| npm / @rolldown/binding-android-arm64 | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-android-arm64) | update available |
| npm / @rolldown/binding-darwin-arm64 | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-darwin-arm64) | update available |
| npm / @rolldown/binding-darwin-x64 | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-darwin-x64) | update available |
| npm / @rolldown/binding-freebsd-x64 | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-freebsd-x64) | update available |
| npm / @rolldown/binding-linux-arm-gnueabihf | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-arm-gnueabihf) | update available |
| npm / @rolldown/binding-linux-arm64-gnu | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-arm64-gnu) | update available |
| npm / @rolldown/binding-linux-arm64-musl | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-arm64-musl) | update available |
| npm / @rolldown/binding-linux-ppc64-gnu | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-ppc64-gnu) | update available |
| npm / @rolldown/binding-linux-s390x-gnu | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-s390x-gnu) | update available |
| npm / @rolldown/binding-linux-x64-gnu | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-x64-gnu) | update available |
| npm / @rolldown/binding-linux-x64-musl | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-linux-x64-musl) | update available |
| npm / @rolldown/binding-openharmony-arm64 | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-openharmony-arm64) | update available |
| npm / @rolldown/binding-win32-arm64-msvc | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-win32-arm64-msvc) | update available |
| npm / @rolldown/binding-win32-x64-msvc | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/%40rolldown%2Fbinding-win32-x64-msvc) | update available |
| npm / @rolldown/pluginutils | transitive | 1.0.0-rc.3, 1.0.1 | [1.0.1](https://registry.npmjs.org/%40rolldown%2Fpluginutils) | non-stable or non-semver lock entry; review |
| npm / @scalar/helpers | transitive | 0.12.0, 0.13.0 | [0.15.0](https://registry.npmjs.org/%40scalar%2Fhelpers) | update available |
| npm / @scalar/json-magic | transitive | 0.13.5, 0.15.0 | [0.15.2](https://registry.npmjs.org/%40scalar%2Fjson-magic) | update available |
| npm / @scalar/json-schema-validator | transitive | 0.1.4 | [0.1.6](https://registry.npmjs.org/%40scalar%2Fjson-schema-validator) | update available |
| npm / @scalar/openapi-parser | transitive | 0.29.5 | [0.29.7](https://registry.npmjs.org/%40scalar%2Fopenapi-parser) | update available |
| npm / @scalar/openapi-types | transitive | 0.9.6, 0.9.7 | [0.9.7](https://registry.npmjs.org/%40scalar%2Fopenapi-types) | update available |
| npm / @scalar/openapi-upgrader | transitive | 0.3.0 | [0.4.0](https://registry.npmjs.org/%40scalar%2Fopenapi-upgrader) | update available |
| npm / @scalar/openapi-validator | transitive | 0.1.4 | [0.1.6](https://registry.npmjs.org/%40scalar%2Fopenapi-validator) | update available |
| npm / @scalar/types | transitive | 0.21.0 | [0.22.1](https://registry.npmjs.org/%40scalar%2Ftypes) | update available |
| npm / @sec-ant/readable-stream | transitive | 0.4.1 | [0.7.0](https://registry.npmjs.org/%40sec-ant%2Freadable-stream) | update available |
| npm / @sindresorhus/merge-streams | transitive | 4.0.0 | [4.0.0](https://registry.npmjs.org/%40sindresorhus%2Fmerge-streams) | current |
| npm / @standard-schema/spec | transitive | 1.1.0 | [1.1.0](https://registry.npmjs.org/%40standard-schema%2Fspec) | current |
| npm / @standard-schema/utils | transitive | 0.3.0 | [0.3.0](https://registry.npmjs.org/%40standard-schema%2Futils) | current |
| npm / @tailwindcss/node | transitive | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Fnode) | current |
| npm / @tailwindcss/oxide | transitive | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide) | current |
| npm / @tailwindcss/oxide-linux-x64-gnu | transitive | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-linux-x64-gnu) | current |
| npm / @tailwindcss/oxide-wasm32-wasi | transitive | 4.3.3 | [4.3.3](https://registry.npmjs.org/%40tailwindcss%2Foxide-wasm32-wasi) | current |
| npm / @tanstack/query-core | transitive | 5.103.2 | [5.104.0](https://registry.npmjs.org/%40tanstack%2Fquery-core) | update available |
| npm / @types/babel__core | transitive | 7.20.5 | [7.20.5](https://registry.npmjs.org/%40types%2Fbabel__core) | current |
| npm / @types/babel__generator | transitive | 7.27.0 | [7.27.0](https://registry.npmjs.org/%40types%2Fbabel__generator) | current |
| npm / @types/babel__template | transitive | 7.4.4 | [7.4.4](https://registry.npmjs.org/%40types%2Fbabel__template) | current |
| npm / @types/babel__traverse | transitive | 7.28.0 | [7.28.0](https://registry.npmjs.org/%40types%2Fbabel__traverse) | current |
| npm / @types/body-parser | transitive | 1.19.6 | [1.19.6](https://registry.npmjs.org/%40types%2Fbody-parser) | current |
| npm / @types/chai | transitive | 5.2.3 | [5.2.3](https://registry.npmjs.org/%40types%2Fchai) | current |
| npm / @types/connect | transitive | 3.4.38 | [3.4.38](https://registry.npmjs.org/%40types%2Fconnect) | current |
| npm / @types/d3-array | transitive | 3.2.2 | [3.2.2](https://registry.npmjs.org/%40types%2Fd3-array) | current |
| npm / @types/d3-color | transitive | 3.1.3 | [3.1.3](https://registry.npmjs.org/%40types%2Fd3-color) | current |
| npm / @types/d3-ease | transitive | 3.0.2 | [3.0.2](https://registry.npmjs.org/%40types%2Fd3-ease) | current |
| npm / @types/d3-interpolate | transitive | 3.0.4 | [3.0.4](https://registry.npmjs.org/%40types%2Fd3-interpolate) | current |
| npm / @types/d3-path | transitive | 3.1.1 | [3.1.1](https://registry.npmjs.org/%40types%2Fd3-path) | current |
| npm / @types/d3-scale | transitive | 4.0.9 | [4.0.9](https://registry.npmjs.org/%40types%2Fd3-scale) | current |
| npm / @types/d3-shape | transitive | 3.1.8 | [3.2.0](https://registry.npmjs.org/%40types%2Fd3-shape) | update available |
| npm / @types/d3-time | transitive | 3.0.4 | [3.0.4](https://registry.npmjs.org/%40types%2Fd3-time) | current |
| npm / @types/d3-timer | transitive | 3.0.2 | [3.0.2](https://registry.npmjs.org/%40types%2Fd3-timer) | current |
| npm / @types/deep-eql | transitive | 4.0.2 | [4.0.2](https://registry.npmjs.org/%40types%2Fdeep-eql) | current |
| npm / @types/estree | transitive | 1.0.9 | [1.0.9](https://registry.npmjs.org/%40types%2Festree) | current |
| npm / @types/express-serve-static-core | transitive | 5.1.2 | [5.1.3](https://registry.npmjs.org/%40types%2Fexpress-serve-static-core) | update available |
| npm / @types/http-errors | transitive | 2.0.5 | [2.0.5](https://registry.npmjs.org/%40types%2Fhttp-errors) | current |
| npm / @types/qs | transitive | 6.15.1 | [6.15.1](https://registry.npmjs.org/%40types%2Fqs) | current |
| npm / @types/range-parser | transitive | 1.2.7 | [1.2.7](https://registry.npmjs.org/%40types%2Frange-parser) | current |
| npm / @types/send | transitive | 1.2.1 | [1.2.1](https://registry.npmjs.org/%40types%2Fsend) | current |
| npm / @types/serve-static | transitive | 2.2.0 | [2.2.0](https://registry.npmjs.org/%40types%2Fserve-static) | current |
| npm / @types/use-sync-external-store | transitive | 0.0.6 | [1.7.0](https://registry.npmjs.org/%40types%2Fuse-sync-external-store) | major upgrade review |
| npm / @vitest/mocker | transitive | 5.0.1 | [5.0.2](https://registry.npmjs.org/%40vitest%2Fmocker) | update available |
| npm / @vitest/spy | transitive | 5.0.1 | [5.0.2](https://registry.npmjs.org/%40vitest%2Fspy) | update available |
| npm / accepts | transitive | 2.0.0 | [1.3.8](https://registry.npmjs.org/accepts) | ahead of latest tag; review (never downgrade) |
| npm / acorn | transitive | 8.18.0 | [8.18.0](https://registry.npmjs.org/acorn) | current |
| npm / ajv | transitive | 8.20.0 | [8.20.0](https://registry.npmjs.org/ajv) | current |
| npm / ajv-draft-04 | transitive | 1.0.0 | [1.0.0](https://registry.npmjs.org/ajv-draft-04) | current |
| npm / ajv-formats | transitive | 3.0.1 | [3.0.1](https://registry.npmjs.org/ajv-formats) | current |
| npm / argparse | transitive | 2.0.1 | [3.0.2](https://registry.npmjs.org/argparse) | major upgrade review |
| npm / aria-hidden | transitive | 1.2.6 | [1.2.6](https://registry.npmjs.org/aria-hidden) | current |
| npm / assertion-error | transitive | 2.0.1 | [2.0.1](https://registry.npmjs.org/assertion-error) | current |
| npm / atomic-sleep | transitive | 1.0.0 | [1.0.0](https://registry.npmjs.org/atomic-sleep) | current |
| npm / baseline-browser-mapping | transitive | 2.11.3 | [2.11.26](https://registry.npmjs.org/baseline-browser-mapping) | update available |
| npm / body-parser | transitive | 2.3.0 | [2.3.0](https://registry.npmjs.org/body-parser) | current |
| npm / braces | transitive | 3.0.3 | [3.0.3](https://registry.npmjs.org/braces) | current |
| npm / browserslist | transitive | 4.28.7 | [4.29.1](https://registry.npmjs.org/browserslist) | update available |
| npm / bytes | transitive | 3.1.2 | [3.1.2](https://registry.npmjs.org/bytes) | current |
| npm / call-bind-apply-helpers | transitive | 1.0.2 | [1.0.2](https://registry.npmjs.org/call-bind-apply-helpers) | current |
| npm / call-bound | transitive | 1.0.4 | [1.0.4](https://registry.npmjs.org/call-bound) | current |
| npm / caniuse-lite | transitive | 1.0.30001806 | [1.0.30001812](https://registry.npmjs.org/caniuse-lite) | update available |
| npm / chai | transitive | 6.2.2 | [6.2.2](https://registry.npmjs.org/chai) | current |
| npm / colorette | transitive | 2.0.20 | [2.0.20](https://registry.npmjs.org/colorette) | current |
| npm / commander | transitive | 15.0.0 | [15.0.0](https://registry.npmjs.org/commander) | current |
| npm / compare-versions | transitive | 6.1.1 | [6.1.1](https://registry.npmjs.org/compare-versions) | current |
| npm / content-disposition | transitive | 1.1.0 | [3.0.0](https://registry.npmjs.org/content-disposition) | major upgrade review |
| npm / content-type | transitive | 1.0.5, 2.0.0 | [3.1.1](https://registry.npmjs.org/content-type) | major upgrade review |
| npm / convert-source-map | transitive | 2.0.0 | [2.0.0](https://registry.npmjs.org/convert-source-map) | current |
| npm / cookie | transitive | 0.7.2, 1.1.1 | [2.0.1](https://registry.npmjs.org/cookie) | major upgrade review |
| npm / cookie-signature | transitive | 1.0.6, 1.2.2 | [1.2.2](https://registry.npmjs.org/cookie-signature) | update available |
| npm / cross-spawn | transitive | 7.0.6 | [7.0.6](https://registry.npmjs.org/cross-spawn) | current |
| npm / cssesc | transitive | 3.0.0 | [3.0.0](https://registry.npmjs.org/cssesc) | current |
| npm / csstype | transitive | 3.2.3 | [3.2.3](https://registry.npmjs.org/csstype) | current |
| npm / d3-array | transitive | 3.2.4 | [3.2.4](https://registry.npmjs.org/d3-array) | current |
| npm / d3-color | transitive | 3.1.0 | [3.1.0](https://registry.npmjs.org/d3-color) | current |
| npm / d3-ease | transitive | 3.0.1 | [3.0.1](https://registry.npmjs.org/d3-ease) | current |
| npm / d3-format | transitive | 3.1.2 | [3.1.2](https://registry.npmjs.org/d3-format) | current |
| npm / d3-interpolate | transitive | 3.0.1 | [3.0.1](https://registry.npmjs.org/d3-interpolate) | current |
| npm / d3-path | transitive | 3.1.0 | [3.1.0](https://registry.npmjs.org/d3-path) | current |
| npm / d3-scale | transitive | 4.0.2 | [4.0.2](https://registry.npmjs.org/d3-scale) | current |
| npm / d3-shape | transitive | 3.2.0 | [3.2.0](https://registry.npmjs.org/d3-shape) | current |
| npm / d3-time | transitive | 3.1.0 | [3.1.0](https://registry.npmjs.org/d3-time) | current |
| npm / d3-time-format | transitive | 4.1.0 | [4.1.0](https://registry.npmjs.org/d3-time-format) | current |
| npm / d3-timer | transitive | 3.0.1 | [3.0.1](https://registry.npmjs.org/d3-timer) | current |
| npm / dateformat | transitive | 4.6.3 | [5.0.3](https://registry.npmjs.org/dateformat) | major upgrade review |
| npm / debug | transitive | 4.4.3 | [4.4.3](https://registry.npmjs.org/debug) | current |
| npm / decimal.js-light | transitive | 2.5.1 | [2.5.1](https://registry.npmjs.org/decimal.js-light) | current |
| npm / depd | transitive | 2.0.0 | [2.0.0](https://registry.npmjs.org/depd) | current |
| npm / detect-libc | transitive | 2.1.2 | [2.1.2](https://registry.npmjs.org/detect-libc) | current |
| npm / detect-node-es | transitive | 1.1.0 | [1.1.0](https://registry.npmjs.org/detect-node-es) | current |
| npm / dunder-proto | transitive | 1.0.1 | [1.0.1](https://registry.npmjs.org/dunder-proto) | current |
| npm / ee-first | transitive | 1.1.1 | [1.1.1](https://registry.npmjs.org/ee-first) | current |
| npm / electron-to-chromium | transitive | 1.5.396 | [1.5.439](https://registry.npmjs.org/electron-to-chromium) | update available |
| npm / embla-carousel | transitive | 8.6.0 | [8.6.0](https://registry.npmjs.org/embla-carousel) | current |
| npm / embla-carousel-reactive-utils | transitive | 8.6.0 | [8.6.0](https://registry.npmjs.org/embla-carousel-reactive-utils) | current |
| npm / encodeurl | transitive | 2.0.0 | [2.0.0](https://registry.npmjs.org/encodeurl) | current |
| npm / end-of-stream | transitive | 1.4.5 | [1.4.5](https://registry.npmjs.org/end-of-stream) | current |
| npm / enhanced-resolve | transitive | 5.24.3 | [5.25.1](https://registry.npmjs.org/enhanced-resolve) | update available |
| npm / es-define-property | transitive | 1.0.1 | [1.0.1](https://registry.npmjs.org/es-define-property) | current |
| npm / es-errors | transitive | 1.3.0 | [1.3.0](https://registry.npmjs.org/es-errors) | current |
| npm / es-module-lexer | transitive | 2.3.2 | [3.0.2](https://registry.npmjs.org/es-module-lexer) | major upgrade review |
| npm / es-object-atoms | transitive | 1.1.2 | [1.1.2](https://registry.npmjs.org/es-object-atoms) | current |
| npm / es-toolkit | transitive | 1.52.0 | [1.52.0](https://registry.npmjs.org/es-toolkit) | current |
| npm / escalade | transitive | 3.2.0 | [3.2.0](https://registry.npmjs.org/escalade) | current |
| npm / escape-html | transitive | 1.0.3 | [1.0.3](https://registry.npmjs.org/escape-html) | current |
| npm / estree-walker | transitive | 3.0.3 | [3.0.3](https://registry.npmjs.org/estree-walker) | current |
| npm / esutils | transitive | 2.0.3 | [2.0.3](https://registry.npmjs.org/esutils) | current |
| npm / etag | transitive | 1.8.1 | [1.8.1](https://registry.npmjs.org/etag) | current |
| npm / eventemitter3 | transitive | 5.0.4 | [5.0.4](https://registry.npmjs.org/eventemitter3) | current |
| npm / execa | transitive | 9.6.1 | [10.0.1](https://registry.npmjs.org/execa) | major upgrade review |
| npm / expect-type | transitive | 1.4.0 | [1.4.0](https://registry.npmjs.org/expect-type) | current |
| npm / fast-copy | transitive | 4.0.4 | [4.1.1](https://registry.npmjs.org/fast-copy) | update available |
| npm / fast-deep-equal | transitive | 3.1.3 | [3.1.3](https://registry.npmjs.org/fast-deep-equal) | current |
| npm / fast-safe-stringify | transitive | 2.1.1 | [2.1.1](https://registry.npmjs.org/fast-safe-stringify) | current |
| npm / fast-uri | transitive | 3.1.8 | [4.2.1](https://registry.npmjs.org/fast-uri) | major upgrade review |
| npm / fastq | transitive | 1.20.1 | [1.20.3](https://registry.npmjs.org/fastq) | update available |
| npm / fdir | transitive | 6.5.0 | [6.5.0](https://registry.npmjs.org/fdir) | current |
| npm / figures | transitive | 6.1.0 | [6.1.0](https://registry.npmjs.org/figures) | current |
| npm / fill-range | transitive | 7.1.1 | [7.1.1](https://registry.npmjs.org/fill-range) | current |
| npm / finalhandler | transitive | 2.1.1 | [2.1.1](https://registry.npmjs.org/finalhandler) | current |
| npm / find-up | transitive | 8.0.0 | [8.0.0](https://registry.npmjs.org/find-up) | current |
| npm / forwarded | transitive | 0.2.0 | [0.2.0](https://registry.npmjs.org/forwarded) | current |
| npm / fresh | transitive | 2.0.0 | [0.5.2](https://registry.npmjs.org/fresh) | ahead of latest tag; review (never downgrade) |
| npm / fsevents | transitive | 2.3.3 | [2.3.3](https://registry.npmjs.org/fsevents) | current |
| npm / function-bind | transitive | 1.1.2 | [1.1.2](https://registry.npmjs.org/function-bind) | current |
| npm / gensync | transitive | 1.0.0-beta.2 | [0.1.0](https://registry.npmjs.org/gensync) | non-stable or non-semver lock entry; review |
| npm / get-caller-file | transitive | 2.0.5 | [2.0.5](https://registry.npmjs.org/get-caller-file) | current |
| npm / get-intrinsic | transitive | 1.3.0 | [1.3.0](https://registry.npmjs.org/get-intrinsic) | current |
| npm / get-nonce | transitive | 1.0.1 | [1.0.1](https://registry.npmjs.org/get-nonce) | current |
| npm / get-proto | transitive | 1.0.1 | [1.0.1](https://registry.npmjs.org/get-proto) | current |
| npm / get-stream | transitive | 9.0.1 | [9.0.1](https://registry.npmjs.org/get-stream) | current |
| npm / get-tsconfig | transitive | 4.14.3 | [4.14.3](https://registry.npmjs.org/get-tsconfig) | current |
| npm / glob-parent | transitive | 5.1.2 | [6.0.2](https://registry.npmjs.org/glob-parent) | major upgrade review |
| npm / gopd | transitive | 1.2.0 | [1.2.0](https://registry.npmjs.org/gopd) | current |
| npm / graceful-fs | transitive | 4.2.11 | [4.2.11](https://registry.npmjs.org/graceful-fs) | current |
| npm / has-symbols | transitive | 1.1.0 | [1.1.0](https://registry.npmjs.org/has-symbols) | current |
| npm / hasown | transitive | 2.0.4 | [2.0.4](https://registry.npmjs.org/hasown) | current |
| npm / help-me | transitive | 5.0.0 | [5.0.0](https://registry.npmjs.org/help-me) | current |
| npm / http-errors | transitive | 2.0.1 | [2.0.1](https://registry.npmjs.org/http-errors) | current |
| npm / human-signals | transitive | 8.0.1 | [8.0.1](https://registry.npmjs.org/human-signals) | current |
| npm / iconv-lite | transitive | 0.7.3 | [0.7.3](https://registry.npmjs.org/iconv-lite) | current |
| npm / immer | transitive | 11.1.18 | [11.1.18](https://registry.npmjs.org/immer) | current |
| npm / inherits | transitive | 2.0.4 | [2.0.4](https://registry.npmjs.org/inherits) | current |
| npm / internmap | transitive | 2.0.3 | [2.0.3](https://registry.npmjs.org/internmap) | current |
| npm / ipaddr.js | transitive | 1.9.1 | [2.5.0](https://registry.npmjs.org/ipaddr.js) | major upgrade review |
| npm / is-extglob | transitive | 2.1.1 | [2.1.1](https://registry.npmjs.org/is-extglob) | current |
| npm / is-glob | transitive | 4.0.3 | [4.0.3](https://registry.npmjs.org/is-glob) | current |
| npm / is-number | transitive | 7.0.0 | [7.0.0](https://registry.npmjs.org/is-number) | current |
| npm / is-plain-obj | transitive | 4.1.0 | [4.1.0](https://registry.npmjs.org/is-plain-obj) | current |
| npm / is-promise | transitive | 4.0.0 | [4.0.0](https://registry.npmjs.org/is-promise) | current |
| npm / is-stream | transitive | 4.0.1 | [4.0.1](https://registry.npmjs.org/is-stream) | current |
| npm / is-unicode-supported | transitive | 2.1.0 | [2.1.0](https://registry.npmjs.org/is-unicode-supported) | current |
| npm / isexe | transitive | 2.0.0 | [4.0.0](https://registry.npmjs.org/isexe) | major upgrade review |
| npm / jiti | transitive | 2.7.0 | [2.7.0](https://registry.npmjs.org/jiti) | current |
| npm / joycon | transitive | 3.1.1 | [3.1.1](https://registry.npmjs.org/joycon) | current |
| npm / js-tokens | transitive | 4.0.0 | [10.0.0](https://registry.npmjs.org/js-tokens) | major upgrade review |
| npm / js-yaml | transitive | 4.3.2 | [5.4.2](https://registry.npmjs.org/js-yaml) | major upgrade review |
| npm / jsesc | transitive | 3.1.0 | [3.1.0](https://registry.npmjs.org/jsesc) | current |
| npm / json-schema-traverse | transitive | 1.0.0 | [1.0.0](https://registry.npmjs.org/json-schema-traverse) | current |
| npm / json5 | transitive | 2.2.3 | [2.2.3](https://registry.npmjs.org/json5) | current |
| npm / lightningcss | transitive | 1.32.0, 1.33.0 | [1.33.0](https://registry.npmjs.org/lightningcss) | update available |
| npm / lightningcss-linux-x64-gnu | transitive | 1.32.0, 1.33.0 | [1.33.0](https://registry.npmjs.org/lightningcss-linux-x64-gnu) | update available |
| npm / locate-path | transitive | 8.0.0 | [8.0.0](https://registry.npmjs.org/locate-path) | current |
| npm / lru-cache | transitive | 5.1.1 | [11.5.3](https://registry.npmjs.org/lru-cache) | major upgrade review |
| npm / magic-string | transitive | 0.30.21, 1.4.1 | [1.4.2](https://registry.npmjs.org/magic-string) | major upgrade review |
| npm / math-intrinsics | transitive | 1.1.0 | [1.1.0](https://registry.npmjs.org/math-intrinsics) | current |
| npm / media-typer | transitive | 1.1.1 | [2.0.0](https://registry.npmjs.org/media-typer) | major upgrade review |
| npm / merge-descriptors | transitive | 2.0.0 | [2.0.0](https://registry.npmjs.org/merge-descriptors) | current |
| npm / merge2 | transitive | 1.4.1 | [1.4.1](https://registry.npmjs.org/merge2) | current |
| npm / micromatch | transitive | 4.0.8 | [4.0.8](https://registry.npmjs.org/micromatch) | current |
| npm / mime-db | transitive | 1.54.0 | [1.54.0](https://registry.npmjs.org/mime-db) | current |
| npm / mime-types | transitive | 3.0.2 | [3.0.2](https://registry.npmjs.org/mime-types) | current |
| npm / minimist | transitive | 1.2.8 | [1.2.8](https://registry.npmjs.org/minimist) | current |
| npm / modern-screenshot | transitive | 4.7.0 | [4.7.0](https://registry.npmjs.org/modern-screenshot) | current |
| npm / motion-dom | transitive | 13.4.1 | [13.4.4](https://registry.npmjs.org/motion-dom) | update available |
| npm / motion-utils | transitive | 13.3.0 | [13.3.0](https://registry.npmjs.org/motion-utils) | current |
| npm / ms | transitive | 2.1.3 | [2.1.3](https://registry.npmjs.org/ms) | current |
| npm / nanoid | transitive | 3.3.19, 5.1.16 | [6.0.1](https://registry.npmjs.org/nanoid) | major upgrade review |
| npm / negotiator | transitive | 1.0.0 | [1.1.0](https://registry.npmjs.org/negotiator) | update available |
| npm / node-releases | transitive | 2.0.51 | [2.0.57](https://registry.npmjs.org/node-releases) | update available |
| npm / npm-run-path | transitive | 6.0.0 | [6.0.0](https://registry.npmjs.org/npm-run-path) | current |
| npm / object-assign | transitive | 4.1.1 | [4.1.1](https://registry.npmjs.org/object-assign) | current |
| npm / object-inspect | transitive | 1.13.4 | [1.13.4](https://registry.npmjs.org/object-inspect) | current |
| npm / obug | transitive | 2.2.1 | [3.0.0](https://registry.npmjs.org/obug) | major upgrade review |
| npm / on-exit-leak-free | transitive | 2.1.2 | [2.1.2](https://registry.npmjs.org/on-exit-leak-free) | current |
| npm / on-finished | transitive | 2.4.1 | [2.4.1](https://registry.npmjs.org/on-finished) | current |
| npm / once | transitive | 1.4.0 | [1.4.0](https://registry.npmjs.org/once) | current |
| npm / p-limit | transitive | 4.0.0 | [7.3.3](https://registry.npmjs.org/p-limit) | major upgrade review |
| npm / p-locate | transitive | 6.0.0 | [7.0.0](https://registry.npmjs.org/p-locate) | major upgrade review |
| npm / parse-ms | transitive | 4.0.0 | [4.0.0](https://registry.npmjs.org/parse-ms) | current |
| npm / parseurl | transitive | 1.3.3 | [1.3.3](https://registry.npmjs.org/parseurl) | current |
| npm / path-key | transitive | 3.1.1, 4.0.0 | [4.0.0](https://registry.npmjs.org/path-key) | major upgrade review |
| npm / path-to-regexp | transitive | 8.4.2 | [8.4.2](https://registry.npmjs.org/path-to-regexp) | current |
| npm / pathe | transitive | 2.0.3 | [2.0.3](https://registry.npmjs.org/pathe) | current |
| npm / pg-cloudflare | transitive | 1.4.0 | [1.4.0](https://registry.npmjs.org/pg-cloudflare) | current |
| npm / pg-connection-string | transitive | 2.14.0 | [2.14.0](https://registry.npmjs.org/pg-connection-string) | current |
| npm / pg-int8 | transitive | 1.0.1 | [1.0.1](https://registry.npmjs.org/pg-int8) | current |
| npm / pg-pool | transitive | 3.14.0 | [3.14.0](https://registry.npmjs.org/pg-pool) | current |
| npm / pg-protocol | transitive | 1.16.0 | [1.16.0](https://registry.npmjs.org/pg-protocol) | current |
| npm / pg-types | transitive | 2.2.0 | [4.1.0](https://registry.npmjs.org/pg-types) | major upgrade review |
| npm / pgpass | transitive | 1.0.5 | [1.0.6](https://registry.npmjs.org/pgpass) | update available |
| npm / picocolors | transitive | 1.1.1 | [1.1.1](https://registry.npmjs.org/picocolors) | current |
| npm / picomatch | transitive | 2.3.2, 4.0.7 | [4.0.7](https://registry.npmjs.org/picomatch) | major upgrade review |
| npm / pino-abstract-transport | transitive | 2.0.0, 3.0.0 | [3.0.0](https://registry.npmjs.org/pino-abstract-transport) | major upgrade review |
| npm / pino-std-serializers | transitive | 7.1.0 | [7.1.0](https://registry.npmjs.org/pino-std-serializers) | current |
| npm / playwright-core | transitive | 1.63.0 | [1.63.0](https://registry.npmjs.org/playwright-core) | current |
| npm / postcss | transitive | 8.5.28 | [8.5.28](https://registry.npmjs.org/postcss) | current |
| npm / postcss-selector-parser | transitive | 6.0.10 | [7.1.6](https://registry.npmjs.org/postcss-selector-parser) | major upgrade review |
| npm / postgres-array | transitive | 2.0.0 | [3.0.4](https://registry.npmjs.org/postgres-array) | major upgrade review |
| npm / postgres-bytea | transitive | 1.0.1 | [3.0.0](https://registry.npmjs.org/postgres-bytea) | major upgrade review |
| npm / postgres-date | transitive | 1.0.7 | [2.1.0](https://registry.npmjs.org/postgres-date) | major upgrade review |
| npm / postgres-interval | transitive | 1.2.0 | [4.1.0](https://registry.npmjs.org/postgres-interval) | major upgrade review |
| npm / pretty-ms | transitive | 9.3.1 | [9.3.1](https://registry.npmjs.org/pretty-ms) | current |
| npm / process-warning | transitive | 5.0.0 | [5.1.0](https://registry.npmjs.org/process-warning) | update available |
| npm / proxy-addr | transitive | 2.0.7 | [2.0.8](https://registry.npmjs.org/proxy-addr) | update available |
| npm / pump | transitive | 3.0.4 | [3.0.4](https://registry.npmjs.org/pump) | current |
| npm / qs | transitive | 6.15.3 | [6.16.0](https://registry.npmjs.org/qs) | update available |
| npm / queue-microtask | transitive | 1.2.3 | [1.2.3](https://registry.npmjs.org/queue-microtask) | current |
| npm / quick-format-unescaped | transitive | 4.0.4 | [4.0.4](https://registry.npmjs.org/quick-format-unescaped) | current |
| npm / range-parser | transitive | 1.3.0 | [1.3.0](https://registry.npmjs.org/range-parser) | current |
| npm / raw-body | transitive | 3.0.2 | [4.0.0](https://registry.npmjs.org/raw-body) | major upgrade review |
| npm / react-redux | transitive | 9.3.0 | [9.3.0](https://registry.npmjs.org/react-redux) | current |
| npm / react-refresh | transitive | 0.18.0 | [0.19.0](https://registry.npmjs.org/react-refresh) | update available |
| npm / react-remove-scroll | transitive | 2.7.2 | [2.7.2](https://registry.npmjs.org/react-remove-scroll) | current |
| npm / react-remove-scroll-bar | transitive | 2.3.8 | [2.3.8](https://registry.npmjs.org/react-remove-scroll-bar) | current |
| npm / react-router | transitive | 7.18.4 | [8.4.0](https://registry.npmjs.org/react-router) | major upgrade review |
| npm / react-style-singleton | transitive | 2.2.3 | [2.2.3](https://registry.npmjs.org/react-style-singleton) | current |
| npm / readdirp | transitive | 5.1.1 | [5.1.1](https://registry.npmjs.org/readdirp) | current |
| npm / real-require | transitive | 0.2.0, 1.0.0 | [1.0.0](https://registry.npmjs.org/real-require) | major upgrade review |
| npm / redux | transitive | 5.0.1 | [5.0.1](https://registry.npmjs.org/redux) | current |
| npm / redux-thunk | transitive | 3.1.0 | [3.1.0](https://registry.npmjs.org/redux-thunk) | current |
| npm / regexparam | transitive | 3.0.0 | [3.0.0](https://registry.npmjs.org/regexparam) | current |
| npm / remeda | transitive | 2.50.0 | [2.50.0](https://registry.npmjs.org/remeda) | current |
| npm / require-from-string | transitive | 2.0.2 | [2.0.2](https://registry.npmjs.org/require-from-string) | current |
| npm / reselect | transitive | 5.2.0 | [5.3.0](https://registry.npmjs.org/reselect) | update available |
| npm / resolve-pkg-maps | transitive | 1.0.0 | [1.0.0](https://registry.npmjs.org/resolve-pkg-maps) | current |
| npm / reusify | transitive | 1.1.0 | [1.1.0](https://registry.npmjs.org/reusify) | current |
| npm / rolldown | transitive | 1.2.9 | [1.2.11](https://registry.npmjs.org/rolldown) | update available |
| npm / router | transitive | 2.2.0 | [2.2.0](https://registry.npmjs.org/router) | current |
| npm / run-parallel | transitive | 1.2.0 | [1.2.0](https://registry.npmjs.org/run-parallel) | current |
| npm / safe-stable-stringify | transitive | 2.5.0 | [2.5.0](https://registry.npmjs.org/safe-stable-stringify) | current |
| npm / safer-buffer | transitive | 2.1.2 | [2.1.2](https://registry.npmjs.org/safer-buffer) | current |
| npm / scheduler | transitive | 0.28.0 | [0.28.0](https://registry.npmjs.org/scheduler) | current |
| npm / secure-json-parse | transitive | 4.1.0 | [4.1.0](https://registry.npmjs.org/secure-json-parse) | current |
| npm / semver | transitive | 6.3.1 | [7.8.5](https://registry.npmjs.org/semver) | major upgrade review |
| npm / send | transitive | 1.2.1 | [1.2.1](https://registry.npmjs.org/send) | current |
| npm / serve-static | transitive | 2.2.1 | [2.2.1](https://registry.npmjs.org/serve-static) | current |
| npm / set-cookie-parser | transitive | 2.7.2 | [3.1.2](https://registry.npmjs.org/set-cookie-parser) | major upgrade review |
| npm / setprototypeof | transitive | 1.2.0 | [1.2.0](https://registry.npmjs.org/setprototypeof) | current |
| npm / shebang-command | transitive | 2.0.0 | [2.0.0](https://registry.npmjs.org/shebang-command) | current |
| npm / shebang-regex | transitive | 3.0.0 | [4.0.0](https://registry.npmjs.org/shebang-regex) | major upgrade review |
| npm / side-channel | transitive | 1.1.1 | [1.1.1](https://registry.npmjs.org/side-channel) | current |
| npm / side-channel-list | transitive | 1.0.1 | [1.0.1](https://registry.npmjs.org/side-channel-list) | current |
| npm / side-channel-map | transitive | 1.0.1 | [1.0.1](https://registry.npmjs.org/side-channel-map) | current |
| npm / side-channel-weakmap | transitive | 1.0.2 | [1.0.2](https://registry.npmjs.org/side-channel-weakmap) | current |
| npm / siginfo | transitive | 2.0.0 | [2.0.0](https://registry.npmjs.org/siginfo) | current |
| npm / signal-exit | transitive | 4.1.0 | [4.1.0](https://registry.npmjs.org/signal-exit) | current |
| npm / sonic-boom | transitive | 4.2.1 | [5.0.1](https://registry.npmjs.org/sonic-boom) | major upgrade review |
| npm / source-map-js | transitive | 1.2.1 | [1.2.1](https://registry.npmjs.org/source-map-js) | current |
| npm / split2 | transitive | 4.2.0 | [4.2.0](https://registry.npmjs.org/split2) | current |
| npm / stackback | transitive | 0.0.2 | [0.0.2](https://registry.npmjs.org/stackback) | current |
| npm / statuses | transitive | 2.0.2 | [2.0.2](https://registry.npmjs.org/statuses) | current |
| npm / std-env | transitive | 4.2.0 | [4.2.0](https://registry.npmjs.org/std-env) | current |
| npm / string-argv | transitive | 0.3.2 | [0.3.2](https://registry.npmjs.org/string-argv) | current |
| npm / strip-final-newline | transitive | 4.0.0 | [4.0.0](https://registry.npmjs.org/strip-final-newline) | current |
| npm / strip-json-comments | transitive | 5.0.3 | [5.0.3](https://registry.npmjs.org/strip-json-comments) | current |
| npm / tagged-tag | transitive | 1.0.0 | [1.0.0](https://registry.npmjs.org/tagged-tag) | current |
| npm / tapable | transitive | 2.3.3 | [2.3.3](https://registry.npmjs.org/tapable) | current |
| npm / tiny-invariant | transitive | 1.3.3 | [1.3.3](https://registry.npmjs.org/tiny-invariant) | current |
| npm / tinybench | transitive | 6.1.4 | [6.2.0](https://registry.npmjs.org/tinybench) | update available |
| npm / tinyexec | transitive | 1.3.0 | [1.3.1](https://registry.npmjs.org/tinyexec) | update available |
| npm / tinyglobby | transitive | 0.2.17 | [0.2.17](https://registry.npmjs.org/tinyglobby) | current |
| npm / to-regex-range | transitive | 5.0.1 | [5.0.1](https://registry.npmjs.org/to-regex-range) | current |
| npm / toidentifier | transitive | 1.0.1 | [1.0.1](https://registry.npmjs.org/toidentifier) | current |
| npm / tslib | transitive | 2.8.1 | [2.8.1](https://registry.npmjs.org/tslib) | current |
| npm / type-fest | transitive | 5.10.0 | [5.10.0](https://registry.npmjs.org/type-fest) | current |
| npm / type-is | transitive | 2.1.0 | [3.0.0](https://registry.npmjs.org/type-is) | major upgrade review |
| npm / undici | transitive | 7.24.4 | [8.11.2](https://registry.npmjs.org/undici) | major upgrade review |
| npm / undici-types | transitive | 8.9.0 | [8.11.2](https://registry.npmjs.org/undici-types) | update available |
| npm / unicorn-magic | transitive | 0.3.0 | [0.4.1](https://registry.npmjs.org/unicorn-magic) | update available |
| npm / unpipe | transitive | 1.0.0 | [1.0.0](https://registry.npmjs.org/unpipe) | current |
| npm / update-browserslist-db | transitive | 1.2.3 | [1.3.3](https://registry.npmjs.org/update-browserslist-db) | update available |
| npm / use-callback-ref | transitive | 1.3.3 | [1.3.3](https://registry.npmjs.org/use-callback-ref) | current |
| npm / use-sidecar | transitive | 1.1.3 | [1.1.3](https://registry.npmjs.org/use-sidecar) | current |
| npm / use-sync-external-store | transitive | 1.7.0 | [1.7.0](https://registry.npmjs.org/use-sync-external-store) | current |
| npm / util-deprecate | transitive | 1.0.2 | [1.0.2](https://registry.npmjs.org/util-deprecate) | current |
| npm / vary | transitive | 1.1.2 | [1.1.2](https://registry.npmjs.org/vary) | current |
| npm / victory-vendor | transitive | 37.3.6 | [37.3.6](https://registry.npmjs.org/victory-vendor) | current |
| npm / which | transitive | 2.0.2 | [7.0.0](https://registry.npmjs.org/which) | major upgrade review |
| npm / why-is-node-running | transitive | 2.3.0 | [3.2.2](https://registry.npmjs.org/why-is-node-running) | major upgrade review |
| npm / wrappy | transitive | 1.0.2 | [1.0.2](https://registry.npmjs.org/wrappy) | current |
| npm / xtend | transitive | 4.0.2 | [4.0.2](https://registry.npmjs.org/xtend) | current |
| npm / yallist | transitive | 3.1.1 | [5.0.0](https://registry.npmjs.org/yallist) | major upgrade review |
| npm / yaml | transitive | 2.9.1 | [2.9.1](https://registry.npmjs.org/yaml) | current |
| npm / yocto-queue | transitive | 1.2.2 | [1.2.2](https://registry.npmjs.org/yocto-queue) | current |
| npm / yoctocolors | transitive | 2.2.0 | [2.2.0](https://registry.npmjs.org/yoctocolors) | current |

Declaration paths, source URLs, engine requirements, and input hashes are in [technology-inventory.json](technology-inventory.json).
<!-- technology-latest:end -->

## Maintenance and limitations

See [Technology Update Plan](TECHNOLOGY-UPDATE-PLAN.md) for schedules, commands, migration order,
validation gates, activation, rollback, and host reconciliation. Generated metadata proves
version availability; it does not prove compatibility, security, performance, or live deployment.
