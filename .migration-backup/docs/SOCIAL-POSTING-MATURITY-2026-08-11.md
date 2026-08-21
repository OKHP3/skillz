# Social-posting Foundry maturity record

Date: 2026-08-11

## Decision

Treat the 31-package `social-posting/` family as an analytical,
distribution-ready draft layer. It is ready for public structural and source
review, but it is not promoted to a live task-quality, benchmark, or
publication claim.

The family is deliberately platform-specific and account-neutral. Each package
accepts the minimum context at execution time and produces reviewable text plus
an account-side handoff. No package publishes, schedules, joins a community,
changes settings, manages an account, or automates engagement.

## Foundry preflight and acceptance criteria

| Criterion | Result | Evidence |
|---|---|---|
| Portable name and directory match | Pass | Recursive Foundry validation of `social-posting/` found 31 packages. |
| Public artifact boundary | Pass | Every package declares `public_artifact: true` and carries a public-neutrality gate. |
| Account and subject neutrality | Pass | Package instructions and evaluation fixtures use execution-time placeholders only. |
| Platform-specific advantage | Pass | Each package maps to a native surface, access boundary, community rule, or message-thread distinction. |
| Risk-based evaluation design | Pass | Each package contains normal, missing-context, and high-risk safety cases with `external-required` holdouts and `not-run` evidence status. |
| First-party source traceability | Pass | Current platform references are retained in package instructions and mapped below. |
| Independent live evaluation | Not run | No isolated executor or unseen release holdout was used. |
| Publication authorization | Not requested | No package sent, scheduled, posted, or changed an external platform. |

## Package architecture

| Platform | New-surface pair | Key runtime context |
|---|---|---|
| Instagram | post, comment | Post form and supplied media or parent conversation. |
| TikTok | post, comment | Video or photo material, form, and parent conversation. |
| Reddit | post, comment | Named community, supplied rules, submission form, and parent thread. |
| Patreon | post, comment | Intended public, free-member, or paid-member access boundary. |
| Pinterest | Pin, comment | Pin asset, board, destination link, and parent conversation. |
| Slack | channel message, thread reply | Workspace, channel, and parent-message routing. |
| Microsoft Teams | channel post, thread reply | Team, channel, layout, current posting permission, and parent post. |
| Telegram | channel post, group reply | Broadcast channel versus group or topic destination and parent message. |

The pre-existing LinkedIn, Facebook, X/Twitter, Discord, YouTube, and Ko-fi
packages remain in the same family and use the same public-neutrality and
draft-only conventions. LinkedIn keeps its specialized angle, post, and voice
composition path. The portable public-context scrub replaces an internal
shorthand in `okhp3-linkedin-angles` and `okhp3-linkedin-post`.

## Source ledger

| ID | First-party source | Decision supported |
|---|---|---|
| IG-01 | [Instagram Help: multi-photo or video post](https://www.facebook.com/help/instagram/269314186824048?locale=en_GB), retrieved 2026-08-11 | Post form informs caption and asset handoff. |
| IG-02 | [Instagram Help: comment controls](https://www.facebook.com/help/instagram/1766818986917552), retrieved 2026-08-11 | Comment availability is a post-side control, not a drafting assumption. |
| TT-01 | [TikTok Support: Add Yours](https://support.tiktok.com/en/using-tiktok/creating-videos/add-yours?lang=en), retrieved 2026-08-11 | Posts begin with video or photo material and interactive features need explicit context. |
| TT-02 | [TikTok Support: Comments](https://support.tiktok.com/en/using-tiktok/messaging-and-notifications/comments?lang=en), retrieved 2026-08-11 | Comment drafting is separate from reporting, deletion, and filters. |
| RD-01 | [Reddit Help: Posting and commenting](https://support.reddithelp.com/hc/en-us/sections/201015409-Posting-Commenting), retrieved 2026-08-11 | Submission and comment surfaces warrant separate contracts. |
| RD-02 | [Reddit Help: Community settings](https://support.reddithelp.com/hc/en-us/articles/15484546290068-Community-settings), retrieved 2026-08-11 | Community-specific restrictions require supplied rule context. |
| PT-01 | [Patreon Help: Posting to Patreon](https://support.patreon.com/hc/en-us/articles/115004048046-Posting-to-your-Patreon), retrieved 2026-08-11 | Post format and member-access intent are separate from account controls. |
| PT-02 | [Patreon Help: Comment settings](https://support.patreon.com/hc/en-us/articles/19789361628045-Comment-settings), retrieved 2026-08-11 | Comment access and moderation are not assumed. |
| PI-01 | [Pinterest Help: Create a Pin](https://help.pinterest.com/en/article/create-a-pin-from-an-image-or-video), retrieved 2026-08-11 | A Pin joins asset, description, link, board, topic, and disclosure context. |
| PI-02 | [Pinterest Help: Comment on a Pin](https://help.pinterest.com/en/article/comment-on-a-pin), retrieved 2026-08-11 | Comment and reply drafting remains separate from comment management. |
| SL-01 | [Slack Help: Send and read messages](https://slack.com/help/articles/201457107-Send-and-read-messages-in-Slack-Send-and-read-messages-in-Slack), retrieved 2026-08-11 | New channel message drafting must keep mentions and scheduling account-side. |
| SL-02 | [Slack Help: Use threads](https://slack.com/help/articles/115000769927-Use-threads-to-organize-discussions-in-channels), retrieved 2026-08-11 | A thread reply is distinct from a reply sent to a channel’s main view. |
| MS-01 | [Microsoft Support: Send or reply to a channel message](https://support.microsoft.com/en-gb/office/send-or-reply-to-a-channel-message-in-microsoft-teams-5c8131ce-eaad-4798-bc73-e33f4652a9c4), retrieved 2026-08-11 | Posts and replies are separate channel surfaces. |
| MS-02 | [Microsoft Support: Channel moderation](https://support.microsoft.com/en-us/teams/teams-channels/change-moderator-roles-and-settings-in-a-channel-in-microsoft-teams), retrieved 2026-08-11 | Do not assume permission to start or reply to a channel post. |
| TG-01 | [Telegram FAQ: Groups and channels](https://telegram.org/faq), retrieved 2026-08-11 | Channels broadcast; groups support conversation and replies. |
| TG-02 | [Telegram API: Channel and group types](https://core.telegram.org/api/channel), retrieved 2026-08-11 | Discussion groups, topics, and permissions require explicit context. |
| LI-01 | [LinkedIn Help: Post and share updates](https://www.linkedin.com/help/linkedin/answer/a527227), retrieved 2026-08-11 | Visibility, comments, and labels remain account-side choices. |
| LI-02 | [LinkedIn Professional Community Policies](https://www.linkedin.com/legal/professional-community-policies), retrieved 2026-08-11 | Truthfulness, respect, disclosure, and anti-manipulation boundaries. |

## Learning record

- **Initial condition:** 15 existing public-neutral social-posting packages;
  eight requested platforms lacked native-surface adapters.
- **Hypothesis:** Separating each platform by native posting and response or
  messaging surfaces will improve routing precision and prevent a generic
  post/comment abstraction from leaking account actions into the draft layer.
- **Change:** Added 16 packages, risk-based `evals/evals.json` records, and
  routing. Renewed two LinkedIn packages to use a portable public-context scrub
  checklist.
- **Rejected alternatives:** One generic package per platform; a universal
  social-post skill; treating Slack, Teams, or Telegram as direct messages;
  and copying the LinkedIn workflow to every platform.
- **Expected benefit:** Better trigger precision, explicitly supplied runtime
  context, and draft-only guardrails tuned to each platform’s native surface.
- **Regression risk:** Platform features and help pages can change; all live
  availability, permissions, visibility, and eligibility are therefore caller
  inputs or account-side review items.
- **Evaluation result:** Structural validation passed. Development fixtures are
  design-only. Holdouts are `external-required`, and evidence remains `not-run`.
- **Decision:** Retain the package set as an analytical distribution candidate.
  Renew sources and run isolated, unseen-holdout evaluation before any claim of
  demonstrated task-quality uplift or usable maturity.
