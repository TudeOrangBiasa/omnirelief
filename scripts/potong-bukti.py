#!/usr/bin/env python3
"""Potong 6 frame merata dari tiap webm bukti + jadikan contact sheet."""
import subprocess, os, glob

SRC = "docs/bukti-video"
OUT = "docs/bukti-video/sheets"
os.makedirs(OUT, exist_ok=True)

def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                        "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)

for webm in sorted(glob.glob(f"{SRC}/[dm]-*.webm")):
    name = os.path.splitext(os.path.basename(webm))[0]
    dur = probe(webm)
    if dur <= 0:
        print(f"LEWAT {name}: durasi 0"); continue
    fps = 4.0
    total = max(1, int(dur * fps))
    step = max(1, total // 6)
    sheet = f"{OUT}/{name}.png"
    w = 240 if name.startswith("m-") else 480
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", webm,
                        "-vf", f"select='not(mod(n\\,{step}))',scale={w}:-1,tile=3x2:margin=4:padding=4",
                        "-frames:v", "1", sheet])
    print(("OK  " if r.returncode == 0 else "GAGAL"), name, f"{dur:.0f}s")
