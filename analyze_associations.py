import json
import re
import sys
from pathlib import Path

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar_length = 50
    filled = int(bar_length * current // total)
    bar = '█' * filled + '░' * (bar_length - filled)
    print(f'\r{prefix} |{bar}| {percent:.1f}% ({current}/{total})', end='', flush=True)

print('正在分析关联情况...')
print()

# 读取数据
with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    taxonomy = f.read()

# 提取各数组
persons_section = taxonomy[taxonomy.find('export const ZEN_PERSONS'):taxonomy.find('export const ZEN_CONCEPTS')]
concepts_section = taxonomy[taxonomy.find('export const ZEN_CONCEPTS'):taxonomy.find('export const ZEN_METHODS')]
methods_section = taxonomy[taxonomy.find('export const ZEN_METHODS'):taxonomy.find('export const ZEN_KOANS')]

def extract_items(section):
    items = []
    pattern = r'\{[^{}]*"id":\s*"([^"]+)"[^{}]*"relatedBooks":\s*\[([^\]]*)\][^{}]*\}'
    matches = re.findall(pattern, section, re.DOTALL)
    for match in matches:
        items.append({'id': match[0], 'relatedBooks': re.findall(r'"([^"]+)"', match[1])})
    return items

persons = extract_items(persons_section)
concepts = extract_items(concepts_section)
methods = extract_items(methods_section)

print(f'共 {len(persons)} 个人物, {len(concepts)} 个概念, {len(methods)} 个法门')
print()

# 分析每部经典
results = []
total_books = len(manifest)

for idx, book in enumerate(manifest):
    book_id = book['id']
    book_title = book['title']
    filename = book['filename']
    
    print_progress(idx + 1, total_books, f'检查: {book_title[:20]}')
    
    md_file = Path(f'classics_markdown/{filename}')
    if not md_file.exists():
        continue
    
    with open(md_file, 'r', encoding='utf-8') as f:
        classic_text = f.read()
    
    # 检查各类型的错误关联和正确关联
    book_result = {
        'id': book_id,
        'title': book_title,
        'persons': {'wrong': [], 'correct': [], 'empty_after': []},
        'concepts': {'wrong': [], 'correct': [], 'empty_after': []},
        'methods': {'wrong': [], 'correct': [], 'empty_after': []}
    }
    
    # 检查人物
    for p in persons:
        if book_id in p['relatedBooks']:
            name_match = re.search(rf'"id":\s*"{p["id"]}"[^{{}}]*"name":\s*"([^"]+)"', persons_section, re.DOTALL)
            if name_match:
                person_name = name_match.group(1)
                if person_name not in classic_text:
                    book_result['persons']['wrong'].append({'id': p['id'], 'name': person_name, 'current_books': p['relatedBooks']})
                    # 检查移除后是否为空
                    remaining = [b for b in p['relatedBooks'] if b != book_id]
                    if not remaining:
                        book_result['persons']['empty_after'].append({'id': p['id'], 'name': person_name})
                else:
                    book_result['persons']['correct'].append({'id': p['id'], 'name': person_name})
    
    # 检查概念
    for c in concepts:
        if book_id in c['relatedBooks']:
            title_match = re.search(rf'"id":\s*"{c["id"]}"[^{{}}]*"title":\s*"([^"]+)"', concepts_section, re.DOTALL)
            if title_match:
                concept_title = title_match.group(1)
                keywords = [w for w in re.split(r'[，。、\s（）()]+', concept_title) if len(w) >= 2]
                if keywords and not any(kw in classic_text for kw in keywords):
                    book_result['concepts']['wrong'].append({'id': c['id'], 'name': concept_title, 'current_books': c['relatedBooks']})
                    remaining = [b for b in c['relatedBooks'] if b != book_id]
                    if not remaining:
                        book_result['concepts']['empty_after'].append({'id': c['id'], 'name': concept_title})
                else:
                    book_result['concepts']['correct'].append({'id': c['id'], 'name': concept_title})
    
    # 检查法门
    for m in methods:
        if book_id in m['relatedBooks']:
            title_match = re.search(rf'"id":\s*"{m["id"]}"[^{{}}]*"title":\s*"([^"]+)"', methods_section, re.DOTALL)
            if title_match:
                method_title = title_match.group(1)
                keywords = [w for w in re.split(r'[，。、\s（）()]+', method_title) if len(w) >= 2]
                if keywords and not any(kw in classic_text for kw in keywords):
                    book_result['methods']['wrong'].append({'id': m['id'], 'name': method_title, 'current_books': m['relatedBooks']})
                    remaining = [b for b in m['relatedBooks'] if b != book_id]
                    if not remaining:
                        book_result['methods']['empty_after'].append({'id': m['id'], 'name': method_title})
                else:
                    book_result['methods']['correct'].append({'id': m['id'], 'name': method_title})
    
    results.append(book_result)

print()  # 换行
print()

# 生成详细报告
print('=' * 80)
print('关联分析报告')
print('=' * 80)
print()

total_wrong = 0
total_empty_risk = 0

for r in results:
    wrong_count = len(r['persons']['wrong']) + len(r['concepts']['wrong']) + len(r['methods']['wrong'])
    empty_count = len(r['persons']['empty_after']) + len(r['concepts']['empty_after']) + len(r['methods']['empty_after'])
    
    if wrong_count > 0 or empty_count > 0:
        print(f"【{r['title']}】({r['id']})")
        
        if r['persons']['wrong']:
            print(f"  错误人物关联: {len(r['persons']['wrong'])}个")
            for p in r['persons']['wrong'][:3]:
                print(f"    - {p['name']} (当前关联: {p['current_books']})")
            if len(r['persons']['wrong']) > 3:
                print(f"    ... 等{len(r['persons']['wrong'])}个")
        
        if r['concepts']['wrong']:
            print(f"  错误概念关联: {len(r['concepts']['wrong'])}个")
            for c in r['concepts']['wrong'][:3]:
                print(f"    - {c['name']}")
            if len(r['concepts']['wrong']) > 3:
                print(f"    ... 等{len(r['concepts']['wrong'])}个")
        
        if r['methods']['wrong']:
            print(f"  错误法门关联: {len(r['methods']['wrong'])}个")
            for m in r['methods']['wrong'][:3]:
                print(f"    - {m['name']}")
        
        if empty_count > 0:
            print(f"  ⚠️ 移除后将为空: {empty_count}个条目")
            total_empty_risk += empty_count
        
        print()
        total_wrong += wrong_count

print('=' * 80)
print(f'总计: {total_wrong} 处错误关联')
print(f'⚠️ 其中 {total_empty_risk} 个条目移除后将无任何关联（需要建立新关联或考虑删除）')
print('=' * 80)

# 保存详细数据供修复使用
import json
with open('association_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print()
print('详细数据已保存至 association_analysis.json')
