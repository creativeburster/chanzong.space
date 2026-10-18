# -*- coding: utf-8 -*-
import os
import sys
import json
import time
import urllib.parse
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = []
for k, v in cookie_dict.items():
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".weibo.cn", "path": "/"})
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"})

def find_and_comment_fifth():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={"width": 414, "height": 896},
            locale="zh-CN"
        )
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        # 搜索金刚经的最新讨论
        q = urllib.parse.quote("金刚经 若见诸相非相")
        search_url = f"https://m.weibo.cn/search?containerid=100103type%3D1%26q%3D{q}"
        page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        
        # 提取博文列表中的链接与作者
        post_links = page.evaluate("""() => {
            const cards = Array.from(document.querySelectorAll('.card'));
            const results = [];
            for (const c of cards) {
                const a = c.querySelector('a[href*="/status/"], a[href*="/detail/"]');
                const user = c.querySelector('header h3, .user-txt, .name');
                if (a && user) {
                    results.push({
                        url: a.href,
                        author: user.innerText.trim()
                    });
                }
            }
            return results;
        }""")
        print(f"找到 {len(post_links)} 个候选博文：")
        
        target_comment = "若见诸相非相，即见如来。不被境风所动，做而不住，这正是大乘般若的利落处。我们在做非营利开源的《禅宗知识库》(chanzong.space)文献图谱时，也常以此句为参修指归，随喜赞叹！"
        
        success_post = None
        for item in post_links:
            print(f"尝试向博主【{item['author']}】发布评论: {item['url']}...")
            page.goto(item["url"], wait_until="domcontentloaded", timeout=30000)
            time.sleep(2.5)
            
            input_trigger = page.locator('text="发表评论"').first
            if not input_trigger.is_visible():
                page.evaluate("window.scrollBy(0, 400)")
                time.sleep(1)
                input_trigger = page.locator('text="发表评论"').first
                
            if not input_trigger.is_visible():
                print("  ❌ 未找到发表评论入口，跳过。")
                continue
                
            input_trigger.click()
            time.sleep(1.5)
            
            ta = page.locator('textarea[placeholder*="写评论"]').first
            if not ta.is_visible():
                print("  ❌ 未弹出输入框，跳过。")
                continue
                
            ta.fill(target_comment)
            time.sleep(0.5)
            
            send_btn = page.locator('text="发送"').first
            send_btn.click()
            time.sleep(3)
            
            # 检查拦截弹窗
            alert_modal = page.locator('.m-dialog-box, .m-dialog, .weui-dialog, div:has-text("由于对方的设置")').first
            if alert_modal.is_visible():
                print("  ⚠️ 博主设置了评论权限门槛，尝试下一篇...")
                ok_btn = page.locator('text="确定"').first
                if ok_btn.is_visible():
                    ok_btn.click()
                time.sleep(1)
                continue
                
            print(f"🎉 成功在博主【{item['author']}】的博文下完成第 5 篇互动评论！")
            page.screenshot(path="tools/backlinks/comment_success_fifth.png")
            success_post = item
            break
            
        browser.close()
        return success_post

if __name__ == "__main__":
    res = find_and_comment_fifth()
    print("Result:", res)
