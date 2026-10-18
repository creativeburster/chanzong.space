# -*- coding: utf-8 -*-
"""
ShowDoc (showdoc.com.cn - 全新根域名) 自动创建禅宗知识库公开专栏
"""
import os
import sys
import time
import json
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

def run():
    print("="*60)
    print("🚀 启动 ShowDoc (showdoc.com.cn) 注册与公开知识库创建流程...")
    print("="*60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('https://www.showdoc.com.cn/user/register')
        page.wait_for_timeout(2000)
        
        # 截图保存当前注册页
        page.screenshot(path='scratch/showdoc_current_reg.png')
        
        # 获取验证码图片
        img = page.locator('img[src*="Captcha"], img[src*="captcha"]').first
        if img.count() > 0:
            img.screenshot(path='scratch/showdoc_live_captcha.png')
            print("当前实时验证码截图已保存: scratch/showdoc_live_captcha.png")
            
        browser.close()

if __name__ == '__main__':
    run()
