# -*- coding: utf-8 -*-
import csv

NEW_BILI_ENTRIES = [
    [
        "BL-0121",
        "2026-09-08 16:58:45",
        "哔哩哔哩 (Bilibili DA 94+)",
        "国内",
        "社交媒体 / 动态广场",
        "【禅宗心悟 · 明心见性】六祖坛经自性清净深度研学动态",
        "https://chanzong.space/classics/tanjing",
        "https://www.bilibili.com/opus/1245624353612103700",
        "《六祖法宝坛经》曹溪古本白话逐句详注与全景心性脉络图谱（chanzong.space/classics/tanjing）",
        "Dofollow / UGC",
        "Live",
        "B站官方认证账号“禅宗空间”发布的独立永久图文动态(Opus)，免登录公开收录，直达坛经专页"
    ],
    [
        "BL-0122",
        "2026-09-08 17:03:58",
        "哔哩哔哩 (Bilibili DA 94+)",
        "国内",
        "学术互动讨论",
        "王德峰教授《六祖坛经的智慧》(62.6万播放)视频学术互动评论",
        "https://chanzong.space/classics/tanjing",
        "https://www.bilibili.com/video/BV1XK4y1X7FF",
        "开源文献库“禅宗知识库”（chanzong.space/classics/tanjing）",
        "UGC 互动讨论",
        "Live",
        "在王德峰教授62.6万播放量顶流视频下开展心性破执学术互动，引荐曹溪古本白话考据库 (官方rpid: 316793129088)"
    ]
]

with open("seo/backlinks_log.csv", "a", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    for row in NEW_BILI_ENTRIES:
        writer.writerow(row)

print("已成功将 B 站两条外链写入 seo/backlinks_log.csv！")
