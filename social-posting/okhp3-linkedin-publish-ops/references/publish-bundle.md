# Publish bundle

Load this at Step 1. The bundle is the single source of truth for every action.
If any field changes after approval, the approval for that field lapses.

## Public artifact boundary

Identity-agnostic. All values come from the current run.

## Fields

| Field | Required | Notes |
|---|---|---|
| `account` | Yes | The acting profile or page, as the user names it. Never inferred. |
| `post_text` | Yes | Final, approved text with paragraph breaks preserved. |
| `post_text_sha256` | Yes | Hash of `post_text` as approved, used to detect drift. |
| `hashtags` | No | List, plus where they go: `post`, `first_comment`, or none. |
| `document` | No | Local path, document title to type at upload, page count, file size. |
| `schedule` | No | `YYYY-MM-DD`, `HH:MM`, IANA time zone (for example `America/Chicago`). Omit to post now, which still needs approval. |
| `first_comment` | No | Final text, its hash, and timing (normally right after go-live). |
| `replaces` | No | For recreate or swap: the scheduled entry being replaced, identified by its date, time, and first line. |
| `related_posts` | No | Other scheduled posts this one refers to or follows, for the dependency check. |
| `approvals` | Yes | The user's words that approved each named action, with the time. |

## Pre-action checks

| Check | Pass condition | On failure |
|---|---|---|
| Text drift | Hash of the text about to be typed equals `post_text_sha256` | Stop; ask for approval of the new text |
| Bare domains | No `name.tld` without a scheme, unless the user wants a preview card | Flag to the user; route the fix to the drafting skill |
| Hashtag count | Matches the user's requested count across post and comment, with no duplicates | Stop and ask |
| Time zone | Go-live restated in the account's time zone and confirmed | Ask |
| Dependencies | No reordered post refers to one that would now come after it | Show the conflict; the user decides |
| Document | File exists, is a PDF or another type the platform accepts, and the page count matches | Stop |
| Approvals | Every planned action is named in `approvals` | Ask for the missing approval |

## Hashing

```bash
printf '%s' "$POST_TEXT" | sha256sum
```

Any equivalent is fine. Hash the text exactly as approved, without trailing
whitespace changes.
