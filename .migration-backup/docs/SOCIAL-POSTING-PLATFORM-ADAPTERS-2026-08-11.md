# Social-posting platform adapters: YouTube and Ko-fi

Date: 2026-08-11

## Decision

Add five account-neutral, draft-only contracts to `social-posting/`:

- `okhp3-youtube-video` for video metadata and uploader handoff.
- `okhp3-youtube-community-post` for creator channel posts and supplied
  subscriber Community contributions.
- `okhp3-youtube-comment` for video or post replies.
- `okhp3-kofi-post` for public or supporter-access content posts.
- `okhp3-kofi-supporter-reply` for redacted private supporter conversations.

This split follows the platform surfaces rather than forcing either platform
into the Facebook or X post-and-comment pattern. It deliberately excludes
uploading, account administration, payment processing, member lookup,
analytics, moderation, scheduling, and publication.

## Source ledger

| ID | First-party source | Decision supported |
|---|---|---|
| YT-01 | [Upload YouTube videos](https://support.google.com/youtube/answer/57407?hl=en), retrieved 2026-08-11 | Video details, audience, visibility, disclosure, and chapter handoff are distinct from writing a social post. |
| YT-02 | [Video Chapters](https://support.google.com/youtube/answer/9884579?hl=en), retrieved 2026-08-11 | Chapters require creator-supplied timestamps and begin at `00:00`; a skill must not invent them. |
| YT-03 | [Learn about posts](https://support.google.com/youtube/answer/9409631?hl=en), retrieved 2026-08-11 | A channel's posts have distinct forms and availability boundaries. |
| YT-04 | [Participate in Communities](https://support.google.com/youtube/answer/15739409?hl=en), retrieved 2026-08-11 | A subscriber Community is a separate destination with creator-controlled access. |
| YT-05 | [Review & reply to comments](https://support.google.com/youtube/answer/9482367?hl=en), retrieved 2026-08-11 | Reply drafting must stay distinct from heart, pin, and moderation actions. |
| KF-01 | [Creating posts? Let's make them shine!](https://help.ko-fi.com/hc/en-us/articles/360007638073-Creating-posts-Let-s-make-them-shine), retrieved 2026-08-11 | Post forms, audience selection, tags, and notification effects make access boundary essential. |
| KF-02 | [Offering supporter-only content](https://help.ko-fi.com/hc/en-us/articles/360005111213-Offering-supporter-only-content), retrieved 2026-08-11 | Supporter and membership access are account-dependent and must not be presumed by a reusable skill. |
| KF-03 | [Direct messages on Ko-fi](https://help.ko-fi.com/hc/en-us/articles/360016956178-Direct-messages-on-Ko-fi), retrieved 2026-08-11 | Supporter messaging is private and can be payment-linked. |
| KF-04 | [What information do supporters share?](https://help.ko-fi.com/hc/en-us/articles/360009392953-What-information-do-supporters-share-Public-private-options), retrieved 2026-08-11 | Supporter names, email addresses, and messages require privacy controls. |

## Rejected alternatives

- A generic `okhp3-youtube-post` would blur a channel post with video metadata
  and a subscriber Community contribution.
- A Ko-fi poll package is deferred until a concrete recurring use case appears.
  Ko-fi polls have their own audience and immutable-question constraints, so
  they should not be silently absorbed into `okhp3-kofi-post` later.
- No account browser session, channel state, supporter data, or payment record
  was consulted. The new packages are shareable across creators because they
  work only from user-supplied public-safe or redacted context.

## Evidence status

The packages have version-matched design evaluations with external-required
holdouts marked `not-run`. This record supports structural and source review,
not live task-quality or publication claims.
