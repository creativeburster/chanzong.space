# D3.js 知识图谱物理力导向引擎与防抖自平衡拓扑聚类算法实现

项目官网与在线交互图谱：[https://chanzong.space/graph](https://chanzong.space/graph)  
数字人文文献门户：[禅宗知识库 (chanzong.space)](https://chanzong.space)

## 1. 架构背景与挑战

禅宗知识库收录了逾 130 部经典典籍、500 余个核心哲学概念（如「自性清净」、「转识成智」、「无念为宗」）、近百位历代祖师及上千则机锋公案。构建全网状交叉拓扑网络时，传统渲染极易发生节点重叠、高密多边缠绕与频繁抖动等问题。

## 2. D3 v7 核心物理引擎配置

为了在 3000+ 节点的大规模关系网中实现丝滑流畅的交互与极佳的可视化层次感，系统设计了多阶段力平衡模型：

```typescript
import * as d3 from 'd3';

export function createZenKnowledgeForceSimulation(nodes: any[], links: any[], width: number, height: number) {
    const simulation = d3.forceSimulation(nodes)
        // 1. 多体排斥力：保持中心稀疏与外围聚集
        .force("charge", d3.forceManyBody().strength((d: any) => d.isCenter ? -800 : -260).distanceMax(600))
        // 2. 经典连线弹性阻尼：根据权重动态收敛
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance((l: any) => l.weight * 60).strength(0.6))
        // 3. 径向向心力约束：防止散落边缘
        .force("center", d3.forceCenter(width / 2, height / 2).strength(0.08))
        // 4. 防碰撞力学保护
        .force("collide", d3.forceCollide().radius((d: any) => (d.radius || 12) + 10).iterations(3));
        
    // 仿真 3 秒后自动平滑冻结 (alphaMin)，杜绝持续抖动
    simulation.alphaTarget(0).alphaDecay(0.0228);
    return simulation;
}
```

## 3. 语义连线与法脉图谱

图谱中严格区分六大实体类型：
- **中心正法** (Central Dharma)
- **核心经典** (Core Classics) - [130部核心经典全景](https://chanzong.space/classics)
- **祖师人物** (Zen Patriarchs) - [历代祖师传记](https://chanzong.space/persons)
- **核心概念** (Core Concepts) - [哲学概念库](https://chanzong.space/concepts)
- **修持法门** (Practicing Methods) - [顿悟法门](https://chanzong.space/methods)
- **机锋公案** (Zen Koans) - [历代公案](https://chanzong.space/koans)

欢迎访问 [禅宗知识库 · D3.js 全球禅宗知识图谱](https://chanzong.space/graph) 体验实时交互！
