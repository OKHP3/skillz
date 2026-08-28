---
name: threat-modeling
description: Works out what could go wrong in a system's design before it is built — who would attack it, how, and which defences are worth having. Use this whenever the user is designing a system that handles sensitive data, money, or authentication, asks what the security risks are, mentions threat modeling or STRIDE, or is starting a feature with a meaningful attack surface. This is design-time and systematic; for finding vulnerabilities in code that exists, use security-analysis.
license: MIT
---

# Threat modeling

Threat modeling asks *what could go wrong here* while the answer is still cheap to act on. Code
review finds the bug you wrote; threat modeling finds the defence you never designed.

Four questions structure the whole exercise:

1. **What are we building?**
2. **What can go wrong?**
3. **What are we going to do about it?**
4. **Did we do a good enough job?**

The output is a short list of decisions, not a risk register nobody reads.

## 1. Draw the system and mark the trust boundaries

You cannot reason about attacks without knowing where untrusted things meet trusted things.

Sketch: the components, the data flows between them, the datastores, and — most importantly —
the **trust boundaries** those flows cross. A boundary is anywhere the level of trust changes:
internet to your edge, your service to a third party, one tenant's data to another's, user to
admin.

Keep it to one diagram someone can hold in their head. See `diagramming`.

**Done when:** every trust boundary in the design is marked.

## 2. Name the attackers and what they want

Generic "hackers" produces generic mitigations. Be specific about who and why:

- **An anonymous internet user:** the largest population, lowest capability
- **A legitimate user acting maliciously:** has valid credentials. Most under-modelled, and the
  source of most real access-control failures
- **A compromised account:** a real user whose credentials were stolen
- **A malicious or compromised insider:** has infrastructure access
- **A compromised dependency:** code you did not write, running with your privileges

For each, what would they want here? Data, money, disruption, access to something else? An
attacker with no motive for your system is not worth designing against.

**Done when:** each attacker has a stated capability and objective.

## 3. Walk each element with a prompt list

Systematic beats creative. Use STRIDE against each component and flow:

| | Threat | Ask |
| --- | --- | --- |
| **S** | Spoofing | Can someone pretend to be another user or service? |
| **T** | Tampering | Can data be modified in transit or at rest? |
| **R** | Repudiation | Could someone deny an action, and could you prove otherwise? |
| **I** | Information disclosure | Can data leak to someone who should not see it? |
| **D** | Denial of service | Can someone make it unavailable, cheaply? |
| **E** | Elevation of privilege | Can someone gain rights they should not have? |

The prompt list matters because it surfaces the categories you do not naturally think about —
repudiation and DoS are consistently the ones teams skip.

**Done when:** every element has been walked against all six.

## 4. Prioritise by reachability and impact

You cannot mitigate everything. Rank by:

- **Who can reach it:** anonymous internet > authenticated user > admin > physical access
- **What it gets them:** full compromise > other users' data > their own data > information
- **How hard:** a single request > a chained multi-step attack > requires an insider

Then decide, explicitly, for each: **mitigate, accept, transfer, or eliminate.** Accepting a risk
is a legitimate decision when written down with a reason. Silently not addressing it is not the
same thing, and the difference matters at the review afterwards.

**Done when:** each threat has a named decision, including the accepted ones.

## 5. Prefer structural mitigations

Rank the fixes by how hard they are to get wrong later:

1. **Eliminate** — do not store the data, do not build the feature. Nothing beats not having it
2. **Structural** — a permission boundary, a separate credential, a network segment. Holds even
   when someone writes a bug
3. **Code-level** — validation, encoding, authorization checks. Effective and easy to omit on a
   new path
4. **Detective** — logging, alerting. Does not prevent, but bounds the damage

A control that depends on every future developer remembering it will eventually fail. Push
protections down to where the platform enforces them.

**Done when:** the important threats have structural, not procedural, mitigations.

## 6. Write it down briefly, and revisit it

A page or two: the diagram, the boundaries, the ranked threats, the decisions.

Revisit when the design changes materially — a new integration, a new data type, a new user
role. A threat model from before the third-party integration does not cover it.

**Done when:** the document is short enough that it will be read again.

## Report

Give the diagram, the top threats with their decisions, and — separately — the **accepted risks**
with their reasoning. That accepted list is the most valuable output: it is the record of what
you knowingly chose, which is what distinguishes a considered design from an oversight.
