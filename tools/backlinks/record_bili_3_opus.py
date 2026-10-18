# -*- coding: utf-8 -*-
import os, sys, time, json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from tracker import add_backlink
from playwright.sync_api import sync_playwright

records = [
    {
        "platform": "哔哩哔哩 (Bilibili DA 94+)",
        "region": "国内",
        "category": "社交媒体 / 动态广场",
        "post_title": "【禅宗根基 · 一心二门】《大乘起信论》心性本觉义理与现代认知解构",
        "target_url": "https://chanzong.space/classics/dachengqixinlun",
        "backlink_url": "https://www.bilibili.com/opus/1245868844651642883",
        "anchor_text": "《大乘起信论》梁译古本白话详解与心性脉络图谱（https://chanzong.space/classics/dachengqixinlun）",
        "link_type": "Dofollow / UGC",
        "status": "Live",
        "notes": "B站官方认证账号“禅宗空间”发布《大乘起信论》独立图文动态(Opus)，免登录公开收录"
    },
    {
        "platform": "哔哩哔哩 (Bilibili DA 94+)",
        "region": "国内",
        "category": "社交媒体 / 动态广场",
        "post_title": "【直指人心 · 莫向外求】黄檗希运禅师《传心法要》即心即佛参修指引",
        "target_url": "https://chanzong.space/classics/chuanxinfayao",
        "backlink_url": "https://www.bilibili.com/opus/1245869067999379456",
        "anchor_text": "《黄檗山断际禅师传心法要》白话详注与公案图谱（https://chanzong.space/classics/chuanxinfayao）",
        "link_type": "Dofollow / UGC",
        "status": "Live",
        "notes": "B站官方认证账号“禅宗空间”发布《黄檗断际禅师传心法要》独立图文动态(Opus)，免登录公开收录"
    },
    {
        "platform": "哔哩哔哩 (Bilibili DA 94+)",
        "region": "国内",
        "category": "社交媒体 / 动态广场",
        "post_title": "【绝言绝虑 · 唯嫌拣择】三祖僧璨大师《信心铭》圆融无碍的觉醒心法",
        "target_url": "https://chanzong.space/classics/xinxinming",
        "backlink_url": "https://www.bilibili.com/opus/1245869282739355655",
        "anchor_text": "《信心铭》古本逐句白话详注与圆融实相图谱（https://chanzong.space/classics/xinxinming）",
        "link_type": "Dofollow / UGC",
        "status": "Live",
        "notes": "B站官方认证账号“禅宗空间”发布《三祖僧璨信心铭》独立图文动态(Opus)，免登录公开收录"
    }
]

print("=== 正在将 3 条 B 站独立动态写入总账 ===")
for r in records:
    rec_id = add_backlink(**r)
    print(f"✅ 已记录: {rec_id} -> {r['backlink_url']}")

print("\n=== 正在匿名访问落地页并截图留存凭证 ===")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    for r in records:
        oid = r["backlink_url"].split("/")[-1]
        print(f"正在截图验证 {r['backlink_url']} ...")
        page.goto(r["backlink_url"], wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        shot_file = f"tools/backlinks/bili_opus_{oid}_live.png"
        page.screenshot(path=shot_file)
        print(f"📸 凭证保存至: {shot_file}")
    browser.close()

print("\n🎉 B 站 3 篇动态已全部完成存证与入库！")
