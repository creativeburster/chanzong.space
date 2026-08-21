#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Download CBETA catalog from GitHub and search for text IDs."""
import io, sys, json, ssl, urllib.request, urllib.parse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url, timeout=30):
    headers = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.read()
    except Exception as e:
        print(f"ERROR fetching {url}: {e}")
        return None

# Try to get CBETA catalog from GitHub
# The cbeta-normal-text repo has a catalog file
catalog_urls = [
    "https://raw.githubusercontent.com/DILA-edu/cbeta-normal-text/master/catalog.csv",
    "https://raw.githubusercontent.com/DILA-edu/cbeta-normal-text/main/catalog.csv",
    "https://raw.githubusercontent.com/DILA-edu/CBETA-txt/master/catalog.csv",
]

for url in catalog_urls:
    print(f"Trying: {url}")
    data = fetch(url)
    if data:
        text = data.decode('utf-8')
        print(f"  Got {len(text)} chars")
        print(text[:500])
        print()
        break
    else:
        print("  Failed\n")

# Also try GitHub API to list repo contents
print("=== Trying GitHub API for repo contents ===")
api_url = "https://api.github.com/repos/DILA-edu/cbeta-normal-text/contents"
data = fetch(api_url)
if data:
    items = json.loads(data.decode('utf-8'))
    if isinstance(items, list):
        for item in items[:20]:
            print(f"  {item.get('name', '?'):40s} {item.get('type', '?')}")
    else:
        print(json.dumps(items, ensure_ascii=False)[:500])
