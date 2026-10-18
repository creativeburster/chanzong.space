# -*- coding: utf-8 -*-
"""
Telegraph (DA 92) 深度学术长文全自动发布矩阵 - 第三批 (重点扩充海外繁体专栏)
"""
import os
import sys
import json
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
sys.path.append(os.path.join(CUR_DIR, "platform_runners"))
from content_synthesizer import synthesize_article, to_traditional
from telegraph_publisher import create_telegraph_page
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

TELEGRAPH_BATCH_3 = [
    {
        "id": "jingangsanmeijing",
        "title": "金剛三昧經本覺心髓：達摩初祖二入四行與無生實相觀",
        "author": "達摩印心根本經",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "shiertimenlun",
        "title": "龍樹菩薩十二門論正觀：緣起性空與禪門頓悟破執指要",
        "author": "龍樹菩薩",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "shengmanjing",
        "title": "勝鬘經如來藏真如心髓：在纏為藏出纏為法身之一乘妙旨",
        "author": "勝鬘夫人 / 求那跋陀羅",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "pingshiyulu",
        "title": "平石如砥禪師語錄精要：直指自心覺照與十二時歌心印",
        "author": "平石如砥",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "chaozongyulu",
        "title": "黃龍四家超宗慧方禪師語錄：古鏡銘與向上一路機鋒考釋",
        "author": "超宗慧方",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "baoxingwangzhenglun",
        "title": "龍樹菩薩寶行王正論：信智二根與大乘仁恕心法圖譜",
        "author": "龍樹菩薩",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "zongmenshenan",
        "title": "麥浪懷禪師宗門設難辨答：達摩不立文字與綱宗活句之究竟圓融",
        "author": "麥浪懷",
        "trad": True,
        "region": "海外繁体"
    },
    {
        "id": "zhiyuelu",
        "title": "指月錄宗門公案全景：千七百則葛藤與如指指月心要",
        "author": "瞿汝稷",
        "trad": True,
        "region": "海外繁体"
    }
]

def run_batch():
    print("="*60)
    print("🚀 启动 Telegraph (DA 92) 深度繁体学术专栏第三批发布...")
    print("="*60)
    
    count = 0
    for item in TELEGRAPH_BATCH_3:
        bid = item["id"]
        title_raw = item["title"]
        author = item["author"]
        is_trad = item["trad"]
        reg = item["region"]
        target_url = f"{SITE_DOMAIN}/zh-tw/classics/{bid}" if is_trad else f"{SITE_DOMAIN}/classics/{bid}"
        
        art_title, art_body, _ = synthesize_article(title_raw, is_traditional=is_trad)
        paragraphs = art_body.split("\n\n")
        anchor = f"《{art_title.split('：')[-1]}》在線閱讀與關係圖譜" if is_trad else f"《{title_raw.split('：')[0]}》在线阅读与知识图谱"
        
        print(f"\n[Telegraph] 正在发布: 《{art_title}》 (语言: {'繁体' if is_trad else '简体'})...")
        try:
            live_url = create_telegraph_page(
                title=art_title,
                body_paragraphs=paragraphs,
                target_url=target_url,
                anchor_text=anchor,
                is_traditional=is_trad
            )
            print(f"🎉 [{reg}] 成功发布永久外链！\n👉 在线地址: {live_url}\n👉 目标落地页: {target_url}")
            
            add_backlink(
                platform="Telegraph (DA 92 高权重专栏)",
                region=reg,
                category="高权重专栏",
                post_title=art_title,
                target_url=target_url,
                backlink_url=live_url,
                anchor_text=anchor,
                link_type="Dofollow",
                status="Live",
                notes=f"深度学术文献长文，附带 D3 知识图谱与《{title_raw.split('：')[0]}》文献回链 ({'繁体' if is_trad else '简体'})"
            )
            count += 1
            time.sleep(1.5)
        except Exception as e:
            print(f"⚠️ Telegraph 发布失败: {e}")
            
    print(f"\n✅ Telegraph 第三批完成！成功新增 {count} 条高权重外部反向链接。")

if __name__ == "__main__":
    run_batch()
