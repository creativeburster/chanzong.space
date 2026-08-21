#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Search CBETA API for text IDs of 22 classics."""
import io, sys, json, ssl, urllib.request, urllib.parse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_json(url, timeout=20):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {"error": str(e)}

# Known/likely CBETA IDs for the 22 classics
# Format: (title, [possible IDs to try])
TARGETS = [
    ("宏智正觉禅师广录", ["T1971"]),
    ("高峰原妙禅师禅要", ["X70no1384"]),  # guess
    ("中峰和尚广录", ["X70no1399"]),  # guess
    ("德山宣鉴禅师语录", ["T1987"]),  # guess - actually in 古尊宿语录
    ("雪峰义存禅师语录", ["T2072"]),  # guess - 雪峰广录 might be X
    ("玄沙师备禅师语录", ["T2073"]),  # guess
    ("药山惟俨禅师语录", ["T1987"]),  # might be in 古尊宿
    ("石霜楚圆禅师语录", ["T1992"]),  # guess
    ("杨岐方会禅师语录", ["T1992"]),  # might be in 古尊宿
    ("黄龙慧南禅师语录", ["T1993"]),  # guess
    ("密庵咸杰禅师语录", ["T1996"]),  # guess
    ("憨山老人梦游集", ["X73no1456"]),  # guess
    ("紫柏老人全集", ["X73no1492"]),  # guess
    ("人天眼目", ["T2006"]),
    ("林间录", ["T2075"]),
    ("禅宗决疑集", ["X63no1244"]),  # guess
    ("空谷道人击节录", ["X63no1243"]),  # guess
    ("楞伽阿跋多罗宝经", ["T0670"]),
    ("肇论", ["T1858"]),
    ("注维摩诘经", ["T1775"]),
    ("敕修百丈清规", ["T2025"]),
    ("禅苑清规", ["X63no1245"]),  # guess
]

# Try CBETA search API
print("=== Testing CBETA search API ===")
search_url = "https://cbdata.dila.edu.tw/stable/api/v1.2/search?q=" + urllib.parse.quote("宏智正觉")
result = fetch_json(search_url)
print(json.dumps(result, ensure_ascii=False)[:500])
print()

# Also try direct download for known T numbers
print("=== Testing direct download URLs ===")
test_ids = ["T0670", "T1858", "T1775", "T2025", "T2006", "T1971"]
for tid in test_ids:
    url = f"https://cbdata.dila.edu.tw/stable/download/text/{tid}.txt.zip"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=15, context=ctx)
        size = resp.getheader('Content-Length', 'unknown')
        print(f"  {tid}: OK (size={size})")
        resp.close()
    except Exception as e:
        print(f"  {tid}: {e}")
