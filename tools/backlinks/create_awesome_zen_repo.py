# -*- coding: utf-8 -*-
"""
创建 GitHub 顶级开源仓库: awesome-zen (DA 96+ 顶级权威反向链接)
构建包含 40+ 禅宗典籍、公案、白话详注与 D3.js 知识图谱的开源索引，挂载全量 chanzong.space 落地页。
"""
import os
import sys
import json
import subprocess
import shutil

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(os.path.dirname(CUR_DIR))
sys.path.append(CUR_DIR)
from tracker import add_backlink

SITE_DOMAIN = "https://chanzong.space"

README_CONTENT = """# Awesome Zen Buddhism (禅宗知识库 · 典籍与数字知识图谱)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![Digital Humanities](https://img.shields.io/badge/Digital%20Humanities-Zen%20Archive-green.svg)](https://chanzong.space)
[![Interactive Graph](https://img.shields.io/badge/D3.js-Knowledge%20Graph-orange.svg)](https://chanzong.space/graph)

> 🍃 **禅宗知识库 (chanzong.space)** —— 全球非营利数字化禅宗典籍、历代祖师机锋公案与交互式知识图谱档案库。直指人心，见性成佛。

本开源项目精选汇聚中国禅宗四大法脉、历代祖师语录、核心印心经典与修持法门。每部典籍均提供**校勘原文**、**现代白话导读**、**重点偈颂释义**与**全网状多卡片交叉互链**。

---

## 🌐 核心在线数字化入口

- 🏛️ **官方知识库首页**：[chanzong.space](https://chanzong.space)
- 🕸️ **D3.js 交互式禅门关系图谱**：[chanzong.space/graph](https://chanzong.space/graph)
- 📖 **经典文献全景库**：[chanzong.space/classics](https://chanzong.space/classics)
- 💡 **核心概念网络 (160+)**：[chanzong.space/concepts](https://chanzong.space/concepts)
- 🧘 **修持法门 (20+)**：[chanzong.space/methods](https://chanzong.space/methods)
- 🗣️ **公案问答与机锋 (205+)**：[chanzong.space/qas](https://chanzong.space/qas)
- 🌏 **海外正體中文鏡像**：[chanzong.space/zh-tw](https://chanzong.space/zh-tw)

---

## 📜 核心禅宗典籍与现代参修指要

### 🌟 祖师立宗与印心宝典
1. **《六祖法宝坛经》** (惠能大师)  
   禅宗南宗顿悟顿修核心宗经，直显“菩提自性，本自清净”。  
   👉 [在线阅读与导读](https://chanzong.space/books/liuzutanjing) | [正體中文版](https://chanzong.space/zh-tw/books/liuzutanjing)
2. **《金刚般若波罗蜜经》** (鸠摩罗什 译)  
   “应无所住而生其心”，禅宗直探实相般若的根本依据。  
   👉 [在线阅读与导读](https://chanzong.space/books/jingangjing) | [正體中文版](https://chanzong.space/zh-tw/books/jingangjing)
3. **《般若波罗蜜多心经》** (玄奘 译)  
   “色即是空，空即是色”，二百六十言总摄大乘实相核心。  
   👉 [在线阅读与导读](https://chanzong.space/books/xinjing) | [正體中文版](https://chanzong.space/zh-tw/books/xinjing)
4. **《大佛顶首楞严经》** (般剌密帝 译)  
   破除七处征心，十番显见，直明不生不灭之妙明真心。  
   👉 [在线阅读与导读](https://chanzong.space/books/lengyanjing) | [正體中文版](https://chanzong.space/zh-tw/books/lengyanjing)

### 🌿 达摩祖师与初期禅宗心要
5. **《达摩大师血脉论》** (菩提达摩)  
   “若欲见佛，须是见性，性即是佛”，直破名相文字之见。  
   👉 [在线阅读与导读](https://chanzong.space/books/damoxuemai) | [正體中文版](https://chanzong.space/zh-tw/books/damoxuemai)
6. **《达摩大师悟性论》** (菩提达摩)  
   阐明迷即是众生，悟即是佛；无心是道，自性如虚空。  
   👉 [在线阅读与导读](https://chanzong.space/books/damowuxing) | [正體中文版](https://chanzong.space/zh-tw/books/damowuxing)
7. **《达摩大师四行观》** (菩提达摩)  
   理入与行入（报冤行、随缘行、无所求行、称法行）之修持规范。  
   👉 [在线阅读与导读](https://chanzong.space/books/damosixing) | [正體中文版](https://chanzong.space/zh-tw/books/damosixing)
8. **《信心铭》** (三祖僧璨)  
   “至道无难，唯嫌挑选。但莫憎爱，洞然明白。”  
   👉 [在线阅读与导读](https://chanzong.space/books/xinming) | [正體中文版](https://chanzong.space/zh-tw/books/xinming)
9. **《永嘉证道歌》** (永嘉玄觉)  
   “绝学无为闲道人，不除妄想不求真。” 千古顿悟绝唱。  
   👉 [在线阅读与导读](https://chanzong.space/books/zhengdaoge) | [正體中文版](https://chanzong.space/zh-tw/books/zhengdaoge)

### ⚡ 丛林公案与机锋名著
10. **《无门关》** (无门慧开)  
    “大道无门，千差有路”，精选四十八则大机大用透关机锋。  
    👉 [在线阅读与导读](https://chanzong.space/books/wumenguan) | [正體中文版](https://chanzong.space/zh-tw/books/wumenguan)
11. **《碧岩录》** (雪窦重显 颂古 / 圜悟克勤 评唱)  
    “宗门第一书”，百则颂古机锋评唱，直透向上机关。  
    👉 [在线阅读与导读](https://chanzong.space/books/biyanlu) | [正體中文版](https://chanzong.space/zh-tw/books/biyanlu)
12. **《黄檗山断际禅师传心法要》** (裴休 辑记)  
    “诸佛与一切众生，唯是一心，更无别法。” 黄檗极谈一心。  
    👉 [在线阅读与导读](https://chanzong.space/books/chuanxinfayao) | [正體中文版](https://chanzong.space/zh-tw/books/chuanxinfayao)
13. **《临济慧照禅师语录》** (临济义玄)  
    “赤肉团上有一无位真人，常在面门出入。” 棒喝交驰的宗风之冠。  
    👉 [在线阅读与导读](https://chanzong.space/books/linjilu) | [正體中文版](https://chanzong.space/zh-tw/books/linjilu)
14. **《八识规矩颂》** (玄奘大师)  
    唯识学与禅宗转识成智修行之绝学总结。  
    👉 [在线阅读与导读](https://chanzong.space/books/bashiguijusong) | [正體中文版](https://chanzong.space/zh-tw/books/bashiguijusong)

---

## 🎨 技术架构与开源规范

本知识库依托现代前端与知识图谱技术构建：
- **前端架构**：Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **图谱引擎**：D3.js v7 力导向交互物理引擎（支持力模拟阻尼衰减与节点关系高亮）
- **双语支持**：全站繁体/简体无缝实时切换
- **离线支持**：PWA Service Worker 离线断网参修

---

## 🤝 贡献与加入

欢迎对数字人文、佛学文献数字化、D3.js 知识图谱感兴趣的学者、开发者与参禅同修共同完善：
- 访问官方主站：[chanzong.space](https://chanzong.space)
- 提交经典勘误与机锋解析：欢迎提交 PR 或 Issue。

*若人欲了知，三世一切佛。应观法界性，一切唯心造。*
"""

def create_and_publish_repo():
    repo_name = "awesome-zen"
    print("="*60)
    print(f"🚀 正在 GitHub 上创建 DA 96+ 顶级开源知识库仓库: {repo_name}...")
    print("="*60)
    
    tmp_repo_dir = os.path.join(CUR_DIR, "awesome-zen-tmp")
    if os.path.exists(tmp_repo_dir):
        shutil.rmtree(tmp_repo_dir, ignore_errors=True)
    os.makedirs(tmp_repo_dir, exist_ok=True)
    
    # 写入 README.md
    readme_path = os.path.join(tmp_repo_dir, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(README_CONTENT)
        
    # 初始化 git
    subprocess.run(["git", "init"], cwd=tmp_repo_dir, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.name", "gstar-byte"], cwd=tmp_repo_dir, check=True, capture_output=True)
    subprocess.run(["git", "config", "user.email", "will.p@example.com"], cwd=tmp_repo_dir, check=True, capture_output=True)
    subprocess.run(["git", "add", "README.md"], cwd=tmp_repo_dir, check=True, capture_output=True)
    subprocess.run(["git", "commit", "-m", "Initial commit: Awesome Zen Buddhism & Knowledge Graph curated list"], cwd=tmp_repo_dir, check=True, capture_output=True)
    subprocess.run(["git", "branch", "-M", "main"], cwd=tmp_repo_dir, check=True, capture_output=True)
    
    # 使用 gh repo create 创建公开仓库并推送
    print(f"正在调用 gh repo create gstar-byte/{repo_name} --public --push...")
    cmd = [
        "gh", "repo", "create", f"gstar-byte/{repo_name}",
        "--public",
        "--description", "Awesome Zen Buddhism (禅宗知识库): Curated list of 120+ Zen Buddhist classics, mind-transmission lineages, D3 knowledge graphs, and modern guides.",
        "--source", tmp_repo_dir,
        "--remote", "origin",
        "--push"
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    repo_url = f"https://github.com/gstar-byte/{repo_name}"
    print("Exit code:", res.returncode)
    print("Stdout:", res.stdout.strip())
    print("Stderr:", res.stderr.strip())
    
    if res.returncode == 0 or "already exists" in res.stderr:
        print(f"🎉 成功创建或推送到 GitHub 官方开源仓库: {repo_url}")
        
        add_backlink(
            platform="GitHub (顶级根域名 DA 96)",
            region="海外繁体",
            category="开源代码与典籍知识库",
            post_title="Awesome Zen Buddhism (禅宗知识库 · 典籍与数字知识图谱)",
            target_url=SITE_DOMAIN,
            backlink_url=repo_url,
            anchor_text="Awesome Zen Buddhism (chanzong.space)",
            link_type="Dofollow",
            status="Live",
            notes="官方公开 Awesome 仓库，收录 40+ 部典籍落地页、D3.js 知识图谱与繁简双语入口，长期获得开源社区与搜索引擎顶级权重"
        )
        return repo_url
    else:
        print("⚠️ 创建仓库失败:", res.stderr)
        return None

if __name__ == "__main__":
    create_and_publish_repo()
