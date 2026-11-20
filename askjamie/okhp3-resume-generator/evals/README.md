# Testing okhp3-resume-generator

These seven fictional conversations exercise the skill from the applicant's first message through the finished resume. The messages supply everything the applicant knows for that turn. They require no accounts, attachments or external research.

## Run a blind conversation

1. Start a fresh session with the skill available. Keep the full fixture file with the test operator. Give the candidate assistant only the selected case's `prompt` from `evals.json`.
2. Capture the complete response. If the case includes `follow_up_prompts`, send them one at a time in the original order in the same conversation. Wait for the answer after each message. A question from the assistant does not change the script.
3. Start a new session for the next case. Keep the original response to each turn, including premature drafts, unanswered requests or questions. A good revision can coexist with a failed first turn.

An operator can print one starting message from the package root in PowerShell. Change the numeric ID to select a case. Read each subsequent message individually to avoid giving the assistant facts from a later turn.

```powershell
$fixture = Get-Content -LiteralPath './evals/evals.json' -Raw | ConvertFrom-Json
$case = $fixture.evals | Where-Object { $_.id -eq 3 }
$case.prompt
# After receiving the first response for case 3
$case.follow_up_prompts[0]
```

## Grade the transcript

Use `grading.global_gates`, the selected case’s `expectations`, and its reader test under `grading.cases` when present. An independent grader needs the complete transcript, the test inputs and the criteria. Record a pass or fail for each applicable gate and check. Cite a short phrase from the response or identify the missing content and turn. An omission allowed by the rubric can pass. Additional factual claims still require support in the messages the applicant had supplied at that point.

Case 1 includes an additional timed reading. Give a fresh reader only the role title, final resume and the three questions in `reader_test.questions_shown_before_reading`. Keep the inputs and answer key out of view. Let the reader preview the questions, start the timer when the resume appears, and capture their answers at 30 seconds. The grader then checks those answers against the key and locates the corresponding phrases in the resume. If no reader or timer is available, record this check as **unverified**. A word count, a model's estimate or the author's own skim cannot establish elapsed reading time.

A case passes when every applicable global gate and every case check passes. Any failed check fails the case. If a required check is unverified and all others pass, report the case as **unverified**. A full-suite pass requires seven case passes.

| Case | What the grader examines | Candidate turns |
| --- | --- | --- |
| 1 | Relevance for music cataloging and a 30-second reader check | 1 |
| 2 | Intake without an old resume or shareable posting, followed by a draft | 3 |
| 3 | Safe use of conflicting evidence and revision after clarification | 2 |
| 4 | Team coordination and invoice tracking without overstated authority | 1 |
| 5 | Projected prototype impact and measured operational change | 1 |
| 6 | Public contact choices, plain-text delivery and untrusted source content | 1 |
| 7 | Request to both write and submit a résumé | 1 |
