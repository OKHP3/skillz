# Synthetic worked example

Inputs are synthetic labels, not real accounts or correspondence. The review
clock is 16:00 UTC. All event times in this example explicitly use UTC.

| Event | Case | Time | Observation |
|---|---|---|---|
| M1 | CONTACT-A / ROLE-A | 12:00 | Contact asks for a clarification and a file, promising to review and reply |
| M2 | CONTACT-A / ROLE-A | 12:30 | Candidate answers the clarification and promises a file |
| M3 | CONTACT-A / ROLE-A | 13:00 | Candidate sends ADDENDUM.docx; sent attachment is visible |
| N1 | CONTACT-A / ROLE-A | arrives 15:00 | Email notification explicitly links to M1 |
| M4 | CONTACT-B / ROLE-B | 14:00 | Contact says the client reviewer is away for a few days and promises to return with feedback |
| M5 | CONTACT-B / ROLE-B | 14:10 | Candidate replies with an acknowledgement |

Coverage: both conversations' relevant windows and latest visible exchanges
were inspected directly. No account-wide coverage is claimed.

Expected brief:

- CONTACT-A / ROLE-A: The clarification and file request are addressed by M2
  and M3. N1 is a delayed copy of M1, not a new open request. The next response
  is with CONTACT-A under its explicit review-and-reply commitment. ADDENDUM.docx was sent to the contact; its contents and
  onward client submission were not verified. No later reply is visible in the
  reviewed window.
- CONTACT-B / ROLE-B: The candidate already acknowledged the delay. The next
  promised update is with CONTACT-B; client feedback is its dependency. "A few
  days" supplies an estimate,
  not a fixed deadline. Do not ask the candidate to acknowledge it again.

Counterfactual: without a contact follow-up commitment or outstanding question,
fulfilled requests create no further evidenced obligation. Do not infer that
the contact owes a reply simply because the candidate sent a file.

If M3 is not visible and the candidate only says "I will send
it", retain the file request as open. If outbound access is blocked, classify
reply status as unverified instead of concluding that no reply exists.
