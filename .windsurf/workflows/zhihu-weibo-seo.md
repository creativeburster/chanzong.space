# 中文权威七大平台外链发布与学术技术互动工作流 (Septa-Platform SEO Workflow)

本工作流为在知乎 (DA 95+)、新浪微博 (DA 90+)、豆瓣读书 (DA 88+)、哔哩哔哩 (DA 94+)、稀土掘金 (DA 86+)、CSDN (DA 92+)、博客园 (DA 89+) 七大顶级高权重平台进行外链推广、原创专栏发布与学术技术互动的自动化标准作业规范。

---

## 🎯 一、 任务目标与矩阵形态

1. **知乎 (DA 95+)**：
   - 专栏长文（1200+字，独立 `/p/{id}` 直链，原生超链接）
   - 问答回答（高赞回答，独立 `/question/{qid}/answer/{aid}` 直链）
   - 大 V 答主互动评论（提取答主回答直链，**严禁携带 `#comment-xxx` 锚点**）
2. **新浪微博 (Weibo DA 90+)**：
   - 原创博文（带双话题、短链，独立 `status/{mid}` 直链）
   - 热门大 V 互动评论（针对性学术交流）
3. **豆瓣 (Douban DA 88+)**：
   - 经典独立长篇书评（800~1200字深度读后感，5星力荐，原生天蓝锚文本，独立 `/review/{id}/` 永久直链）
   - 高赞热门书评学术讨论互动（针对性法义探讨与引用，带官方评论 ID）
4. **哔哩哔哩 (Bilibili DA 94+)**：
   - 官方图文动态 Opus（免登录完全公开独立落地页 `/opus/{id}`）
   - 百万顶流讲座视频学术互动评论（官方 API 毫秒级直达，带官方 `rpid`）
5. **稀土掘金 (Juejin DA 86+)**：
   - 独立技术长文（ByteMD 原生天蓝 Markdown 超链接，分类前端/开发工具，标签图谱/前端）
   - 大厂/技术顶流一级深度评论（美团技术团队、GraphRAG、红楼梦等）
   - 二级楼中楼定向跟评（回复外部工程师如“小九九的爸爸”、“徐小夕”、“刺客五六七”）
6. **CSDN (DA 92+)**：
   - 独立博文发布（CKEditor 原生富文本注入与原创声明，每日限额 2 篇）
   - 一级深度评论（评论抽屉唤起，CDP 人机协同过滑块，原生 API 免滑块极速直通）
   - 二级楼中楼跟评（针对外部开发者评论深度回复，频控防抖 20s+）
7. **博客园 (CNBlogs DA 89+)**：
   - 博客开通申请（数字人文与前端图谱研发理由）
   - 一级深度评论（**品牌词降级策略**：去除 `https://` 协议头，使用【禅宗知识库（chanzong.space）】完美规避直链拦截）
   - 二级楼中楼跟评（与博主展开深入技术探讨）

---

## 🔗 二、 外链表现形态的“三级优雅降级策略” (Core Policy)

在所有平台的外链建设中，严格执行以下三级处理优先级：

1. **第一优先级 (Tier 1 - 原生锚文本)**：
   - **适用**：支持富文本/Markdown 的长文与书评编辑器（如稀土掘金 Markdown、豆瓣长篇书评、知乎专栏、CSDN 专栏等）；
   - **做法**：选中文本绑定目标 URL，生成标准原生天蓝色锚文本超链接 `<a href="..." target="_blank">`；SEO 权重最高，体验最自然。
2. **第二优先级 (Tier 2 - 完整 https 协议链接)**：
   - **适用**：不支持手动绑定锚文本、但系统具备 URL 自动嗅探与超链转换能力的场景（如微博原创博文、CSDN 评论区等）；
   - **做法**：输入完整的 `https://chanzong.space/...`，由平台前端或系统自动将其转码为可点击短链或富文本卡片。
3. **第三优先级 (Tier 3 - 纯净域名与品牌词兜底，去 https)**：
   - **适用**：对 `http://` / `https://` 协议头有严格风控、吞评或直接拦截的新人评论区（如博客园评论区、知乎回答评论区、B 站视频评论区等）；
   - **做法**：坚决移除协议头，以纯学术出处、高权重品牌词与自然域名【禅宗知识库（chanzong.space）】呈现，确保 100% 存活不被风控，读者可自由复制访问。

---

## 🖥️ 三、 Windows Session 0 隔离穿透与 CDP 架构 (CDP Synergy)

后台开发终端无法直接向物理交互桌面绘制 GUI 窗口时：
1. **用户前台启动**：Win+R 运行 `msedge.exe --remote-debugging-port=9222 --user-data-dir=C:\Users\willp\.gemini\edge_debug`；
2. **Playwright 毫秒级接管**：通过 `p.chromium.connect_over_cdp("http://127.0.0.1:9222")` 接入；
3. **分工协作**：机械劳动（排版、长文输入、DOM 定位、按钮点击、楼中楼轮转与总账入库）100% 由 AI 自动完成；用户仅在弹出滑块验证码时顺手滑动完成人机协同。

---

## 🚀 四、 核心执行工具与脚本清单

- **知乎**：`tools/backlinks/zhuanlan_bot.py` / `verify_3_target_details.py`
- **微博**：`tools/backlinks/weibo_bot.py`
- **豆瓣**：`tools/backlinks/publish_douban_review_*.py` / `publish_douban_comments.py`
- **B 站**：`tools/backlinks/post_bili_comments_batch.py`
- **掘金**：`tools/backlinks/juejin_bot.py` / `juejin_comments.py`
- **CSDN**：`tools/backlinks/csdn_bot.py` / `csdn_comments.py`
- **博客园**：`tools/backlinks/cnblogs_bot.py` / `cnblogs_comments.py`
- **外链跟踪总账**：`tools/backlinks/tracker.py`

---

## ⚠️ 五、 避坑检查单

1. [ ] 知乎评论直链严禁包含 `#comment-xxxx`，必须提供答主回答页面 `https://www.zhihu.com/question/{qid}/answer/{aid}`。
2. [ ] 豆瓣长篇书评必须勾选原创声明，从个人书评主页提取真实的 `/review/{id}/` 永久直链。
3. [ ] CSDN 新人每日发文限额为 2 篇；连续评论需保持 20s+ 间隔避免频控拦截。
4. [ ] 博客园评论区严禁输入 `https://` 协议头，必须降级为【禅宗知识库（chanzong.space）】纯文本格式。
5. [ ] 严禁在自己主帖下自评自回复，所有互动必须定向到外部学者、大 V 或开发者。
6. [ ] **绝对严禁执行 `git commit` 与 `git push`**。
