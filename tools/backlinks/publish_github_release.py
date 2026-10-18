# -*- coding: utf-8 -*-
"""
发布 GitHub 官方顶级 Release (DA 96+)
为 chanzong.space 建立永久的 GitHub Release 索引页面与权威 Dofollow 外部链接。
"""
import os
import sys
import subprocess
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

RELEASE_NOTES = """## 🌟 禅宗知识库 (chanzong.space) v1.0.0 正式发布

> 🍃 **全球非营利数字化禅门典籍、机锋公案与多维知识图谱体系**  
> 官方网站：**[chanzong.space](https://chanzong.space)** | 正體中文鏡像：**[chanzong.space/zh-tw](https://chanzong.space/zh-tw)**

---

### 📖 本次版本核心特性

1. **40+ 部禅门核心印心经典数字化上线**：
   - 包含《六祖坛经》、《金刚经》、《心经》、《大佛顶首楞严经》、《达摩血脉论》、《信心铭》、《永嘉证道歌》、《无门关》、《碧岩录》、《黄檗传心法要》、《临济录》、《八识规矩颂》等。
   - 每部典籍均提供**现代独家白话导读**、**核心旨趣**、**重点偈颂白话解读**与**校勘原文**。
   - 典籍总览入口：[https://chanzong.space/classics](https://chanzong.space/classics)

2. **D3.js 交互式禅门关系图谱**：
   - 支持【中心正法】、【祖师人物】、【核心经典】、【核心概念】、【修持法门】、【公案机锋】六大维度物理力导向图谱。
   - 交互图谱入口：[https://chanzong.space/graph](https://chanzong.space/graph)

3. **网状多卡片交叉互链 (Card Interlinking)**：
   - 160+ 核心禅宗概念（如“转识成智”、“无住生心”、“父母未生前本来面目”）：[https://chanzong.space/concepts](https://chanzong.space/concepts)
   - 205+ 则历代祖师公案机锋问答：[https://chanzong.space/qas](https://chanzong.space/qas)
   - 20+ 传统参修法门：[https://chanzong.space/methods](https://chanzong.space/methods)

4. **全球多语言与离线参修**：
   - 全站支持繁体/简体正体无缝切换；
   - 原生 PWA 离线缓存支持，断网亦可参修。

欢迎参研、引用与学术探讨！
"""

def publish_release():
    print("="*60)
    print("🚀 正在通过 GitHub CLI 发布官方 Release v1.0.0 (DA 96+)...")
    print("="*60)
    
    notes_file = os.path.join(CUR_DIR, "RELEASE_v1.0.0.md")
    with open(notes_file, "w", encoding="utf-8") as f:
        f.write(RELEASE_NOTES)
        
    tag = "v1.0.0"
    title = "v1.0.0: 禅宗知识库 (chanzong.space) 数字化典籍与 D3.js 知识图谱正式发布"
    
    cmd = [
        "gh", "release", "create", tag,
        "--title", title,
        "--notes-file", notes_file
    ]
    
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True, encoding="utf-8")
        release_url = res.stdout.strip()
        print(f"🎉 成功发布 GitHub 官方 Release！\n👉 永久在线地址: {release_url}")
        
        add_backlink(
            platform="GitHub (顶级根域名 DA 96)",
            region="海外繁体",
            category="开源代码与版本发布",
            post_title=title,
            target_url=SITE_DOMAIN,
            backlink_url=release_url,
            anchor_text="禅宗知识库 (chanzong.space) 官方发布",
            link_type="Dofollow",
            status="Live",
            notes="GitHub 官方 Release 独立公开页面，包含 40+ 典籍落地页、图谱导航与中英繁简多入口"
        )
        return release_url
    except Exception as e:
        print("⚠️ 发布 Release 失败:", e)
        return None
    finally:
        if os.path.exists(notes_file):
            try:
                os.remove(notes_file)
            except Exception:
                pass

if __name__ == "__main__":
    publish_release()
