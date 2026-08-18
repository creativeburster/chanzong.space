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
persons_section = taxonomy[taxonomy.find('export const ZEN_PERSONS'):taxonomy.find('export const ZEN_CONCEPTS')]
concepts_section = taxonomy[taxonomy.find('export const ZEN_CONCEPTS'):taxonomy.find('export const ZEN_METHODS')]
methods_section = taxonomy[taxonomy.find('export const ZEN_METHODS'):taxonomy.find('export const ZEN_KOANS')]

# 解析JSON对象
def extract_items(section):
    items = []
    pattern = r'\{[^{}]*"id":\s*"([^"]+)"[^{}]*"relatedBooks":\s*\[([^\]]*)\][^{}]*\}'
    matches = re.findall(pattern, section, re.DOTALL)
    for match in matches:
        item_id = match[0]
        books_str = match[1]
        books = re.findall(r'"([^"]+)"', books_str)
        items.append({'id': item_id, 'relatedBooks': books})
    return items

persons = extract_items(persons_section)
concepts = extract_items(concepts_section)
methods = extract_items(methods_section)

# 生成审核报告
report_lines = []
report_lines.append('=' * 100)
report_lines.append('瞎关联审核报告 - 待确认修复')
report_lines.append('=' * 100)
report_lines.append('')
report_lines.append('说明：以下列出的关联疑似错误，请审核确认后修复')
report_lines.append('修复方式：从条目的 relatedBooks 中移除该经典ID，不删除条目本身')
report_lines.append('')

issue_count = 0

for book in manifest:
    book_id = book['id']
    book_title = book['title']
    filename = book['filename']
    
    # 读取经典原文
    md_file = Path(f'classics_markdown/{filename}')
    if not md_file.exists():
        continue
    
    with open(md_file, 'r', encoding='utf-8') as f:
        classic_text = f.read()
    
    issues = []
    
    # 检查人物
    for p in persons:
        if book_id in p['relatedBooks']:
            # 获取人物名称
            name_match = re.search(rf'"id":\s*"{p["id"]}"[^{{}}]*"name":\s*"([^"]+)"', persons_section, re.DOTALL)
            if name_match:
                person_name = name_match.group(1)
                # 检查是否在经典中出现
                if person_name not in classic_text:
                    issues.append({
                        'type': '人物',
                        'id': p['id'],
                        'name': person_name,
                        'reason': f'经典中未出现"{person_name}"'
                    })
    
    # 检查概念
    for c in concepts:
        if book_id in c['relatedBooks']:
            title_match = re.search(rf'"id":\s*"{c["id"]}"[^{{}}]*"title":\s*"([^"]+)"', concepts_section, re.DOTALL)
            if title_match:
                concept_title = title_match.group(1)
                # 检查概念关键词是否在经典中
                keywords = [w for w in re.split(r'[，。、\s（）()]+', concept_title) if len(w) >= 2]
                if keywords and not any(kw in classic_text for kw in keywords):
                    issues.append({
                        'type': '概念',
                        'id': c['id'],
                        'name': concept_title,
                        'reason': f'经典中未出现"{concept_title}"相关内容'
                    })
    
    # 检查法门
    for m in methods:
        if book_id in m['relatedBooks']:
            title_match = re.search(rf'"id":\s*"{m["id"]}"[^{{}}]*"title":\s*"([^"]+)"', methods_section, re.DOTALL)
            if title_match:
                method_title = title_match.group(1)
                keywords = [w for w in re.split(r'[，。、\s（）()]+', method_title) if len(w) >= 2]
                if keywords and not any(kw in classic_text for kw in keywords):
                    issues.append({
                        'type': '法门',
                        'id': m['id'],
                        'name': method_title,
                        'reason': f'经典中未教导"{method_title}"'
                    })
    
    if issues:
        report_lines.append(f'【{book_title}】({book_id})')
        report_lines.append('-' * 100)
        for issue in issues:
            report_lines.append(f'  类型: {issue["type"]}')
            report_lines.append(f'  ID: {issue["id"]}')
            report_lines.append(f'  名称: {issue["name"]}')
            report_lines.append(f'  问题: {issue["reason"]}')
            report_lines.append(f'  操作: 从 relatedBooks 中移除 "{book_id}"')
            report_lines.append('')
            issue_count += 1

report_lines.append('=' * 100)
report_lines.append(f'总计: {issue_count} 处疑似错误关联待审核')
report_lines.append('=' * 100)

# 保存报告
report_text = '\n'.join(report_lines)
with open('审核报告_待确认.txt', 'w', encoding='utf-8') as f:
    f.write(report_text)

print(f'审核报告已生成: 审核报告_待确认.txt')
print(f'总计 {issue_count} 处疑似错误关联')
print()
print('请审核报告内容，确认无误后我再执行修复')
