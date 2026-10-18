# -*- coding: utf-8 -*-
"""
小红书 (Xiaohongshu) 实时扫码授权并自动发布笔记
"""
import os
import sys
import json
import time
import glob
from PIL import Image
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "xhs_cookie.json")
ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"
QRCODE_PATH = os.path.join(ARTIFACT_DIR, "xhs_qrcode.png")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)

cookies = []
for k, v in cookie_dict.items():
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"})
    cookies.append({"name": k, "value": v.strip('"'), "domain": "creator.xiaohongshu.com", "path": "/"})

with sync_playwright() as p:
    # 启动普通窗口，用户可以在屏幕上看到
    browser = p.chromium.launch(
        channel="msedge",
        headless=False,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    ctx.add_cookies(cookies)
    page = ctx.new_page()

    print("[1/5] 打开小红书创作者发布页...")
    page.goto("https://creator.xiaohongshu.com/publish/publish", wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)

    print("[2/5] 切换至【上传图文】Tab...")
    page.evaluate("""() => {
        const tabs = Array.from(document.querySelectorAll('.creator-tab'));
        for (const t of tabs) {
            if (t.innerText.includes('上传图文')) {
                t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                break;
            }
        }
    }""")
    time.sleep(2)

    cards = glob.glob(os.path.join(CUR_DIR, "xhs_cards", "*.png"))
    card_path = os.path.abspath(cards[0])
    print(f"[3/5] 上传配图: {card_path}...")
    file_input = page.query_selector("input.upload-input, input[type='file']")
    if not file_input:
        print("❌ 未找到上传 input")
        browser.close()
        sys.exit(1)
    file_input.set_input_files(card_path)
    time.sleep(6)

    print("[4/5] 填写标题与正文...")
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(1)

    title_input = page.query_selector('input[placeholder*="填写标题"], input.d-text')
    if title_input:
        title_input.click()
        title_input.fill("读懂六祖坛经，瞬间放下内耗")
    time.sleep(0.5)

    desc_area = page.query_selector('div[contenteditable="true"], .tiptap.ProseMirror')
    if desc_area:
        desc_area.click()
        body = """“菩提本无树，明镜亦非台。
本来无一物，何处惹尘埃。”

很多时候，我们活得焦虑疲惫，不是因为遇到的事情有多难，而是我们的心一直在向外攀缘。
总想证明自己，总怕别人评价，总执着于那些随时会消失的虚名浮利。

六祖惠能大师告诉我们：
自性本自清净，本不生灭，本自具足。

遇到心烦意乱的时候，静下来问问自己：
本来无一物，那些烦恼究竟安立在何处？
把心收回来，当下便是晴天。

📖 典籍全文导读与禅门传承图谱已收录于：禅宗知识库 (chanzong.space)

#禅宗 #六祖坛经 #心性修养 #治愈系 #国学经典 #每日一悟 #消除精神内耗"""
        for line in body.split("\n"):
            if not line.strip():
                page.keyboard.press("Enter")
                continue
            page.keyboard.insert_text(line.strip())
            page.keyboard.press("Enter")
            time.sleep(0.1)
    time.sleep(1)
    page.keyboard.press("Escape")
    time.sleep(1)

    print("[5/5] 点击发布按钮触发二维码验证...")
    page.mouse.click(749, 854)
    time.sleep(3)

    # 截取全屏并裁切二维码
    full_screenshot = os.path.join(CUR_DIR, "current_screen_qr.png")
    page.screenshot(path=full_screenshot)
    print("已截图，正在裁剪二维码...")

    try:
        im = Image.open(full_screenshot)
        # 二维码在 1440x900 居中位置大约在 (580, 420) 到 (860, 700) 附近
        # 截取中央弹窗区域：宽 420，高 480，中心在 (720, 480)
        crop_box = (500, 200, 940, 760)
        cropped = im.crop(crop_box)
        cropped.save(QRCODE_PATH)
        print(f"✅ 二维码已提取并保存至: {QRCODE_PATH}")
    except Exception as e:
        print("裁剪出错:", e)

    print("="*60)
    print("⏳ 等待用户扫码确认 (最多等待 90 秒)...")
    print("="*60)

    # 循环检测弹窗是否消失或 URL 是否跳转
    success = False
    for sec in range(90):
        time.sleep(1)
        cur_url = page.url
        # 检测是否跳转到管理页或成功页
        if "publish/success" in cur_url or "new/note-manager" in cur_url:
            success = True
            print(f"🎉 扫码成功！页面已跳转至: {cur_url}")
            break
        
        # 检查弹窗是否已经关闭
        dialog_exists = page.evaluate("""() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('扫码验证'));
            return !!el;
        }""")
        if not dialog_exists and sec > 5:
            # 弹窗消失，再等 2 秒看是否跳转
            time.sleep(2)
            cur_url = page.url
            print(f"🎉 扫码验证已通过，弹窗已关闭！当前 URL: {cur_url}")
            success = True
            break

    # 保存最新全量 cookies
    all_cookies = ctx.cookies()
    cookie_map = {}
    for c in all_cookies:
        cookie_map[c['name']] = c['value']
    with open(COOKIE_PATH, "w", encoding="utf-8") as f:
        json.dump(cookie_map, f, ensure_ascii=False, indent=2)
    print(f"✅ 已持久化保存最新 {len(cookie_map)} 个全量授权 Cookie 到 {COOKIE_PATH}！")

    # 最终截图
    final_path = os.path.join(CUR_DIR, "final_publish_status.png")
    page.screenshot(path=final_path)
    print(f"最终状态截图保存至: {final_path}")

    browser.close()
