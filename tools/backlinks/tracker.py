# -*- coding: utf-8 -*-
"""
chanzong.space 外链成果追踪与统计系统
"""
import os
import sys
import csv
from datetime import datetime

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

SEO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "seo")
CSV_PATH = os.path.join(SEO_DIR, "backlinks_log.csv")
REPORT_PATH = os.path.join(SEO_DIR, "BACKLINKS_REPORT.md")

HEADERS = [
    "id",
    "timestamp",
    "platform",
    "region",            # 国内 / 海外繁体 / 英文
    "category",          # 问答 / 专栏 / 目录 / 社区 / 社交
    "post_title",        # 对应问题或文章标题
    "target_url",        # chanzong.space 目标落地页
    "backlink_url",      # 成功发布的外部链接
    "anchor_text",       # 锚文本
    "link_type",         # Dofollow / Nofollow / UGC
    "status",            # Live / Pending / Review
    "notes"
]

def init_tracker():
    os.makedirs(SEO_DIR, exist_ok=True)
    if not os.path.exists(CSV_PATH):
        with open(CSV_PATH, mode="w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            writer.writerow(HEADERS)

def add_backlink(platform: str, region: str, category: str, post_title: str,
                 target_url: str, backlink_url: str, anchor_text: str = "",
                 link_type: str = "UGC", status: str = "Live", notes: str = ""):
    init_tracker()
    
    # 获取现有数量
    count = 0
    if os.path.exists(CSV_PATH):
        with open(CSV_PATH, mode="r", encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            count = max(0, sum(1 for _ in reader) - 1)
            
    record_id = f"BL-{count + 1:04d}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    row = [
        record_id,
        now_str,
        platform,
        region,
        category,
        post_title,
        target_url,
        backlink_url,
        anchor_text,
        link_type,
        status,
        notes
    ]
    
    with open(CSV_PATH, mode="a", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(row)
        
    generate_markdown_report()
    print(f"[Tracker] 成功记录外链 [{record_id}] - {platform} ({region}): {backlink_url}")
    return record_id

def generate_markdown_report():
    if not os.path.exists(CSV_PATH):
        return
        
    rows = []
    with open(CSV_PATH, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
            
    total = len(rows)
    cn_count = sum(1 for r in rows if "国内" in r.get("region", ""))
    overseas_count = sum(1 for r in rows if "海外" in r.get("region", "") or "繁体" in r.get("region", ""))
    
    cn_pct = f"{(cn_count / total * 100):.1f}%" if total > 0 else "0%"
    overseas_pct = f"{(overseas_count / total * 100):.1f}%" if total > 0 else "0%"
    
    report_content = f"""# 禅宗知识库 (chanzong.space) 外链建设监控报告

> 更新时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
> 目标配比: **国内 60% : 海外及繁体 40%**  
> 当前达成: **国内 {cn_count} 条 ({cn_pct}) : 海外繁体 {overseas_count} 条 ({overseas_pct})** | 总计: **{total} 条**

---

## 📊 平台分布统计

| 区域 | 平台 | 数量 | 占比 |
|---|---|---|---|
"""
    # 统计各平台
    platform_counts = {}
    for r in rows:
        p = r.get("platform", "未知")
        platform_counts[p] = platform_counts.get(p, 0) + 1
        
    for p, cnt in sorted(platform_counts.items(), key=lambda x: x[1], reverse=True):
        report_content += f"| - | {p} | {cnt} | {(cnt / total * 100):.1f}% |\n"
        
    report_content += """
---

## 🔗 外链明细清单

| 编号 | 时间 | 平台 | 区域 | 标题/主题 | 目标落地页 | 外部链接 | 状态 |
|---|---|---|---|---|---|---|---|
"""
    for r in reversed(rows):
        rec_id = r.get("id", "")
        ts = r.get("timestamp", "").split(" ")[0]
        plat = r.get("platform", "")
        reg = r.get("region", "")
        title = r.get("post_title", "")[:25] + "..." if len(r.get("post_title", "")) > 25 else r.get("post_title", "")
        turl = r.get("target_url", "")
        burl = r.get("backlink_url", "")
        st = r.get("status", "Live")
        
        report_content += f"| {rec_id} | {ts} | {plat} | {reg} | {title} | [{turl.replace('https://chanzong.space', '')}]({turl}) | [{plat}发布]({burl}) | {st} |\n"

    report_content += "\n---\n*本报告由 chanzong.space 自动化外链工作流实时生成维护*\n"
    
    with open(REPORT_PATH, mode="w", encoding="utf-8") as f:
        f.write(report_content)

if __name__ == "__main__":
    init_tracker()
    generate_markdown_report()
    print("Tracker initialized.")
