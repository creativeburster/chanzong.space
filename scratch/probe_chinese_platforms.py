# -*- coding: utf-8 -*-
"""
快速诊断当前 .browser_profile 中 6 大中文平台的登录凭证与会话状态
"""
import os
import sys
import time
from playwright.sync_api import sync_playwright

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools", "backlinks"))
from browser_driver import get_browser_context, PROFILE_DIR

def probe_all_platforms():
    print(f"[Probe] 正在启动 Edge 浏览器检测持久化 Profile: {PROFILE_DIR} ...")
    p, context, page = get_browser_context(headless=True)
    
    platforms = [
        {"name": "知乎 (Zhihu)", "url": "https://www.zhihu.com", "check_login": lambda p: "登录" not in p.title() and len(p.locator(".AppHeader-profileEntry, .AppHeader-messages, [aria-label='创作者中心']").all()) > 0 or "我的" in p.content()},
        {"name": "微博 (Weibo)", "url": "https://weibo.com", "check_login": lambda p: "login" not in p.url and ("我的" in p.content() or "首页" in p.content()) and len(p.locator("[node-type='account'], .gn_name, .woo-box-item-flex").all()) > 0},
        {"name": "哔哩哔哩 (Bilibili)", "url": "https://www.bilibili.com", "check_login": lambda p: len(p.locator(".header-avatar-wrap, .v-popover-wrap, .mini-avatar").all()) > 0 or "大会员" in p.content()},
        {"name": "豆瓣 (Douban)", "url": "https://www.douban.com/mine/", "check_login": lambda p: "accounts.douban.com" not in p.url and ("我的主页" in p.content() or "的帐号" in p.content() or "写日记" in p.content())},
        {"name": "掘金 (Juejin)", "url": "https://juejin.cn", "check_login": lambda p: len(p.locator(".avatar-wrapper, .user-dropdown-nav, .user-avatar").all()) > 0 or "创作者中心" in p.content()},
        {"name": "CSDN", "url": "https://blog.csdn.net", "check_login": lambda p: "登录" not in p.content() and len(p.locator(".userinfo, .avatar-box, .hasAvatar").all()) > 0}
    ]
    
    status_summary = {}
    for item in platforms:
        name = item["name"]
        url = item["url"]
        print(f"正在探测: {name} ({url}) ...")
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
            time.sleep(3)
            current_url = page.url
            title = page.title()
            
            # 针对不同平台精细判断
            is_logged_in = False
            if "zhihu" in url:
                # 检查知乎是否有用户头像或特定元素
                page.goto("https://www.zhihu.com/creator", wait_until="domcontentloaded", timeout=10000)
                time.sleep(2)
                is_logged_in = "signin" not in page.url and ("创作" in page.content() or "内容管理" in page.content() or "创作者中心" in page.title())
            elif "weibo" in url:
                page.goto("https://weibo.com", wait_until="domcontentloaded", timeout=10000)
                time.sleep(2)
                is_logged_in = "login" not in page.url and ("发微博" in page.content() or "我的主页" in page.content() or "首页" in page.content())
            elif "bilibili" in url:
                page.goto("https://member.bilibili.com/platform/home", wait_until="domcontentloaded", timeout=10000)
                time.sleep(2)
                is_logged_in = "passport" not in page.url and ("创作服务平台" in page.title() or "稿件管理" in page.content() or "数据中心" in page.content())
            elif "douban" in url:
                page.goto("https://www.douban.com/mine/", wait_until="domcontentloaded", timeout=10000)
                time.sleep(2)
                is_logged_in = "accounts.douban.com" not in page.url and ("日记" in page.content() or "相册" in page.content() or "豆列" in page.content())
            elif "juejin" in url:
                page.goto("https://juejin.cn/creator/content/column", wait_until="domcontentloaded", timeout=10000)
                time.sleep(2)
                is_logged_in = "login" not in page.url and ("创作者中心" in page.content() or "专栏" in page.content())
            elif "csdn" in url:
                page.goto("https://mp.csdn.net/mp_blog/manage/article", wait_until="domcontentloaded", timeout=10000)
                time.sleep(2)
                is_logged_in = "passport.csdn.net" not in page.url and ("内容管理" in page.content() or "文章管理" in page.content())
                
            status_summary[name] = {
                "logged_in": is_logged_in,
                "current_url": page.url,
                "title": page.title()
            }
            status_tag = "✅ 已登录 (Session 有效)" if is_logged_in else "⚠️ 未登录/需刷新 Cookie"
            print(f"[{name}] -> {status_tag} (URL: {page.url})")
        except Exception as e:
            status_summary[name] = {"logged_in": False, "error": str(e)}
            print(f"[{name}] -> ❌ 探测失败: {e}")
            
    context.close()
    p.stop()
    return status_summary

if __name__ == "__main__":
    probe_all_platforms()
