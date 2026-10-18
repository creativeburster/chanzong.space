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

with open("scratch/publish_csdn_dh.py", "r", encoding="utf-8") as f:
    code = f.read()
    start_idx = code.find("ARTICLE_CONTENT = \"\"\"") + len("ARTICLE_CONTENT = \"\"\"")
    end_idx = code.find("\"\"\"", start_idx)
    ARTICLE_CONTENT = code[start_idx:end_idx]

def run():
    print("="*60)
    print("🚀 启动 CSDN 创作者中心精准发布...")
    print("="*60)
    
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        # 打开编辑器
        page.goto("https://mp.csdn.net/mp_blog/creation/editor", timeout=35000)
        time.sleep(3)
        
        # 1. 切换到 MD 编辑器（右上角）
        switch_md = page.query_selector("button:has-text('使用 MD 编辑器'), span:has-text('使用 MD 编辑器'), div:has-text('使用 MD 编辑器')")
        if switch_md:
            print("点击【使用 MD 编辑器】...")
            switch_md.click()
            time.sleep(3)
            # 处理弹窗确认切换
            confirm_switch = page.query_selector("button:has-text('确定'), button:has-text('确认')")
            if confirm_switch:
                confirm_switch.click()
                time.sleep(2)
                
        # 2. 填写标题
        title_inp = page.query_selector("input.article-bar__title, input[placeholder*='文章标题'], #txtTitle, input[type='text']")
        if title_inp:
            title_inp.click()
            title_inp.fill(ARTICLE_TITLE)
            print("✅ 标题填入成功:", ARTICLE_TITLE)
            time.sleep(1)
            
        # 3. 填写正文
        md_editor = page.query_selector(".cledit-section, textarea, .markdown-body, [contenteditable='true']")
        if md_editor:
            md_editor.click()
            page.keyboard.insert_text(ARTICLE_CONTENT)
            print("✅ 正文内容注入完成！")
            time.sleep(3)
            
        # 4. 点击右下角红色【发布博客】按钮
        pub_btn = page.query_selector("button:has-text('发布博客'), button.btn-publish, button.btn-outline-danger")
        if pub_btn:
            print("点击【发布博客】按钮...")
            pub_btn.click()
            time.sleep(3)
            page.screenshot(path="scratch/csdn_pub_modal.png")
            
            # 如果弹出了发布弹窗（选择分类或标签）
            # 点击弹窗里的最终【发布博客】
            modal_pub = page.query_selector(".modal button:has-text('发布博客'), div[class*='dialog'] button:has-text('发布博客'), button.modal__button-publish, .btn-b-red")
            if modal_pub:
                print("点击弹窗内最终【发布博客】...")
                modal_pub.click()
                time.sleep(5)
                page.screenshot(path="scratch/csdn_after_modal_pub.png")
            else:
                print("未发现独立弹窗，可能已直接发布！等待 5 秒...")
                time.sleep(5)
                
        # 5. 访问文章管理页抓取最新链接
        page.goto("https://mp.csdn.net/mp_blog/manage/article", timeout=25000)
        time.sleep(3)
        page.screenshot(path="scratch/csdn_manage_after.png")
        
        # 提取第一篇文章
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
            print("未能抓取到文章，请查看 scratch/csdn_manage_after.png")

if __name__ == "__main__":
    run()
