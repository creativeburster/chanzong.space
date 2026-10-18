# -*- coding: utf-8 -*-
import os, time
from playwright.sync_api import sync_playwright

profile_dir = "tools/backlinks/.browser_profile"

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel="msedge",
        headless=True,
        args=["--disable-blink-features=AutomationControlled"]
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    print("访问个人主页: https://weibo.com/u/6196660530")
    page.goto("https://weibo.com/u/6196660530", wait_until="domcontentloaded", timeout=35000)
    time.sleep(4)
    page.screenshot(path="tools/backlinks/weibo_my_profile_probe.png")
    
    title = page.title()
    print("Weibo Profile Title:", title)
    
    # 查找页面上的发博框或微博列表
    info = page.evaluate("""() => {
        const posts = Array.from(document.querySelectorAll('.detail_wbtext_4CRf9, .wbpro-feed-content'));
        const name = document.querySelector('.ProfileHeader_name_1W6eG, .username, h1');
        return {
            title: document.title,
            name: name ? name.innerText : null,
            postsCount: posts.length
        };
    }""")
    print("Profile Info:", info)
    ctx.close()
