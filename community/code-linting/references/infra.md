# Docker / Terraform linting

Infrastructure linting differs from application linting in one important way: the findings are
frequently **security** findings, and the cost of ignoring them is measured in incidents rather
than readability.

## Dockerfiles

**hadolint** — the only real option, and it wraps ShellCheck for `RUN` lines, which is a
significant bonus.

```yaml
# .hadolint.yaml
failure-threshold: warning
ignored:
  - DL3008    # pin apt versions — often impractical
trustedRegistries:
  - docker.io
  - ghcr.io
```

Findings worth acting on:

- **DL3006 / DL3007 — untagged or `:latest` base image.** Non-reproducible builds; the image
  you tested is not the image you deploy.
- **DL3002 — running as root.** Add a `USER` instruction. This is the most common real finding.
- **DL3009 — apt lists not cleaned**, and **DL3015 — missing `--no-install-recommends`.** Image
  size, which is deploy speed.
- **DL4006 — pipes without `pipefail`.** A failing step mid-pipe produces a successful build
  with a broken image.
- **Secrets in `ARG` or `ENV`** — these persist in image layers and are readable by anyone who
  pulls the image, even if a later layer removes them.

Add **trivy** or **grype** for CVE scanning of the built image. Linting the Dockerfile and
scanning the image are different jobs; do both.

## Terraform

Three tools, three purposes — they do not overlap:

- **`terraform fmt`** — formatting. Built in, no config, run it in CI with `-check`.
- **`tflint`** — provider-aware correctness: invalid instance types, deprecated syntax, unused
  declarations.
- **`tfsec`** or **`checkov`** — security misconfiguration. This is the one that matters most.

```hcl
# .tflint.hcl
plugin "aws" {
  enabled = true
  version = "0.32.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

rule "terraform_unused_declarations" { enabled = true }
rule "terraform_naming_convention"   { enabled = true }
```

Security findings that recur everywhere: public S3 buckets and storage containers, security
groups open to `0.0.0.0/0`, unencrypted volumes and databases, missing logging or versioning,
overly broad IAM policies with `*` actions.

## Traps

- **`:latest` in a base image** makes the build non-reproducible *and* makes the vulnerability
  scan meaningless, since the scanned image is not the deployed one. Pin by digest for anything
  production.
- **Secrets in build args** survive in layer history — `docker history` reveals them. Use
  BuildKit secret mounts.
- **Suppressing a tfsec finding inline** (`#tfsec:ignore:aws-s3-enable-bucket-logging`) requires
  a reason comment, or the suppression outlives the justification. Review these periodically —
  a stale suppression is an unknown exposure.
- **Terraform module versions unpinned** means `terraform init` can pull a different module
  next week. Pin module and provider versions, and commit the lockfile.
- Scanning tools have false positives on legitimate architectures. Tune at the config level
  with a stated reason, never by disabling the whole rule set.
