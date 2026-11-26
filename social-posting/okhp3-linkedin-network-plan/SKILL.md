---
name: okhp3-linkedin-network-plan
description: >
  Plan a LinkedIn network expansion: audit followed-but-unconnected accounts,
  segment and tier targets toward the sender's chosen audience, dedupe against
  pending and excluded lists, pace outreach in waves, and adjust from
  acceptance results. Use when the user wants to rebalance or grow a network on
  purpose. It returns a plan and a wave list only. Do not use for sending,
  note writing, or message writing.
license: MIT
metadata:
  public_artifact: true
  author: Public Agent Skill Library
  version: "1.0.0"
  category: social-posting
  origin: portable-agent-skills
  in_scope: "Planning LinkedIn outreach waves from supplied account lists, segment goals, exclusions, and acceptance feedback."
  out_of_scope: "Sending invitations, drafting notes or messages, scraping, automating, or any plan that evades platform limits."
---

# okhp3-linkedin-network-plan

Portable, identity-agnostic Agent Skill.

## Public-package data boundary

This package and its fixtures contain no execution account, person, project,
campaign, topic, bias, opinion, or private URL. Use placeholders in public
examples and obtain all such context from the current run only.

Network growth is a sequencing problem. Pick the right people, in the right
order, at a pace the platform and the sender can sustain.

## Scope

This package produces a segmented target audit, a wave plan, and a feedback
loop. Note text comes from `okhp3-linkedin-connection-note`. Replies come from
`okhp3-linkedin-message`. Sending is done by the sender by hand.

## Process

1. Establish the goal and constraints from the current run: the audience the
   sender wants more of, the audience they want less of, account type, a wave
   size they can sustain, a gap between waves, and any exclusions, such as
   people they must not contact or categories to skip. Without a stated goal,
   return `NEEDS INPUT`.
2. Build the working lists from supplied data: followed-but-unconnected
   accounts, existing connections by segment, pending invitations, and past
   exclusions. If a list can only be read from the live site, say so and use
   the sender's pasted text or export. Do not scrape.
3. Audit the current mix. Count connections by segment so the bias is visible
   as numbers. State the gap between the current mix and the sender's goal.
4. Segment the candidates into lanes tied to the goal. Tier each person: reach
   tier (high-reach, mid, peer), relevance to the sender's real work, and
   whether a specific hook exists. Prefer relevance with a real hook over raw
   follower count. Remove duplicates, pending invitations, existing
   connections, excluded categories, and anyone flagged by a restriction the
   sender supplied.
5. Order the waves. Put the highest-relevance, strongest-hook targets in the
   earliest waves. Spread high-reach names across waves instead of stacking
   them. Hold recruiters and cold-sales profiles for a separate, deliberate
   decision. Reserve a small buffer of alternates for skips.
6. Build the pacing plan: wave size, business-day gap, and a check before each
   wave. The check reads acceptances and declines from the last wave and adjusts
   lanes. A lane with a poor acceptance rate gets fewer slots or a revised hook
   approach. Use `references/wave-feedback.md`.
7. Keep a record the sender can reuse: wave number, name or label, lane, status
   (planned, sent, pending, accepted, skipped with reason), and send date. Mark
   skips such as email-gated profiles with their reason. Do not guess contact
   details.
8. Hand the approved wave to the sender as a manual send checklist from
   `references/manual-send-checklist.md`. The sender sends each invitation
   themselves in their own session. This package does not drive the site with
   a bot, script, or browser automation, because LinkedIn's terms prohibit
   automated methods to send messages or add contacts.
9. Return the audit, the wave plan, the feedback checkpoints, and the risks.
   Do not send anything.

## Output contract

Return `Audit`, `Segments and tiers`, `Wave plan`, `Feedback checkpoints`,
and `Risks and limits`. For an unknown account type or an unconfirmed weekly
limit, state the assumption and the way to verify it. Do not promise a result,
an acceptance rate, or a reach number.

## Validation

Before return, verify the plan serves the stated goal, every excluded or
pending person is removed, waves are within the sender's stated size and pace,
a feedback check precedes each later wave, and nothing in the plan evades a
platform limit or automates sending without human approval.

## Platform boundary

LinkedIn limits and can restrict invitation volume, and its terms prohibit
bots or other automated methods to add contacts or send messages. A suspected
automation tool can lead to a restricted account. Limits change and differ by
plan, so verify current figures instead of relying on remembered numbers.
Withdrawing invitations does not lift an invitation restriction. A plan that
looks efficient on paper can still harm the account if it ignores that.

## Current platform reference

- [LinkedIn Help: prohibited software and extensions](https://www.linkedin.com/help/linkedin/answer/a1341387/prohibited-software-and-extensions?lang=en) (retrieved 2026-11-09) lists bots and automated methods that send messages or add contacts as violations of the User Agreement.
- [LinkedIn Help: invitation limit reached](https://www.linkedin.com/help/linkedin/answer/a550555) (retrieved 2026-11-09) states that all members are subject to invitation limits and that a restriction lasts about a week.
- [LinkedIn Help: excessive invitation requests](https://www.linkedin.com/help/linkedin/answer/a548476/excessive-invitation-requests-sent-on-linkedin?lang=en) (retrieved 2026-11-09) says excessive invitations with suspected automation can lead to suspension or restriction.

## Public-neutrality gate

Keep this package portable for public distribution. Do not embed a person name,
account handle or URL, private identifier, employer or organization identity,
product or project name, campaign name, or user-specific subject in instructions,
examples, references, or evaluation fixtures. Resolve account, destination,
audience, subject, links, current facts, and visibility from execution-time
context. Use placeholders or supplied evidence; platform help links may remain.

## About

This package is distributed as a portable, identity-agnostic Agent Skill.
It resolves account, destination, audience, subject, and source context at execution time.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
