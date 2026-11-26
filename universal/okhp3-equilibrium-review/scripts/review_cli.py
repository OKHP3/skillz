"""Command-line entry point for the equilibrium review orchestrator."""

from __future__ import annotations

import argparse
import concurrent.futures
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

from review_execution import classify_concordance, run_role
from review_support import ROLES, json_dump, parse_command, prompt_text, sha256_file, utc_now


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifact", required=True, type=Path)
    parser.add_argument("--question", required=True)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--mode", choices=("five-way", "conditional"), default="five-way")
    parser.add_argument("--agent-command-json")
    parser.add_argument("--criteria", action="append", default=[])
    parser.add_argument("--timeout-seconds", type=int, default=600)
    parser.add_argument("--max-workers", type=int, default=3)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--version", action="version", version="okhp3-equilibrium-review 1.0.1")
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    artifact, output_dir = args.artifact.resolve(), args.output_dir.resolve()
    if not artifact.is_file():
        print(f"error: artifact does not exist or is not a file: {artifact}", file=sys.stderr)
        return 2
    if args.timeout_seconds <= 0 or args.max_workers <= 0:
        print("error: timeout and max-workers must be positive", file=sys.stderr)
        return 2
    command = parse_command(args.agent_command_json)
    dry_run = args.dry_run or command is None
    output_dir.mkdir(parents=True, exist_ok=True)
    prompt_dir, role_dir = output_dir / "prompts", output_dir / "roles"
    prompt_dir.mkdir(exist_ok=True); role_dir.mkdir(exist_ok=True)
    artifact_hash = sha256_file(artifact)
    json_dump(output_dir / "manifest.json", {"schema_version": "1.0", "created_at": utc_now(), "review_protocol": "equilibrium-v1", "review_mode": args.mode, "artifact": {"path": str(artifact), "sha256": artifact_hash}, "decision_question": args.question, "acceptance_criteria": args.criteria, "agent_command_supplied": command is not None, "dry_run": dry_run})

    prompt_paths = {}
    for role in ROLES:
        path = prompt_dir / f"{role}.md"
        path.write_text(prompt_text(role, artifact, args.question, output_dir, args.criteria, [], None, "pending", args.mode), encoding="utf-8")
        prompt_paths[role] = path
    initial: List[Dict[str, Any]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(args.max_workers, len(ROLES))) as pool:
        futures = {pool.submit(run_role, role, command, prompt_paths[role], role_dir / f"{role}.stdout.txt", artifact, args.question, output_dir, args.timeout_seconds, dry_run): role for role in ROLES}
        for future in concurrent.futures.as_completed(futures):
            initial.append(future.result())
    initial.sort(key=lambda item: ROLES.index(item["role"]))
    concordance = classify_concordance(initial)
    initial_paths = [Path(item["output_file"]) for item in initial if item.get("output_file")]
    should_disrupt = args.mode == "five-way" or concordance == "material-agreement"
    disruptor = None
    if should_disrupt:
        path = prompt_dir / "disruptor.md"
        path.write_text(prompt_text("disruptor", artifact, args.question, output_dir, args.criteria, initial_paths, None, concordance, args.mode), encoding="utf-8")
        disruptor = run_role("disruptor", command, path, role_dir / "disruptor.stdout.txt", artifact, args.question, output_dir, args.timeout_seconds, dry_run)
    negotiator_path = prompt_dir / "negotiator.md"
    negotiator_path.write_text(prompt_text("negotiator", artifact, args.question, output_dir, args.criteria, initial_paths, Path(disruptor["output_file"]) if disruptor and disruptor.get("output_file") else None, concordance, args.mode), encoding="utf-8")
    negotiator = run_role("negotiator", command, negotiator_path, role_dir / "negotiator.stdout.txt", artifact, args.question, output_dir, args.timeout_seconds, dry_run)
    decision = negotiator.get("decision", "defer-for-evidence") if negotiator.get("status") == "completed" and negotiator.get("structured") else "defer-for-evidence"
    if decision == "disagree": decision = "defer-for-evidence"
    record = {"schema_version": "1.0", "review_protocol": "equilibrium-v1", "review_mode": args.mode, "evaluation_status": "not-run" if dry_run else "live", "created_at": utc_now(), "artifact": {"path": str(artifact), "sha256": artifact_hash}, "decision_question": args.question, "acceptance_criteria": args.criteria, "independence": {"reviewer_contexts_separated": False, "shared_model_or_source_limits": ["The orchestrator cannot establish provider-level independence; record it in adapter output."]}, "initial_reviews": initial, "concordance": concordance, "disruptor": {"triggered": should_disrupt, "authority": "exploratory-only" if args.mode == "five-way" and concordance != "material-agreement" else "release-review-input" if should_disrupt else "none", "result": disruptor, "falsification_hypotheses": (disruptor or {}).get("material_findings", [])}, "negotiator": {"triggered": True, "result": negotiator, "decision": negotiator.get("decision"), "decisive_evidence": negotiator.get("evidence_ids", []), "unresolved_items": negotiator.get("material_findings", [])}, "release_decision": decision, "limitations": ["A structured agent result is not proof of domain correctness.", "A live result does not establish general performance outside this artifact and configuration."] if not dry_run else ["No agent command was supplied; prompts and record were generated without live review.", "A protected or external holdout is still required before outcome claims."], "follow_up": ["Run a protected or external holdout before an uplift or production-readiness claim."]}
    json_dump(output_dir / "equilibrium-review-record.json", record)
    summary = [f"review directory: {output_dir}", f"mode: {args.mode}", f"initial concordance: {concordance}", f"disruptor: {'triggered' if should_disrupt else 'skipped by conditional protocol'}", f"release decision: {decision}", f"evaluation status: {record['evaluation_status']}"]
    (output_dir / "SUMMARY.md").write_text("# Equilibrium Review Summary\n\n" + "\n".join(f"- {line}" for line in summary) + "\n", encoding="utf-8")
    print("\n".join(summary))
    return 0
