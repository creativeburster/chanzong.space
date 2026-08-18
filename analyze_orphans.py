import json
import re
from pathlib import Path

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar = '█' * int(50 * current // total) + '░' * (50 - int(50 * current // total))
    print(f'\r{prefix} |{bar}| {percent:.1f}%', end='', flush=True)

print('分析孤儿条目，寻找正确关联...')
print()

# 读取数据
with open('association_analysis.json', 'r', encoding='utf-8') as f:
    analysis = json.load(f)

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    taxonomy = f.read()

# 收集所有孤儿条目
orphans = {'persons': [], 'concepts': [], 'methods': []}

for book in analysis:
    for item_type in ['persons', 'concepts', 'methods']:
        for item in book[item_type]['empty_after']:
            orphans[item_type].append({
                'id': item['id'],
                'name': item['name'],
                'wrong_book': book['id'],
                'wrong_book_title': book['title']
            })

print(f'发现孤儿条目: {len(orphans["persons"])}个人物, {len(orphans["concepts"])}个概念, {len(orphans["methods"])}个法门')
print()

# 为每个孤儿寻找正确关联
def find_correct_books(item_name, item_id, item_type):
    """在全部经典中搜索该条目真正出现的地方"""
    correct_books = []
    
    for book in manifest:
        md_file = Path(f'classics_markdown/{book["filename"]}')
        if not md_file.exists():
            continue
        
        with open(md_file, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # 检查是否出现
        found = False
        
        if item_type == 'person':
            # 人物：检查名称
            if item_name in text:
                found = True
        elif item_type in ['concept', 'method']:
            # 概念/法门：检查关键词
            keywords = [w for w in re.split(r'[，。、\s（）()]+', item_name) if len(w) >= 2]
            if any(kw in text for kw in keywords):
                found = True
        
        if found:
            correct_books.append({
                'id': book['id'],
                'title': book['title']
            })
    
    return correct_books

# 分析每个孤儿
orphan_analysis = []

total_orphans = len(orphans['persons']) + len(orphans['concepts']) + len(orphans['methods'])
current = 0

for item_type in ['persons', 'concepts', 'methods']:
    for item in orphans[item_type]:
        current += 1
        print_progress(current, total_orphans, f'分析: {item["name"][:15]}')
        
        correct_books = find_correct_books(item['name'], item['id'], item_type)
        
        orphan_analysis.append({
            'type': item_type,
            'id': item['id'],
            'name': item['name'],
            'wrong_book': item['wrong_book'],
            'wrong_book_title': item['wrong_book_title'],
            'correct_books': correct_books
        })

print()
print()

# 生成报告
print('=' * 80)
print('孤儿条目正确关联分析')
print('=' * 80)
print()

can_fix = 0
cannot_fix = 0

for item in orphan_analysis:
    if item['correct_books']:
        can_fix += 1
        print(f"✓ {item['name']} ({item['type']})")
        print(f"  错误关联: {item['wrong_book_title']}")
        print(f"  正确关联: {[b['title'] for b in item['correct_books']]}")
        print()
    else:
        cannot_fix += 1
        print(f"✗ {item['name']} ({item['type']}) - 未找到正确关联")
        print(f"  错误关联: {item['wrong_book_title']}")
        print()

print('=' * 80)
print(f'可修复: {can_fix} 个')
print(f'未找到正确关联: {cannot_fix} 个')
print('=' * 80)

# 保存修复方案
with open('orphan_fix_plan.json', 'w', encoding='utf-8') as f:
    json.dump(orphan_analysis, f, ensure_ascii=False, indent=2)

print()
print('修复方案已保存至 orphan_fix_plan.json')
