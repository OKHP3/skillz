# Development run: review and release decision

Decision: **defer for evidence**. The 0.6.0 instructions and synthetic
responses are a candidate, not an approved improvement to the public catalog.

The frozen nine-case rubric recorded 27 of 27 treatment criteria and 20 of 27
baseline criteria. Each case had one fresh session per configuration, with
no tool calls. The grader used masked labels, but response wording could
reveal the arm; graders and executors shared a model family. The fixtures
were author-visible, and the claimed pre-run freeze was not independently
timestamped or committed. These are development results, not a protected
holdout or a general performance estimate.

The evidence and safety reviews found a material failure outside the specific
frozen criterion: the proof-brief treatment draft asserted a personal reason
for a commit that its fixture did not establish. The quoted commit alone did
not support the whole sentence. The outcome review also identified the
problem but considered supervised use acceptable; the evidence and safety
reviews blocked promotion. The review conclusion is **defer**, preserving this
disagreement and the original automated scores. A private evidence note did
not cure the unsupported public assertion.

The next revision needs an expanded public-claim audit that checks each
first-person factual clause, including motivations and causal explanations,
against its source. Run the changed cases and the full regression suite, and
then seek a genuinely unseen holdout and independent release review before
claiming broader readiness. Do not change a catalog label merely because a
score or file count permits it.
