# Locale registry and page-release contract

Use one project-owned JSON registry to connect a reviewed language artifact to
the static page that will carry it. It is a delivery record, not a translation
memory and not a replacement for the exact-pair translation record.

## Required fields

- `site_origin`: absolute HTTPS origin without a trailing slash.
- `default_locale.tag`: BCP-47 tag for the unprefixed source pages.
- `default_locale.x_default_url`: route selected for `hreflang="x-default"`
  when `release_policy.require_x_default` is true.
- `release_policy`: project choices for `require_x_default` (default `true`)
  and `html_lang` (`exact-locale` by default, or `primary-language`).
- `locales`: mapping keyed by exact BCP-47 tag. Each value declares its folder
  root, text direction, own-language label, and exact-pair translation skill.
- `routes`: source page and zero or more localized targets. Each target has a
  relative file path, URL path, and `state` of `indexable` or `draft-noindex`.

Set `check_open_graph_url` only when the site owns and maintains `og:url`.
The validator does not invent Open Graph metadata when it is disabled.

## Public alternate cluster

For each route, the public cluster contains its source page and only targets
whose state is `indexable`. Every page in that cluster must carry:

- its exact BCP-47 `html lang` value;
- a self-canonical absolute URL;
- one `hreflang` alternate for every page in the same public cluster, including
  itself; and
- `hreflang="x-default"` pointing to the declared default route when the
  project policy requires a fallback.

`draft-noindex` targets must declare `noindex` and are deliberately excluded
from the public alternate cluster. This is an owner-set release policy, not a
claim that a search engine mandates it. Mark a target `indexable` only after the
translation record has the required review evidence and the owner approves its
release state.

Google permits partial alternate sets when a page has no real equivalent. This
registry makes that choice explicit per route instead of pointing an alternate
at an unrelated page merely to fill a matrix.

## Rendered-language evidence

The structural validator cannot prove the visible body is actually the declared
language. When a browser adapter is available, save its page-level output near
the release evidence and classify it as:

- `agreement`: declared and detected language align;
- `declared-not-detected`: investigate stale markup, short content, or detector
  limits;
- `detected-not-declared`: investigate mixed or undeclared language content;
- `unknown`: no detector, no reliable result, or too little body text.

Do not use detector output as native-quality certification. It detects language
signals, not accuracy, register, terminology, or cultural fit.
