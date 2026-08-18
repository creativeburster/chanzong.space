import re
import sys

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar = '█' * int(50 * current // total) + '░' * (50 - int(50 * current // total))
    print(f'\r{prefix} |{bar}| {percent:.1f}% ({current}/{total})', end='', flush=True)

print('检查独立条目状况...')
print()

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 找出所有relatedBooks为空的条目
print('步骤1: 扫描文件...')
pattern = r'"id":\s*"([^"]+)"[^}]*"relatedBooks":\s*\[\]'
matches = re.findall(pattern, content, re.DOTALL)

print(f'找到 {len(matches)} 个relatedBooks为空的条目')
print()

# 分类统计
persons = []
concepts = []
methods = []

print('步骤2: 分类条目...')
total = len(matches)

for i, m in enumerate(matches):
    print_progress(i + 1, total, '分类')
    
    idx = content.find(f'"id": "{m}"')
    if idx < content.find('export const ZEN_CONCEPTS'):
        persons.append(m)
    elif idx < content.find('export const ZEN_METHODS'):
        concepts.append(m)
    else:
        methods.append(m)

print()
print()

# 显示结果
print('=' * 60)
print('独立条目统计')
print('=' * 60)
print(f'人物: {len(persons)}个')
for p in persons[:10]:
    print(f'  - {p}')
if len(persons) > 10:
    print(f'  ... 等{len(persons)}个')

print()
print(f'概念: {len(concepts)}个')
for c in concepts[:10]:
    print(f'  - {c}')
if len(concepts) > 10:
    print(f'  ... 等{len(concepts)}个')

print()
print(f'法门: {len(methods)}个')
for m in methods[:10]:
    print(f'  - {m}')
if len(methods) > 10:
    print(f'  ... 等{len(methods)}个')

print()
print('=' * 60)
print(f'总计: {len(matches)} 个独立条目')
print('=' * 60)
