# -*- coding: utf-8 -*-
"""
Dev.to (DA 90+, 顶级全球开发者与技术社区) 自动化外链与技术专栏发布引擎
利用 Dev.to 官方 API 直接发布数字化古籍与 D3.js 知识图谱架构文章，挂载 chanzong.space 权威 Dofollow 外链。
"""
import os
import sys
import json
import urllib.request

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tracker import add_backlink

DEVTO_API_KEY = "hd31xweRq1x3qVmGwWfk1qXk"
SITE_DOMAIN = "https://chanzong.space"

def publish_devto_article(title: str, markdown_body: str, tags: list, target_url: str = SITE_DOMAIN):
    print(f"\n[Dev.to] 正在发布文章: 《{title}》...")
    api_url = "https://dev.to/api/articles"
    
    payload = {
        "article": {
            "title": title,
            "published": True,
            "body_markdown": markdown_body,
            "tags": tags,
            "canonical_url": target_url
        }
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={
            "api-key": DEVTO_API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    
    with urllib.request.urlopen(req, timeout=15) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        live_url = res.get("url")
        print(f"🎉 [Dev.to] 成功发布至独立顶级域名 dev.to (DA 90)！")
        print(f"👉 在线外链地址: {live_url}")
        
        add_backlink(
            platform="Dev.to (全球权威开发者平台 DA 90)",
            region="海外繁体",
            category="技术专栏与开源展台",
            post_title=title,
            target_url=target_url,
            backlink_url=live_url,
            anchor_text="chanzong.space 禅宗知识图谱与数字化典籍库",
            link_type="Dofollow",
            status="Live",
            notes="永久 Dofollow 技术外链，包含 Next.js 14、D3.js 知识图谱与全站核心落地页链接"
        )
        return live_url

def run_devto():
    title = "Digitizing Ancient Zen Wisdom: Building an Interactive D3.js Knowledge Graph with Next.js 14"
    body = f"""# Digitizing Ancient Zen Wisdom: Building an Interactive D3.js Knowledge Graph with Next.js 14

Preserving and exploring classical philosophy in the modern digital age requires more than static text files. For the global Zen (Chan) Buddhist canon—encompassing over a thousand years of lineage masters, koans, and foundational sutras—navigating these interconnected teachings demands intuitive, multi-dimensional relational architecture.

In this project, we architected **[chanzong.space (禅宗知识库)]({SITE_DOMAIN})**, an open-access digital knowledge network featuring a real-time D3.js interactive relationship graph, full-text translations, and offline PWA support.

---

## 1. Architectural Highlights

- **Framework**: Next.js 14 App Router + React 18 + TypeScript + Tailwind CSS.
- **Relational Graph**: Rendered via **D3.js v7 SVG force-directed simulation**, linking Masters (祖师), Classics (典籍), Concepts (概念), and Koans (公案机锋).
  - Experience the live graph: **[Interactive Global Zen Graph]({SITE_DOMAIN}/graph)**
- **Curated Classics**: Over 40 foundational texts (including *Platform Sutra* / 六祖坛经, *Blue Cliff Record* / 碧岩录, and *Eight Verses on the Eight Consciousnesses* / 八识规矩颂), cleaned of OCR artifacts with bespoke modern vernacular annotations.
  - Explore the library: **[Chan Buddhism Classics Catalog]({SITE_DOMAIN}/books/liuzutanjing)**
- **PWA & Offline First**: Service Worker caching strategy ensuring monks, scholars, and practitioners can study classical texts offline anywhere.

---

## 2. Graph Force Simulation & Interactive Interlinking

One key challenge was preventing graph jitter while maintaining responsive routing upon node clicks. We solved this by freezing the D3 simulation after 3 seconds of settling:

```typescript
// Sample force simulation freeze
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
  .force('charge', d3.forceManyBody().strength(-250))
  .force('center', d3.forceCenter(width / 2, height / 2));

setTimeout(() => {{
  simulation.stop();
}}, 3000);
```

Every entity card in the knowledge base is interconnected—navigating from a master like Huineng (惠能) dynamically points to his related concepts, lineage predecessors, and recorded teachings.

---

## 3. Open Source & Live Project

The complete canon and codebase is public and freely accessible:
- **Official Portal**: [{SITE_DOMAIN}]({SITE_DOMAIN})
- **Traditional Chinese (正體中文)**: Native switch supported on [{SITE_DOMAIN}]({SITE_DOMAIN})
- **GitHub Repository**: [github.com/gstar-byte/chanzong.space](https://github.com/gstar-byte/chanzong.space)

We welcome digital humanities researchers, developers, and practitioners to explore the digital canon!
"""
def run_second_devto():
    title = "Engineering a Digital Canon: Interactive Taxonomies for Over 40 Classical Zen Texts"
    tags = ["programming", "webdev", "react", "productivity"]
    body = f"""# Engineering a Digital Canon: Interactive Taxonomies for Over 40 Classical Zen Texts

Preserving sacred literature and philosophical treatises online often suffers from poor structure, fragmented PDFs, and broken navigation. To solve this for classical Chan (Zen) Buddhism, we engineered **[chanzong.space (禅宗知识库)]({SITE_DOMAIN})** — a performant, open-access knowledge base built with Next.js 14, React 18, and D3.js.

Whether you are studying the non-duality of the *Platform Sutra* or the intricate psychological analysis of Yogacara (唯识) mind theories, navigating multi-layered canonical texts requires modern web tooling.

---

## 🏛️ 1. Multi-Dimensional Canon Architecture

Unlike a basic eBook reader, **chanzong.space** treats philosophical literature as a multi-relational graph:

1. **Foundational Classics (核心经典)**:
   - **[Platform Sutra (六祖坛经)]({SITE_DOMAIN}/classics/tanjing)**: The fundamental teaching of direct seeing into one's true nature (自性顿悟).
   - **[The Blue Cliff Record (碧岩录)]({SITE_DOMAIN}/classics/biyanlu)**: The pinnacle of Song Dynasty Koan commentary.
   - **[Diamond Sutra (金刚般若波罗蜜经)]({SITE_DOMAIN}/classics/jingangjing)**: The ontological grounding of non-abiding mind (应无所住而生其心).
   - **[Eight Verses on Eight Consciousnesses (八识规矩颂)]({SITE_DOMAIN}/classics/bashiguijusong)**: Master Xuanzang's indispensable guide to transforming consciousness into wisdom (转识成智).

2. **D3.js Dynamic Knowledge Graph**:
   - Spanning **500+ nodes** (Patriarchs, Core Doctrines, Cultivation Methods, and Koans).
   - Explore live in your browser: **[Global Zen Knowledge Topology]({SITE_DOMAIN}/graph)**.

---

## ⚡ 2. Technical Stack & Clean Typography

To honor the contemplative nature of reading ancient texts, our frontend adheres to the *rice-paper aesthetic* (`bg-[#FAF9F6]`) paired with dark night sky navigation:

- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- **Fast Search**: Instant Ctrl+K global dialog searching across 40+ books, 160+ philosophical concepts, and 200+ koans.
- **Vernacular Modern Commentary**: Every chapter is paired with exclusive modern Chinese analysis and keyword glossaries, bridging ancient idioms into practical psychological insights.
- **Offline Reliability**: Full PWA Service Worker caching for distraction-free reading without internet dependencies.

---

## 🌐 3. Explore & Contribute

The digital knowledge network is completely non-profit and publicly accessible:
- **Web App**: [{SITE_DOMAIN}]({SITE_DOMAIN})
- **Traditional Chinese Edition (繁體中文)**: Native real-time toggle available on all pages
- **Interactive Graph**: [{SITE_DOMAIN}/graph]({SITE_DOMAIN}/graph)

We invite developers, comparative philosophers, and meditation practitioners to explore this interconnected wisdom network!
"""
    publish_devto_article(
        title=title,
        markdown_body=body,
        tags=tags,
        target_url=f"{SITE_DOMAIN}/classics/tanjing"
    )

if __name__ == "__main__":
    run_second_devto()

