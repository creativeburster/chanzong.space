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

ARTICLES = [
    {
        "id": "post_1",
        "title": "开源数字人文实践：基于 Next.js 14 与 D3.js 构建多维禅宗知识图谱",
        "body": """
> 🍃 **项目主站**：禅宗知识库 (`chanzong.space`)  
> 🕸️ **交互图谱**：D3.js 全球禅门关系图谱 (`chanzong.space/graph`)

---

## 📌 一、 为什么要做“禅宗数字人文知识图谱”？

禅宗作为中国思想史与东方哲学中极具特色的智慧流派，其传法以“不立文字，教外别传，直指人心，见性成佛”著称。然而，在其两千多年的历史演变中，沉淀下了极其浩瀚的文献体系——从早期的《达摩四行观》、《血脉论》，到中期的《六祖法宝坛经》、《永嘉证道歌》，再到宋代极度繁盛的《无门关》、《碧岩录》百则公案颂古。

在传统的典籍查阅中，参学者常面临三大痛点：
1. **文献孤立**：传统古籍往往单本印刷，读者很难直观获知某位祖师在整个禅宗五家七宗谱系中的法脉承接；
2. **名相断层**：禅宗特有的核心概念（如“转识成智”、“无门”、“心王”、“本来面目”）往往散落在不同典籍中，缺乏全网状关联；
3. **数字化质量参差不齐**：网络上流通的 OCR 电子书充斥页眉页脚乱码与错别字，缺乏现代白话精准导学。

为此，我们发起了非营利开源数字人文项目“禅宗知识库”，旨在用现代前端与数据拓扑技术，构建一个多维互链、交互式物理仿真的全球禅门知识体系。

---

## 🛠️ 二、 核心技术架构与工程实现

本项目采用现代全栈前端架构构建，全面兼顾性能、SEO 友好度与温润优雅的视觉体验：

- **Next.js 14 (App Router)**：混合服务端渲染 (SSR) 与客户端水合 (Hydration)，确保深层内容秒级响应；
- **React 18 + TypeScript**：全量强类型结构化数据拓扑 (`taxonomy.ts`)，杜绝悬空引用；
- **Tailwind CSS**：专为古籍研读定制的温润宣纸水墨视觉风格 (`#FAF9F6` 与 `#0F172A`)；
- **D3.js v7 力导向引擎**：多维异构图谱力模拟与碰撞阻尼防抖算法；
- **PWA 离线支持**：Service Worker 预缓存，支持无网络环境静心阅读。

### 1. D3.js 交互物理引擎实现

在图谱渲染中，我们将典籍、历代祖师、核心概念与公案机锋抽象为异构拓扑网络：

```typescript
// 节点分类与配色规范
const colorMap: Record<string, string> = {
  center: '#D97706',    // 中心正法 (金色)
  person: '#2563EB',    // 祖师人物 (禅青)
  classic: '#DC2626',   // 核心经典 (朱砂)
  concept: '#059669',   // 核心概念 (翠绿)
  method: '#7C3AED',    // 修持法门 (紫檀)
  qa: '#4B5563'         // 机锋问答 (墨灰)
};
```

### 2. 网状多卡片交叉互链网络

为了打破传统文献的孤岛状态，全站任何详情页均设计为多卡片全网状互链：
- 阅读《六祖坛经》时，系统动态聚合关联祖师（惠能、弘忍、神秀）、关联概念（自性清净、顿悟、无念无相无住）与关联公案；
- 形成真正的“全网状互链拓扑”，让每一部经典都不再是孤立的信息孤岛。

---

## 📖 三、 开放体验与结缘共建

目前，全站已整理收录 40+ 禅宗核心典籍、160+ 核心概念、60+ 历代祖师与 205+ 公案问答，全部支持繁体/正体与简体实时切换，具备原生 PWA 离线参修能力。

线上体验可访问主站 `chanzong.space`，欢迎对数字人文、古籍数字化与知识图谱感兴趣的学术同修与开发者共同参研！
""".strip()
    },
    {
        "id": "post_2",
        "title": "从〈达摩四行观〉到〈六祖坛经〉：两千年禅门文献拓扑与法脉演进",
        "body": """
> 📜 **经典文献溯源**：禅宗知识库典籍网络 (`chanzong.space/books/liuzutanjing`)  
> 🌐 **知识拓扑全局**：禅宗知识库 (`chanzong.space`)

---

## 📌 一、 达摩西来：从《二入四行论》奠基大乘禅观

禅宗东传千余载，其思想体系绝非凭空顿悟，而是经历了极其严谨的文献与修持演变。

初祖菩提达摩面壁少林九年，所传《二入四行论》奠定了全宗修学的骨架：
- **理入**：藉教悟宗，深信含生同一真性，但为客尘妄想所覆，不能显了。舍妄归真，凝住壁观，无自无他，凡圣等一；
- **行入**：具体包含四种修持心行——
  1. **报冤行**：逢苦不忧，识破往昔业因，心无怨憎；
  2. **随缘行**：得失随缘，心无增减，喜风不动；
  3. **无所求行**：世人长迷，处处贪著，智者达理，安心无为；
  4. **称法行**：性净之理，目之为法，信解本自空寂，应机而行。

《四行观》是沉着而坚实的观照功夫，为禅门确立了“以理融行、行不离理”的根基。

---

## 🕊️ 二、 僧璨《信心铭》至六祖《坛经》：破二见与顿悟直指

及至三祖僧璨大师撰《信心铭》，禅法开篇即直截了当：“**至道无难，唯嫌拣择。但莫憎爱，洞然明白。**”一语点破凡夫执着美丑、顺逆、是非之妄见。

而到了中唐，六祖惠能大师在曹溪开法，《六祖法宝坛经》将印度佛学彻底本土化为直指本心的顿悟法门：
- **无念为宗**：于念而无念，非百物不思，而是在一切境上心不染著；
- **无相为体**：外离一切相，即见清净自性；
- **无住为本**：为人本性，念念不住，前念、今念、后念念念相续而无缚。

从达摩祖师的“凝住壁观”，到六祖的“无住为本”，文献的演进深刻折射出禅修从外在形式的凝神摄照，升华为一切生活日用皆是道场的活泼灵动。

---

## 🕸️ 三、 数字化拓扑重构法脉网络

在传统阅读中，祖师传记与偈颂散落在《五灯会元》、《指月录》等数十卷巨著中，彼此的承接脉络极易割裂。

在“禅宗知识库”的数字人文体系中：
- 每一位祖师节点（达摩、慧可、僧璨、道信、弘忍、惠能、神秀）均通过有向图谱明确法脉承接；
- 典籍中的核心名相（壁观、信心、一行三昧、本来无一物）与历史公案实时网状对齐；
- 参学者轻点任一概念，即可纵览两千年来历代祖师对该法义的开示与机锋。

探索典籍文献网络，请访问主站：`chanzong.space`。
""".strip()
    },
    {
        "id": "post_3",
        "title": "心源探微：从唯识学“转识成智”看禅宗参话头的破执机理",
        "body": """
> 💡 **核心概念网络**：禅宗知识库概念拓扑 (`chanzong.space/concepts/zhuan-shi-cheng-zhi`)  
> 🌐 **全站系统参修**：禅宗知识库 (`chanzong.space`)

---

## 📌 一、 禅宗与唯识：看似径庭，实归一心

古来有云：“通宗不通教，开口便乱道；通教不通宗，如蛇钻竹筒。”禅宗以“不立文字”自居，而唯识学（法相宗）则以名相精密、分剖入微著称。两者看似宗风迥异，实则在心性修证上殊途同归。

玄奘法师所造《八识规矩颂》，将众生之心灵机能归纳为八识系统：
- **前五识**：眼、耳、鼻、舌、身（感觉神经系统）；
- **第六识**：意识（分别、思虑、计度一切境相的主谋）；
- **第七识（末那识）**：恒审思量，以第八识见分为自我，生生世世执取不舍，是一切俱生我执的根源；
- **第八识（阿赖耶识）**：含藏无始劫来一切善恶无记业种，受熏持种。

---

## 🔍 二、 参“念佛是谁”为何能直破第七识？

后世禅宗兴起“看话头”（如大慧宗杲禅师极力倡导的看话禅），最著名的公案莫过于“念佛是谁”、“拖死尸的是谁”。

许多人参禅常犯通病：用第六意识去推敲答案、分析因由，殊不知越思量离道越远。从唯识学的视角剖析：
1. **阻断第六识的意识妄流**：当一句“念佛是谁”提撕而起，提起疑情，第六意识的各种杂念、妄想、世智辩聪瞬间失去攀缘的对象；
2. **直捣第七末那识的根本我执**：“念佛的是我，但‘我’究竟是谁？”这一根本追问直接把探针插向了恒审思量的末那识。末那识恒与我痴、我见、我慢、我爱四烦恼相应，话头疑情正如一把金刚利剑，逼迫末那识无处藏身；
3. **触翻第八阿赖耶识无明窟**：参究至极处，内外俱寂，冷灰爆豆，忽然虚空粉碎、大地平沉，第八阿赖耶识的坚固生灭执著顿见崩解，当下照见本来面目！

---

## ☀️ 三、 一念悟即四智：转识成智的现代审视

六祖惠能大师在《坛经》中开示得极为透彻：“**大圆镜智性清净，平等性智心无病。妙观察智见非功，成所作智同圆镜。**”

- 转第八识为**大圆镜智**：朗照万物而不留纤尘；
- 转第七识为**平等性智**：泯灭自他二元对立，生起同体大悲；
- 转第六识为**妙观察智**：善巧观察诸法实相而无偏私计度；
- 转前五识为**成所作智**：于日用生活、接引度生中随缘成办一切善业。

所谓“悟”，本质上即是心灵结构的系统性重组与升华——一念迷即八识流转，一念悟即四智圆融。

查阅唯识学与禅宗交叉概念网络，敬请访问禅宗知识库：`chanzong.space`。
""".strip()
    },
    {
        "id": "post_4",
        "title": "当公案化作网络节点：解构〈无门关〉四十八则机锋的网状参学体系",
        "body": """
> 🎋 **公案机锋文献库**：禅宗知识库公案档案 (`chanzong.space/qas`)  
> 🌐 **全网关联网拓扑**：禅宗知识库 (`chanzong.space`)

---

## 📌 一、 “无门为法门”：宋代禅林百则机锋之王

南宋绍定初年，佛眼无门慧开禅师驻锡东林，聚历代禅宗公案四十八则，详加评唱并系以颂古，汇为《无门关》。

卷首开宗明义：“**佛语心为宗，无门为法门。**”
既然无门，如何跨入？无门禅师道：“岂不见道，从门入者，不是家珍；从缘得者，始终成坏。恁么说话，恰似无风起浪，好肉剜疮。”

对于习惯了理性逻辑与概念推演的现代人而言，禅宗公案常常显得荒诞不经、不可理喻：
- 僧问赵州：“狗子还有佛性也无？”州云：“无。”
- 百丈禅师因老人问“大修行底人还落因果也无”，师云：“不昧因果。”老人于言下大悟脱狐身；
- 倩女离魂，孰真孰假？
- 德山入门便棒，临济入门便喝。

这些机锋并非文人的玄学弄巧，而是历代大德在面对参学者偷心未死、知见纠缠时，以截断众流手段进行的“毒针疗疾”。

---

## ⚡ 二、 公案机锋的内在逻辑网络

如果仅将公案当做碎片化故事逐条阅读，往往会迷失在五花八门的语句公案中。然而，若从拓扑学视角解构，《无门关》四十八则公案构成了一个紧密咬合的认知突围网络：

1. **破见取见**：以“赵州狗子”为第一门，一个“无”字铸成生铁铸就的关卡，不许思量，不许卜度，将学人一切知见扫荡无余；
2. **明因验果**：百丈野狐案纠正偏空之执，说明空性与因果不二，顿悟者非落入虚无主义，而是“不昧因果”；
3. **直下承当**：如“岩头雪峰”、“香严击竹”，逼至绝路方得绝后苏醒。

每一则公案都是一个强大的心理阻断器，其最终目的都在于迫使参学者从外在文字言语的攀援中折回，观照自心实相。

---

## 🕸️ 三、 数字人文带来的公案研读革新

在“禅宗知识库 (chanzong.space)”中，我们通过知识图谱技术对这 205+ 则经典公案进行了多维重构：
- **问答-祖师对齐**：每则公案自动链接宗师生平、时代背景与传承流派；
- **公案-法门交叉**：将话头参修、默照观心等实修法门与具体公案问答直接挂钩；
- **名相精准释义**：公案中涉及的隐晦禅门黑话与字词读音，均提供字词释义与白话深度导读。

以现代学术眼光重新激活千载禅意，请访问禅宗知识库：`chanzong.space`。
""".strip()
    },
    {
        "id": "post_5",
        "title": "当代禅者的数字案头：百部禅籍深度校勘与数字化修学指南",
        "body": """
> 📚 **百部经典在线阅读**：禅宗知识库典籍大系 (`chanzong.space`)  
> 🛠️ **修持法门体系**：禅宗知识库法门指南 (`chanzong.space/methods`)

---

## 📌 一、 数字化时代的古籍研读痛点

随着互联网普及，浩瀚的古籍文献得以通过电子文档与网页广泛传播。然而，对于真正志在深入研读禅门典籍的学人而言，网络文献的现状却不容乐观：

1. **OCR 水印乱码横行**：网络上流通的 PDF 转文本版本，往往充斥着扫描噪点、页眉乱码（如反复出现的书名页码）、文字识别颠倒等硬伤；
2. **商业弹窗与广告侵扰**：许多在线佛学古籍站点充斥各类商业推广与浮窗，极大地破坏了静虑参修的专注心境；
3. **缺乏体系化分类**：文献大多单篇陈列，初学者面对浩如烟海的经典往往无从下手，不知何者为入门观行，何者为深奥了义。

---

## 🌾 二、 禅宗知识库的校勘与建设规范

为了解决上述痛点，非营利开源项目“禅宗知识库”确立了严谨的典籍整理标准：

### 1. 彻底清洗噪点，还古籍以本真
- 逐字清洗原始文本中的扫描噪点、独立页码与错置段落；
- 对通假字、生僻字提供精准拼音注音与权威辞典释义；
- 全站支持**简体中文**与**正体/繁体中文**的一键实时无缝切换。

### 2. 定制现代白话导读与核心旨趣
每部典籍开头均附独创撰写的导学体系：
- **【💡 现代白话导读与核心旨趣】**：阐明典籍作者背景、历史地位与核心宗风；
- **【📌 关键词】**：提炼 3-6 个核心法义术语；
- **【🎯 主旨与重点内容】**：分段提炼参修精义，规避常见阅读误区；
- **【🗣️ 名句白话解读】**：将经典偈颂转化为通俗生动的现代语言。

### 3. PWA 离线参学支持
全站集成了现代渐进式 Web 应用（PWA）标准，通过 Service Worker 对典籍和图谱数据进行本地缓存。即便在无网络信号的深山精舍或静坐室，亦可流畅翻阅。

---

## 🤝 三、 结语：让古老智慧在数字时代焕发生机

禅宗非消极避世之学，而是生命觉醒、照见当下的活泼大机。从古时的竹简木牍、宋元雕版印刷，到当代的数字化知识图谱，载体虽迁流不息，而心源正法历久弥新。

欢迎广大同修学人、学者与数字人文爱好者共同参修共建：
访问主站：`chanzong.space`，开启宁静深邃的数字禅修之旅。
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

    results = []

    for idx, art in enumerate(ARTICLES):
        print(f"\n==================================================")
        print(f"[{idx+1}/5] 正在发布文章: 《{art['title']}》...")
        print(f"==================================================")

        page.goto("https://www.jianshu.com/writer", wait_until="domcontentloaded", timeout=35000)
        time.sleep(3)

        # 点击“+ 新建文章”
        page.evaluate("""() => {
            const btn = Array.from(document.querySelectorAll('*')).find(e => (e.innerText || '').trim() === '新建文章' || (e.innerText || '').trim() === '+ 新建文章');
            if (btn) btn.click();
        }""")
        time.sleep(2.5)

        # 1. 填入标题
        title_input = page.query_selector("input[class*='title'], input._24i7u, input[placeholder*='标题']")
        if title_input:
            title_input.click()
            page.keyboard.press("Control+A")
            page.keyboard.press("Backspace")
            page.keyboard.type(art["title"], delay=10)
        else:
            page.evaluate(f"""(t) => {{
                const input = document.querySelector('input');
                if (input) {{
                    input.focus();
                    input.value = t;
                    input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    input.dispatchEvent(new Event('change', {{ bubbles: true }}));
                }}
            }}""", art["title"])
        time.sleep(1)

        # 2. 填入 Markdown 正文到 textarea
        textarea = page.query_selector("textarea._3swFR.source, textarea")
        if textarea:
            textarea.click()
            page.keyboard.press("Control+A")
            page.keyboard.press("Backspace")
            time.sleep(0.5)
            # 通过 evaluate 设置 value 并派发 input 事件
            page.evaluate("""(bodyText) => {
                const ta = document.querySelector('textarea._3swFR.source') || document.querySelector('textarea');
                if (ta) {
                    ta.focus();
                    ta.value = bodyText;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    ta.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""", art["body"])
            # 补敲一个换行触发实时保存
            page.keyboard.press("Enter")
            print(f"文章正文已填入，等待 4 秒自动保存...")
            time.sleep(4)

        # 3. 点击“发布文章”按钮
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

        # 4. 获取真实公开 URL
        print("在新窗口打开获取公开短链...")
        page.evaluate("""(tPrefix) => {
            const item = Array.from(document.querySelectorAll('li')).find(e => e.innerText && e.innerText.includes(tPrefix));
            if (item) {
                const gear = item.querySelector('i.fa-gear, i.fa-cog, [class*="gear"], [class*="setting"]');
                if (gear) gear.click();
            }
        }""", art["title"][:8])
        time.sleep(1)

        pub_url = None
        try:
            with ctx.expect_page(timeout=10000) as new_page_info:
                page.evaluate("""() => {
                    const items = Array.from(document.querySelectorAll('*')).filter(e => (e.innerText || '').trim() === '在新窗口打开');
                    if (items.length > 0) items[0].click();
                }""")
            new_page = new_page_info.value
            new_page.wait_for_load_state("domcontentloaded")
            time.sleep(3)
            raw_url = new_page.url
            pub_url = raw_url.split("?")[0]
            print(f"🎉 成功获取公开短链: {pub_url}")
            
            # 检查是否被锁
            is_locked = new_page.evaluate("""() => {
                const bar = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('当前文章已转为仅自己可见'));
                return bar ? true : false;
            }""")
            print(f"公开文章状态: {'被锁定' if is_locked else '正常公开/机审中 (未被锁)'}")

            shot_name = f"jianshu_art_{idx+1}_public.png"
            new_page.screenshot(path=os.path.join(CUR_DIR, shot_name))
            new_page.close()
        except Exception as ex:
            print(f"获取公开链接时异常: {ex}")

        results.append({
            "idx": idx + 1,
            "title": art["title"],
            "url": pub_url,
            "time": time.strftime("%Y-%m-%d %H:%M:%S")
        })

        # 冷却 8 秒防限频
        time.sleep(8)

    print("\n==================================================")
    print("全部 5 篇简书文章发布处理完毕！")
    print(json.dumps(results, ensure_ascii=False, indent=2))
    print("==================================================")

    # 保存发布记录结果到本地 json
    with open(os.path.join(CUR_DIR, "jianshu_published_5_posts.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    browser.close()

