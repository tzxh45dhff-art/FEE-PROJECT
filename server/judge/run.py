"""
Huddle's code judge: one submission, every case, in a throwaway container.

Reads one JSON object on stdin:
    {"language": "java", "code": "...", "inputs": ["...", ...], "limit": 5}
and prints one JSON object on stdout:
    {"compileError": null | "...", "results": [{"stdout", "stderr", "error", "ms"}, ...]}

The container it runs in has no network, a read-only filesystem apart from
/tmp, capped memory, CPU and processes, and no root — see judge.service.ts.
This script only has to compile once, run each case with a time limit, and
report honestly.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor

OUTPUT_LIMIT = 64 * 1024
PARALLEL = 2


def clip(text):
    text = text.decode("utf-8", "replace") if isinstance(text, bytes) else (text or "")
    return text if len(text) <= OUTPUT_LIMIT else text[:OUTPUT_LIMIT] + "\n…(output cut short)"


def prepare(language, code, work):
    """Write the source, compile it if the language needs that, and return the command to run."""
    if language == "java":
        # The file has to be named after its public class; the starters use Main.
        found = re.search(r"public\s+(?:final\s+)?class\s+(\w+)", code)
        name = found.group(1) if found else "Main"
        with open(os.path.join(work, f"{name}.java"), "w") as f:
            f.write(code)
        compile_cmd = ["javac", "-J-Xmx384m", "-J-XX:+UseSerialGC", "-encoding", "UTF-8", "-d", work, f"{name}.java"]
        run_cmd = ["java", "-Xmx256m", "-Xss64m", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-cp", work, name]
    elif language == "cpp":
        with open(os.path.join(work, "main.cpp"), "w") as f:
            f.write(code)
        compile_cmd = ["g++", "-O2", "-std=gnu++17", "-pipe", "-o", "prog", "main.cpp"]
        run_cmd = [os.path.join(work, "prog")]
    elif language == "c":
        with open(os.path.join(work, "main.c"), "w") as f:
            f.write(code)
        compile_cmd = ["gcc", "-O2", "-std=gnu11", "-pipe", "-o", "prog", "main.c", "-lm"]
        run_cmd = [os.path.join(work, "prog")]
    elif language == "python":
        with open(os.path.join(work, "main.py"), "w") as f:
            f.write(code)
        compile_cmd = None
        run_cmd = ["python3", "main.py"]
    elif language == "javascript":
        with open(os.path.join(work, "main.js"), "w") as f:
            f.write(code)
        compile_cmd = None
        run_cmd = ["node", "main.js"]
    else:
        raise ValueError(f"This judge cannot run {language}.")

    if compile_cmd:
        done = subprocess.run(compile_cmd, cwd=work, capture_output=True, timeout=60)
        if done.returncode != 0:
            return None, clip(done.stderr or done.stdout) or "It did not compile."
    return run_cmd, None


def run_case(run_cmd, work, stdin, limit):
    started = time.monotonic()
    try:
        done = subprocess.run(run_cmd, cwd=work, input=stdin.encode(), capture_output=True, timeout=limit)
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": "", "error": f"Took longer than {limit:g} seconds.", "ms": int(limit * 1000)}
    ms = int((time.monotonic() - started) * 1000)
    error = None
    if done.returncode != 0:
        stderr = clip(done.stderr).strip()
        if done.returncode < 0:
            signal = -done.returncode
            error = stderr or ("Ran out of memory." if signal == 9 else f"Stopped by signal {signal}.")
        else:
            error = stderr or f"Exited with code {done.returncode}."
    return {"stdout": clip(done.stdout), "stderr": clip(done.stderr), "error": error, "ms": ms}


def main():
    job = json.load(sys.stdin)
    limit = float(job.get("limit", 5))
    work = tempfile.mkdtemp(dir="/tmp")
    try:
        run_cmd, compile_error = prepare(job["language"], job["code"], work)
    except subprocess.TimeoutExpired:
        run_cmd, compile_error = None, "Compiling took too long."
    except ValueError as exc:
        run_cmd, compile_error = None, str(exc)
    if compile_error:
        print(json.dumps({"compileError": compile_error, "results": []}))
        return
    with ThreadPoolExecutor(PARALLEL) as pool:
        results = list(pool.map(lambda stdin: run_case(run_cmd, work, stdin, limit), job["inputs"]))
    print(json.dumps({"compileError": None, "results": results}))


main()
