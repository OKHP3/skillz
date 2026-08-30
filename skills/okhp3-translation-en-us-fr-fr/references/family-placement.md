# Family placement

`universal/` is the appropriate family for this package.

The skill is a portable, cross-project translation contract: it accepts owned
text artifacts plus project-owned configuration and produces one controlled
target locale. It does not implement the visual identity, application runtime,
deployment mechanics, or document renderer of OverKill Hill, Glee-fully,
AskJamie, or another single project. Those projects may carry a thin adapter
containing routes, document-format handling, approved vocabulary, and build
gates, but the directed translation method and pair dictionary remain reusable.

Do not create a new top-level localization family until there are several
maintained language-pair packages with shared, localization-specific
infrastructure that cannot remain a focused universal package. One generic
multi-target package would weaken discovery precision and make a pair dictionary
ambiguous, so it is not retained beside this exact-pair skill.
