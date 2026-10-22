"""Check that the optimization subprocesses expose only the tools they need."""

import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from scripts import improve_description, run_eval


class ClaudeToolBoundaryTests(unittest.TestCase):
    def test_trigger_eval_keeps_skill_invocation_without_other_tools(self):
        with tempfile.TemporaryDirectory() as project_root:
            skill_name = "sample"
            command_name = "sample-skill-cafefeed"
            events = [
                {"type": "stream_event", "event": {"type": "content_block_start",
                 "content_block": {"type": "tool_use", "name": "Skill"}}},
                {"type": "stream_event", "event": {"type": "content_block_delta",
                 "delta": {"type": "input_json_delta",
                           "partial_json": json.dumps({"skill": command_name})}}},
            ]
            stream = ("\n".join(json.dumps(event) for event in events) + "\n").encode()
            process = Mock()
            process.poll.return_value = None
            process.stdout.fileno.return_value = 123
            with (
                patch.object(run_eval.uuid, "uuid4", return_value=SimpleNamespace(hex="cafefeed")),
                patch.object(run_eval.subprocess, "Popen", return_value=process) as launch,
                patch.object(run_eval.select, "select", return_value=([process.stdout], [], [])),
                patch.object(run_eval.os, "read", return_value=stream),
            ):
                triggered = run_eval.run_single_query(
                    "A realistic trigger query", skill_name, "Sample description", 5, project_root
                )
            self.assertTrue(triggered)
            argv = launch.call_args.args[0]
            self.assertEqual(argv[argv.index("--tools") + 1], "Skill")
            self.assertEqual(argv[argv.index("--allowedTools") + 1], "Skill")
            self.assertEqual(argv[argv.index("--disallowedTools") + 1], "mcp__*")
            self.assertIn("--strict-mcp-config", argv)
            self.assertEqual(json.loads(argv[argv.index("--mcp-config") + 1]), {"mcpServers": {}})
            self.assertEqual(argv[argv.index("--permission-mode") + 1], "dontAsk")
            self.assertNotIn("--bare", argv)
            self.assertNotIn("--restricted", argv)
            self.assertEqual(launch.call_args.kwargs["cwd"], project_root)
            self.assertFalse((Path(project_root) / ".claude" / "commands" / f"{command_name}.md").exists())
            process.kill.assert_called_once()
            process.wait.assert_called_once()

    def test_description_improvement_has_no_tools_or_prompts(self):
        response = SimpleNamespace(returncode=0, stdout="Improved description", stderr="")
        with patch.object(improve_description.subprocess, "run", return_value=response) as launch:
            result = improve_description._call_claude("Review this description", None)
        self.assertEqual(result, "Improved description")
        argv = launch.call_args.args[0]
        self.assertEqual(argv[argv.index("--tools") + 1], "")
        self.assertEqual(argv[argv.index("--disallowedTools") + 1], "mcp__*")
        self.assertIn("--strict-mcp-config", argv)
        self.assertEqual(json.loads(argv[argv.index("--mcp-config") + 1]), {"mcpServers": {}})
        self.assertEqual(argv[argv.index("--permission-mode") + 1], "dontAsk")
        self.assertEqual(launch.call_args.kwargs["input"], "Review this description")
        self.assertNotIn("--bare", argv)
        self.assertNotIn("--restricted", argv)


if __name__ == "__main__":
    unittest.main()
