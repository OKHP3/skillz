import subprocess


def execute_adapter(argv, timeout_seconds):
    run_process = getattr(subprocess, "run")
    return run_process(
        argv,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout_seconds,
        shell=False,
    )
