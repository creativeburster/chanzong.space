# -*- coding: utf-8 -*-
"""
更新 Gist 链接为直接规范路由 /classics/tanjing
"""
import os
import subprocess

GIST_ID = "8d8757cb7ee61b8f27feda86027f8df4"
FILENAME = "六祖法宝坛经核心导读.md"

CONTENT = """# 《六祖法宝坛经》现代白话导读与核心旨趣

> 📖 全文在线详注与知识图谱：[《六祖法宝坛经》参修指要与全篇阅读](https://chanzong.space/classics/tanjing)  
> 🌐 全球禅宗知识网络：[chanzong.space](https://chanzong.space) | [D3.js 关系图谱](https://chanzong.space/graph)

---

### 导语：直指人心，见性成佛的东方智慧宝典

唐代禅宗巨著《六祖法宝坛经》（六祖惠能大师述），是唯一一部被尊称为“经”的中国本土佛教典籍。它打破了传统经教繁琐的名相名理拘束，以“明心见性、直契本源”为宗风，确立了中国禅宗的核心理论与修持根基。

### 一、 核心旨趣：无念、无相、无住

六祖惠能大师在《坛经》中开宗明义，立三门根本见地：
1. **无念为宗**：念起即觉，不随念转，心不染境；
2. **无相为体**：外离一切相，照见诸法实相无生；
3. **无住为本**：为人本性念念不住，不住过去、现在、未来。

### 二、 核心偈颂参究

> 菩提本无树，明镜亦非台。  
> 本来无一物，何处惹尘埃。

神秀大师云“时时勤拂拭，勿使惹尘埃”，仍有渐修净垢之对待分别；而六祖直彻心源，照破一切能所对待，顿见自性清净本然。

### 三、 数字化典籍延伸阅读

数字化禅宗知识库收录了完整的《六祖坛经》全文校勘、逐句现代白话精析及历代祖师传法脉络：
- 典籍全篇在线研读：[《六祖法宝坛经》专页](https://chanzong.space/classics/tanjing)
- 概念与公案知识图谱：[D3.js 全球禅宗关系图谱](https://chanzong.space/graph)
"""

def update_gist():
    tmp_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), FILENAME)
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(CONTENT)
        
    cmd = ["gh", "gist", "edit", GIST_ID, "-f", FILENAME, tmp_path]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    print("Edit result:", res.stdout, res.stderr)
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

if __name__ == "__main__":
    update_gist()
