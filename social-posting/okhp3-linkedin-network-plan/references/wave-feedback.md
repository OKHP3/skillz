# Wave Feedback Loop

Run this check before every wave after the first.

1. Read the last wave's outcomes from the account's sent-invitation and
   connection views, from sender-pasted text or an export the sender made.
   Record accepted, still pending, declined or withdrawn, and skipped.
2. Compute acceptance by lane. Report counts, not impressions. Do not treat a
   small sample as a rate. Under about ten sends per lane, call the result
   directional.
3. Adjust: add slots to lanes that accepted, trim lanes that did not, and
   revise the hook approach in weak lanes before spending more slots there.
4. Withdraw stale pending invitations only when the sender approves. Old
   pending invites can depress future acceptance and clutter the sent list.
5. Refill skipped slots from the alternates buffer. When the candidate pool
   runs low, propose new targets for the sender to approve instead of
   silently widening the audience.
6. Restate the next wave and ask for approval before anything is sent.
