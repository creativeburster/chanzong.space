# 项目规则

## 第一条：始终使用中文回复

**所有回复必须使用中文。** 无论任何情况——代码说明、进度汇报、错误分析、提问确认——都使用中文。违反此规则即违反用户核心要求。

---

## 其他规则

- taxonomy.ts 中不同数组使用不同引号风格（CONCEPTS/KOANS 用双引号，FAQS 用单引号），批量插入时需匹配实际风格
- 大批量修改 taxonomy.ts 优先用 Python 脚本，但脚本需精确定位数组边界
- 中文字符串中的引号在双引号 TS 字符串内须用 \u201c \u201d 转义
- 所有 relatedBooks 的 id 必须与 manifest.json 一致，禁止悬空引用
- 新增概念前必须搜索 id 是否已存在
- FAQ 目标：每部经典 >= 15 条
- MethodItem 需要 steps 字段（string[]），不可用 category 字段
- KoanItem 无 case 字段，用 question 字段
