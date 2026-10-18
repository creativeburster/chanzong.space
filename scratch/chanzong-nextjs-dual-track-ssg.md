# Next.js 14 App Router 简繁双轨静态站点生成 (SSG) 与 OpenCC 自动化管道

官方门户：[禪宗知識庫 (chanzong.space)](https://chanzong.space/zh-tw)  
简体主站：[禅宗知识库 (chanzong.space)](https://chanzong.space)

## 1. 架构目标与 SEO 国际化

为了服务全球汉语圈读者（大陆地区学人使用规范汉字，港澳台及海外汉学界使用正体繁体字），chanzong.space 在 Next.js 14 App Router 架构下实现了**全量 SSG 静态简繁双轨双向镜像**：
- 简体路径：`/classics/[id]`、`/concepts/[id]`、`/graph` 等
- 繁体路径：`/zh-tw/classics/[id]`、`/zh-tw/concepts/[id]`、`/zh-tw/graph` 等
- 并在 `head` 与 `sitemap.xml` 中自动嵌入 `hreflang="zh-Hans"` 与 `hreflang="zh-Hant"` 双向内链。

## 2. OpenCC 自动化流转管道

在编译构建期间，底层数据模型 `lib/taxonomy.ts` 保持统一的单一数据源 (SSOT)，通过 `opencc-js` 针对标题、白话今译、生僻字释义进行精准词汇级繁体化：

```typescript
import * as OpenCC from 'opencc-js';

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

export function toTraditional(text: string): string {
    if (!text) return '';
    return converter(text);
}
```

## 3. 双轨静态路由生成器

```typescript
// app/zh-tw/classics/[id]/page.tsx
import { getClassicById, getAllClassicIds } from '@/lib/classics';
import { toTraditional } from '@/lib/i18n';

export async function generateStaticParams() {
    const ids = await getAllClassicIds();
    return ids.map(id => ({ id }));
}

export default async function TraditionalClassicPage({ params }: { params: { id: string } }) {
    const classic = await getClassicById(params.id);
    return (
        <article className="prose prose-slate max-w-4xl mx-auto py-12">
            <h1>{toTraditional(classic.title)}</h1>
            <div className="guide-card">{toTraditional(classic.modernGuide)}</div>
            <div className="content">{toTraditional(classic.cleanedContent)}</div>
        </article>
    );
}
```

完整在线成果请参阅：[禪宗知識庫繁體版學術通道](https://chanzong.space/zh-tw)。
