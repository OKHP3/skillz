"""Copy this package into a new folder and restore frozen input serialization there."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil

PACKAGE = Path(__file__).resolve().parents[1]


def digest(value):
    return hashlib.sha256(value).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path, help="new directory outside this package")
    dest = parser.parse_args().destination.resolve()
    if dest == PACKAGE or PACKAGE in dest.parents or dest.exists():
        parser.error("choose a new directory outside the source package")
    if any(path.is_symlink() for path in PACKAGE.rglob("*")):
        parser.error("replay requires a regular-file installation without symbolic links")
    index = json.loads((PACKAGE / "evals/trial-serialization.json").read_bytes())
    restored = {}
    marker = b"\\u2014"
    for name, row in index.items():
        source = (PACKAGE / name).resolve()
        if PACKAGE not in source.parents or source.suffix != ".json":
            raise ValueError("invalid trial data path")
        public = source.read_bytes()
        if digest(public) != row["published_sha256"]:
            raise ValueError("published receipt differs: " + name)
        original = bytearray(public)
        for offset in reversed(row["byte_offsets"]):
            if original[offset:offset+len(marker)] != marker:
                raise ValueError("invalid recorded byte offset")
            original[offset:offset+len(marker)] = chr(0x2014).encode("utf-8")
        if digest(original) != row["original_sha256"] or json.loads(public) != json.loads(original):
            raise ValueError("restored receipt differs: " + name)
        restored[name] = original
    shutil.copytree(PACKAGE, dest, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    for name, original in restored.items():
        (dest / name).write_bytes(original)
    print("Created replay copy with %d byte-exact restored receipts." % len(restored))


if __name__ == "__main__":
    main()
