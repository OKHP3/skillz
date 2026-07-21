# Subprocess Patterns

## Collapsed subprocess

Use a clearly labeled node such as `[[Validate request]]` or a class-defined double-border equivalent. Add `Related diagram: <stable-name>` in the registry when an expanded view exists.

## Expanded subprocess

Use a nested subgraph when the subprocess is small, has one owner, and remains readable for the declared audience. Use a separate diagram when it has its own start/end events, multiple consumers, or enough detail to overwhelm the parent view.

## Call activity

Label a reusable process as `Call: <process name>` and link it through the registry. Do not make a one-off subprocess look reusable unless the source process is actually shared.

## Cross-diagram registration

When a subprocess becomes its own diagram, add entries for both artifacts with mutual `Related diagrams` references, stable names, and a short parent/child relationship note.
