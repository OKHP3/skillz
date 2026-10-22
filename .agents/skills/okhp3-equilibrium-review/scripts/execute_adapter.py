import asyncio
import subprocess


async def _execute(argv, timeout_seconds):
    process = await asyncio.create_subprocess_exec(
        *argv,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout_seconds)
    except asyncio.TimeoutError as error:
        process.kill()
        await process.communicate()
        raise subprocess.TimeoutExpired(argv, timeout_seconds) from error
    return subprocess.CompletedProcess(
        argv,
        process.returncode,
        stdout.decode("utf-8", errors="replace"),
        stderr.decode("utf-8", errors="replace"),
    )


def execute_adapter(argv, timeout_seconds):
    return asyncio.run(_execute(argv, timeout_seconds))
