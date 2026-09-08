# -*- coding: utf-8 -*-
"""
清洗 Markdown 符号为知乎纯正自然排版
去除 ###、**、--- 等裸露标记，转换为自然中文标题序号与段落，彻底消除 Bot 痕迹
"""
import os
import sys
import re

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def clean_markdown_for_zhihu(text: str) -> str:
    lines = text.split("\n")
    cleaned_lines = []
    
    for line in lines:
        l = line.strip()
        # 处理分割线
        if l in ["---", "===", "***"]:
            cleaned_lines.append("")
            continue
            
        # 处理标题 ###、##、#
        if l.startswith("#"):
            title_text = re.sub(r"^#+\s*", "", l).strip()
            # 转换为自然的中文块标题
            cleaned_lines.append(f"【{title_text}】")
            continue
            
        # 处理引用块 >
        if l.startswith(">"):
            quote_text = re.sub(r"^>\s*", "", l).strip()
            cleaned_lines.append(f"「{quote_text}」")
            continue
            
        # 处理加粗 **text** -> text
        l = re.sub(r"\*\*(.*?)\*\*", r"\1", l)
        
        # 处理链接 [text](url) -> text (url) 或直接保留 url
        # 知乎编辑器会自动把 http:// 或 https:// 识别为超链接卡片
        l = re.sub(r"\[(.*?)\]\((https?://.*?)\)", r"\1：\2", l)
        
        cleaned_lines.append(l)
        
    res = "\n".join(cleaned_lines)
    # 消除过多连续换行
    res = re.sub(r"\n{3,}", "\n\n", res)
    return res.strip()

if __name__ == "__main__":
    sample = """### 一、 没读过佛经，为什么反而是读《六祖坛经》的优势？

**自性本自清净，直下承当即是。**

> “诸佛妙理，非关文字。”

- 📖 **《六祖坛经》全文现代白话导读**：[六祖坛经专页](https://chanzong.space/classics/tanjing)
---
"""
    print("=== 清洗前 ===")
    print(sample)
    print("=== 清洗后 ===")
    print(clean_markdown_for_zhihu(sample))
