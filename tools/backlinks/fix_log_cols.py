# -*- coding: utf-8 -*-
import csv

path = "seo/backlinks_log.csv"
rows = []
with open(path, "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    for row in reader:
        if row and row[0] in ["BL-0115", "BL-0116", "BL-0117", "BL-0118", "BL-0119", "BL-0120"]:
            # 修正 region 为 国内，category 为 书评
            row[3] = "国内"
            row[4] = "书评"
        rows.append(row)

with open(path, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print("已规范修正 BL-0115~BL-0120 的 region 字段！")
