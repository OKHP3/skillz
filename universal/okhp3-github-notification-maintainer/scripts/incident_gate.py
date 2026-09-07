"""Pure fail-closed policy check for workflow acknowledgement; never calls APIs."""
from datetime import datetime
import re


def acknowledgement_gate(evidence):
    """Validate normalized, freshly collected evidence, not provider authenticity.

    The caller must obtain these observations from trusted adapters. Passing this
    function is not independent proof that a run or live deployment succeeded.
    """
    holds = []
    if not isinstance(evidence, dict):
        return {"eligible": False, "holds": ["invalid evidence"], "actions": []}
    for field in ("incident_coverage_complete", "current_state_rechecked",
                  "publication_verified", "required_live_checks_passed",
                  "failing_boundary_executed_and_passed"):
        if evidence.get(field) is not True:
            holds.append(field)
    failed = evidence.get("failed_run", {})
    replacement = evidence.get("replacement_run", {})
    if not isinstance(failed, dict) or not isinstance(replacement, dict):
        return {"eligible": False, "holds": ["invalid run records"], "actions": []}
    for field in ("repository_id", "workflow_id", "branch"):
        if not failed.get(field) or failed.get(field) != replacement.get(field):
            holds.append("run identity: " + field)
    current = evidence.get("current_published_sha")
    if not isinstance(current, str) or not re.fullmatch(r"[0-9a-f]{40}", current):
        holds.append("full current SHA required")
    if replacement.get("sha") != current:
        holds.append("replacement SHA is not current")
    if replacement.get("status") != "completed" or replacement.get("conclusion") != "success":
        holds.append("replacement not successful")
    if replacement.get("event") == "pull_request":
        holds.append("PR run is not publication proof")
    try:
        times = [datetime.fromisoformat(run["updated_at"].replace("Z", "+00:00"))
                 for run in (failed, replacement)]
        if any(t.tzinfo is None for t in times) or times[1] <= times[0]:
            holds.append("replacement not newer")
    except (KeyError, TypeError, ValueError, AttributeError):
        holds.append("invalid run timestamp")
    if not evidence.get("thread_id") or evidence.get("thread_updated_at") != evidence.get("rechecked_thread_updated_at") or not evidence.get("thread_updated_at"):
        holds.append("thread missing or changed")
    actions = []
    if not holds and evidence.get("github_done_authorized") is True:
        actions.append("github_done")
    if not holds and evidence.get("email_read_authorized") is True:
        if evidence.get("mailbox_identity") and evidence.get("email_message_id") and evidence.get("email_incident_match_verified") is True:
            actions.append("email_read")
    return {"eligible": not holds and bool(actions), "holds": holds,
            "actions": actions}
