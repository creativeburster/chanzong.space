#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
禅宗知识库 (chanzong.space) - 经典发布前严格质量门禁检测工具
============================================================
在发布任何经典或 git push 之前运行此脚本。
若存在任何硬性问题（Exit code != 0），严禁提交或发布！

检查维度：
1. CBETA 版权块与分卷标记残留检测（零容忍）
2. 原文繁体字密度检测（要求 < 5‰）
3. Markdown 8 大必需结构完整性
4. manifest.json 登记与纯汉字 CJK 计数吻合度（偏差要求 < 3%）
5. 经典双向连线有效性（目标必须在 manifest 中存在）
6. translations.ts 白话今译存在且规范
7. glossary.ts 生僻字词释义存在且规范
8. taxonomy.ts 关联实体闭环与零悬空 ID
9. 底本缺字符号（□）规范注释检查
"""

import sys
import os
import re
import json
import opencc

# Ensure UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

cc_t2s = opencc.OpenCC('t2s')

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_text(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def check_classic(classic_id, manifest_item, all_manifest_ids, all_tax_ids, tax_text, trans_text, gloss_text):
    errors = []
    warnings = []
    
    filename = manifest_item.get('filename') or f"{manifest_item['idx']}_{classic_id}.md"
    md_path = os.path.join('classics_markdown', filename)
    
    if not os.path.exists(md_path):
        return [f"Markdown 文件不存在: {md_path}"], []
        
    md_content = load_text(md_path)
    
    # 1. CBETA 版权头与残余标记检测
    cbeta_patterns = [
        (r'#【经文资讯】|#【經文資訊】', '发现 CBETA 经文资讯版权头'),
        (r'财团法人佛教电子佛典基金会|財團法人佛教電子佛典基金會', '发现 CBETA 基金会版权文字'),
        (r'#-{10,}', '发现 CBETA 头部/尾部分隔虚线'),
        (r'No\.\s*\d+-[A-Z]', '发现 CBETA 分卷/目录标记 (如 No. 1391-B)'),
        (r'\[\d+[a-z]\d+\]', '发现 CBETA 行号标记 (如 [0945a01])'),
    ]
    for pattern, desc in cbeta_patterns:
        matches = list(re.finditer(pattern, md_content))
        if matches:
            errors.append(f"[CBETA残留] {desc} 共 {len(matches)} 处，首处在位置 {matches[0].start()}")
            
    # 2. Markdown 8 大必需结构检测
    required_sections = [
        ('现代白话导读与核心旨趣', '💡 现代白话导读与核心旨趣'),
        ('关键词', '📌 关键词'),
        ('主旨', '🎯 主旨'),
        ('重点内容', '📖 重点内容'),
        ('阅读难点', '⚠️ 阅读难点'),
        ('名句白话解读', '🗣️ 名句白话解读'),
        ('典籍原文', '📜 典籍原文'),
        ('经典连线', '🔗 经典连线'),
    ]
    for sec_name, sec_marker in required_sections:
        if sec_marker not in md_content and sec_name not in md_content:
            errors.append(f"[结构缺失] 缺少必需章节: {sec_marker}")
            
    # 3. 原文繁体字密度检测
    orig_marker = '## 📜 典籍原文'
    orig_idx = md_content.find(orig_marker)
    if orig_idx != -1:
        orig_text = md_content[orig_idx + len(orig_marker):]
        cjk_chars = re.findall(r'[\u4e00-\u9fa5]', orig_text)
        total_cjk = len(cjk_chars)
        
        if total_cjk > 0:
            converted = cc_t2s.convert(orig_text)
            diff_count = 0
            for c1, c2 in zip(orig_text, converted):
                if c1 != c2 and re.match(r'[\u4e00-\u9fa5]', c1):
                    diff_count += 1
            rate = (diff_count / total_cjk) * 1000
            if rate > 5.0:
                errors.append(f"[繁体超标] 原文繁体字密度 {rate:.1f}‰ (上限 5.0‰)，共 {diff_count} 个繁体字未转换！需执行 OpenCC t2s！")
                
            # 4. 字数与 manifest 口径吻合检测
            manifest_words = manifest_item.get('word_count', 0)
            if manifest_words > 0:
                diff_percent = abs(total_cjk - manifest_words) / manifest_words * 100
                if diff_percent > 3.0:
                    errors.append(f"[字数偏差] manifest 登记 {manifest_words} 字，实际原文纯汉字 {total_cjk} 字，偏差 {diff_percent:.1f}% (上限 3.0%)！")
        else:
            errors.append("[原文为空] 未提取到典籍原文汉字内容！")
    else:
        errors.append("[原文缺失] 未找到 '## 📜 典籍原文' 标记！")
        
    # 5. 经典连线有效性检测
    link_matches = re.findall(r'\[([^\]]+)\]\(/classics/([^\)]+)\)', md_content)
    if not link_matches:
        errors.append("[连线缺失] 未找到任何有效经典超链接！")
    else:
        for title, rid in link_matches:
            if rid not in all_manifest_ids:
                errors.append(f"[悬空连线] 经典连线指向不存在的经典 ID: '{rid}' ({title})")
                
    # 6. translations.ts 检测
    if not re.search(rf'[\'"]?{re.escape(classic_id)}[\'"]?\s*:', trans_text):
        errors.append(f"[译文缺失] lib/translations.ts 中未找到 '{classic_id}' 的译文条目！")
        
    # 7. glossary.ts 检测
    if not re.search(rf'[\'"]?{re.escape(classic_id)}[\'"]?\s*:', gloss_text):
        errors.append(f"[注音缺失] lib/glossary.ts 中未找到 '{classic_id}' 的生僻字注音条目！")
        
    # 8. taxonomy.ts 关联实体闭环检测
    # 查找所有以当前 classic_id 为 relatedBooks 的实体
    blocks = tax_text.split('\n  {\n')
    for b in blocks:
        if f'"{classic_id}"' in b or f"'{classic_id}'" in b:
            # Check relatedPersons
            rp_match = re.search(r'"relatedPersons":\s*\[([^\]]*)\]', b)
            if rp_match:
                for p in re.findall(r'"([^"]+)"', rp_match.group(1)):
                    if p not in all_tax_ids['persons']:
                        errors.append(f"[实体悬空] 关联实体引用了不存在的人物 ID: '{p}'")
            # Check relatedConcepts
            rc_match = re.search(r'"relatedConcepts":\s*\[([^\]]*)\]', b)
            if rc_match:
                for c in re.findall(r'"([^"]+)"', rc_match.group(1)):
                    if c not in all_tax_ids['concepts']:
                        errors.append(f"[实体悬空] 关联实体引用了不存在的概念 ID: '{c}'")
            # Check relatedMethods
            rm_match = re.search(r'"relatedMethods":\s*\[([^\]]*)\]', b)
            if rm_match:
                for m in re.findall(r'"([^"]+)"', rm_match.group(1)):
                    if m not in all_tax_ids['methods']:
                        errors.append(f"[实体悬空] 关联实体引用了不存在的法门 ID: '{m}'")
            # Check relatedQa
            qa_match = re.search(r'"relatedQa":\s*"([^"]+)"', b)
            if qa_match:
                qa = qa_match.group(1)
                if qa not in all_tax_ids['koans']:
                    errors.append(f"[实体悬空] FAQ 引用了不存在的公案 ID: '{qa}'")

    # 9. 底本缺字注检测
    if '□' in md_content:
        unannotated = re.findall(r'[^（\[]□[^）\]]', md_content)
        if unannotated:
            warnings.append(f"[底本注提示] 正文包含 {len(unannotated)} 处未加括号注释的缺字符号 '□'，建议加上底本缺字注。")

    return errors, warnings

def get_taxonomy_ids(tax_text):
    def extract_ids(marker_start, marker_end):
        s = tax_text.find(marker_start)
        e = tax_text.find(marker_end)
        sub = tax_text[s:e] if e != -1 else tax_text[s:]
        return set(re.findall(r'"id":\s*"([^"]+)"', sub))
        
    person_ids = extract_ids('export const ZEN_PERSONS', 'export const ZEN_CONCEPTS')
    concept_ids = extract_ids('export const ZEN_CONCEPTS', 'export const ZEN_METHODS')
    method_ids = extract_ids('export const ZEN_METHODS', 'export const ZEN_KOANS')
    koan_ids = extract_ids('export const ZEN_KOANS', 'const ZEN_FAQS_PART1')
    
    return {
        'persons': person_ids,
        'concepts': concept_ids,
        'methods': method_ids,
        'koans': koan_ids
    }

def main():
    manifest = load_json('manifest.json')
    all_manifest_ids = set(m['id'] for m in manifest)
    tax_text = load_text('lib/taxonomy.ts')
    trans_text = load_text('lib/translations.ts')
    gloss_text = load_text('lib/glossary.ts')
    all_tax_ids = get_taxonomy_ids(tax_text)
    
    print("=" * 70)
    print("[CHECK] 禅宗知识库 (chanzong.space) - 发布前质量门禁深度核查")
    print("=" * 70)
    print(f"[OK] 基础图谱规模：{len(all_manifest_ids)} 经典、{len(all_tax_ids['persons'])} 人物、{len(all_tax_ids['concepts'])} 概念、{len(all_tax_ids['methods'])} 法门、{len(all_tax_ids['koans'])} 公案")

    # 确定检查范围
    args = sys.argv[1:]
    target_items = []
    
    if '--all' in args:
        target_items = manifest
        print(f"[INFO] 执行全量经典核验 (共 {len(target_items)} 部)...")
    elif args:
        target_id = args[0]
        item = next((m for m in manifest if m['id'] == target_id), None)
        if not item:
            print(f"[ERROR] 未在 manifest.json 中找到经典 ID: '{target_id}'")
            sys.exit(1)
        target_items = [item]
        print(f"[INFO] 执行单部经典核验: #{item['idx']} {item['title']} ({target_id})...")
    else:
        # 默认检查最新发布的 10 部 (例如 141-150)
        target_items = manifest[-10:] if len(manifest) >= 10 else manifest
        print(f"[INFO] 默认执行最新批次核验 (最近 {len(target_items)} 部经典，从 #{target_items[0]['idx']} 到 #{target_items[-1]['idx']})...")

    print("-" * 70)
    
    total_errors = 0
    total_warnings = 0
    
    for item in target_items:
        cid = item['id']
        errs, warns = check_classic(cid, item, all_manifest_ids, all_tax_ids, tax_text, trans_text, gloss_text)
        
        if errs:
            print(f"[FAIL] #{item['idx']:03d} 《{item['title']}》({cid}):")
            for e in errs:
                print(f"   [ERROR] {e}")
            total_errors += len(errs)
        elif warns:
            print(f"[WARN] #{item['idx']:03d} 《{item['title']}》({cid}):")
            for w in warns:
                print(f"   [WARN] {w}")
            total_warnings += len(warns)
        else:
            print(f"[PASS] #{item['idx']:03d} 《{item['title']}》({cid}) - 全部指标满分通过")

    print("=" * 70)
    if total_errors > 0:
        print(f"[RESULT] 门禁拦截：共发现 {total_errors} 个严重错误！请彻底修复后再提交！")
        sys.exit(1)
    else:
        print(f"[RESULT] 门禁通过！核验的 {len(target_items)} 部经典全部指标 100% 满分合格，零缺陷！准予 Git Commit 与生产发布！")
        sys.exit(0)

if __name__ == '__main__':
    main()
