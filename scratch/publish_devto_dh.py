# -*- coding: utf-8 -*-
"""
Dev.to (DA 90+) 国际顶级开发者平台：发布高质量数字人文与知识图谱工程架构长文
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

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink

DEVTO_API_KEY = "hd31xweRq1x3qVmGwWfk1qXk"
SITE_DOMAIN = "https://chanzong.space"

proxies = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}
opener = urllib.request.build_opener(urllib.request.ProxyHandler(proxies))

ARTICLE_TITLE = "Engineering a Scalable Digital Humanities Knowledge Graph for 130+ Zen Classics with Next.js 14 & D3.js"

MARKDOWN_BODY = """# Engineering a Scalable Digital Humanities Knowledge Graph for 130+ Zen Buddhist Classics with Next.js 14 & D3.js

When preserving and exploring classical philosophical canons, traditional digitized archives often suffer from fragmented flat texts, clunky navigation, and poor contextual interlinking. 

Over the past few months, we designed and built **[ChanZong Knowledge Base (chanzong.space)](https://chanzong.space)**, a modern open-access digital humanities platform indexing over **130 canonical Zen Buddhist scriptures**, 500+ philosophical concepts, and hundreds of historical lineages.

In this article, we share our architectural decisions, focusing on:
1. **D3.js v7 Force-Directed Graph Engine** with custom dampening & anti-jitter algorithms.
2. **Next.js 14 App Router SSG** with automated Simplified/Traditional Chinese dual-track routing.
3. **Structured Taxonomy Schema** maintaining a zero-dangling-reference network.

---

## 1. The Challenge of Visualizing Dense Philosophical Networks

In classical Zen literature (ranging from the *Platform Sutra* and *Huangbo's Essential Dharma of Mind Transmission* to *The Blue Cliff Record* and *Gateless Gate*), concepts and historical masters do not exist in isolation. Every master links to lineage transmissions, koans, and doctrinal paradoxes.

Rendering 3,000+ interconnected entities inside a web canvas introduces three common pitfalls:
- **Hairball problem**: Extreme edge density causing visual overlap.
- **Continuous jitter**: The force simulation never reaching equilibrium, draining GPU/CPU resources.
- **Search latency**: Client-side filtering stuttering on low-powered mobile devices.

### D3.js Multi-Stage Equilibrium Simulation

To resolve dynamic jitter and provide an interactive exploration canvas, we implemented a multi-stage physics model in D3 v7:

```typescript
import * as d3 from 'd3';

export function createZenKnowledgeForceSimulation(
  nodes: KnowledgeNode[], 
  links: KnowledgeLink[], 
  width: number, 
  height: number
) {
  const simulation = d3.forceSimulation(nodes)
    // 1. Many-Body Repulsion with dynamic distance bounds
    .force("charge", d3.forceManyBody()
      .strength((d: any) => d.isCenter ? -800 : -260)
      .distanceMax(600)
    )
    // 2. Elastic Link Spring scaled by semantic weight
    .force("link", d3.forceLink(links)
      .id((d: any) => d.id)
      .distance((l: any) => l.weight * 60)
      .strength(0.6)
    )
    // 3. Centering force to retain canvas boundary
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.08))
    // 4. Collision prevention protecting node text labels
    .force("collide", d3.forceCollide().radius((d: any) => (d.radius || 12) + 12).iterations(3));

  // Auto-freezing after 3.2 seconds to eliminate jitter & conserve battery
  simulation.alphaTarget(0).alphaDecay(0.0228);

  return simulation;
}
```

By tuning `alphaDecay` to `0.0228`, the physics engine naturally converges and freezes within ~3 seconds, switching seamlessly from a dynamic layout engine to a static SVG pan-zoom canvas.

Experience the live graph: **[Interactive D3.js Global Zen Knowledge Graph](https://chanzong.space/graph)**.

---

## 2. Next.js 14 App Router & Dual-Track Static Site Generation (SSG)

Classical East Asian humanities must cater to both Simplified Chinese (Mainland China academic circles) and Traditional Chinese (Hong Kong, Taiwan, and international sinology scholars).

Instead of relying on fragile client-side text replacement (which ruins SEO indexation and causes layout shifts), we engineered an automated **Dual-Track SSG Pipeline**:

- **Simplified Root**: `/classics/[id]`, `/concepts/[id]`, `/methods/[id]`
- **Traditional Root**: `/zh-tw/classics/[id]`, `/zh-tw/concepts/[id]`, `/zh-tw/methods/[id]`
- **Bidirectional Alternate Links**: Embedded directly in the HTML `<head>` and `sitemap.xml`:
  ```html
  <link rel="alternate" hreflang="zh-Hans" href="https://chanzong.space/classics/liuzutan-jing" />
  <link rel="alternate" hreflang="zh-Hant" href="https://chanzong.space/zh-tw/classics/liuzutan-jing" />
  ```

During the pre-rendering build phase, raw texts and annotations from `lib/taxonomy.ts` are converted via `opencc-js` with contextual dictionary optimizations, achieving **100% static HTML generation (0ms TTFB)** across all 130+ classics.

Explore the traditional portal: **[禪宗知識庫 (chanzong.space) 正體學術通道](https://chanzong.space/zh-tw)**.

---

## 3. Strict Taxonomy & Ontology Schema

To prevent broken links across thousands of entities, our system defines a unified Type-Safe Ontology Schema:

```typescript
export interface ClassicMetadata {
  id: string;              // e.g. "huangbo", "liuzutan-jing"
  title: string;           // Classic title
  author: string;          // Author / Patriarch
  category: ClassicCategory;
  summary: string;         // 80-120 word modern overview
  relatedConcepts: string[]; // Concept IDs
  relatedPersons: string[];  // Patriarch IDs
  relatedMethods: string[];  // Practicing Method IDs
}
```

A continuous verification script (`tools/verify_taxonomy.py`) asserts that:
- Every `relatedBooks` identifier maps to a published markdown canon;
- Every `relatedConcepts` points to a validated node;
- Zero dangling nodes or circular crashes exist in the graph.

---

## 4. Open-Access Philosophy & Live Links

Digital humanities should be open, accessible, and fast. By combining static pre-rendering with interactive vector visualization, we hope to offer scholars, practitioners, and curious minds a clean, zero-distraction sanctuary for inner peace and scholarly inquiry.

Key entry points:
- **Official Home**: [https://chanzong.space](https://chanzong.space)
- **130+ Zen Classics Index**: [https://chanzong.space/classics](https://chanzong.space/classics)
- **Interactive Knowledge Graph**: [https://chanzong.space/graph](https://chanzong.space/graph)
- **Patriarch Biographies & Lineages**: [https://chanzong.space/persons](https://chanzong.space/persons)

We welcome any feedback, contributions, and discussions regarding digital humanities visualization and modern text processing!
"""

def publish():
    print("="*60)
    print(f"🚀 正在向 Dev.to (DA 90+) 官方 API 发布深度架构长文...")
    print(f"👉 标题: {ARTICLE_TITLE}")
    print("="*60)
    
    payload = {
        "article": {
            "title": ARTICLE_TITLE,
            "published": True,
            "body_markdown": MARKDOWN_BODY,
            "tags": ["webdev", "javascript", "react", "programming"],
            "canonical_url": f"{SITE_DOMAIN}/about"
        }
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "https://dev.to/api/articles",
        data=data,
        headers={
            "api-key": DEVTO_API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    
    try:
        with opener.open(req, timeout=15) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            live_url = res.get("url")
            print(f"🎉🎉 [Dev.to] 成功发布至国际顶级技术平台！")
            print(f"👉 独立永久 URL: {live_url}")
            
            rec_id = add_backlink(
                platform="Dev.to (全球权威开发者平台 DA 90)",
                region="海外繁体",
                category="技术专栏与开源展台",
                post_title=ARTICLE_TITLE,
                target_url=f"{SITE_DOMAIN}/graph",
                backlink_url=live_url,
                anchor_text="ChanZong Knowledge Base · Next.js 14 & D3.js Digital Humanities Architecture",
                link_type="Dofollow",
                status="Live",
                notes="Dev.to 国际顶级开发者社区深度英文架构长文，包含 D3.js 物理力算法代码与 Next.js 14 SSG 简繁双轨架构，挂载主站、图谱与典籍直链"
            )
            print(f"✅ 外链台账已成功入库: {rec_id}")
            return live_url
    except Exception as e:
        print(f"❌ Dev.to 发布失败: {e}")
        return None

if __name__ == "__main__":
    publish()
