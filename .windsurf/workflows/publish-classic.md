---
description: 发布一部禅宗经典的完整流程——从源文本到全站数据更新
---

# 发布禅宗经典完整流程

当用户提供一部新的禅宗 PDF/TXT 源文本时，按以下步骤完成"发布"：

## 步骤 1：源文本获取与深度理解
- 读取 PDF/TXT 源文本（PDF 需 OCR 或在线搜索获取全文）
- 确认版权：公有领域（作者逝世超过 50 年）方可使用
- **确认内容为禅宗或与禅宗密切相关**（非泛佛学——净土、道教、原始佛教、般若经、史传类不收录）
- 深度理解：作者背景、核心宗风、历史地位、修行要旨
- 所有回复使用中文

## 步骤 2：确定经典 ID 与序号
- 查看当前 manifest.json 最大 idx 值，新经典 idx = 最大值 + 1
- 拼音 id 规则：全小写拼音，无空格无连字符（如 changuancejin、dachengqixinlun）
- 查看当前 lib/taxonomy.ts 中各数组最大编号，确定新公案、新问答的起始编号

## 步骤 3：创建 Markdown 文件
- 路径：`classics_markdown/{两位序号}_{拼音id}.md`
- 结构必须包含：
  - `## 💡 现代白话导读与核心旨趣`
  - `## 📌 关键词`
  - `## 🎯 主旨`
  - `## 📖 重点内容`
  - `## ⚠️ 阅读难点`
  - `## 🗣️ 名句白话解读`
  - `## 📜 典籍原文`

## 步骤 4：更新 manifest.json
- 在数组末尾追加：idx, id, title, author, category, summary, word_count, filename
- summary 控制在 80-120 字，概括核心旨趣

## 步骤 5：更新 lib/translations.ts
- 添加该经典的白话译文条目，按段落/偈颂分条
- 翻译必须为纯大白话，通俗易懂
- 翻译段数应与原文段数匹配，确保覆盖充分
- 翻译比率标准：字数/翻译段数应 < 500 字/段，否则翻译不足需补充

## 步骤 6：更新 lib/glossary.ts
- 添加生僻字词注音释义
- 只收录真正的生僻字词，常见字不收录
- 注音用汉语拼音，释义简洁准确

## 步骤 7：更新 lib/taxonomy.ts（核心）
扩充以下 5 个数组（如该经典涉及）：

1. **ZEN_PERSONS**：新增/更新人物，包含 id, name, title, era, lifeStory, teachings, quotes, classics, relatedConcepts, relatedMethods, relatedPersons, relatedBooks
2. **ZEN_CONCEPTS**：新增/更新概念——**新增前必须搜索 id 是否已存在，避免重复**
3. **ZEN_METHODS**：新增/更新法门——若已有法门与该经典相关，更新其 relatedBooks 和 relatedPersons
4. **ZEN_KOANS**：精选公案新增，编号续接现有最大编号
5. **ZEN_FAQS**：新增相关问答，编号续接现有最大编号
   - 问答须基于该经典具体内容撰写，不可泛泛而谈
   - 每条 FAQ 的 relatedBooks 必须包含该经典 id
   - **每部经典 FAQ 数量目标：20-25 条**（基于 AI 深度阅读自主创作，充分覆盖经典各方面）
   - 问答内容涵盖：核心思想、修行方法、名相解释、现代应用、比较辨析、段落解读、宗风特色

### 重要注意事项
- 中文字符串中使用 `\u201c`（"）和 `\u201d`（"）转义引号
- 所有 relatedBooks 中的 id 必须与 manifest.json 中的 id 一致
- 所有引用的 id 必须在对应数组中存在（禁止悬空引用）
- 不允许一次对同一文件做多次编辑，避免冲突——使用 multi_edit 一次性完成
- 大批量修改 taxonomy.ts 时，优先使用 Python 脚本批量操作（参考 link_all.py、add_faqs.py）
- 注意：taxonomy.ts 中不同数组使用不同引号风格（单引号 vs 双引号），脚本中定位 marker 需匹配实际风格

## 步骤 8：更新站点元数据
- lib/stats.ts：更新各实体数量
- app/layout.tsx：更新 metadata description、openGraph description、JSON-LD description 中的数字
- app/sitemap.ts：确认新经典页面 URL 已被 sitemap 覆盖（通常动态生成，无需手动修改）

## 步骤 9：编译验证
- 运行 `npx tsc --noEmit` 确保零错误
- 若有 lint 错误，优先检查字符串中的中文引号转义问题
- 完整构建：`node node_modules/next/dist/bin/next build`

## 步骤 10：数据覆盖验证
发布后必须验证数据覆盖完整性，确保每部经典都有充足的 FAQ、公案、人物、概念、法门关联：
- 每部经典应满足：FAQ >= 10，公案 >= 3，人物 >= 1，概念 >= 2，法门 >= 1
- 不足的部分需补充
- 验证方法：遍历 manifest.json 中每部经典，统计各实体关联数并输出

## 步骤 11：繁体发布与双轨验证（用户钦定铁律）
发布每部经典时，**做一部简体就必须相应完成繁体发布**，确保简繁两地学人与海外读者无缝参修：
- 确认 `/zh-tw/classics/[id]` 繁体静态 HTML 页面成功生成且标题、导读、正文通过 OpenCC 精准繁体化；
- 确认该经典配套之祖师人物（`/zh-tw/persons/[id]`）、核心概念（`/zh-tw/concepts/[id]`）、修持法门（`/zh-tw/methods/[id]`）、公案（`/zh-tw/koan/[id]`）繁体页面全部同步生成；
- 确认生僻字卡片与白话今译卡片在繁体路由下调用 `t(...)` 正确渲染繁体字形；
- 确认 `sitemap.xml` 自动生成对应的 `zh-Hant` alternate hreflang 双向内链。

## 步骤 12：Git 提交与推送上线
- git add -A（添加核心数据文件、Markdown、classic_links 与代码改动）
- git commit -m "feat: 发布第X部《...》及配套繁简双轨实体与经典连线"
- git push origin master（推送到远程仓库，触发生产环境自动部署）

## 当前数据规模（2026-08-18）
- 经典：54 部
- 人物：122 位
- 概念：241 个
- 法门：62 个
- 公案：287 则
- 问答：862 则
- 翻译：约 1500 段

## 数据精炼经验（2026-08-13）

### 批量数据扩充
- 大批量新增条目（人物/概念/法门/公案/问答）优先用 Python 脚本生成 TypeScript 对象并追加到 taxonomy.ts 末尾
- 脚本中需注意各接口字段名：MethodItem 用 `title`（非 `name`），需 `classicRef` 字段；KoanItem 需 `master`/`source`/`relatedConcepts`/`relatedPersons` 字段（非 `relatedQa`）
- 新增条目后立即 `npx tsc --noEmit` 验证，发现字段不匹配及时用脚本批量修复

### 繁体字检测与消除
- 用简繁差异字表（约500字）扫描 classics_markdown/*.md 和 lib/*.ts
- 常见误判：著→着（需语境判断）、禪→禅、穢→秽、壇→坛、燈→灯
- 检测脚本：check_trad2.py，修复脚本：fix_trad.py

### 关联链接修复
- 用脚本扫描每部经典在五大数组中的 relatedBooks 引用数
- 不足的经典需补充关联：人物/概念/法门/公案的 relatedBooks 应包含对应经典 ID
- 注意人物 ID 命名不统一（如 fudaoshi 而非 fudashi），需先 grep 确认实际 ID

### FAQ 扩充策略
- 目标：每部经典 20-25 条 FAQ（基于 AI 深度阅读自主创作）
- 短篇经典（心经260字、觉林偈等）可适当减少但不少于 10 条
- 长篇经典应充分覆盖各章节，可达 25 条以上
- FAQ 须基于经典具体内容撰写，涵盖：核心思想、修行方法、名相解释、现代应用、比较辨析、段落解读、宗风特色
