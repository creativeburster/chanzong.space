# -*- coding: utf-8 -*-
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink
from stealth_browser import create_stealth_context

COOKIE_PATH = os.path.join(PROJECT_ROOT, "tools", "backlinks", ".browser_profile", "csdn_cookie.json")
SITE_DOMAIN = "https://chanzong.space"

ARTICLE_TITLE = "数字人文前沿：基于 D3.js 物理力导向算法与 Next.js 14 SSG 的 130 部古典古籍拓扑建模实战"

HTML_CONTENT = """
<h2>一、 引言：古典文献数字化的网状心性挑战</h2>
<p>在传统古典文献的数字化过程中，研究者和读者常常面临两大核心痛点：一是浩如烟海的文献缺乏动态关联，形成了孤立的信息孤岛；二是大量概念、师承法脉和公案机锋交织在一起，传统的线性目录无法直观展现其深层的网状心性结构。</p>
<p>为了攻克这一难题，我们在开源数字化项目 <a href="https://chanzong.space" target="_blank"><strong>禅宗知识库 (chanzong.space)</strong></a> 中，对涵盖中国、印度等历代祖师的 <strong>130 余部核心禅宗典籍</strong>（如《六祖坛经》《传心法要》《信心铭》《碧岩录》等）、500+ 核心心性哲学概念与数百位法脉传承者进行了统一的知识图谱建模与大规模拓扑可视化工程。</p>
<p>本文将从 D3.js 物理仿真防抖调优、Next.js 14 App Router 双轨静态构建 (SSG) 以及强类型本体约束架构三个核心维度，拆解大规模古籍数字化平台的技术实现路径。</p>

<h2>二、 D3.js v7 力导向图多阶段自平衡与防抖优化</h2>
<p>知识图谱在海量节点（3000+ 节点、4500+ 边）渲染时，最常见的技术灾难是“毛球效应”（Hairball）与“持续微动抖动”（Jittering），这不仅会造成用户的认知负荷急剧上升，更会导致低端移动设备的 GPU/CPU 持续过载、电量骤降。</p>
<p>在核心实现中，我们采用了 D3 v7 的自定义力导向模拟器，对不同语义类型的节点施加差异化的物理力：多体斥力分层、按典籍连线与语义权重动态弹簧拉力，并精准将 alphaDecay 调优至 0.0228。仿真物理引擎在用户初次载入后的 3.2 秒内迅速平滑收敛，随后自动冻结节点坐标计算，完全卸载 CPU 物理循环，将画布无缝转为高性能的纯 SVG 平移缩放交互模式。</p>
<p>在线交互体验地址：<a href="https://chanzong.space/graph" target="_blank"><strong>禅宗知识库 · 交互式全景知识图谱</strong></a></p>

<h2>三、 Next.js 14 App Router 简繁双轨 SSG 静态生成</h2>
<p>作为面向全球华人学者与海外汉学界的数字人文站点，既需要支持大陆规范简体中文，也必须支持港澳台及海外通用的正体中文（繁体字）。</p>
<p>如果采用传统的前端 JavaScript 运行时字典替换，会导致严重的页面布局抖动（CLS）、SEO 搜索引擎抓取割裂以及首屏加载耗时增加。为此，我们设计了全量构建期双轨静态页面生成架构：简体中文主干与正体中文镜像对立并存，在 HTML head 中嵌入完整的 hreflang 双向回环标签，配合定制版 OpenCC 词库精准处理佛学专业词汇，达到 0ms TTFB 的极速学术查阅响应。</p>

<h2>四、 开放学术与开源共享</h2>
<p>数字人文的核心理念在于开放与传承。目前全站 130 部经典、白话今译、生僻字注音与知识图谱数据均已面向学术界与同修完全开放。</p>
<ul>
  <li>官方知识库主站：<a href="https://chanzong.space">https://chanzong.space</a></li>
  <li>130 部经典全景索引：<a href="https://chanzong.space/classics">https://chanzong.space/classics</a></li>
  <li>历代祖师法脉谱系：<a href="https://chanzong.space/persons">https://chanzong.space/persons</a></li>
  <li>全网交互式图谱：<a href="https://chanzong.space/graph">https://chanzong.space/graph</a></li>
</ul>
<p>欢迎从事数字人文、前端数据可视化及中国传统哲学数字化的开发者与学者共同探讨交流！</p>
"""

def run():
    print("="*60)
    print("🚀 启动 CSDN 富文本直连发布流程...")
    print("="*60)
    
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        page.goto("https://mp.csdn.net/mp_blog/creation/editor", timeout=35000)
        time.sleep(4)
        
        # 填写标题
        title_inp = page.query_selector("input.article-bar__title, input[placeholder*='文章标题'], #txtTitle")
        if title_inp:
            title_inp.click()
            title_inp.fill(ARTICLE_TITLE)
            print("✅ 标题填入成功:", ARTICLE_TITLE)
            time.sleep(1)
            
        # 填写正文富文本
        res = page.evaluate("""(html) => {
            const editor = document.querySelector('[contenteditable="true"]');
            if (editor) {
                editor.innerHTML = html;
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                editor.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
            return false;
        }""", HTML_CONTENT)
        print("富文本正文注入结果:", res)
        time.sleep(2)
        
        # 点击右下角【发布博客】
        pub_btn = page.query_selector("button:has-text('发布博客')")
        if pub_btn:
            print("点击【发布博客】...")
            pub_btn.click()
            time.sleep(4)
            page.screenshot(path="scratch/csdn_after_direct_pub.png")
            
            # 检查是否有弹窗需要确认
            confirm_modal = page.query_selector(".modal button:has-text('发布博客'), div[class*='dialog'] button:has-text('发布博客'), button.modal__button-publish, .btn-b-red, button:has-text('确认发布')")
            if confirm_modal:
                print("发现确认弹窗，点击最终发布...")
                confirm_modal.click()
                time.sleep(5)
                page.screenshot(path="scratch/csdn_modal_confirmed.png")
            else:
                print("未出现多余弹窗，等待 5 秒完成入库...")
                time.sleep(5)
                
            # 查看文章列表
            page.goto("https://mp.csdn.net/mp_blog/manage/article", timeout=25000)
            time.sleep(3)
            page.screenshot(path="scratch/csdn_manage_direct.png")
            
            first_article = page.query_selector("a[href*='blog.csdn.net'][href*='article/details']")
            if first_article:
                live_url = first_article.get_attribute("href")
                print("🎉🎉 [CSDN] 专家技术长文发布成功！")
                print("👉 独立永久 URL:", live_url)
                
                rec_id = add_backlink(
                    platform="CSDN (DA 92+ 专家博客)",
                    region="国内大陆",
                    category="技术专栏与开源展台",
                    post_title=ARTICLE_TITLE,
                    target_url=f"{SITE_DOMAIN}/graph",
                    backlink_url=live_url,
                    anchor_text="禅宗知识库 (chanzong.space) · 数字人文 D3 拓扑建模实战",
                    link_type="Dofollow",
                    status="Live",
                    notes="CSDN 创作者中心千字技术架构博客，深度讲解 D3.js 物理力导向算法、Next.js 14 简繁双轨 SSG 与知识图谱建模实战"
                )
                print(f"✅ 外链台账已成功入库: {rec_id}")
                return live_url
            else:
                print("未直接抓取到文章，查看管理页截图")
        ctx.close()

if __name__ == "__main__":
    run()
