import json
import re
import glob
import os
from collections import defaultdict

def main():
    # 1. 读取 manifest.json
    with open('F:/chanzong.space/manifest.json', encoding='utf-8') as f:
        manifest = json.load(f)

    wxl_manifest = [item for item in manifest if 168 <= item.get('idx', 0) <= 196]
    print(f"1. Manifest 中王骧陆经典数量: {len(wxl_manifest)} 册 (编号 168 到 196)")

    # 2. 读取 translations.ts
    tr_counts = defaultdict(int)
    with open('F:/chanzong.space/lib/translations.ts', encoding='utf-8') as f:
        tr_txt = f.read()
    for item in wxl_manifest:
        bid = item['id']
        m = re.search(r"(?:['\"]?" + bid + r"['\"]?)\s*:\s*\[([\s\S]*?)\]\s*,", tr_txt)
        if m:
            paras = re.findall(r"(?:\"[^\"]*\"|'[^']*'|`[^`]*`)\s*,?", m.group(1))
            tr_counts[bid] = len(paras)

    # 3. 读取 glossary.ts
    gl_counts = defaultdict(int)
    with open('F:/chanzong.space/lib/glossary.ts', encoding='utf-8') as f:
        gl_txt = f.read()
    for item in wxl_manifest:
        bid = item['id']
        m = re.search(r"(?:['\"]?" + bid + r"['\"]?)\s*:\s*\[([\s\S]*?)\]\s*,", gl_txt)
        if m:
            items = re.findall(r"\{\s*(?:word|char):", m.group(1))
            gl_counts[bid] = len(items)

    # 4. 读取 koans.ts 与 faqs.ts
    koan_counts = defaultdict(int)
    with open('F:/chanzong.space/lib/taxonomy/koans.ts', encoding='utf-8') as f:
        ktxt = f.read()
    for item in wxl_manifest:
        bid = item['id']
        koan_counts[bid] = len(re.findall(r"['\"]" + bid + r"['\"]", ktxt))

    faq_counts = defaultdict(int)
    with open('F:/chanzong.space/lib/taxonomy/faqs.ts', encoding='utf-8') as f:
        ftxt = f.read()
    for item in wxl_manifest:
        bid = item['id']
        faq_counts[bid] = len(re.findall(r"['\"]" + bid + r"['\"]", ftxt))

    # 5. 校验 29 册 Markdown 统一模板
    standard_headers = [
        ('meta', '元数据头(作者/分类/字数)', r'>\s*\*\*作者\*\*.*?\*\*分类\*\*.*?\*\*字数\*\*'),
        ('link', '🔗 经典连线', r'🔗\s*经典连线'),
        ('guide', '💡 现代白话导读与核心旨趣', r'##\s*💡\s*现代白话导读与核心旨趣'),
        ('keywords', '📌 关键词', r'##\s*📌\s*关键词'),
        ('gist', '🎯 主旨', r'##\s*🎯\s*主旨'),
        ('points', '📖 重点内容', r'##\s*📖\s*重点内容'),
        ('difficulty', '⚠️ 阅读难点', r'##\s*⚠️\s*阅读难点'),
        ('quotes', '🗣️ 名句白话解读', r'##\s*🗣️\s*名句白话解读'),
        ('text', '📜 典籍原文', r'##\s*📜\s*典籍原文'),
    ]

    print("\n2. 全套 29 册原典解读与全站统一模板逐册对账表：")
    print(f"{'序号':<4} | {'ID':<20} | {'书名':<18} | {'字数':<6} | {'8大板块':<8} | {'名句数':<5} | {'白话精译':<6} | {'词汇注音':<6} | {'公案':<4} | {'FAQ':<5} | {'模板合规'}")
    print("-" * 115)

    all_passed = True
    for item in wxl_manifest:
        idx = item['idx']
        bid = item['id']
        title = item['title']
        words = item['word_count']
        files = glob.glob(f"F:/chanzong.space/classics_markdown/{idx}_*.md")
        if not files:
            print(f"{idx:<4} | {bid:<20} | {title:<18} | MISSING MARKDOWN FILE!")
            all_passed = False
            continue

        c = open(files[0], encoding='utf-8').read()
        missing_headers = []
        for key, name, pat in standard_headers:
            if not re.search(pat, c):
                missing_headers.append(name)

        q_matches = re.findall(r"-\s*\*\*“[^”]+”\*\*", c)
        q_cnt = len(q_matches)
        tr_cnt = tr_counts[bid]
        gl_cnt = gl_counts[bid]
        k_cnt = koan_counts[bid]
        f_cnt = faq_counts[bid]

        is_ok = (len(missing_headers) == 0) and (q_cnt >= 1) and (tr_cnt >= 4) and (gl_cnt >= 4) and (f_cnt >= 5)
        if not is_ok:
            all_passed = False

        status_str = "✅ 100% 合规" if is_ok else f"❌ 缺失: {','.join(missing_headers)}"
        print(f"#{idx:<3} | {bid:<20} | {title:<18} | {words:<6} | {'全齐' if not missing_headers else '残缺':<8} | {q_cnt:<5} | {tr_cnt:<6} | {gl_cnt:<6} | {k_cnt:<4} | {f_cnt:<5} | {status_str}")

    print("-" * 115)
    print(f"3. 总体核验结论: {'全部 29 册 100% 达成全站统一模板解读！' if all_passed else '存在不合规册目，详见上表'}")

if __name__ == '__main__':
    main()
