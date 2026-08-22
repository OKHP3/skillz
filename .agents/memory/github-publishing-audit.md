---
name: GitHub publishing audit
description: Durable constraints for auditing public companion-site Pages deployments.
---

Workflow YAML can return an intermediary error page through a raw-content
proxy even when repository metadata and package files are readable. Prefer the
public GitHub Contents API representation and decode its base64 `content` for
workflow inspection.

**Why:** A raw-endpoint failure caused a false report that every site lacked a
deploy handoff; the Contents API and Actions run history resolved the actual
state.

**How to apply:** When auditing public repositories, distinguish a
source-controlled deploy job from GitHub-managed Pages history. Treat the
latter as an explicit external dependency and stop if recent successful Pages
runs disappear.