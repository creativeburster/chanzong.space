# -*- coding: utf-8 -*-
"""
验证全新 stealth_browser 指纹全真伪装底座的各项核心特征
"""
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

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context

def test_stealth():
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        page = ctx.new_page()
        
        # 页面内执行各项指纹检查
        page.goto("https://www.douban.com", timeout=30000)
        time.sleep(2)
        
        report = page.evaluate("""() => {
            const gl = document.createElement('canvas').getContext('webgl');
            const debugInfo = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
            const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'N/A';
            const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'N/A';
            
            return {
                webdriver: navigator.webdriver,
                hasChrome: !!window.chrome,
                hasChromeRuntime: !!(window.chrome && window.chrome.runtime),
                pluginsCount: navigator.plugins.length,
                mimeTypesCount: navigator.mimeTypes.length,
                languages: navigator.languages,
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemory: navigator.deviceMemory,
                webglVendor: vendor,
                webglRenderer: renderer,
                windowOuterHeight: window.outerHeight,
                windowInnerHeight: window.innerHeight,
                heightDiff: window.outerHeight - window.innerHeight
            };
        }""")
        
        print("="*60)
        print("🛡️ 全真无头浏览器指纹伪装测试报告:")
        print("="*60)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        
        # 验证断言
        assert report["webdriver"] is None, "❌ webdriver 暴露！"
        assert report["hasChrome"] is True, "❌ 缺少 window.chrome！"
        assert report["pluginsCount"] > 0, "❌ plugins 列表为空！"
        assert "SwiftShader" not in report["webglRenderer"], "❌ 暴露无头软解渲染器！"
        assert report["heightDiff"] > 0, "❌ 缺少真实窗口边框差值！"
        
        print("\n🎉 全部关键防反爬指纹 100% 完美通过！已无缝伪装为真实人类桌面浏览器！")
        ctx.close()

if __name__ == "__main__":
    test_stealth()
