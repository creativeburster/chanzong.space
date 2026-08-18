import json
import re
from pathlib import Path

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar = '█' * int(50 * current // total) + '░' * (50 - int(50 * current // total))
    print(f'\r{prefix} |{bar}| {percent:.1f}%', end='', flush=True)

print('执行最终修复方案...')
print()

# 读取所有分析数据
with open('association_analysis.json', 'r', encoding='utf-8') as f:
    analysis = json.load(f)

with open('orphan_deep_search.json', 'r', encoding='utf-8') as f:
    orphan_search = json.load(f)

with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# 读取taxonomy
with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    taxonomy = f.read()

# 备份
with open('lib/taxonomy.ts.backup_final', 'w', encoding='utf-8') as f:
    f.write(taxonomy)

print('已备份至 taxonomy.ts.backup_final')
print()

# 构建修复计划
fix_plan = {
    'persons': {},
    'concepts': {},
    'methods': {}
}

# 1. 处理有正确关联的条目（从深度搜索结果）
for item in orphan_search:
    if item['has_match']:
        item_id = item['id']
        item_type = item['type']
        correct_books = [m['book_id'] for m in item['matches']]
        
        if item_type not in fix_plan:
            fix_plan[item_type] = {}
        
        fix_plan[item_type][item_id] = {
            'action': 'replace',
            'correct_books': correct_books,
            'wrong_book': item['wrong_book']
        }

# 2. 处理确实无关联的条目（设为空数组）
no_match_items = [o for o in orphan_search if not o['has_match']]
for item in no_match_items:
    item_id = item['id']
    item_type = item['type']
    
    if item_type not in fix_plan:
        fix_plan[item_type] = {}
    
    fix_plan[item_type][item_id] = {
        'action': 'clear',
        'correct_books': [],
        'wrong_book': item['wrong_book']
    }

# 3. 处理其他错误关联（从原始分析）
for book in analysis:
    book_id = book['id']
    
    for item_type in ['persons', 'concepts', 'methods']:
        for item in book[item_type]['wrong']:
            item_id = item['id']
            
            # 如果已经在修复计划中，跳过
            if item_id in fix_plan.get(item_type, {}):
                continue
            
            # 添加到修复计划（移除错误关联，保留其他关联）
            current_books = item.get('current_books', [book_id])
            remaining_books = [b for b in current_books if b != book_id]
            
            if item_type not in fix_plan:
                fix_plan[item_type] = {}
            
            if remaining_books:
                fix_plan[item_type][item_id] = {
                    'action': 'remove',
                    'correct_books': remaining_books,
                    'wrong_book': book_id
                }
            else:
                fix_plan[item_type][item_id] = {
                    'action': 'clear',
                    'correct_books': [],
                    'wrong_book': book_id
                }

# 统计修复数量
total_fixes = sum(len(fix_plan[t]) for t in fix_plan)
print(f'总修复计划: {total_fixes} 个条目')
print(f'  - 人物: {len(fix_plan.get("persons", {}))} 个')
print(f'  - 概念: {len(fix_plan.get("concepts", {}))} 个')
print(f'  - 法门: {len(fix_plan.get("methods", {}))} 个')
print()

# 执行修复
fixed_count = 0

for item_type in ['persons', 'concepts', 'methods']:
    if item_type not in fix_plan:
        continue
    
    items = fix_plan[item_type]
    total_items = len(items)
    
    for i, (item_id, plan) in enumerate(items.items()):
        print_progress(i + 1, total_items, f'修复{item_type}: {item_id[:15]}')
        
        # 构建正则表达式来找到并替换relatedBooks
        if item_type == 'persons':
            section_pattern = r'("id":\s*"' + re.escape(item_id) + r'"[^}]*"relatedBooks":\s*)\[([^\]]*)\]'
        elif item_type == 'concepts':
            section_pattern = r'("id":\s*"' + re.escape(item_id) + r'"[^}]*"relatedBooks":\s*)\[([^\]]*)\]'
        else:  # methods
            section_pattern = r'("id":\s*"' + re.escape(item_id) + r'"[^}]*"relatedBooks":\s*)\[([^\]]*)\]'
        
        def replace_books(match):
            prefix = match.group(1)
            new_books = ', '.join([f'"{b}"' for b in plan['correct_books']])
            return prefix + '[' + new_books + ']'
        
        new_taxonomy = re.sub(section_pattern, replace_books, taxonomy, flags=re.DOTALL)
        if new_taxonomy != taxonomy:
            taxonomy = new_taxonomy
            fixed_count += 1

print()
print()
print(f'成功修复 {fixed_count} 个条目')

# 保存修复后的文件
with open('lib/taxonomy.ts.fixed', 'w', encoding='utf-8') as f:
    f.write(taxonomy)

print('修复后的文件已保存至 taxonomy.ts.fixed')
print()
print('请验证无误后执行: copy taxonomy.ts.fixed taxonomy.ts')
