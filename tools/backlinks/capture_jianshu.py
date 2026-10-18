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
    {"name": "remember_user_token", "value": tok, "domain": ".jianshu.com", "path": "/"}
]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, locale="zh-CN")
    ctx.add_cookies(cookies)
    page = ctx.new_page()

    print("正在打开简书工作台精准测试发布...")
    page.goto("https://www.jianshu.com/writer", wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)

    # 打印右上角发布按钮的具体 DOM
    btns = page.evaluate("""() => {
        const list = Array.from(document.querySelectorAll('*')).filter(e => {
            const t = (e.innerText || '').trim();
            return t === '发布文章' || t.includes('发布文章');
        });
        return list.map(b => {
            const r = b.getBoundingClientRect();
            return {
                tag: b.tagName,
                class: b.className,
                text: b.innerText,
                x: r.x,
                y: r.y,
                w: r.width,
                h: r.height
            };
        });
    }""")
    print("发布按钮检测:", json.dumps(btns, ensure_ascii=False))

    # 点击最顶层的发布按钮
    for b in btns:
        if b["w"] > 20 and b["x"] > 800 and b["y"] < 150:
            click_x = b["x"] + b["w"] / 2
            click_y = b["y"] + b["h"] / 2
            print(f"点击发布按钮坐标: ({click_x}, {click_y})")
            page.mouse.click(click_x, click_y)
            break
    time.sleep(2)

    # 检查是否弹出了下拉菜单
    dropdowns = page.evaluate("""() => {
        const items = Array.from(document.querySelectorAll('*')).filter(e => {
            const t = (e.innerText || '').trim();
            return t === '直接发布' || t === '定时发布';
        });
        return items.map(i => {
            const r = i.getBoundingClientRect();
            return { text: i.innerText.trim(), x: r.x + r.width / 2, y: r.y + r.height / 2 };
        });
    }""")
    print("下拉菜单检测:", json.dumps(dropdowns, ensure_ascii=False))

    for d in dropdowns:
        if d["text"] == "直接发布":
            print(f"点击'直接发布': ({d['x']}, {d['y']})")
            page.mouse.click(d["x"], d["y"])
            break

    time.sleep(6)
    page.screenshot(path="tools/backlinks/jianshu_single_publish_test.png")
    print("发布测试截图已保存: tools/backlinks/jianshu_single_publish_test.png")

    browser.close()

---

## 📌 一、 项目背景与架构选型

在现代数字人文（Digital Humanities）与古籍知识工程中，传统的单向文献检索已无法满足学术研究与大众参学的多维探索需求。面对包含百余部古籍、历代学者人物与数千则机锋问答的复杂网络，如何将离散的文献信息重构成高交互性、具备直观物理张力的拓扑图谱，是本项目攻坚的核心难点。

经过对比 Cytoscape.js、ECharts 与 D3.js，我们最终选型了 **Next.js 14 (App Router) + React 18 + D3.js v7 + Tailwind CSS** 的现代全栈技术架构：
- **Next.js 14 服务端渲染 (SSR)**：保障知识网络深层页面的毫秒级首屏加载与极致的 SEO 爬虫友好度；
- **React 18 + TypeScript**：全量强类型结构化数据拓扑 (`taxonomy.ts`)，杜绝知识图谱中的悬空引用（Dangling IDs）；
- **D3.js v7 力导向引擎**：基于物理质点力学模拟，实现高拟真度的节点排斥与连线约束。

---

## 🛠️ 二、 D3.js 力导向引擎核心算法调优

在大型异构网络中，直接使用默认参数的 `forceSimulation` 往往会导致节点剧烈抖动、边缘重叠严重以及在低端设备上占用极高 CPU。为此，我们进行了以下关键调优：

### 1. 物理引力与碰撞衰减参数

```typescript
// 配置力导向物理引擎
const simulation = d3.forceSimulation(nodes)
  // 连线弹簧力：设置理想间距与弹性系数
  .force("link", d3.forceLink(links).id((d: any) => d.id).distance(85).strength(0.6))
  // 多体电荷排斥力：适度衰减以防节点飘散
  .force("charge", d3.forceManyBody().strength(-220).distanceMax(400))
  // 视口居中引力
  .force("center", d3.forceCenter(width / 2, height / 2))
  // 弹性碰撞力：为节点预留安全间距
  .force("collision", d3.forceCollide().radius(28).iterations(2));
```

### 2. 仿真防抖与 3 秒自动冻结机制

为了彻底释放浏览器主线程并防止动画持续消耗设备电量，我们在物理引擎达到基本稳态（约 3 秒）后主动调用 `simulation.stop()`，并在用户拖拽交互时按需唤醒（`simulation.alpha(0.3).restart()`）：

```typescript
// 运行 3 秒后优雅停止仿真，固定坐标
const timer = setTimeout(() => {
  simulation.stop();
}, 3000);
```

---

## 📖 三、 结语与项目体验

通过现代全栈工程技术赋能传统文献数字化，不仅大幅提升了文献检索的趣味性，更为数字人文领域的知识工程提供了全新的范式。

项目完整在线系统可访问：`chanzong.space`，欢迎对开源数据可视化与知识图谱感兴趣的同仁共同交流探讨！
""".strip()
    },
    {
        "id": "tech_2",
        "title": "开源数字人文：两千年文献如何通过异构知识网络实现全网状互链？",
        "body": """
> 📚 **学术知识库主站**：数字人文文献档案 (`chanzong.space`)  
> 🌐 **全网状概念拓扑**：知识分类体系 (`chanzong.space/concepts`)

---

## 📌 一、 传统文献数字化的“孤岛痛点”

传统古籍与历史文献的数字化通常停留在“文本扫描 + OCR 电子书”的初级阶段。这种单篇线性排列的模式存在显著局限：
1. **文献孤立**：读者查阅单篇古籍时，很难横向比对同时期其他流派的义理呼应；
2. **术语断层**：核心学术概念散落在数百卷文献中，缺乏双向引用的全局索引；
3. **脉络割裂**：学者人物之间的师承法脉与思想交锋缺乏直观的可视化图解。

---

## 🕸️ 二、 异构知识拓扑的多卡片网状架构

为了打破传统孤岛，我们在开源项目“禅宗知识库”中探索了一套**多卡片交叉互链架构（Multi-Card Interlinking Architecture）**：

### 1. 异构节点类型抽象
我们将全量知识实体抽象为六大核心类目：
- **中心正法 (Center)**：全局思想主干；
- **历史人物 (Persons)**：时代背景、师承法脉与生平记录；
- **核心典籍 (Classics)**：原始文献深度校勘本与结构化章节；
- **核心概念 (Concepts)**：学术名相、词源释义与现代导读；
- **修持法门 (Methods)**：实践功夫体系与注意事项；
- **机锋公案 (Q&As)**：经典问答记录与多视角评唱。

### 2. 强类型网状引用与反向链接
在 Next.js 的每个动态路由详情页中，我们通过双向 ID 聚合算法，实现无死角的全网状卡片互链：
- 访问某部文献时，侧边栏与文末自动呈现所有关联的人物、核心术语与公案卡片；
- 点击任一术语卡片，立刻反向索引包含该术语的所有典籍段落；
- 不仅极大地方便了学术考据，更为全站搜索引擎蜘蛛（Spider）提供了深层抓取的完整拓扑通道。

---

## 💡 三、 结语与体验

数字化不是简单的古籍拍照上传，而是用现代信息架构对古代智慧进行活化与重构。

体验完整多维文献拓扑网络，请访问主站：`chanzong.space`。
""".strip()
    },
    {
        "id": "tech_3",
        "title": "从 0 到 1 打造高性能古籍阅读器：PWA 离线存储与现代排版实践",
        "body": """
> 🌾 **数字案头主站**：现代数字参学平台 (`chanzong.space`)  
> 🛠️ **实践指南**：修学法门文库 (`chanzong.space/methods`)

---

## 📌 一、 沉浸式阅读器设计哲学

数字时代的古籍研读，最忌讳浮躁与干扰。许多在线古籍网站充斥商业弹窗、劣质广告与粗制滥造的排版，严重破坏了研读者的心流体验。

在打造高性能古籍阅读器时，我们确立了三大核心原则：
1. **零广告、非营利、全局纯净**；
2. **温润优雅的宣纸水墨视觉风格**；
3. **随时随地脱网可读的 PWA 离线支持**。

---

## 🎨 二、 视觉色彩与排版工程

### 1. 护眼宣纸色谱定制
在 Tailwind CSS 配置中，我们摒弃了刺眼的纯白背景（`#FFFFFF`），精选了温和柔润的宋代宣纸底色：
- **浅色画布 (Day Canvas)**：`#FAF9F6`（温润柔和，长时间阅读无视觉疲劳）；
- **深色夜空 (Night Canvas)**：`#0F172A`（深邃内敛的墨青色）；
- **朱砂与紫檀辅助色**：`#DC2626`（朱砂朱印）与 `#7C3AED`（紫檀典雅）。

### 2. PWA 渐进式离线缓存实现
为了让学者在远离网络信号的深山精舍或旅行途中亦能专注参读，我们集成了现代 Service Worker 缓存策略：
- 全量典籍 Markdown 文本在用户首次访问时异步预缓存；
- 离线状态下自动降级提供完整的离线阅读体验，真正实现了“数字案头随身携带”。

---

## 🕊️ 三、 结语

技术当为人文服务，优雅的代码排版正是数字时代对传统文化最好的敬意。

欢迎访问主站体验纯净的数字阅读空间：`chanzong.space`。
""".strip()
    },
    {
        "id": "tech_4",
        "title": "知识拓扑网络中的碰撞检测与阻尼防抖：D3.js 力模拟算法优化",
        "body": """
> 🕸️ **交互系统实测**：全网物理图谱在线演示 (`chanzong.space/graph`)  
> 🌐 **主站网络**：数字知识库系统 (`chanzong.space`)

---

## 📌 一、 大型前端图谱渲染的性能挑战

在网页端使用 SVG 渲染超过数百个节点和数千条连线的大型知识网络时，开发者往往会遭遇两大棘手难题：
1. **布局混乱**：节点在斥力与引力相互拉扯下产生剧烈振荡，久久无法稳定；
2. **掉帧卡顿**：力模拟在每一帧执行密集的多体计算，导致页面滚动与鼠标悬浮响应迟钝。

---

## ⚙️ 二、 核心算法优化方案

### 1. 动态自适应碰撞半径
为了确保不同权重的节点（如核心典籍大节点与附属公案小节点）拥有相称的空间，我们根据节点的关联度（Degree）动态计算碰撞半径：

```typescript
const getRadius = (d: any) => {
  if (d.type === 'center') return 32;
  if (d.type === 'classic') return 24;
  return 18;
};

// 注入带有安全余量的自适应碰撞力
simulation.force("collision", d3.forceCollide().radius((d: any) => getRadius(d) + 8).strength(0.8));
```

### 2. Alpha 衰减率与速度阻尼优化
通过调整 `alphaDecay`（衰减速率）与 `velocityDecay`（阻尼摩擦系数），让整个图谱的布局在 120 帧（约 2 秒）内快速完成能量释放并收敛定型：

```typescript
simulation
  .alphaDecay(0.04)     // 加速衰减
  .velocityDecay(0.35);  // 增强阻尼，消除节点相互穿透弹跳
```

---

## 🚀 三、 性能收益与体验总结

经过上述算法优化，图谱的初次布局耗时降低了 65%，且完全消除了视觉抖动，大幅提升了低配移动设备上的交互流畅度。

欢迎体验实际运行效果：访问 `chanzong.space/graph` 感受顺滑的物理图谱交互！
""".strip()
    },
    {
        "id": "tech_5",
        "title": "开源全栈工程实践：基于 TypeScript 与 Next.js 打造强类型学术知识库",
        "body": """
> 📚 **学术知识体系**：数字文献与概念网络 (`chanzong.space`)  
> 🏛️ **公案机锋文献库**：结构化问答档案 (`chanzong.space/qas`)

---

## 📌 一、 学术知识库为什么必须强类型化？

在构建规模化的学术古籍与知识图谱系统时，数据质量往往决定了系统的生命周期。历史文献涉及错综复杂的人物关系、多重师承与跨典籍引用，若采用无模式的 JSON，极易产生以下工程灾难：
- 引用了不存在的人物 ID 或典籍 ID（悬空外键）；
- 繁体与简体字段混乱不齐；
- 缺少关键字段导致前端详情页运行时奔溃。

为此，我们在开发“禅宗知识库 (chanzong.space)”时，自始至终贯彻了 **全量强类型拓扑约束（Strict TypeScript Taxonomy）**。

---

## 🛡️ 二、 强类型拓扑契约设计

### 1. 实体接口与引用规范
我们在核心数据层中定义了严格的 TypeScript 接口契约：

```typescript
export interface ZenPerson {
  id: string;              // 拼音唯一标识符，如 xuanzang, wumen-huikai
  name: string;            // 真实姓名或法号
  era: string;             // 历史时期
  teachings: string[];     // 核心宗风开示
  relatedBooks: string[];  // 严格关联已收录的典籍 ID
  relatedConcepts: string[]; // 严格关联已收录的概念 ID
}
```

### 2. 编译期完整性校验
在 CI/CD 流水线与本地开发中，我们通过自动化测试脚本对全站数据进行引用图验证：
- 扫描每一个 `relatedBooks`、`relatedConcepts`、`relatedPersons` 数组；
- 确保所有被引用的 ID 都在对应的全局实体注册表中真实存在；
- 任何悬空引用都会在编译期直接报错拦截（Exit Code 1），杜绝线上出现死链。

---

## 🌟 三、 总结与结语

代码严谨，学术方可长青。基于现代全栈工程实践对传统文献进行结构化整理，是数字人文不可或缺的底层基石。

探索高质量强类型学术知识库，请访问主站：`chanzong.space`。
""".strip()
    }
]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()

    tech_results = []

    for idx, art in enumerate(TECH_ARTICLES):
        print(f"\n==================================================")
        print(f"[{idx+1}/5] 正在发布技术文章: 《{art['title']}》...")
        print(f"==================================================")

        page.goto("https://www.jianshu.com/writer", wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)

        # 点击新建文章
        page.evaluate("""() => {
            const btn = Array.from(document.querySelectorAll('*')).find(e => (e.innerText || '').trim() === '新建文章' || (e.innerText || '').trim() === '+ 新建文章');
            if (btn) btn.click();
        }""")
        time.sleep(2.5)

        # 输入标题
        title_input = page.query_selector("input[class*='title'], input._24i7u, input[placeholder*='标题']")
        if title_input:
            title_input.click()
            page.keyboard.press("Control+A")
            page.keyboard.press("Backspace")
            page.keyboard.type(art["title"], delay=10)
        time.sleep(1)

        # 输入正文到 Markdown textarea
        textarea = page.query_selector("textarea._3swFR.source, textarea")
        if textarea:
            textarea.click()
            page.keyboard.press("Control+A")
            page.keyboard.press("Backspace")
            time.sleep(0.5)
            page.evaluate("""(bodyText) => {
                const ta = document.querySelector('textarea._3swFR.source') || document.querySelector('textarea');
                if (ta) {
                    ta.focus();
                    ta.value = bodyText;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    ta.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""", art["body"])
            page.keyboard.press("Enter")
            time.sleep(4)

        # 点击发布文章
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('*')).filter(e => {
                const t = (e.innerText || '').trim();
                return t === '发布文章';
            });
            for (const b of btns) {
                const r = b.getBoundingClientRect();
                if (r.x > 800 && r.y < 150 && r.width > 20) {
                    b.click();
                    return;
                }
            }
        }""")
        time.sleep(6)

        # 间隔 8 秒冷却
        time.sleep(8)

    # 全部发布完毕后，统一访问创作者主页提取公开链接
    print("\n访问个人主页获取全部技术文章公开链接...")
    page.goto("https://www.jianshu.com/u/92585df02061", wait_until="domcontentloaded", timeout=35000)
    time.sleep(4)
    page.screenshot(path="tools/backlinks/jianshu_tech_5_published_home.png")

    articles = page.evaluate("""() => {
        const list = Array.from(document.querySelectorAll('.note-list li, ul.note-list li'));
        return list.map(li => {
            const a = li.querySelector('a.title') || li.querySelector('a[href*="/p/"]');
            const isLocked = li.innerText.includes('已锁定');
            return {
                title: a ? a.innerText.trim() : '',
                url: a ? a.href.split('?')[0] : '',
                isLocked: isLocked
            };
        }).filter(x => x.title && x.url);
    }""")

    # 统计去重
    seen = set()
    for a in articles:
        if a["url"] not in seen:
            seen.add(a["url"])
            tech_results.append(a)

    print("\n最终公开文章大盘:")
    print(json.dumps(tech_results[:15], ensure_ascii=False, indent=2))

    with open(os.path.join(CUR_DIR, "jianshu_tech_5_published.json"), "w", encoding="utf-8") as f:
        json.dump(tech_results, f, ensure_ascii=False, indent=2)

    browser.close()

    for item in remaining_targets:
        prefix = item["prefix"]
        print(f"\n==================================================")
        print(f"处理草稿: 《{item['title']}》...")
        print(f"==================================================")

        # 选中草稿
        page.evaluate(f"""() => {{
            const lis = Array.from(document.querySelectorAll('li'));
            const target = lis.find(e => e.innerText && e.innerText.includes('{prefix}'));
            if (target) target.click();
        }}""")
        time.sleep(2)

        # 确保正文处于聚焦并保存
        page.evaluate("""() => {
            const ta = document.querySelector('textarea._3swFR.source') || document.querySelector('textarea');
            if (ta) {
                ta.focus();
                ta.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }""")
        time.sleep(2)

        # 点击发布文章按钮
        pub_result = page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('*')).filter(e => {
                const t = (e.innerText || '').trim();
                return t === '发布文章' || t.includes('发布文章');
            });
            for (const b of btns) {
                const r = b.getBoundingClientRect();
                if (r.x > 800 && r.y < 150 && r.width > 20) {
                    b.click();
                    return { clicked: true, text: b.innerText };
                }
            }
            return { clicked: false };
        }""")
        print("点击发布结果:", pub_result)
        time.sleep(1.5)

        # 点击可能出现的“直接发布”子菜单项
        page.evaluate("""() => {
            const sub = Array.from(document.querySelectorAll('*')).find(e => (e.innerText || '').trim() === '直接发布');
            if (sub) sub.click();
        }""")
        print("已确认直接发布！等待 6 秒...")
        time.sleep(6)

    # 再次访问创作者主页获取全部文章列表
    page.goto("https://www.jianshu.com/u/92585df02061", wait_until="domcontentloaded", timeout=35000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/jianshu_all_5_published.png")

    articles = page.evaluate("""() => {
        const list = Array.from(document.querySelectorAll('.note-list li, ul.note-list li'));
        return list.map(li => {
            const a = li.querySelector('a.title') || li.querySelector('a[href*="/p/"]');
            return {
                title: a ? a.innerText.trim() : '',
                url: a ? a.href.split('?')[0] : ''
            };
        }).filter(x => x.title && x.url);
    }""")
    print("\n当前个人主页已发布的全部文章:")
    # 去重
    seen = set()
    unique_arts = []
    for a in articles:
        if a["url"] not in seen:
            seen.add(a["url"])
            unique_arts.append(a)
    print(json.dumps(unique_arts, ensure_ascii=False, indent=2))

    browser.close()

    # 针对文章 4 和文章 5
    targets = [
        {"prefix": "当公案化作", "title": "当公案化作网络节点：解构〈无门关〉四十八则机锋的网状参学体系"},
        {"prefix": "当代禅者的", "title": "当代禅者的数字案头：百部禅籍深度校勘与数字化修学指南"}
    ]

    for item_info in targets:
        prefix = item_info["prefix"]
        print(f"\n==================================================")
        print(f"正在发布/提取: 《{item_info['title']}》...")
        print(f"==================================================")

        # 选中文章
        page.evaluate(f"""() => {{
            const item = Array.from(document.querySelectorAll('li')).find(e => e.innerText && e.innerText.includes('{prefix}'));
            if (item) item.click();
        }}""")
        time.sleep(2)

        # 点击右上角的发布按钮
        clicked_pub = page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('*')).filter(e => {
                const t = (e.innerText || '').trim();
                return t === '发布文章' || t.includes('发布文章') || t === '发布更新';
            });
            for (const b of btns) {
                const r = b.getBoundingClientRect();
                if (r.x > 800 && r.y < 150 && r.width > 20) {
                    b.click();
                    return { clicked: true, text: b.innerText };
                }
            }
            return { clicked: false };
        }""")
        print("点击发布结果:", clicked_pub)
        time.sleep(1.5)

        # 如果弹出了“直接发布”子菜单，点击“直接发布”
        page.evaluate("""() => {
            const sub = Array.from(document.querySelectorAll('*')).find(e => (e.innerText || '').trim() === '直接发布');
            if (sub) sub.click();
        }""")
        print("尝试点击'直接发布'子菜单...")
        time.sleep(5)

        # 点击齿轮获取公开链接
        page.evaluate(f"""() => {{
            const item = Array.from(document.querySelectorAll('li')).find(e => e.innerText && e.innerText.includes('{prefix}'));
            if (item) {{
                const gear = item.querySelector('i.fa-gear, i.fa-cog, [class*="gear"], [class*="setting"]');
                if (gear) gear.click();
            }}
        }}""")
        time.sleep(1)

        try:
            with ctx.expect_page(timeout=10000) as new_page_info:
                page.evaluate("""() => {
                    const items = Array.from(document.querySelectorAll('*')).filter(e => (e.innerText || '').trim() === '在新窗口打开');
                    if (items.length > 0) items[0].click();
                }""")
            new_page = new_page_info.value
            new_page.wait_for_load_state("domcontentloaded")
            time.sleep(3)
            raw_url = new_page.url.split("?")[0]
            print(f"🎉 成功获取公开短链: {raw_url}")

            is_locked = new_page.evaluate("""() => {
                const bar = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('当前文章已转为仅自己可见'));
                return bar ? true : false;
            }""")
            print(f"文章状态: {'被锁定' if is_locked else '正常公开/机审中 (未被锁)'}")
            new_page.screenshot(path=f"tools/backlinks/jianshu_{prefix[:3]}_public.png")
            new_page.close()
        except Exception as e:
            print(f"获取公开链接异常: {e}")

    browser.close()

    # 1. 填入标题
    print("正在填入新文章标题...")
    title_input = page.query_selector("input[class*='title'], input._24i7u, input[placeholder*='标题']")
    if title_input:
        title_input.click()
        page.keyboard.press("Control+A")
        page.keyboard.press("Backspace")
        page.keyboard.type(title, delay=10)
    else:
        page.evaluate(f"""() => {{
            const input = document.querySelector('input');
            if (input) {{
                input.focus();
                input.value = '{title}';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }}
        }}""")
    time.sleep(1)

    # 2. 填入正文
    print("正在录入合规正文...")
    editor = page.query_selector("div.kalamu-area, div[contenteditable='true']")
    if editor:
        editor.click()
        page.keyboard.press("Control+A")
        page.keyboard.press("Backspace")
        time.sleep(0.5)

        for p_line in body.split("\n"):
            if not p_line.strip():
                page.keyboard.press("Enter")
                continue
            page.keyboard.insert_text(p_line)
            page.keyboard.press("Enter")
            time.sleep(0.01)
        print("正文录入完成！等待 4 秒自动保存...")
        time.sleep(4)

    # 3. 点击“发布文章”
    print("点击发布文章按钮...")
    click_pub = page.evaluate("""() => {
        const btns = Array.from(document.querySelectorAll('*')).filter(e => {
            const t = (e.innerText || '').trim();
            return t === '发布文章';
        });
        for (const b of btns) {
            const r = b.getBoundingClientRect();
            if (r.x > 800 && r.y < 150 && r.width > 20) {
                b.click();
                return { clicked: true, text: b.innerText };
            }
        }
        return { clicked: false };
    }""")
    print("发布点击结果:", click_pub)
    time.sleep(6)

    # 4. 获取新文章公开 URL
    print("通过新窗口打开获取真实公开链接...")
    page.evaluate("""() => {
        const item = Array.from(document.querySelectorAll('li')).find(e => e.innerText && e.innerText.includes('开源数字人文'));
        if (item) {
            const gear = item.querySelector('i.fa-gear, i.fa-cog, [class*="gear"], [class*="setting"]');
            if (gear) gear.click();
        }
    }""")
    time.sleep(1)

    with ctx.expect_page() as new_page_info:
        page.evaluate("""() => {
            const items = Array.from(document.querySelectorAll('*')).filter(e => (e.innerText || '').trim() === '在新窗口打开');
            if (items.length > 0) items[0].click();
        }""")
    
    new_page = new_page_info.value
    new_page.wait_for_load_state("domcontentloaded")
    time.sleep(4)
    print("新文章公开 URL:", new_page.url)
    print("新文章页面标题:", new_page.title())

    # 检查新页面是否有锁文横幅
    is_locked = new_page.evaluate("""() => {
        const bar = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('当前文章已转为仅自己可见'));
        return bar ? true : false;
    }""")
    print("新文章是否被锁:", is_locked)

    new_page.screenshot(path="tools/backlinks/jianshu_new_article_public.png")
    print("新文章截图已保存: tools/backlinks/jianshu_new_article_public.png")

    browser.close()

    # 点击齿轮图标查看下拉菜单
    gear_menu = page.evaluate("""() => {
        const item = Array.from(document.querySelectorAll('li')).find(e => e.innerText && e.innerText.includes('开源数字人文'));
        if (item) {
            const gear = item.querySelector('i.fa-gear, i.fa-cog, [class*="gear"], [class*="setting"]');
            if (gear) {
                gear.click();
                return { clicked: true };
            }
        }
        return { clicked: false };
    }""")
    print("点击齿轮:", gear_menu)
    time.sleep(1)

    # 监听新弹出的页面 (popup)
    with ctx.expect_page() as new_page_info:
        # 点击“在新窗口打开”
        page.evaluate("""() => {
            const items = Array.from(document.querySelectorAll('*')).filter(e => (e.innerText || '').trim() === '在新窗口打开');
            if (items.length > 0) items[0].click();
        }""")
    
    new_page = new_page_info.value
    new_page.wait_for_load_state("domcontentloaded")
    time.sleep(3)
    print("新窗口打开的公开真实 URL:", new_page.url)
    print("新窗口标题:", new_page.title())
    new_page.screenshot(path="tools/backlinks/jianshu_real_public_article.png")
    print("真实公开文章截图已保存！")

    browser.close()
