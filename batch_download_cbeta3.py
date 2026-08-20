#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Batch download remaining 7 CBETA texts."""
import io, sys, ssl, urllib.request, zipfile, os, time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'downloaded_classics')
os.makedirs(OUT_DIR, exist_ok=True)

# (cbeta_id, chinese_name)
TEXTS = [
    ("T2001",  "宏智正觉禅师广录"),
    ("X1333",  "雪峰义存禅师语录"),
    ("X1446",  "玄沙师备禅师语录"),
    ("X1445",  "玄沙师备禅师广录"),
    ("X1338",  "石霜楚圆禅师语录"),
    ("T1994A", "杨岐方会禅师语录"),
    ("T1994B", "杨岐方会和尚后录"),
    ("T1999",  "密庵咸杰禅师语录"),
    ("X1452",  "紫柏老人全集"),
    ("X1453",  "紫柏老人别集"),
]

def fetch(url, timeout=60, retries=3):
    headers = {'User-Agent': 'Mozilla/5.0', 'Accept': '*/*'}
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
                return resp.read()
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2)
                continue
            raise e

def download_text(cbeta_id, name):
    url = f"https://cbdata.dila.edu.tw/stable/download/text/{cbeta_id}.txt.zip"
    try:
        print(f"  下载: {url}")
        data = fetch(url)

        zip_path = os.path.join(OUT_DIR, f"{cbeta_id}_temp.zip")
        with open(zip_path, 'wb') as f:
            f.write(data)

        all_text = []
        with zipfile.ZipFile(zip_path) as z:
            for n in z.namelist():
                if n.endswith('.txt'):
                    content = z.read(n).decode('utf-8', errors='replace')
                    all_text.append(f"=== {n} ===\n{content}")

        for _ in range(5):
            try:
                os.remove(zip_path)
                break
            except:
                time.sleep(0.5)

        if all_text:
            full_text = '\n\n'.join(all_text)
            out_file = os.path.join(OUT_DIR, f"{cbeta_id}_{name}.txt")
            with open(out_file, 'w', encoding='utf-8') as f:
                f.write(full_text)
            print(f"  OK: {out_file} ({len(full_text)} chars)")
            return True
        else:
            print(f"  FAIL: no txt in zip")
            return False

    except Exception as e:
        print(f"  FAIL: {e}")
        zip_path = os.path.join(OUT_DIR, f"{cbeta_id}_temp.zip")
        if os.path.exists(zip_path):
            try: os.remove(zip_path)
            except: pass
        return False

print(f"=== CBETA batch download (round 3) ===")
print(f"Output: {OUT_DIR}")
print(f"Total: {len(TEXTS)}\n")

success = 0
failed = []

for cbeta_id, name in TEXTS:
    print(f"\n--- {cbeta_id} {name} ---")
    if download_text(cbeta_id, name):
        success += 1
    else:
        failed.append(f"{cbeta_id} {name}")

print(f"\n=== Done ===")
print(f"Success: {success}/{len(TEXTS)}")
if failed:
    print(f"Failed: {len(failed)}")
    for f in failed:
        print(f"  - {f}")
