# Surfaces and selectors

Observed 2026-11. These are volatile. Treat them as starting points, and trust
the page.

## Messaging

- Composer: a contenteditable element with class `msg-form__contenteditable`.
  An overlay composer opened from a profile may not match that selector; use a
  screenshot and a coordinate click inside the box.
- Send button: `button.msg-form__send-button`; disabled when the composer is empty.
- Sent items: list elements with class `msg-s-event-listitem`.
- Paragraphs: each Shift+Return pair produces an empty paragraph between text
  paragraphs, so a three-paragraph message reads as seven paragraph elements.
- Verification read: composer `innerText` before sending, last list item after.

## Post comments

- Editor: a ProseMirror element (`.tiptap.ProseMirror`).
- Limit: LinkedIn caps comments at 1,250 characters. Over the limit the editor
  shows a red outline and the Comment button stays disabled.
- Identifiers: a post can be addressed as an activity or a share URN. If one
  form shows "Post not found," try the other.
- Posting from a signed-out public view shows only a sign-in prompt; sign in first.

## Mentions

Type the at-sign and name, wait about three seconds, screenshot the dropdown,
and choose the entry whose headline confirms identity. If results are stale,
Backspace and retype the last letter. Select by dispatching pointer and mouse
events on the `[role=option]` element, then confirm a `span[data-type=mention]`.
A comma directly after a mention can render as "Name , text"; type the body
first, then place the comma, and verify with `innerText`. Names carrying
credentials after a comma break mentions; trim the mention back to the first name.

## Connection requests

- Profiles with Follow as the primary action put Connect under the More menu.
- The Add a note dialog shows a live counter. One account showed 0/200. Trust the
  counter over any documented number.
- Confirmation: a toast reading "Invitation sent," and the profile button changing
  to Pending. A dialog still present after clicking Send means it did not send.

## Reply popups

New message popups can arrive during typing. Close them before typing, and read
them after the action because they are often new replies worth surfacing.
