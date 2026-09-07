# -*- coding: utf-8 -*-
"""
全量外链落地页 (Target URL) 严密审核与校准脚本
对比 manifest.json 中的全部官方规范 ID，检查所有已发布外链中的落地页是否存在 404 或命名偏差。
"""
import os
import csv
import json
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "seo", "backlinks_log.csv")
MANIFEST_PATH = os.path.join(BASE_DIR, "manifest.json")

def audit():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    valid_ids = {item["id"]: item["title"] for item in manifest}
    
    with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    print(f"=== 正在审核全量 {len(rows)} 条外链记录中的落地页 ===")
    
    issues = []
    
    for r in rows:
        rec_id = r["id"]
        platform = r["platform"]
        target_url = r["target_url"]
        backlink_url = r["backlink_url"]
        
        # 提取 URL 路径
        # 例如: https://chanzong.space/books/liuzutanjing -> /books/liuzutanjing
        path = target_url.replace("https://chanzong.space", "")
        parts = [p for p in path.split("/") if p and p != "zh-tw"]
        
        if not parts:
            # 首页 https://chanzong.space
            continue
            
        route_type = parts[0] # books, classics, sitemap.xml, graph, etc.
        
        if route_type in ["sitemap.xml", "graph", "qas", "concepts", "methods", "persons"]:
            continue
            
        if len(parts) >= 2:
            book_id = parts[1]
            status_desc = []
            
            # 检查路由前缀是否是 /books/
            if route_type == "books":
                status_desc.append("路由使用了 /books/ 而非 /classics/")
                
            # 检查 book_id 是否在 manifest 中有效
            if book_id not in valid_ids:
                status_desc.append(f"经典ID '{book_id}' 不在 manifest.json 中！")
            else:
                matched_title = valid_ids[book_id]
                
            if status_desc:
                issues.append({
                    "id": rec_id,
                    "platform": platform,
                    "target_url": target_url,
                    "backlink_url": backlink_url,
                    "book_id": book_id,
                    "issues": "; ".join(status_desc)
                })
                
    print(f"\n发现 {len(issues)} 处落地页问题：")
    for iss in issues:
        print(f"[{iss['id']}] {iss['platform']}")
        print(f"  当前目标: {iss['target_url']}")
        print(f"  外部文章: {iss['backlink_url']}")
        print(f"  问题详情: {iss['issues']}\n")
        
    return issues, valid_ids

if __name__ == "__main__":
    audit()
