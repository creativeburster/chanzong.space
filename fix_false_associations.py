import json
import re
from pathlib import Path

# 读取报告
with open('false_associations_report.txt', 'r', encoding='utf-8') as f:
    report = f.read()

# 读取taxonomy
with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    taxonomy = f.read()

# 备份
with open('lib/taxonomy.ts.backup', 'w', encoding='utf-8') as f:
    f.write(taxonomy)

print('已备份taxonomy.ts至taxonomy.ts.backup')
print()

# 解析报告，提取需要移除的关联
fixes = []

current_book = None
for line in report.split('\n'):
    if line.startswith('经典:'):
        match = re.search(r'\(([^)]+)\)', line)
        if match:
            current_book = match.group(1)
    elif '虚假人物:' in line and current_book:
        persons = line.split(':')[1].strip().split(', ')
        for p in persons:
            fixes.append(('person', current_book, p.strip()))
    elif '虚假概念:' in line and current_book:
        concepts = line.split(':')[1].strip().split(', ')
        for c in concepts:
            fixes.append(('concept', current_book, c.strip()))
    elif '虚假法门:' in line and current_book:
        methods = line.split(':')[1].strip().split(', ')
        for m in methods:
            fixes.append(('method', current_book, m.strip()))

print(f'需要修复 {len(fixes)} 处瞎关联')
print()

# 执行修复
fixed_count = 0
for fix_type, book_id, item_name in fixes:
    if fix_type == 'person':
        # 在人物数组中移除book_id
        pattern = rf'("id":\s*"[^"]*"[^}}]*"relatedBooks":\s*\[)([^\]]*"{book_id}"[^\]]*)\]'
        
        def remove_book(match):
            prefix = match.group(1)
            books_str = match.group(2)
            # 移除book_id
            books = re.findall(r'"([^"]+)"', books_str)
            books = [b for b in books if b != book_id]
            new_books = ', '.join([f'"{b}"' for b in books])
            return prefix + new_books + ']'
        
        new_taxonomy = re.sub(pattern, remove_book, taxonomy, flags=re.DOTALL)
        if new_taxonomy != taxonomy:
            taxonomy = new_taxonomy
            fixed_count += 1
            print(f'✓ 移除人物关联: {item_name} - {book_id}')

print()
print(f'成功修复 {fixed_count} 处')

# 保存修复后的文件
with open('lib/taxonomy.ts.fixed', 'w', encoding='utf-8') as f:
    f.write(taxonomy)

print('修复后的文件已保存至 taxonomy.ts.fixed')
print('请验证无误后替换原文件')
