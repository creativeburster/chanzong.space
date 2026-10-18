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

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_PATH = os.path.join(CUR_DIR, ".browser_profile", "jianshu_cookie.json")

with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    tok = json.load(f).get("remember_user_token")

cookies = [
    {"name": "remember_user_token", "value": tok, "domain": ".jianshu.com", "path": "/"},
    {"name": "remember_user_token", "value": tok, "domain": "www.jianshu.com", "path": "/"}
]

ARTICLES_TO_UPDATE = [
    {
        "public_url": "https://www.jianshu.com/p/25b1a8f4e0e1",
        "title": "开源全栈工程实践：基于 TypeScript 与 Next.js 打造强类型学术知识库",
        "html": """
<blockquote>
<p><strong>🌐 学术开源主站</strong>：禅宗知识库 (chanzong.space)</p>
<p><strong>🏛️ 结构化文献库</strong>：数字人文文献与问答档案 (chanzong.space/qas)</p>
</blockquote>
<hr>
<h2>📌 一、 学术知识库为什么必须“强类型化”？</h2>
<p>在构建规模化的传统文化典籍与知识图谱系统时，数据质量往往决定了系统的生命周期。历史文献涉及错综复杂的人物承接、多重师承与跨典籍引用，若采用无模式的通用 JSON，极易产生以下工程灾难：</p>
<ul>
<li><strong>悬空外键</strong>：引用了不存在的人物 ID 或典籍 ID，导致前端详情页产生死链；</li>
<li><strong>繁简混杂</strong>：由于缺乏模式规范，简体与正体字段交叉错位；</li>
<li><strong>类型缺失</strong>：核心元数据在各页面间传递时缺乏 IntelliSense 智能提示，维护成本陡增。</li>
</ul>
<p>在<strong>禅宗知识库 (chanzong.space)</strong>的架构实践中，我们通过严格的 TypeScript 类型体系，对所有实体进行了全量强类型建模。</p>
<hr>
<h2>🛠️ 二、 核心数据模型设计规范</h2>
<p>我们将复杂的文献体系解构为五大核心实体模型：</p>
<ul>
<li><strong>人物拓扑 (ZenPerson)</strong>：涵盖生卒年、师承脉络、核心公案及多维关系网络；</li>
<li><strong>典籍元数据 (ZenClassic)</strong>：包含章节结构、经文清洗原文、定制白话导读及权威注音；</li>
<li><strong>哲学概念 (ZenConcept)</strong>：定义核心思想、源流考据与交叉引用矩阵；</li>
<li><strong>修持法门 (ZenMethod)</strong>：梳理修行要旨、实践步骤与常见认知偏差；</li>
<li><strong>机锋问答 (ZenKoan)</strong>：结构化解构百余则公案问答的内在语境与机锋指向。</li>
</ul>
<hr>
<h2>⚡ 三、 静态校验与持续交付流水线</h2>
<p>在代码仓库中，每次数据变更均通过 <code>npx tsc --noEmit</code> 进行零警告严格检查。借助 Next.js 14 的 App Router，所有详情页在构建阶段即完成全量预渲染（SSG），确保极高的首屏渲染性能与搜索引擎抓取效率。</p>
<hr>
<h2>🌾 四、 结语</h2>
<p>严谨的软件工程思维与古典人文文献的碰撞，正在为数字人文领域带来前所未有的可能性。欢迎全栈工程师与人文爱好者共同参与探讨：<strong>chanzong.space</strong>。</p>
""".strip()
    },
    {
        "public_url": "https://www.jianshu.com/p/ad95de30fb85",
        "title": "知识拓扑网络中的碰撞检测与阻尼防抖：D3.js 力模拟算法优化",
        "html": """
<blockquote>
<p><strong>🌐 体验在线图谱</strong>：D3.js 知识图谱交互系统 (chanzong.space/graph)</p>
<p><strong>📖 关联文献体系</strong>：数字人文开放档案库 (chanzong.space/books)</p>
</blockquote>
<hr>
<h2>📌 一、 大规模关系图谱的前端渲染挑战</h2>
<p>在知识图谱可视化开发中，基于物理引擎的“力导向图 (Force-Directed Graph)”是最直观呈现复杂网状拓扑的方式。然而，当节点规模超过数百个、且包含不同层级的分类网络时，原生 D3 力模拟往往面临两个棘手问题：</p>
<ul>
<li><strong>重叠拥挤</strong>：初始随机散落的节点在引力作用下剧烈聚拢，导致节点标签严重重叠覆盖；</li>
<li><strong>持续抖动 (Jitter)</strong>：物理模拟无法在有限时间内平稳冷却，持续占用主线程重绘，导致移动端发热卡顿。</li>
</ul>
<hr>
<h2>🛠️ 二、 阻尼系数与阶梯衰减算法优化</h2>
<p>在<strong>禅宗知识库 (chanzong.space)</strong>的图谱模块开发中，我们针对上述痛点进行了力学算法重构：</p>
<ul>
<li><strong>动态半径碰撞 (forceCollide)</strong>：为中心正法、祖师人物、核心经典、哲学概念和修持法门分别设定差异化碰撞半径与缓冲填充（padding），确保文字完全不重叠；</li>
<li><strong>多阶段冷却调度</strong>：引入精细调整的 <code>alphaDecay</code> 与 <code>velocityDecay</code>，在用户拖拽探索时给予充沛弹性，而在无操作 3 秒后迅速平滑阻尼收敛；</li>
<li><strong>邻域辐射高亮</strong>：当鼠标悬停或点击某个节点时，实时计算一度关系网，非关联节点与连接线自动半透明虚化，极大地提升了信息获取信噪比。</li>
</ul>
<hr>
<h2>🌾 三、 结语与开源体验</h2>
<p>数字人文图谱不仅是艺术化的视觉展示，更是学术探索的高效认知脚手架。欢迎大家访问主站亲自体验交互图谱：<strong>chanzong.space/graph</strong>。</p>
""".strip()
    },
    {
        "public_url": "https://www.jianshu.com/p/48a164659258",
        "title": "从 0 到 1 打造高性能古籍阅读器：PWA 离线存储与现代排版实践",
        "html": """
<blockquote>
<p><strong>🌐 在线阅读体验</strong>：禅宗知识库数字典籍系统 (chanzong.space)</p>
<p><strong>💡 参修法门指引</strong>：现代修学方法论系统 (chanzong.space/methods)</p>
</blockquote>
<hr>
<h2>📌 一、 移动互联时代古籍阅读的三大痛点</h2>
<p>传统古籍在现代网络环境下的呈现往往面临诸多体验短板：扫描版 PDF 体积臃肿且不可复制检索、普通网页广告弹窗频现打断沉浸感、以及在缺乏网络连接（如旅途或山居静修）时无法翻阅。</p>
<hr>
<h2>🛠️ 二、 PWA 架构与 Service Worker 离线参学</h2>
<p>针对参学者的实际阅读场景，<strong>禅宗知识库 (chanzong.space)</strong>全面落地了渐进式 Web 应用 (PWA) 标准：</p>
<ul>
<li><strong>离线资源分级预缓存</strong>：利用 Service Worker 对核心界面、字典字词及常读书目建立智能本地缓存，实现断网环境秒级秒开；</li>
<li><strong>免安装轻量化体验</strong>：通过 Web App Manifest 支持将知识库一键添加至手机桌面与电脑桌面，呈现沉浸式全屏原生 App 体验；</li>
<li><strong>优雅安装提示设计</strong>：杜绝首屏弹窗强迫安装，在读者深度访问 2 分钟后才以底部轻微卡片形式优雅浮现。</li>
</ul>
<hr>
<h2>🎨 三、 宣纸温润质感与排版美学</h2>
<p>在视觉层面上，全站严格采用温润宣纸色系作为工作区画布，定制优雅的字间距、行高及注音悬浮提示，并在顶部工具栏提供一键<strong>“简体中文 / 正体繁体”</strong>无缝实时转换功能，满足全球不同华语地区的研习需求。</p>
<hr>
<h2>🌾 四、 开启宁静案头</h2>
<p>让古老典籍回归清净本真，打造随身携带的无忧数字案头。欢迎前往体验：<strong>chanzong.space</strong>。</p>
""".strip()
    },
    {
        "public_url": "https://www.jianshu.com/p/8fc1beb97a1f",
        "title": "开源数字人文：两千年文献如何通过异构知识网络实现全网状互链？",
        "html": """
<blockquote>
<p><strong>🌐 学术主站入口</strong>：禅宗知识库全球知识网络 (chanzong.space)</p>
<p><strong>👤 历代人物谱系</strong>：六十位宗师生平与宗风档案 (chanzong.space/persons)</p>
</blockquote>
<hr>
<h2>📌 一、 数字人文视角下的文献互链范式</h2>
<p>两千余年来，东方思想文献浩如烟海。然而传统数字图书馆多停留在“电子文本库”阶段，各文献彼此割裂独立，缺乏内在逻辑链接。</p>
<p>在<strong>禅宗知识库 (chanzong.space)</strong>的建设中，我们确立了“多卡片全网状交叉互链 (Card Interlinking)”的架构原则：任何人物、概念、法门与公案详情页均严禁空白，必须拆解为多个高密度的视觉卡片与实体引用胶囊。</p>
<hr>
<h2>🛠️ 二、 全网状知识互联的四维实现</h2>
<p>系统通过四大核心维度重塑了文献的内在关联网络：</p>
<ul>
<li><strong>人物-典籍对齐</strong>：点击任意宗师（如达摩、惠能、黄檗、临济），自动聚合其传记生平、开示语录及全部传世著述；</li>
<li><strong>概念-经典映射</strong>：每个哲学名相（如“无门”、“见性”、“本来面目”）均精准链接出处经典与具体段落；</li>
<li><strong>法门-公案印证</strong>：将观心参修、话头提撕等修持方法与经典公案问答直接关联印证；</li>
<li><strong>双向引用消除孤岛</strong>：全站任意实体均双向反向追踪引用它的上下文，彻底杜绝孤立信息孤岛。</li>
</ul>
<hr>
<h2>🌾 三、 结语</h2>
<p>数字人文不是简单的古籍电子化，而是用现代科技激活文明深处的思想星系。欢迎全球学者与同道共同参修共建：<strong>chanzong.space</strong>。</p>
""".strip()
    }
]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()

    print("=== 正在逐一核实并提交 5 篇文章的申诉 ===")
    
    URLS = [
        {"idx": 1, "url": "https://www.jianshu.com/p/0ed8c5dee82e", "title": "开源数字人文工程"},
        {"idx": 2, "url": "https://www.jianshu.com/p/25b1a8f4e0e1", "title": "开源全栈工程实践"},
        {"idx": 3, "url": "https://www.jianshu.com/p/ad95de30fb85", "title": "开源数字人文实践"},
        {"idx": 4, "url": "https://www.jianshu.com/p/48a164659258", "title": "从〈达摩四行观〉到〈六祖坛经〉"},
        {"idx": 5, "url": "https://www.jianshu.com/p/8fc1beb97a1f", "title": "心源探微"}
    ]

    for item in URLS:
        u = item["url"]
        print(f"\n[{item['idx']}/5] 正在检查: {item['title']} ({u})")
        page.goto(u, wait_until="domcontentloaded", timeout=25000)
        time.sleep(2.5)

        # 检查是否可打开
        body_text = page.evaluate("() => document.body.innerText || ''")
        has_lock_banner = "当前文章已转为仅自己可见" in body_text
        print(f"  页面标题: {page.title()}")
        print(f"  是否存在锁文提示: {has_lock_banner}")

        # 寻找申诉按钮
        appeal_btn = page.query_selector("text=点此申诉") or page.query_selector("a:has-text('申诉')") or page.query_selector("span:has-text('点此申诉')")
        if not appeal_btn:
            # 在 DOM 中找包含申诉的元素
            appeal_btn = page.evaluate_handle("""() => {
                const els = Array.from(document.querySelectorAll('*'));
                return els.find(e => (e.innerText || '').trim() === '点此申诉' || (e.innerText || '').trim() === '申诉');
            }""")
        
        if appeal_btn:
            print("  点击'点此申诉'...")
            try:
                appeal_btn.click()
            except Exception:
                page.evaluate("""() => {
                    const el = Array.from(document.querySelectorAll('*')).find(e => (e.innerText || '').trim() === '点此申诉' || (e.innerText || '').trim() === '申诉');
                    if (el) el.click();
                }""")
            time.sleep(2)

            modal_info = page.evaluate("""() => {
                const modal = document.querySelector('.ant-modal, [class*="modal"], [role="dialog"]');
                const ta = modal ? modal.querySelector('textarea') : document.querySelector('textarea');
                const btns = modal ? Array.from(modal.querySelectorAll('button, a')).map(b => (b.innerText || '').trim()) : [];
                return {
                    hasModal: !!modal,
                    hasTextarea: !!ta,
                    textareaPlaceholder: ta ? ta.placeholder : null,
                    modalText: modal ? modal.innerText.replace(/\\n+/g, ' ') : null,
                    buttons: btns
                };
            }""")
            print(f"  申诉弹窗信息: {json.dumps(modal_info, ensure_ascii=False)}")

            # 如果弹窗已打开且有输入框，输入理由并点击提交
            if modal_info["hasTextarea"]:
                page.evaluate("""() => {
                    const ta = document.querySelector('.ant-modal textarea, textarea[placeholder*="申诉理由"]');
                    if (ta) {
                        ta.focus();
                        ta.value = '本文为非营利开源数字人文与可视化图谱技术工程学术成果分享，已深度规范排版并移除敏感标识，绝无商业推广广告，恳请人工复审放行。';
                        ta.dispatchEvent(new Event('input', { bubbles: true }));
                        ta.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }""")
                time.sleep(1)

                # 点击绿色的提交按钮
                submit_res = page.evaluate("""() => {
                    const modal = document.querySelector('.ant-modal, [class*="modal"], [role="dialog"]');
                    if (!modal) return { success: false, reason: 'no modal' };
                    const btns = Array.from(modal.querySelectorAll('button, a'));
                    const submitBtn = btns.find(b => (b.innerText || '').trim() === '提交');
                    if (submitBtn) {
                        submitBtn.click();
                        return { success: true, text: submitBtn.innerText };
                    }
                    return { success: false, reason: 'no submit button' };
                }""")
                print(f"  提交按钮点击: {submit_res}")
                time.sleep(3)

                shot_path = os.path.join(CUR_DIR, f"appeal_submitted_{item['idx']}.png")
                page.screenshot(path=shot_path)
                print(f"  已截图留存: {shot_path}")
            else:
                print("  弹窗中没有输入框，可能已在处理中")
                page.screenshot(path=os.path.join(CUR_DIR, f"appeal_already_in_progress_{item['idx']}.png"))
        else:
            print("  未找到申诉入口")

    browser.close()






