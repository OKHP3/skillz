## Pattern 6: Framework Integration

### PydanticAI

```python
from pydantic_ai import Agent

policy = GovernancePolicy(
    name="support-bot",
    allowed_tools=["search_docs", "create_ticket"],
    blocked_patterns=[r"(?i)(ssn|social\s+security|credit\s+card)"],
    max_calls_per_request=20
)

agent = Agent("openai:gpt-4o", system_prompt="You are a support assistant.")

@agent.tool
@govern(policy)
async def search_docs(ctx, query: str) -> str:
    """Search knowledge base — governed."""
    return await kb.search(query)

@agent.tool
@govern(policy)
async def create_ticket(ctx, title: str, body: str) -> str:
    """Create support ticket — governed."""
    return await tickets.create(title=title, body=body)
```

### CrewAI

```python
from crewai import Agent, Task, Crew

policy = GovernancePolicy(
    name="research-crew",
    allowed_tools=["search", "analyze"],
    max_calls_per_request=30
)

# Apply governance at the crew level
def governed_crew_run(crew: Crew, policy: GovernancePolicy):
    """Wrap crew execution with governance checks."""
    audit = AuditTrail()
    for agent in crew.agents:
        for tool in agent.tools:
            original = tool.func
            tool.func = govern(policy, audit_trail=audit)(original)
    result = crew.kickoff()
    return result, audit
```

### OpenAI Agents SDK

```python
from agents import Agent, function_tool

policy = GovernancePolicy(
    name="coding-agent",
    allowed_tools=["read_file", "write_file", "run_tests"],
    blocked_tools=["shell_exec"],
    max_calls_per_request=50
)

@function_tool
@govern(policy)
async def read_file(path: str) -> str:
    """Read file contents — governed."""
    import os
    safe_path = os.path.realpath(path)
    if not safe_path.startswith(os.path.realpath(".")):
        raise ValueError("Path traversal blocked by governance")
    with open(safe_path) as f:
        return f.read()
```

---

## Governance Levels

Match governance strictness to risk level:

| Level | Controls | Use Case |
|-------|----------|----------|
| **Open** | Audit only, no restrictions | Internal dev/testing |
| **Standard** | Tool allowlist + content filters | General production agents |
| **Strict** | All controls + human approval for sensitive ops | Financial, healthcare, legal |
| **Locked** | Allowlist only, no dynamic tools, full audit | Compliance-critical systems |

---

## Best Practices

| Practice | Rationale |
|----------|-----------|
| **Policy as configuration** | Store policies in YAML/JSON, not hardcoded — enables change without deploys |
| **Most-restrictive-wins** | When composing policies, deny always overrides allow |
| **Pre-flight intent check** | Classify intent *before* tool execution, not after |
| **Trust decay** | Trust scores should decay over time — require ongoing good behavior |
| **Append-only audit** | Never modify or delete audit entries — immutability enables compliance |
| **Fail closed** | If governance check errors, deny the action rather than allowing it |
| **Separate policy from logic** | Governance enforcement should be independent of agent business logic |

---

## Quick Start Checklist

```markdown
## Agent Governance Implementation Checklist

### Setup
- [ ] Define governance policy (allowed tools, blocked patterns, rate limits)
- [ ] Choose governance level (open/standard/strict/locked)
- [ ] Set up audit trail storage

### Implementation
- [ ] Add @govern decorator to all tool functions
- [ ] Add intent classification to user input processing
- [ ] Implement trust scoring for multi-agent interactions
- [ ] Wire up audit trail export

### Validation
- [ ] Test that blocked tools are properly denied
- [ ] Test that content filters catch sensitive patterns
- [ ] Test rate limiting behavior
- [ ] Verify audit trail captures all events
- [ ] Test policy composition (most-restrictive-wins)
```

---

## Related Resources

- [Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit) — Full governance framework
- [AgentMesh Integrations](https://github.com/microsoft/agent-governance-toolkit/tree/main/packages/agentmesh-integrations) — Framework-specific packages
- [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
