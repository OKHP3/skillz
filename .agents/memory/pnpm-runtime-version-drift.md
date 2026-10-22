---
name: pnpm runtime version drift
description: Replit may provide a pnpm version different from the repository's packageManager pin.
---

When the active Replit runtime supplies a pnpm version older than the repository's `packageManager` pin, pnpm's automatic version management can recursively spawn `pnpm add pnpm@<pinned-version>` in workflows instead of starting the requested command. Disabling `manage-package-manager-versions` in workspace configuration stopped the recursion and let workflows run with the supplied pnpm.

**Why:** The version-switch loop spawned an expanding process chain and prevented managed services from starting; the pinned version was not available in the environment.

**How to apply:** If workflows repeatedly invoke `pnpm add pnpm@...`, compare the runtime and `packageManager` versions before retrying. Prefer aligning the versions when possible; if the host controls the runtime, explicitly disable automatic package-manager version switching and verify the workspace commands before restarting services.
