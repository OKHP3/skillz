# Calling the skill after indexing

The skill contains agent instructions and a deterministic CLI. A Git workflow
calls the CLI; an agent reads SKILL.md for generation, review, and repair.
Merely copying the package does not register a Git hook or scheduled task.

For each repository, implement an explicit adapter when page integration is in
scope. Keep config and adapter outside the mirrored package:

1. Render authored pages with the site's existing builder.
2. Rebuild the search index with its owning script.
3. Derive optional lifecycle metadata from the site's existing status authority.
4. Generate into a fresh staging directory with this package's CLI.
5. Validate coverage, render representative Mermaid outputs, and replace only
   the designated `AUTOGEN:UNIVERSE-MAP` block in the universe authoring source.
6. Run the existing page build, CSP, cache-bust, link, accessibility, and release
   gates. Retain referral notes and site-specific rendering requirements.

Avoid a circular build: the search extractor must ignore the generated map block
and its linked outline while retaining the universe page's authored introduction
and metadata. Otherwise an index-derived map can feed its own content back into
the next index. Require two full builds to produce identical artifacts.

Keep the ordinary links available when JavaScript is disabled. Configure
clickable diagrams through the existing per-page renderer and allowlisted
destinations; the generator does not alter renderer security. Use the existing
theme tokens for published output and check contrast in both themes.

For fully automatic updates, generate within the validated release artifact on
every relevant commit. Alternatively, have the existing worker regenerate and
commit the owned artifacts before CI runs `--check`. A freshness check alone
is not automation. Do not make CI depend on an LLM or Mermaid account access.

One site can run with only its own index. For a combined universe view, acquire
explicit peer snapshots and verify their origin, release identity, and freshness
before invoking the CLI with multiple sites. Configure peer-deployment triggers
and scheduled reconciliation if immediate cross-site freshness is required.
An unavailable peer is a failed refresh, not an empty site. Retain the last
validated published output and report the failed acquisition separately.

Skill updates originate in `OKHP3/skillz/mermaid/okhp3-universe-map`. Compare all
files before syncing runtime copies, preserve divergent local work, and record
package hashes outside the package. Site data changes do not require recopying
the skill. Do not auto-upgrade the package during a content build.
