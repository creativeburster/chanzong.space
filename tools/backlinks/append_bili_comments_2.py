# -*- coding: utf-8 -*-
import os, sys, csv
from datetime import datetime

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
SEO_DIR = os.path.join(os.path.dirname(os.path.dirname(CUR_DIR)), "seo")
CSV_PATH = os.path.join(SEO_DIR, "backlinks_log.csv")

sys.path.append(CUR_DIR)
from tracker import generate_markdown_report

new_records = [
    [
        "BL-0123",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "哔哩哔哩 (Bilibili DA 94+)",
        "国内",
        "学术互动讨论",
        "王德峰教授《心经》完整讲读(195万播放)顶流视频学术互动评论",
        "https://chanzong.space/classics/xinjing",
        "https://www.bilibili.com/video/BV1mH4y1c7kP",
        "开源文献库“禅宗知识库”（chanzong.space/classics/xinjing）",
        "UGC 互动讨论",
        "Live",
        "在王德峰教授195万播放量顶流视频下开展色空不二与五蕴破执学术互动，引荐心经梵汉考据库 (官方rpid: 316793416176)"
    ],
    [
        "BL-0124",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "哔哩哔哩 (Bilibili DA 94+)",
        "国内",
        "学术互动讨论",
        "体佛法师《金刚经》讲解(55.4万播放)热门视频学术互动评论",
        "https://chanzong.space/classics/jingangjing",
        "https://www.bilibili.com/video/BV14w4m1d7Kv",
        "开源研学平台“禅宗知识库”（chanzong.space/classics/jingangjing）",
        "UGC 互动讨论",
        "Live",
        "在体佛法师55.4万播放量热门视频下探讨应无所住而生其心与三段论扫相，引荐金刚经详解库 (官方rpid: 316793521696)"
    ]
]

with open(CSV_PATH, "a", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    for r in new_records:
        writer.writerow(r)

print("已成功追加 BL-0123 和 BL-0124 到 backlinks_log.csv！")
generate_markdown_report()
print("已成功重新生成 BACKLINKS_REPORT.md！")
