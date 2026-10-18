# -*- coding: utf-8 -*-
import os
import sys
import csv

CSV_PATH = "seo/backlinks_log.csv"

rows = []
with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    for r in reader:
        if r and r[0] == "BL-0094":
            r[7] = "https://weibo.com/6196660530/Rh9rm717s"
        rows.append(r)

with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print("BL-0094 backlink_url updated to https://weibo.com/6196660530/Rh9rm717s")

sys.path.append("tools/backlinks")
from tracker import generate_markdown_report
generate_markdown_report()
print("Report regenerated.")
