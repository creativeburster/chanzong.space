# -*- coding: utf-8 -*-
import os
import sys
import csv

CSV_PATH = "seo/backlinks_log.csv"

rows = []
with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    for r in reader:
        if r and r[0] == "BL-0104":
            # 替换为成功发布的【强势文化王叔】金刚经互动评论
            r[5] = "博主【强势文化王叔】热门博文互动：金刚经凡所有相皆是虚妄与若见诸相非相"
            r[6] = "https://chanzong.space/classics/jingangjing"
            r[7] = "https://weibo.com/detail/5050317203314926"
            r[8] = "禅宗知识库 (chanzong.space) · 金刚经见性修持架构"
            r[11] = "在博主【强势文化王叔】金刚经破执博文下发表深度学术互动，随喜赞叹，自然引荐非营利开源《禅宗知识库》"
        rows.append(r)

with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print("BL-0104 updated to 强势文化王叔 (5050317203314926).")

sys.path.append("tools/backlinks")
from tracker import generate_markdown_report
generate_markdown_report()
print("Markdown report regenerated.")
