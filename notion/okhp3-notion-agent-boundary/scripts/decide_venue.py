#!/usr/bin/env python3
"""
decide_venue.py - okhp3-notion-agent-boundary tooling

Run this file's four-question decision procedure as a deterministic
function, so the same inputs always produce the same venue recommendation
and the "check current_tool_access before recommending Custom Agents" rule
is structurally impossible to skip.

This script never calls Notion. Supply the answers to the four gate
questions plus whatever the caller already knows about workspace capability
(business_or_enterprise and, optionally, whether the specific Custom Agent
session tools are advertised in current_tool_access).

Prerequisites: Python 3.9+, standard library only. No network access.

Usage:
    python3 decide_venue.py \\
        --needs-unattended-schedule true \\
        --business-or-enterprise true \\
        --custom-agent-tools-advertised true

    python3 decide_venue.py --self-test

Exit status: 0 on success or a passing self-test, 2 on a failing self-test.
"""

import argparse
import json
import sys


def decide(
    needs_unattended_schedule: bool,
    is_quick_one_off_in_notion: bool = False,
    must_stay_editable_in_notion_only: bool = False,
    needs_multi_platform_or_version_control_or_no_ai_subscription: bool = False,
    business_or_enterprise: bool = False,
    custom_agent_tools_advertised: bool = None,
) -> dict:
    # Gate 1: unattended, scheduled/triggered work.
    if needs_unattended_schedule:
        if not business_or_enterprise:
            return {
                "venue": "none-on-this-plan",
                "gate": 1,
                "rationale": "Needs to run unattended on a schedule/trigger, but the workspace "
                             "is not Business/Enterprise. This cannot be built as a Custom Agent "
                             "today. Consider a scheduled external automation calling a "
                             "file-based skill instead.",
                "tradeoff": "No Notion-native option exists at this plan tier for unattended work.",
            }
        if custom_agent_tools_advertised is False:
            return {
                "venue": "none-on-this-plan",
                "gate": 1,
                "rationale": "Business/Enterprise plan confirmed, but current_tool_access does "
                             "not advertise the Custom Agent session tools on this connection. "
                             "Check the connection's 'View threads and interact with agents' "
                             "capability before recommending this venue.",
                "tradeoff": "Recommending Custom Agents here would produce a dead end.",
            }
        return {
            "venue": "custom-agent",
            "gate": 1,
            "rationale": "Needs to run unattended on a schedule/trigger, and the workspace is "
                         "Business/Enterprise with Custom Agent tools advertised.",
            "tradeoff": "Notion-native ease gained; portability to other workspaces lost.",
        }

    # Gate 2: quick one-off, user already in Notion.
    if is_quick_one_off_in_notion:
        return {
            "venue": "notion-agent",
            "gate": 2,
            "rationale": "Quick, one-off action while the user is already looking at a Notion "
                         "page. Do not over-engineer a skill for something the built-in "
                         "assistant already handles well.",
            "tradeoff": "Zero setup cost; no portability, no version control, no reuse "
                        "outside this Notion session.",
        }

    # Gate 3: must be editable by a non-engineer, never leave Notion.
    if must_stay_editable_in_notion_only:
        return {
            "venue": "notion-skill",
            "gate": 3,
            "rationale": "Instructions must be editable by a non-engineer directly inside "
                         "Notion, and never leave Notion.",
            "tradeoff": "Notion-native editability gained; portability to other Agent-Skill "
                        "runtimes lost, and content is untrusted routing metadata until fetched.",
        }

    # Gate 4: multi-platform, version control, no Notion AI dependency, or workspace portability.
    if needs_multi_platform_or_version_control_or_no_ai_subscription:
        return {
            "venue": "agent-skill",
            "gate": 4,
            "rationale": "Spans multiple platforms, needs version control and code review, "
                         "must run without a Notion AI subscription, or must be portable to a "
                         "workspace the author does not own.",
            "tradeoff": "Portability and reviewability gained; Notion-native convenience lost.",
        }

    return {
        "venue": "notion-skill-or-agent-skill",
        "gate": 4,
        "rationale": "None of the four gate conditions definitively applied. Default to a "
                     "Notion Skill page if the workspace supports it, otherwise a file-based "
                     "Agent Skill.",
        "tradeoff": "Ambiguous case - state the default chosen and why explicitly rather than "
                    "picking silently.",
    }


def self_test() -> int:
    failures = []

    d = decide(needs_unattended_schedule=True, business_or_enterprise=False)
    if d["venue"] != "none-on-this-plan" or d["gate"] != 1:
        failures.append(f"unattended without B/E should be none-on-this-plan, got {d}")

    d = decide(needs_unattended_schedule=True, business_or_enterprise=True,
                custom_agent_tools_advertised=False)
    if d["venue"] != "none-on-this-plan":
        failures.append(f"B/E but tools not advertised should still be none-on-this-plan, got {d}")

    d = decide(needs_unattended_schedule=True, business_or_enterprise=True,
                custom_agent_tools_advertised=True)
    if d["venue"] != "custom-agent":
        failures.append(f"B/E with tools advertised should be custom-agent, got {d}")

    d = decide(needs_unattended_schedule=False, is_quick_one_off_in_notion=True)
    if d["venue"] != "notion-agent":
        failures.append(f"quick one-off should be notion-agent, got {d}")

    d = decide(needs_unattended_schedule=False, must_stay_editable_in_notion_only=True)
    if d["venue"] != "notion-skill":
        failures.append(f"must-stay-in-Notion should be notion-skill, got {d}")

    d = decide(needs_unattended_schedule=False,
                needs_multi_platform_or_version_control_or_no_ai_subscription=True)
    if d["venue"] != "agent-skill":
        failures.append(f"multi-platform need should be agent-skill, got {d}")

    d = decide(needs_unattended_schedule=False)
    if d["venue"] != "notion-skill-or-agent-skill":
        failures.append(f"no gate matched should be the ambiguous default, got {d}")

    total = 7
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def _str2bool(v):
    if v is None:
        return None
    return str(v).strip().lower() in ("1", "true", "yes", "y")


def main() -> int:
    parser = argparse.ArgumentParser(description="Decide which venue a repeatable Notion workflow should live in.")
    parser.add_argument("--needs-unattended-schedule", default="false")
    parser.add_argument("--is-quick-one-off-in-notion", default="false")
    parser.add_argument("--must-stay-editable-in-notion-only", default="false")
    parser.add_argument("--needs-multi-platform-or-version-control-or-no-ai-subscription", default="false")
    parser.add_argument("--business-or-enterprise", default="false")
    parser.add_argument("--custom-agent-tools-advertised", default=None,
                         help="true/false, or omit if not yet checked (Gate 1 will still route "
                              "correctly when this is unattended + B/E but the flag is unknown).")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    result = decide(
        needs_unattended_schedule=_str2bool(args.needs_unattended_schedule),
        is_quick_one_off_in_notion=_str2bool(args.is_quick_one_off_in_notion),
        must_stay_editable_in_notion_only=_str2bool(args.must_stay_editable_in_notion_only),
        needs_multi_platform_or_version_control_or_no_ai_subscription=_str2bool(
            args.needs_multi_platform_or_version_control_or_no_ai_subscription),
        business_or_enterprise=_str2bool(args.business_or_enterprise),
        custom_agent_tools_advertised=_str2bool(args.custom_agent_tools_advertised),
    )
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
