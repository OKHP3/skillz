from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from typing import Any


SCRIPT = Path(__file__).with_name("run-native-telemetry.py")
SPEC = importlib.util.spec_from_file_location("run_native_telemetry", SCRIPT)
assert SPEC and SPEC.loader
native_telemetry = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(native_telemetry)


QUERIES = [
    {"id": "trigger-01", "should_trigger": True},
    {"id": "trigger-02", "should_trigger": False},
]


def event(
    event_id: str,
    query_id: str = "trigger-01",
    event_type: str = "skill_activation",
    data: dict[str, Any] | None = None,
    **overrides: Any,
) -> dict[str, Any]:
    result: dict[str, Any] = {
        "event_id": event_id,
        "timestamp": "2026-09-04T12:00:00Z",
        "run_id": "test-run",
        "query_id": query_id,
        "event_type": event_type,
        "source": native_telemetry.SOURCE,
        "evidence_tier": native_telemetry.EVIDENCE_TIER,
        "data": data if data is not None else {"activated": True},
    }
    result.update(overrides)
    return result


class NativeTelemetryImportTests(unittest.TestCase):
    def write_export(self, content: str) -> Path:
        temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(temporary_directory.cleanup)
        path = Path(temporary_directory.name) / "events.jsonl"
        path.write_text(content, encoding="utf-8")
        return path

    def test_one_event_jsonl_is_imported_as_one_host_event(self) -> None:
        single_event = event("event-1")
        path = self.write_export(json.dumps(single_event) + "\n")

        metadata, raw_events = native_telemetry.read_event_export(path)
        imported = native_telemetry.validate_export(metadata, raw_events)

        self.assertEqual(metadata, {"schema_version": "1.0", "source": native_telemetry.SOURCE, "host": "unknown"})
        self.assertEqual(imported, [single_event])

    def test_json_envelope_preserves_metadata_and_events(self) -> None:
        first_event = event("event-1")
        second_event = event(
            "event-2",
            event_type="quota_state",
            data={"state": "blocked"},
        )
        envelope = {
            "schema_version": "1.0",
            "source": native_telemetry.SOURCE,
            "host": "test-host",
            "exported_at": "2026-09-04T12:01:00Z",
            "events": [first_event, second_event],
        }
        path = self.write_export(json.dumps(envelope))

        metadata, raw_events = native_telemetry.read_event_export(path)
        imported = native_telemetry.validate_export(metadata, raw_events)

        self.assertEqual(metadata, {key: value for key, value in envelope.items() if key != "events"})
        self.assertEqual(imported, [first_event, second_event])

    def test_multi_event_jsonl_imports_each_line(self) -> None:
        first_event = event("event-1")
        second_event = event(
            "event-2",
            query_id="trigger-02",
            event_type="quota_state",
            data={"state": "available"},
        )
        path = self.write_export("\n".join(json.dumps(item) for item in [first_event, second_event]))

        metadata, raw_events = native_telemetry.read_event_export(path)
        imported = native_telemetry.validate_export(metadata, raw_events)
        summary = native_telemetry.telemetry_summary(imported)

        self.assertEqual(len(imported), 2)
        self.assertEqual(summary["events_total"], 2)
        self.assertEqual(summary["events_by_type"]["skill_activation"], 1)
        self.assertEqual(summary["events_by_type"]["quota_state"], 1)

    def test_partial_activation_keeps_precision_and_recall_null(self) -> None:
        results = native_telemetry.activation_results(
            QUERIES,
            [event("event-1", query_id="trigger-01")],
        )

        self.assertEqual(results["status"], "partial")
        self.assertEqual(results["queries_total"], 2)
        self.assertEqual(results["queries_executed"], 1)
        self.assertEqual(results["true_positives"], 1)
        self.assertIsNone(results["precision"])
        self.assertIsNone(results["recall"])

    def test_duplicate_activation_for_one_query_is_rejected(self) -> None:
        with self.assertRaisesRegex(
            native_telemetry.TelemetryError,
            "Multiple activation events for trigger-01",
        ):
            native_telemetry.activation_results(
                QUERIES,
                [event("event-1"), event("event-2")],
            )

    def test_response_derived_event_is_rejected(self) -> None:
        response_event = event(
            "event-1",
            data={"activated": True, "response_text": "The skill activated."},
        )

        with self.assertRaisesRegex(
            native_telemetry.TelemetryError,
            "must not contain response text",
        ):
            native_telemetry.validate_export(
                {"schema_version": "1.0", "source": native_telemetry.SOURCE, "host": "test-host"},
                [response_event],
            )

    def test_duplicate_event_ids_are_rejected(self) -> None:
        duplicate_id_events = [event("event-1"), event("event-1", query_id="trigger-02")]

        with self.assertRaisesRegex(native_telemetry.TelemetryError, "Event IDs must be unique"):
            native_telemetry.validate_export(
                {"schema_version": "1.0", "source": native_telemetry.SOURCE, "host": "test-host"},
                duplicate_id_events,
            )

    def test_malformed_jsonl_is_rejected(self) -> None:
        path = self.write_export('{"event_id": "event-1"}\nnot-json\n')

        with self.assertRaisesRegex(native_telemetry.TelemetryError, "Invalid JSONL"):
            native_telemetry.read_event_export(path)


if __name__ == "__main__":
    unittest.main()