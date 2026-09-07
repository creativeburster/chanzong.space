# -*- coding: utf-8 -*-
"""
批量发布国内简体高权重外链专栏，迅速拉升国内 60% 配比
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from telegraph_publisher import create_telegraph_page, synthesize_article
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

DOMESTIC_CLASSICS = [
    {"id": "dahuiyulu", "title": "大慧普觉禅师语录", "author": "大慧宗杲"},
    {"id": "dongshanyulu", "title": "洞山良价禅师语录", "author": "洞山良价"},
    {"id": "caoshanyulu", "title": "曹山本寂禅师语录", "author": "曹山本寂"},
    {"id": "yunmenguanglu", "title": "云门匡真禅师广录", "author": "云门文偃"},
    {"id": "zhaozhouyulu", "title": "赵州从谂禅师语录", "author": "赵州从谂"},
    {"id": "chanyuan_zhuquanjiduxu", "title": "禅源诸诠集都序", "author": "宗密"},
    {"id": "wanshan_tongguiji", "title": "万善同归集", "author": "永明延寿"},
    {"id": "shiniutu", "title": "住鼎州梁山廓庵和尚十牛图颂", "author": "廓庵师远"},
    {"id": "dachengqixinlun", "title": "大乘起信论", "author": "马鸣菩萨"},
    {"id": "lengyanjing", "title": "大佛顶如来密因修证了义诸菩萨万行首楞严经", "author": "般剌密帝译"}
]

def publish_domestic_batch():
    print("="*60)
    print("🚀 正在批量上线 10 篇国内核心经典深度专栏 (冲刺国内 60% 配比)...")
    print("="*60)
    
    for item in DOMESTIC_CLASSICS:
        bid = item["id"]
        title = item["title"]
        target_url = f"{SITE_DOMAIN}/books/{bid}"
        
        art_title, art_body, _ = synthesize_article(title, is_traditional=False)
        paragraphs = art_body.split("\n\n")
        anchor = f"《{title}》原文详注与禅宗图谱"
        
        try:
            live_url = create_telegraph_page(
                title=art_title,
                body_paragraphs=paragraphs,
                target_url=target_url,
                anchor_text=anchor,
                is_traditional=False
            )
            print(f"✅ 上线成功: 《{art_title[:20]}...》 -> {live_url}")
            add_backlink(
                platform="Telegraph (高权重学术专栏)",
                region="国内",
                category="文献长文",
                post_title=art_title,
                target_url=target_url,
                backlink_url=live_url,
                anchor_text=anchor,
                link_type="Dofollow",
                status="Live",
                notes=f"针对国内读者深度解析《{title}》，挂载经典页与全站 D3 图谱"
            )
        except Exception as e:
            print(f"⚠️ 发布出错: {e}")

if __name__ == "__main__":
    publish_domestic_batch()
