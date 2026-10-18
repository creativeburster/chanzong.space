# -*- coding: utf-8 -*-
"""
小红书 3:4 高清禅意宣纸风图文卡片生成器
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def get_font(font_name="msyh.ttc", size=40):
    paths = [
        f"C:/Windows/Fonts/{font_name}",
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/simsun.ttc"
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_zen_card(classic_name: str, quote: str, explanation: str, output_path: str):
    # 3:4 标准高保真竖图
    width, height = 1080, 1440
    # 温润宣纸色
    bg_color = (247, 245, 240)
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # 绘制外层细边框 (禅意雅致)
    draw.rectangle([40, 40, width - 40, height - 40], outline=(215, 210, 198), width=2)
    draw.rectangle([48, 48, width - 48, height - 48], outline=(230, 225, 215), width=1)
    
    # 1. 顶部眉题
    font_tag = get_font("msyh.ttc", 32)
    tag_text = f"—— 禅 宗 智 慧 日 课 · 《{classic_name}》 ——"
    bbox = draw.textbbox((0, 0), tag_text, font=font_tag)
    tag_w = bbox[2] - bbox[0]
    draw.text(((width - tag_w) / 2, 120), tag_text, fill=(140, 130, 115), font=font_tag)
    
    # 2. 核心金句大字
    font_quote = get_font("simhei.ttf", 64)
    # 按行分段
    quote_lines = quote.split("\n")
    cur_y = 260
    for line in quote_lines:
        line_clean = line.strip()
        if not line_clean:
            continue
        bbox = draw.textbbox((0, 0), line_clean, font=font_quote)
        lw = bbox[2] - bbox[0]
        draw.text(((width - lw) / 2, cur_y), line_clean, fill=(35, 30, 25), font=font_quote)
        cur_y += 100
        
    # 分割雅线
    cur_y += 30
    draw.line([(width - 240) / 2, cur_y, (width + 240) / 2, cur_y], fill=(180, 160, 130), width=3)
    cur_y += 60
    
    # 3. 白话心要阐释 (按字符换行)
    font_exp = get_font("msyh.ttc", 36)
    max_line_width = 820
    exp_lines = []
    paragraphs = explanation.split("\n")
    for p in paragraphs:
        p_clean = p.strip()
        if not p_clean:
            exp_lines.append("")
            continue
        cur_line = ""
        for char in p_clean:
            test_line = cur_line + char
            bbox = draw.textbbox((0, 0), test_line, font=font_exp)
            if (bbox[2] - bbox[0]) > max_line_width:
                exp_lines.append(cur_line)
                cur_line = char
            else:
                cur_line = test_line
        if cur_line:
            exp_lines.append(cur_line)
            
    for l in exp_lines:
        if not l:
            cur_y += 24
            continue
        bbox = draw.textbbox((0, 0), l, font=font_exp)
        lw = bbox[2] - bbox[0]
        draw.text(((width - lw) / 2, cur_y), l, fill=(70, 65, 55), font=font_exp)
        cur_y += 62
        
    # 4. 底部印章与品牌出处
    font_bottom_brand = get_font("msyh.ttc", 34)
    brand_text = "禅宗知识库 · chanzong.space"
    bbox = draw.textbbox((0, 0), brand_text, font=font_bottom_brand)
    bw = bbox[2] - bbox[0]
    draw.text(((width - bw) / 2, height - 160), brand_text, fill=(168, 75, 60), font=font_bottom_brand)
    
    font_sub = get_font("msyh.ttc", 26)
    sub_text = "全球非营利数字化禅门典籍与知识图谱"
    bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = bbox[2] - bbox[0]
    draw.text(((width - sw) / 2, height - 110), sub_text, fill=(150, 140, 125), font=font_sub)
    
    # 保存图片
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    img.save(output_path, quality=95)
    print(f"✅ 禅意卡片生成成功: {output_path}")
    return output_path

if __name__ == "__main__":
    classic = "六祖大师法宝坛经"
    q = "菩提本无树，明镜亦非台。\n本来无一物，何处惹尘埃。"
    exp = """六祖惠能大师这一首千古偈颂，直指人心。\n世人之所以有无尽的焦虑、迷茫与内耗，正是因为执着于身外的虚名浮利，把无常假相误当成真实的自我。\n自性本自清净，本不生灭，本自具足。\n遇到困扰与逆境时，向内观照自己的本心：本来无一物，烦恼从何处安立？万般放下，当下便是清凉自在。"""
    out = "tools/backlinks/xhs_cards/card_tanjing.png"
    create_zen_card(classic, q, exp, out)
