# -*- coding: utf-8 -*-
"""
chanzong.space 外链自动化浏览器驱动
基于 Playwright + Microsoft Edge 原生浏览器，支持持久化用户上下文、真实指纹与人工介入登录接管。
"""
import os
import sys
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import sync_playwright, BrowserContext, Page

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROFILE_DIR = os.path.join(BASE_DIR, "tools", "backlinks", ".browser_profile")
SIGNAL_FILE = os.path.join(BASE_DIR, "tools", "backlinks", "resume.signal")

def get_browser_context(headless: bool = False) -> tuple:
    """
    启动并返回 (playwright, context, page)
    使用持久化存储目录，登录状态（Cookies、LocalStorage）将长期自动保存
    """
    os.makedirs(PROFILE_DIR, exist_ok=True)
    p = sync_playwright().start()
    
    args = [
        "--disable-blink-features=AutomationControlled",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-infobars",
    ]
    
    context = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        headless=headless,
        args=args,
        viewport={"width": 1280, "height": 800},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN",
        timezone_id="Asia/Shanghai"
    )
    
    # 隐藏 navigator.webdriver 标识
    context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
    """)
    
    page = context.pages[0] if context.pages else context.new_page()
    return p, context, page

def wait_for_human(page: Page, prompt_msg: str, check_selector: str = None, timeout_secs: int = 300) -> bool:
    """
    人机协同关键检查点：
    当需要人工登录、输入验证码或扫码时，保持浏览器在前台，并提示用户。
    用户在浏览器操作完毕后：
    1. 若提供了 check_selector，检测到该元素出现即自动继续；
    2. 或者检测到同目录下的 resume.signal 文件；
    3. 或者终端输入回车继续。
    """
    # 清除旧信号
    if os.path.exists(SIGNAL_FILE):
        os.remove(SIGNAL_FILE)
        
    print("\n" + "="*65)
    print("📢 【需要人工协助】")
    print(f"👉 原因/提示: {prompt_msg}")
    print("👉 请直接在已弹出的浏览器窗口中完成操作（登录 / 扫码 / 滑块验证码）。")
    print(f"👉 完成后：在终端按 [回车键 Enter] 继续，或等待脚本自动检测通过。")
    print("="*65 + "\n")
    
    # 播放蜂鸣声提醒用户
    try:
        import winsound
        winsound.Beep(1000, 400)
    except Exception:
        pass
        
    start_time = time.time()
    while time.time() - start_time < timeout_secs:
        # 1. 检查目标选择器（如登录成功后出现的头像或登出按钮）
        if check_selector:
            try:
                if page.is_visible(check_selector, timeout=1000):
                    print(f"✅ 检测到目标元素 [{check_selector}]，用户已成功完成操作！")
                    return True
            except Exception:
                pass
                
        # 2. 检查信号文件
        if os.path.exists(SIGNAL_FILE):
            print("✅ 收到恢复信号文件，继续执行！")
            try:
                os.remove(SIGNAL_FILE)
            except Exception:
                pass
            return True
            
        time.sleep(2)
        
    print("⚠️ 等待超时（5分钟），未检测到人工完成信号。")
    return False

if __name__ == "__main__":
    print("测试启动原生 Edge 浏览器环境...")
    p, ctx, page = get_browser_context(headless=False)
    page.goto("https://chanzong.space")
    print(f"打开测试页面成功: {page.title()}")
    time.sleep(3)
    ctx.close()
    p.stop()
    print("测试完成。")
