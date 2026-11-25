# Browser adapter (operator mode)

Host adapter for an agent browser tool that can read the DOM, find elements by
accessible name, click by element reference, and type into a focused editor in
the user's signed-in session. The core skill never depends on it; when any
check below fails, fall back to the manual handoff.

## Public artifact boundary

Identity-agnostic. Labels are platform interface text, not account data.

## Freshness

| Field | Value |
|---|---|
| `observed_on` | 2026-11-09 |
| `ui_locale` | en-US, desktop web |
| `revalidate_after` | 2027-02-01 |

Past `revalidate_after`, run every expected-label precheck before acting and
record the result. A missing label is a stop, not a guess.

## Rules for every step

1. **Precheck the label.** Find the control by its accessible name before
   using it (for example the composer's contenteditable textbox, a comment
   textbox named "Text editor for creating comment", or the "Schedule",
   "Comment", "Modify schedule", and "Delete post" controls). If it is absent,
   stop and hand off.
2. **Click by reference, not coordinates.** Emulated viewports and screenshot
   scaling can make a coordinate land on a different element. If only a
   coordinate is available, take a fresh screenshot at the current viewport
   first.
3. **Clear fields by selecting, not by counting.** Focus the field, select all
   (or use the DOM to select its contents), delete, type, then read the value
   back. Never rely on a fixed number of Backspace presses.
4. **Read back before confirming.** Compare editor `innerText` with the bundle
   text and the dialog's "posting at" text with the bundle schedule.
5. **Verify after acting** from the DOM: the scheduled list, the post body, or
   the rendered comment's full text (expand "more" or read the node's text).

## Composer

- Type each paragraph, then press Enter twice. Pasting into the editor can drop
  apostrophes and paragraph breaks; typed text keeps them.
- To replace all text in an existing editor: select the editor's contents
  through the DOM, press Backspace, then type. Read back the result.
- Typing a hashtag or `@` opens a suggestion list. Finish the token with a
  space and check the read-back so a suggestion did not replace it.

## Document attach

- Open the composer's more (+) menu, then the document option. The file picker
  belongs to the operating system: ask the user to choose `<DOCUMENT_PATH>`,
  then type the document title and select Done.
- A scheduled post cannot take a document. Recreate it (Step 3 approvals
  apply), verify the new entry, then ask before deleting the old one.

## Scheduling

- Clock icon, then the date and time fields. Use the field's own format (it
  can be locale-dependent; en-US showed `mm/dd/yyyy` and `h:mm AM`). Close any
  open time list by moving focus, then read the "posting at" line.
- Scheduled list: composer, clock icon, the "Scheduled" tab. Each entry's
  "..." menu offers Post now, Modify schedule, Edit post, and Delete post.

## First comment

- Open the comment box under the live post, focus the comment editor by
  reference, and type. Use Shift+Enter twice between paragraphs; plain Enter
  submits.
- Before submitting, read the editor's `innerText` and compare it with the
  bundle. Find the submit button inside the same comment form, not the post's
  action bar, which also has a button named "Comment".
- After submitting, confirm exactly one new comment by the account with the
  full text. If the result is unclear, check the page or the account's
  comments activity before any retry.

## Pop-ups and interruptions

- Close a messaging window or prompt that covers the target with its close
  control. Never accept anything inside it.
- If the page shows a sign-in screen, a verification challenge, or a
  CAPTCHA, stop and hand back to the user.
- If an operating-system dialog appears, stop; it can block the page until the
  user dismisses it.
