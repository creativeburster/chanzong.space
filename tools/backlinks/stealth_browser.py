# -*- coding: utf-8 -*-
"""
chanzong.space 工业级全真浏览器指纹伪装底座 (Full Stealth Browser Framework)
将无头浏览器 100% 伪装为真实的日常桌面有头浏览器，彻底穿透反爬与行为指纹识别。
"""
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

REAL_DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

# 全套底层反指纹识别注入脚本（模拟真实人类桌面运行环境）
STEALTH_INIT_SCRIPT = """
(() => {
    // 1. 彻底清除 webdriver 特征
    delete Object.getPrototypeOf(navigator).webdriver;
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
        configurable: true
    });

    // 2. 补全 window.chrome 运行对象
    if (!window.chrome) {
        window.chrome = {};
    }
    window.chrome.app = {
        isInstalled: false,
        InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
        RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' }
    };
    window.chrome.csi = function() {};
    window.chrome.loadTimes = function() {
        return {
            commitLoadTime: Date.now() / 1000 - 0.5,
            connectionInfo: 'h2',
            finishDocumentLoadTime: Date.now() / 1000 - 0.2,
            finishLoadTime: Date.now() / 1000,
            firstPaintAfterLoadsTime: 0,
            firstPaintTime: Date.now() / 1000 - 0.4,
            navigationType: 'Other',
            npnNegotiatedProtocol: 'h2',
            requestTime: Date.now() / 1000 - 1.0,
            startLoadTime: Date.now() / 1000 - 0.9,
            wasAlternateProtocolAvailable: false,
            wasFetchedViaSpdy: true,
            wasNpnNegotiated: true
        };
    };
    window.chrome.runtime = {
        OnInstalledReason: { CHROME_UPDATE: 'chrome_update', INSTALL: 'install', SHARED_MODULE_UPDATE: 'shared_module_update', UPDATE: 'update' },
        PlatformArch: { ARM: 'arm', ARM64: 'arm64', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformNaclArch: { ARM: 'arm', MIPS: 'mips', MIPS64: 'mips64', X86_32: 'x86-32', X86_64: 'x86-64' },
        PlatformOs: { ANDROID: 'android', CROS: 'cros', LINUX: 'linux', MAC: 'mac', OPENBSD: 'openbsd', WIN: 'win' },
        RequestUpdateCheckStatus: { NO_UPDATE: 'no_update', THROTTLED: 'throttled', UPDATE_AVAILABLE: 'update_available' }
    };

    // 3. 模拟真实的 navigator.plugins 与 mimeTypes
    const fakePlugins = [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
    ];
    Object.defineProperty(navigator, 'plugins', {
        get: () => fakePlugins,
        configurable: true
    });
    Object.defineProperty(navigator, 'mimeTypes', {
        get: () => [
            { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: fakePlugins[0] },
            { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: fakePlugins[0] }
        ],
        configurable: true
    });

    // 4. 模拟真实的语言、硬件核心数与内存
    Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en'],
        configurable: true
    });
    Object.defineProperty(navigator, 'language', {
        get: () => 'zh-CN',
        configurable: true
    });
    Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => 8,
        configurable: true
    });
    Object.defineProperty(navigator, 'deviceMemory', {
        get: () => 8,
        configurable: true
    });

    // 5. 伪装 WebGL 渲染管线（彻底告别 SwiftShader / Mesa 软件无头渲染器！）
    const getParameterBackup = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
        // UNMASKED_VENDOR_WEBGL
        if (param === 37445) {
            return 'Google Inc. (NVIDIA)';
        }
        // UNMASKED_RENDERER_WEBGL
        if (param === 37446) {
            return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
        }
        return getParameterBackup.apply(this, arguments);
    };

    if (window.WebGL2RenderingContext) {
        const getParameter2Backup = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function(param) {
            if (param === 37445) {
                return 'Google Inc. (NVIDIA)';
            }
            if (param === 37446) {
                return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)';
            }
            return getParameter2Backup.apply(this, arguments);
        };
    }

    // 6. 伪装真实的窗口尺寸差（有标题栏、地址栏、书签栏的高度差）
    Object.defineProperty(window, 'outerWidth', {
        get: () => window.innerWidth,
        configurable: true
    });
    Object.defineProperty(window, 'outerHeight', {
        get: () => window.innerHeight + 85,
        configurable: true
    });

    // 7. 伪装权限查询 (Notification)
    const originalQuery = window.navigator.permissions ? window.navigator.permissions.query : null;
    if (originalQuery) {
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission, onchange: null }) :
                originalQuery(parameters)
        );
    }
})();
"""

STEALTH_CHROME_ARGS = [
    "--disable-blink-features=AutomationControlled",
    "--disable-features=IsolateOrigins,site-per-process",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-infobars",
    "--window-size=1920,1080",
    "--start-maximized",
    "--disable-dev-shm-usage",
    "--no-default-browser-check",
    "--no-first-run"
]

def create_stealth_context(p, user_data_dir=None, headless=True):
    """
    创建具备全真人类伪装的浏览器上下文
    """
    if user_data_dir:
        os.makedirs(user_data_dir, exist_ok=True)
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            channel="msedge",
            headless=headless,
            user_agent=REAL_DESKTOP_UA,
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
            locale="zh-CN",
            timezone_id="Asia/Shanghai",
            args=STEALTH_CHROME_ARGS
        )
    else:
        browser = p.chromium.launch(
            channel="msedge",
            headless=headless,
            args=STEALTH_CHROME_ARGS
        )
        ctx = browser.new_context(
            user_agent=REAL_DESKTOP_UA,
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
            locale="zh-CN",
            timezone_id="Asia/Shanghai"
        )
        
    # 注入全套伪装脚本，确保所有新加载的页面与 iframe 均受保护
    ctx.add_init_script(STEALTH_INIT_SCRIPT)
    return ctx
