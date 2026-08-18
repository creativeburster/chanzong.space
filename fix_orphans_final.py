import json
import re

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar = '█' * int(50 * current // total) + '░' * (50 - int(50 * current // total))
    print(f'\r{prefix} |{bar}| {percent:.1f}%', end='', flush=True)

print('执行最终修复（37个真孤儿）...')
print()

# 读取数据
with open('orphan_search_results.json', 'r', encoding='utf-8') as f:
    search_results = json.load(f)

# 手动添加互联网搜索结果
internet_fixes = {
    'shijue': {'correct_books': ['dachengqixinlun'], 'name': '始觉'},
    'xi-zheng-fa': {'correct_books': ['xixulun'], 'name': '息诤法门'},
    # 五行观、三妙悟未找到明确出处，保留为空
}

# 读取taxonomy
with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    taxonomy = f.read()

# 备份
with open('lib/taxonomy.ts.backup_orphans', 'w', encoding='utf-8') as f:
    f.write(taxonomy)

print('已备份至 taxonomy.ts.backup_orphans')
print()

# 执行修复
fixed_count = 0
total = len(search_results)

for i, item in enumerate(search_results):
    print_progress(i + 1, total, f'修复: {item["name"][:15]}')
    
    item_id = item['id']
    
    # 检查是否有互联网搜索结果
    if item_id in internet_fixes:
        correct_books = internet_fixes[item_id]['correct_books']
    elif item['found']:
        correct_books = [m['book_id'] for m in item['matches']]
    else:
        # 未找到关联，保持为空
        continue
    
    # 构建正则表达式替换relatedBooks
    pattern = rf'("id":\s*"{re.escape(item_id)}"[^}}]*"relatedBooks":\s*)\[\]'
    
    def replace_books(match):
        prefix = match.group(1)
        new_books = ', '.join([f'"{b}"' for b in correct_books])
        return prefix + '[' + new_books + ']'
    
    new_taxonomy = re.sub(pattern, replace_books, taxonomy, flags=re.DOTALL)
    if new_taxonomy != taxonomy:
        taxonomy = new_taxonomy
        fixed_count += 1

print()
print()
print(f'成功修复 {fixed_count} 个真孤儿条目')

# 保存修复后的文件
with open('lib/taxonomy.ts.orphans_fixed', 'w', encoding='utf-8') as f:
    f.write(taxonomy)

print('修复后的文件已保存至 taxonomy.ts.orphans_fixed')
print()
print('请验证后执行: copy taxonomy.ts.orphans_fixed taxonomy.ts')
