import json
import re
from pathlib import Path

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar = '█' * int(50 * current // total) + '░' * (50 - int(50 * current // total))
    print(f'\r{prefix} |{bar}| {percent:.1f}%', end='', flush=True)

print('为37个真孤儿创建关联...')
print()

# 读取数据
with open('orphan_full_analysis.json', 'r', encoding='utf-8') as f:
    orphans = json.load(f)

true_orphans = [o for o in orphans if o['is_orphan']]

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    taxonomy = f.read()

# 为每个孤儿在经典中搜索
def search_in_classics(item_name, item_type):
    """在所有经典中搜索该条目"""
    matches = []
    
    # 准备搜索词
    search_terms = [item_name]
    
    # 添加可能的变体
    if item_type == 'concept':
        # 概念可能有不同表述
        if '无常' in item_name:
            search_terms.extend(['无常', '诸行无常'])
        elif '空性' in item_name:
            search_terms.extend(['空', '空性', '缘起性空'])
        elif '本觉' in item_name:
            search_terms.extend(['本觉', '始觉', '觉性'])
    
    for book in manifest:
        md_file = Path(f'classics_markdown/{book["filename"]}')
        if not md_file.exists():
            continue
        
        with open(md_file, 'r', encoding='utf-8') as f:
            text = f.read()
        
        for term in search_terms:
            if term in text:
                matches.append({
                    'book_id': book['id'],
                    'book_title': book['title'],
                    'matched_term': term
                })
                break
    
    return matches

# 为每个孤儿搜索
results = []
total = len(true_orphans)

for i, orphan in enumerate(true_orphans):
    print_progress(i + 1, total, f'搜索: {orphan["name"][:15]}')
    
    matches = search_in_classics(orphan['name'], orphan['type'])
    
    results.append({
        'id': orphan['id'],
        'name': orphan['name'],
        'type': orphan['type'],
        'matches': matches,
        'found': len(matches) > 0
    })

print()
print()

# 分类
found = [r for r in results if r['found']]
not_found = [r for r in results if not r['found']]

print('=' * 70)
print('搜索结果')
print('=' * 70)
print(f'找到关联: {len(found)} 个')
print(f'未找到: {len(not_found)} 个')
print()

if found:
    print('【找到关联的条目】')
    print('-' * 70)
    for r in found:
        print(f"✓ {r['name']} ({r['type']})")
        books = [m['book_title'] for m in r['matches']]
        print(f"  出现在: {', '.join(books[:5])}")
        if len(books) > 5:
            print(f"  ... 等{len(books)}部")
        print()

if not_found:
    print('【确实未找到的条目】（需要互联网搜索）')
    print('-' * 70)
    for r in not_found:
        print(f"? {r['name']} ({r['type']})")
    print()

print('=' * 70)

# 保存结果
with open('orphan_search_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print('结果已保存至 orphan_search_results.json')

# 生成需要互联网搜索的清单
if not_found:
    with open('需要互联网搜索_孤儿.txt', 'w', encoding='utf-8') as f:
        f.write('需要互联网搜索确认来源的孤儿条目：\n\n')
        for r in not_found:
            f.write(f"- {r['name']} ({r['type']})\n")
    print('互联网搜索清单已保存')
