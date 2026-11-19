# Portrait editing and review

Load for the edit prompt and visual quality review.

## Reference roles

Use a current clear likeness anchor. Older portraits can inform style but should
not silently set present age, hairline, face shape, or clothing. A smiling
reference can guide expression even when its pose or background is unsuitable.
Mark every supplied role explicitly and use only inspected, accessible images.

In a group photo, identify the intended person using the user's selection or
unambiguous visual position. Ask if uncertain. Crop or reference only that person
when supported. Never transfer another person's face, teeth, or expression by
accident. Do not identify unrelated people.

## Prompt scaffold

"Edit the person in [primary reference]. Produce a realistic professional portrait
for [use]. Preserve the same recognizable facial structure, apparent age,
hairline, facial hair, glasses, skin texture, and proportions. Use [approved
clothing], [background], [lighting], and [crop]. [Supporting reference] supplies
only [specific role]. Keep [approved prior features]. Change [requested change].
Avoid skin smoothing, face reshaping, invented accessories, or excessive
whitening. Leave safe head/shoulder clearance for the intended crop."

Adapt this scaffold to the actual brief and the editor's reference mechanism.
Do not invent a tool name or rely on a local path the editor cannot read.

## A selected smile

Use the chosen expression reference as expression guidance, preserving the
primary person's identity and approved pose. Natural smiles involve cheek and
eye changes as well as the mouth. Check the result for a pasted-mouth effect,
strained jaw, uneven anatomy, and implausible teeth. Low-resolution photos do
not provide exact tooth geometry: disclose synthesis when that detail matters.
A generated smile is an approximation, not a guaranteed literal transfer.

## Review record

Mark each as inspected, defect, or unavailable:
- Likeness: face shape, apparent age, eyes, hairline, facial hair, glasses.
- Expression: requested warmth, natural cheeks/eyes/mouth, plausible teeth.
- Realism: texture, edges, ears, neck, lighting and clothing consistency.
- Framing: intended crop, headroom, circular crop clearance if relevant.
- Request: actual clothing, background and requested version change.

The subject's recognizability judgment outranks an agent's aesthetic preference.
Return specific unresolved defects rather than a generic claim of perfection.
