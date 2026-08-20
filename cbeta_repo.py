#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Navigate CBETA GitHub repo to find text IDs."""
import io, sys, json, ssl, urllib.request
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_json(url, timeout=20):
    headers = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return [{"error": str(e)}]

# List contents of T directory (if it exists) or find the right one
# The repo uses single-letter dirs. Let me check what they are.
# In CBETA, the canon codes are:
# T = 大正藏, X = 卍續藏, A = 印順法師佛學著作集, etc.
# But the repo dirs are: A, B, C, CC, D, F, G, GA, GB, I, J, K, L, LC, M, N, P, S

# Let me check if T is inside one of these, or if the naming is different
# Actually, let me check the CBETA XML repo which might have better organization
repos_to_check = [
    ("cbeta-normal-text", "T"),
    ("cbeta-normal-text", "X"),
    ("CBETA-txt", "T"),
    ("CBETA-txt", "X"),
    ("cbeta-xml-git", "T"),
    ("cbeta-xml-git", "X"),
]

for repo, subdir in repos_to_check:
    url = f"https://api.github.com/repos/DILA-edu/{repo}/contents/{subdir}"
    result = fetch_json(url)
    if isinstance(result, list) and not result[0].get("error"):
        print(f"=== {repo}/{subdir} ===")
        for item in result[:10]:
            print(f"  {item.get('name', '?'):30s} {item.get('type', '?')}")
        print(f"  ... total {len(result)} items")
        print()
    else:
        err = result[0].get("error", "unknown") if isinstance(result, list) else "unknown"
        print(f"{repo}/{subdir}: {err[:60]}")

# Also check the root of cbeta-xml-git
print("\n=== cbeta-xml-git root ===")
url = "https://api.github.com/repos/cbeta-org/cbeta-xml-git/contents"
result = fetch_json(url)
if isinstance(result, list) and not result[0].get("error"):
    for item in result[:20]:
        print(f"  {item.get('name', '?'):30s} {item.get('type', '?')}")
