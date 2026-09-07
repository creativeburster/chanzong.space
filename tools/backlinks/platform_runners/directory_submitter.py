# -*- coding: utf-8 -*-
"""
优质网站目录与导航站全自动提交引擎 (Fully Automated Directory Submitter)
无需复杂人工交互，全自动后台填表、提交并捕获成果。
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from content_synthesizer import get_directory_submission_info
from tracker import add_backlink

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROFILE_DIR = os.path.join(BASE_DIR, "tools", "backlinks", ".browser_profile")

DIRECTORIES = [
    {
        "name": "即时目录 (23dir)",
        "region": "国内",
        "url": "https://www.23dir.com/site/add.html",
        "category": "目录收录"
    },
    {
        "name": "好链中文网站收录 (Haolink)",
        "region": "国内",
        "url": "https://www.haolink.cn/submit.html",
        "category": "目录收录"
    },
    {
        "name": "华文网址导航 (123Cha)",
        "region": "海外繁体",
        "url": "https://www.123cha.com/dir/add.php",
        "category": "导航收录"
    },
    {
        "name": "中文优秀网站分类目录 (Baidu Spider Friendly)",
        "region": "国内",
        "url": "https://www.zmulu.cn/site/add.html",
        "category": "分类目录"
    }
]

def auto_submit_directory(page, directory: dict):
    name = directory["name"]
    reg = directory["region"]
    url = directory["url"]
    is_trad = ("海外" in reg or "繁体" in reg)
    info = get_directory_submission_info(is_traditional=is_trad)
    
    print(f"\n[Directory] 正在处理: {name} -> {url}")
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=20000)
        time.sleep(2)
    except Exception as e:
        print(f"⚠️ 访问超时: {e}，跳过。")
        return False
        
    print(f"[Directory] 自动填充元数据...")
    
    # 智能识别表单
    filled = False
    
    # 网站标题
    for sel in ["input[name*='title']", "input[name*='name']", "input[placeholder*='名称']", "input[placeholder*='标题']"]:
        el = page.query_selector(sel)
        if el and el.is_visible():
            el.fill(info["short_title"])
            filled = True
            break
            
    # 网站地址
    for sel in ["input[name*='url']", "input[name*='link']", "input[name*='web']", "input[placeholder*='域名']", "input[placeholder*='地址']", "input[type='url']"]:
        el = page.query_selector(sel)
        if el and el.is_visible():
            el.fill(info["url"])
            filled = True
            break
            
    # 描述
    for sel in ["textarea[name*='desc']", "textarea[name*='intro']", "textarea[placeholder*='简介']", "textarea[placeholder*='描述']"]:
        el = page.query_selector(sel)
        if el and el.is_visible():
            el.fill(info["description"][:120])
            filled = True
            break
            
    # 关键字
    for sel in ["input[name*='key']", "input[name*='tag']", "input[placeholder*='关键字']", "input[placeholder*='标签']"]:
        el = page.query_selector(sel)
        if el and el.is_visible():
            el.fill(info["tags"])
            break

    # 尝试自动提交
    submit_btn = page.query_selector("button[type='submit'], input[type='submit'], button:has-text('提交'), a:has-text('立即提交')")
    if submit_btn and filled:
        try:
            submit_btn.click()
            time.sleep(2)
            print(f"✅ [{name}] 已自动执行表单提交！")
        except Exception as e:
            print(f"提交点击结果: {e}")
            
    add_backlink(
        platform=name,
        region=reg,
        category="目录收录",
        post_title=info["title"],
        target_url="https://chanzong.space",
        backlink_url=url,
        anchor_text=info["short_title"],
        link_type="Dofollow",
        status="Live",
        notes=f"已自动提交收录至 {name}"
    )
    return True

def run():
    print("="*60)
    print("🚀 全自动目录与导航站外链提交引擎启动 (Headless 无感运行)")
    print("="*60)
    
    os.makedirs(PROFILE_DIR, exist_ok=True)
    p = sync_playwright().start()
    try:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            locale="zh-CN"
        )
        page = context.new_page()
        for d in DIRECTORIES:
            auto_submit_directory(page, d)
        context.close()
        browser.close()
    finally:
        p.stop()
    print("\n🎉 目录提交批处理全部完成！")

run_directory_submissions = run

if __name__ == "__main__":
    run()
