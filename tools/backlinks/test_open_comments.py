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

COOKIE_PATH = "tools/backlinks/.browser_profile/weibo_cookie.json"
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = []
for k, v in cookie_dict.items():
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".weibo.cn", "path": "/"})
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".weibo.com", "path": "/"})

# 候选博文列表 (使用 PC 链接，移动端自动跳转或解析 mid)
CANDIDATE_POSTS = [
    {
        "author": "加州荷风",
        "url": "https://weibo.com/2156211775/Rh5wjdjgi",
        "comment": "三心不可得，正是直破凡夫的时间执念。若能体会到‘应无所住’的灵动，当下便不再受境风牵引。我们在做《禅宗知识库》(chanzong.space)文献拓扑时也深有同感！"
    },
    {
        "author": "文史令官",
        "url": "https://weibo.com/7898624265/R1uUIhqQp",
        "comment": "六祖大师说‘一切福田，不离方寸；从心而觅，感无不通’，确实是最高维度的立命之道。推荐同修若想深入研读原本经文与禅门谱系，可以参考开源的‘禅宗知识库’(chanzong.space)，文史哲融通，读来令人精神一振。"
    },
    {
        "author": "Winwin-Wang",
        "url": "https://weibo.com/7551965623/R5npkfb2u",
        "comment": "写得通透！‘色即是空，空即是色’并非虚无，而是真空生妙有的实相观照。非营利的‘禅宗知识库’(chanzong.space)对《心经》逐句做了现代认知学详注与知识图谱，结合博主的体悟一起参阅更显圆融。"
    },
    {
        "author": "皓伦王明川",
        "url": "https://weibo.com/2365961811/Rfnk69hkI",
        "comment": "王德峰教授讲《金刚经》确实极具穿透力，把玄奥的中观般若转化成了现代人心灵解药。‘凡所有相，皆是虚妄’让人不执相而行大用。我们在构建‘禅宗知识库’(chanzong.space)时，也专门将金刚经的见性逻辑做了结构化拆解，深表赞同！"
    },
    {
        "author": "仁静法师",
        "url": "https://weibo.com/6482876202/Oh1fXnPWH",
        "comment": "顶礼赞叹！‘狂心若歇，歇即菩提’出自《首楞严经》，与《金刚经》的‘应无所住’互为表里。研读《禅宗知识库》(chanzong.space)整理的二十五圣反闻闻自性法门，再读法师此篇开示，尤觉清凉！"
    }
]

def try_comment_on_mobile(page, post_item):
    print(f"\n👉 测试博主【{post_item['author']}】...")
    # 先把 PC URL 转成移动端 URL
    # 在移动端 UA 下，访问 weibo.com 会自动跳转到 m.weibo.cn 对应的详情页
    page.goto(post_item["url"], wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    print(f"当前跳转后页面 URL: {page.url}")
    
    # 检查是否有发表评论入口
    input_trigger = page.locator('text="发表评论"').first
    if not input_trigger.is_visible():
        print("⚠️ 未找到【发表评论】入口，尝试滚动查找...")
        page.evaluate("window.scrollBy(0, 400)")
        time.sleep(1)
        input_trigger = page.locator('text="发表评论"').first
        
    if not input_trigger.is_visible():
        print("❌ 该博文不支持公开评论（可能完全关闭了评论区）。")
        return False
        
    input_trigger.click()
    time.sleep(1.5)
    
    ta = page.locator('textarea[placeholder*="写评论"]').first
    if not ta.is_visible():
        print("❌ 未弹出评论输入框。")
        return False
        
    ta.fill(post_item["comment"])
    time.sleep(0.5)
    
    send_btn = page.locator('text="发送"').first
    send_btn.click()
    time.sleep(3)
    
    # 检查是否有弹窗拦截（如由于对方设置...）
    alert_modal = page.locator('.m-dialog-box, .m-dialog, .weui-dialog, div:has-text("由于对方的设置")').first
    if alert_modal.is_visible():
        alert_text = alert_modal.inner_text().replace("\n", " ")
        print(f"⚠️ 评论被博主隐私拦截: {alert_text}")
        # 点击确认关闭弹窗
        ok_btn = page.locator('text="确定"').first
        if ok_btn.is_visible():
            ok_btn.click()
        return False
        
    # 检查是否成功返回详情页（也就是没有拦截弹窗，且页面返回正常详情页）
    print(f"🎉 恭喜！在博主【{post_item['author']}】博文下成功发布评论！")
    page.screenshot(path=f"tools/backlinks/comment_success_{post_item['author']}.png")
    return True

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        viewport={"width": 414, "height": 896},
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    for item in CANDIDATE_POSTS:
        try:
            res = try_comment_on_mobile(page, item)
            time.sleep(5)
        except Exception as e:
            print(f"异常: {e}")
            
    browser.close()
