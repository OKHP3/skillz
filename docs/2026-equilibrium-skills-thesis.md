---
title: "The Equilibrium Skills Thesis"
subtitle: "Harmony, Disruption, and Evidence in Portable Agent Workflows"
author: "Jamie Hill"
date: "2026-07-28"
document_type: "conceptual technology thesis"
status: "working draft"
estimated_print_length: "5-7 pages plus bibliography at 11-12 point type"
keywords:
  - Agent Skills
  - prompt equilibrium
  - multi-agent systems
  - constructive dissent
  - evaluation
  - provenance
  - interoperability
  - human-in-the-loop governance
citation_style: "Chicago author-date conventions with stable hyperlinks"
source_lineage: "2025 Prompt Equilibrium and Beyond Equilibrium papers supplied by Jamie Hill, translated for the 2026 Agent Skills ecosystem"
claims_status: "Conceptual thesis. Design claims are proposed; empirical claims are cited or marked as hypotheses."
---

# The Equilibrium Skills Thesis

## Harmony, Disruption, and Evidence in Portable Agent Workflows

### Abstract

This thesis revisits a framework I first developed for custom GPT systems. The earlier framework used equilibrium as a design metaphor: several internal agents could agree on a result, but agreement alone was not enough. When the system reached harmony, it should introduce a disruptor that tried to break the answer. When the agents already disagreed, a further disruptor was unnecessary. When disagreement remained unresolved, a negotiator or jury should examine the competing positions and decide what could responsibly be released.

The technology has changed. The underlying problem has not. Portable Agent Skills now package procedural knowledge into discoverable, versioned folders that can be used across compatible agent runtimes. A skill can therefore be treated as a small socio-technical system, not merely as a prompt. Its quality depends on more than eloquence. It depends on trigger fit, execution reliability, evidence, safety, portability, provenance, and the ability to learn without confusing repetition with improvement.

I call the proposed translation the **Equilibrium Skills Thesis**. Its central claim is that a mature skill should seek a bounded operational equilibrium rather than permanent agreement or a claim of perfection. The skill should form provisional harmony among independent evaluations, conditionally activate a disruptor when that harmony could be false, and use an evidence-based negotiator when material disagreement remains. Each revision should leave a learning record that makes the reason for change inspectable. The goal is not to create a diamond that can only be cut by itself. The goal is to create a system that can use better tools, better critics, external holdouts, and human judgment without losing its identity.

The thesis is deliberately modest. It is a research and design position, not a proof that multi-agent debate always improves outcomes. It offers a testable architecture for skills that need to remain useful as models, runtimes, and conventions change.

## Reader's note: what this paper is and is not

This is a companion thesis, not a release note for a particular version of the Skill Foundry. It preserves the conceptual inheritance of my 2025 Prompt Equilibrium work while changing the object under study from a custom GPT prompt to a portable Agent Skill. The old work is the primary conceptual source. The external sources in the bibliography are the current technical and research context against which I am testing that idea.

The phrase “equilibrium” is used here as an operational analogy informed by game theory, not as a claim that a skill is literally a Nash equilibrium. Nash defined an equilibrium point as a self-countering set of strategies in which no player can improve its payoff by changing strategy alone (Nash 1950). A skill has no single payoff function and its reviewers are not independent economic players in the formal sense. The analogy becomes useful only after I state the boundaries: what counts as agreement, what counts as disruption, what evidence can overturn a judgment, and who is authorized to resolve an unresolved conflict.

## 1. The thesis in one sentence

**A portable Agent Skill should be maintained as a bounded equilibrium process: independently test its usefulness, safety, evidence, and portability; introduce targeted disruption when agreement may be premature; adjudicate material disagreement with explicit evidence; and release only what the record can support.**

That sentence contains five commitments.

1. **Bounded.** The process has stopping rules, escalation rules, and a defined release scope. More agents are not automatically more rigor.
2. **Independent.** Agreement is meaningful only when reviewers do not merely copy the same initial answer.
3. **Disruptive.** A dissenting pass searches for falsifying examples, hidden assumptions, unsafe side effects, and cases where a polished instruction fails.
4. **Evidence-based.** A negotiator compares artifacts, test results, citations, and user requirements rather than counting votes.
5. **Releasable.** The final judgment records what was tested, what was not tested, and what remains external or protected.

The thesis is therefore a governance pattern for skill evolution. It is not a recipe to maximize the number of agents in a room.

## 2. From Prompt Equilibrium to Skill Equilibrium

My first model assumed a coordinated set of roles inside a custom GPT. An auditor checked correctness, a stylist checked expression, a router chose the next phase, a compressor protected context, and a simulator looked for downstream behavior. The system moved through phases such as understand, plan, verify, refine, and act. The important idea was not the names of the roles. It was the separation of functions that are often collapsed into one confident answer.

Agent Skills make that separation tangible. The open Agent Skills specification defines a skill as a directory with a required `SKILL.md`, optional scripts, references, and assets. It also specifies progressive disclosure: an agent first sees a short name and description, loads the full instructions only after activation, and reads supporting resources as needed (Agent Skills 2025). Anthropic's description of the same ecosystem makes the practical point that a skill packages procedural knowledge so a general-purpose agent can perform specialized work, while the open standard aims at cross-platform portability (Anthropic 2025).

This changes the unit of analysis. A prompt is mainly an interaction. A skill is an interface plus a workflow, resources, assumptions, and a maintenance history. Its failure modes include at least four layers:

- **Discovery failure:** the right skill is not selected, or the description triggers it for the wrong task.
- **Instruction failure:** the skill is selected, but its steps are ambiguous, internally contradictory, or too large to load reliably.
- **Execution failure:** the instructions are clear, but tools, permissions, files, or runtime behavior invalidate the intended workflow.
- **Evidence failure:** the package appears to work in examples, yet no independent holdout shows that it works outside the examples that shaped it.

Prompt Equilibrium becomes Skill Equilibrium when the review process evaluates all four layers. A beautiful `SKILL.md` can still be a poor skill if it activates too broadly, assumes unavailable tools, hides its dependencies, or has never met an unseen task.

## 3. Equilibrium is a bounded operational state

The word “harmony” can be misleading. In a group of language-model reviewers, agreement can be caused by shared evidence, shared blind spots, or a shared desire to finish. Those are different states. I therefore define operational equilibrium as the point at which the available evidence supports release within a stated scope, while the remaining uncertainty is named rather than denied.

Let a skill be evaluated on five dimensions: **U** (usefulness), **S** (safety), **P** (portability), **E** (evidence integrity), and **D** (discoverability and trigger fit). An equilibrium judgment is not a single score. It is a vector with thresholds and a confidence statement:

`Q(skill) = (U, S, P, E, D | scope, holdout, unresolved risks)`

The notation is intentionally plain. It reminds the reviewer that a high usefulness score cannot compensate for a safety failure, and a perfect structural validator cannot substitute for a live task evaluation. A package may be structurally valid and still be unproven in use.

This distinction matters for self-improvement. A system that judges itself only by internal consistency can become very good at preserving its own assumptions. The diamond metaphor captures the danger. A diamond does not become the best cutting instrument merely because it is hard. Hardness is one property. Precision, geometry, heat management, and the material being cut still matter. Likewise, a skill does not become unbeatable because it can rewrite its own instructions. It needs external friction.

The practical consequence is a release record with three labels:

| Label | Meaning | Permitted claim |
| --- | --- | --- |
| **Supported** | Evidence meets the stated threshold for the declared scope. | “Released for this scope.” |
| **Provisional** | The design is coherent, but an important test is absent, protected, or inconclusive. | “Ready for controlled evaluation.” |
| **Blocked** | A material safety, correctness, portability, or provenance failure remains. | “Do not promote.” |

This is more honest than “perfect” and more useful than a raw confidence percentage.

## 4. Harmony, disharmony, disruptor, and negotiator

The earlier equilibrium framework proposed conditional role activation. I retain that rule because it prevents both under-review and theatrical over-review.

### 4.1 Harmony is convergence with independent reasons

Three reviewers should not be asked the same vague question, “Is this skill good?” They should receive the same artifact and distinct lenses:

- an **evidence reviewer** checks claims, references, tests, and the difference between observed and inferred behavior;
- an **outcome reviewer** checks whether a user can complete the intended task with less ambiguity and less rework;
- a **portability and safety reviewer** checks runtime assumptions, permissions, injection exposure, data handling, and cross-client behavior.

Harmony exists only when their conclusions converge for independently stated reasons. If all three simply repeat the package's own claims, that is not harmony. It is echo.

### 4.2 Disharmony is information, not failure

Disagreement is often the first useful result. The evidence reviewer may accept the claims while the portability reviewer finds that the required tool is not available on another client. The outcome reviewer may find a workflow efficient while the safety reviewer finds that its automation boundary is too broad. These are not opinions to average away. They identify a tradeoff or a missing test.

Disharmony should produce a structured disagreement record:

1. the exact claim or behavior in dispute;
2. the evidence each reviewer used;
3. whether the disagreement is factual, scope-related, value-related, or caused by missing evidence;
4. the smallest test or clarification that could resolve it;
5. the owner authorized to decide if it cannot be resolved empirically.

### 4.3 The disruptor is conditional and falsifiable

If reviewers disagree materially, the system already has disruption. Adding a contrarian for decoration may increase cost without increasing information. If reviewers agree materially, a disruptor becomes useful. Its job is not to argue every sentence. Its job is to attack the strongest version of the proposed release.

A good disruptor receives a narrow brief:

- produce at least one plausible counterexample to the release claim;
- identify one hidden dependency or unstated assumption;
- test whether the proposed improvement creates a regression elsewhere;
- distinguish a real blocker from a preference disagreement;
- state what evidence would make the objection fail.

This is constructive adversarial review. The disruptor is not a permanent skeptic and should not be rewarded for inventing impossible objections. Its output is valuable only when it changes the evidence state, sharpens the scope, or confirms that the release survives a credible attack.

### 4.4 The negotiator is a jury, not a popularity contest

When the disruptor finds a material counterexample, a negotiator or human decision-maker reviews the full record. The negotiator does not “split the difference” between true and false claims. It chooses among actions: release, narrow the scope, add a guardrail, request a new test, or block promotion.

The negotiator should be the least improvisational role in the system. It needs a decision table, not a motivational speech. It should be able to say, “The skill is useful but not portable,” or “The workflow is safe only with human confirmation,” without treating either statement as a total victory or defeat.

## 5. The portable architecture of a self-improving skill

The Equilibrium Skills Thesis implies an architecture with separable layers.

### 5.1 A small activation contract

The frontmatter name and description are not decoration. They are the routing interface. A description should state what the skill does and when it should be used, while staying within the specification's naming and length constraints (Agent Skills 2025). Overly broad descriptions create false harmony by causing the wrong tasks to enter the workflow. Overly narrow descriptions hide useful capability. Discovery tests should therefore include both positive and negative examples.

### 5.2 A bounded core and progressive references

The main `SKILL.md` should contain the minimum execution contract: inputs, phases, decision points, outputs, safety boundaries, and failure handling. Detailed schemas, examples, and domain references belong in focused files loaded on demand. This is not only a context optimization. It creates testable boundaries. A reviewer can ask whether the core still works when a reference is unavailable, and whether a reference adds evidence or merely adds prose.

### 5.3 An evidence ledger

Every material claim should have a status and a source. A useful ledger has fields such as `claim_id`, `claim`, `claim_type`, `source`, `verification_date`, `test`, `result`, `scope`, and `next_review_trigger`. Claim types should distinguish specification facts, observed behavior, design decisions, hypotheses, and user preferences. This prevents an old conceptual paper from silently becoming a current platform fact.

### 5.4 Holdouts and mirrors

Examples that shaped a skill are development data, not a neutral benchmark. A serious self-improvement loop reserves unseen tasks, new runtimes, or protected cases for evaluation. When a holdout cannot be disclosed, the record should say so. A mirror copy of a skill in another repository is valuable for synchronization, but it is not independent evidence if both copies came from the same edit.

### 5.5 A learning ledger

The system should record not only what changed, but why a change was accepted. A learning entry might say: “The portability reviewer found that the workflow assumed a Unix shell. The change replaces the shell-specific instruction with a runtime-neutral branch. The positive test still passes; a Windows and a no-shell case were added.” This turns revision into cumulative knowledge instead of a sequence of unexplained rewrites.

### 5.6 Human authority at the boundary

No equilibrium protocol removes the need for human judgment where stakes, permissions, or values are material. NIST's AI Risk Management Framework organizes trustworthy AI work around govern, map, measure, and manage, with risk management treated as continuous across the lifecycle (Tabassi 2023). The protocol proposed here fits that pattern: governance defines authority, mapping defines scope and dependencies, measurement supplies evidence, and management decides what to change or release.

## 6. What existing research supports, and what remains a hypothesis

The literature supports parts of the architecture, but not the entire thesis as a package. Self-Refine showed that a model can generate feedback on its own output and iteratively revise it, with improvements reported across several tasks (Madaan et al. 2023). Self-Consistency showed that sampling multiple reasoning paths and selecting a consistent answer can improve performance on several benchmarks (Wang et al. 2022). Reflexion used verbal feedback and an episodic memory buffer to alter later decisions without updating model weights (Shinn et al. 2023).

These results justify trying iterative feedback, multiple perspectives, and memory. They do not establish that adding more agents improves every workflow, that a contrarian role reliably finds truth, or that agreement predicts real-world quality. Those are open design hypotheses.

The 2026 thesis offers four testable hypotheses:

**H1, conditional dissent.** A disruptor activated only after material reviewer convergence will find more consequential defects per unit of review cost than a disruptor activated on every task.

**H2, evidence adjudication.** A negotiator supplied with claim-level evidence and explicit scope will produce fewer unsupported release claims than a majority-vote aggregator.

**H3, provenance retention.** Skills that maintain a claim and learning ledger will show lower regression rates across revisions than skills that retain only the latest instructions.

**H4, portability separation.** Testing discovery, core execution, tool assumptions, and output quality as separate layers will reveal failures that a single end-to-end success score misses.

### A minimum evaluation protocol

To test these hypotheses, compare at least three conditions on the same task family:

1. a single-pass skill;
2. a skill with unconditional multi-agent review;
3. a skill with conditional equilibrium review.

Use tasks that were not used to write the latest revision. Randomize task order where practical. Measure completion quality, unsupported claims, safety violations, review cost, time, false-positive escalations, and portability failures. Have a human or independently specified grader score the outputs. Keep the holdout set protected from the authors until the evaluation is complete.

The current Skill Foundry provides a design for this evaluation and records when a live benchmark has not yet been run. That distinction is central. A structural validator can prove that required files, metadata, hashes, and negative cases are present. It cannot prove that an unseen agent completes a new task correctly. The honest state is therefore “evaluation-ready” until the external holdout exists.

## 7. Security and failure modes

Disruption can become a liability if it is not bounded. A contrarian agent may consume unbounded tokens, invent objections, expose sensitive context, or create a false impression of rigor. OWASP lists prompt injection, insecure output handling, supply-chain vulnerabilities, sensitive information disclosure, excessive agency, and overreliance among the major risks for LLM applications (OWASP 2025). Each risk has an equilibrium analogue.

- **Prompt injection** can corrupt the evidence presented to reviewers. Treat external content as untrusted input and preserve provenance.
- **Insecure output handling** can turn a reviewer suggestion into an action without a confirmation gate.
- **Supply-chain vulnerability** can enter through an unreviewed skill, script, or reference file.
- **Sensitive disclosure** can occur when a disruptor receives more context than its task requires.
- **Excessive agency** can turn a negotiator into an unauthorized release manager.
- **Overreliance** occurs when a polished consensus is treated as proof.

The controls are straightforward but not optional: least-privilege tools, explicit approval for consequential actions, bounded review budgets, source labels, tamper-evident records where appropriate, and a human stop condition. A protocol that cannot say “stop” is not an equilibrium process. It is an escalation machine.

## 8. Limitations and the anti-diamond principle

The most important limitation is epistemic. A skill cannot prove its own perfection from inside the same evidence boundary that produced it. Self-review can expose contradictions and improve clarity. It cannot guarantee that the next model, client, operating system, user, or adversary will behave as expected.

There are also practical limitations. Multi-agent review costs time and tokens. Independent agents may share the same training biases. A human negotiator can be rushed or overruled by organizational incentives. A citation ledger can become stale. A holdout can leak. Portability can be claimed across clients that were never actually tested.

For that reason, I reject the strongest version of the diamond metaphor. The goal is not a skill that can only sharpen itself because nothing better exists. That would be a closed system, and closed systems are particularly vulnerable to shared blind spots. The better metaphor is a workshop with calibrated tools. The skill's own method is one tool. External benchmarks, unfamiliar runtimes, domain experts, security reviewers, user reports, and competing methods are other tools. A mature skill knows when to use each one and records what each tool contributed.

## Conclusion: a skill should be stable enough to trust and open enough to learn

The Equilibrium Skills Thesis carries the useful part of the old Prompt Equilibrium idea into a new technology stack. Agreement is valuable, but agreement without independent reasons is fragile. Disagreement is uncomfortable, but it reveals where the system's assumptions diverge. A disruptor is useful when harmony may be false, not because dissent is fashionable. A negotiator is necessary when evidence cannot be reduced to a vote. A ledger is what lets the system learn from the decision rather than merely remember that a decision happened.

The practical standard is therefore neither permanent harmony nor permanent disruption. It is **bounded, evidence-led renewal**. A skill should state what it is for, what it assumes, what it has tested, what it has not tested, and what would cause the next review. It should be portable enough to travel, explicit enough to inspect, and humble enough to invite better criticism.

That is the answer to the question I started with. The skill is not a diamond that can only cut itself. It is a disciplined workshop. Its strength comes from being able to bring in a harder question, a different tool, an unseen task, or a human judgment at the exact moment those things can produce new information. The mark of maturity is not that the skill declares itself finished. The mark is that it knows how to tell whether the next change is an improvement.

## Machine-readable claim ledger

| ID | Claim | Type | Current status | Evidence or next test |
| --- | --- | --- | --- | --- |
| ES-01 | Agent Skills use a directory with `SKILL.md` and optional resources, and support progressive disclosure. | Specification fact | Supported | Agent Skills specification, accessed 2026-07-28. |
| ES-02 | A skill should be reviewed across discovery, instruction, execution, and evidence layers. | Design claim | Proposed | Compare layered evaluation with end-to-end scoring on unseen tasks. |
| ES-03 | Conditional disruption is more efficient than unconditional disruption. | Hypothesis H1 | Unproven | Controlled comparison of three review conditions. |
| ES-04 | Evidence-led negotiation reduces unsupported release claims. | Hypothesis H2 | Unproven | Compare claim-led adjudication with majority vote. |
| ES-05 | A learning ledger reduces regression across revisions. | Hypothesis H3 | Unproven | Longitudinal revision study with protected holdouts. |
| ES-06 | A structural validator cannot establish live task quality. | Methodological boundary | Supported by scope | Add an external live benchmark before making outcome claims. |
| ES-07 | The 2025 Prompt Equilibrium concept remains useful when translated to Agent Skills. | Thesis claim | Provisional | Validate across at least two compatible runtimes and unrelated skill families. |

## Bibliography

### Primary technical sources

Agent Skills. 2025. “Specification.” Accessed July 28, 2026. [https://agentskills.io/specification](https://agentskills.io/specification).

Anthropic. 2025. Barry Zhang, Keith Lazuka, and Mahesh Murag. “Equipping Agents for the Real World with Agent Skills.” October 16, 2025. [https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills).

Anthropic. 2026. “Demystifying Evals for AI Agents.” January 9, 2026. [https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).

GitHub. 2026. “About Agent Skills.” GitHub Copilot Documentation. Accessed July 28, 2026. [https://docs.github.com/en/copilot/concepts/agents/about-agent-skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills).

National Institute of Standards and Technology. 2023. Elham Tabassi. *Artificial Intelligence Risk Management Framework (AI RMF 1.0).* NIST AI 100-1. [https://doi.org/10.6028/NIST.AI.100-1](https://doi.org/10.6028/NIST.AI.100-1).

OWASP Foundation. 2025. “OWASP Top 10 for Large Language Model Applications.” Accessed July 28, 2026. [https://owasp.org/www-project-top-10-for-large-language-model-applications/](https://owasp.org/www-project-top-10-for-large-language-model-applications/).

### Research sources

Madaan, Aman, Niket Tandon, Prakhar Gupta, et al. 2023. “Self-Refine: Iterative Refinement with Self-Feedback.” arXiv:2303.17651. [https://arxiv.org/abs/2303.17651](https://arxiv.org/abs/2303.17651).

Nash, John F., Jr. 1950. “Equilibrium Points in N-Person Games.” *Proceedings of the National Academy of Sciences* 36 (1): 48-49. [https://doi.org/10.1073/pnas.36.1.48](https://doi.org/10.1073/pnas.36.1.48).

Shinn, Noah, Federico Cassano, Edward Berman, Ashwin Gopinath, Karthik Narasimhan, and Shunyu Yao. 2023. “Reflexion: Language Agents with Verbal Reinforcement Learning.” arXiv:2303.11366. [https://arxiv.org/abs/2303.11366](https://arxiv.org/abs/2303.11366).

Wang, Xuezhi, Jason Wei, Dale Schuurmans, et al. 2022. “Self-Consistency Improves Chain of Thought Reasoning in Language Models.” arXiv:2203.11171. [https://arxiv.org/abs/2203.11171](https://arxiv.org/abs/2203.11171).

### Method used to prepare this paper

Master-cai. 2025. “Research Paper Writing Skills.” GitHub. Accessed July 28, 2026. [https://github.com/Master-cai/Research-Paper-Writing-Skills](https://github.com/Master-cai/Research-Paper-Writing-Skills). The paper used this skill's paragraph-message, reverse-outline, claim-evidence-map, and adversarial-review method, adapted for Markdown.

Luwill. 2026. “Research Skills.” GitHub. Accessed July 28, 2026. [https://github.com/luwill/research-skills](https://github.com/luwill/research-skills). The paper used its citation-integrity principles: verify references, distinguish evidence from hypothesis, and avoid padding the bibliography.

### Historical source materials supplied by Jamie Hill

Hill, Jamie. 2025. *Maximizing the Prompt Equilibrium Framework: Deep Research Analysis.* DOCX. Local working file: `C:\Users\jamie\OKH-Local\08_Media_Staging\maximizing-the-prompt-equilibrium-framework-deep-research-analysis.docx`.

Hill, Jamie. 2025. *Beyond Equilibrium: A Unified View of Prompt Stability, Semantic Interference, and Multiagent LLM Coordination.* PDF and detailed PDF variants. Local working files: `C:\Users\jamie\OKH-Local\08_Media_Staging\beyond-equilibrium-a-unified-view-of-prompt-stability-semantic-interference-and-multiagent-llm-coordination.pdf` and `C:\Users\jamie\OKH-Local\08_Media_Staging\beyond-equilibrium-a-unified-view-of-prompt-stability-semantic-interference-and-multiagent-llm-coordination-detailed.pdf`.

Hill, Jamie. 2025. *Designing a Modular Multiphase Master Prompt Cookbook.* DOCX and PDF. Local working files: `C:\Users\jamie\OKH-Local\08_Media_Staging\designing-a-modular-multiphase-master-prompt-cookbook.docx` and `C:\Users\jamie\OKH-Local\08_Media_Staging\designing-a-modular-multiphase-master-prompt-cookbook.pdf`.

Hill, Jamie. 2025. *Maximizing the Prompt Equilibrium Framework.* PDF. Local working file: `C:\Users\jamie\OKH-Local\08_Media_Staging\maximizing-the-prompt-equilibrium-framework.pdf`.
