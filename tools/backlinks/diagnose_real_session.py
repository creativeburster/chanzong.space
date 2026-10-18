# -*- coding: utf-8 -*-
import os, time, json
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
    
    # 1. 直接用持久化 profile 访问微博
    print(">>> 正在用持久化 Profile 访问微博...")
    page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    wb_title = page.title()
    wb_url = page.url
    page.screenshot(path="tools/backlinks/real_weibo_check.png")
    
    # 检查微博页面上的个人信息
    wb_user = page.evaluate("""() => {
        const nameEl = document.querySelector('.gn_name, .woo-box-item-flex, a[href*="/u/"], .username');
        const loginBtn = document.querySelector('a:has-text("登录"), button:has-text("登录")');
        return {
            title: document.title,
            url: window.location.href,
            name: nameEl ? nameEl.innerText : null,
            hasLogin: !!loginBtn
        };
    }""")
    print("Weibo Persistent Profile Check:", wb_user)
    
    # 2. 检查 B站
    print(">>> 正在用持久化 Profile 访问 B站...")
    page.goto("https://www.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    page.screenshot(path="tools/backlinks/real_bili_check.png")
    
    bili_user = page.evaluate("""() => {
        const avatar = document.querySelector('.header-avatar-wrap, .v-popover-wrap .mini-avatar--small, .header-entry-avatar, img.header-avatar__img, .bili-avatar');
        const loginBtn = Array.from(document.querySelectorAll('a, button, span')).find(el => el.innerText && el.innerText.trim() === '登录');
        return {
            title: document.title,
            url: window.location.href,
            hasAvatar: !!avatar,
            hasLogin: !!loginBtn
        };
    }""")
    print("Bilibili Persistent Profile Check:", bili_user)
    
    ctx.close()
