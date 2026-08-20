#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Try CBETA API endpoints to find text IDs."""
import io, sys, json, ssl, urllib.request, urllib.parse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url, timeout=15):
    headers = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.read().decode('utf-8')
    except Exception as e:
        return f"ERROR: {e}"

# Try various API endpoints
endpoints = [
    "https://cbdata.dila.edu.tw/stable/api?q=宏智正觉",
    "https://cbdata.dila.edu.tw/stable/api/search?q=宏智正觉",
    "https://cbdata.dila.edu.tw/stable/api/v1/search?q=宏智正觉",
    "https://cbdata.dila.edu.tw/stable/api/v1.2/search?q=宏智正觉",
    "https://cbdata.dila.edu.tw/v1.2/search?q=宏智正觉",
    "https://cbdata.dila.edu.tw/api/v1.2/search?q=宏智正觉",
]

for url in endpoints:
    q = urllib.parse.quote("宏智正觉")
    full_url = url.replace("宏智正觉", q)
    result = fetch(full_url)
    status = "OK" if not result.startswith("ERROR") else result[:80]
    print(f"{url[:60]:60s} -> {status[:80]}")

# Also try downloading T1971 to verify it's the right text
print("\n=== Downloading T1971 to verify ===")
import zipfile
url = "https://cbdata.dila.edu.tw/stable/download/text/T1971.txt.zip"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
        data = resp.read()
        with open('test_T1971.zip', 'wb') as f:
            f.write(data)
        with zipfile.ZipFile('test_T1971.zip') as z:
            for name in z.namelist():
                content = z.read(name).decode('utf-8')
                print(f"File: {name}, size: {len(content)} chars")
                print(content[:500])
except Exception as e:
    print(f"ERROR: {e}")
