import json
import re
from pathlib import Path

# 读取manifest
with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# 读取taxonomy
with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    taxonomy = f.read()

# 提取各数组
def extract_array(content, start_marker, end_marker):
    start = content.find(start_marker)
    end = content.find(end_marker)
    return content[start:end] if start != -1 and end != -1 else ''

persons_section = extract_array(taxonomy, 'export const ZEN_PERSONS', 'export const ZEN_CONCEPTS')
concepts_section = extract_array(taxonomy, 'export const ZEN_CONCEPTS', 'export const ZEN_METHODS')
methods_section = extract_array(taxonomy, 'export const ZEN_METHODS', 'export const ZEN_KOANS')
koans_section = extract_array(taxonomy, 'export const ZEN_KOANS', 'export interface FAQItem')

# 解析JSON对象（简化处理）
def extract_items(section, item_type):
    items = []
    # 匹配 {"id": "xxx", ... "relatedBooks": [...]}
    pattern = r'\{[^{}]*"id":\s*"([^"]+)"[^{}]*"relatedBooks":\s*\[([^\]]*)\][^{}]*\}'
    matches = re.findall(pattern, section, re.DOTALL)
    for match in matches:
        item_id = match[0]
        books_str = match[1]
        books = re.findall(r'"([^"]+)"', books_str)
        items.append({'id': item_id, 'relatedBooks': books})
    return items

persons = extract_items(persons_section, 'person')
concepts = extract_items(concepts_section, 'concept')
methods = extract_items(methods_section, 'method')
koans = extract_items(koans_section, 'koan')

print(f'解析到: {len(persons)}个人物, {len(concepts)}个概念, {len(methods)}个法门, {len(koans)}则公案')
print()

# 检查每部经典的关联真实性
report = []

for book in manifest:
    book_id = book['id']
    book_title = book['title']
    
    # 读取经典原文
    md_file = Path(f'classics_markdown/{book["filename"]}')
    if not md_file.exists():
        continue
    
    with open(md_file, 'r', encoding='utf-8') as f:
        classic_text = f.read()
    
    # 检查人物关联
    false_persons = []
    for p in persons:
        if book_id in p['relatedBooks']:
            # 检查人物名是否在经典中出现
            person_name = p['id']
            # 尝试从taxonomy中找到人物name
            name_match = re.search(rf'"id":\s*"{person_name}"[^{{}}]*"name":\s*"([^"]+)"', persons_section, re.DOTALL)
            if name_match:
                actual_name = name_match.group(1)
                if actual_name not in classic_text and person_name not in classic_text:
                    false_persons.append((person_name, actual_name))
    
    # 检查概念关联（概念ID通常包含关键词）
    false_concepts = []
    for c in concepts:
        if book_id in c['relatedBooks']:
            concept_id = c['id']
            # 检查概念关键词是否在经典中
            # 从taxonomy中获取概念title
            title_match = re.search(rf'"id":\s*"{concept_id}"[^{{}}]*"title":\s*"([^"]+)"', concepts_section, re.DOTALL)
            if title_match:
                concept_title = title_match.group(1)
                # 提取关键词（去除常见词）
                keywords = [w for w in re.split(r'[，。、\s]+', concept_title) if len(w) >= 2]
                found = any(kw in classic_text for kw in keywords)
                if not found:
                    false_concepts.append((concept_id, concept_title))
    
    # 检查法门关联
    false_methods = []
    for m in methods:
        if book_id in m['relatedBooks']:
            method_id = m['id']
            title_match = re.search(rf'"id":\s*"{method_id}"[^{{}}]*"title":\s*"([^"]+)"', methods_section, re.DOTALL)
            if title_match:
                method_title = title_match.group(1)
                keywords = [w for w in re.split(r'[，。、\s]+', method_title) if len(w) >= 2]
                found = any(kw in classic_text for kw in keywords)
                if not found:
                    false_methods.append((method_id, method_title))
    
    # 检查公案关联（公案通常有特定标识）
    false_koans = []
    for k in koans:
        if book_id in k['relatedBooks']:
            koan_id = k['id']
            # 公案通常以问答形式出现，检查是否有相关对话
            # 这里简化处理，检查公案id对应的内容是否在经典中
            pass  # 公案较难自动验证，需要人工审核
    
    if false_persons or false_concepts or false_methods:
        report.append({
            'book_id': book_id,
            'title': book_title,
            'false_persons': false_persons,
            'false_concepts': false_concepts,
            'false_methods': false_methods
        })

# 输出报告
print('=' * 80)
print('瞎关联检测报告')
print('=' * 80)
print()

total_issues = 0
for item in report:
    print(f"经典: {item['title']} ({item['book_id']})")
    if item['false_persons']:
        print(f"  ✗ 虚假人物关联: {len(item['false_persons'])}个")
        for pid, name in item['false_persons']:
            print(f"    - {name} ({pid})")
    if item['false_concepts']:
        print(f"  ✗ 虚假概念关联: {len(item['false_concepts'])}个")
        for cid, title in item['false_concepts'][:5]:  # 只显示前5个
            print(f"    - {title} ({cid})")
        if len(item['false_concepts']) > 5:
            print(f"    ... 等{len(item['false_concepts'])}个")
    if item['false_methods']:
        print(f"  ✗ 虚假法门关联: {len(item['false_methods'])}个")
        for mid, title in item['false_methods']:
            print(f"    - {title} ({mid})")
    print()
    total_issues += len(item['false_persons']) + len(item['false_concepts']) + len(item['false_methods'])

print('=' * 80)
print(f'总计发现 {len(report)} 部经典存在瞎关联，共 {total_issues} 处问题')
print('=' * 80)

# 保存详细报告
with open('false_associations_report.txt', 'w', encoding='utf-8') as f:
    f.write('瞎关联详细报告\n')
    f.write('=' * 80 + '\n\n')
    for item in report:
        f.write(f"经典: {item['title']} ({item['book_id']})\n")
        if item['false_persons']:
            f.write(f"虚假人物: {', '.join([p[1] for p in item['false_persons']])}\n")
        if item['false_concepts']:
            f.write(f"虚假概念: {', '.join([c[1] for c in item['false_concepts']])}\n")
        if item['false_methods']:
            f.write(f"虚假法门: {', '.join([m[1] for m in item['false_methods']])}\n")
        f.write('\n')

print('详细报告已保存至 false_associations_report.txt')
