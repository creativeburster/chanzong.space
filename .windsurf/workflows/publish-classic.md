---
description: 发布一部禅宗经典的完整流程——从源文本到全站数据更新
---

# 发布禅宗经典完整流程

当用户提供一部新的禅宗 PDF/TXT 源文本时，按以下步骤完成"发布"：

## 步骤 1：源文本获取与深度理解
- 读取 PDF/TXT 源文本（PDF 需 OCR 或在线搜索获取全文）
- 确认版权：公有领域（作者逝世超过 50 年）方可使用
- 深度理解：作者背景、核心宗风、历史地位、修行要旨
- 所有回复使用中文

## 步骤 2：创建 Markdown 文件
- 路径：`classics_markdown/{两位序号}_{拼音id}.md`
- 结构必须包含：
  - `## 💡 现代白话导读与核心旨趣`
  - `## 📌 关键词`
  - `## 🎯 主旨`
  - `## 📖 重点内容`
  - `## ⚠️ 阅读难点`
  - `## 🗣️ 名句白话解读`
  - `## 📜 典籍原文`

## 步骤 3：更新 manifest.json
- 在数组末尾追加：idx, id, title, author, category, summary, word_count, filename

## 步骤 4：更新 lib/translations.ts
- 添加该经典的白话译文条目，按段落/偈颂分条

## 步骤 5：更新 lib/glossary.ts
- 添加生僻字词注音释义

## 步骤 6：更新 lib/taxonomy.ts（核心）
扩充以下 5 个数组（如该经典涉及）：

1. **ZEN_PERSONS**：新增/更新人物，包含 id, name, title, era, lifeStory, teachings, quotes, classics, relatedConcepts, relatedMethods, relatedPersons, relatedBooks
2. **ZEN_CONCEPTS**：新增/更新概念——**新增前必须搜索 id 是否已存在，避免重复**
3. **ZEN_METHODS**：新增/更新法门——若已有法门与该经典相关，更新其 relatedBooks 和 relatedPersons
4. **ZEN_KOANS**：精选公案新增，编号续接现有最大编号
5. **ZEN_FAQS**：新增相关问答，编号续接现有最大编号

### 重要注意事项
- 中文字符串中使用 `\u201c`（"）和 `\u201d`（"）转义引号
- 所有 relatedBooks 中的 id 必须与 manifest.json 中的 id 一致
- 所有引用的 id 必须在对应数组中存在（禁止悬空引用）
- 不允许一次对同一文件做多次编辑，避免冲突——使用 multi_edit 一次性完成

## 步骤 7：编译验证
- 运行 `npx tsc --noEmit` 确保零错误
- 若有 lint 错误，优先检查字符串中的中文引号转义问题
- 完整构建：`node node_modules/next/dist/bin/next build`

## 当前数据规模（2026-08-11）
- 经典：40 部
- 人物：~60+
- 概念：~160+
- 法门：~20+
- 公案：205 则
- 问答：308+ 则
