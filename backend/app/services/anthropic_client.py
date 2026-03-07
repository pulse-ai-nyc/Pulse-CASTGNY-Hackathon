import asyncio
import json
import logging

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"


async def query(prompt: str, system: str = "", max_tokens: int = 4096) -> str:
    try:
        cmd = [
            "claude",
            "--print",
            "--output-format", "text",
            "--model", MODEL,
            "--max-turns", "1",
        ]
        if system:
            cmd.extend(["--append-system-prompt", system])

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(input=prompt.encode()), timeout=60
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            logger.error("Claude CLI timed out after 60s")
            return "Error: Claude CLI timed out after 60s"

        if proc.returncode != 0:
            err = stderr.decode().strip()
            logger.error(f"Claude CLI error: {err}")
            return f"Error: {err}"

        result = stdout.decode().strip()
        if not result:
            logger.error("Claude CLI returned empty response")
            return "Error: Claude CLI returned empty response"

        return result
    except asyncio.TimeoutError:
        raise
    except Exception as e:
        logger.error(f"Claude CLI query error: {e}")
        return f"Error: {e}"


async def query_json(prompt: str, system: str = "") -> str:
    cmd = [
        "claude",
        "--print",
        "--output-format", "json",
        "--model", MODEL,
        "--max-turns", "1",
    ]
    if system:
        cmd.extend(["--append-system-prompt", system])

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(input=prompt.encode()), timeout=60
        )
    except asyncio.TimeoutError:
        proc.kill()
        await proc.wait()
        logger.error("Claude CLI timed out after 60s")
        return "Error: Claude CLI timed out after 60s"

    if proc.returncode != 0:
        err = stderr.decode().strip()
        logger.error(f"Claude CLI error: {err}")
        return f"Error: {err}"

    try:
        data = json.loads(stdout.decode())
        return data.get("result", stdout.decode().strip())
    except json.JSONDecodeError:
        return stdout.decode().strip()
