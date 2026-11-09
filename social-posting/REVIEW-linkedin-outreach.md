# Equilibrium review (inline, analytical): LinkedIn outreach skill family

Evidence label: analytical only. No live model benchmark or independent run.

## Claim / evidence ledger
| # | Claim | Evidence | Status |
|---|---|---|---|
| 1 | Four candidates are repeatable procedures, not one-offs | Thread executed each step more than once (20-note wave, per-profile send, inbox check, wave pacing) | supported |
| 2 | Notes must be plan-limited | LinkedIn Help a563153, a6239760: 200 chars free, 300 Premium; observed 300 in dialog | supported |
| 3 | Browser-driven sending is safe to publish | LinkedIn Help a1341387 prohibits bots/automated methods to send messages or add contacts | REFUTED |
| 4 | Read-only inbox check via agent is compliant | Same terms: automated access to the Services | NOT SUPPORTED, so mode-gated |
| 5 | Family is public-neutral | No names, handles, employers in packages; scan below | supported |
| 6 | Skills improve results | none run | not-run |

## Roles
- Evidence: claims 3 and 4 fail on the primary source. Claim 6 has no run evidence. Disposition: limits.
- Outcome: all four fill real gaps; draft-only contracts hold. Concern: evals are synthetic and unrun.
- Safety/portability: automation terms risk, separation-agreement scrub is only as good as sender-supplied rules, public neutrality needs a scan.

## Disruptor
Strongest objection: the family exists to make bulk LinkedIn outreach easier, and the platform bans the automation that makes it scale. Publishing a send adapter would be a how-to for violating the User Agreement.

## Negotiator (resolution)
1. Remove the browser send adapter from the public package. Replace with a manual send checklist.
2. Inbox triage defaults to pasted text; host-read mode is the sender's explicit, informed risk choice.
3. Network plan keeps pacing and feedback but states that it does not evade limits, and the eval covers a limit-evasion request.
4. Browser mechanics stay only in the owner's private platform skill (linkedin-browser-operator), where the owner carries the decision.
5. Declare all four `draftable`, evidence `not-run`. No validated claims.

## Decisions
| Skill | Decision |
|---|---|
| okhp3-linkedin-connection-note | approve-with-limits |
| okhp3-linkedin-message | approve-with-limits |
| okhp3-linkedin-network-plan | approve-with-limits (no send adapter) |
| okhp3-linkedin-inbox-triage | approve-with-limits (paste-first) |
| public separation-comms-guardrails | defer-for-evidence |
