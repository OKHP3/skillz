#!/usr/bin/env python3
"""Create or verify a reproducible local Project Compass .skill (Python 3.9+)."""
import argparse
from collections import namedtuple
import contextlib
import hashlib
import os
from pathlib import Path, PureWindowsPath
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import unicodedata
import zipfile
import zlib

NAME = "okhp3-project-compass"
SUBTREE = "universal/" + NAME
Entry = namedtuple("Entry", "oid size executable")
CHUNK = 1024 * 1024


class Failure(Exception):
    pass


def require(condition, message):
    if not condition:
        raise Failure(message)


def git(cwd, env, *args, output=subprocess.PIPE):
    cp = subprocess.run(["git", "-C", str(cwd), *args], env=env, stdout=output,
                        stderr=subprocess.PIPE, stdin=subprocess.DEVNULL)
    if cp.returncode:
        raise Failure(f"git {args[0]} exited {cp.returncode}: {os.fsdecode(cp.stderr).strip()}")
    return cp.stdout


def environment(scratch):
    home = scratch / "home"
    temporary = scratch / "tmp"
    home.mkdir()
    temporary.mkdir()
    return {
        "PATH": os.pathsep.join(dict.fromkeys([str(Path(sys.executable).parent),
                str(Path(shutil.which("git") or "/usr/bin/git").parent), os.defpath])),
        "HOME": str(home), "TMPDIR": str(temporary), "TMP": str(temporary), "TEMP": str(temporary),
        "XDG_CACHE_HOME": str(home / "cache"), "XDG_CONFIG_HOME": str(home / "config"),
        "TZ": "UTC", "LC_ALL": "C", "PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1",
        "GIT_CONFIG_GLOBAL": os.devnull, "GIT_CONFIG_NOSYSTEM": "1", "GIT_ATTR_NOSYSTEM": "1",
        "GIT_NO_REPLACE_OBJECTS": "1", "GIT_NO_LAZY_FETCH": "1", "GIT_OPTIONAL_LOCKS": "0",
        "GIT_ALLOW_PROTOCOL": "", "GIT_TERMINAL_PROMPT": "0", "GIT_CEILING_DIRECTORIES": str(scratch),
    }


def pinned_source(worktree, revision, temp, env):
    require(git(worktree, env, "rev-parse", "--is-inside-work-tree").strip() == b"true",
            "expected a Git worktree")
    commit = git(worktree, env, "rev-parse", "--verify", "--end-of-options",
                 revision + "^{commit}").decode().strip()
    algo = git(worktree, env, "rev-parse", "--show-object-format").decode().strip()
    require(algo in ("sha1", "sha256"), "unsupported Git object format")
    objects = os.fsdecode(git(worktree, env, "rev-parse", "--path-format=absolute",
                              "--git-path", "objects")).rstrip("\n")
    require("\n" not in objects and "\r" not in objects, "unsupported object store path")
    # A private bare repository isolates archive behavior from local attributes,
    # refs, replacement objects, filters, and archive settings in the source.
    bare = temp / "objects.git"
    git(temp, env, "init", "-q", "--bare", "--template=", "--object-format=" + algo, str(bare))
    (bare / "objects/info/alternates").write_text(objects + "\n")
    require(git(bare, env, "cat-file", "-t", commit).strip() == b"commit", "expected a commit")
    tree = git(bare, env, "rev-parse", "--verify", commit + ":" + SUBTREE).decode().strip()
    require(git(bare, env, "cat-file", "-t", tree).strip() == b"tree", "package is not a tree")
    stamp = git(bare, env, "log", "-1", "--format=%ct", commit).decode().strip()
    return bare, commit, tree, algo, stamp


def safe_parts(name):
    parts = name.split("/")
    for part in parts:
        bad = (part in ("", ".", "..") or part.casefold() == ".git" or
               part.endswith((" ", ".")) or PureWindowsPath(part).is_reserved() or
               any(ord(ch) < 32 or ord(ch) == 127 or ch in '\\:<>"|?*' for ch in part))
        require(not bad, f"unsafe member path {name!r}")
    return parts


def inventory(bare, tree, env):
    entries, dirs, aliases = {}, {""}, set()
    listing = git(bare, env, "ls-tree", "-r", "-t", "-l", "-z", tree)
    for record in listing.split(b"\0"):
        if not record:
            continue
        head, raw = record.split(b"\t", 1)
        mode, kind, oid, size = head.split()
        name = raw.decode("utf-8")
        safe_parts(name)
        key = unicodedata.normalize("NFC", name).casefold()
        require(key not in aliases, f"colliding source paths: {name!r}")
        aliases.add(key)
        if (mode, kind) == (b"040000", b"tree"):
            dirs.add(name)
        else:
            require(kind == b"blob" and mode in (b"100644", b"100755"),
                    f"unsupported Git type/mode {mode!r} at {name!r}")
            entries[name] = Entry(oid.decode(), int(size), mode == b"100755")
    require("SKILL.md" in entries, f"{SUBTREE} has no SKILL.md")
    return entries, dirs


def archive(bare, tree, stamp, env, path):
    with path.open("xb") as out:
        git(bare, env, "archive", "--format=zip", "-0", "--prefix=" + NAME + "/",
            "--mtime=@" + stamp, tree, output=out)


def verify_blob(stream, entry, algo, name, output=None):
    h = hashlib.new(algo)
    h.update(f"blob {entry.size}\0".encode())
    count = 0
    while True:
        buf = stream.read(CHUNK)
        if not buf:
            break
        count += len(buf)
        require(count <= entry.size, f"oversize blob: {name}")
        h.update(buf)
        if output:
            output.write(buf)
    require(count == entry.size and h.hexdigest() == entry.oid, f"blob mismatch: {name}")


def missing(wanted, seen, label):
    diff = sorted(set(wanted) - seen)
    require(not diff, f"missing {label}: {diff[:5]!r}")


def verify_zip(bundle, extracted, entries, dirs, algo):
    extracted.mkdir()
    seen_files, seen_dirs = set(), set()
    with zipfile.ZipFile(bundle) as z:
        for info in z.infolist():
            raw = info.orig_filename
            require(raw == info.filename and raw.startswith(NAME + "/"), f"invalid prefix/name: {raw!r}")
            folder = info.is_dir()
            tail = raw[:-1] if folder else raw
            parts = safe_parts(tail)
            name = "/".join(parts[1:])
            mode = info.external_attr >> 16
            filetype = stat.S_IFMT(mode)
            require(not info.flag_bits & 1 and not info.external_attr & 0x400,
                    f"encrypted or reparse-point member: {raw!r}")
            require(not mode & 0o7000 and filetype in (0, stat.S_IFDIR if folder else stat.S_IFREG),
                    f"unsafe ZIP mode at {raw!r}")
            require(not (info.external_attr & 0x10) or folder, f"DOS directory flag on file: {raw!r}")
            path = extracted.joinpath(*parts[1:])
            with z.open(info) as source:
                if folder:
                    require(name in dirs and name not in seen_dirs, f"extra or duplicate directory: {raw!r}")
                    require(info.file_size == 0 and not source.read(1), f"data in directory: {raw!r}")
                    seen_dirs.add(name)
                    path.mkdir(parents=True, exist_ok=True)
                    continue
                require(name in entries and name not in seen_files, f"extra or duplicate file: {raw!r}")
                entry = entries[name]
                require(info.file_size == entry.size, f"ZIP size mismatch: {name}")
                check_exec(mode, entry, name)
                seen_files.add(name)
                path.parent.mkdir(parents=True, exist_ok=True)
                with path.open("xb") as dest:
                    verify_blob(source, entry, algo, name, dest)
                path.chmod(0o755 if entry.executable else 0o644)
    missing(entries, seen_files, "ZIP files")
    missing(dirs, seen_dirs, "ZIP directories")


def check_exec(mode, entry, name):
    # Git records the owner execute bit. Also reject stray execute bits on a
    # non-executable blob. Read/write permissions can legitimately vary by umask.
    require(not mode & 0o7000 and bool(mode & 0o100) == entry.executable and
            (entry.executable or not mode & 0o111), f"executable/mode mismatch: {name}")


@contextlib.contextmanager
def regular(path):
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    with os.fdopen(fd, "rb") as f:
        require(stat.S_ISREG(os.fstat(f.fileno()).st_mode), f"expected a regular file: {path}")
        yield f


def installed_parity(root, entries, dirs, algo):
    require(stat.S_ISDIR(root.lstat().st_mode), f"expected an installed directory: {root}")
    seen_files, seen_dirs = set(), {""}
    ignored = 0
    pending = [root]
    while pending:
        folder = pending.pop()
        for path in sorted(folder.iterdir()):
            name = path.relative_to(root).as_posix()
            mode = path.lstat().st_mode
            if stat.S_ISDIR(mode):
                require(name in dirs or path.name == "__pycache__", f"extra installed directory: {name}")
                seen_dirs.add(name)
                pending.append(path)
                continue
            require(stat.S_ISREG(mode), f"non-regular installed entry: {name}")
            if name not in entries and path.suffix in (".pyc", ".pyo"):
                ignored += 1
                continue
            require(name in entries, f"extra installed file: {name}")
            entry = entries[name]
            with regular(path) as src:
                st = os.fstat(src.fileno())
                require(st.st_size == entry.size, f"installed size mismatch: {name}")
                check_exec(st.st_mode, entry, name)
                verify_blob(src, entry, algo, name)
            seen_files.add(name)
    missing(entries, seen_files, "installed files")
    missing(dirs, seen_dirs, "installed directories")
    print(f"Installed parity: {len(seen_files)} files, {ignored} ignored interpreter cache files")


def sandbox(scratch):
    if sys.platform == "darwin":
        profile = ('(version 1)(allow default)(deny network*)(deny file-write*)'
                   '(allow file-write* (subpath (param "SCRATCH")) (literal "/dev/null"))')
        return ["/usr/bin/sandbox-exec", "-D", "SCRATCH=" + str(scratch), "-p", profile]
    if sys.platform.startswith("linux") and shutil.which("bwrap"):
        return [shutil.which("bwrap"), "--unshare-net", "--unshare-pid", "--die-with-parent",
                "--ro-bind", "/", "/", "--dev", "/dev", "--proc", "/proc",
                "--bind", str(scratch), str(scratch), "--"]
    raise Failure("no supported local test sandbox (macOS sandbox-exec or Linux bubblewrap)")


def run_tests(root, scratch, env):
    failures = []
    for label, args, required in [
        ("selftest", ["scripts/selftest.py"], root / "scripts/selftest.py"),
        ("unittest", ["-m", "unittest", "discover", "-s", "tests"], root / "tests"),
    ]:
        if not (required.is_file() if label == "selftest" else required.is_dir()):
            failures.append(f"{label}: missing {required.relative_to(root)}")
            continue
        proc = subprocess.run(sandbox(scratch) + [sys.executable, "-B", "-s", *args],
                              cwd=root, env=env, stdin=subprocess.DEVNULL,
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=600)
        log = proc.stdout.decode(errors="replace")
        print(f"[{label}] exit {proc.returncode}\n{log}", flush=True)
        if proc.returncode:
            failures.append(f"{label}: exit {proc.returncode}")
        elif label == "unittest" and not re.search(r"^Ran [1-9]\d* tests? in ", log, re.M):
            failures.append("unittest: no nonempty test run reported")
    require(not failures, " | ".join(failures))


def same_output(path, canonical):
    with regular(path) as a, canonical.open("rb") as b:
        while True:
            block = b.read(CHUNK)
            require(a.read(CHUNK) == block, f"existing output differs from canonical bytes: {path}")
            if not block:
                return


def publish(path, canonical):
    # Stage on the destination filesystem and link atomically without replacing.
    with tempfile.TemporaryDirectory(prefix=".compass-publish-", dir=path.parent) as td:
        stage = Path(td) / "bundle"
        shutil.copyfile(canonical, stage)
        same_output(stage, canonical)
        try:
            os.link(stage, path)
        except FileExistsError:
            same_output(path, canonical)
            return "already identical"
    return "created"


def run(args):
    output = args.output.absolute()
    require(output.suffix == ".skill" and output.parent.is_dir(), "expected an existing parent and a .skill output")
    require(not args.installed or args.verify_only, "--installed requires --verify-only")
    existing = os.path.lexists(output)
    require(existing or not args.verify_only, f"missing bundle for verification: {output}")
    with tempfile.TemporaryDirectory(prefix="compass-release-") as tmp:
        temp = Path(tmp).resolve()
        scratch = temp / "test"
        scratch.mkdir()
        env = environment(scratch)
        bare, commit, tree, algo, stamp = pinned_source(args.worktree, args.commit, temp, env)
        entries, dirs = inventory(bare, tree, env)
        canonical = temp / "canonical.skill"
        archive(bare, tree, stamp, env, canonical)
        print(f"Commit {commit}\nTree {tree}\nGit object format {algo}", flush=True)
        bundle = canonical
        if existing:
            bundle = temp / "supplied.skill"
            with regular(output) as src, bundle.open("xb") as dst:
                shutil.copyfileobj(src, dst)
        extracted = scratch / NAME
        verify_zip(bundle, extracted, entries, dirs, algo)
        if existing:
            same_output(output, canonical)
            same_output(bundle, canonical)
        print(f"ZIP parity: {len(entries)} files, {sum(e.executable for e in entries.values())} executable")
        if args.installed:
            installed_parity(args.installed, entries, dirs, algo)
        run_tests(extracted, scratch, env)
        if existing or args.verify_only:
            same_output(output, canonical)
            result = "verified existing bundle"
        else:
            result = publish(output, canonical)
        with canonical.open("rb") as f:
            sha = hashlib.sha256()
            for chunk in iter(lambda: f.read(CHUNK), b""):
                sha.update(chunk)
        print(f"PASS: {result}\nSHA-256 {sha.hexdigest()}\n{output}")


def main():
    p = argparse.ArgumentParser(description=__doc__, epilog="Git with archive --mtime required. "
        "Tests run offline under macOS sandbox-exec or Linux bubblewrap. An existing .skill "
        "must match canonical ZIP bytes, including metadata. Installed parity uses Git executable modes.")
    p.add_argument("--worktree", required=True, type=Path)
    p.add_argument("--commit", required=True, help="a local commit ID or revision resolving to a commit")
    p.add_argument("--output", required=True, type=Path, help="new or existing .skill path")
    p.add_argument("--verify-only", action="store_true", help="require an existing bundle and never replace it")
    p.add_argument("--installed", type=Path, metavar="PACKAGE_DIR", help="also compare the existing installation")
    args = p.parse_args()
    try:
        run(args)
    except (Failure, OSError, ValueError, EOFError, RuntimeError, zipfile.BadZipFile, zlib.error,
            subprocess.SubprocessError) as exc:
        p.exit(1, f"FAIL: {exc}\n")


if __name__ == "__main__":
    main()
