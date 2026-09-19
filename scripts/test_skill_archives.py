import hashlib
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("verify_skill_archives", Path(__file__).with_name("verify-skill-archives.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ArchiveIntegrityTests(unittest.TestCase):
    def test_raw_crlf_preserved_and_tampering_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            target = root / "docs/archive/sample/original.md"
            target.parent.mkdir(parents=True)
            payload = b"historical text\r\n"
            target.write_bytes(payload)
            manifest = {"fileCount": 1, "totalBytes": len(payload), "files": [{"destination": "docs/archive/sample/original.md", "bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()}]}
            self.assertEqual(module.verify_manifest(root, manifest), (1, len(payload)))
            target.write_bytes(payload.replace(b"\r\n", b"\n"))
            with self.assertRaisesRegex(AssertionError, "Changed byte length"):
                module.verify_manifest(root, manifest)
            target.unlink()
            with self.assertRaisesRegex(AssertionError, "Missing archive"):
                module.verify_manifest(root, manifest)

    def test_outside_archive_destination_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            manifest = {"fileCount": 1, "totalBytes": 0, "files": [{"destination": "docs/archive/../../active.txt", "bytes": 0, "sha256": hashlib.sha256(b"").hexdigest()}]}
            with self.assertRaisesRegex(AssertionError, "Unsafe archive"):
                module.verify_manifest(root, manifest)


if __name__ == "__main__":
    unittest.main()
