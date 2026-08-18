import re
import json

def print_progress(current, total, prefix=''):
    percent = 100 * (current / float(total))
    bar = '█' * int(50 * current // total) + '░' * (50 - int(50 * current // total))
    print(f'\r{prefix} |{bar}| {percent:.1f}% ({current}/{total})', end='', flush=True)

print('分析91个独立条目的完整关联状况...')
print()

with open('lib/taxonomy.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 找出所有relatedBooks为空的条目
pattern = r'"id":\s*"([^"]+)"[^}]*"relatedBooks":\s*\[\]'
empty_books_ids = re.findall(pattern, content, re.DOTALL)

print(f'找到 {len(empty_books_ids)} 个relatedBooks为空的条目')
print()

# 分析每个条目的其他关联字段
orphan_analysis = []

print('步骤1: 提取所有关联字段...')
total = len(empty_books_ids)

for i, item_id in enumerate(empty_books_ids):
    print_progress(i + 1, total, '分析')
    
    # 找到该条目的完整内容
    item_pattern = rf'"id":\s*"{re.escape(item_id)}"[^{{}}]*(?:{{[^{{}}]*}}[^{{}}]*)*}}'
    item_match = re.search(item_pattern, content, re.DOTALL)
    
    if item_match:
        item_text = item_match.group(0)
        
        # 提取各关联字段
        related_persons = re.findall(r'"relatedPersons":\s*\[([^\]]*)\]', item_text)
        related_concepts = re.findall(r'"relatedConcepts":\s*\[([^\]]*)\]', item_text)
        related_methods = re.findall(r'"relatedMethods":\s*\[([^\]]*)\]', item_text)
        
        # 解析数组内容
        persons_list = re.findall(r'"([^"]+)"', related_persons[0]) if related_persons else []
        concepts_list = re.findall(r'"([^"]+)"', related_concepts[0]) if related_concepts else []
        methods_list = re.findall(r'"([^"]+)"', related_methods[0]) if related_methods else []
        
        # 判断是否为真孤儿（所有关联都为空）
        is_orphan = len(persons_list) == 0 and len(concepts_list) == 0 and len(methods_list) == 0
        
        # 确定类型
        idx = content.find(f'"id": "{item_id}"')
        if idx < content.find('export const ZEN_CONCEPTS'):
            item_type = 'person'
        elif idx < content.find('export const ZEN_METHODS'):
            item_type = 'concept'
        else:
            item_type = 'method'
        
        # 获取名称
        name_match = re.search(r'"name":\s*"([^"]+)"', item_text)
        title_match = re.search(r'"title":\s*"([^"]+)"', item_text)
        name = name_match.group(1) if name_match else (title_match.group(1) if title_match else item_id)
        
        orphan_analysis.append({
            'id': item_id,
            'name': name,
            'type': item_type,
            'relatedPersons': persons_list,
            'relatedConcepts': concepts_list,
            'relatedMethods': methods_list,
            'is_orphan': is_orphan,
            'has_any_relation': len(persons_list) > 0 or len(concepts_list) > 0 or len(methods_list) > 0
        })

print()
print()

# 分类统计
true_orphans = [o for o in orphan_analysis if o['is_orphan']]
has_relations = [o for o in orphan_analysis if not o['is_orphan']]

print('=' * 70)
print('分析结果')
print('=' * 70)
print(f'总独立条目: {len(orphan_analysis)} 个')
print(f'  - 有其他关联: {len(has_relations)} 个 ✅')
print(f'  - 真孤儿（无关联）: {len(true_orphans)} 个 ⚠️')
print()

# 显示有其他关联的条目（安全）
if has_relations:
    print('【有其他关联的条目】（不会成为孤儿页面）')
    print('-' * 70)
    for o in has_relations[:15]:
        relations = []
        if o['relatedPersons']:
            relations.append(f"人物:{len(o['relatedPersons'])}")
        if o['relatedConcepts']:
            relations.append(f"概念:{len(o['relatedConcepts'])}")
        if o['relatedMethods']:
            relations.append(f"法门:{len(o['relatedMethods'])}")
        print(f"  ✓ {o['name']} ({o['type']}) - {', '.join(relations)}")
    if len(has_relations) > 15:
        print(f'  ... 等{len(has_relations)}个')
    print()

# 显示真孤儿（需要处理）
if true_orphans:
    print('【真孤儿条目】（需要创建关联或填充内容）')
    print('-' * 70)
    for o in true_orphans:
        print(f"  ⚠️ {o['name']} ({o['type']}) - 所有关联为空")
    print()

print('=' * 70)

# 保存结果
with open('orphan_full_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(orphan_analysis, f, ensure_ascii=False, indent=2)

print('详细分析已保存至 orphan_full_analysis.json')
